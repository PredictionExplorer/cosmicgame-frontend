# Gesture Message Chat

## Purpose

The Gesture Message Chat surfaces the optional messages participants attach when they make a gesture. It is a read-only current-cycle feed, not a general chat system: each entry is immutable gesture metadata from the indexed on-chain event.

## Product Behavior

- The feed appears on the home page in the row after the decision desk: beside the cycle guide from 1024px, as a normal stacked section on smaller screens. It opens on a hairline with no box, like the ledger regions of the desk above it.
- It shows only gestures from the current active cycle, and only gestures whose `Message` field contains non-whitespace text.
- Messages are ordered newest first by gesture `TimeStamp`, with `EvtLogId` as a deterministic tiebreaker.
- Messages lead. Each is a ruled row on the page ground (no cards, no frame): the participant as an `AddressChip` in muted text, so the message leads (link to `/user/{address}`, copy button), a "You" tag on the connected wallet's own messages, the method and cost as a caption ("0.1021 ETH + RWLK"), the position linking to `/gesture/{EvtLogId}`, a relative age (`<DateTime variant="relative">`, the exact time on hover) and the body.
- Cycle events derived from the history (records, first participants, milestones, the closing window, finalization) never crowd out messages: the default **Messages** view lists participants' messages only, as its name says, and **All activity** lists every event between them, each as one compact row (glyph, sentence, age). Event rows are never headings. A cycle with events but no message yet invites the first message under **Messages**, with the events one tap away.
- The header gives the title, one explanation of how to join, the cycle and counts ("Cycle 7 · 3 messages · 12 events"; under **Messages** the event count is every event on record) and a still freshness stamp (`LiveStatus variant="inline" still`) that reads "Updated 4s ago", "Reconnecting…" or "Updates delayed". A failed background refresh changes only the stamp; the history on screen stays. Only a failed first read shows the retry block, as a status rather than an alert.
- The list is not a live region: new rows are not read aloud.
- The newest message settles in with a 900ms `--live` rule when a Gesture lands.
- A message sent with a confirmed Gesture shows at once as "Indexing". If the indexer has not echoed it after 90 seconds it reads "Still indexing" beside a link to its transaction; it gives way after 15 minutes (`usePendingChatMessages`).
- The initial history window contains at most 50 messages and 50 derived system events. "Load older" shows only when the current view has something older to add: under **Messages** that means older messages on the server (or a failed older read to retry); under **All activity** it also reveals the next 50 events. While it shows, the counts read as a window ("Latest 50 messages and 50 cycle events"). It keeps loading/retry states and the reading position.
- `http(s)` and `www.` URLs inside message bodies are clickable via `LinkifiedText` (`components/ui/linkified-text.tsx`). Because messages are permissionless on-chain content, clicking a link opens a leave-site confirmation dialog that shows the full destination URL before `window.open(..., 'noopener,noreferrer')`. Links are rendered as buttons (no `href`), so the confirm step cannot be bypassed with middle/modified clicks. URL detection lives in `utils/linkify.ts` and only accepts http(s) destinations with dotted hostnames.
- The same linkified rendering is used for the message on the gesture detail page (`app/(app)/gesture/[id]/GesturePage.tsx`). Truncated table cells (e.g. `GestureHistoryTable`) stay plain text.
- Empty cycles show an empty state instead of a blank panel. When the cycle is active, it offers "Make a Gesture", which scrolls to the form and opens its message editor.

## Data Source

Both home layouts use `useHomeGestureFeed`. It detects the new v2 `/rounds/{round}/messages` endpoint and requests 50 messages, with older pages on demand and bounded `after` requests for live updates. A separate `/rounds/{round}/chat-context` snapshot supplies complete metadata without message bodies for counts and milestone reconstruction, and the existing cycle-list endpoint supplies one complete latest gesture for detail panels.

Servers returning 404/501 for the new routes use the existing `bid/list/by_round/{round}/1/0/1000000` response. The frontend reveals that downloaded response in groups of 50 locally and rechecks server capability after five minutes. Other failures surface with retry controls. See the [pagination and rollout guide](./chat-pagination-proposal.md) for revision resets, exact API behavior, and the remaining metadata cost.

## Moderation

On paginated servers, SQL filters moderated messages before applying the page limit, using the database's actual gesture row identity. The panel does not apply the legacy event-ID heuristic again to these server-moderated responses. Legacy responses retain the existing `useBannedGestures()` filtering behavior shared with `GestureHistoryTable`.

## Layout Notes

On phones and tablets the feed is part of the page: it shows every row up to the sixth message (an events-only feed shows eight rows) and a "Show more" button that adds ten messages, so it never scrolls inside the scrolling page. From 1024px it scrolls inside its region, which fills its row beside the cycle guide (at least 24rem) and fades at an edge while there is more to read that way. Native scrolling, a named keyboard-focusable region and contained vertical overscroll keep history accessible. Print shows the full known history.

## Test Coverage

Component coverage lives in `components/home/__tests__/GestureMessageChat.test.tsx` and verifies:

- message filtering;
- newest-first sorting;
- address/relative-time/message rendering, message counts, and method badges;
- URL linkification behind the leave-site confirmation;
- copy-address behavior;
- long text safety;
- empty state (with and without the CTA), and the invitation when only events exist;
- the Messages / All activity views, and "Load older" appearing only when the view has older content to add;
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
npm run test -- components/home/__tests__/GestureMessageChat.test.tsx components/attachments/__tests__/DonatedNFTPrizeShowcase.test.tsx "app/[locale]/(app)/__tests__/HomePage.test.tsx" utils/__tests__/linkify.test.ts components/ui/__tests__/linkified-text.test.tsx --runInBand
npm run test:e2e -- e2e/home-gesture-chat.spec.ts
npm run lint
npm run type-check
```
