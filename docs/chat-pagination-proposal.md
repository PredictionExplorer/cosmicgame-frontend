# Chat history pagination proposal

Status: design only; no backend or data-fetching changes implemented. The mobile layout fix bounds the visible chat, but it does not reduce the downloaded history or rendered message count.

## Repository review

Reviewed `../augur-explorer` after a successful `git pull --ff-only` on 2026-09-07. The selected branch, `feat/nft-trait-ingestion-metadata`, was already synchronized with its remote at `649f1b107370d40a0c26b1a3e24916c43e100553`. The pull also fetched newer `origin/cgv3` and `origin/cgv3.1` references; their relevant chat store and v2 list handler are identical. The backend working tree was left clean.

## Current behavior

- `services/api/client.ts` defaults list requests to 1,000,000 rows. `useGestureListByCycle` in `hooks/useApiQuery.ts` refreshes the current cycle list on a 10-second active polling interval. Chat receives that shared list and filters messages locally.
- The legacy `/api/cosmicgame/bid/with_message/by_round/{round}` route already accepts `sort`, `offset`, and `limit`. Its handler in `internal/api/cosmicgame/api_cosmicgame.go` defaults to 1,000 rows, does not cap positive limits, and serializes both full `Bids` and a redundant `messages` projection. OpenAPI marks it deprecated.
- `/api/v2/cosmicgame/rounds/{round}/bids` already has versioned, scope-checked cursors, a default of 50 rows, a maximum of 200, and `LIMIT n+1`. Its order is oldest first and it includes gestures without messages. Reuse its pagination conventions, rather than exposing this endpoint unchanged as chat.
- `internal/store/cosmicgame/bidding.go` uses a shared query with reward and attached-asset joins that the chat does not need. Migration `00009_cg_bid_cursor_index.sql` supplies the existing general-history index.

## Proposed contract

Add `GET /api/v2/cosmicgame/rounds/{round}/messages?limit=50&cursor=…` through the OpenAPI generation workflow.

The first request returns the newest 50 visible, nonblank messages. A versioned opaque `nextCursor` requests older messages. Reuse the existing `{ data, meta }` envelope and default/max limits. Add a `syncCursor` for live updates, including on empty pages, plus the indexed source block and a feed revision. Scope every cursor to its resource, cycle, direction, and revision.

Each message needs only its stable event identity, cycle, gesture position, participant address, timestamp, text, gesture method, exact ETH/CST amounts, and transaction identity. Keep amounts as exact integer strings as in v2; avoid repeating the same messages under multiple response keys. Make the distinction between a loaded count and a cycle-wide count explicit. Supply authoritative totals separately if the UI retains cycle-wide labels.

Preserve the current `(timestamp, eventLogId)` newest-first order. For older pages, use a strict tuple boundary `(time_stamp, evtlog_id) < (cursor_time, cursor_id)`, descending order, and fetch at most `limit + 1` records. The unique tiebreaker prevents losing messages with identical timestamps. Insertions at the top do not shift older-page boundaries.

## Query and live synchronization

1. Filter blank and moderated messages in SQL **before** applying the limit. Agree on a precise whitespace definition: SQL `TRIM` and JavaScript `.trim()` currently differ for tabs, newlines, and some Unicode spaces. Use the same definition for filtering and any partial index.
2. Use a narrow message query, with only the participant/transaction joins needed for its response. Add a matching partial index on `(round_num, time_stamp DESC, evtlog_id DESC)` for nonblank messages. Keep moderation as an indexed anti-join; a partial index cannot encode changing rows in another table. Check query plans using sparse-message cycles and deep histories. PostgreSQL still computes skipped offset rows, which makes cursor paging a better fit for growing history ([pagination documentation](https://www.postgresql.org/docs/current/queries-limit.html), [partial indexes](https://www.postgresql.org/docs/current/indexes-partial.html)).
3. Define `after=syncCursor` as a separate bounded catch-up mode, mutually exclusive with an older-page `cursor`. Read new events oldest first within a fixed indexed high-water mark, then merge them into the newest-first UI by identity. If a burst exceeds one page, drain each continuation before advancing the durable sync cursor. Use an ingestion watermark or equivalent server-maintained position rather than a client wall-clock timestamp.
4. Start with the existing polling while the page is visible, requesting only updates. Older pages load on demand, with an accessible loading/retry control. Preserve the current reading position when new entries arrive. Do not configure the history query to refetch every previously loaded page each interval. SSE can follow if measured polling traffic warrants it.
5. Include a revision/reset mechanism for bans, unbans, replay, or chain reorganizations. Append-only polling cannot remove an already cached message or reveal an unbanned older one. Increment the revision atomically with changes that invalidate history; an outdated cursor returns an explicit reset response. All pages in a snapshot must share a revision. The indexer already removes and replays reorganized blocks in `internal/indexer/chainsplit.go`.

## Frontend migration dependencies

The full current-cycle list also powers `DeckPersonalStrip` counts and `feedSystemEvents.ts` milestones. The event builder explicitly suppresses some events when history is incomplete. Replacing that shared list with 50 messages would silently alter other homepage features; adding a second paginated request while retaining it would preserve the expensive background download.

Move these consumers to authoritative cycle/participant summaries and an indexed, paginated system-event history. Persist derived event identities/timestamps, or compute them once per indexed update, rather than reconstructing every milestone from all gestures in each browser. Merge message and event pages with deterministic ordering. Audit both home layouts, their server-rendered initial data, and all consumers of the cycle-list hook before removing its full-history request.

Confirm moderation identity during this migration: the frontend currently compares ban `bid_id` with `EvtLogId`, while v2's `internal/store/cosmicgame/banned_bids.go` validates `bid_id` against `cg_bid.id`. These are distinct columns. The server-side filter should use the database relationship, with a fixture where row ID and event ID differ.

After migration, load only the initial page and explicitly requested older pages. Consider list virtualization or a page-cache bound only if long reading sessions produce a measurable rendering or memory problem; pagination should first eliminate the unconditional full-history load.

## Delivery and verification

Ship the message contract/query/index and summaries additively, then migrate the frontend, including optimistic messages and cycle rollover. Confirm that opening either homepage no longer issues the million-row request before retiring legacy consumption according to the existing deprecation policy.

Cover empty cycles; whitespace-only text; same-timestamp page boundaries; new entries between page loads; invalid and cross-cycle cursors; bans/unbans; more than one page of live catch-up; reorganizations; rollover; and pending-to-indexed deduplication. Check that totals and derived events remain correct. Measure response bytes, query latency, query plans, and browser render/memory cost against realistic long cycles.

The immediate mobile containment follows native [scroll-region accessibility guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow#accessibility) and uses the [small viewport height](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length#small_viewport_units) to keep its reading area stable as browser controls change.
