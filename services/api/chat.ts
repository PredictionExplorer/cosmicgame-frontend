import { formatUnits } from 'viem';
import { z } from 'zod';

import { apiBaseUrls, getApiBase, markServerDown } from '@/lib/serverRotation';

import {
  apiGet,
  cosmicGameBaseUrl,
  flattenGestureArray,
  isAxiosError,
  isServerFailure,
  type ApiRequestOptions,
} from './client';
import type { GestureInfo } from './types';
import { GestureInfoSchema, validateList } from './schemas';

export const CHAT_PAGE_SIZE = 50;

export class ChatApiUnavailableError extends Error {}
export class ChatFeedResetError extends Error {}

export function getChatApiBase(): string {
  return (getApiBase() || cosmicGameBaseUrl || '/api/cosmicgame').replace(/\/+$/, '');
}

/** Keep each history cursor on the backend instance that issued it. */
export function getChatApiUrl(base: string, cycle: number, resource: 'messages' | 'chat-context') {
  return `${base.replace(/\/api\/cosmicgame$/, '/api/v2/cosmicgame')}/rounds/${cycle}/${resource}`;
}

const safeId = z.number().int().nonnegative().safe();
const instant = z.string().datetime({ offset: true });
const cursor = z.string().min(1).max(512);
const revision = z.string().regex(/^\d+$/);

// lexicon-allow-start: these field names and enum values are the sealed v2 wire contract.
const recordSchema = z.object({
  eventLogId: safeId,
  round: safeId,
  position: safeId,
  bidderAddress: z.string().regex(/^0x[\da-fA-F]{40}$/),
  occurredAt: instant,
  bidType: z.enum(['eth', 'randomWalk', 'cst', 'unknown']),
});
const messageSchema = recordSchema.extend({
  message: z.string().refine((text) => text.trim().length > 0),
  transactionHash: z.string(),
  ethPriceWei: z.string().regex(/^\d+$/).optional(),
  cstPriceWei: z.string().regex(/^\d+$/).optional(),
  randomWalkTokenId: safeId.optional(),
});
const contextSchema = recordSchema.extend({
  prizeAt: instant,
  cstDutchAuctionDurationSeconds: safeId.optional(),
});
const messagePageSchema = z.object({
  data: z.array(messageSchema).max(CHAT_PAGE_SIZE),
  meta: z.object({
    limit: z.literal(CHAT_PAGE_SIZE),
    nextCursor: cursor.optional(),
    syncCursor: cursor,
    hasMore: z.boolean(),
    revision,
  }),
});
const historySchema = z.object({
  data: z.array(contextSchema),
  meta: z.object({ revision }),
});

function toGesture(record: z.infer<typeof recordSchema>): GestureInfo {
  return {
    EvtLogId: record.eventLogId,
    RoundNum: record.round,
    BidPosition: record.position,
    BidderAddr: record.bidderAddress,
    TimeStamp: Math.floor(Date.parse(record.occurredAt) / 1000),
    DateTime: record.occurredAt,
    GestureType: { eth: 0, randomWalk: 1, cst: 2, unknown: -1 }[record.bidType],
    // The compact context does not carry transaction details or cost. It is
    // used for history reconstruction; latest-detail panels use a separate row.
    BlockNum: 0,
    TxId: 0,
    TxHash: '',
    GestureCostEth: -1,
  };
}

function toMessage(record: z.infer<typeof messageSchema>): GestureInfo {
  return {
    ...toGesture(record),
    Message: record.message,
    TxHash: record.transactionHash,
    GestureCostEth:
      record.ethPriceWei === undefined ? -1 : Number(formatUnits(BigInt(record.ethPriceWei), 18)),
    CstCost:
      record.cstPriceWei === undefined
        ? undefined
        : Number(formatUnits(BigInt(record.cstPriceWei), 18)),
    RWalkNFTId: record.randomWalkTokenId,
  };
}
// lexicon-allow-end

export interface ChatRequestOptions extends ApiRequestOptions {
  base: string;
  cursor?: string;
  after?: string;
}

export interface ChatMessagePage {
  gestures: GestureInfo[];
  meta: z.infer<typeof messagePageSchema>['meta'];
}

async function requestChat(url: string, options: ChatRequestOptions): Promise<unknown> {
  try {
    const response = await apiGet(url, options);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 404 || error.response?.status === 501) {
        throw new ChatApiUnavailableError('Chat paging is not available on this server');
      }
      if (
        error.response?.status === 409 &&
        typeof error.response.data?.type === 'string' &&
        error.response.data.type.endsWith('/feed-reset-required')
      ) {
        throw new ChatFeedResetError('Chat history changed');
      }
      if (isServerFailure(error) && apiBaseUrls.length > 1) {
        markServerDown(options.base, Date.now(), 'Chat request failed');
      }
    }
    throw error;
  }
}

export async function getChatMessages(
  cycle: number,
  options: ChatRequestOptions,
): Promise<ChatMessagePage> {
  const params = new URLSearchParams({ limit: String(CHAT_PAGE_SIZE) });
  if (options.cursor) params.set('cursor', options.cursor);
  if (options.after) params.set('after', options.after);
  const raw = await requestChat(
    `${getChatApiUrl(options.base, cycle, 'messages')}?${params}`,
    options,
  );
  const page = messagePageSchema.parse(raw);
  if (page.data.some((row) => row.round !== cycle))
    throw new Error('Chat page belongs to another cycle');
  if (
    page.meta.hasMore &&
    (!options.after || page.data.length === 0 || page.meta.syncCursor === options.after)
  ) {
    throw new Error('Chat synchronization did not advance');
  }
  if (options.cursor && page.meta.nextCursor === options.cursor)
    throw new Error('Chat history cursor did not advance');
  return { gestures: page.data.map(toMessage), meta: page.meta };
}

export async function getChatContext(
  cycle: number,
  options: ChatRequestOptions,
): Promise<{ gestures: GestureInfo[]; revision: string }> {
  const raw = await requestChat(getChatApiUrl(options.base, cycle, 'chat-context'), options);
  const context = historySchema.parse(raw);
  if (context.data.some((row) => row.round !== cycle))
    throw new Error('Chat context belongs to another cycle');
  return {
    gestures: context.data.map((row) => ({
      ...toGesture(row),
      PrizeTime: Date.parse(row.prizeAt) / 1000,
      // lexicon-allow-start: sealed backend duration field.
      CstDutchAuctionDurationInt: row.cstDutchAuctionDurationSeconds,
      // lexicon-allow-end
    })),
    revision: context.meta.revision,
  };
}

/** Existing all-history fallback, or a single complete row for the latest panel. */
export async function getChatLegacyGestures(
  cycle: number,
  options: ChatRequestOptions,
  limit = 1_000_000,
): Promise<GestureInfo[]> {
  // lexicon-allow-start: existing backend route and response field.
  const { data } = await apiGet(`${options.base}/bid/list/by_round/${cycle}/1/0/${limit}`, options);
  const rows = flattenGestureArray<GestureInfo>(data.BidsByRound);
  // lexicon-allow-end
  validateList(GestureInfoSchema, rows, 'GestureInfo[chat]');
  return rows;
}
