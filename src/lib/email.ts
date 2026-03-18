import { google } from "googleapis";

// ---------------------------------------------------------------------------
// Gmail API client (Google Workspace OAuth2)
// ---------------------------------------------------------------------------

function getGmailClient() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) return null;

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return google.gmail({ version: "v1", auth: oauth2Client });
}

const FROM = process.env.EMAIL_FROM || "YesChapter <paul@yeschapter.com>";

interface SendResult {
  success: boolean;
  error?: string;
}

async function send(to: string, subject: string, html: string): Promise<SendResult> {
  const gmail = getGmailClient();
  if (!gmail) {
    console.warn("Gmail not configured — email skipped:", subject);
    return { success: false, error: "Email service not configured" };
  }

  try {
    // Build RFC 2822 message
    const message = [
      `To: ${to}`,
      `From: ${FROM}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=utf-8",
      "",
      html,
    ].join("\r\n");

    const raw = Buffer.from(message).toString("base64url");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    return { success: true };
  } catch (err) {
    console.error("Failed to send email:", err);
    return { success: false, error: "Email delivery failed" };
  }
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://yeschapter.com";

function emailFooter(unsubscribeToken?: string): string {
  const prefsLink = unsubscribeToken
    ? `${SITE}/unsubscribe?token=${unsubscribeToken}`
    : `${SITE}/unsubscribe`;
  return `
    <div style="background: #1C1F1A; padding: 20px 32px; text-align: center; margin-top: 24px;">
      <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 3px; font-family: sans-serif; font-weight: 700; color: #FFFFFF88;">YESCHAPTER</p>
      <p style="margin: 0; font-size: 11px; color: #FFFFFF44;">
        <a href="${SITE}/my-pledge" style="color: #FFFFFF66; text-decoration: none;">View My Pledge</a>
        &nbsp;&middot;&nbsp;
        <a href="${prefsLink}" style="color: #FFFFFF66; text-decoration: none;">Email Preferences</a>
        &nbsp;&middot;&nbsp;
        <a href="${prefsLink}&action=unsubscribe" style="color: #FFFFFF66; text-decoration: none;">Unsubscribe</a>
      </p>
    </div>
  `;
}

function shareUrl(name?: string): string {
  const ref = name ? encodeURIComponent(name) : "";
  return ref ? `${SITE}/join?ref=${ref}` : `${SITE}/pledge`;
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
          YESCHAPTER · PCT 2026
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
          You can track your pledge anytime at <strong>yeschapter.com/my-pledge</strong>.
          When Paul starts trail challenges, you'll have the chance to boost your pledge even further!
        </p>
        <div style="text-align: center; margin-top: 28px;">
          <a href="${SITE}/join" style="display: inline-block; background: #C45C26; color: #FFFFFF; padding: 12px 28px; text-decoration: none; font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 11px; letter-spacing: 2px;">SHARE WITH A FRIEND &rarr;</a>
          <p style="font-size: 12px; color: #8C8A87; margin-top: 10px;">Every new pledger makes a difference.</p>
        </div>
        <p style="font-size: 14px; color: #8C8A87; margin-top: 32px;">
          Paul gets $0 from pledges — every cent goes directly to cancer foundations.
        </p>
      </div>
    </div>
    `
  );
}

export async function sendPledgeVerification(
  email: string,
  name: string,
  rate: string,
  totalPledge: number,
  verifyUrl: string
): Promise<SendResult> {
  const html = `
    <div style="max-width: 600px; margin: 0 auto; background: #F4F1EC; font-family: Georgia, serif;">
      <div style="background: #1C1F1A; padding: 16px 32px; display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #FFFFFF; font-family: sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 3px;">YESCHAPTER</span>
        <span style="color: #FFFFFF66; font-family: sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 2px;">WALKING FOR CANCER</span>
      </div>
      <div style="background: #3D7A5A; padding: 48px 40px; text-align: center;">
        <p style="margin: 0 0 16px; font-size: 13px; letter-spacing: 4px; font-family: sans-serif; font-weight: 700; color: #FFFFFF88;">CONFIRM YOUR PLEDGE</p>
        <h1 style="margin: 0 0 12px; font-size: 28px; font-weight: 600; color: #FFFFFF;">One More Step, ${name}.</h1>
        <p style="margin: 0; font-size: 15px; color: #FFFFFFCC; line-height: 1.6;">Click the button below to confirm your pledge of ${rate}<br/>and join the community walking with Paul.</p>
      </div>
      <div style="background: #FFFFFF; padding: 36px 40px; text-align: center;">
        <p style="margin: 0 0 4px; font-size: 12px; letter-spacing: 3px; font-family: sans-serif; font-weight: 700; color: #8C8A87;">YOUR PLEDGE</p>
        <p style="margin: 0 0 8px; font-size: 42px; font-weight: 600; color: #C45C26; letter-spacing: -1px;">$${totalPledge.toFixed(2)}</p>
        <p style="margin: 0 0 24px; font-size: 15px; color: #5C5C5C;">${rate} × 2,650 miles</p>
        <a href="${verifyUrl}" style="display: inline-block; background: #3D7A5A; color: #FFFFFF; padding: 16px 48px; font-family: sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 2px; text-decoration: none;">CONFIRM MY PLEDGE</a>
        <p style="margin: 16px 0 0; font-size: 12px; color: #8C8A87;">This link expires in 1 hour.</p>
      </div>
      <div style="background: #F4F1EC; padding: 20px 40px; text-align: center;">
        <p style="margin: 0; font-size: 13px; color: #8C8A87; line-height: 1.6;">If you didn't request this, you can safely ignore this email.<br/>No pledge will be created.</p>
      </div>
      <div style="background: #1C1F1A; padding: 20px 32px; text-align: center;">
        <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 3px; font-family: sans-serif; font-weight: 700; color: #FFFFFF88;">YESCHAPTER</p>
        <p style="margin: 0; font-size: 11px; color: #FFFFFF44;">
          <a href="https://yeschapter.com" style="color: #FFFFFF66; text-decoration: none;">yeschapter.com</a>
        </p>
      </div>
    </div>
  `;

  return send(email, "Confirm Your Pledge — YesChapter", html);
}

export async function sendActionVerification(
  email: string,
  name: string,
  action: string,
  description: string,
  verifyUrl: string
): Promise<SendResult> {
  const html = `
    <div style="max-width: 600px; margin: 0 auto; background: #F4F1EC; font-family: Georgia, serif;">
      <div style="background: #1C1F1A; padding: 16px 32px;">
        <span style="color: #FFFFFF; font-family: sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 3px;">YESCHAPTER</span>
      </div>
      <div style="background: #3D7A5A; padding: 40px; text-align: center;">
        <p style="margin: 0 0 12px; font-size: 13px; letter-spacing: 4px; font-family: sans-serif; font-weight: 700; color: #FFFFFF88;">VERIFY YOUR ACTION</p>
        <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 600; color: #FFFFFF;">Hi ${name},</h1>
        <p style="margin: 0; font-size: 15px; color: #FFFFFFCC; line-height: 1.6;">${description}</p>
      </div>
      <div style="background: #FFFFFF; padding: 32px 40px; text-align: center;">
        <a href="${verifyUrl}" style="display: inline-block; background: #C45C26; color: #FFFFFF; padding: 14px 40px; font-family: sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-decoration: none;">${action.toUpperCase()}</a>
        <p style="margin: 16px 0 0; font-size: 12px; color: #8C8A87;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
      <div style="background: #1C1F1A; padding: 16px 32px; text-align: center;">
        <p style="margin: 0; font-size: 11px; color: #FFFFFF44;">
          <a href="https://yeschapter.com" style="color: #FFFFFF66; text-decoration: none;">yeschapter.com</a>
        </p>
      </div>
    </div>
  `;

  return send(email, `Verify: ${action} — YesChapter`, html);
}

export async function sendWeeklyUpdate(
  email: string,
  name: string,
  weekNumber: number,
  pledgeRate: number,
  pledgeInterval: number,
  milesWalked: number,
  dayNumber: number,
  elevation: number,
  pledgerCount: number,
  nearestLocation: string,
  journalExcerpt?: string,
  journalSlug?: string
): Promise<SendResult> {
  const pledgeTotal = pledgeRate * Math.floor(milesWalked / pledgeInterval);
  const halfTotal = (pledgeTotal / 2).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const totalFormatted = pledgeTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const rateFormatted = `$${pledgeRate}/${pledgeInterval === 1 ? "mi" : pledgeInterval + "mi"}`;
  const percent = Math.min(100, Math.round((milesWalked / 2650) * 100));

  const journalSection = journalExcerpt
    ? `
      <div style="padding: 24px 32px; background: #FFFFFF;">
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 3px; color: #C45C26; margin-bottom: 12px;">FROM PAUL'S JOURNAL</div>
        <p style="font-family: Georgia, serif; font-style: italic; font-size: 13px; color: #5C5C5C; line-height: 1.6; margin: 0;">
          &ldquo;${journalExcerpt}&rdquo;
        </p>
        ${journalSlug ? `<a href="https://yeschapter.com/journal/${journalSlug}" style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 12px; color: #C45C26; text-decoration: none; display: inline-block; margin-top: 12px;">Read the full journal entry &rarr;</a>` : ""}
      </div>
    `
    : "";

  return send(
    email,
    `Week ${weekNumber}: Paul is at ${nearestLocation} — ${milesWalked.toLocaleString()} miles`,
    `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1C1C1C;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 28px; background: #1C1F1A;">
        <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 3px; color: #FFFFFF;">YESCHAPTER</span>
        <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 9px; letter-spacing: 2px; color: #FFFFFF66;">WALKING FOR CANCER</span>
      </div>
      <!-- Hero -->
      <div style="text-align: center; padding: 36px 32px; background: #1C1F1A;">
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 2px; color: #FFFFFF; background: #C45C26; display: inline-block; padding: 5px 14px;">WEEK ${weekNumber} UPDATE</div>
        <h2 style="margin: 12px 0 0; font-size: 24px; color: #FFFFFF;">Paul is at ${nearestLocation}</h2>
        <p style="margin: 8px 0 0; font-size: 13px; color: #FFFFFFAA;">Mile ${milesWalked.toLocaleString()} of 2,650 &mdash; Day ${dayNumber} on the Pacific Crest Trail</p>
        <div style="width: 50px; height: 2px; background: #C45C26; margin: 16px auto 0;"></div>
      </div>
      <!-- Pledge Total -->
      <div style="text-align: center; padding: 28px 32px; background: #FFFFFF;">
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 3px; color: #8C8A87;">YOUR RUNNING PLEDGE TOTAL</div>
        <div style="font-size: 44px; font-weight: 600; letter-spacing: -1px; color: #C45C26; margin: 6px 0;">$${totalFormatted}</div>
        <div style="font-size: 12px; color: #5C5C5C;">${rateFormatted} &times; ${milesWalked.toLocaleString()} miles walked</div>
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 500; font-size: 10px; color: #8C8A87; margin-top: 4px;">$${halfTotal} to City of Hope &middot; $${halfTotal} to Leukaemia Foundation</div>
      </div>
      <!-- Progress Bar -->
      <div style="padding: 18px 32px; background: #FFFFFF;">
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 3px; color: #8C8A87; margin-bottom: 8px;">TRAIL PROGRESS</div>
        <div style="width: 100%; height: 10px; background: #EBE8E3; border-radius: 5px; overflow: hidden;">
          <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, #3D7A5A, #C45C26); border-radius: 5px;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 6px;">
          <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-size: 9px; letter-spacing: 1px; color: #8C8A87;">Mexico</span>
          <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 9px; letter-spacing: 1px; color: #C45C26;">${percent}% complete</span>
          <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-size: 9px; letter-spacing: 1px; color: #8C8A87;">Canada</span>
        </div>
      </div>
      <!-- Stats Row -->
      <div style="display: flex; justify-content: space-around; padding: 18px 32px; background: #F4F1EC;">
        <div style="text-align: center;">
          <div style="font-size: 19px; font-weight: 600; color: #1C1C1C;">${milesWalked.toLocaleString()}</div>
          <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 8px; letter-spacing: 2px; color: #8C8A87;">MILES WALKED</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 19px; font-weight: 600; color: #1C1C1C;">${dayNumber}</div>
          <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 8px; letter-spacing: 2px; color: #8C8A87;">DAYS ON TRAIL</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 19px; font-weight: 600; color: #1C1C1C;">${elevation.toLocaleString()} ft</div>
          <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 8px; letter-spacing: 2px; color: #8C8A87;">ELEVATION</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 19px; font-weight: 600; color: #3D7A5A;">${pledgerCount.toLocaleString()}</div>
          <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 8px; letter-spacing: 2px; color: #8C8A87;">PLEDGERS</div>
        </div>
      </div>
      ${journalSection}
      <!-- CTA -->
      <div style="text-align: center; padding: 24px 32px; background: #F4F1EC;">
        <p style="font-size: 13px; color: #5C5C5C; margin: 0 0 10px;">Follow Paul's journey in real-time</p>
        <a href="https://yeschapter.com/trail-map" style="display: inline-block; background: #C45C26; color: #FFFFFF; padding: 12px 28px; text-decoration: none; font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 11px; letter-spacing: 2px;">VIEW TRAIL MAP &rarr;</a>
      </div>
      <!-- Increase Pledge CTA -->
      <div style="text-align: center; padding: 20px 32px; background: #FFFFFF; border-top: 1px solid #EBE8E3;">
        <p style="font-size: 13px; color: #5C5C5C; margin: 0 0 10px;">Feeling inspired? Every extra cent per mile adds up over 2,650 miles.</p>
        <a href="https://yeschapter.com/my-pledge" style="display: inline-block; background: #3D7A5A; color: #FFFFFF; padding: 12px 28px; text-decoration: none; font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 11px; letter-spacing: 2px;">INCREASE MY PLEDGE &rarr;</a>
        <div style="margin-top: 10px;">
          <a href="${SITE}/join" style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 11px; color: #C45C26; text-decoration: none;">Know someone who&rsquo;d pledge? Share the link &rarr;</a>
        </div>
      </div>
      <!-- Footer -->
      <div style="text-align: center; padding: 20px 32px; background: #1C1F1A;">
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 3px; color: #FFFFFF88;">YESCHAPTER</div>
        <p style="font-size: 11px; color: #FFFFFF66; margin: 10px 0; line-height: 1.6;">You're receiving this because you pledged to walk with Paul. Your pledge: ${rateFormatted} &middot; Total so far: $${totalFormatted}</p>
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 500; font-size: 10px; color: #FFFFFF44;">
          <a href="https://yeschapter.com/my-pledge" style="color: #FFFFFF44; text-decoration: none;">View My Pledge</a> &middot;
          <a href="https://yeschapter.com" style="color: #FFFFFF44; text-decoration: none;">yeschapter.com</a>
        </div>
      </div>
    </div>
    `
  );
}

export async function sendMilestoneReached(
  email: string,
  name: string,
  milestoneName: string,
  milestoneDescription: string,
  pledgeRate: number,
  pledgeInterval: number,
  milesWalked: number,
  pledgerCount: number,
  totalPledgedAll: number,
  countryCount: number
): Promise<SendResult> {
  const pledgeTotal = pledgeRate * Math.floor(milesWalked / pledgeInterval);
  const halfTotal = (pledgeTotal / 2).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const totalFormatted = pledgeTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const rateFormatted = `$${pledgeRate}/${pledgeInterval === 1 ? "mi" : pledgeInterval + "mi"}`;
  const percent = Math.min(100, Math.round((milesWalked / 2650) * 100));
  const totalPledgedFormatted = totalPledgedAll.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return send(
    email,
    `${milestoneName}! Your pledge is now $${totalFormatted}`,
    `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1C1C1C;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 28px; background: #1C1F1A;">
        <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 3px; color: #FFFFFF;">YESCHAPTER</span>
        <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 9px; letter-spacing: 2px; color: #FFFFFF66;">WALKING FOR CANCER</span>
      </div>
      <!-- Hero -->
      <div style="text-align: center; padding: 40px 32px; background: #C45C26;">
        <div style="font-size: 36px; margin-bottom: 12px;">&#9968;</div>
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 3px; color: #FFFFFF; background: #FFFFFF22; display: inline-block; padding: 5px 14px; margin-bottom: 12px;">MILESTONE REACHED</div>
        <h2 style="margin: 0 0 8px; font-size: 26px; color: #FFFFFF;">${milestoneName}</h2>
        <p style="margin: 0; font-size: 12px; color: #FFFFFFCC; line-height: 1.6; max-width: 380px; margin: 0 auto;">
          ${milestoneDescription}
        </p>
        <div style="width: 50px; height: 2px; background: #FFFFFF44; margin: 16px auto 0;"></div>
      </div>
      <!-- Pledge Total -->
      <div style="text-align: center; padding: 28px 32px; background: #FFFFFF;">
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 3px; color: #8C8A87;">YOUR PLEDGE IS NOW</div>
        <div style="font-size: 48px; font-weight: 600; letter-spacing: -1px; color: #C45C26; margin: 6px 0;">$${totalFormatted}</div>
        <div style="font-size: 12px; color: #5C5C5C;">${rateFormatted} &times; ${milesWalked.toLocaleString()} miles = $${totalFormatted} pledged so far</div>
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 500; font-size: 10px; color: #8C8A87; margin-top: 4px;">$${halfTotal} to City of Hope &middot; $${halfTotal} to Leukaemia Foundation</div>
      </div>
      <!-- Progress Bar -->
      <div style="padding: 18px 32px; background: #FFFFFF;">
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 2px; color: #8C8A87; margin-bottom: 8px;">TRAIL PROGRESS &mdash; ${percent}% COMPLETE</div>
        <div style="width: 100%; height: 10px; background: #EBE8E3; border-radius: 5px; overflow: hidden;">
          <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, #3D7A5A, #C45C26); border-radius: 5px;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 6px;">
          <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-size: 9px; letter-spacing: 1px; color: #8C8A87;">Mexico</span>
          <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 9px; letter-spacing: 1px; color: #C45C26;">${percent}% complete</span>
          <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-size: 9px; letter-spacing: 1px; color: #8C8A87;">Canada</span>
        </div>
      </div>
      <!-- Community Stats -->
      <div style="text-align: center; padding: 24px 32px; background: #F4F1EC;">
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 3px; color: #8C8A87; margin-bottom: 14px;">THE YESCHAPTER COMMUNITY</div>
        <div style="display: flex; justify-content: center; gap: 36px;">
          <div>
            <div style="font-size: 20px; font-weight: 600; color: #3D7A5A;">${pledgerCount.toLocaleString()}</div>
            <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 500; font-size: 10px; color: #8C8A87;">pledgers</div>
          </div>
          <div>
            <div style="font-size: 20px; font-weight: 600; color: #C45C26;">${totalPledgedFormatted}</div>
            <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 500; font-size: 10px; color: #8C8A87;">total pledged</div>
          </div>
          <div>
            <div style="font-size: 20px; font-weight: 600; color: #1C1C1C;">${countryCount}</div>
            <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 500; font-size: 10px; color: #8C8A87;">countries</div>
          </div>
        </div>
      </div>
      <!-- CTA -->
      <div style="text-align: center; padding: 24px 32px; background: #FFFFFF;">
        <a href="https://yeschapter.com/trail-map" style="display: inline-block; background: #C45C26; color: #FFFFFF; padding: 12px 28px; text-decoration: none; font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 11px; letter-spacing: 2px;">SEE PAUL'S LOCATION ON THE MAP &rarr;</a>
      </div>
      <!-- Increase & Share CTAs -->
      <div style="text-align: center; padding: 20px 32px; background: #F4F1EC;">
        <p style="font-size: 14px; color: #1C1C1C; margin: 0 0 12px; font-weight: 600;">Double down on this milestone?</p>
        <p style="font-size: 13px; color: #5C5C5C; margin: 0 0 14px;">Even an extra penny per mile adds $26.50 to the fight against cancer.</p>
        <a href="https://yeschapter.com/my-pledge" style="display: inline-block; background: #3D7A5A; color: #FFFFFF; padding: 12px 28px; text-decoration: none; font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 11px; letter-spacing: 2px;">INCREASE MY PLEDGE &rarr;</a>
        <div style="margin-top: 12px;">
          <a href="${SITE}/join" style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 11px; color: #C45C26; text-decoration: none;">Share this milestone with friends &rarr;</a>
        </div>
      </div>
      <!-- Footer -->
      <div style="text-align: center; padding: 20px 32px; background: #1C1F1A;">
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 3px; color: #FFFFFF88;">YESCHAPTER</div>
        <p style="font-size: 11px; color: #FFFFFF66; margin: 10px 0; line-height: 1.6;">You're receiving this because you pledged to walk with Paul.</p>
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 500; font-size: 10px; color: #FFFFFF44;">
          <a href="https://yeschapter.com/my-pledge" style="color: #FFFFFF44; text-decoration: none;">View My Pledge</a> &middot;
          <a href="https://yeschapter.com" style="color: #FFFFFF44; text-decoration: none;">yeschapter.com</a>
        </div>
      </div>
    </div>
    `
  );
}

export async function sendPledgeIncreased(
  email: string,
  name: string,
  oldAmount: number,
  newAmount: number,
  newRate: string,
  newTotalPledge: number
): Promise<SendResult> {
  const oldRate = `$${oldAmount.toFixed(2)}/mi`;
  const totalFormatted = newTotalPledge.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const halfTotal = (newTotalPledge / 2).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const addedPerMile = (newAmount - oldAmount).toFixed(2);

  return send(
    email,
    `Pledge increased! You're now at ${newRate} 🚀`,
    `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1C1C1C;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 28px; background: #1C1F1A;">
        <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 3px; color: #FFFFFF;">YESCHAPTER</span>
        <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 9px; letter-spacing: 2px; color: #FFFFFF66;">WALKING FOR CANCER</span>
      </div>
      <div style="text-align: center; padding: 36px 32px; background: #3D7A5A;">
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 2px; color: #FFFFFF; background: #FFFFFF22; display: inline-block; padding: 5px 14px;">PLEDGE INCREASED</div>
        <h2 style="margin: 12px 0 0; font-size: 24px; color: #FFFFFF;">Nice one, ${name}!</h2>
        <p style="margin: 8px 0 0; font-size: 13px; color: #FFFFFFCC;">You just upped your commitment to the fight against cancer.</p>
      </div>
      <div style="text-align: center; padding: 28px 32px; background: #FFFFFF;">
        <div style="display: flex; justify-content: center; gap: 24px; align-items: center;">
          <div>
            <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 9px; letter-spacing: 2px; color: #8C8A87;">WAS</div>
            <div style="font-size: 22px; font-weight: 600; color: #8C8A87; text-decoration: line-through;">${oldRate}</div>
          </div>
          <div style="font-size: 24px; color: #3D7A5A;">&rarr;</div>
          <div>
            <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 9px; letter-spacing: 2px; color: #3D7A5A;">NOW</div>
            <div style="font-size: 28px; font-weight: 600; color: #3D7A5A;">${newRate}</div>
          </div>
        </div>
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 12px; color: #3D7A5A; margin-top: 12px;">+$${addedPerMile}/mi &times; 2,650 miles = +$${(parseFloat(addedPerMile) * 2650).toFixed(2)} more for cancer research</div>
      </div>
      <div style="text-align: center; padding: 24px 32px; background: #F4F1EC;">
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 3px; color: #8C8A87; margin-bottom: 6px;">NEW TOTAL IF PAUL FINISHES</div>
        <div style="font-size: 44px; font-weight: 600; letter-spacing: -1px; color: #C45C26;">${totalFormatted}</div>
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 500; font-size: 10px; color: #8C8A87; margin-top: 4px;">$${halfTotal} to City of Hope &middot; $${halfTotal} to Leukaemia Foundation</div>
      </div>
      <div style="text-align: center; padding: 20px 32px; background: #FFFFFF;">
        <p style="font-size: 13px; color: #5C5C5C; margin: 0 0 10px;">Know someone who&rsquo;d walk alongside Paul (from their couch)?</p>
        <a href="${SITE}/join" style="display: inline-block; background: #C45C26; color: #FFFFFF; padding: 12px 28px; text-decoration: none; font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 11px; letter-spacing: 2px;">SHARE THE PLEDGE LINK &rarr;</a>
      </div>
      <div style="text-align: center; padding: 20px 32px; background: #1C1F1A;">
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 3px; color: #FFFFFF88;">YESCHAPTER</div>
        <p style="font-size: 11px; color: #FFFFFF66; margin: 10px 0;">Paul gets $0 from pledges — every cent goes directly to cancer foundations.</p>
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 500; font-size: 10px; color: #FFFFFF44;">
          <a href="https://yeschapter.com/my-pledge" style="color: #FFFFFF44; text-decoration: none;">View My Pledge</a> &middot;
          <a href="https://yeschapter.com" style="color: #FFFFFF44; text-decoration: none;">yeschapter.com</a>
        </div>
      </div>
    </div>
    `
  );
}

