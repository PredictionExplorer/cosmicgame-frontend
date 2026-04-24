// Kept as .mjs (not .ts) because commitlint resolves its config via
// cosmiconfig and the additional TS-loader dep would be dead weight for
// a one-line config.
export default { extends: ['@commitlint/config-conventional'] };
