# Stella website assistant

The shared root document loads Holloway's website assistant after the page becomes
interactive. The public installation ID is
`ee939b0c-7dac-455c-a68e-9afc07ef91eb`; it is an identifier, not a credential.
The integration serves both `https://cosmicsignature.com` and
`https://app.cosmicsignature.com` without changing the dashboard layout or wallet flow.

Stella uses the Cosmic Signature account's approved public knowledge and read-only
live-cycle tools. Visitors do not receive account access, private documents, owner
tools, or wallet transaction capabilities. Provider credentials stay on Holloway's
server. The initial configured welcome is in English; adding the script does not
translate the external widget into the site's eight locales.

## Visitor experience

The first visit shows a welcome invitation. Audio starts after a visitor interaction,
and microphone access is requested only when the visitor starts a voice conversation.
The welcome preference is stored per installation in the site's local storage, so it
is remembered on that browser and host. The main site and app are separate origins;
each can show its own first welcome. Clearing site storage resets the preference.
After dismissal, the assistant remains available through its small launcher.

The embed uses Next.js Script deduplication across navigation. Holloway controls its
iframe and guest sessions. On the two canonical Cosmic hosts, the frontend's
Permissions-Policy enables microphone access for its own origin and delegates to
`https://holloway-bay.vercel.app` as the only external origin. The parent must enable
itself for the frame to inherit access ([Permissions Policy inheritance](https://www.w3.org/TR/permissions-policy/#define-an-inherited-policy-for-feature-in-container-at-origin)).
Camera and location stay disabled. A visitor must still grant browser permission.

## Owner controls

In the Cosmic Signature account's Holloway Settings, the owner can disable the
website assistant, edit its welcome/name/voice, select public knowledge, and maintain
the exact allowed origins. Changes do not require a frontend deployment. The current
installation has a limit of 20 visitor sessions per rolling 24 hours and a five-minute
session duration, with server-side limits and voice cleanup managed by Holloway.

## Review and deployment

This change is prepared for upstream review. The upstream team controls frontend
preview authorization, merge, and production deployment.

The installation currently allows only the two canonical HTTPS origins. An ordinary
localhost or Vercel preview does not display Stella. For an interactive preview, the
owner must explicitly allow that exact preview origin in Holloway and the frontend
must add an equally narrow microphone-policy rule if voice is being tested. Remove
temporary origins after review; do not introduce wildcard origin or microphone access.

Liquid Glass is independent of this integration and remains an optional Color scheme
selection. The default scheme and existing layout are unchanged.