export async function sendPreMilestoneNudge(
  email: string,
  name: string,
  milestoneName: string,
  milestoneMiles: number,
  currentMiles: number,
  pledgeRate: number,
  pledgeInterval: number,
  pledgerCount: number
): Promise<SendResult> {
  const milesLeft = milestoneMiles - currentMiles;
  const runningTotal = pledgeRate * Math.floor(currentMiles / pledgeInterval);
  const projectedTotal = pledgeRate * Math.floor(milestoneMiles / pledgeInterval);
  const runningFormatted = runningTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const projectedFormatted = projectedTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const rateFormatted = `$${pledgeRate}/${pledgeInterval === 1 ? "mi" : pledgeInterval + "mi"}`;
  const percent = Math.min(100, Math.round((currentMiles / 2650) * 100));

  return send(
    email,
    `Paul is ${Math.round(milesLeft)} miles from ${milestoneName}`,
    `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1C1C1C;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 28px; background: #1C1F1A;">
        <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 3px; color: #FFFFFF;">YESCHAPTER</span>
        <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 9px; letter-spacing: 2px; color: #FFFFFF66;">WALKING FOR CANCER</span>
      </div>
      <div style="text-align: center; padding: 36px 32px; background: #1C1F1A;">
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 2px; color: #FFFFFF; background: #C45C26; display: inline-block; padding: 5px 14px;">MILESTONE APPROACHING</div>
        <h2 style="margin: 12px 0 0; font-size: 24px; color: #FFFFFF;">Paul is ${Math.round(milesLeft)} miles from ${milestoneName}</h2>
        <p style="margin: 8px 0 0; font-size: 13px; color: #FFFFFFAA;">Mile ${currentMiles.toLocaleString()} of 2,650 &mdash; ${percent}% complete</p>
      </div>
      <!-- Pledge preview -->
      <div style="text-align: center; padding: 28px 32px; background: #FFFFFF;">
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 3px; color: #8C8A87;">YOUR PLEDGE SO FAR</div>
        <div style="font-size: 40px; font-weight: 600; letter-spacing: -1px; color: #C45C26; margin: 6px 0;">$${runningFormatted}</div>
        <div style="font-size: 12px; color: #5C5C5C;">${rateFormatted} &times; ${currentMiles.toLocaleString()} miles walked</div>
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 12px; color: #3D7A5A; margin-top: 12px;">At mile ${milestoneMiles.toLocaleString()}, your pledge will be $${projectedFormatted}</div>
      </div>
      <!-- Nudge CTA -->
      <div style="text-align: center; padding: 24px 32px; background: #F4F1EC;">
        <p style="font-size: 14px; color: #1C1C1C; margin: 0 0 8px; font-weight: 600;">Want to increase before Paul gets there?</p>
        <p style="font-size: 13px; color: #5C5C5C; margin: 0 0 14px;">Even an extra penny per mile adds $26.50 to the fight against cancer.</p>
        <a href="https://yeschapter.com/my-pledge" style="display: inline-block; background: #3D7A5A; color: #FFFFFF; padding: 12px 28px; text-decoration: none; font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 11px; letter-spacing: 2px;">INCREASE MY PLEDGE &rarr;</a>
        <div style="margin-top: 12px;">
          <a href="${SITE}/join" style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 11px; color: #C45C26; text-decoration: none;">Share with a friend &rarr;</a>
        </div>
      </div>
      <!-- Community -->
      <div style="text-align: center; padding: 16px 32px; background: #FFFFFF;">
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 12px; color: #8C8A87;">${pledgerCount.toLocaleString()} pledgers are walking alongside Paul</div>
      </div>
      <!-- Footer -->
      <div style="text-align: center; padding: 20px 32px; background: #1C1F1A;">
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 3px; color: #FFFFFF88;">YESCHAPTER</div>
        <p style="font-size: 11px; color: #FFFFFF66; margin: 10px 0;">You're receiving this because you pledged to walk with Paul.</p>
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 500; font-size: 10px; color: #FFFFFF44;">
          <a href="https://yeschapter.com/my-pledge" style="color: #FFFFFF44; text-decoration: none;">View My Pledge</a> &middot;
          <a href="https://yeschapter.com" style="color: #FFFFFF44; text-decoration: none;">yeschapter.com</a>
        </div>
      </div>
    </div>
    `
  );
}

