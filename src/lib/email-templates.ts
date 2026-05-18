/**
 * Metadata for every email template the site can send.
 *
 * This file is the single source of truth for the admin "Emails" tab.
 * Each entry describes:
 *   - id:     stable slug used in URLs and Redis keys
 *   - name:   human-readable display name
 *   - category: groups templates in the list view
 *   - trigger: plain-English "when/why is this sent?"
 *   - recipient: plain-English "who receives this?"
 *   - cron: if automated by a cron job, the schedule (else null)
 *   - dedupKey: plain-English description of the dedup mechanism (if any)
 *   - render: a function that calls the corresponding send* function
 *             with realistic sample data. It returns the captured
 *             { subject, html } via the preview capture mechanism
 *             in email.ts (startPreviewCapture / endPreviewCapture).
 *
 * IMPORTANT: this file does NOT change any email wording. It only
 * describes and previews what already lives in email.ts.
 */

import {
  sendPledgeConfirmation,
  sendPledgeVerification,
  sendActionVerification,
  sendWeeklyUpdate,
  sendMilestoneReached,
  sendPledgeIncreased,
  sendPreMilestoneNudge,
  sendNearFinish,
  sendHonorReminder,
  sendChallengeStarted,
  sendChallengeResult,
  sendWelcomeDay1,
  sendWelcomeDay3,
  sendHonorConfirmation,
  sendCommunityMilestone,
  sendMagicLink,
  sendNewPost,
  sendWaitlistLaunchA,
  sendWaitlistLaunchB,
  sendWaitlistLaunchC,
  startPreviewCapture,
  endPreviewCapture,
  type CapturedPreview,
} from "./email";

export type EmailCategory =
  | "pledger-lifecycle"
  | "journey-updates"
  | "honour-flow"
  | "challenges"
  | "community"
  | "auth"
  | "publishing";

export interface EmailTemplateMetadata {
  id: string;
  name: string;
  category: EmailCategory;
  categoryLabel: string;
  trigger: string;
  recipient: string;
  cron: string | null;
  dedupKey: string | null;
}

export interface EmailTemplateEntry extends EmailTemplateMetadata {
  render: () => Promise<CapturedPreview>;
}

// A constant sample email that never actually receives anything.
// Used as the `to` address when rendering previews so nothing leaks
// in case preview capture somehow fails and the send gets through.
const PREVIEW_EMAIL = "preview@yeschapter.invalid";

async function withPreviewCapture(
  send: () => Promise<unknown>
): Promise<CapturedPreview> {
  startPreviewCapture();
  try {
    await send();
  } finally {
    // No-op — endPreviewCapture is what we actually read from
  }
  const captured = endPreviewCapture();
  if (!captured) {
    return {
      to: "",
      from: "",
      subject: "(render failed — no capture)",
      html: "<p>Preview render failed. Check server logs.</p>",
    };
  }
  return captured;
}

