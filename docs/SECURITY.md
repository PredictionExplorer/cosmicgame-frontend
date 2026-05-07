# Security Notes

This document records dependency-security decisions that are intentionally
accepted for the current frontend threat model. Runtime advisories in direct
dependencies should be fixed immediately. Entries below are limited to
developer tooling, deploy tooling, or transitive helpers whose vulnerable input
is not attacker-controlled in the deployed dapp.

## Dependency Audit Policy

- Direct runtime dependencies with high or critical advisories are not accepted.
- Deployment CLIs should not be installed as project dependencies unless a
  checked-in npm script requires them.
- Accepted advisories must include an id, package, severity, scope, and reason.
- Accepted advisories should be revisited when the owning top-level package
  releases a compatible patch.
- CI runs the audit in non-blocking mode so new advisories are visible without
  blocking unrelated hotfixes.

## Accepted Dependency Advisories

### GHSA-vpq2-c234-7xj6

- package: `@tootallnate/once`
- severity: low
- scope: transitive development tooling
- reason: This package is only reached through local tooling. The app does not
  expose attacker-controlled Node HTTP parser state to this dependency.

### GHSA-2g4f-4pwh-qvx6

- package: `ajv`
- severity: moderate
- scope: build and deploy tooling
- reason: The ReDoS requires attacker-controlled schemas using `$data`. The app
  does not compile untrusted JSON schemas at runtime.

### GHSA-rpmf-866q-6p89

- package: `basic-ftp`
- severity: high
- scope: transitive development tooling
- reason: The DoS requires connecting tooling to a malicious FTP server. The
  frontend does not use FTP.

### GHSA-f886-m6hf-6m8v

- package: `brace-expansion`
- severity: moderate
- scope: build, test, and deploy tooling
- reason: The DoS requires attacker-controlled brace patterns. Our brace/glob
  patterns are controlled by repo configuration and developer commands.

### GHSA-v2v4-37r5-5v8g

- package: `ip-address`
- severity: moderate
- scope: WalletConnect/Reown transitive helper
- reason: The XSS requires calling HTML-emitting `Address6` methods with
  attacker-controlled values and rendering the result as HTML. The app does not
  call those methods.

### GHSA-3ppc-4f35-3m26

- package: `minimatch`
- severity: high
- scope: build, test, and deploy tooling
- reason: The ReDoS requires attacker-controlled glob patterns. Our patterns are
  fixed in repository configuration.

### GHSA-23c5-xmqv-rm74

- package: `minimatch`
- severity: high
- scope: build, test, and deploy tooling
- reason: The ReDoS requires attacker-controlled nested extglob patterns. Our
  patterns are fixed in repository configuration.

### GHSA-7r86-cg39-jmmj

- package: `minimatch`
- severity: high
- scope: build, test, and deploy tooling
- reason: The ReDoS requires attacker-controlled globstar patterns. Our patterns
  are fixed in repository configuration.

### GHSA-9wv6-86v2-598j

- package: `path-to-regexp`
- severity: high
- scope: framework and deploy routing internals
- reason: The ReDoS requires attacker-controlled route patterns. Route patterns
  are static source-controlled configuration.

### GHSA-j3q9-mxjg-w52f

- package: `path-to-regexp`
- severity: high
- scope: framework and deploy routing internals
- reason: The ReDoS requires attacker-controlled route patterns. Route patterns
  are static source-controlled configuration.

### GHSA-27v5-c462-wpq7

- package: `path-to-regexp`
- severity: moderate
- scope: framework and deploy routing internals
- reason: The ReDoS requires attacker-controlled route patterns. Route patterns
  are static source-controlled configuration.

### GHSA-c2c7-rcm5-vvqj

- package: `picomatch`
- severity: high
- scope: build, test, and deploy tooling
- reason: The ReDoS requires attacker-controlled glob patterns. Our patterns are
  fixed in repository configuration.

### GHSA-3v7f-55p6-f55p

- package: `picomatch`
- severity: moderate
- scope: build, test, and deploy tooling
- reason: The method-injection issue requires attacker-controlled glob patterns.
  Our patterns are fixed in repository configuration.

### GHSA-vrm6-8vpv-qv8q

- package: `undici`
- severity: high
- scope: transitive tooling helpers
- reason: The high-impact WebSocket decompression path is not used by the dapp
  runtime. Compatible direct runtime dependencies have been patched; remaining
  paths are transitive helper code.

### GHSA-v9p9-hfj2-hcw8

- package: `undici`
- severity: high
- scope: transitive tooling helpers
- reason: The invalid WebSocket extension negotiation path is not used by the
  dapp runtime. Compatible direct runtime dependencies have been patched;
  remaining paths are transitive helper code.

### GHSA-cxrh-j4jr-qwg3

- package: `undici`
- severity: low
- scope: transitive tooling helpers
- reason: Remaining paths are not exposed to attacker-controlled certificate
  data by the frontend runtime.

### GHSA-4992-7rv2-5pvq

- package: `undici`
- severity: moderate
- scope: transitive tooling helpers
- reason: Remaining paths are not used for attacker-controlled HTTP upgrade
  requests in the frontend runtime.

### GHSA-2mjp-6q6p-2qxm

- package: `undici`
- severity: moderate
- scope: transitive tooling helpers
- reason: Remaining paths are not used for attacker-controlled raw HTTP
  request/response construction in the frontend runtime.

### GHSA-g9mf-h72j-4rw9

- package: `undici`
- severity: moderate
- scope: transitive tooling helpers
- reason: Remaining paths do not fetch attacker-controlled compressed payloads
  in the frontend runtime.

### GHSA-c76h-2ccp-4975

- package: `undici`
- severity: moderate
- scope: transitive tooling helpers
- reason: Remaining paths are not used as cryptographic randomness sources by
  the frontend runtime.

### GHSA-w5hq-g745-h8pq

- package: `uuid`
- severity: moderate
- scope: WalletConnect/Reown transitive helper
- reason: The bounds issue requires direct use of v3/v5/v6 UUID APIs with a
  caller-provided buffer. The app does not call those APIs.