export async function sendNearFinish(
  email: string,
  name: string,
  variant: "200mi" | "100mi" | "finish",
  pledgeRate: number,
  pledgeInterval: number,
  currentMiles: number,
  finalTotal: number,
  pledgerCount: number,
  totalPledgedAll: number
): Promise<SendResult> {
  const runningTotal = pledgeRate * Math.floor(currentMiles / pledgeInterval);
  const runningFormatted = runningTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const finalFormatted = finalTotal.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const halfFinal = (finalTotal / 2).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const totalPledgedFormatted = totalPledgedAll.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const rateFormatted = `$${pledgeRate}/${pledgeInterval === 1 ? "mi" : pledgeInterval + "mi"}`;

  if (variant === "200mi") {
    return send(
      email,
      `200 miles to go — Paul enters Washington!`,
      `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1C1C1C;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 28px; background: #1C1F1A;">
          <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 3px; color: #FFFFFF;">YESCHAPTER</span>
          <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 9px; letter-spacing: 2px; color: #FFFFFF66;">WALKING FOR CANCER</span>
        </div>
        <div style="text-align: center; padding: 40px 32px; background: linear-gradient(135deg, #1C1F1A, #3D7A5A);">
          <div style="font-size: 48px; margin-bottom: 8px;">&#9968;</div>
          <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 3px; color: #FFFFFF; background: #C45C26; display: inline-block; padding: 5px 14px;">THE FINAL STRETCH</div>
          <h2 style="margin: 12px 0 0; font-size: 26px; color: #FFFFFF;">200 Miles to Canada</h2>
          <p style="margin: 8px 0 0; font-size: 13px; color: #FFFFFFCC; line-height: 1.6; max-width: 400px; margin: 8px auto 0;">
            ${name}, Paul just entered Washington — the final state. Your pledge is almost fully earned.
          </p>
        </div>
        <div style="text-align: center; padding: 28px 32px; background: #FFFFFF;">
          <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 3px; color: #8C8A87;">YOUR PLEDGE SO FAR</div>
          <div style="font-size: 40px; font-weight: 600; letter-spacing: -1px; color: #C45C26; margin: 6px 0;">$${runningFormatted}</div>
          <div style="font-size: 12px; color: #5C5C5C;">If Paul finishes: ${finalFormatted}</div>
        </div>
        <div style="text-align: center; padding: 24px 32px; background: #F4F1EC;">
          <p style="font-size: 14px; color: #1C1C1C; margin: 0 0 12px; font-weight: 600;">Last chance to increase before the finish line</p>
          <a href="https://yeschapter.com/my-pledge" style="display: inline-block; background: #3D7A5A; color: #FFFFFF; padding: 12px 28px; text-decoration: none; font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 11px; letter-spacing: 2px;">INCREASE MY PLEDGE &rarr;</a>
          <div style="margin-top: 12px;">
            <a href="${SITE}/join" style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 11px; color: #C45C26; text-decoration: none;">Share with a friend for the final push &rarr;</a>
          </div>
        </div>
        <div style="text-align: center; padding: 20px 32px; background: #1C1F1A;">
          <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 3px; color: #FFFFFF88;">YESCHAPTER</div>
          <p style="font-size: 11px; color: #FFFFFF66; margin: 10px 0;">Your pledge: ${rateFormatted}</p>
          <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 500; font-size: 10px; color: #FFFFFF44;">
            <a href="https://yeschapter.com/my-pledge" style="color: #FFFFFF44; text-decoration: none;">View My Pledge</a> &middot;
            <a href="https://yeschapter.com" style="color: #FFFFFF44; text-decoration: none;">yeschapter.com</a>
          </div>
        </div>
      </div>
      `
    );
  }

  if (variant === "100mi") {
    return send(
      email,
      `100 miles to go — the final push!`,
      `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1C1C1C;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 28px; background: #1C1F1A;">
          <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 3px; color: #FFFFFF;">YESCHAPTER</span>
          <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 9px; letter-spacing: 2px; color: #FFFFFF66;">WALKING FOR CANCER</span>
        </div>
        <div style="text-align: center; padding: 40px 32px; background: #C45C26;">
          <div style="font-size: 48px; margin-bottom: 8px;">&#127939;</div>
          <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 3px; color: #FFFFFF; background: #FFFFFF22; display: inline-block; padding: 5px 14px;">100 MILES TO GO</div>
          <h2 style="margin: 12px 0 0; font-size: 26px; color: #FFFFFF;">The Final Push</h2>
          <p style="margin: 8px 0 0; font-size: 13px; color: #FFFFFFCC; line-height: 1.6; max-width: 400px; margin: 8px auto 0;">
            ${name}, Paul has walked 2,550 miles. Just 100 remain. The Canadian border is calling.
          </p>
        </div>
        <div style="text-align: center; padding: 28px 32px; background: #FFFFFF;">
          <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 3px; color: #8C8A87;">YOUR PLEDGE SO FAR</div>
          <div style="font-size: 40px; font-weight: 600; letter-spacing: -1px; color: #C45C26; margin: 6px 0;">$${runningFormatted}</div>
          <div style="font-size: 13px; color: #5C5C5C; line-height: 1.6;">
            When Paul finishes, your total pledge of <strong>${finalFormatted}</strong> will go directly to the foundations:<br/>
            $${halfFinal} to City of Hope &middot; $${halfFinal} to Leukaemia Foundation
          </div>
        </div>
        <div style="text-align: center; padding: 24px 32px; background: #F4F1EC;">
          <p style="font-size: 14px; color: #1C1C1C; margin: 0 0 8px; font-weight: 600;">What happens when Paul finishes?</p>
          <p style="font-size: 13px; color: #5C5C5C; margin: 0 0 14px; line-height: 1.6;">
            You&rsquo;ll receive an email with direct links to both foundations. You honor your pledge by donating directly to them — Paul never touches the money.
          </p>
          <a href="https://yeschapter.com/my-pledge" style="display: inline-block; background: #3D7A5A; color: #FFFFFF; padding: 12px 28px; text-decoration: none; font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 11px; letter-spacing: 2px;">VIEW MY PLEDGE &rarr;</a>
        </div>
        <div style="text-align: center; padding: 16px 32px; background: #FFFFFF;">
          <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 12px; color: #3D7A5A;">${pledgerCount.toLocaleString()} pledgers &middot; ${totalPledgedFormatted} total pledged</div>
        </div>
        <div style="text-align: center; padding: 20px 32px; background: #1C1F1A;">
          <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 3px; color: #FFFFFF88;">YESCHAPTER</div>
          <p style="font-size: 11px; color: #FFFFFF66; margin: 10px 0;">Your pledge: ${rateFormatted}</p>
          <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 500; font-size: 10px; color: #FFFFFF44;">
            <a href="https://yeschapter.com/my-pledge" style="color: #FFFFFF44; text-decoration: none;">View My Pledge</a> &middot;
            <a href="https://yeschapter.com" style="color: #FFFFFF44; text-decoration: none;">yeschapter.com</a>
          </div>
        </div>
      </div>
      `
    );
  }

  // variant === "finish"
  return send(
    email,
    `Paul made it to Canada! 🏔️ Your pledge: ${finalFormatted}`,
    `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1C1C1C;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 28px; background: #1C1F1A;">
        <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 3px; color: #FFFFFF;">YESCHAPTER</span>
        <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 9px; letter-spacing: 2px; color: #FFFFFF66;">WALKING FOR CANCER</span>
      </div>
      <div style="text-align: center; padding: 48px 32px; background: linear-gradient(135deg, #3D7A5A, #C45C26);">
        <div style="font-size: 64px; margin-bottom: 12px;">&#127881;</div>
        <h2 style="margin: 0 0 8px; font-size: 30px; color: #FFFFFF;">Paul Made It to Canada!</h2>
        <p style="margin: 0; font-size: 14px; color: #FFFFFFDD; line-height: 1.6; max-width: 420px; margin: 0 auto;">
          2,650 miles. Mexico to Canada. Every single step for cancer research, patient support, and prevention.
        </p>
      </div>
      <div style="text-align: center; padding: 32px; background: #FFFFFF;">
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 3px; color: #8C8A87;">YOUR FINAL PLEDGE</div>
        <div style="font-size: 52px; font-weight: 600; letter-spacing: -1px; color: #C45C26; margin: 8px 0;">${finalFormatted}</div>
        <div style="font-size: 13px; color: #5C5C5C;">${rateFormatted} &times; 2,650 miles</div>
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 500; font-size: 11px; color: #8C8A87; margin-top: 8px;">$${halfFinal} to City of Hope &middot; $${halfFinal} to Leukaemia Foundation</div>
      </div>
      <div style="text-align: center; padding: 32px; background: #3D7A5A;">
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 3px; color: #FFFFFF; margin-bottom: 12px;">HONOR YOUR PLEDGE</div>
        <p style="font-size: 14px; color: #FFFFFFDD; margin: 0 0 16px; line-height: 1.6;">
          ${name}, it&rsquo;s time to honor your pledge. Donate directly to the cancer foundations &mdash; Paul never touches the money.
        </p>
        <a href="https://yeschapter.com/honor" style="display: inline-block; background: #C45C26; color: #FFFFFF; padding: 14px 36px; text-decoration: none; font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 2px;">HONOR MY PLEDGE &rarr;</a>
        <p style="font-size: 11px; color: #FFFFFF88; margin: 12px 0 0;">You&rsquo;ll see your personalized pledge summary with direct donation links to both foundations.</p>
      </div>
      <div style="text-align: center; padding: 20px 32px; background: #F4F1EC;">
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 12px; color: #3D7A5A;">${pledgerCount.toLocaleString()} pledgers &middot; ${totalPledgedFormatted} total pledged</div>
      </div>
      <div style="text-align: center; padding: 20px 32px; background: #1C1F1A;">
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 3px; color: #FFFFFF88;">YESCHAPTER</div>
        <p style="font-size: 11px; color: #FFFFFF66; margin: 10px 0;">Thank you for walking alongside Paul, ${name}. Together, we made a difference.</p>
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 500; font-size: 10px; color: #FFFFFF44;">
          <a href="https://yeschapter.com/my-pledge" style="color: #FFFFFF44; text-decoration: none;">View My Pledge</a> &middot;
          <a href="https://yeschapter.com" style="color: #FFFFFF44; text-decoration: none;">yeschapter.com</a>
        </div>
      </div>
    </div>
    `
  );
}

