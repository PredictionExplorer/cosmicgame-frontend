# Gesture Message Chat

## Purpose

The Gesture Message Chat surfaces the optional messages participants attach when they make a gesture. It is a read-only current-cycle feed, not a general chat system: each entry is immutable gesture metadata from the indexed on-chain event.

## Product Behavior

- The feed appears on the home page as a right-side panel on desktop and as a normal stacked section on smaller screens.
- It shows only gestures from the current active cycle.
- It shows only gestures whose `Message` field contains non-whitespace text.
- Messages are ordered newest first by gesture `TimeStamp`, with `EvtLogId` as a deterministic tiebreaker.
- Each entry displays the participant address (with a copy-to-clipboard button), a gesture method badge (cost + ETH/CST, plus `+ RWLK` for RandomWalk gestures), a relative timestamp ("5 minutes ago") with the absolute date/time in a tooltip and `<time dateTime>`, and the message body.
- The header subtitle shows loaded messages and displayed system events ("Cycle #7 · 3 messages"). It does not imply a cycle-wide total when older history is not loaded.
- The initial history window contains at most 50 messages and 50 derived system events. "Load older" reveals the next group, with loading/retry states and preserved reading position.
- `http(s)` and `www.` URLs inside message bodies are clickable via `LinkifiedText` (`components/ui/linkified-text.tsx`). Because messages are permissionless on-chain content, clicking a link opens a leave-site confirmation dialog that shows the full destination URL before `window.open(..., 'noopener,noreferrer')`. Links are rendered as buttons (no `href`), so the confirm step cannot be bypassed with middle/modified clicks. URL detection lives in `utils/linkify.ts` and only accepts http(s) destinations with dotted hostnames.
- The same linkified rendering is used for the message on the gesture detail page (`app/(app)/gesture/[id]/GesturePage.tsx`). Truncated table cells (e.g. `GestureHistoryTable`) stay plain text.
- Participant addresses link to `/user/{address}` and gesture ids link to `/gesture/{EvtLogId}`.
- Empty cycles show a friendly empty state instead of a blank panel. When the cycle is active, the empty state offers a "Make a Gesture" CTA that expands the gesture form's Advanced options (where the message field lives) and scrolls to the form.
- The gesture form message textarea shows a live character counter (`n/280`) that turns amber near the limit.

## Data Source

Both home layouts use `useHomeGestureFeed`. It detects the new v2 `/rounds/{round}/messages` endpoint and requests 50 messages, with older pages on demand and bounded `after` requests for live updates. A separate `/rounds/{round}/chat-context` snapshot supplies complete metadata without message bodies for counts and milestone reconstruction, and the existing cycle-list endpoint supplies one complete latest gesture for detail panels.

Servers returning 404/501 for the new routes use the existing `bid/list/by_round/{round}/1/0/1000000` response. The frontend reveals that downloaded response in groups of 50 locally and rechecks server capability after five minutes. Other failures surface with retry controls. See the [pagination and rollout guide](./chat-pagination-proposal.md) for revision resets, exact API behavior, and the remaining metadata cost.

## Moderation

On paginated servers, SQL filters moderated messages before applying the page limit, using the database's actual gesture row identity. The panel does not apply the legacy event-ID heuristic again to these server-moderated responses. Legacy responses retain the existing `useBannedGestures()` filtering behavior shared with `GestureHistoryTable`.

## Layout Notes

The current-cycle controls come first. The next row pairs a capped, internally scrolling chat with the featured artwork at desktop widths. Attached assets follow in their own full-width responsive grid, before the art/story disclosure. Keeping asset receipts out of the narrow artwork column prevents a tall receipt list from leaving a large empty area below the chat.

Asset cards use their available container width: wide cards place media beside details, while narrow cards stack them. Two or four previews use two columns, and larger groups use three columns on wide screens. All previewed assets and links remain accessible.

On phones and tablets below the desktop breakpoint, the grid stacks and the message area scrolls within a maximum height of `min(28rem, 55svh)`. Short feeds shrink to their content; long histories cannot stretch the page. The small viewport unit keeps the reading area stable as mobile browser controls appear or disappear, and there is no minimum height forcing it beyond a short landscape viewport. The heading remains outside the scroller. Native scrolling, a named keyboard-focusable region, a visible focus ring, and contained vertical overscroll keep history accessible without moving the page when the feed reaches an edge. Compact padding, stacked participant metadata, safe text wrapping, and 44px touch targets keep the panel usable down to 320px. Print styles remove the height cap and expose the full history.

## Test Coverage

Component coverage lives in `components/home/__tests__/GestureMessageChat.test.tsx` and verifies:

- message filtering;
- newest-first sorting;
- address/relative-time/message rendering, message counts, and method badges;
- URL linkification behind the leave-site confirmation;
- copy-address behavior;
- long text safety;
- empty state (with and without the CTA);
- responsive scroll ownership, compact spacing, phone stacking, and touch-target classes;
- banned-message exclusion;
- accessibility via `checkA11y`.

URL segmentation coverage lives in `utils/__tests__/linkify.test.ts`, and the confirm-dialog component is covered by `components/ui/__tests__/linkified-text.test.tsx`.

Home-page integration coverage lives in `app/[locale]/(app)/__tests__/HomePage.test.tsx` and verifies the panel receives the current-cycle gesture feed, the primary gesture flow remains in the main column, the full-width attachment section follows the feed only when data exists, and the chat empty-state CTA expands the gesture form's Advanced options.

E2E coverage lives in `e2e/home-gesture-chat.spec.ts` and mocks current-cycle API responses to verify the panel renders the expected messages, caps and scrolls long feeds across screen sizes, keeps the next full-width section close to the chat even with many attached assets, and does not overlap the primary column. The mobile overflow and tap-target audits exercise the home feed at 320px, 375px, and 414px in Chromium and WebKit.

`e2e/home-chat-layout.mobile.spec.ts` checks small phones, tablets, and landscape in Chromium and WebKit, including reaching older messages, keeping the heading in place, stable page height when history grows from 12 to 120 messages, and exposing the complete feed in print. Shared API fixtures live in `e2e/home-gesture-chat-fixtures.ts`.

`e2e/home-chat-pagination.spec.ts` checks the new API, explicit older-page requests, failures/retries, live synchronization, and corrected history. The separate [pagination and rollout guide](./chat-pagination-proposal.md) documents both server modes and the backend migrations.

## Validation Commands

```bash
npm run test -- components/home/__tests__/GestureMessageChat.test.tsx components/home/__tests__/PublicGoodsImpactCard.test.tsx components/attachments/__tests__/DonatedNFTPrizeShowcase.test.tsx "app/[locale]/(app)/__tests__/HomePage.test.tsx" utils/__tests__/linkify.test.ts components/ui/__tests__/linkified-text.test.tsx --runInBand
npm run test:e2e -- e2e/home-gesture-chat.spec.ts
npm run lint
npm run type-check
```
