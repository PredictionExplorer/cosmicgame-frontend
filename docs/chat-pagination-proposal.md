# Chat history pagination and rollout

Implemented in the frontend and `augur-explorer`, based on the updated `main` branch of each repository. Backend baseline: `07219b84`; frontend baseline: `3fc41898`. No deployment is part of this change.

## Behavior

The chat starts with the latest 50 messages. **Load older** adds the next 50, with separate loading and retry states. Messages remain newest first, duplicate event identities are merged, and the row being read stays in place when history changes. Derived system events also appear in groups of 50. Header counts describe loaded messages and displayed events, rather than pretending to be cycle-wide totals.

The frontend supports both server versions:

- New servers: use the v2 message pages below. Older messages are requested only when the reader asks for them. Active polling every 10 seconds requests new messages through a synchronization cursor; it does not refetch every older page.
- Existing servers: a 404 or 501 from the new routes activates the existing full-cycle endpoint. The frontend displays that response in groups of 50 locally. Network usage remains the old server's full-history behavior until deployment. Capability is checked again after five minutes, or when the selected backend changes, so an open page can discover the new server.
- Real failures, rate limits, and malformed payloads remain errors with retry controls. They never silently trigger a large legacy download.

## Backend contract

`GET /api/v2/cosmicgame/rounds/{round}/messages?limit=50`

The default is 50; the backend maximum is 200. The response contains one slim `data` array and `meta: { limit, nextCursor?, syncCursor, hasMore, revision }`. Message rows carry the event identity, cycle, gesture position, participant, timestamp, message, method, exact ETH/CST values, and transaction identity. The SQL query does not load attached assets or reward data. Nonblank and moderation filters run before the limit; whitespace follows JavaScript's trim behavior, and moderation uses the database row identity rather than the distinct event-log ID.

For older history, pass `cursor=nextCursor`. Rows are ordered by `(occurredAt, eventLogId)` descending, with a strict tuple boundary and `LIMIT n+1`. Keep the original synchronization cursor when appending older pages; the older response's fresh synchronization watermark must not replace it.

For live updates, pass `after=syncCursor`. Rows arrive ascending, and `hasMore` indicates further catch-up pages. Advance only through returned rows. The frontend drains at most 20 update pages in one polling pass and retains its completed cursor for the next pass if more remain. This prevents gaps when more than 50 messages arrive between polls without creating an unbounded request loop. Cursors are versioned and scoped to cycle, direction, boundary, and history revision; the frontend keeps caches scoped to the issuing backend as well.

Actual message edits/deletions and moderation changes advance a durable revision in the same database transaction. This covers reorganizations and legacy moderation writes. Stale cursors receive `409` with a problem type ending in `/feed-reset-required`. The frontend discards invalidated messages immediately and reloads from the newest page; if that reload fails, removed messages do not remain visible as valid history. Ordinary appended records do not invalidate older pages.

The [backend API guide](../../augur-explorer/docs/chat-api.md) and its OpenAPI v2 schema define the exact fields, validation, migrations, and response examples.

## Preserving the rest of the homepage

The same full cycle list previously powered counts, latest-gesture panels, optimistic messages, and reconstructed system events. Replacing that array with 50 messages would have changed those features incorrectly.

The new `/api/v2/cosmicgame/rounds/{round}/chat-context` response therefore supplies complete, compact gesture metadata **without message bodies**, costs, rewards, or attached assets. It retains empty-message and moderated gestures because they still affect protocol counts and milestones. Counts and timeline reconstruction consume this metadata; latest panels use one complete latest gesture from the existing endpoint with `limit=1`. Pending chat rows reconcile against loaded message pages. The status panels no longer download a separate full wallet history to calculate the same counts.

This metadata response intentionally remains **O(cycle size)** and is refreshed with the live feed. The change eliminates unconditional full message-body downloads on new servers, not every full-history metadata read. A future authoritative summary and paginated system-event API can remove that remaining cost. No milestone reconstruction was moved or approximated in this change.

## Deployment order

1. Apply backend migrations `00030_cg_chat_revision.sql` and `00031_cg_chat_message_index.sql` using the project's migration process. The latter builds its partial index concurrently. Existing servers work with these additive migrations.
2. Deploy the backend with the two v2 routes.
3. Deploy the frontend either before or after the backend; fallback supports either order. Verify that a paginated homepage uses the message/context routes and that its only legacy cycle-list request has `limit=1`.

Backend deployment and production migrations are separate operator actions. Tests use disposable PostgreSQL instances.

## Validation

Coverage includes old-server fallback, automatic capability re-probing, 50-message older pages, retries, same-timestamp boundaries, a burst exceeding 50 new messages, moderation identity, whitespace-only messages, revision rollback/reset, cycle rollover/cancellation, stale server-rendered detail, metadata-only counts, full milestone reconstruction, and scroll-position preservation. Mobile Chrome and Safari exercise the paging UI and print behavior. Printing exposes already loaded messages and known system events; it never downloads more history automatically.