export async function sendHonorReminder(
  email: string,
  name: string,
  variant: "day5" | "day14",
  finalTotal: number,
  pledgeRate: number,
  pledgeInterval: number,
  honoredCount: number,
  pledgerCount: number
): Promise<SendResult> {
  const finalFormatted = finalTotal.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const halfTotal = (finalTotal / 2).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const honorRate = pledgerCount > 0 ? Math.round((honoredCount / pledgerCount) * 100) : 0;

  if (variant === "day5") {
    return send(
      email,
      `Your pledge of ${finalFormatted} is waiting — honor it today`,
      `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1C1C1C;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 28px; background: #1C1F1A;">
          <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 3px; color: #FFFFFF;">YESCHAPTER</span>
          <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 9px; letter-spacing: 2px; color: #FFFFFF66;">WALKING FOR CANCER</span>
        </div>
        <div style="text-align: center; padding: 36px 32px; background: #3D7A5A;">
          <h2 style="margin: 0 0 8px; font-size: 24px; color: #FFFFFF;">Hey ${name},</h2>
          <p style="margin: 0; font-size: 14px; color: #FFFFFFCC; line-height: 1.6; max-width: 400px; margin: 0 auto;">
            Paul walked 2,650 miles for cancer. Your pledge of <strong style="color: #FFFFFF;">${finalFormatted}</strong> is ready to be honored.
          </p>
        </div>
        <div style="text-align: center; padding: 28px 32px; background: #FFFFFF;">
          <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 3px; color: #8C8A87;">YOUR PLEDGE</div>
          <div style="font-size: 44px; font-weight: 600; letter-spacing: -1px; color: #C45C26; margin: 6px 0;">${finalFormatted}</div>
          <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 500; font-size: 11px; color: #8C8A87; margin-top: 4px;">$${halfTotal} to City of Hope &middot; $${halfTotal} to Leukaemia Foundation</div>
        </div>
        <div style="text-align: center; padding: 24px 32px; background: #F4F1EC;">
          <p style="font-size: 13px; color: #5C5C5C; margin: 0 0 14px;">${honoredCount} of ${pledgerCount} pledgers have already honored (${honorRate}%)</p>
          <a href="https://yeschapter.com/honor" style="display: inline-block; background: #3D7A5A; color: #FFFFFF; padding: 14px 36px; text-decoration: none; font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 2px;">HONOR MY PLEDGE &rarr;</a>
        </div>
        <div style="text-align: center; padding: 20px 32px; background: #1C1F1A;">
          <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 3px; color: #FFFFFF88;">YESCHAPTER</div>
          <p style="font-size: 11px; color: #FFFFFF66; margin: 10px 0;">Paul gets $0 — every cent goes directly to cancer foundations.</p>
          <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 500; font-size: 10px; color: #FFFFFF44;">
            <a href="https://yeschapter.com/honor" style="color: #FFFFFF44; text-decoration: none;">Honor My Pledge</a> &middot;
            <a href="https://yeschapter.com" style="color: #FFFFFF44; text-decoration: none;">yeschapter.com</a>
          </div>
        </div>
      </div>
      `
    );
  }

  // variant === "day14"
  return send(
    email,
    `Last call — your ${finalFormatted} pledge for cancer research`,
    `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1C1C1C;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 28px; background: #1C1F1A;">
        <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 3px; color: #FFFFFF;">YESCHAPTER</span>
        <span style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 600; font-size: 9px; letter-spacing: 2px; color: #FFFFFF66;">WALKING FOR CANCER</span>
      </div>
      <div style="text-align: center; padding: 36px 32px; background: #C45C26;">
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 3px; color: #FFFFFF; background: #FFFFFF22; display: inline-block; padding: 5px 14px; margin-bottom: 12px;">FINAL REMINDER</div>
        <h2 style="margin: 0 0 8px; font-size: 24px; color: #FFFFFF;">Your pledge is still waiting</h2>
        <p style="margin: 0; font-size: 14px; color: #FFFFFFCC; line-height: 1.6; max-width: 400px; margin: 0 auto;">
          ${name}, ${honorRate}% of pledgers have already honored. Every dollar goes directly to cancer research — Paul takes nothing.
        </p>
      </div>
      <div style="text-align: center; padding: 28px 32px; background: #FFFFFF;">
        <div style="font-size: 44px; font-weight: 600; letter-spacing: -1px; color: #C45C26; margin: 6px 0;">${finalFormatted}</div>
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 500; font-size: 11px; color: #8C8A87; margin-top: 4px;">$${halfTotal} to City of Hope &middot; $${halfTotal} to Leukaemia Foundation</div>
      </div>
      <div style="text-align: center; padding: 24px 32px; background: #3D7A5A;">
        <a href="https://yeschapter.com/honor" style="display: inline-block; background: #C45C26; color: #FFFFFF; padding: 14px 36px; text-decoration: none; font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 2px;">HONOR MY PLEDGE NOW &rarr;</a>
        <p style="font-size: 12px; color: #FFFFFFAA; margin: 12px 0 0;">Takes 2 minutes — donate directly to both foundations.</p>
      </div>
      <div style="text-align: center; padding: 20px 32px; background: #1C1F1A;">
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 3px; color: #FFFFFF88;">YESCHAPTER</div>
        <p style="font-size: 11px; color: #FFFFFF66; margin: 10px 0;">This is our final reminder. Thank you for being part of the YesChapter community.</p>
        <div style="font-family: 'Barlow Semi Condensed', sans-serif; font-weight: 500; font-size: 10px; color: #FFFFFF44;">
          <a href="https://yeschapter.com/honor" style="color: #FFFFFF44; text-decoration: none;">Honor My Pledge</a> &middot;
          <a href="https://yeschapter.com" style="color: #FFFFFF44; text-decoration: none;">yeschapter.com</a>
        </div>
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
          YESCHAPTER · PCT 2026
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
              Visit yeschapter.com to commit a boost. If Paul succeeds, your
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
          YESCHAPTER · PCT 2026
        </h1>
      </div>
      <div style="padding: 32px;">
        ${body}
        <p style="font-size: 14px; color: #5C5C5C; margin-top: 24px;">
          View your pledge: <strong>yeschapter.com/my-pledge</strong>
        </p>
        <p style="font-size: 14px; color: #8C8A87; margin-top: 24px;">
          You're receiving this because you pledged to Paul's PCT walk.
        </p>
      </div>
    </div>
    `
  );
}

