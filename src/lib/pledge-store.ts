/**
 * Shared storage constants for the two-step pledge flow.
 *
 * Lives here rather than in either route file because both
 * /api/pledges (which writes) and /api/pledges/verify (which clears) need
 * them, and App Router route modules are validated against a fixed set of
 * allowed exports — a stray `export const` in a route.ts fails the build.
 */

/** How long a pledge confirmation link stays usable. */
export const VERIFY_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

/**
 * Pending record TTL. Deliberately one day longer than the token, so a link
 * clicked on its final day still finds the pledge it refers to.
 */
export const PENDING_TTL_SECONDS = 8 * 24 * 60 * 60;

/**
 * Redis hash of people who submitted the pledge form but never clicked the
 * confirmation link. Field = email hash, value = UnconfirmedPledge JSON.
 *
 * No TTL, by design. The pending record expires; this doesn't. Before it
 * existed an unconfirmed pledge disappeared without trace, which is why Paul
 * kept meeting people who said they'd pledged and weren't on the wall.
 * Entries are removed on confirmation, so the list only holds people who
 * still need chasing.
 */
export const UNCONFIRMED_KEY = "pledges:unconfirmed";
