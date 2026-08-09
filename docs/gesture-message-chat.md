# Gesture Message Chat

## Purpose

The Gesture Message Chat surfaces the optional messages participants attach when they make a gesture. It is a read-only current-cycle feed, not a general chat system: each entry is immutable gesture metadata from the indexed on-chain event.

## Product Behavior

- The feed appears on the home page as a right-side panel on desktop and as a normal stacked section on smaller screens.
- It shows only gestures from the current active cycle.
- It shows only gestures whose `Message` field contains non-whitespace text.
- Messages are ordered newest first by gesture `TimeStamp`, with `EvtLogId` as a deterministic tiebreaker.
- Each entry displays the participant address (with a copy-to-clipboard button), a gesture method badge (cost + ETH/CST, plus `+ RWLK` for RandomWalk gestures), a relative timestamp ("5 minutes ago") with the absolute date/time in a tooltip and `<time dateTime>`, and the message body.
- The header subtitle shows the visible message count for the cycle ("Cycle #7 · 3 messages").
- `http(s)` and `www.` URLs inside message bodies are clickable via `LinkifiedText` (`components/ui/linkified-text.tsx`). Because messages are permissionless on-chain content, clicking a link opens a leave-site confirmation dialog that shows the full destination URL before `window.open(..., 'noopener,noreferrer')`. Links are rendered as buttons (no `href`), so the confirm step cannot be bypassed with middle/modified clicks. URL detection lives in `utils/linkify.ts` and only accepts http(s) destinations with dotted hostnames.
- The same linkified rendering is used for the message on the gesture detail page (`app/(app)/gesture/[id]/GesturePage.tsx`). Truncated table cells (e.g. `GestureHistoryTable`) stay plain text.
- Participant addresses link to `/user/{address}` and gesture ids link to `/gesture/{EvtLogId}`.
- Empty cycles show a friendly empty state instead of a blank panel. When the cycle is active, the empty state offers a "Make a Gesture" CTA that expands the gesture form's Advanced options (where the message field lives) and scrolls to the form.
- The gesture form message textarea shows a live character counter (`n/280`) that turns amber near the limit.

## Data Source

`app/HomePage.tsx` already fetches current-cycle gestures through:

```ts
useGestureListByCycle(round, 'desc');
```

That hook maps to the backend route:

```text
bid/list/by_round/{round}/1/0/1000000
```

The chat component receives the resulting `GestureInfo[]` and does not perform another gesture-list request. This keeps the panel consistent with the rest of the home page and avoids a global all-history fetch.

## Moderation

The panel uses `useBannedGestures()` and hides messages whose `EvtLogId` is present in the backend ban list (`bid_id`). This matches the moderation behavior of `GestureHistoryTable`, where banned gesture messages are not rendered.

## Layout Notes

The home page keeps the timer and hero full width. Below the hero, the page switches to a responsive two-column layout that expands beyond the default data-page width on large screens:

- Main content: status, special allocation leaders, gesture form, and allocation breakdown.
- Right rail: `GestureMessageChat`, sticky on desktop with internal scrolling, plus a companion stack below it: full-cycle details, public-goods impact, and attached asset receipt when assets exist.
- Large screens use a wider rail (`28rem-36rem` at `xl`, `34rem-42rem` at `2xl`) so the feed and companion cards fill the available right-side space instead of feeling like a narrow sidebar.

On tablet and mobile, the grid stacks so the chat remains part of the document flow and does not cover gesture controls.

## Test Coverage

Component coverage lives in `components/home/__tests__/GestureMessageChat.test.tsx` and verifies:

- message filtering;
- newest-first sorting;
- address/relative-time/message rendering, message counts, and method badges;
- URL linkification behind the leave-site confirmation;
- copy-address behavior;
- long text safety;
- empty state (with and without the CTA);
- banned-message exclusion;
- accessibility via `checkA11y`.

URL segmentation coverage lives in `utils/__tests__/linkify.test.ts`, and the confirm-dialog component is covered by `components/ui/__tests__/linkified-text.test.tsx`.

Home-page integration coverage lives in `app/(app)/__tests__/HomePage.test.tsx` and verifies the panel receives the current-cycle gesture feed, the primary gesture flow remains in the main column, optional companion cards render in the right rail only when data exists, and the chat empty-state CTA expands the gesture form's Advanced options.

E2E coverage lives in `e2e/home-gesture-chat.spec.ts` and mocks current-cycle API responses to verify the panel renders the expected messages, docks on the desktop right rail, keeps companion cards aligned under the chat, stays wider than the old rail, and does not overlap the primary column.

## Validation Commands

```bash
npm run test -- components/home/__tests__/GestureMessageChat.test.tsx components/home/__tests__/PublicGoodsImpactCard.test.tsx components/attachments/__tests__/DonatedNFTPrizeShowcase.test.tsx "app/(app)/__tests__/HomePage.test.tsx" utils/__tests__/linkify.test.ts components/ui/__tests__/linkified-text.test.tsx --runInBand
npm run test:e2e -- e2e/home-gesture-chat.spec.ts
npm run lint
npm run type-check
```