// --- Welcome Drip (Gap 7) ---

export async function sendWelcomeDay1(
  email: string,
  name: string,
  rate: string,
  totalPledge: number,
  pledgerCount: number,
  unsubscribeToken?: string
): Promise<SendResult> {
  const total = totalPledge.toLocaleString("en-US", { style: "currency", currency: "USD" });
  return send(
    email,
    "How to track Paul's progress 📍",
    `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1C1C1C;">
      <div style="background: #3D7A5A; padding: 24px 32px;">
        <h1 style="margin: 0; font-size: 20px; color: white; letter-spacing: 2px; font-family: sans-serif;">
          YESCHAPTER · PCT 2026
        </h1>
      </div>
      <div style="padding: 32px;">
        <h2 style="margin: 0 0 16px; font-size: 24px;">Welcome aboard, ${name}!</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #5C5C5C;">
          You pledged <strong style="color: #C45C26;">${rate}</strong> — that's
          <strong>${total}</strong> if Paul completes all 2,650 miles.
          Here's how to stay in the loop:
        </p>
        <div style="background: #F4F1EC; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 12px; font-size: 15px; font-weight: 700; color: #1C1C1C;">Your pledge dashboard</p>
          <p style="margin: 0; font-size: 14px; color: #5C5C5C; line-height: 1.6;">
            Bookmark <strong>yeschapter.com/my-pledge</strong> — enter your email anytime to see
            your running total, pledge history, and how much has been earned for cancer research so far.
          </p>
        </div>
        <div style="background: #E8F0EB; padding: 20px; margin: 0 0 24px;">
          <p style="margin: 0 0 12px; font-size: 15px; font-weight: 700; color: #1C1C1C;">Live trail map</p>
          <p style="margin: 0; font-size: 14px; color: #5C5C5C; line-height: 1.6;">
            Watch Paul move in real time at <strong>yeschapter.com/trail-map</strong> —
            see his GPS position, elevation, and the pledger map showing where supporters are from.
          </p>
        </div>
        <p style="font-size: 14px; color: #5C5C5C; line-height: 1.6;">
          You're now one of <strong style="color: #3D7A5A;">${pledgerCount.toLocaleString()} people</strong> walking with Paul.
          Every Monday, you'll receive a progress update with Paul's miles, your running total, and a journal excerpt.
        </p>
        <div style="text-align: center; margin-top: 28px;">
          <a href="${SITE}/my-pledge" style="display: inline-block; background: #3D7A5A; color: #FFFFFF; padding: 14px 32px; text-decoration: none; font-family: sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 2px;">VIEW MY PLEDGE DASHBOARD</a>
        </div>
      </div>
      ${emailFooter(unsubscribeToken)}
    </div>
    `
  );
}

