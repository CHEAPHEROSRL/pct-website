import { Resend } from "resend";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM = process.env.EMAIL_FROM || "Paul Barry PCT <noreply@paulbarrypct.com>";

interface SendResult {
  success: boolean;
  error?: string;
}

async function send(to: string, subject: string, html: string): Promise<SendResult> {
  const resend = getResend();
  if (!resend) {
    console.warn("Resend not configured — email skipped:", subject);
    return { success: false, error: "Email service not configured" };
  }

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return { success: true };
  } catch (err) {
    console.error("Failed to send email:", err);
    return { success: false, error: "Email delivery failed" };
  }
}

// --- Email Templates ---

export async function sendPledgeConfirmation(
  email: string,
  name: string,
  rate: string,
  totalPledge: number
): Promise<SendResult> {
  const total = totalPledge.toLocaleString("en-US", { style: "currency", currency: "USD" });
  return send(
    email,
    "Your pledge is registered! 🥾",
    `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1C1C1C;">
      <div style="background: #3D7A5A; padding: 24px 32px;">
        <h1 style="margin: 0; font-size: 20px; color: white; letter-spacing: 2px; font-family: sans-serif;">
          PAUL BARRY · PCT 2026
        </h1>
      </div>
      <div style="padding: 32px;">
        <h2 style="margin: 0 0 16px; font-size: 24px;">Thank you, ${name}!</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #5C5C5C;">
          Your pledge of <strong style="color: #C45C26;">${rate}</strong> has been registered.
          If Paul completes all 2,650 miles of the PCT, your total pledge will be
          <strong>${total}</strong>.
        </p>
        <div style="background: #F4F1EC; padding: 20px; margin: 24px 0;">
          <p style="margin: 0; font-size: 14px; color: #5C5C5C;">
            <strong>Where your pledge goes:</strong><br/>
            50% → Cancer Foundation — California<br/>
            50% → Cancer Foundation — Sydney
          </p>
        </div>
        <p style="font-size: 14px; color: #5C5C5C; line-height: 1.6;">
          You can track your pledge anytime at <strong>paulbarrypct.com/my-pledge</strong>.
          When Paul starts trail challenges, you'll have the chance to boost your pledge even further!
        </p>
        <p style="font-size: 14px; color: #8C8A87; margin-top: 32px;">
          Paul gets $0 from pledges — every cent goes directly to cancer foundations.
        </p>
      </div>
    </div>
    `
  );
}

export async function sendChallengeStarted(
  email: string,
  name: string,
  challengeTitle: string,
  targetMiles: number,
  durationHours: number
): Promise<SendResult> {
  return send(
    email,
    `🔥 New Challenge: ${challengeTitle}`,
    `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1C1C1C;">
      <div style="background: #1C1F1A; padding: 24px 32px;">
        <h1 style="margin: 0; font-size: 20px; color: white; letter-spacing: 2px; font-family: sans-serif;">
          PAUL BARRY · PCT 2026
        </h1>
      </div>
      <div style="padding: 32px;">
        <div style="background: #C45C26; color: white; display: inline-block; padding: 6px 14px; font-size: 11px; letter-spacing: 2px; font-family: sans-serif; font-weight: bold; margin-bottom: 16px;">
          LIVE CHALLENGE
        </div>
        <h2 style="margin: 0 0 16px; font-size: 24px;">${challengeTitle}</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #5C5C5C;">
          Hey ${name}, Paul just started a new trail challenge!
          He's aiming to cover <strong>${targetMiles} miles</strong> in
          <strong>${durationHours} hours</strong>.
        </p>
        <div style="background: #F4F1EC; padding: 20px; margin: 24px 0;">
          <p style="margin: 0; font-size: 16px; color: #1C1C1C;">
            <strong>Boost your pledge if Paul makes it!</strong><br/>
            <span style="font-size: 14px; color: #5C5C5C;">
              Visit paulbarrypct.com to commit a boost. If Paul succeeds, your
              per-mile rate increases automatically.
            </span>
          </p>
        </div>
        <p style="font-size: 14px; color: #8C8A87;">
          You're receiving this because you pledged to Paul's PCT walk.
        </p>
      </div>
    </div>
    `
  );
}

export async function sendChallengeResult(
  email: string,
  name: string,
  challengeTitle: string,
  succeeded: boolean,
  boostApplied: number | null
): Promise<SendResult> {
  const subject = succeeded
    ? `🏆 Paul did it! ${challengeTitle}`
    : `Challenge ended: ${challengeTitle}`;

  const body = succeeded
    ? `
      <h2 style="margin: 0 0 16px; font-size: 24px; color: #3D7A5A;">Paul did it! 🏆</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #5C5C5C;">
        ${name}, Paul successfully completed <strong>${challengeTitle}</strong>!
        ${boostApplied
          ? `Your pledge has been boosted by <strong style="color: #3D7A5A;">+$${boostApplied.toFixed(2)}/mi</strong>.`
          : "Check your pledge dashboard to see the latest totals."
        }
      </p>
    `
    : `
      <h2 style="margin: 0 0 16px; font-size: 24px;">Challenge ended</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #5C5C5C;">
        ${name}, the challenge <strong>${challengeTitle}</strong> wasn't completed this time.
        No boosts were applied — your pledge remains the same. Paul will be back with another challenge soon!
      </p>
    `;

  return send(
    email,
    subject,
    `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1C1C1C;">
      <div style="background: ${succeeded ? "#3D7A5A" : "#1C1F1A"}; padding: 24px 32px;">
        <h1 style="margin: 0; font-size: 20px; color: white; letter-spacing: 2px; font-family: sans-serif;">
          PAUL BARRY · PCT 2026
        </h1>
      </div>
      <div style="padding: 32px;">
        ${body}
        <p style="font-size: 14px; color: #5C5C5C; margin-top: 24px;">
          View your pledge: <strong>paulbarrypct.com/my-pledge</strong>
        </p>
        <p style="font-size: 14px; color: #8C8A87; margin-top: 24px;">
          You're receiving this because you pledged to Paul's PCT walk.
        </p>
      </div>
    </div>
    `
  );
}
