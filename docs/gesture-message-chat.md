# Gesture Message Chat

## Purpose

The Gesture Message Chat surfaces the optional messages participants attach when they make a gesture. It is a read-only current-cycle feed, not a general chat system: each entry is immutable gesture metadata from the indexed on-chain event.

## Product Behavior

- The feed appears on the home page as a right-side panel on desktop and as a normal stacked section on smaller screens.
- It shows only gestures from the current active cycle.
- It shows only gestures whose `Message` field contains non-whitespace text.
- Messages are ordered newest first by gesture `TimeStamp`, with `EvtLogId` as a deterministic tiebreaker.
- Each entry displays the participant address, gesture date, gesture time, and message body.
- Participant addresses link to `/user/{address}` and gesture ids link to `/gesture/{EvtLogId}`.
- Empty cycles show a friendly empty state instead of a blank panel.

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

The home page keeps the timer and hero full width. Below the hero, the page switches to a responsive two-column layout:

- Main content: status, special allocation leaders, gesture form, allocation breakdown, attachments, public goods, and cycle details link.
- Right rail: `GestureMessageChat`, sticky on desktop with internal scrolling.

On tablet and mobile, the grid stacks so the chat remains part of the document flow and does not cover gesture controls.

## Test Coverage

Component coverage lives in `components/home/__tests__/GestureMessageChat.test.tsx` and verifies:

- message filtering;
- newest-first sorting;
- address/date/time/message rendering;
- long text safety;
- empty state;
- banned-message exclusion;
- accessibility via `checkA11y`.

Home-page integration coverage lives in `app/__tests__/HomePage.test.tsx` and verifies the panel receives the current-cycle gesture feed and stays in the responsive layout.

E2E coverage lives in `e2e/home-gesture-chat.spec.ts` and mocks current-cycle API responses to verify the panel renders the expected messages and docks on the desktop right rail.

## Validation Commands

```bash
YARN_IGNORE_ENGINES=1 yarn test components/home/__tests__/GestureMessageChat.test.tsx app/__tests__/HomePage.test.tsx --runInBand
YARN_IGNORE_ENGINES=1 yarn test:e2e e2e/home-gesture-chat.spec.ts
yarn lint
yarn type-check
```