export async function sendWelcomeDay3(
  email: string,
  name: string,
  pledgerCount: number,
  unsubscribeToken?: string
): Promise<SendResult> {
  const shareLink = shareUrl(name);
  return send(
    email,
    `${name}, bring a friend along 🤝`,
    `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1C1C1C;">
      <div style="background: #3D7A5A; padding: 24px 32px;">
        <h1 style="margin: 0; font-size: 20px; color: white; letter-spacing: 2px; font-family: sans-serif;">
          YESCHAPTER · PCT 2026
        </h1>
      </div>
      <div style="padding: 32px;">
        <h2 style="margin: 0 0 16px; font-size: 24px;">Know someone who'd care?</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #5C5C5C;">
          ${name}, you're part of a community of <strong style="color: #3D7A5A;">${pledgerCount.toLocaleString()} pledgers</strong>
          walking with Paul. Every new person who joins makes the impact bigger.
        </p>
        <div style="background: #FEF3EC; padding: 24px; margin: 24px 0; text-align: center;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #C45C26; font-weight: 700; font-family: sans-serif; letter-spacing: 2px;">SHARE YOUR PLEDGE</p>
          <p style="margin: 0 0 16px; font-size: 14px; color: #5C5C5C;">
            Share this link with a friend, colleague, or on social media:
          </p>
          <a href="${shareLink}" style="display: inline-block; background: #C45C26; color: #FFFFFF; padding: 14px 32px; text-decoration: none; font-family: sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 2px;">SHARE WITH A FRIEND &rarr;</a>
        </div>
        <p style="font-size: 14px; color: #5C5C5C; line-height: 1.6;">
          Already want to do more? You can
          <a href="${SITE}/my-pledge" style="color: #C45C26; font-weight: 700;">increase your pledge</a>
          anytime from your dashboard.
        </p>
      </div>
      ${emailFooter(unsubscribeToken)}
    </div>
    `
  );
}