export const EMAIL_TEMPLATES: EmailTemplateEntry[] = [
  // ─── AUTH ────────────────────────────────────────────────────────
  {
    id: "magic-link",
    name: "Magic sign-in link",
    category: "auth",
    categoryLabel: "Authentication",
    trigger:
      "Sent when a visitor requests a passwordless sign-in link from /my-pledge. The email contains a one-time URL that expires in 15 minutes.",
    recipient: "The person who requested the sign-in link.",
    cron: null,
    dedupKey: null,
    render: () =>
      withPreviewCapture(() =>
        sendMagicLink(
          PREVIEW_EMAIL,
          "https://yeschapter.com/auth/verify?token=preview-token",
          "Sarah"
        )
      ),
  },
  {
    id: "action-verification",
    name: "Action verification (email confirm)",
    category: "auth",
    categoryLabel: "Authentication",
    trigger:
      "Sent when a pledger tries to perform a sensitive action (e.g. update their pledge, mark it honoured) and we need to verify they control the email address first. The email contains a one-time confirmation link.",
    recipient: "The pledger who triggered the action.",
    cron: null,
    dedupKey: null,
    render: () =>
      withPreviewCapture(() =>
        sendActionVerification(
          PREVIEW_EMAIL,
          "Sarah",
          "Update your pledge",
          "You're about to change your pledge rate from $0.10/mile to $0.25/mile.",
          "https://yeschapter.com/verify?token=preview-token"
        )
      ),
  },

  // ─── PLEDGER LIFECYCLE ───────────────────────────────────────────
  {
    id: "pledge-verification",
    name: "Pledge verification (double opt-in)",
    category: "pledger-lifecycle",
    categoryLabel: "Pledger lifecycle",
    trigger:
      "Sent immediately after someone fills in the pledge form on /pledge. They must click the confirm link to make their pledge official — prevents fake pledges from bots or typos.",
    recipient: "The person who submitted a new pledge.",
    cron: null,
    dedupKey: null,
    render: () =>
      withPreviewCapture(() =>
        sendPledgeVerification(
          PREVIEW_EMAIL,
          "Sarah",
          "$0.25/mile",
          662.5,
          "https://yeschapter.com/pledge/verify?token=preview-token"
        )
      ),
  },
  {
    id: "pledge-confirmation",
    name: "Pledge confirmation",
    category: "pledger-lifecycle",
    categoryLabel: "Pledger lifecycle",
    trigger:
      "Sent immediately after a new pledger clicks the confirm link in the verification email. Their pledge is now active and they are added to the pledger list.",
    recipient: "The newly-confirmed pledger.",
    cron: null,
    dedupKey: null,
    render: () =>
      withPreviewCapture(() =>
        sendPledgeConfirmation(
          PREVIEW_EMAIL,
          "Sarah",
          "$0.25/mile",
          662.5
        )
      ),
  },
  {
    id: "welcome-day-1",
    name: "Welcome — Day 1 (right after joining)",
    category: "pledger-lifecycle",
    categoryLabel: "Pledger lifecycle",
    trigger:
      "The first email in the welcome drip sequence. Sent by the daily welcome cron on the day after a pledger confirms. Introduces Paul's story and invites them to explore the site.",
    recipient: "New pledgers who confirmed their pledge the previous day.",
    cron: "Daily at 08:00 UTC",
    dedupKey: "One-time per pledger (welcome:day1:<pledgerId>)",
    render: () =>
      withPreviewCapture(() =>
        sendWelcomeDay1(
          PREVIEW_EMAIL,
          "Sarah",
          "$0.25/mile",
          662.5,
          47
        )
      ),
  },
  {
    id: "welcome-day-3",
    name: "Welcome — Day 3 (share & invite)",
    category: "pledger-lifecycle",
    categoryLabel: "Pledger lifecycle",
    trigger:
      "The second email in the welcome drip. Sent three days after a pledger confirms. Encourages them to share Paul's walk with friends and shows the community growing.",
    recipient: "Pledgers who confirmed their pledge three days ago.",
    cron: "Daily at 08:00 UTC",
    dedupKey: "One-time per pledger (welcome:day3:<pledgerId>)",
    render: () =>
      withPreviewCapture(() =>
        sendWelcomeDay3(PREVIEW_EMAIL, "Sarah", 47)
      ),
  },
  {
    id: "pledge-increased",
    name: "Pledge increased confirmation",
    category: "pledger-lifecycle",
    categoryLabel: "Pledger lifecycle",
    trigger:
      "Sent when an existing pledger increases their pledge rate (either voluntarily from /my-pledge or by committing a challenge boost). Confirms the new rate and total.",
    recipient: "The pledger who just bumped their rate.",
    cron: null,
    dedupKey: null,
    render: () =>
      withPreviewCapture(() =>
        sendPledgeIncreased(
          PREVIEW_EMAIL,
          "Sarah",
          0.1,
          0.25,
          "$0.25/mile",
          662.5
        )
      ),
  },

  // ─── JOURNEY UPDATES ─────────────────────────────────────────────
  {
    id: "weekly-update",
    name: "Weekly update",
    category: "journey-updates",
    categoryLabel: "Journey updates",
    trigger:
      "Sent every Monday at 15:00 UTC to all pledgers who haven't opted out. Personalised digest with the week's miles, elevation, a journal excerpt, and the pledger's running total.",
    recipient: "All confirmed pledgers with emailPreference=\"all\".",
    cron: "Mondays at 15:00 UTC",
    dedupKey: "One-time per pledger per week (weekly:<weekNumber>:<pledgerId>)",
    render: () =>
      withPreviewCapture(() =>
        sendWeeklyUpdate(
          PREVIEW_EMAIL,
          "Sarah",
          4,    // weekNumber
          0.25, // pledgeRate
          1,    // pledgeInterval
          487,  // milesWalked
          28,   // dayNumber
          42800, // elevation
          47,   // pledgerCount
          "Kennedy Meadows", // nearestLocation
          "This week I crossed into the Sierra. The air is thinner, the views are impossible, and every switchback is a conversation with my parents.",
          "sierra-crossing"
        )
      ),
  },
  {
    id: "milestone-reached",
    name: "Milestone reached",
    category: "journey-updates",
    categoryLabel: "Journey updates",
    trigger:
      "Sent by the daily milestone cron when Paul passes a major trail landmark (e.g. Kennedy Meadows, Mt. Whitney, Oregon border). The specific milestone is determined by his current mile.",
    recipient: "All confirmed pledgers with emailPreference=\"all\" or \"milestones\".",
    cron: "Daily at 09:00 UTC (when Paul crosses a threshold)",
    dedupKey: "One-time per pledger per milestone (milestone:<milestoneId>:<pledgerId>)",
    render: () =>
      withPreviewCapture(() =>
        sendMilestoneReached(
          PREVIEW_EMAIL,
          "Sarah",
          "Mt. Whitney Summit",
          "The highest peak in the contiguous US, 14,505 ft. Paul reached the summit this morning.",
          0.25, // pledgeRate
          1,    // pledgeInterval
          800,  // milesWalked
          47,   // pledgerCount
          8500, // totalPledgedAll
          12    // countryCount
        )
      ),
  },
  {
    id: "pre-milestone-nudge",
    name: "Pre-milestone nudge",
    category: "journey-updates",
    categoryLabel: "Journey updates",
    trigger:
      "Sent by the daily milestone cron when Paul is 20 miles out from a major landmark. Gives pledgers anticipation and a chance to engage before the milestone email fires.",
    recipient: "All confirmed pledgers with emailPreference=\"all\" or \"milestones\".",
    cron: "Daily at 09:00 UTC (when Paul is within 20 mi of a milestone)",
    dedupKey:
      "One-time per pledger per milestone (premilestone:<milestoneId>:<pledgerId>)",
    render: () =>
      withPreviewCapture(() =>
        sendPreMilestoneNudge(
          PREVIEW_EMAIL,
          "Sarah",
          "Kennedy Meadows",
          700,  // milestoneMiles
          685,  // currentMiles
          0.25, // pledgeRate
          1,    // pledgeInterval
          47    // pledgerCount
        )
      ),
  },
  {
    id: "near-finish-200",
    name: "Near finish — 200 miles to go",
    category: "journey-updates",
    categoryLabel: "Journey updates",
    trigger:
      "Sent once when Paul reaches ~mile 2,450 (200 miles to the end). Builds anticipation and primes pledgers for the honour flow that's coming.",
    recipient: "All confirmed pledgers with emailPreference=\"all\".",
    cron: "Daily at 09:00 UTC (once when Paul crosses mile 2,450)",
    dedupKey: "One-time per pledger (nearfinish:200:<pledgerId>)",
    render: () =>
      withPreviewCapture(() =>
        sendNearFinish(
          PREVIEW_EMAIL,
          "Sarah",
          "200mi",
          0.25,  // pledgeRate
          1,     // pledgeInterval
          2450,  // currentMiles
          662.5, // finalTotal (projected)
          47,    // pledgerCount
          8500   // totalPledgedAll
        )
      ),
  },
  {
    id: "near-finish-100",
    name: "Near finish — 100 miles to go",
    category: "journey-updates",
    categoryLabel: "Journey updates",
    trigger:
      "Sent once when Paul reaches ~mile 2,550 (100 miles to the end). Increases urgency and excitement.",
    recipient: "All confirmed pledgers with emailPreference=\"all\".",
    cron: "Daily at 09:00 UTC (once when Paul crosses mile 2,550)",
    dedupKey: "One-time per pledger (nearfinish:100:<pledgerId>)",
    render: () =>
      withPreviewCapture(() =>
        sendNearFinish(
          PREVIEW_EMAIL,
          "Sarah",
          "100mi",
          0.25,
          1,
          2550,
          662.5,
          47,
          8500
        )
      ),
  },
  {
    id: "near-finish-finish",
    name: "Near finish — final stretch",
    category: "journey-updates",
    categoryLabel: "Journey updates",
    trigger:
      "Sent once when Paul is within a handful of miles of the northern terminus. The last emotional pulse before the honour flow begins.",
    recipient: "All confirmed pledgers with emailPreference=\"all\".",
    cron: "Daily at 09:00 UTC (once, close to the end)",
    dedupKey: "One-time per pledger (nearfinish:finish:<pledgerId>)",
    render: () =>
      withPreviewCapture(() =>
        sendNearFinish(
          PREVIEW_EMAIL,
          "Sarah",
          "finish",
          0.25,
          1,
          2640,
          662.5,
          47,
          8500
        )
      ),
  },

  // ─── HONOUR FLOW ─────────────────────────────────────────────────
  {
    id: "honor-reminder-day5",
    name: "Honour reminder — Day 5",
    category: "honour-flow",
    categoryLabel: "Honour flow",
    trigger:
      "Sent 5 days after the end of Paul's hike to pledgers who haven't yet honoured their pledge. Gentle reminder with their final total and direct donation links to the two foundations.",
    recipient: "Confirmed pledgers who have not yet marked their pledge as honoured.",
    cron: "Daily at 12:00 UTC",
    dedupKey: "One-time per pledger (honor:day5:<pledgerId>)",
    render: () =>
      withPreviewCapture(() =>
        sendHonorReminder(
          PREVIEW_EMAIL,
          "Sarah",
          "day5",
          662.5, // finalTotal
          0.25,  // pledgeRate
          1,     // pledgeInterval
          38,    // honoredCount
          47     // pledgerCount
        )
      ),
  },
  {
    id: "honor-reminder-day14",
    name: "Honour reminder — Day 14 (final)",
    category: "honour-flow",
    categoryLabel: "Honour flow",
    trigger:
      "The final honour reminder, sent 14 days after the end of the hike to pledgers who still haven't honoured. More direct in tone than the day-5 version.",
    recipient: "Confirmed pledgers who have not yet marked their pledge as honoured.",
    cron: "Daily at 12:00 UTC",
    dedupKey: "One-time per pledger (honor:day14:<pledgerId>)",
    render: () =>
      withPreviewCapture(() =>
        sendHonorReminder(
          PREVIEW_EMAIL,
          "Sarah",
          "day14",
          662.5,
          0.25,
          1,
          38,
          47
        )
      ),
  },
  {
    id: "honor-confirmation",
    name: "Honour confirmation (thank you)",
    category: "honour-flow",
    categoryLabel: "Honour flow",
    trigger:
      "Sent when a pledger marks their pledge as honoured (after donating directly to the foundations). Thanks them and shows the community honour rate as social proof.",
    recipient: "The pledger who just honoured their pledge.",
    cron: null,
    dedupKey: null,
    render: () =>
      withPreviewCapture(() =>
        sendHonorConfirmation(
          PREVIEW_EMAIL,
          "Sarah",
          662.5,
          38,
          47,
          81
        )
      ),
  },

  // ─── CHALLENGES ──────────────────────────────────────────────────
  {
    id: "challenge-started",
    name: "Challenge started",
    category: "challenges",
    categoryLabel: "Trail challenges",
    trigger:
      "Sent to all pledgers immediately when Paul launches a new trail challenge from the admin panel. Invites them to boost their pledge to fund the challenge.",
    recipient: "All confirmed pledgers with emailPreference=\"all\".",
    cron: null,
    dedupKey: "One-time per pledger per challenge (challenge-start:<challengeId>:<pledgerId>)",
    render: () =>
      withPreviewCapture(() =>
        sendChallengeStarted(
          PREVIEW_EMAIL,
          "Sarah",
          "Desert Push: 30 miles in 24 hours",
          30,
          "mi",
          24
        )
      ),
  },
  {
    id: "challenge-result",
    name: "Challenge result (success or fail)",
    category: "challenges",
    categoryLabel: "Trail challenges",
    trigger:
      "Sent to all pledgers when Paul resolves a challenge as succeeded, failed, or cancelled. If succeeded and the pledger boosted, their boost is locked in.",
    recipient: "All confirmed pledgers with emailPreference=\"all\".",
    cron: null,
    dedupKey: "One-time per pledger per challenge (challenge-result:<challengeId>:<pledgerId>)",
    render: () =>
      withPreviewCapture(() =>
        sendChallengeResult(
          PREVIEW_EMAIL,
          "Sarah",
          "Desert Push: 30 miles in 24 hours",
          true,
          25
        )
      ),
  },

  // ─── COMMUNITY ───────────────────────────────────────────────────
  {
    id: "community-milestone-pledgers",
    name: "Community milestone — pledger count",
    category: "community",
    categoryLabel: "Community milestones",
    trigger:
      "Sent to all pledgers when the community hits a round-number pledger count (25, 50, 100, 200, 500, 1000). Creates social proof and celebration.",
    recipient: "All confirmed pledgers with emailPreference=\"all\".",
    cron: null,
    dedupKey: "One-time per pledger per threshold (community:pledgers:<threshold>:<pledgerId>)",
    render: () =>
      withPreviewCapture(() =>
        sendCommunityMilestone(
          PREVIEW_EMAIL,
          "Sarah",
          "pledgers",
          100,   // value (the threshold reached)
          100,   // pledgerCount
          8500   // totalPledged
        )
      ),
  },
  {
    id: "community-milestone-total",
    name: "Community milestone — total pledged",
    category: "community",
    categoryLabel: "Community milestones",
    trigger:
      "Sent to all pledgers when the community's total pledged amount crosses a round threshold ($5k, $10k, $25k, $50k, $100k).",
    recipient: "All confirmed pledgers with emailPreference=\"all\".",
    cron: null,
    dedupKey: "One-time per pledger per threshold (community:total:<threshold>:<pledgerId>)",
    render: () =>
      withPreviewCapture(() =>
        sendCommunityMilestone(
          PREVIEW_EMAIL,
          "Sarah",
          "total",
          10000, // value
          100,   // pledgerCount
          10000  // totalPledged
        )
      ),
  },

  // ─── PUBLISHING ──────────────────────────────────────────────────
  {
    id: "new-journal-post",
    name: "New journal post notification",
    category: "publishing",
    categoryLabel: "Content publishing",
    trigger:
      "Sent when a new journal post is published from the admin panel (either by flipping the publish toggle or via the video-to-blog flow). Goes to all waitlist subscribers AND confirmed pledgers.",
    recipient:
      "Combined list: waitlist subscribers + confirmed pledgers with emailPreference=\"all\".",
    cron: null,
    dedupKey: "One-time per post (emails:newpost:<postId>)",
    render: () =>
      withPreviewCapture(() =>
        sendNewPost(
          PREVIEW_EMAIL,
          "Sarah",
          "The Day the Trail Fought Back",
          "Rattlesnakes, heat, a bad water cache. Not every day on the PCT is a postcard.",
          "the-day-the-trail-fought-back",
          18
        )
      ),
  },
  {
    id: "waitlist-launch-a",
    name: "Waitlist launch — Option A (pledge-focused)",
    category: "publishing",
    categoryLabel: "Content publishing",
    trigger:
      "Sent ONCE to every waitlist subscriber when Paul announces the site is live. Option A leads with 'Pledge per mile' as the primary CTA and mentions trail support as a softer P.S. Paul picks ONE variant (A, B, or C) in the admin Waitlist tab and triggers the blast manually.",
    recipient: "All waitlist subscribers (one-shot — lock prevents re-sending across all three variants).",
    cron: null,
    dedupKey: "One-shot per site: waitlist:launch:sent (locks A/B/C together)",
    render: () => withPreviewCapture(() => sendWaitlistLaunchA(PREVIEW_EMAIL)),
  },
  {
    id: "waitlist-launch-b",
    name: "Waitlist launch — Option B (two equal CTAs)",
    category: "publishing",
    categoryLabel: "Content publishing",
    trigger:
      "Sent ONCE to every waitlist subscriber when Paul announces the site is live. Option B presents Pledge and Support as equal-weight side-by-side CTAs. Paul picks ONE variant (A, B, or C) in the admin Waitlist tab and triggers the blast manually.",
    recipient: "All waitlist subscribers (one-shot — lock prevents re-sending across all three variants).",
    cron: null,
    dedupKey: "One-shot per site: waitlist:launch:sent (locks A/B/C together)",
    render: () => withPreviewCapture(() => sendWaitlistLaunchB(PREVIEW_EMAIL)),
  },
  {
    id: "waitlist-launch-c",
    name: "Waitlist launch — Option C (soft launch, no ask)",
    category: "publishing",
    categoryLabel: "Content publishing",
    trigger:
      "Sent ONCE to every waitlist subscriber when Paul announces the site is live. Option C is a soft 'come explore' announcement with no explicit ask — drives to the homepage. Paul picks ONE variant (A, B, or C) in the admin Waitlist tab and triggers the blast manually.",
    recipient: "All waitlist subscribers (one-shot — lock prevents re-sending across all three variants).",
    cron: null,
    dedupKey: "One-shot per site: waitlist:launch:sent (locks A/B/C together)",
    render: () => withPreviewCapture(() => sendWaitlistLaunchC(PREVIEW_EMAIL)),
  },
];

export function getTemplateById(id: string): EmailTemplateEntry | undefined {
  return EMAIL_TEMPLATES.find((t) => t.id === id);
}

export function getTemplateMetadata(): EmailTemplateMetadata[] {
  return EMAIL_TEMPLATES.map(({ render: _render, ...metadata }) => {
    void _render;
    return metadata;
  });
}