// --- Honor Confirmation (Gap 9) ---

export async function sendHonorConfirmation(
  email: string,
  name: string,
  totalPledge: number,
  honoredCount: number,
  pledgerCount: number,
  honorRate: number,
  unsubscribeToken?: string
): Promise<SendResult> {
  const total = totalPledge.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const half = (totalPledge / 2).toLocaleString("en-US", { style: "currency", currency: "USD" });
  const shareLink = shareUrl(name);
  return send(
    email,
    "Thank you for honoring your pledge 💚",
    `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1C1C1C;">
      <div style="background: #3D7A5A; padding: 24px 32px;">
        <h1 style="margin: 0; font-size: 20px; color: white; letter-spacing: 2px; font-family: sans-serif;">
          YESCHAPTER · PCT 2026
        </h1>
      </div>
      <div style="background: #3D7A5A; padding: 32px 32px 40px; text-align: center;">
        <p style="margin: 0 0 12px; font-size: 11px; letter-spacing: 3px; font-family: sans-serif; font-weight: 700; color: #FFFFFF88;">PLEDGE HONORED</p>
        <h2 style="margin: 0 0 8px; font-size: 28px; color: white;">Thank you, ${name}.</h2>
        <p style="margin: 0; font-size: 16px; color: #FFFFFFCC; line-height: 1.6;">
          You honored your ${total} pledge.
        </p>
      </div>
      <div style="padding: 32px;">
        <div style="background: #F4F1EC; padding: 20px; margin: 0 0 24px;">
          <p style="margin: 0 0 6px; font-size: 11px; letter-spacing: 2px; font-family: sans-serif; font-weight: 700; color: #8C8A87;">YOUR DONATION SUMMARY</p>
          <p style="margin: 0; font-size: 14px; color: #5C5C5C; line-height: 1.8;">
            ${half} → City of Hope<br/>
            ${half} → Leukaemia Foundation<br/>
            <strong style="color: #1C1C1C;">${total} total to cancer research</strong>
          </p>
        </div>
        <p style="font-size: 15px; line-height: 1.6; color: #5C5C5C;">
          You're one of <strong style="color: #3D7A5A;">${honoredCount}</strong> pledgers
          who've honored so far — that's <strong style="color: #3D7A5A;">${honorRate}%</strong> of all
          ${pledgerCount.toLocaleString()} pledgers.
        </p>
        <p style="font-size: 14px; color: #8C8A87; line-height: 1.6; margin-top: 16px;">
          Paul never touches a cent. Every dollar goes directly to the foundations — exactly as promised.
        </p>
        <div style="text-align: center; margin-top: 28px;">
          <a href="${shareLink}" style="display: inline-block; background: #C45C26; color: #FFFFFF; padding: 14px 32px; text-decoration: none; font-family: sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 2px;">TELL A FRIEND WHAT YOU DID &rarr;</a>
          <p style="font-size: 12px; color: #8C8A87; margin-top: 10px;">Inspire someone else to join the walk.</p>
        </div>
      </div>
      ${emailFooter(unsubscribeToken)}
    </div>
    `
  );
}

// --- Community Milestone (Gap 8) ---

export async function sendCommunityMilestone(
  email: string,
  name: string,
  variant: "pledgers" | "total" | "countries",
  value: number,
  pledgerCount: number,
  totalPledged: number,
  unsubscribeToken?: string
): Promise<SendResult> {
  const titles: Record<string, string> = {
    pledgers: `We just hit ${value.toLocaleString()} pledgers! 🎉`,
    total: `$${value.toLocaleString()} total pledged!`,
    countries: `Pledgers from ${value} countries!`,
  };
  const headlines: Record<string, string> = {
    pledgers: `${value.toLocaleString()} People Walking With Paul`,
    total: `$${value.toLocaleString()} Pledged for Cancer Research`,
    countries: `${value} Countries United Against Cancer`,
  };
  const descriptions: Record<string, string> = {
    pledgers: `The YesChapter community just reached <strong>${value.toLocaleString()} pledgers</strong>. That's ${value.toLocaleString()} people who believe every mile matters.`,
    total: `Together, the community has pledged <strong>$${value.toLocaleString()}</strong> for cancer research and patient support — split equally between City of Hope and the Leukaemia Foundation.`,
    countries: `Pledgers from <strong>${value} countries</strong> are now walking with Paul. This started as one man's walk, and it's become a global movement.`,
  };
  const shareLink = shareUrl(name);
  const totalFormatted = totalPledged.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return send(
    email,
    titles[variant],
    `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1C1C1C;">
      <div style="background: #3D7A5A; padding: 24px 32px;">
        <h1 style="margin: 0; font-size: 20px; color: white; letter-spacing: 2px; font-family: sans-serif;">
          YESCHAPTER · PCT 2026
        </h1>
      </div>
      <div style="background: #C45C26; padding: 36px 32px; text-align: center;">
        <p style="margin: 0 0 8px; font-size: 11px; letter-spacing: 3px; font-family: sans-serif; font-weight: 700; color: #FFFFFF88;">COMMUNITY MILESTONE</p>
        <h2 style="margin: 0; font-size: 26px; color: white;">${headlines[variant]}</h2>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 16px; line-height: 1.6; color: #5C5C5C;">
          ${name}, ${descriptions[variant]}
        </p>
        <div style="display: flex; text-align: center; margin: 24px 0; padding: 20px; background: #F4F1EC;">
          <div style="flex: 1;">
            <p style="margin: 0; font-size: 22px; font-weight: 700; color: #3D7A5A;">${pledgerCount.toLocaleString()}</p>
            <p style="margin: 4px 0 0; font-size: 10px; letter-spacing: 2px; font-family: sans-serif; font-weight: 700; color: #8C8A87;">PLEDGERS</p>
          </div>
          <div style="flex: 1;">
            <p style="margin: 0; font-size: 22px; font-weight: 700; color: #C45C26;">$${totalFormatted}</p>
            <p style="margin: 4px 0 0; font-size: 10px; letter-spacing: 2px; font-family: sans-serif; font-weight: 700; color: #8C8A87;">TOTAL PLEDGED</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <a href="${SITE}/my-pledge" style="display: inline-block; background: #3D7A5A; color: #FFFFFF; padding: 14px 28px; text-decoration: none; font-family: sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 2px;">INCREASE MY PLEDGE</a>
        </div>
        <div style="text-align: center; margin-top: 12px;">
          <a href="${shareLink}" style="display: inline-block; background: #C45C26; color: #FFFFFF; padding: 14px 28px; text-decoration: none; font-family: sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 2px;">SHARE WITH A FRIEND &rarr;</a>
        </div>
      </div>
      ${emailFooter(unsubscribeToken)}
    </div>
    `
  );
}

export async function sendMagicLink(
  email: string,
  magicUrl: string,
  name?: string
): Promise<{ success: boolean; error?: string }> {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  return send(
    email,
    "Your YesChapter sign-in link",
    `
    <div style="background: #F4F1EC; font-family: Georgia, serif; padding: 0; margin: 0;">
      <div style="background: #1C1F1A; padding: 20px 32px; text-align: center;">
        <p style="margin: 0; font-size: 14px; letter-spacing: 3px; font-family: sans-serif; font-weight: 700; color: #3D7A5A;">YESCHAPTER</p>
      </div>
      <div style="padding: 48px 32px; max-width: 560px; margin: 0 auto; background: #FFFFFF;">
        <p style="font-size: 12px; letter-spacing: 3px; font-family: sans-serif; font-weight: 700; color: #8C8A87; margin: 0 0 16px;">MAGIC SIGN-IN LINK</p>
        <h2 style="font-size: 32px; font-weight: 600; color: #1C1C1C; margin: 0 0 16px; letter-spacing: -0.5px;">${greeting}</h2>
        <p style="font-size: 16px; color: #5C5C5C; line-height: 1.6; margin: 0 0 32px;">
          Click the button below to sign in to your YesChapter pledge dashboard. No password required — this link expires in <strong>15 minutes</strong>.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${magicUrl}" style="display: inline-block; background: #3D7A5A; color: #FFFFFF; padding: 16px 36px; text-decoration: none; font-family: sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 2px;">SIGN IN TO MY DASHBOARD &rarr;</a>
        </div>
        <p style="font-size: 13px; color: #8C8A87; line-height: 1.6; margin: 24px 0 0; border-top: 1px solid #D9D7D4; padding-top: 24px;">
          If you didn&apos;t request this link, you can safely ignore this email. Links can only be used once.
        </p>
        <p style="font-size: 12px; color: #8C8A87; margin: 8px 0 0; word-break: break-all;">
          Or copy this URL: <span style="color: #3D7A5A;">${magicUrl}</span>
        </p>
      </div>
      ${emailFooter()}
    </div>
    `
  );
}
