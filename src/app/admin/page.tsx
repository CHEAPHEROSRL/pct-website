"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Lock,
  LogIn,
  LogOut,
  Plus,
  ArrowLeft,
  Send,
  Trash2,
  Zap,
  BookOpen,
  Clock,
  Trophy,
  XCircle,
  Target,
  CheckCircle,
  Video,
  Copy,
  Loader2,
  Instagram,
  Mail,
  Settings,
  MapPin,
  Navigation,
  Building2,
  Upload,
  Inbox,
  CheckCircle2,
} from "lucide-react";
import type { JournalPost, ChallengePublic, ContactMessage } from "@/lib/types";
import { getMileForDay, getLastTrackedDay } from "@/lib/day-mileage";
import { trailSections, TRAIL_REGIONS, type SponsorRecord } from "@/lib/trail";

type View = "login" | "tracker" | "list" | "editor" | "challenges" | "honor" | "waitlist" | "emails" | "email-detail" | "settings" | "sponsors" | "contact" | "contact-detail";
type AdminTab = "tracker" | "journal" | "challenges" | "honor" | "waitlist" | "emails" | "settings" | "sponsors" | "contact";

interface EmailTemplateListItem {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  trigger: string;
  recipient: string;
  cron: string | null;
  dedupKey: string | null;
}

interface EmailPreview {
  to: string;
  from: string;
  subject: string;
  html: string;
}

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [view, setView] = useState<View>("login");
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [editingPost, setEditingPost] = useState<Partial<JournalPost> | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<AdminTab>("tracker");
  const [activeChallenge, setActiveChallenge] = useState<ChallengePublic | null>(null);
  const [challengeHistory, setChallengeHistory] = useState<ChallengePublic[]>([]);
  const [challengeForm, setChallengeForm] = useState({
    title: "",
    description: "",
    target: 30,
    start: 0,
    unit: "mi",
    challengeType: "distance" as "distance" | "elevation" | "location" | "custom",
    durationHours: 24,
  });

  // Video-to-Blog state
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDayNumber, setVideoDayNumber] = useState<number | undefined>();
  const [videoSplit, setVideoSplit] = useState(false);
  const [videoExtraThoughts, setVideoExtraThoughts] = useState("");
  const [videoGenerating, setVideoGenerating] = useState(false);
  const [videoForce, setVideoForce] = useState(false);
  const [videoResult, setVideoResult] = useState<{
    success: boolean;
    videoTitle?: string;
    postsCreated?: number;
    alreadyProcessed?: boolean;
    posts?: { id: string; title: string; slug: string; tags: string[]; published: boolean }[];
    error?: string;
  } | null>(null);
  const [showVideoGenerator, setShowVideoGenerator] = useState(false);
  const [instagramCaption, setInstagramCaption] = useState<string | null>(null);

  // Waitlist state
  const [waitlistEmails, setWaitlistEmails] = useState<{ email: string; signedUpAt: string }[]>([]);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  // Launch invite blast state (Waitlist tab → "Send launch invite" panel)
  interface LaunchLock {
    sending?: boolean;
    variant?: "A" | "B" | "C";
    sent?: number;
    failed?: number;
    sentAt?: number;
    totalRecipients?: number;
  }
  interface LaunchStatus {
    recipientCount: number;
    bulkEmailsEnabled: boolean;
    lock: LaunchLock | null;
  }
  const [launchStatus, setLaunchStatus] = useState<LaunchStatus | null>(null);
  const [launchStatusLoading, setLaunchStatusLoading] = useState(false);
  const [launchVariant, setLaunchVariant] = useState<"A" | "B" | "C">("A");
  const [launchSending, setLaunchSending] = useState(false);
  const [launchResult, setLaunchResult] = useState<{
    success: boolean;
    message: string;
    sent?: number;
    failed?: number;
    errors?: string[];
  } | null>(null);

  // Email-cron control panel state (Settings tab → Email Crons)
  type EmailCronId = "welcome" | "weekly" | "milestone" | "honor";
  interface EmailCronDef {
    id: EmailCronId;
    name: string;
    schedule: string;
  }
  interface EmailCronLastSent {
    ts?: number;
    weekNumber?: number;
  }
  interface EmailCronStatus {
    standby: boolean;
    bulkEmailsEnabled: boolean;
    lastSent: Record<EmailCronId, EmailCronLastSent>;
    crons: EmailCronDef[];
  }
  const [emailCronStatus, setEmailCronStatus] = useState<EmailCronStatus | null>(null);
  const [emailCronLoading, setEmailCronLoading] = useState(false);
  const [emailCronToggling, setEmailCronToggling] = useState(false);
  const [emailCronTriggering, setEmailCronTriggering] = useState<EmailCronId | null>(null);
  const [emailCronResult, setEmailCronResult] = useState<{
    which: EmailCronId;
    success: boolean;
    message: string;
  } | null>(null);

  // Settings state
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Sponsors state
  const [sponsors, setSponsors] = useState<SponsorRecord[]>([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(false);
  const [sponsorForm, setSponsorForm] = useState({
    mode: "section" as "section" | "custom",
    sectionId: "",
    customName: "",
    customMiles: "",
    customLat: "",
    customLng: "",
    companyName: "",
    websiteUrl: "",
    logoFile: null as File | null,
  });
  const [sponsorSubmitting, setSponsorSubmitting] = useState(false);
  const [sponsorError, setSponsorError] = useState<string | null>(null);

  // Contact-messages state
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactDetail, setContactDetail] = useState<ContactMessage | null>(null);
  const [contactFilter, setContactFilter] = useState<"all" | "unread" | "replied">("all");
  const [contactSearch, setContactSearch] = useState("");

  // Email test state
  const [testEmailTo, setTestEmailTo] = useState("ciocanraul@gmail.com");
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  // Instagram sync state
  const [instaSyncing, setInstaSyncing] = useState(false);
  const [instaSyncResult, setInstaSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  // Regenerate modal state (used in editor view)
  const [regenModalOpen, setRegenModalOpen] = useState(false);
  const [regenInstructions, setRegenInstructions] = useState("");
  const [regenPills, setRegenPills] = useState<string[]>([]);
  const [regenLoading, setRegenLoading] = useState(false);

  // Gmail OAuth connection state (Settings tab → Email Notifications)
  interface GmailOAuthStatus {
    connected: boolean;
    email?: string;
    connectedAt?: string | null;
    reason?: "no-client-id" | "no-client-secret" | "no-refresh-token";
    clientIdPresent?: boolean;
    clientSecretPresent?: boolean;
    tokenValid?: boolean;
    tokenInvalidAt?: string | null;
  }
  const [gmailOAuthStatus, setGmailOAuthStatus] = useState<GmailOAuthStatus | null>(null);
  const [gmailOAuthLoading, setGmailOAuthLoading] = useState(false);
  const [gmailOAuthFlash, setGmailOAuthFlash] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [gmailOAuthDisconnecting, setGmailOAuthDisconnecting] = useState(false);

  // Email templates viewer state
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplateListItem[]>([]);
  const [emailTemplatesLoading, setEmailTemplatesLoading] = useState(false);
  const [emailNotes, setEmailNotes] = useState<Record<string, string>>({});
  const [emailDetail, setEmailDetail] = useState<EmailTemplateListItem | null>(null);
  const [emailPreview, setEmailPreview] = useState<EmailPreview | null>(null);
  const [emailPreviewLoading, setEmailPreviewLoading] = useState(false);
  const [emailPreviewError, setEmailPreviewError] = useState("");
  const [emailNoteDraft, setEmailNoteDraft] = useState("");
  const [emailNoteSaving, setEmailNoteSaving] = useState(false);
  const [emailNoteSaved, setEmailNoteSaved] = useState(false);
  const [regenError, setRegenError] = useState("");

  // Honor tracking state
  const [honorStats, setHonorStats] = useState<{
    honoredCount: number;
    pledgerCount: number;
    totalPledged: number;
    honorRate: number;
    totalHonored: number;
  } | null>(null);
  const [honorLoading, setHonorLoading] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Read Gmail OAuth flash message from URL params (after callback redirect)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const oauthResult = params.get("gmailOauth");
    if (!oauthResult) return;
    if (oauthResult === "success") {
      const email = params.get("gmailOauthEmail") || "unknown";
      setGmailOAuthFlash({
        type: "success",
        message: `Gmail connected successfully. Sending is now authorised as ${email}.`,
      });
    } else if (oauthResult === "error") {
      const reason = params.get("gmailOauthReason") || "Unknown error";
      setGmailOAuthFlash({ type: "error", message: reason });
    }
    // Clear the query string to avoid re-showing the flash on refresh
    const url = new URL(window.location.href);
    url.searchParams.delete("gmailOauth");
    url.searchParams.delete("gmailOauthEmail");
    url.searchParams.delete("gmailOauthReason");
    window.history.replaceState({}, "", url.toString());
  }, []);

  // Auto-login from saved token — don't render login form until checked
  useEffect(() => {
    const saved = localStorage.getItem("pct-admin-token");
    if (!saved) {
      setInitializing(false);
      return;
    }
    setToken(saved);
    fetch("/api/journal?all=true", {
      headers: { Authorization: `Bearer ${saved}` },
    }).then(async (res) => {
      if (res.ok) {
        const data: JournalPost[] = await res.json();
        setPosts(data);
        setAuthenticated(true);
        // Refresh the admin session cookie. Auto-login validates the
        // Bearer token but doesn't touch the cookie — if the cookie has
        // expired (24h) or got invalidated by a sameSite config change,
        // API calls keep working (Bearer header) but <a href> navigations
        // to cookie-only endpoints (Gmail OAuth start, etc.) 401. This
        // POST refreshes the cookie so every subsequent admin session
        // can use both auth surfaces.
        fetch("/api/admin/refresh-cookie", {
          method: "POST",
          headers: { Authorization: `Bearer ${saved}` },
        }).catch(() => {
          // Best-effort — failure just means cookie-only endpoints
          // continue to 401 until the user manually logs out and back in
        });
        // Deep-link from contact notification email lands here:
        //   /admin?tab=contact&id=<msgId>
        // Honor it by jumping straight into the contact tab + opening
        // the message. Without a deep-link param we default to tracker
        // like before.
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get("tab");
        const idParam = params.get("id");
        if (tabParam === "contact") {
          setActiveTab("contact");
          if (idParam) {
            // Fetch the list in the background AND open the detail directly.
            // openContactDetail handles the read-flip + view switch.
            fetch("/api/admin/contact", { headers: { Authorization: `Bearer ${saved}` } })
              .then((r) => (r.ok ? r.json() : null))
              .then((d) => {
                if (Array.isArray(d?.messages)) setContactMessages(d.messages);
              })
              .catch(() => {});
            fetch(`/api/admin/contact?id=${encodeURIComponent(idParam)}`, {
              headers: { Authorization: `Bearer ${saved}` },
            })
              .then((r) => (r.ok ? r.json() : null))
              .then((d) => {
                if (d?.message) {
                  setContactDetail(d.message);
                  setView("contact-detail");
                } else {
                  setView("contact");
                }
              })
              .catch(() => setView("contact"));
          } else {
            setView("contact");
            fetch("/api/admin/contact", { headers: { Authorization: `Bearer ${saved}` } })
              .then((r) => (r.ok ? r.json() : null))
              .then((d) => {
                if (Array.isArray(d?.messages)) setContactMessages(d.messages);
              })
              .catch(() => {});
          }
        } else {
          setActiveTab("tracker");
          setView("tracker");
          fetchSettings();
        }
      } else {
        localStorage.removeItem("pct-admin-token");
      }
    }).catch(() => {
      localStorage.removeItem("pct-admin-token");
    }).finally(() => {
      setInitializing(false);
    });
  }, []);

  const authHeaders = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/journal?all=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: JournalPost[] = await res.json();
        setPosts(data);
      } else if (res.status === 401) {
        setStatus("Invalid token");
        setAuthenticated(false);
        setView("login");
      }
    } catch {
      setStatus("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchChallenges = useCallback(async () => {
    try {
      const res = await fetch("/api/challenges", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveChallenge(data.active);
        setChallengeHistory(data.history || []);
      }
    } catch {
      setStatus("Failed to load challenges");
    }
  }, [token]);

  const fetchHonorStats = useCallback(async () => {
    setHonorLoading(true);
    try {
      const [countRes, pledgersRes] = await Promise.all([
        fetch("/api/pledges/stats"),
        fetch("/api/honor/stats", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      // Try dedicated stats endpoint first, fall back to basic counts
      const pledgerCount = countRes.ok ? ((await countRes.json()).stats?.pledgerCount ?? 0) : 0;

      if (pledgersRes.ok) {
        const data = await pledgersRes.json();
        setHonorStats(data);
      } else {
        // Fallback: just show what we know
        setHonorStats({
          honoredCount: 0,
          pledgerCount,
          totalPledged: 0,
          honorRate: 0,
          totalHonored: 0,
        });
      }
    } catch {
      setStatus("Failed to load honor stats");
    } finally {
      setHonorLoading(false);
    }
  }, [token]);

  const fetchWaitlist = useCallback(async () => {
    setWaitlistLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWaitlistEmails(data.emails || []);
      }
    } catch {
      setStatus("Failed to load waitlist");
    } finally {
      setWaitlistLoading(false);
    }
  }, [token]);

  const fetchEmailCronStatus = useCallback(async () => {
    setEmailCronLoading(true);
    try {
      const res = await fetch("/api/admin/email-cron-status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as EmailCronStatus;
        setEmailCronStatus(data);
      }
    } catch {
      // non-fatal — panel just stays hidden
    } finally {
      setEmailCronLoading(false);
    }
  }, [token]);

  const toggleEmailCronStandby = useCallback(async (nextStandby: boolean) => {
    if (!emailCronStatus) return;
    const verb = nextStandby ? "PAUSE" : "ACTIVATE";
    const ok = window.confirm(
      nextStandby
        ? "Pause the email crons? They will stop firing on schedule. Manual 'Send Now' buttons still work."
        : "Activate the email crons? They will start firing on their normal schedules (welcome every 6h, weekly Mondays, etc.). EMAILS_ENABLED must also be true for anything to actually send."
    );
    if (!ok) return;
    setEmailCronToggling(true);
    try {
      const res = await fetch("/api/admin/email-cron-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ standby: nextStandby }),
      });
      if (res.ok) {
        await fetchEmailCronStatus();
      } else {
        setStatus(`Failed to ${verb.toLowerCase()} crons`);
      }
    } catch {
      setStatus(`Failed to ${verb.toLowerCase()} crons`);
    } finally {
      setEmailCronToggling(false);
    }
  }, [emailCronStatus, token, fetchEmailCronStatus]);

  const triggerEmailCron = useCallback(async (which: EmailCronId, displayName: string) => {
    if (emailCronTriggering) return;

    const ok = window.confirm(
      `Manually trigger "${displayName}" now? Per-pledger dedup keys still apply — pledgers already sent this email will be skipped.`
    );
    if (!ok) return;

    setEmailCronTriggering(which);
    setEmailCronResult(null);
    try {
      const res = await fetch("/api/admin/email-cron-trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ which }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        // The underlying cron response is in data.response
        const r = data.response || {};
        let msg = `Triggered.`;
        if (r.skipped) {
          msg = `Skipped: ${r.reason || "unknown reason"}`;
        } else if (typeof r.sent === "number") {
          msg = `Sent: ${r.sent}, failed: ${r.failed ?? 0}, skipped: ${r.skipped ?? 0}.`;
        } else if (r.message) {
          msg = r.message;
        } else {
          msg = JSON.stringify(r).slice(0, 280);
        }
        setEmailCronResult({ which, success: true, message: msg });
      } else {
        setEmailCronResult({
          which,
          success: false,
          message: data.error || data.response?.error || `HTTP ${res.status}`,
        });
      }
    } catch (err) {
      setEmailCronResult({
        which,
        success: false,
        message: err instanceof Error ? err.message : "Network error",
      });
    } finally {
      setEmailCronTriggering(null);
      fetchEmailCronStatus();
    }
  }, [emailCronTriggering, token, fetchEmailCronStatus]);

  const fetchLaunchStatus = useCallback(async () => {
    setLaunchStatusLoading(true);
    try {
      const res = await fetch("/api/admin/waitlist-launch", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as LaunchStatus;
        setLaunchStatus(data);
      }
    } catch {
      // non-fatal — panel just hides
    } finally {
      setLaunchStatusLoading(false);
    }
  }, [token]);

  const sendLaunchBlast = useCallback(async () => {
    if (!launchStatus) return;
    if (launchStatus.lock) return; // already sent / sending

    const variant = launchVariant;
    const count = launchStatus.recipientCount;

    // Triple confirmation. Friction is the feature here — these emails
    // CANNOT be unsent and the lock blocks any second attempt.
    const confirm1 = window.confirm(
      `Send "Launch invite (Option ${variant})" to ${count} waitlist subscriber${count === 1 ? "" : "s"}?\n\nThis cannot be undone. The lock will prevent re-sending afterward.`
    );
    if (!confirm1) return;

    const typed = window.prompt(
      `Final confirmation. Type SEND (all caps) to blast Option ${variant} to ${count} recipient${count === 1 ? "" : "s"}.`
    );
    if (typed !== "SEND") {
      setLaunchResult({ success: false, message: "Cancelled — confirmation text didn't match." });
      return;
    }

    setLaunchSending(true);
    setLaunchResult(null);
    try {
      const res = await fetch("/api/admin/waitlist-launch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ variant, confirm: "SEND" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLaunchResult({
          success: true,
          message: `Sent Option ${variant} to ${data.sent}/${data.totalRecipients} recipients.${data.failed ? ` ${data.failed} failed.` : ""}`,
          sent: data.sent,
          failed: data.failed,
          errors: data.errors,
        });
      } else {
        setLaunchResult({
          success: false,
          message: data.error || "Send failed (unknown error).",
        });
      }
    } catch (err) {
      setLaunchResult({
        success: false,
        message: err instanceof Error ? err.message : "Network error.",
      });
    } finally {
      setLaunchSending(false);
      // Re-fetch lock status so UI updates regardless of outcome
      fetchLaunchStatus();
    }
  }, [launchStatus, launchVariant, token, fetchLaunchStatus]);

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch {
      setStatus("Failed to load settings");
    } finally {
      setSettingsLoading(false);
    }
  }, [token]);

  const fetchSponsors = useCallback(async () => {
    setSponsorsLoading(true);
    try {
      const res = await fetch("/api/admin/sponsors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSponsors(Array.isArray(data?.sponsors) ? data.sponsors : []);
      }
    } catch {
      setStatus("Failed to load sponsors");
    } finally {
      setSponsorsLoading(false);
    }
  }, [token]);

  const resetSponsorForm = useCallback(() => {
    setSponsorForm({
      mode: "section",
      sectionId: "",
      customName: "",
      customMiles: "",
      customLat: "",
      customLng: "",
      companyName: "",
      websiteUrl: "",
      logoFile: null,
    });
    setSponsorError(null);
  }, []);

  const handleSponsorSubmit = useCallback(async () => {
    setSponsorError(null);

    // Client-side validation mirrors the server checks so the user sees
    // problems immediately instead of waiting for a round-trip.
    if (!sponsorForm.companyName.trim()) {
      setSponsorError("Company name is required");
      return;
    }
    if (sponsorForm.mode === "section" && !sponsorForm.sectionId) {
      setSponsorError("Pick a trail section");
      return;
    }
    if (sponsorForm.mode === "custom") {
      if (!sponsorForm.customName.trim()) {
        setSponsorError("Custom location name is required");
        return;
      }
      const m = Number(sponsorForm.customMiles);
      const la = Number(sponsorForm.customLat);
      const ln = Number(sponsorForm.customLng);
      if (!Number.isFinite(m) || m < 0 || m > 2700) {
        setSponsorError("Miles must be a number between 0 and 2700");
        return;
      }
      if (!Number.isFinite(la) || la < -90 || la > 90) {
        setSponsorError("Lat must be a number between -90 and 90");
        return;
      }
      if (!Number.isFinite(ln) || ln < -180 || ln > 180) {
        setSponsorError("Lng must be a number between -180 and 180");
        return;
      }
    }

    // Logo is required on create. If editing an existing entry (section already
    // sponsored), the server will fall back to the existing logoUrl when no
    // file is provided — so we only enforce the file requirement here when no
    // existing entry exists.
    const editingExisting =
      sponsorForm.mode === "section" &&
      sponsors.some((s) => s.sectionId === sponsorForm.sectionId);
    if (!sponsorForm.logoFile && !editingExisting) {
      setSponsorError("Logo file is required");
      return;
    }

    setSponsorSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("mode", sponsorForm.mode);
      fd.append("companyName", sponsorForm.companyName.trim());
      if (sponsorForm.websiteUrl.trim()) fd.append("websiteUrl", sponsorForm.websiteUrl.trim());
      if (sponsorForm.mode === "section") {
        fd.append("sectionId", sponsorForm.sectionId);
      } else {
        fd.append("customName", sponsorForm.customName.trim());
        fd.append("customMiles", sponsorForm.customMiles);
        fd.append("customLat", sponsorForm.customLat);
        fd.append("customLng", sponsorForm.customLng);
      }
      if (sponsorForm.logoFile) fd.append("logo", sponsorForm.logoFile);

      const res = await fetch("/api/admin/sponsors", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setSponsorError(data?.error || "Failed to save sponsor");
        return;
      }
      setSponsors(Array.isArray(data?.sponsors) ? data.sponsors : []);
      resetSponsorForm();
    } catch {
      setSponsorError("Network error");
    } finally {
      setSponsorSubmitting(false);
    }
  }, [sponsorForm, sponsors, token, resetSponsorForm]);

  const handleSponsorDelete = useCallback(async (id: string) => {
    if (!confirm("Remove this sponsor? Their logo file will also be deleted.")) return;
    try {
      const res = await fetch(`/api/admin/sponsors?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSponsors(Array.isArray(data?.sponsors) ? data.sponsors : []);
      } else {
        alert(data?.error || "Failed to delete sponsor");
      }
    } catch {
      alert("Network error");
    }
  }, [token]);

  // — Contact messages —
  const fetchContactMessages = useCallback(async () => {
    setContactLoading(true);
    try {
      const res = await fetch("/api/admin/contact", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setContactMessages(Array.isArray(data?.messages) ? data.messages : []);
      }
    } catch {
      setStatus("Failed to load contact messages");
    } finally {
      setContactLoading(false);
    }
  }, [token]);

  const openContactDetail = useCallback(async (id: string) => {
    // Fetch single — backend auto-flips readAt on first open
    try {
      const res = await fetch(`/api/admin/contact?id=${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data?.message) {
        setContactDetail(data.message);
        setView("contact-detail");
        // Refresh the list silently so the "unread" pill clears
        setContactMessages((prev) => prev.map((m) => (m.id === id ? data.message : m)));
      } else {
        alert(data?.error || "Failed to load message");
      }
    } catch {
      alert("Network error");
    }
  }, [token]);

  const handleContactPatch = useCallback(async (id: string, patch: { repliedAt?: number | null; readAt?: number | null }) => {
    try {
      const res = await fetch(`/api/admin/contact?id=${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (res.ok && data?.message) {
        setContactDetail(data.message);
        setContactMessages((prev) => prev.map((m) => (m.id === id ? data.message : m)));
      }
    } catch {
      alert("Network error");
    }
  }, [token]);

  const handleContactDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/contact?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setContactMessages((prev) => prev.filter((m) => m.id !== id));
        if (contactDetail?.id === id) {
          setContactDetail(null);
          setView("contact");
        }
      }
    } catch {
      alert("Network error");
    }
  }, [token, contactDetail]);

  const fetchGmailOAuthStatus = useCallback(async () => {
    setGmailOAuthLoading(true);
    try {
      const res = await fetch("/api/admin/gmail-oauth/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGmailOAuthStatus(data);
      } else {
        setGmailOAuthStatus(null);
      }
    } catch {
      setGmailOAuthStatus(null);
    } finally {
      setGmailOAuthLoading(false);
    }
  }, [token]);

  const disconnectGmail = useCallback(async () => {
    if (!confirm("Disconnect Gmail? The site will no longer be able to send emails until someone reconnects.")) return;
    setGmailOAuthDisconnecting(true);
    try {
      const res = await fetch("/api/admin/gmail-oauth/disconnect", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setGmailOAuthFlash({ type: "success", message: "Gmail disconnected. The website can no longer send emails until you reconnect." });
        await fetchGmailOAuthStatus();
      } else {
        const data = await res.json().catch(() => ({}));
        setGmailOAuthFlash({ type: "error", message: data.error || `HTTP ${res.status}` });
      }
    } catch (err) {
      setGmailOAuthFlash({ type: "error", message: err instanceof Error ? err.message : "Disconnect failed" });
    } finally {
      setGmailOAuthDisconnecting(false);
    }
  }, [token, fetchGmailOAuthStatus]);

  const fetchEmailTemplates = useCallback(async () => {
    setEmailTemplatesLoading(true);
    try {
      const [listRes, notesRes] = await Promise.all([
        fetch("/api/admin/email-previews", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/admin/email-notes", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (listRes.ok) {
        const data = await listRes.json();
        setEmailTemplates(data.templates || []);
      }
      if (notesRes.ok) {
        const notesData = await notesRes.json();
        setEmailNotes(notesData.notes || {});
      }
    } catch {
      setStatus("Failed to load email templates");
    } finally {
      setEmailTemplatesLoading(false);
    }
  }, [token]);

  const openEmailTemplate = useCallback(
    async (template: EmailTemplateListItem) => {
      setEmailDetail(template);
      setView("email-detail");
      setStatus("");
      setEmailPreview(null);
      setEmailPreviewError("");
      setEmailPreviewLoading(true);
      setEmailNoteDraft(emailNotes[template.id] || "");
      setEmailNoteSaved(false);
      try {
        const res = await fetch(
          `/api/admin/email-previews?id=${encodeURIComponent(template.id)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setEmailPreview(data.preview);
        } else {
          const data = await res.json().catch(() => ({}));
          setEmailPreviewError(data.error || `HTTP ${res.status}`);
        }
      } catch (err) {
        setEmailPreviewError(err instanceof Error ? err.message : "Network error");
      } finally {
        setEmailPreviewLoading(false);
      }
    },
    [token, emailNotes]
  );

  const saveEmailNote = useCallback(async () => {
    if (!emailDetail) return;
    setEmailNoteSaving(true);
    setEmailNoteSaved(false);
    try {
      const res = await fetch("/api/admin/email-notes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          templateId: emailDetail.id,
          note: emailNoteDraft,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setEmailNotes(data.notes || {});
        setEmailNoteSaved(true);
        setTimeout(() => setEmailNoteSaved(false), 3000);
      } else {
        setStatus("Failed to save note");
      }
    } catch {
      setStatus("Network error saving note");
    } finally {
      setEmailNoteSaving(false);
    }
  }, [emailDetail, emailNoteDraft, token]);

  async function handleSaveSettings() {
    setSettingsLoading(true);
    setSettingsSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
      } else {
        setStatus("Failed to save settings");
      }
    } catch {
      setStatus("Failed to save settings");
    } finally {
      setSettingsLoading(false);
    }
  }

  async function handleGenerateFromVideo() {
    if (!videoUrl.trim()) return;
    setVideoGenerating(true);
    setVideoResult(null);
    setInstagramCaption(null);
    try {
      const res = await fetch("/api/automation/generate-post", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          videoUrl: videoUrl.trim(),
          dayNumber: videoDayNumber || undefined,
          split: videoSplit,
          publish: false,
          force: videoForce,
          extraThoughts: videoExtraThoughts.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setVideoResult(data);
        setVideoUrl("");
        setVideoDayNumber(undefined);
        setVideoSplit(false);
        setVideoForce(false);
        setVideoExtraThoughts("");
        await fetchPosts();
      } else {
        setVideoResult({ success: false, error: data.error || "Generation failed", alreadyProcessed: data.alreadyProcessed });
      }
    } catch {
      setVideoResult({ success: false, error: "Network error. Try again." });
    } finally {
      setVideoGenerating(false);
    }
  }

  async function handleRegenerate() {
    if (!editingPost || !editingPost.id || !editingPost.youtubeUrl) {
      setRegenError("This post has no source YouTube URL — can't regenerate.");
      return;
    }
    setRegenLoading(true);
    setRegenError("");
    try {
      const res = await fetch("/api/automation/generate-post", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          videoUrl: editingPost.youtubeUrl,
          overwriteId: editingPost.id,
          regenerationInstructions: regenInstructions.trim() || undefined,
          improvementPills: regenPills.length > 0 ? regenPills : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRegenError(data.error || `HTTP ${res.status}`);
        return;
      }
      // Update the in-memory editor post with the new content. Slug may
      // also have changed if the title changed and the post is a draft.
      const newPost = data.posts?.[0];
      if (newPost) {
        setEditingPost({
          ...editingPost,
          title: newPost.title,
          slug: newPost.slug ?? editingPost.slug,
          body: newPost.body,
          excerpt: newPost.excerpt,
          tags: newPost.tags,
        });
        // Refresh the posts list in the background
        fetchPosts();
      }
      // Close the modal and reset
      setRegenModalOpen(false);
      setRegenInstructions("");
      setRegenPills([]);
      setStatus("Post regenerated successfully");
      setTimeout(() => setStatus(""), 4000);
    } catch (err) {
      setRegenError(err instanceof Error ? err.message : "Network error");
    } finally {
      setRegenLoading(false);
    }
  }

  function toggleRegenPill(pill: string) {
    setRegenPills((prev) =>
      prev.includes(pill) ? prev.filter((p) => p !== pill) : [...prev, pill]
    );
  }

  async function fetchInstagramCaption(postId: string) {
    setCaptionCopied(false);
    try {
      const res = await fetch(`/api/automation/instagram-caption?postId=${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInstagramCaption(data.caption);
      } else {
        setInstagramCaption(null);
      }
    } catch {
      setInstagramCaption(null);
    }
  }

  async function copyCaption() {
    if (!instagramCaption) return;
    await navigator.clipboard.writeText(instagramCaption);
    setCaptionCopied(true);
    setTimeout(() => setCaptionCopied(false), 2000);
  }

  async function handleCreateChallenge() {
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(challengeForm),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("Challenge created!");
        setChallengeForm({ title: "", description: "", target: 30, start: 0, unit: "mi", challengeType: "distance", durationHours: 24 });
        await fetchChallenges();
      } else {
        setStatus(data.error || "Failed to create challenge");
      }
    } catch {
      setStatus("Failed to create challenge");
    } finally {
      setLoading(false);
    }
  }

  async function handleResolveChallenge(action: "succeed" | "fail" | "cancel") {
    const labels = { succeed: "mark as succeeded", fail: "mark as failed", cancel: "cancel" };
    if (!confirm(`Are you sure you want to ${labels[action]} this challenge?`)) return;

    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/challenges", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        const boostMsg = data.boostsApplied > 0 ? ` ${data.boostsApplied} boosts applied!` : "";
        setStatus(`Challenge ${action === "succeed" ? "succeeded" : action === "fail" ? "failed" : "cancelled"}!${boostMsg}`);
        await fetchChallenges();
      } else {
        setStatus(data.error || "Failed to resolve challenge");
      }
    } catch {
      setStatus("Failed to resolve challenge");
    } finally {
      setLoading(false);
    }
  }

  // Login with username/password
  async function handleLogin() {
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    setStatus("");

    try {
      // Authenticate with username/password
      const authRes = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!authRes.ok) {
        const err = await authRes.json();
        setStatus(err.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      const { token: adminToken } = await authRes.json();
      setToken(adminToken);
      localStorage.setItem("pct-admin-token", adminToken);

      // Fetch journal posts with the token
      const res = await fetch("/api/journal?all=true", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data: JournalPost[] = await res.json();
        setPosts(data);
        setAuthenticated(true);
        setActiveTab("tracker");
        setView("tracker");
        fetchSettings();
        fetchChallenges();
      } else {
        setStatus(`Error ${res.status}`);
      }
    } catch {
      setStatus("Connection failed");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("pct-admin-token");
    setToken("");
    setAuthenticated(false);
    setPosts([]);
    setView("login");
    setStatus("");
  }

  // Toggle publish/unpublish inline
  async function handleTogglePublish(post: JournalPost) {
    try {
      const res = await fetch("/api/journal", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ id: post.id, published: !post.published }),
      });
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, published: !post.published } : p))
        );
        setStatus(post.published ? `"${post.title}" unpublished` : `"${post.title}" published!`);
      }
    } catch {
      setStatus("Toggle failed");
    }
  }

  // Delete
  async function handleDelete(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/journal?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        setStatus("Post deleted");
      }
    } catch {
      setStatus("Delete failed");
    }
  }

  // Save (create or update)
  async function handleSave(published: boolean) {
    if (!editingPost) return;
    const { title, dayNumber, date, body } = editingPost;
    if (!title || !dayNumber || !date || !body) {
      setStatus("Please fill in title, day number, date, and body");
      return;
    }

    setLoading(true);
    setStatus("");

    const isNew = !editingPost.id;
    const method = isNew ? "POST" : "PUT";
    const payload = { ...editingPost, published };

    try {
      const res = await fetch("/api/journal", {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchPosts();
        setView("list");
        setEditingPost(null);
        setStatus(published ? "Post published!" : "Draft saved!");
      } else {
        const err = await res.json();
        setStatus(err.error || `Error ${res.status}`);
      }
    } catch {
      setStatus("Save failed");
    } finally {
      setLoading(false);
    }
  }

  // --- INITIALIZING (checking saved token) ---
  if (initializing) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-[var(--bg-dark)] items-center justify-center">
        <div className="flex items-center gap-[12px]">
          <Shield className="w-[24px] h-[24px] text-[var(--forest-green)]" />
          <span className="font-label font-bold text-[14px] tracking-[3px] text-white">
            YESCHAPTER ADMIN
          </span>
        </div>
      </div>
    );
  }

  // --- LOGIN VIEW ---
  if (view === "login") {
    return (
      <div className="flex flex-col w-full min-h-screen bg-[var(--bg-dark)]">
        <div className="flex flex-col items-center justify-center flex-1 gap-[24px] md:gap-[32px] px-[20px] md:px-[60px] py-[40px]">
          <div className="flex items-center gap-[12px]">
            <Shield className="w-[24px] h-[24px] text-[var(--forest-green)]" />
            <span className="font-label font-bold text-[14px] tracking-[3px] text-white">
              PCT ADMIN
            </span>
          </div>

          <div className="flex flex-col items-center gap-[14px]">
            <div className="flex items-center justify-center w-[80px] h-[80px] bg-[#333333] rounded-full">
              <Lock className="w-[36px] h-[36px] text-[var(--text-muted)]" />
            </div>
            <span className="font-label font-semibold text-[13px] tracking-[1px] text-[var(--text-muted)]">
              Sign in to continue
            </span>
          </div>

          <div className="flex flex-col gap-[16px] w-full max-w-[360px]">
            <div className="flex flex-col gap-[8px]">
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                USERNAME
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter your username"
                autoComplete="username"
                className="w-full h-[48px] px-[16px] bg-[#2A2D28] font-heading text-[15px] text-white placeholder:text-[#666666] outline-none"
              />
            </div>
            <div className="flex flex-col gap-[8px]">
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                PASSWORD
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full h-[48px] px-[16px] bg-[#2A2D28] font-heading text-[15px] text-white placeholder:text-[#666666] outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !username.trim() || !password.trim()}
            className="flex items-center justify-center gap-[12px] w-full max-w-[360px] h-[56px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            <LogIn className="w-[20px] h-[20px] text-white" />
            <span className="font-label font-bold text-[15px] tracking-[2px] text-white">
              {loading ? "SIGNING IN..." : "SIGN IN"}
            </span>
          </button>

          {status && (
            <span className="font-label text-[13px] text-red-400">
              {status}
            </span>
          )}

          <span className="font-label text-[11px] text-[#555555] text-center">
            Admin access only. Not indexed by search engines.
          </span>
        </div>
      </div>
    );
  }

  // --- Shared admin shell (header + tabs) ---
  function adminShell(content: React.ReactNode) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-[var(--bg-warm)]">
        {/* Top bar */}
        <div className="flex items-center justify-between h-[56px] md:h-[64px] px-[16px] md:px-[40px] bg-[var(--bg-white)] border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-[10px] md:gap-[12px] min-w-0">
            <Shield className="w-[20px] h-[20px] md:w-[24px] md:h-[24px] text-[var(--forest-green)] shrink-0" />
            <span className="font-label font-bold text-[12px] md:text-[14px] tracking-[2px] md:tracking-[3px] text-[var(--text-primary)] truncate">
              YESCHAPTER ADMIN
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-[8px] px-[12px] md:px-[20px] py-[8px] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
            <span className="hidden sm:inline font-label font-bold text-[11px] tracking-[2px] text-[var(--text-secondary)]">
              LOG OUT
            </span>
          </button>
        </div>

        {/* Tabs — horizontally scrollable on mobile */}
        <div className="flex gap-0 px-[16px] md:px-[40px] bg-[var(--bg-white)] border-b border-[var(--border-subtle)] overflow-x-auto scrollbar-hide">
          <button
            onClick={() => { setActiveTab("tracker"); setView("tracker"); setStatus(""); fetchSettings(); }}
            className={`flex items-center gap-[6px] md:gap-[8px] px-[14px] md:px-[24px] py-[14px] font-label font-bold text-[11px] md:text-[12px] tracking-[1.5px] md:tracking-[2px] border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "tracker"
                ? "border-[var(--burnt-orange)] text-[var(--burnt-orange)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <Navigation className="w-[16px] h-[16px]" />
            TRACKER
          </button>
          <button
            onClick={() => { setActiveTab("journal"); setView("list"); setStatus(""); }}
            className={`flex items-center gap-[6px] md:gap-[8px] px-[14px] md:px-[24px] py-[14px] font-label font-bold text-[11px] md:text-[12px] tracking-[1.5px] md:tracking-[2px] border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "journal"
                ? "border-[var(--burnt-orange)] text-[var(--burnt-orange)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <BookOpen className="w-[16px] h-[16px]" />
            JOURNAL
          </button>
          <button
            onClick={() => { setActiveTab("challenges"); setView("challenges"); setStatus(""); fetchChallenges(); }}
            className={`flex items-center gap-[6px] md:gap-[8px] px-[14px] md:px-[24px] py-[14px] font-label font-bold text-[11px] md:text-[12px] tracking-[1.5px] md:tracking-[2px] border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "challenges"
                ? "border-[var(--burnt-orange)] text-[var(--burnt-orange)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <Zap className="w-[16px] h-[16px]" />
            CHALLENGES
          </button>
          <button
            onClick={() => { setActiveTab("honor"); setView("honor"); setStatus(""); fetchHonorStats(); }}
            className={`flex items-center gap-[6px] md:gap-[8px] px-[14px] md:px-[24px] py-[14px] font-label font-bold text-[11px] md:text-[12px] tracking-[1.5px] md:tracking-[2px] border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "honor"
                ? "border-[var(--burnt-orange)] text-[var(--burnt-orange)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <CheckCircle className="w-[16px] h-[16px]" />
            <span className="hidden sm:inline">HONOR TRACKING</span>
            <span className="sm:hidden">HONOR</span>
          </button>
          <button
            onClick={() => { setActiveTab("waitlist"); setView("waitlist"); setStatus(""); fetchWaitlist(); fetchLaunchStatus(); }}
            className={`flex items-center gap-[6px] md:gap-[8px] px-[14px] md:px-[24px] py-[14px] font-label font-bold text-[11px] md:text-[12px] tracking-[1.5px] md:tracking-[2px] border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "waitlist"
                ? "border-[var(--burnt-orange)] text-[var(--burnt-orange)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <Mail className="w-[16px] h-[16px]" />
            WAITLIST
          </button>
          <button
            onClick={() => { setActiveTab("emails"); setView("emails"); setStatus(""); fetchEmailTemplates(); }}
            className={`flex items-center gap-[6px] md:gap-[8px] px-[14px] md:px-[24px] py-[14px] font-label font-bold text-[11px] md:text-[12px] tracking-[1.5px] md:tracking-[2px] border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "emails" || view === "email-detail"
                ? "border-[var(--burnt-orange)] text-[var(--burnt-orange)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <Send className="w-[16px] h-[16px]" />
            EMAILS
          </button>
          <button
            onClick={() => { setActiveTab("sponsors"); setView("sponsors"); setStatus(""); fetchSponsors(); }}
            className={`flex items-center gap-[6px] md:gap-[8px] px-[14px] md:px-[24px] py-[14px] font-label font-bold text-[11px] md:text-[12px] tracking-[1.5px] md:tracking-[2px] border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "sponsors"
                ? "border-[var(--burnt-orange)] text-[var(--burnt-orange)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <Building2 className="w-[16px] h-[16px]" />
            SPONSORS
          </button>
          <button
            onClick={() => { setActiveTab("contact"); setView("contact"); setStatus(""); setContactDetail(null); fetchContactMessages(); }}
            className={`flex items-center gap-[6px] md:gap-[8px] px-[14px] md:px-[24px] py-[14px] font-label font-bold text-[11px] md:text-[12px] tracking-[1.5px] md:tracking-[2px] border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "contact" || view === "contact-detail"
                ? "border-[var(--burnt-orange)] text-[var(--burnt-orange)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <Inbox className="w-[16px] h-[16px]" />
            CONTACT
            {contactMessages.filter((m) => !m.readAt).length > 0 && (
              <span className="flex items-center justify-center min-w-[18px] h-[18px] px-[5px] rounded-full bg-[var(--burnt-orange)] font-label font-bold text-[10px] text-white">
                {contactMessages.filter((m) => !m.readAt).length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab("settings"); setView("settings"); setStatus(""); fetchSettings(); fetchGmailOAuthStatus(); fetchEmailCronStatus(); }}
            className={`flex items-center gap-[6px] md:gap-[8px] px-[14px] md:px-[24px] py-[14px] font-label font-bold text-[11px] md:text-[12px] tracking-[1.5px] md:tracking-[2px] border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "settings"
                ? "border-[var(--burnt-orange)] text-[var(--burnt-orange)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <Settings className="w-[16px] h-[16px]" />
            SETTINGS
          </button>
        </div>

        {/* Content */}
        {content}
      </div>
    );
  }

  // --- TRACKER VIEW ---
  // Quick-access position updater. Default landing view after login so Paul
  // can re-anchor his position in ~3 taps when he hits trail Wi-Fi, without
  // scrolling through the full Settings tab.
  if (view === "tracker" && authenticated) {
    const mile = parseFloat(settings.currentMile) || 0;
    const pace = parseFloat(settings.dailyPace) || 0;
    const mileSetAt = parseInt(settings.mileSetAt) || 0;
    const elapsed = mileSetAt ? (Date.now() - mileSetAt) / (1000 * 60 * 60 * 24) : 0;
    const estimated = Math.min(2650, mile + elapsed * pace);
    const progress = ((estimated / 2650) * 100).toFixed(1);

    return adminShell(
      <div className="flex flex-col gap-[20px] p-[16px] md:p-[40px] max-w-[720px] w-full mx-auto">
        <div className="flex flex-col gap-[6px]">
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
            POSITION TRACKER
          </span>
          <h1 className="font-heading font-semibold text-[24px] md:text-[28px] text-[var(--text-primary)]">
            Where is Paul right now?
          </h1>
          <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
            Set a mile and a daily pace. The map auto-advances from there. Re-anchor when reality drifts — usually every few days or at town stops.
          </p>
        </div>

        {/* Live preview */}
        <div className="flex flex-col gap-[10px] p-[16px] bg-[var(--bg-warm)] border border-[var(--border-subtle)]">
          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
            WHAT VISITORS SEE RIGHT NOW
          </span>
          <div className="grid grid-cols-3 gap-[12px]">
            <div className="flex flex-col gap-[2px]">
              <span className="font-label font-bold text-[9px] tracking-[2px] text-[var(--text-muted)]">YOU SET</span>
              <span className="font-heading font-semibold text-[20px] text-[var(--text-primary)]">Mile {mile}</span>
            </div>
            <div className="flex flex-col gap-[2px]">
              <span className="font-label font-bold text-[9px] tracking-[2px] text-[var(--text-muted)]">MAP SHOWS</span>
              <span className="font-heading font-semibold text-[20px] text-[var(--forest-green)]">Mile {estimated.toFixed(1)}</span>
            </div>
            <div className="flex flex-col gap-[2px]">
              <span className="font-label font-bold text-[9px] tracking-[2px] text-[var(--text-muted)]">PROGRESS</span>
              <span className="font-heading font-semibold text-[20px] text-[var(--burnt-orange)]">{progress}%</span>
            </div>
          </div>
          <div className="w-full h-[8px] bg-[var(--border-subtle)] overflow-hidden">
            <div className="h-full bg-[var(--forest-green)] transition-all" style={{ width: `${progress}%` }} />
          </div>
          {mileSetAt > 0 && (
            <span className="font-heading text-[12px] text-[var(--text-muted)]">
              Last re-anchored {elapsed < 1 ? `${Math.round(elapsed * 24)} hours` : `${elapsed.toFixed(1)} days`} ago.
              {pace > 0 && <> Marker has advanced {(elapsed * pace).toFixed(1)} miles since then at {pace} mi/day.</>}
              {pace === 0 && <> Pace is 0 — marker is stationary (rest day).</>}
            </span>
          )}
          {!mileSetAt && (
            <span className="font-heading text-[12px] text-[var(--burnt-orange)]">
              Position not set yet. Enter a mile and pace below, then tap Update.
            </span>
          )}
        </div>

        {/* Inputs */}
        <div className="flex flex-col sm:flex-row gap-[12px]">
          <div className="flex flex-col gap-[6px] flex-1">
            <label className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
              CURRENT MILE
            </label>
            <input
              type="number"
              min="0"
              max="2650"
              step="0.1"
              value={settings.currentMile || ""}
              onChange={(e) => setSettings({ ...settings, currentMile: e.target.value })}
              placeholder="0"
              className="w-full h-[56px] px-[16px] border border-[var(--border-subtle)] font-heading text-[20px] font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-card)]"
            />
          </div>
          <div className="flex flex-col gap-[6px] flex-1">
            <label className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
              DAILY PACE (mi/day)
            </label>
            <input
              type="number"
              min="0"
              max="40"
              step="0.5"
              value={settings.dailyPace || ""}
              onChange={(e) => setSettings({ ...settings, dailyPace: e.target.value })}
              placeholder="18"
              className="w-full h-[56px] px-[16px] border border-[var(--border-subtle)] font-heading text-[20px] font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-card)]"
            />
          </div>
        </div>

        <button
          onClick={async () => {
            const newMile = parseFloat(settings.currentMile) || 0;
            const newPace = parseFloat(settings.dailyPace) || 0;
            const updated = { ...settings, currentMile: String(newMile), dailyPace: String(newPace), mileSetAt: String(Date.now()) };
            setSettings(updated);
            setSettingsLoading(true);
            try {
              const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(updated),
              });
              if (res.ok) {
                setStatus(`Position updated — Mile ${newMile} @ ${newPace} mi/day`);
                setTimeout(() => setStatus(""), 4000);
              } else {
                setStatus("Failed to update position");
              }
            } catch { setStatus("Failed to update position"); }
            finally { setSettingsLoading(false); }
          }}
          disabled={settingsLoading}
          className="flex items-center justify-center gap-[8px] h-[56px] w-full bg-[var(--forest-green)] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          <MapPin className="w-[16px] h-[16px] text-white" />
          <span className="font-label font-bold text-[13px] tracking-[2px] text-white">
            {settingsLoading ? "UPDATING…" : "UPDATE POSITION"}
          </span>
        </button>

        {status && (
          <div className="p-[12px] bg-[var(--forest-green-light)] border border-[var(--forest-green)]/30">
            <span className="font-heading text-[13px] text-[var(--forest-green)]">{status}</span>
          </div>
        )}

        {/* Tips */}
        <div className="flex flex-col gap-[6px] p-[14px] bg-[var(--burnt-orange-light)] border border-[var(--burnt-orange)]/20">
          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--burnt-orange)]">QUICK TIPS</span>
          <ul className="flex flex-col gap-[4px] font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)]">
            <li>&bull; <strong>Rest day?</strong> Set pace to 0 — marker pauses until next update.</li>
            <li>&bull; <strong>In town?</strong> Set pace to 0, then back to normal when you leave.</li>
            <li>&bull; <strong>Pace changed?</strong> Update the pace — map re-extrapolates from today.</li>
            <li>&bull; <strong>Not sure of exact mile?</strong> Estimate. You can always re-anchor.</li>
          </ul>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  if (view === "list") {
    return adminShell(
        <div className="flex flex-col gap-[20px] md:gap-[24px] p-[16px] md:p-[40px]">
          {/* Header row — stacks on mobile, side-by-side on tablet+ */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[16px]">
            <div className="flex flex-col gap-[8px]">
              <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
                JOURNAL POSTS
              </span>
              <h1 className="font-heading font-semibold text-[24px] md:text-[28px] text-[var(--text-primary)]">
                Manage Journal Entries
              </h1>
            </div>
            <button
              onClick={() => {
                setEditingPost({
                  title: "",
                  dayNumber: undefined,
                  date: new Date().toISOString().slice(0, 10),
                  body: "",
                  excerpt: "",
                  coverImage: "",
                  images: [],
                  youtubeUrl: "",
                  tags: ["BLOG"],
                  published: false,
                });
                setView("editor");
                setStatus("");
              }}
              className="flex items-center justify-center gap-[8px] px-[20px] md:px-[28px] py-[12px] md:py-[14px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity cursor-pointer self-stretch sm:self-auto"
            >
              <Plus className="w-[16px] h-[16px] text-white" />
              <span className="font-label font-bold text-[13px] tracking-[2px] text-white">
                NEW POST
              </span>
            </button>
          </div>

          {status && (
            <span className="font-label text-[13px] text-[var(--forest-green)]">
              {status}
            </span>
          )}

          {/* Video to Blog Generator */}
          <div className="flex flex-col bg-[var(--bg-white)] border border-[var(--border-subtle)]">
            <button
              onClick={() => setShowVideoGenerator(!showVideoGenerator)}
              className="flex items-center justify-between px-[20px] py-[16px] cursor-pointer hover:bg-[var(--warm-stone)] transition-colors"
            >
              <div className="flex items-center gap-[10px]">
                <Video className="w-[18px] h-[18px] text-[var(--burnt-orange)]" />
                <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-primary)]">
                  VIDEO → BLOG POST
                </span>
              </div>
              <span className="font-heading text-[18px] text-[var(--text-muted)]">
                {showVideoGenerator ? "−" : "+"}
              </span>
            </button>

            {showVideoGenerator && (
              <div className="flex flex-col gap-[16px] px-[20px] pb-[20px] border-t border-[var(--border-subtle)] pt-[16px]">
                <p className="font-heading text-[13px] text-[var(--text-secondary)] leading-[1.6]">
                  Paste a YouTube URL to auto-generate a blog post from the video transcript using AI.
                  Posts are created as drafts for you to review before publishing.
                </p>

                <div className="flex flex-col gap-[12px]">
                  <input
                    type="text"
                    placeholder="YouTube URL (e.g., https://youtube.com/watch?v=...)"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="h-[44px] px-[14px] font-heading text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border border-[var(--border-subtle)] outline-none bg-[var(--bg-card)]"
                  />

                  <div className="flex items-center gap-[16px]">
                    <div className="flex items-center gap-[8px]">
                      <span className="font-label text-[11px] tracking-[1px] text-[var(--text-secondary)]">
                        DAY #
                      </span>
                      <input
                        type="number"
                        placeholder="Auto"
                        value={videoDayNumber ?? ""}
                        onChange={(e) => setVideoDayNumber(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-[80px] h-[36px] px-[10px] font-heading text-[13px] text-[var(--text-primary)] border border-[var(--border-subtle)] outline-none bg-[var(--bg-card)]"
                      />
                    </div>

                    <label className="flex items-center gap-[6px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={videoSplit}
                        onChange={(e) => setVideoSplit(e.target.checked)}
                        className="w-[16px] h-[16px]"
                      />
                      <span className="font-label text-[11px] tracking-[1px] text-[var(--text-secondary)]">
                        SPLIT INTO 2 POSTS
                      </span>
                    </label>
                  </div>

                  {/* Extra thoughts (optional) */}
                  <div className="flex flex-col gap-[6px]">
                    <label className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                      PAUL&apos;S EXTRA THOUGHTS (OPTIONAL)
                    </label>
                    <textarea
                      value={videoExtraThoughts}
                      onChange={(e) => setVideoExtraThoughts(e.target.value)}
                      placeholder="Anything Paul wants to add that wasn't captured in the video — context, reflections, things he forgot to say on camera. Will be woven into the post naturally."
                      rows={4}
                      className="w-full px-[14px] py-[12px] border border-[var(--border-subtle)] font-heading text-[13px] leading-[1.6] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-card)] resize-y"
                    />
                  </div>

                  <button
                    onClick={handleGenerateFromVideo}
                    disabled={videoGenerating || !videoUrl.trim()}
                    className={`flex items-center justify-center gap-[8px] h-[44px] transition-opacity ${
                      videoGenerating || !videoUrl.trim()
                        ? "bg-[var(--text-muted)] cursor-not-allowed"
                        : "bg-[var(--forest-green)] cursor-pointer hover:opacity-90"
                    }`}
                  >
                    {videoGenerating ? (
                      <Loader2 className="w-[16px] h-[16px] text-white animate-spin" />
                    ) : (
                      <Video className="w-[16px] h-[16px] text-white" />
                    )}
                    <span className="font-label font-bold text-[13px] tracking-[2px] text-white">
                      {videoGenerating ? "GENERATING..." : "GENERATE BLOG POST"}
                    </span>
                  </button>
                </div>

                {/* Result */}
                {videoResult && (
                  <div className={`flex flex-col gap-[10px] p-[16px] ${
                    videoResult.success
                      ? "bg-[var(--forest-green-light)] border border-[var(--forest-green)]"
                      : "bg-red-50 border border-red-200"
                  }`}>
                    {videoResult.success ? (
                      <>
                        <div className="flex items-center gap-[8px]">
                          <CheckCircle className="w-[16px] h-[16px] text-[var(--forest-green)]" />
                          <span className="font-label font-bold text-[12px] tracking-[1px] text-[var(--forest-green)]">
                            {videoResult.postsCreated} POST{videoResult.postsCreated !== 1 ? "S" : ""} CREATED AS DRAFT
                          </span>
                        </div>
                        <span className="font-heading text-[13px] text-[var(--text-secondary)]">
                          From: {videoResult.videoTitle}
                        </span>
                        {videoResult.posts?.map((p) => (
                          <div key={p.id} className="flex items-center gap-[8px]">
                            <span className="font-heading text-[14px] text-[var(--text-primary)]">
                              &ldquo;{p.title}&rdquo;
                            </span>
                            <span className="font-label text-[10px] px-[6px] py-[2px] bg-[var(--warm-stone)] text-[var(--text-muted)]">
                              {p.tags.join(", ")}
                            </span>
                            <button
                              onClick={() => fetchInstagramCaption(p.id)}
                              className="flex items-center gap-[4px] font-label text-[11px] tracking-[0.5px] text-[var(--burnt-orange)] cursor-pointer hover:underline"
                            >
                              <Instagram className="w-[12px] h-[12px]" />
                              IG Caption
                            </button>
                          </div>
                        ))}
                        {instagramCaption && (
                          <div className="flex flex-col gap-[8px] mt-[8px] p-[12px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
                            <div className="flex items-center justify-between">
                              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                                INSTAGRAM CAPTION
                              </span>
                              <button
                                onClick={copyCaption}
                                className="flex items-center gap-[4px] font-label text-[11px] text-[var(--forest-green)] cursor-pointer hover:underline"
                              >
                                <Copy className="w-[12px] h-[12px]" />
                                {captionCopied ? "Copied!" : "Copy"}
                              </button>
                            </div>
                            <p className="font-heading text-[13px] text-[var(--text-primary)] leading-[1.6] whitespace-pre-wrap">
                              {instagramCaption}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col gap-[8px]">
                        <div className="flex items-center gap-[8px]">
                          <XCircle className="w-[16px] h-[16px] text-red-500" />
                          <span className="font-heading text-[13px] text-red-600">
                            {videoResult.error}
                          </span>
                        </div>
                        {videoResult.alreadyProcessed && (
                          <button
                            onClick={() => {
                              setVideoForce(true);
                              setVideoResult(null);
                              setTimeout(() => handleGenerateFromVideo(), 100);
                            }}
                            className="self-start font-label font-bold text-[11px] tracking-[1px] px-[12px] py-[6px] bg-[var(--burnt-orange)] text-white cursor-pointer hover:opacity-90"
                          >
                            GENERATE ANYWAY
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Posts list */}
          <div className="flex flex-col bg-[var(--bg-white)] border border-[var(--border-subtle)]">
            {/* Table header — desktop only, hidden on mobile */}
            <div className="hidden md:flex items-center px-[20px] py-[12px] bg-[var(--warm-stone)] border-b border-[var(--border-subtle)]">
              <span className="flex-1 font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                TITLE
              </span>
              <span className="w-[80px] font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                DAY
              </span>
              <span className="w-[120px] font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                DATE
              </span>
              <span className="w-[130px] font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                STATUS
              </span>
              <span className="w-[170px] font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                ACTIONS
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-[48px]">
                <span className="font-heading text-[16px] text-[var(--text-muted)]">
                  Loading...
                </span>
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center gap-[12px] py-[48px] px-[20px] text-center">
                <span className="font-heading text-[16px] text-[var(--text-muted)]">
                  No journal posts yet
                </span>
                <span className="font-heading text-[14px] text-[var(--text-muted)]">
                  Click &quot;NEW POST&quot; to create your first entry
                </span>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col md:flex-row md:items-center gap-[12px] md:gap-0 px-[16px] md:px-[20px] py-[16px] border-b border-[var(--border-subtle)] last:border-b-0"
                >
                  {/* Title + slug */}
                  <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                    <span className="font-heading font-semibold text-[15px] md:text-[14px] text-[var(--text-primary)] md:truncate">
                      {post.title}
                    </span>
                    <span className="font-label text-[11px] text-[var(--text-muted)] truncate">
                      {post.slug}
                    </span>
                  </div>

                  {/* Day + Date — inline row on mobile, separate columns on desktop */}
                  <div className="flex md:hidden items-center gap-[12px] flex-wrap">
                    <span className="font-label font-bold text-[10px] tracking-[1px] text-[var(--burnt-orange)]">
                      DAY {post.dayNumber}
                    </span>
                    <span className="font-label text-[11px] text-[var(--text-muted)]">
                      {post.date}
                    </span>
                  </div>
                  <span className="hidden md:block w-[80px] font-heading text-[14px] text-[var(--text-secondary)]">
                    Day {post.dayNumber}
                  </span>
                  <span className="hidden md:block w-[120px] font-heading text-[13px] text-[var(--text-secondary)]">
                    {post.date}
                  </span>

                  {/* Status + actions row on mobile, separate columns on desktop */}
                  <div className="flex items-center justify-between gap-[8px] md:hidden">
                    <button
                      onClick={() => handleTogglePublish(post)}
                      className={`inline-flex items-center gap-[6px] px-[10px] py-[5px] font-label font-bold text-[10px] tracking-[1px] cursor-pointer hover:opacity-70 transition-opacity ${
                        post.published
                          ? "bg-[var(--forest-green-light)] text-[var(--forest-green)]"
                          : "bg-[var(--burnt-orange-light)] text-[var(--burnt-orange)]"
                      }`}
                      title={post.published ? "Click to unpublish" : "Click to publish"}
                    >
                      {post.published ? "● PUBLISHED" : "○ DRAFT"}
                    </button>
                    <div className="flex gap-[6px]">
                      <a
                        href={`/journal/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-[10px] py-[6px] border border-[var(--border-subtle)] hover:border-[var(--burnt-orange)] transition-colors cursor-pointer flex items-center"
                        title={post.published ? "Open the live published post in a new tab" : "Preview this draft on the live site (admin only)"}
                      >
                        <span className="font-label font-bold text-[10px] tracking-[1px] text-[var(--text-secondary)]">
                          VIEW
                        </span>
                      </a>
                      <button
                        onClick={() => {
                          setEditingPost({ ...post });
                          setView("editor");
                          setStatus("");
                        }}
                        className="px-[10px] py-[6px] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors cursor-pointer"
                      >
                        <span className="font-label font-bold text-[10px] tracking-[1px] text-[var(--text-secondary)]">
                          EDIT
                        </span>
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-[10px] py-[6px] border border-[var(--border-subtle)] hover:border-red-400 transition-colors cursor-pointer"
                        aria-label="Delete post"
                      >
                        <Trash2 className="w-[12px] h-[12px] text-[#8B2020]" />
                      </button>
                    </div>
                  </div>

                  {/* Desktop status column */}
                  <div className="hidden md:block w-[130px]">
                    <button
                      onClick={() => handleTogglePublish(post)}
                      className={`inline-flex items-center gap-[6px] px-[10px] py-[4px] font-label font-bold text-[10px] tracking-[1px] cursor-pointer hover:opacity-70 transition-opacity ${
                        post.published
                          ? "bg-[var(--forest-green-light)] text-[var(--forest-green)]"
                          : "bg-[var(--burnt-orange-light)] text-[var(--burnt-orange)]"
                      }`}
                      title={post.published ? "Click to unpublish" : "Click to publish"}
                    >
                      {post.published ? "● PUBLISHED" : "○ DRAFT"}
                    </button>
                  </div>

                  {/* Desktop actions column */}
                  <div className="hidden md:flex gap-[8px] w-[170px]">
                    <a
                      href={`/journal/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-[12px] py-[6px] border border-[var(--border-subtle)] hover:border-[var(--burnt-orange)] transition-colors cursor-pointer flex items-center"
                      title={post.published ? "Open the live published post in a new tab" : "Preview this draft on the live site (admin only)"}
                    >
                      <span className="font-label font-bold text-[10px] tracking-[1px] text-[var(--text-secondary)] hover:text-[var(--burnt-orange)]">
                        VIEW
                      </span>
                    </a>
                    <button
                      onClick={() => {
                        setEditingPost({ ...post });
                        setView("editor");
                        setStatus("");
                      }}
                      className="px-[12px] py-[6px] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors cursor-pointer"
                    >
                      <span className="font-label font-bold text-[10px] tracking-[1px] text-[var(--text-secondary)]">
                        EDIT
                      </span>
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="px-[12px] py-[6px] border border-[var(--border-subtle)] hover:border-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-[12px] h-[12px] text-[#8B2020]" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
    );
  }

  // --- EDITOR VIEW ---
  if (view === "editor" && editingPost) {
    const isNew = !editingPost.id;
    const toggleTag = (tag: string) => {
      const current = editingPost.tags || [];
      setEditingPost({
        ...editingPost,
        tags: current.includes(tag)
          ? current.filter((t) => t !== tag)
          : [...current, tag],
      });
    };

    return (
      <div className="flex flex-col w-full min-h-screen bg-[var(--bg-warm)]">
        {/* Top bar — wraps to two rows on mobile, single row on desktop */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-[10px] md:gap-0 px-[16px] md:px-[40px] py-[12px] md:py-0 md:h-[64px] bg-[var(--bg-white)] border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-[10px] md:gap-[12px] min-w-0">
            <button
              onClick={() => {
                setView("list");
                setEditingPost(null);
                setStatus("");
              }}
              className="flex items-center gap-[6px] px-[10px] md:px-[12px] py-[8px] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
              <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-secondary)]">
                BACK
              </span>
            </button>
            <div className="hidden md:block w-[1px] h-[24px] bg-[var(--border-subtle)]" />
            <span className="font-heading font-semibold text-[16px] md:text-[18px] text-[var(--text-primary)] truncate">
              {isNew ? "New Post" : "Edit Post"}
            </span>
          </div>
          <div className="flex flex-wrap gap-[8px] md:gap-[12px]">
            {/* View — opens the live page in a new tab (admin can preview drafts) */}
            {!isNew && editingPost.slug && (
              <a
                href={`/journal/${editingPost.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-[6px] px-[14px] md:px-[20px] py-[10px] md:py-[12px] border border-[var(--border-subtle)] hover:border-[var(--burnt-orange)] hover:text-[var(--burnt-orange)] transition-colors cursor-pointer"
                title="Open this post on the live site in a new tab"
              >
                <span className="font-label font-bold text-[11px] md:text-[12px] tracking-[1.5px] md:tracking-[2px] text-[var(--text-secondary)] hover:text-[var(--burnt-orange)]">
                  VIEW
                </span>
              </a>
            )}
            {/* Regenerate — only available for posts created from a YouTube URL */}
            {!isNew && editingPost.youtubeUrl && (
              <button
                onClick={() => {
                  setRegenError("");
                  setRegenModalOpen(true);
                }}
                disabled={loading || regenLoading}
                className="flex items-center gap-[6px] px-[14px] md:px-[20px] py-[10px] md:py-[12px] border border-[var(--burnt-orange)] hover:bg-[var(--burnt-orange-light)] transition-colors disabled:opacity-50 cursor-pointer"
                title="Regenerate this post from the source YouTube video using AI"
              >
                <Zap className="w-[14px] h-[14px] text-[var(--burnt-orange)]" />
                <span className="font-label font-bold text-[11px] md:text-[12px] tracking-[1.5px] md:tracking-[2px] text-[var(--burnt-orange)]">
                  REGENERATE
                </span>
              </button>
            )}
            <button
              onClick={() => handleSave(false)}
              disabled={loading}
              className="flex items-center gap-[6px] px-[14px] md:px-[24px] py-[10px] md:py-[12px] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <span className="font-label font-bold text-[11px] md:text-[12px] tracking-[1.5px] md:tracking-[2px] text-[var(--text-secondary)]">
                {loading ? "SAVING..." : "SAVE DRAFT"}
              </span>
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={loading}
              className="flex items-center gap-[6px] px-[14px] md:px-[24px] py-[10px] md:py-[12px] bg-[var(--forest-green)] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-[14px] h-[14px] text-white" />
              <span className="font-label font-bold text-[11px] md:text-[12px] tracking-[1.5px] md:tracking-[2px] text-white">
                {loading ? "PUBLISHING..." : "PUBLISH"}
              </span>
            </button>
          </div>
        </div>

        {status && (
          <div className="px-[16px] md:px-[40px] pt-[16px]">
            <span className="font-label text-[13px] text-red-500">
              {status}
            </span>
          </div>
        )}

        {/* Form area — stacks vertically on mobile (sidebar above body), side-by-side on desktop */}
        <div className="flex flex-col lg:flex-row gap-[16px] md:gap-[24px] lg:gap-[32px] p-[16px] md:p-[40px]">
          {/* Main column */}
          <div className="flex flex-col gap-[20px] md:gap-[24px] flex-1 min-w-0 order-2 lg:order-1">
            {/* Title */}
            <div className="flex flex-col gap-[6px]">
              <label className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                Title
              </label>
              <input
                type="text"
                value={editingPost.title || ""}
                onChange={(e) =>
                  setEditingPost({ ...editingPost, title: e.target.value })
                }
                placeholder="Enter post title..."
                className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-white)]"
              />
            </div>

            {/* Body */}
            <div className="flex flex-col gap-[6px]">
              <label className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                Body (Markdown)
              </label>
              <textarea
                value={editingPost.body || ""}
                onChange={(e) =>
                  setEditingPost({ ...editingPost, body: e.target.value })
                }
                placeholder="Write your journal entry in Markdown..."
                rows={16}
                className="w-full px-[16px] py-[16px] border border-[var(--border-subtle)] font-heading text-[14px] leading-[1.6] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-white)] resize-y"
              />
            </div>

            {/* Excerpt */}
            <div className="flex flex-col gap-[6px]">
              <label className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                Excerpt
              </label>
              <span className="font-label text-[11px] text-[var(--text-muted)]">
                Brief preview text. Auto-generated from body if left empty.
              </span>
              <textarea
                value={editingPost.excerpt || ""}
                onChange={(e) =>
                  setEditingPost({ ...editingPost, excerpt: e.target.value })
                }
                placeholder="Optional preview text..."
                rows={3}
                className="w-full px-[16px] py-[12px] border border-[var(--border-subtle)] font-heading text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-white)] resize-y"
              />
            </div>
          </div>

          {/* Side column — full width on mobile (above body), 320px sidebar on desktop */}
          <div className="flex flex-col gap-[20px] md:gap-[24px] w-full lg:w-[320px] shrink-0 order-1 lg:order-2">
            {/* Post Details card */}
            <div className="flex flex-col gap-[16px] p-[20px] md:p-[24px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
              <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
                POST DETAILS
              </span>
              <div className="flex flex-col gap-[6px]">
                <label className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                  Day Number
                </label>
                <input
                  type="number"
                  value={editingPost.dayNumber || ""}
                  onChange={(e) =>
                    setEditingPost({
                      ...editingPost,
                      dayNumber: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="e.g. 15"
                  className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-card)]"
                />
              </div>

              {/* Trail Mile — anchors the post to a position on the trail map */}
              {(() => {
                const dayNum = editingPost.dayNumber;
                const lookupMile =
                  typeof dayNum === "number" ? getMileForDay(dayNum) : null;
                const lastTracked = getLastTrackedDay();
                return (
                  <div className="flex flex-col gap-[6px]">
                    <label className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                      Trail Mile
                    </label>
                    <div className="flex gap-[8px]">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="2650"
                        value={editingPost.mileMarker ?? ""}
                        onChange={(e) =>
                          setEditingPost({
                            ...editingPost,
                            mileMarker: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                        placeholder="e.g. 49.2"
                        className="flex-1 h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-card)]"
                      />
                      {lookupMile !== null && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingPost({
                              ...editingPost,
                              mileMarker: lookupMile,
                            })
                          }
                          className="px-[12px] h-[48px] border border-[var(--burnt-orange)] hover:bg-[var(--burnt-orange-light)] cursor-pointer transition-colors"
                          title={`Use the lookup table value for Day ${dayNum}: Mile ${lookupMile}`}
                        >
                          <span className="font-label font-bold text-[10px] tracking-[1px] text-[var(--burnt-orange)]">
                            USE&nbsp;LOOKUP
                          </span>
                        </button>
                      )}
                    </div>
                    <span className="font-label text-[11px] text-[var(--text-muted)] leading-[1.5]">
                      {lookupMile !== null && typeof dayNum === "number" ? (
                        <>
                          <strong className="text-[var(--burnt-orange)]">Lookup:</strong> Day {dayNum} → Mile {lookupMile}
                        </>
                      ) : typeof dayNum === "number" ? (
                        <>
                          Day {dayNum} not in lookup table yet (covers Day 0–{lastTracked}). Type a mile manually.
                        </>
                      ) : (
                        <>Set Day Number first to enable lookup.</>
                      )}
                      <br />
                      Anchors this post on the trail map. Visible only after Paul passes this mile.
                    </span>
                  </div>
                );
              })()}

              <div className="flex flex-col gap-[6px]">
                <label className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                  Date
                </label>
                <input
                  type="date"
                  value={editingPost.date || ""}
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, date: e.target.value })
                  }
                  className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] outline-none bg-[var(--bg-card)]"
                />
              </div>
            </div>

            {/* Media card */}
            <div className="flex flex-col gap-[16px] p-[24px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
              <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
                MEDIA
              </span>
              <div className="flex flex-col gap-[6px]">
                <label className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={editingPost.coverImage || ""}
                  onChange={(e) =>
                    setEditingPost({
                      ...editingPost,
                      coverImage: e.target.value,
                    })
                  }
                  placeholder="https://..."
                  className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-card)]"
                />
              </div>
              {editingPost.coverImage && (
                <img
                  src={editingPost.coverImage}
                  alt="Cover preview"
                  className="w-full h-[120px] object-cover border border-[var(--border-subtle)]"
                />
              )}
              <div className="flex flex-col gap-[6px]">
                <label className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                  YouTube URL (Optional)
                </label>
                <input
                  type="url"
                  value={editingPost.youtubeUrl || ""}
                  onChange={(e) =>
                    setEditingPost({
                      ...editingPost,
                      youtubeUrl: e.target.value,
                    })
                  }
                  placeholder="https://youtube.com/..."
                  className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-card)]"
                />
              </div>
            </div>

            {/* Tags card */}
            <div className="flex flex-col gap-[16px] p-[24px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
              <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
                TAGS
              </span>
              <span className="font-label text-[11px] text-[var(--text-muted)]">
                Select one or more content types
              </span>
              <div className="flex gap-[8px]">
                {["BLOG", "VLOG", "INTERVIEWS", "PHOTOS"].map((tag) => {
                  const active = (editingPost.tags || []).includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-[16px] py-[8px] font-label font-bold text-[11px] tracking-[1px] cursor-pointer transition-colors ${
                        active
                          ? "bg-[var(--forest-green-light)] text-[var(--forest-green)]"
                          : "border border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--text-secondary)]"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prevention Topics */}
            <div className="flex flex-col gap-[8px]">
              <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
                PREVENTION TOPICS (OPTIONAL)
              </span>
              <span className="font-label text-[11px] text-[var(--text-muted)]">
                Tag posts with prevention topics — these link from The Cause page cards
              </span>
              <div className="flex flex-wrap gap-[8px]">
                {[
                  { tag: "stay-active", label: "Stay Active" },
                  { tag: "eat-well", label: "Eat Well" },
                  { tag: "sun-safety", label: "Sun Safety" },
                  { tag: "get-screened", label: "Get Screened" },
                  { tag: "quit-smoking", label: "Quit Smoking" },
                  { tag: "know-your-body", label: "Know Your Body" },
                ].map(({ tag, label }) => {
                  const active = (editingPost.tags || []).includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-[14px] py-[6px] font-label font-bold text-[10px] tracking-[1px] cursor-pointer transition-colors ${
                        active
                          ? "bg-[var(--burnt-orange-light)] text-[var(--burnt-orange)]"
                          : "border border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--burnt-orange)]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delete button (existing posts only) */}
            {!isNew && (
              <button
                onClick={() => {
                  handleDelete(editingPost.id!).then(() => {
                    setView("list");
                    setEditingPost(null);
                  });
                }}
                className="flex items-center justify-center gap-[8px] py-[12px] border border-red-200 hover:border-red-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-[14px] h-[14px] text-[#8B2020]" />
                <span className="font-label font-bold text-[12px] tracking-[2px] text-[#8B2020]">
                  DELETE POST
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Regenerate Modal */}
        {regenModalOpen && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4"
            onClick={(e) => {
              if (e.target === e.currentTarget && !regenLoading) {
                setRegenModalOpen(false);
              }
            }}
          >
            <div className="bg-[var(--bg-white)] border border-[var(--border-subtle)] shadow-2xl w-full max-w-[640px] max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-[10px]">
                  <Zap className="w-[18px] h-[18px] text-[var(--burnt-orange)]" />
                  <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-primary)]">
                    REGENERATE BLOG POST
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (!regenLoading) setRegenModalOpen(false);
                  }}
                  disabled={regenLoading}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer disabled:opacity-50"
                  aria-label="Close"
                >
                  <XCircle className="w-[20px] h-[20px]" />
                </button>
              </div>

              <div className="flex flex-col gap-[20px] p-[24px]">
                <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)]">
                  This will rewrite the post from the original YouTube video, taking a different angle than the current version. The current post will be <strong>overwritten in place</strong> — same URL, same day number, same publish status.
                </p>

                {/* Pills */}
                <div className="flex flex-col gap-[10px]">
                  <label className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                    QUICK ADJUSTMENTS (PICK ANY)
                  </label>
                  <div className="flex flex-wrap gap-[8px]">
                    {[
                      { id: "shorter", label: "Shorter" },
                      { id: "longer", label: "Longer" },
                      { id: "more-emotional", label: "More emotional" },
                      { id: "more-factual", label: "More factual" },
                      { id: "more-reflective", label: "More reflective" },
                      { id: "more-sensory", label: "More sensory" },
                      { id: "more-humor", label: "More humor" },
                      { id: "different-angle", label: "Different angle" },
                    ].map(({ id, label }) => {
                      const active = regenPills.includes(id);
                      return (
                        <button
                          key={id}
                          onClick={() => toggleRegenPill(id)}
                          disabled={regenLoading}
                          className={`px-[14px] py-[7px] font-label font-bold text-[11px] tracking-[1px] transition-colors disabled:opacity-50 cursor-pointer ${
                            active
                              ? "bg-[var(--burnt-orange)] text-white"
                              : "border border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--burnt-orange)] hover:text-[var(--burnt-orange)]"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Free-text instructions */}
                <div className="flex flex-col gap-[6px]">
                  <label className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                    EXTRA INSTRUCTIONS (OPTIONAL)
                  </label>
                  <textarea
                    value={regenInstructions}
                    onChange={(e) => setRegenInstructions(e.target.value)}
                    placeholder="e.g. 'Focus on the moment Paul saw the sunset' or 'Don't mention the cancer foundations this time, save it for the next post'"
                    rows={4}
                    disabled={regenLoading}
                    className="w-full px-[14px] py-[12px] border border-[var(--border-subtle)] font-heading text-[14px] leading-[1.6] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-card)] resize-y disabled:opacity-50"
                  />
                  <span className="font-heading text-[12px] text-[var(--text-muted)]">
                    The model will see your previous version as context and is told to take a different approach.
                  </span>
                </div>

                {regenError && (
                  <div className="p-[12px] bg-red-50 border border-red-300">
                    <span className="font-heading text-[13px] text-red-700">
                      ✗ {regenError}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-[12px] px-[24px] py-[16px] border-t border-[var(--border-subtle)] bg-[var(--bg-warm)]">
                <button
                  onClick={() => {
                    if (!regenLoading) setRegenModalOpen(false);
                  }}
                  disabled={regenLoading}
                  className="px-[20px] py-[10px] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-secondary)]">
                    CANCEL
                  </span>
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={regenLoading}
                  className="flex items-center gap-[8px] px-[24px] py-[10px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                  {regenLoading ? (
                    <Loader2 className="w-[14px] h-[14px] text-white animate-spin" />
                  ) : (
                    <Zap className="w-[14px] h-[14px] text-white" />
                  )}
                  <span className="font-label font-bold text-[12px] tracking-[2px] text-white">
                    {regenLoading ? "REGENERATING..." : "REGENERATE"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- CHALLENGES VIEW ---
  if (view === "challenges" && authenticated) {
    return adminShell(
        <div className="flex flex-col gap-[20px] md:gap-[24px] p-[16px] md:p-[40px]">
          <div className="flex flex-col gap-[8px]">
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
              TRAIL CHALLENGES
            </span>
            <h1 className="font-heading font-semibold text-[28px] text-[var(--text-primary)]">
              Manage Challenges
            </h1>
          </div>

          {/* How it works */}
          <div className="flex flex-col gap-[16px] p-[24px] bg-[var(--forest-green-light)] border border-[var(--forest-green)]">
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--forest-green)]">HOW CHALLENGES WORK</span>
            <div className="flex flex-col gap-[10px] font-heading text-[14px] leading-[1.7] text-[var(--text-secondary)]">
              <p>
                <strong className="text-[var(--text-primary)]">1. Paul creates a challenge</strong> — Set a title, target, and a time limit. Challenges can be anything: miles, elevation gain, peaks to climb, locations to visit, or custom goals (e.g. &ldquo;Desert Push: 30 mi in 24 hours&rdquo; or &ldquo;Summit Mt. Whitney&rdquo;). The challenge goes live immediately.
              </p>
              <p>
                <strong className="text-[var(--text-primary)]">2. Visitors see it on the site</strong> — A live challenge banner replaces the countdown on every page. It shows the challenge name, progress bar, and time remaining. Visitors can &ldquo;boost&rdquo; the challenge by committing extra pledge amounts (e.g. +$0.05/mi) as motivation.
              </p>
              <p>
                <strong className="text-[var(--text-primary)]">3. Paul completes the challenge</strong> — For distance challenges, progress updates automatically via GPS. For peaks, locations, or custom challenges, Paul marks progress manually.
              </p>
              <p>
                <strong className="text-[var(--text-primary)]">4. Paul resolves the challenge</strong> — When done, mark it as <strong className="text-[var(--forest-green)]">Succeeded</strong>, <strong className="text-red-600">Failed</strong>, or <strong className="text-[var(--text-muted)]">Cancelled</strong>. If succeeded, all boosts are locked in and added to those pledgers&apos; commitments. If failed or cancelled, boosts are released.
              </p>
              <p className="text-[13px] text-[var(--text-muted)] italic">
                Only one challenge can be active at a time. Past challenges appear in the history on the right.
              </p>
            </div>
          </div>

          {status && (
            <span className="font-label text-[13px] text-[var(--forest-green)]">
              {status}
            </span>
          )}

          <div className="flex flex-col lg:flex-row gap-[24px]">
            {/* Left column: Active challenge or create form */}
            <div className="flex flex-col gap-[24px] flex-1">
              {activeChallenge ? (
                /* Active Challenge Card */
                <div className="flex flex-col gap-[16px] p-[20px] md:p-[28px] bg-[var(--bg-white)] border-2 border-[var(--burnt-orange)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[10px]">
                      <div className="w-[10px] h-[10px] rounded-full bg-red-500 animate-pulse" />
                      <span className="font-label font-bold text-[11px] tracking-[2px] text-red-600">
                        LIVE CHALLENGE
                      </span>
                    </div>
                    <span className="font-label font-bold text-[10px] tracking-[1px] text-[var(--text-muted)]">
                      {activeChallenge.commitmentCount} BOOST{activeChallenge.commitmentCount !== 1 ? "S" : ""} COMMITTED
                    </span>
                  </div>

                  <h2 className="font-heading font-semibold text-[24px] text-[var(--text-primary)]">
                    {activeChallenge.title}
                  </h2>

                  {activeChallenge.description && (
                    <p className="font-heading text-[14px] text-[var(--text-secondary)] leading-[1.6]">
                      {activeChallenge.description}
                    </p>
                  )}

                  <div className="flex flex-col gap-[8px]">
                    <div className="flex justify-between">
                      <span className="font-heading text-[13px] text-[var(--text-secondary)]">
                        Target: {activeChallenge.target} {activeChallenge.unit}{activeChallenge.start > 0 ? ` from ${activeChallenge.start} ${activeChallenge.unit}` : ""}
                      </span>
                      <span className="font-heading font-semibold text-[13px] text-[var(--text-primary)]">
                        {Math.max(0, activeChallenge.current - activeChallenge.start).toFixed(1)} / {activeChallenge.target} {activeChallenge.unit}
                      </span>
                    </div>
                    <div className="relative w-full h-[8px] bg-[var(--warm-stone)]">
                      <div
                        className="absolute top-0 left-0 h-[8px] bg-[var(--burnt-orange)] transition-all duration-500"
                        style={{
                          width: `${Math.min(100, ((activeChallenge.current - activeChallenge.start) / activeChallenge.target) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <Clock className="w-[14px] h-[14px] text-[var(--text-muted)]" />
                      <span className="font-heading text-[13px] text-[var(--text-muted)]">
                        Deadline: {new Date(activeChallenge.deadline).toLocaleString("en-US")}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-[var(--border-subtle)]" />

                  <div className="flex gap-[12px]">
                    <button
                      onClick={() => handleResolveChallenge("succeed")}
                      disabled={loading}
                      className="flex items-center gap-[8px] px-[20px] py-[10px] bg-[var(--forest-green)] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                    >
                      <Trophy className="w-[14px] h-[14px] text-white" />
                      <span className="font-label font-bold text-[11px] tracking-[2px] text-white">
                        SUCCEEDED
                      </span>
                    </button>
                    <button
                      onClick={() => handleResolveChallenge("fail")}
                      disabled={loading}
                      className="flex items-center gap-[8px] px-[20px] py-[10px] border border-[var(--border-subtle)] hover:border-red-400 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <XCircle className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
                      <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-secondary)]">
                        FAILED
                      </span>
                    </button>
                    <button
                      onClick={() => handleResolveChallenge("cancel")}
                      disabled={loading}
                      className="flex items-center gap-[8px] px-[20px] py-[10px] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
                        CANCEL
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Create Challenge Form */
                <div className="flex flex-col gap-[20px] p-[20px] md:p-[28px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
                  <div className="flex items-center gap-[10px]">
                    <Target className="w-[18px] h-[18px] text-[var(--burnt-orange)]" />
                    <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
                      CREATE NEW CHALLENGE
                    </span>
                  </div>

                  <div className="flex flex-col gap-[6px]">
                    <label className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                      Challenge Title
                    </label>
                    <input
                      type="text"
                      value={challengeForm.title}
                      onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })}
                      placeholder="e.g. Desert Push: 40 Miles in 24 Hours"
                      className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-card)]"
                    />
                  </div>

                  <div className="flex flex-col gap-[6px]">
                    <label className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                      Description
                    </label>
                    <textarea
                      value={challengeForm.description}
                      onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })}
                      placeholder="Describe the challenge..."
                      rows={3}
                      className="w-full px-[16px] py-[12px] border border-[var(--border-subtle)] font-heading text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-card)] resize-y"
                    />
                  </div>

                  <div className="flex gap-[16px]">
                    <div className="flex flex-col gap-[6px] flex-1">
                      <label className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                        Challenge Type
                      </label>
                      <select
                        value={challengeForm.challengeType}
                        onChange={(e) => {
                          const ct = e.target.value as "distance" | "elevation" | "location" | "custom";
                          const defaults: Record<string, { unit: string; target: number; start: number }> = {
                            distance: { unit: "mi", target: 30, start: 0 },
                            elevation: { unit: "ft", target: 5000, start: 0 },
                            location: { unit: "", target: 1, start: 0 },
                            custom: { unit: "", target: 1, start: 0 },
                          };
                          const d = defaults[ct];
                          setChallengeForm({ ...challengeForm, challengeType: ct, unit: d.unit, target: d.target, start: d.start });
                        }}
                        className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] outline-none bg-[var(--bg-card)]"
                      >
                        <option value="distance">Distance (mi)</option>
                        <option value="elevation">Elevation (ft)</option>
                        <option value="location">Location</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-[6px] flex-1">
                      <label className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                        Unit Label
                      </label>
                      <input
                        type="text"
                        value={challengeForm.unit}
                        onChange={(e) => setChallengeForm({ ...challengeForm, unit: e.target.value })}
                        placeholder="e.g. mi, ft, peaks"
                        className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-card)]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-[16px]">
                    <div className="flex flex-col gap-[6px] flex-1">
                      <label className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                        Target
                      </label>
                      <input
                        type="number"
                        value={challengeForm.target}
                        onChange={(e) => setChallengeForm({ ...challengeForm, target: Number(e.target.value) })}
                        min={1}
                        className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] outline-none bg-[var(--bg-card)]"
                      />
                    </div>
                    {challengeForm.challengeType !== "location" && (
                      <div className="flex flex-col gap-[6px] flex-1">
                        <label className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                          Start
                        </label>
                        <input
                          type="number"
                          value={challengeForm.start}
                          onChange={(e) => setChallengeForm({ ...challengeForm, start: Number(e.target.value) })}
                          min={0}
                          className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] outline-none bg-[var(--bg-card)]"
                        />
                      </div>
                    )}
                    <div className="flex flex-col gap-[6px] flex-1">
                      <label className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                        Duration (hours)
                      </label>
                      <input
                        type="number"
                        value={challengeForm.durationHours}
                        onChange={(e) => setChallengeForm({ ...challengeForm, durationHours: Number(e.target.value) })}
                        min={1}
                        max={168}
                        className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] outline-none bg-[var(--bg-card)]"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleCreateChallenge}
                    disabled={loading || !challengeForm.title.trim()}
                    className="flex items-center justify-center gap-[8px] h-[48px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                  >
                    <Zap className="w-[16px] h-[16px] text-white" />
                    <span className="font-label font-bold text-[13px] tracking-[2px] text-white">
                      {loading ? "CREATING..." : "START CHALLENGE"}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Right column: Challenge History */}
            <div className="flex flex-col gap-[16px] w-full lg:w-[380px] shrink-0">
              <div className="flex flex-col gap-[16px] p-[24px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
                <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
                  CHALLENGE HISTORY
                </span>

                {challengeHistory.length === 0 ? (
                  <p className="font-heading text-[13px] text-[var(--text-muted)] italic">
                    No completed challenges yet.
                  </p>
                ) : (
                  challengeHistory.map((ch) => (
                    <div key={ch.id} className="flex flex-col gap-[6px] pb-[12px] border-b border-[var(--border-subtle)] last:border-b-0">
                      <div className="flex items-center gap-[8px]">
                        {ch.status === "succeeded" ? (
                          <CheckCircle className="w-[14px] h-[14px] text-[var(--forest-green)]" />
                        ) : ch.status === "failed" ? (
                          <XCircle className="w-[14px] h-[14px] text-red-500" />
                        ) : (
                          <XCircle className="w-[14px] h-[14px] text-[var(--text-muted)]" />
                        )}
                        <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                          {ch.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-[12px] ml-[22px]">
                        <span className={`font-label font-bold text-[10px] tracking-[1px] px-[8px] py-[2px] ${
                          ch.status === "succeeded"
                            ? "bg-[var(--forest-green-light)] text-[var(--forest-green)]"
                            : ch.status === "failed"
                            ? "bg-red-50 text-red-600"
                            : "bg-gray-100 text-[var(--text-muted)]"
                        }`}>
                          {ch.status.toUpperCase()}
                        </span>
                        <span className="font-heading text-[12px] text-[var(--text-muted)]">
                          {ch.commitmentCount} boost{ch.commitmentCount !== 1 ? "s" : ""}
                        </span>
                        {ch.resolvedAt && (
                          <span className="font-heading text-[12px] text-[var(--text-muted)]">
                            {new Date(ch.resolvedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
    );
  }

  if (view === "honor" && authenticated) {
    return adminShell(
        <div className="flex flex-col gap-[20px] md:gap-[24px] p-[16px] md:p-[40px]">
          <div className="flex flex-col gap-[8px]">
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
              PLEDGE HONOR RATE
            </span>
            <h1 className="font-heading font-semibold text-[28px] text-[var(--text-primary)]">
              Honor Tracking Dashboard
            </h1>
          </div>

          {honorLoading ? (
            <span className="font-heading text-[14px] text-[var(--text-muted)]">Loading stats...</span>
          ) : honorStats ? (
            <div className="flex flex-col gap-[24px]">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px]">
                <div className="flex flex-col gap-[8px] bg-[var(--bg-white)] border border-[var(--border-subtle)] p-[24px]">
                  <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">HONOR RATE</span>
                  <span className="font-heading font-semibold text-[36px] text-[var(--forest-green)]">{honorStats.honorRate}%</span>
                </div>
                <div className="flex flex-col gap-[8px] bg-[var(--bg-white)] border border-[var(--border-subtle)] p-[24px]">
                  <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">HONORED</span>
                  <span className="font-heading font-semibold text-[36px] text-[var(--burnt-orange)]">{honorStats.honoredCount}</span>
                  <span className="font-heading text-[12px] text-[var(--text-muted)]">of {honorStats.pledgerCount} pledgers</span>
                </div>
                <div className="flex flex-col gap-[8px] bg-[var(--bg-white)] border border-[var(--border-subtle)] p-[24px]">
                  <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">NOT YET HONORED</span>
                  <span className="font-heading font-semibold text-[36px] text-[var(--text-secondary)]">{honorStats.pledgerCount - honorStats.honoredCount}</span>
                </div>
                <div className="flex flex-col gap-[8px] bg-[var(--bg-white)] border border-[var(--border-subtle)] p-[24px]">
                  <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">TOTAL PLEDGED</span>
                  <span className="font-heading font-semibold text-[36px] text-[var(--text-primary)]">
                    ${honorStats.totalPledged.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex flex-col gap-[8px] bg-[var(--bg-white)] border border-[var(--border-subtle)] p-[24px]">
                <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">HONOR PROGRESS</span>
                <div className="relative w-full h-[16px] bg-[var(--warm-stone)]">
                  <div
                    className="absolute top-0 left-0 h-[16px] bg-[var(--forest-green)] transition-all duration-1000"
                    style={{ width: `${Math.min(100, honorStats.honorRate)}%` }}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="font-heading text-[12px] text-[var(--text-muted)]">0%</span>
                  <span className="font-heading font-semibold text-[12px] text-[var(--forest-green)]">{honorStats.honorRate}% honored</span>
                  <span className="font-heading text-[12px] text-[var(--text-muted)]">100%</span>
                </div>
              </div>

              <button
                onClick={fetchHonorStats}
                className="flex items-center gap-[8px] px-[20px] py-[10px] border border-[var(--border-subtle)] hover:bg-[var(--bg-white)] transition-colors cursor-pointer w-fit"
              >
                <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-secondary)]">
                  REFRESH STATS
                </span>
              </button>
            </div>
          ) : (
            <span className="font-heading text-[14px] text-[var(--text-muted)]">No honor data available yet.</span>
          )}
        </div>
    );
  }

  // --- WAITLIST VIEW ---
  if (view === "waitlist" && authenticated) {
    return adminShell(
        <div className="flex flex-col gap-[20px] md:gap-[24px] p-[16px] md:p-[40px]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-[8px]">
              <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
                WAITLIST
              </span>
              <h1 className="font-heading font-semibold text-[28px] text-[var(--text-primary)]">
                Email Signups
              </h1>
            </div>
            <button
              onClick={() => { fetchWaitlist(); fetchLaunchStatus(); }}
              className="flex items-center gap-[8px] px-[20px] py-[10px] border border-[var(--border-subtle)] hover:bg-[var(--bg-white)] transition-colors cursor-pointer"
            >
              <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-secondary)]">
                REFRESH
              </span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
            <div className="flex flex-col gap-[8px] bg-[var(--bg-white)] border border-[var(--border-subtle)] p-[24px]">
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">TOTAL SIGNUPS</span>
              <span className="font-heading font-semibold text-[36px] text-[var(--burnt-orange)]">
                {waitlistLoading ? "..." : waitlistEmails.length}
              </span>
            </div>
            <div className="flex flex-col gap-[8px] bg-[var(--bg-white)] border border-[var(--border-subtle)] p-[24px]">
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">LATEST SIGNUP</span>
              <span className="font-heading font-semibold text-[16px] text-[var(--text-primary)]">
                {waitlistLoading ? "..." : waitlistEmails.length > 0
                  ? new Date(waitlistEmails[0].signedUpAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
                  : "None yet"}
              </span>
            </div>
            <div className="flex flex-col gap-[8px] bg-[var(--bg-white)] border border-[var(--border-subtle)] p-[24px]">
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">STATUS</span>
              <span className="font-heading font-semibold text-[16px] text-[var(--forest-green)]">
                Collecting emails
              </span>
            </div>
          </div>

          {/* Launch Invite Blast Panel */}
          <div className="flex flex-col gap-[18px] p-[20px] md:p-[28px] bg-[var(--bg-white)] border-2 border-[var(--burnt-orange)]">
            <div className="flex flex-col gap-[6px]">
              <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">
                LAUNCH INVITE — ONE-TIME BLAST
              </span>
              <h2 className="font-heading font-semibold text-[20px] md:text-[22px] text-[var(--text-primary)]">
                Send the &ldquo;site is live&rdquo; email to the waitlist
              </h2>
              <p className="font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)] max-w-[640px]">
                Pick one of three voice variants and blast it to every email on the waitlist. This is a <strong>one-shot</strong> action &mdash; once any variant has been sent, the lock prevents all three from being sent again. Preview each one in the Emails tab before sending.
              </p>
            </div>

            {launchStatusLoading && !launchStatus ? (
              <span className="font-heading text-[13px] text-[var(--text-muted)]">Loading launch status&hellip;</span>
            ) : launchStatus?.lock ? (
              /* Already sent (or in flight) — locked state */
              <div className="flex flex-col gap-[8px] p-[16px] bg-[var(--forest-green-light)] border border-[var(--forest-green)]">
                <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--forest-green)]">
                  {launchStatus.lock.sending ? "SENDING IN PROGRESS" : "ALREADY SENT — LOCKED"}
                </span>
                <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-primary)]">
                  {launchStatus.lock.sending
                    ? `A blast is currently in flight (variant ${launchStatus.lock.variant ?? "?"} to ${launchStatus.lock.totalRecipients ?? "?"} recipients). Refresh in a moment.`
                    : <>
                        Option <strong>{launchStatus.lock.variant ?? "?"}</strong> was sent to <strong>{launchStatus.lock.sent ?? "?"}/{launchStatus.lock.totalRecipients ?? "?"}</strong> waitlist subscribers
                        {launchStatus.lock.sentAt ? ` on ${new Date(launchStatus.lock.sentAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}` : ""}.
                        {launchStatus.lock.failed ? ` ${launchStatus.lock.failed} failed.` : ""}
                      </>}
                </p>
                <p className="font-heading text-[12px] leading-[1.6] text-[var(--text-muted)]">
                  This panel is locked. To unlock (e.g. for a re-send after deliberately clearing the lock), delete the <code className="font-label text-[11px] bg-[var(--bg-card)] px-[4px] py-[1px] border border-[var(--border-subtle)]">waitlist:launch:sent</code> key from Redis.
                </p>
              </div>
            ) : (
              <>
                {/* Kill-switch warning */}
                {launchStatus && !launchStatus.bulkEmailsEnabled && (
                  <div className="flex flex-col gap-[6px] p-[14px] bg-amber-50 border border-amber-300">
                    <span className="font-label font-bold text-[10px] tracking-[2px] text-amber-800">
                      BULK EMAILS DISABLED
                    </span>
                    <p className="font-heading text-[13px] leading-[1.6] text-amber-900">
                      The <code className="font-label text-[11px] bg-white px-[4px] py-[1px] border border-amber-300">EMAILS_ENABLED</code> env var is not set to <code className="font-label text-[11px] bg-white px-[4px] py-[1px] border border-amber-300">true</code> in Vercel. The send button below will return a 503 until that&rsquo;s changed and the site is redeployed.
                    </p>
                  </div>
                )}

                {/* Variant picker */}
                <div className="flex flex-col gap-[10px]">
                  <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                    PICK A VARIANT
                  </span>
                  {[
                    { id: "A", title: "Option A — Pledge-focused", desc: "Leads with \"Pledge per mile\" as the primary CTA. Trail support mentioned as a softer P.S." },
                    { id: "B", title: "Option B — Two equal CTAs", desc: "Presents Pledge and Support side-by-side as equally valid choices." },
                    { id: "C", title: "Option C — Soft launch", desc: "No ask, just \"we're live, come explore.\" Drives to the homepage." },
                  ].map((v) => (
                    <label
                      key={v.id}
                      className={`flex items-start gap-[12px] p-[14px] border cursor-pointer transition-colors ${
                        launchVariant === v.id
                          ? "border-[var(--burnt-orange)] bg-[var(--burnt-orange-light)]"
                          : "border-[var(--border-subtle)] hover:border-[var(--text-secondary)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="launch-variant"
                        value={v.id}
                        checked={launchVariant === v.id}
                        onChange={() => setLaunchVariant(v.id as "A" | "B" | "C")}
                        className="mt-[4px] accent-[var(--burnt-orange)] cursor-pointer"
                      />
                      <div className="flex flex-col gap-[2px]">
                        <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                          {v.title}
                        </span>
                        <span className="font-heading text-[12px] leading-[1.6] text-[var(--text-secondary)]">
                          {v.desc}
                        </span>
                      </div>
                    </label>
                  ))}
                  <p className="font-heading text-[12px] text-[var(--text-muted)]">
                    Preview each variant in the <strong>Emails</strong> tab (look for &ldquo;Waitlist launch&rdquo; under Content publishing) before sending.
                  </p>
                </div>

                {/* Send button */}
                <div className="flex flex-col gap-[10px] pt-[8px] border-t border-[var(--border-subtle)]">
                  <button
                    onClick={sendLaunchBlast}
                    disabled={launchSending || !launchStatus || launchStatus.recipientCount === 0}
                    className="self-start flex items-center gap-[10px] px-[24px] py-[12px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span className="font-label font-bold text-[12px] tracking-[2px] text-white">
                      {launchSending
                        ? "SENDING…"
                        : `SEND OPTION ${launchVariant} TO ${launchStatus?.recipientCount ?? 0} RECIPIENT${launchStatus?.recipientCount === 1 ? "" : "S"}`}
                    </span>
                  </button>
                  <p className="font-heading text-[12px] text-[var(--text-muted)] max-w-[640px]">
                    You&rsquo;ll be asked to confirm twice (a dialog, then a typed <code className="font-label text-[11px] bg-[var(--bg-card)] px-[4px] py-[1px] border border-[var(--border-subtle)]">SEND</code>). After that the lock engages and this panel will refuse any further sends.
                  </p>
                </div>
              </>
            )}

            {/* Result banner */}
            {launchResult && (
              <div
                className={`flex flex-col gap-[6px] p-[14px] border ${
                  launchResult.success
                    ? "bg-[var(--forest-green-light)] border-[var(--forest-green)]"
                    : "bg-red-50 border-red-300"
                }`}
              >
                <span
                  className={`font-label font-bold text-[10px] tracking-[2px] ${
                    launchResult.success ? "text-[var(--forest-green)]" : "text-red-700"
                  }`}
                >
                  {launchResult.success ? "✓ SENT" : "✗ NOT SENT"}
                </span>
                <p className="font-heading text-[13px] leading-[1.6] text-[var(--text-primary)]">
                  {launchResult.message}
                </p>
                {launchResult.errors && launchResult.errors.length > 0 && (
                  <ul className="font-heading text-[12px] leading-[1.6] text-[var(--text-secondary)] list-disc pl-[20px]">
                    {launchResult.errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Email list */}
          {waitlistLoading ? (
            <span className="font-heading text-[14px] text-[var(--text-muted)]">Loading waitlist...</span>
          ) : waitlistEmails.length === 0 ? (
            <div className="flex flex-col items-center gap-[16px] py-[48px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
              <Mail className="w-[32px] h-[32px] text-[var(--text-muted)]" />
              <span className="font-heading text-[16px] text-[var(--text-muted)]">No signups yet</span>
            </div>
          ) : (
            <div className="flex flex-col bg-[var(--bg-white)] border border-[var(--border-subtle)]">
              {/* Table header */}
              <div className="flex items-center gap-[16px] px-[24px] py-[12px] border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
                <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)] w-[40px]">#</span>
                <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)] flex-1">EMAIL</span>
                <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)] w-[200px]">SIGNED UP</span>
              </div>
              {/* Rows */}
              {waitlistEmails.map((entry, i) => (
                <div
                  key={entry.email}
                  className={`flex items-center gap-[16px] px-[24px] py-[14px] ${
                    i < waitlistEmails.length - 1 ? "border-b border-[var(--border-subtle)]" : ""
                  }`}
                >
                  <span className="font-label font-semibold text-[12px] text-[var(--text-muted)] w-[40px]">{i + 1}</span>
                  <span className="font-heading text-[15px] text-[var(--text-primary)] flex-1">{entry.email}</span>
                  <span className="font-heading text-[13px] text-[var(--text-secondary)] w-[200px]">
                    {entry.signedUpAt
                      ? new Date(entry.signedUpAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
    );
  }

  // --- EMAILS LIST VIEW ---
  if (view === "emails" && authenticated) {
    // Group templates by category, preserving order from the metadata file
    const groupedTemplates = emailTemplates.reduce<
      Record<string, { label: string; items: EmailTemplateListItem[] }>
    >((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { label: t.categoryLabel, items: [] };
      }
      acc[t.category].items.push(t);
      return acc;
    }, {});

    return adminShell(
      <div className="flex flex-col gap-[20px] md:gap-[24px] p-[16px] md:p-[40px] max-w-[900px]">
        <div className="flex flex-col gap-[8px]">
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
            EMAIL TEMPLATES
          </span>
          <h1 className="font-heading font-semibold text-[24px] md:text-[28px] text-[var(--text-primary)]">
            All Emails the Site Can Send
          </h1>
          <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)] max-w-[680px]">
            Every email the website is set up to send is listed below. Tap any one to see the
            full subject line, body, when and why it fires, and who receives it. Leave a note
            on any template to flag wording you want changed — the dev team will pick it up.
          </p>
        </div>

        {emailTemplatesLoading && emailTemplates.length === 0 ? (
          <div className="flex items-center gap-[10px] py-[32px]">
            <Loader2 className="w-[16px] h-[16px] text-[var(--text-muted)] animate-spin" />
            <span className="font-heading text-[14px] text-[var(--text-muted)]">
              Loading templates…
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-[28px]">
            {Object.entries(groupedTemplates).map(([category, { label, items }]) => (
              <div key={category} className="flex flex-col gap-[12px]">
                <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
                  {label.toUpperCase()}
                </span>
                <div className="flex flex-col gap-[10px]">
                  {items.map((t) => {
                    const hasNote = !!(emailNotes[t.id] && emailNotes[t.id].trim());
                    return (
                      <button
                        key={t.id}
                        onClick={() => openEmailTemplate(t)}
                        className="flex flex-col gap-[8px] p-[16px] md:p-[20px] bg-[var(--bg-white)] border border-[var(--border-subtle)] hover:border-[var(--burnt-orange)] transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-start justify-between gap-[12px]">
                          <span className="font-heading font-semibold text-[15px] md:text-[16px] text-[var(--text-primary)] flex-1">
                            {t.name}
                          </span>
                          {hasNote && (
                            <span className="shrink-0 inline-flex items-center gap-[4px] px-[8px] py-[2px] bg-[var(--burnt-orange-light)] text-[var(--burnt-orange)]">
                              <span className="font-label font-bold text-[9px] tracking-[1.5px]">
                                NOTE
                              </span>
                            </span>
                          )}
                        </div>
                        <p className="font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)]">
                          {t.trigger}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[4px] mt-[2px]">
                          <span className="font-label text-[11px] text-[var(--text-muted)]">
                            <strong className="text-[var(--text-secondary)]">To:</strong>{" "}
                            {t.recipient}
                          </span>
                          {t.cron && (
                            <span className="font-label text-[11px] text-[var(--text-muted)]">
                              <strong className="text-[var(--text-secondary)]">Cron:</strong>{" "}
                              {t.cron}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- EMAIL DETAIL VIEW ---
  if (view === "email-detail" && authenticated && emailDetail) {
    return adminShell(
      <div className="flex flex-col gap-[16px] md:gap-[24px] p-[16px] md:p-[40px] max-w-[900px]">
        {/* Back button */}
        <button
          onClick={() => {
            setView("emails");
            setEmailDetail(null);
            setEmailPreview(null);
            setEmailPreviewError("");
          }}
          className="flex items-center gap-[6px] px-[10px] md:px-[12px] py-[8px] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors cursor-pointer self-start"
        >
          <ArrowLeft className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
          <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-secondary)]">
            BACK TO LIST
          </span>
        </button>

        {/* Header */}
        <div className="flex flex-col gap-[8px]">
          <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">
            {emailDetail.categoryLabel.toUpperCase()}
          </span>
          <h1 className="font-heading font-semibold text-[22px] md:text-[28px] leading-[1.2] text-[var(--text-primary)]">
            {emailDetail.name}
          </h1>
        </div>

        {/* Metadata block */}
        <div className="flex flex-col gap-[12px] p-[16px] md:p-[20px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
          <div className="flex flex-col gap-[4px]">
            <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
              WHEN / WHY IT SENDS
            </span>
            <p className="font-heading text-[14px] leading-[1.7] text-[var(--text-secondary)]">
              {emailDetail.trigger}
            </p>
          </div>
          <div className="flex flex-col gap-[4px]">
            <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
              RECIPIENT
            </span>
            <p className="font-heading text-[14px] leading-[1.7] text-[var(--text-secondary)]">
              {emailDetail.recipient}
            </p>
          </div>
          {emailDetail.cron && (
            <div className="flex flex-col gap-[4px]">
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                CRON SCHEDULE
              </span>
              <p className="font-heading text-[14px] leading-[1.7] text-[var(--text-secondary)]">
                {emailDetail.cron}
              </p>
            </div>
          )}
          {emailDetail.dedupKey && (
            <div className="flex flex-col gap-[4px]">
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                DEDUPLICATION
              </span>
              <p className="font-heading text-[14px] leading-[1.7] text-[var(--text-secondary)]">
                {emailDetail.dedupKey}
              </p>
            </div>
          )}
        </div>

        {/* Subject line */}
        <div className="flex flex-col gap-[8px] p-[16px] md:p-[20px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
            SUBJECT LINE
          </span>
          {emailPreviewLoading ? (
            <span className="font-heading text-[14px] text-[var(--text-muted)]">
              Loading…
            </span>
          ) : emailPreview ? (
            <span className="font-heading font-semibold text-[16px] md:text-[18px] text-[var(--text-primary)]">
              {emailPreview.subject}
            </span>
          ) : null}
        </div>

        {/* Body preview */}
        <div className="flex flex-col gap-[10px]">
          <div className="flex items-center justify-between flex-wrap gap-[8px]">
            <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
              EMAIL BODY PREVIEW
            </span>
            <span className="font-label text-[11px] text-[var(--text-muted)]">
              Rendered with sample data — variables like {"{name}"}, {"{rate}"}, etc.
              are filled in for preview only.
            </span>
          </div>
          <div className="bg-[var(--bg-white)] border border-[var(--border-subtle)] overflow-hidden">
            {emailPreviewLoading ? (
              <div className="flex items-center justify-center py-[60px]">
                <Loader2 className="w-[20px] h-[20px] text-[var(--text-muted)] animate-spin" />
              </div>
            ) : emailPreviewError ? (
              <div className="p-[20px] bg-red-50">
                <span className="font-heading text-[13px] text-red-700">
                  ✗ {emailPreviewError}
                </span>
              </div>
            ) : emailPreview ? (
              <iframe
                srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:0;background:#f4f1ec;}</style></head><body>${emailPreview.html}</body></html>`}
                className="w-full min-h-[600px] md:min-h-[720px] bg-white border-0"
                title={`Preview: ${emailDetail.name}`}
              />
            ) : null}
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-[10px] p-[16px] md:p-[20px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between flex-wrap gap-[8px]">
            <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
              YOUR NOTES ON THIS EMAIL
            </span>
            {emailNoteSaved && (
              <span className="font-label font-bold text-[11px] tracking-[1px] text-[var(--forest-green)]">
                ✓ Saved
              </span>
            )}
          </div>
          <p className="font-heading text-[12px] leading-[1.5] text-[var(--text-muted)]">
            Use this to flag wording you want changed, phrasing that feels off, or anything
            else you want the dev team to look at. Notes are visible to admins only.
          </p>
          <textarea
            value={emailNoteDraft}
            onChange={(e) => {
              setEmailNoteDraft(e.target.value);
              setEmailNoteSaved(false);
            }}
            placeholder="e.g. 'Change the third paragraph — sounds too corporate.'"
            rows={5}
            className="w-full px-[14px] py-[12px] border border-[var(--border-subtle)] font-heading text-[14px] leading-[1.6] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-card)] resize-y"
          />
          <div className="flex items-center gap-[10px]">
            <button
              onClick={saveEmailNote}
              disabled={emailNoteSaving}
              className="flex items-center gap-[6px] px-[20px] py-[10px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              <span className="font-label font-bold text-[12px] tracking-[2px] text-white">
                {emailNoteSaving ? "SAVING…" : "SAVE NOTE"}
              </span>
            </button>
            {emailNoteDraft.length > 0 && (
              <span className="font-label text-[11px] text-[var(--text-muted)]">
                {emailNoteDraft.length}/5000
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- SETTINGS VIEW ---
  if (view === "settings" && authenticated) {
    return adminShell(
        <div className="flex flex-col gap-[24px] md:gap-[32px] p-[16px] md:p-[40px] max-w-[720px]">
          <div className="flex flex-col gap-[8px]">
            <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
              SETTINGS
            </span>
            <h1 className="font-heading font-semibold text-[28px] text-[var(--text-primary)]">
              Site Configuration
            </h1>
          </div>

          {settingsLoading && !Object.keys(settings).length ? (
            <span className="font-heading text-[14px] text-[var(--text-muted)]">Loading settings...</span>
          ) : (
            <>
              {/* Trail Location Tracker */}
              <div className="flex flex-col gap-[20px] p-[20px] md:p-[28px] bg-[var(--bg-white)] border-2 border-[var(--forest-green)]">
                <div className="flex items-center gap-[10px]">
                  <Navigation className="w-[18px] h-[18px] text-[var(--forest-green)]" />
                  <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-primary)]">
                    TRAIL LOCATION TRACKER
                  </span>
                </div>

                {/* How it works explanation */}
                <div className="flex flex-col gap-[10px] p-[16px] bg-[var(--forest-green-light)] border border-[var(--forest-green)]/20">
                  <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--forest-green)]">HOW THIS WORKS</span>
                  <p className="font-heading text-[13px] leading-[1.7] text-[var(--text-secondary)]">
                    This controls where Paul&apos;s marker appears on the trail map and homepage. Instead of requiring real GPS tracking (which drains Paul&apos;s phone battery and needs cell signal), you simply tell the system where Paul is and how fast he&apos;s moving.
                  </p>
                  <ol className="flex flex-col gap-[4px] font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)] list-decimal pl-[20px]">
                    <li><strong>Set the mile marker</strong> — where Paul is right now on the trail (ask him or estimate)</li>
                    <li><strong>Set the daily pace</strong> — how many miles per day he&apos;s averaging</li>
                    <li><strong>Click &ldquo;Update Position&rdquo;</strong> — the map immediately shows his location</li>
                    <li><strong>The map moves automatically</strong> — the system advances the marker along the real PCT route at the pace you set, so visitors see smooth &ldquo;live&rdquo; progress</li>
                    <li><strong>Correct every few days</strong> — when Paul checks in, update the mile to fix any drift</li>
                  </ol>
                </div>

                <div className="flex flex-col gap-[6px]">
                  <label className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                    TRACKING MODE
                  </label>
                  <select
                    value={settings.trackingMode || "simulated"}
                    onChange={(e) => setSettings({ ...settings, trackingMode: e.target.value })}
                    className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] outline-none bg-[var(--bg-card)]"
                  >
                    <option value="simulated">Simulated (recommended — set mile + pace manually)</option>
                    <option value="gps">Live GPS (requires phone app running constantly)</option>
                  </select>
                  <span className="font-heading text-[12px] text-[var(--text-muted)]">
                    Simulated is recommended — it looks identical to visitors but uses zero phone battery. Live GPS is only needed if Paul has reliable cell signal and battery.
                  </span>
                </div>

                {(settings.trackingMode || "simulated") === "simulated" && (
                  <>
                    <div className="grid grid-cols-2 gap-[16px]">
                      <div className="flex flex-col gap-[6px]">
                        <label className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                          CURRENT MILE
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="2650"
                          step="0.1"
                          value={settings.currentMile || ""}
                          onChange={(e) => setSettings({ ...settings, currentMile: e.target.value })}
                          placeholder="0"
                          className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-card)]"
                        />
                        <span className="font-heading text-[12px] text-[var(--text-muted)]">
                          Where Paul is right now. Mile 0 = Campo (Mexico border), Mile 2,650 = Manning Park (Canada). Ask Paul for his approximate mile or check his last message.
                        </span>
                      </div>
                      <div className="flex flex-col gap-[6px]">
                        <label className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                          DAILY PACE (mi/day)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="40"
                          step="0.5"
                          value={settings.dailyPace || ""}
                          onChange={(e) => setSettings({ ...settings, dailyPace: e.target.value })}
                          placeholder="18"
                          className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-card)]"
                        />
                        <span className="font-heading text-[12px] text-[var(--text-muted)]">
                          How many miles Paul walks per day on average. Typical: 15–20 mi/day. Set to 0 when he takes a rest day (zero day) — the marker will stop moving until you update it again.
                        </span>
                      </div>
                    </div>

                    {/* Quick tips */}
                    <div className="flex flex-col gap-[6px] p-[12px] bg-[var(--burnt-orange-light)] border border-[var(--burnt-orange)]/20">
                      <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--burnt-orange)]">TIPS</span>
                      <ul className="flex flex-col gap-[2px] font-heading text-[12px] leading-[1.6] text-[var(--text-secondary)]">
                        <li>&bull; <strong>Rest day?</strong> Set pace to 0 — the marker pauses until you update again</li>
                        <li>&bull; <strong>Paul checked in?</strong> Update the mile to his actual position — the system resets from there</li>
                        <li>&bull; <strong>Not sure where he is?</strong> Estimate — you can always correct later, visitors won&apos;t notice small adjustments</li>
                        <li>&bull; <strong>Town stop?</strong> Set pace to 0, then update pace back to normal when he leaves town</li>
                      </ul>
                    </div>

                    <button
                      onClick={async () => {
                        const mile = parseFloat(settings.currentMile) || 0;
                        const pace = parseFloat(settings.dailyPace) || 0;
                        const updated = { ...settings, currentMile: String(mile), dailyPace: String(pace), mileSetAt: String(Date.now()) };
                        setSettings(updated);
                        setSettingsLoading(true);
                        try {
                          const res = await fetch("/api/admin/settings", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                            body: JSON.stringify(updated),
                          });
                          if (res.ok) {
                            setStatus(`Position updated: Mile ${mile}, pace ${pace} mi/day`);
                            setTimeout(() => setStatus(""), 4000);
                          } else {
                            setStatus("Failed to update position");
                          }
                        } catch { setStatus("Failed to update position"); }
                        finally { setSettingsLoading(false); }
                      }}
                      disabled={settingsLoading}
                      className="flex items-center justify-center gap-[8px] px-[28px] py-[12px] bg-[var(--forest-green)] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer w-fit"
                    >
                      <MapPin className="w-[14px] h-[14px] text-white" />
                      <span className="font-label font-bold text-[12px] tracking-[2px] text-white">
                        UPDATE POSITION
                      </span>
                    </button>

                    {/* Live Preview */}
                    {(() => {
                      const mile = parseFloat(settings.currentMile) || 0;
                      const pace = parseFloat(settings.dailyPace) || 0;
                      const mileSetAt = parseInt(settings.mileSetAt) || 0;
                      const elapsed = mileSetAt ? (Date.now() - mileSetAt) / (1000 * 60 * 60 * 24) : 0;
                      const estimated = Math.min(2650, mile + elapsed * pace);
                      const progress = ((estimated / 2650) * 100).toFixed(1);
                      return (
                        <div className="flex flex-col gap-[10px] p-[16px] bg-[var(--bg-warm)] border border-[var(--border-subtle)]">
                          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                            WHAT VISITORS SEE RIGHT NOW
                          </span>
                          <div className="grid grid-cols-3 gap-[12px]">
                            <div className="flex flex-col gap-[2px]">
                              <span className="font-label font-bold text-[9px] tracking-[2px] text-[var(--text-muted)]">YOU SET</span>
                              <span className="font-heading font-semibold text-[18px] text-[var(--text-primary)]">Mile {mile}</span>
                            </div>
                            <div className="flex flex-col gap-[2px]">
                              <span className="font-label font-bold text-[9px] tracking-[2px] text-[var(--text-muted)]">MAP SHOWS</span>
                              <span className="font-heading font-semibold text-[18px] text-[var(--forest-green)]">Mile {estimated.toFixed(1)}</span>
                            </div>
                            <div className="flex flex-col gap-[2px]">
                              <span className="font-label font-bold text-[9px] tracking-[2px] text-[var(--text-muted)]">PROGRESS</span>
                              <span className="font-heading font-semibold text-[18px] text-[var(--burnt-orange)]">{progress}%</span>
                            </div>
                          </div>
                          {mileSetAt > 0 && (
                            <span className="font-heading text-[12px] text-[var(--text-muted)]">
                              Position last updated {elapsed < 1 ? `${Math.round(elapsed * 24)} hours` : `${elapsed.toFixed(1)} days`} ago.
                              {pace > 0 && <> The marker has drifted {(elapsed * pace).toFixed(1)} miles since then at {pace} mi/day.</>}
                              {pace === 0 && <> Pace is 0 — marker is stationary (rest day).</>}
                            </span>
                          )}
                          {!mileSetAt && (
                            <span className="font-heading text-[12px] text-[var(--burnt-orange)]">
                              Position not set yet. Enter a mile and pace above, then click &ldquo;Update Position&rdquo;.
                            </span>
                          )}
                          {/* Progress bar */}
                          <div className="w-full h-[8px] bg-[var(--border-subtle)] overflow-hidden">
                            <div className="h-full bg-[var(--forest-green)] transition-all" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}

                {(settings.trackingMode || "simulated") === "gps" && (
                  <div className="flex flex-col gap-[8px] p-[16px] bg-[var(--bg-warm)] border border-[var(--border-subtle)]">
                    <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">GPS TRACKING ACTIVE</span>
                    <p className="font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)]">
                      The map is reading live GPS data from Paul&apos;s phone. This requires the GPSLogger or OwnTracks app running in the background, which uses battery and needs cell signal. Switch to &ldquo;Simulated&rdquo; if this isn&apos;t working reliably.
                    </p>
                  </div>
                )}
              </div>

              {/* Email Notifications (Gmail OAuth) */}
              <div className="flex flex-col gap-[20px] p-[20px] md:p-[28px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-[10px]">
                  <Mail className="w-[18px] h-[18px] text-[var(--burnt-orange)]" />
                  <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-primary)]">
                    EMAIL NOTIFICATIONS (GMAIL)
                  </span>
                </div>
                <p className="font-heading text-[14px] leading-[1.7] text-[var(--text-secondary)]">
                  The website sends transactional emails (welcome, weekly update, milestone, honour reminder, magic link, new journal post, etc.) via the Gmail API. Connect a Google account below and the website will send emails on its behalf.
                </p>

                {/* Flash message from the OAuth callback redirect */}
                {gmailOAuthFlash && (
                  <div
                    className={`p-[12px] border ${
                      gmailOAuthFlash.type === "success"
                        ? "bg-[var(--forest-green-light)] border-[var(--forest-green)]/30"
                        : "bg-red-50 border-red-300"
                    }`}
                  >
                    <div className="flex items-start gap-[8px]">
                      <span
                        className={`font-heading text-[13px] flex-1 leading-[1.5] ${
                          gmailOAuthFlash.type === "success"
                            ? "text-[var(--forest-green)]"
                            : "text-red-700"
                        }`}
                      >
                        {gmailOAuthFlash.type === "success" ? "✓ " : "✗ "}
                        {gmailOAuthFlash.message}
                      </span>
                      <button
                        onClick={() => setGmailOAuthFlash(null)}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] shrink-0 cursor-pointer"
                        aria-label="Dismiss"
                      >
                        <XCircle className="w-[16px] h-[16px]" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Connection status + action */}
                {gmailOAuthLoading && !gmailOAuthStatus ? (
                  <div className="flex items-center gap-[10px] p-[16px] bg-[var(--bg-warm)] border border-[var(--border-subtle)]">
                    <Loader2 className="w-[16px] h-[16px] text-[var(--text-muted)] animate-spin" />
                    <span className="font-heading text-[13px] text-[var(--text-muted)]">
                      Checking connection…
                    </span>
                  </div>
                ) : gmailOAuthStatus?.connected ? (
                  // ─── CONNECTED ──────────────────────────────────────
                  <div className={`flex flex-col gap-[12px] p-[16px] ${gmailOAuthStatus.tokenValid === false ? "bg-red-50 border border-red-300" : "bg-[var(--forest-green-light)] border border-[var(--forest-green)]/30"}`}>
                    {gmailOAuthStatus.tokenValid === false && (
                      <div className="flex flex-col gap-[6px] p-[10px] bg-white border border-red-200">
                        <div className="flex items-center gap-[6px]">
                          <XCircle className="w-[14px] h-[14px] text-red-600" />
                          <span className="font-label font-bold text-[11px] tracking-[1.5px] text-red-700">
                            TOKEN REJECTED BY GOOGLE
                          </span>
                        </div>
                        <p className="font-heading text-[12px] leading-[1.5] text-red-800">
                          Last send failed with <code className="bg-red-100 px-[3px] text-[11px]">invalid_grant</code> —
                          Google has revoked or expired this refresh token. Automated emails will not send until you reconnect.
                          {gmailOAuthStatus.tokenInvalidAt && (
                            <> (detected {new Date(gmailOAuthStatus.tokenInvalidAt).toLocaleString()})</>
                          )}
                        </p>
                        <p className="font-heading text-[11px] leading-[1.4] text-red-700">
                          Click Disconnect below, then Connect Gmail Account to issue a fresh token.
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-[8px]">
                      <CheckCircle className={`w-[18px] h-[18px] ${gmailOAuthStatus.tokenValid === false ? "text-[var(--text-muted)]" : "text-[var(--forest-green)]"}`} />
                      <span className={`font-label font-bold text-[12px] tracking-[1.5px] ${gmailOAuthStatus.tokenValid === false ? "text-[var(--text-muted)]" : "text-[var(--forest-green)]"}`}>
                        {gmailOAuthStatus.tokenValid === false ? "CONNECTED (TOKEN INVALID)" : "CONNECTED"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-[4px]">
                      <span className="font-label text-[10px] tracking-[1px] text-[var(--text-muted)]">
                        SENDING AS
                      </span>
                      <span className="font-heading font-semibold text-[15px] text-[var(--text-primary)] break-all">
                        {gmailOAuthStatus.email || "unknown"}
                      </span>
                      {gmailOAuthStatus.connectedAt && (
                        <span className="font-label text-[11px] text-[var(--text-muted)]">
                          Connected{" "}
                          {new Date(gmailOAuthStatus.connectedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={disconnectGmail}
                      disabled={gmailOAuthDisconnecting}
                      className="flex items-center gap-[6px] px-[16px] py-[8px] border border-red-300 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer w-fit"
                    >
                      <span className="font-label font-bold text-[11px] tracking-[1.5px] text-red-600">
                        {gmailOAuthDisconnecting ? "DISCONNECTING…" : "DISCONNECT"}
                      </span>
                    </button>
                  </div>
                ) : gmailOAuthStatus?.reason === "no-client-id" || gmailOAuthStatus?.reason === "no-client-secret" ? (
                  // ─── NOT CONFIGURED (no Client ID/Secret) ───────────
                  <div className="flex flex-col gap-[10px] p-[16px] bg-[var(--burnt-orange-light)] border border-[var(--burnt-orange)]/30">
                    <div className="flex items-center gap-[8px]">
                      <XCircle className="w-[16px] h-[16px] text-[var(--burnt-orange)]" />
                      <span className="font-label font-bold text-[12px] tracking-[1.5px] text-[var(--burnt-orange)]">
                        SETUP REQUIRED
                      </span>
                    </div>
                    <p className="font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)]">
                      Google Cloud credentials are missing. Before you can connect a Gmail account, set{" "}
                      <code className="bg-[var(--bg-card)] px-[4px] text-[12px]">GMAIL_CLIENT_ID</code> and{" "}
                      <code className="bg-[var(--bg-card)] px-[4px] text-[12px]">GMAIL_CLIENT_SECRET</code> as Vercel environment variables (Production), then redeploy. See <code className="bg-[var(--bg-card)] px-[4px] text-[12px]">docs/EMAIL-SETUP.md</code> for the one-time Google Cloud setup.
                    </p>
                  </div>
                ) : (
                  // ─── NOT CONNECTED but creds present — show Connect button ──
                  <div className="flex flex-col gap-[12px] p-[16px] bg-[var(--bg-warm)] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-[8px]">
                      <XCircle className="w-[16px] h-[16px] text-[var(--text-muted)]" />
                      <span className="font-label font-bold text-[12px] tracking-[1.5px] text-[var(--text-muted)]">
                        NOT CONNECTED
                      </span>
                    </div>
                    <p className="font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)]">
                      Click the button below. It redirects you to Google&apos;s consent screen where you sign in and grant the <strong>gmail.send</strong> permission. After you tap Allow, you&apos;re sent back here and the website can send as your account. The permission can&apos;t read your inbox, delete emails, or touch anything else — sending only.
                    </p>
                    <button
                      type="button"
                      onClick={async () => {
                        // Refresh the cookie via the bearer token RIGHT before
                        // navigating. Some sessions (Paul's iPhone first
                        // login over a flaky mountain connection, browsers
                        // that don't fully persist cookies set via fetch
                        // responses, etc.) end up with a Bearer-only auth
                        // state and no usable cookie — which would 401 the
                        // <a href> navigation. This guarantees the cookie
                        // is fresh, then redirects.
                        try {
                          await fetch("/api/admin/refresh-cookie", {
                            method: "POST",
                            headers: { Authorization: `Bearer ${token}` },
                          });
                        } catch {
                          // If refresh fails, try anyway — the existing
                          // cookie might already be valid for this session
                        }
                        window.location.href = "/api/admin/gmail-oauth/start";
                      }}
                      className="flex items-center justify-center gap-[8px] px-[20px] py-[12px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity cursor-pointer w-fit"
                    >
                      <Mail className="w-[14px] h-[14px] text-white" />
                      <span className="font-label font-bold text-[12px] tracking-[2px] text-white">
                        CONNECT GMAIL ACCOUNT
                      </span>
                    </button>
                    <p className="font-heading text-[11px] leading-[1.5] text-[var(--text-muted)]">
                      You&apos;ll see a &ldquo;Google hasn&apos;t verified this app&rdquo; warning — that&apos;s expected. Tap <strong>Advanced → Go to YesChapter Email (unsafe)</strong> to continue. It&apos;s not actually unsafe — that warning appears for any app that hasn&apos;t paid for Google&apos;s verification review.
                    </p>

                    {/* Inline troubleshooting — closed by default, opens on
                        tap. Documents the iOS Safari cache-staleness gotcha
                        that bit Paul on a weak-signal connection, plus the
                        guaranteed workarounds. Lives inside the Connect
                        section so it's right where users hit the problem. */}
                    <details className="mt-[4px] border border-amber-200 bg-amber-50">
                      <summary className="flex items-center gap-[8px] px-[14px] py-[10px] cursor-pointer font-label font-bold text-[11px] tracking-[1.5px] text-amber-900 select-none">
                        <span aria-hidden="true">⚠</span>
                        STUCK ON &ldquo;UNAUTHORIZED&rdquo;? TAP HERE
                      </summary>
                      <div className="px-[14px] pb-[14px] pt-[4px] flex flex-col gap-[10px]">
                        <p className="font-heading text-[12px] leading-[1.6] text-[var(--text-secondary)]">
                          The error usually means your phone&apos;s browser is serving a <strong>cached, older version</strong> of this page that doesn&apos;t have the latest fix. Happens most on iPhone Safari over a weak connection — Safari aggressively reuses cache to save data, so even &ldquo;clear cache + refresh&rdquo; doesn&apos;t always pull a fresh page.
                        </p>
                        <p className="font-label font-bold text-[10px] tracking-[1.5px] text-[var(--text-muted)]">
                          TRY THESE IN ORDER
                        </p>
                        <ol className="flex flex-col gap-[8px] pl-[16px] list-decimal text-[12px] font-heading text-[var(--text-secondary)] leading-[1.5]">
                          <li>
                            <strong>Force-quit the browser</strong> entirely (on iPhone: swipe up from the bottom and flick the Safari card away). Reopen, navigate back here, click Connect again.
                          </li>
                          <li>
                            <strong>Load this URL instead</strong> — the random query parameter forces a fresh page:<br />
                            <code className="font-mono text-[11px] bg-white px-[6px] py-[2px] border border-[var(--border-subtle)] inline-block mt-[2px]">yeschapter.com/admin?fresh=1</code>
                          </li>
                          <li>
                            <strong>Try a different browser</strong> — install Chrome from the App Store (or vice versa) and load <code className="font-mono text-[11px]">yeschapter.com/admin</code> there. Different browser = different cache.
                          </li>
                          <li>
                            <strong>Safari Private Mode</strong> — tap the tabs icon (bottom right), tap &ldquo;Private&rdquo;, then load <code className="font-mono text-[11px]">yeschapter.com/admin</code>. Private mode has no cache from your main session.
                          </li>
                          <li>
                            <strong>If you saved YesChapter as a home-screen app</strong> — delete the icon and re-add it after a fresh Safari load. Standalone webview has its own cache.
                          </li>
                          <li>
                            <strong>Get to better wifi</strong> if possible — your phone is more willing to fetch fresh resources on a strong connection instead of falling back to cache.
                          </li>
                        </ol>
                        <p className="font-heading italic text-[11px] leading-[1.5] text-[var(--text-muted)]">
                          If you&apos;ve tried all of these and the error persists, screenshot the page (with the URL bar visible) and send it to Raul — there&apos;s a deeper issue to debug.
                        </p>
                      </div>
                    </details>
                  </div>
                )}

                {/* Test send */}
                <div className="flex flex-col gap-[10px] p-[16px] border border-[var(--border-subtle)]">
                  <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                    SEND A TEST EMAIL
                  </span>
                  <p className="font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)]">
                    Sends a sample &ldquo;new post&rdquo; notification to <strong>only the address below</strong>. Waitlist subscribers and pledgers are NOT contacted. Use this to verify Gmail is wired up correctly.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-[10px]">
                    <input
                      type="email"
                      value={testEmailTo}
                      onChange={(e) => setTestEmailTo(e.target.value)}
                      placeholder="you@example.com"
                      className="flex-1 h-[44px] px-[16px] border border-[var(--border-subtle)] font-heading text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-card)]"
                    />
                    <button
                      onClick={async () => {
                        if (!testEmailTo) return;
                        setTestEmailSending(true);
                        setTestEmailResult(null);
                        try {
                          const res = await fetch("/api/emails/test", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ to: testEmailTo }),
                          });
                          const data = await res.json();
                          if (res.ok) {
                            setTestEmailResult({
                              success: true,
                              message: data.message || `Test email sent to ${testEmailTo}. Check inbox + spam folder.`,
                            });
                          } else {
                            setTestEmailResult({
                              success: false,
                              message: data.error || `HTTP ${res.status}`,
                            });
                          }
                        } catch (err) {
                          setTestEmailResult({
                            success: false,
                            message: err instanceof Error ? err.message : "Request failed",
                          });
                        } finally {
                          setTestEmailSending(false);
                        }
                      }}
                      disabled={testEmailSending || !testEmailTo}
                      className="flex items-center justify-center gap-[8px] px-[24px] h-[44px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-[14px] h-[14px] text-white" />
                      <span className="font-label font-bold text-[12px] tracking-[2px] text-white">
                        {testEmailSending ? "SENDING..." : "SEND TEST"}
                      </span>
                    </button>
                  </div>
                  {testEmailResult && (
                    <div
                      className={`p-[12px] border ${
                        testEmailResult.success
                          ? "bg-[var(--forest-green-light)] border-[var(--forest-green)]/30"
                          : "bg-red-50 border-red-300"
                      }`}
                    >
                      <span
                        className={`font-heading text-[13px] ${
                          testEmailResult.success ? "text-[var(--forest-green)]" : "text-red-700"
                        }`}
                      >
                        {testEmailResult.success ? "✓ " : "✗ "}
                        {testEmailResult.message}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Instagram / Apify */}
              <div className="flex flex-col gap-[20px] p-[20px] md:p-[28px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-[10px]">
                  <Instagram className="w-[18px] h-[18px] text-[var(--burnt-orange)]" />
                  <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-primary)]">
                    INSTAGRAM GALLERY (APIFY)
                  </span>
                </div>
                <p className="font-heading text-[14px] leading-[1.7] text-[var(--text-secondary)]">
                  The gallery on the Journal page is powered by Apify&apos;s Instagram scraper. It fetches Paul&apos;s latest posts daily and caches them. Set up your Apify credentials below to activate it.
                </p>

                <div className="flex flex-col gap-[6px]">
                  <label className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                    APIFY API TOKEN
                  </label>
                  <input
                    type="password"
                    value={settings.apifyApiToken || ""}
                    onChange={(e) => setSettings({ ...settings, apifyApiToken: e.target.value })}
                    placeholder="apify_api_..."
                    className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-card)]"
                  />
                  <span className="font-heading text-[12px] text-[var(--text-muted)]">
                    Find this at apify.com → Settings → Integrations
                  </span>
                </div>

                <div className="flex flex-col gap-[6px]">
                  <label className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                    APIFY TASK ID
                  </label>
                  <input
                    type="text"
                    value={settings.apifyTaskId || ""}
                    onChange={(e) => setSettings({ ...settings, apifyTaskId: e.target.value })}
                    placeholder="aBcDeFgH1234"
                    className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-card)]"
                  />
                  <span className="font-heading text-[12px] text-[var(--text-muted)]">
                    Create a task from the &ldquo;Instagram Scraper&rdquo; actor, then copy the Task ID from the URL
                  </span>
                </div>

                {/* Setup guide */}
                <div className="flex flex-col gap-[8px] p-[16px] bg-[var(--bg-warm)] border border-[var(--border-subtle)]">
                  <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">SETUP GUIDE</span>
                  <ol className="flex flex-col gap-[4px] font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)] list-decimal pl-[20px]">
                    <li>Create a free account at <strong>apify.com</strong></li>
                    <li>Search for &ldquo;Instagram Scraper&rdquo; actor → Save as Task</li>
                    <li>Set input: directUrls = <code className="bg-[var(--bg-card)] px-[4px]">https://instagram.com/yeschapter/</code>, resultsLimit = 12</li>
                    <li>Schedule it daily at 12:00 UTC</li>
                    <li>Run it once manually to verify</li>
                    <li>Copy the API Token and Task ID into the fields above</li>
                  </ol>
                </div>

                {/* Manual Sync */}
                <div className="flex flex-col gap-[10px] p-[16px] border border-[var(--border-subtle)]">
                  <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                    SYNC NOW
                  </span>
                  <p className="font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)]">
                    Fetches the latest scrape results from Apify and updates the cache on the site. Use this when Paul has posted something new and you don&apos;t want to wait for the daily cron (14:00 UTC). The Apify task itself runs on its own schedule — if the task hasn&apos;t re-scraped since Paul&apos;s new post, you may need to trigger a fresh run in the Apify console first.
                  </p>
                  <button
                    onClick={async () => {
                      setInstaSyncing(true);
                      setInstaSyncResult(null);
                      try {
                        const res = await fetch("/api/admin/instagram-sync", {
                          method: "POST",
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        const data = await res.json();
                        if (res.ok) {
                          setInstaSyncResult({
                            success: true,
                            message:
                              data.synced > 0
                                ? `Synced ${data.synced} posts from Apify. Journal page will refresh within ~5 minutes (CDN cache).`
                                : `Sync ran but Apify returned no new posts. Existing cache: ${data.totalCached} posts.`,
                          });
                        } else {
                          setInstaSyncResult({
                            success: false,
                            message: data.error || `HTTP ${res.status}`,
                          });
                        }
                      } catch (err) {
                        setInstaSyncResult({
                          success: false,
                          message: err instanceof Error ? err.message : "Request failed",
                        });
                      } finally {
                        setInstaSyncing(false);
                      }
                    }}
                    disabled={instaSyncing}
                    className="flex items-center justify-center gap-[8px] px-[24px] h-[44px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer w-fit"
                  >
                    <Instagram className="w-[14px] h-[14px] text-white" />
                    <span className="font-label font-bold text-[12px] tracking-[2px] text-white">
                      {instaSyncing ? "SYNCING..." : "SYNC INSTAGRAM NOW"}
                    </span>
                  </button>
                  {instaSyncResult && (
                    <div
                      className={`p-[12px] border ${
                        instaSyncResult.success
                          ? "bg-[var(--forest-green-light)] border-[var(--forest-green)]/30"
                          : "bg-red-50 border-red-300"
                      }`}
                    >
                      <span
                        className={`font-heading text-[13px] ${
                          instaSyncResult.success ? "text-[var(--forest-green)]" : "text-red-700"
                        }`}
                      >
                        {instaSyncResult.success ? "✓ " : "✗ "}
                        {instaSyncResult.message}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Provider */}
              <div className="flex flex-col gap-[20px] p-[20px] md:p-[28px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-[10px]">
                  <Zap className="w-[18px] h-[18px] text-[var(--burnt-orange)]" />
                  <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-primary)]">
                    AI CONTENT GENERATION
                  </span>
                </div>
                <p className="font-heading text-[14px] leading-[1.7] text-[var(--text-secondary)]">
                  The video-to-blog pipeline uses AI to generate journal posts and Instagram captions from YouTube transcripts. Choose your provider and enter the API key.
                </p>

                <div className="flex flex-col gap-[6px]">
                  <label className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                    AI PROVIDER
                  </label>
                  <select
                    value={settings.aiProvider || "openai"}
                    onChange={(e) => setSettings({ ...settings, aiProvider: e.target.value })}
                    className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] outline-none bg-[var(--bg-card)]"
                  >
                    <option value="openai">OpenAI (GPT-4o)</option>
                    <option value="anthropic">Anthropic (Claude Sonnet)</option>
                  </select>
                </div>

                {(settings.aiProvider || "openai") === "openai" ? (
                  <>
                    <div className="flex flex-col gap-[6px]">
                      <label className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                        OPENAI API KEY
                      </label>
                      <input
                        type="password"
                        value={settings.openaiApiKey || ""}
                        onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                        placeholder="sk-..."
                        className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-card)]"
                      />
                      <span className="font-heading text-[12px] text-[var(--text-muted)]">
                        Get your key at platform.openai.com → API keys
                      </span>
                    </div>
                    <div className="flex flex-col gap-[6px]">
                      <label className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                        MODEL
                      </label>
                      <select
                        value={settings.openaiModel || "gpt-4o"}
                        onChange={(e) => setSettings({ ...settings, openaiModel: e.target.value })}
                        className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] outline-none bg-[var(--bg-card)]"
                      >
                        <option value="gpt-4o">GPT-4o (recommended)</option>
                        <option value="gpt-4o-mini">GPT-4o Mini (cheaper)</option>
                        <option value="gpt-4.1">GPT-4.1</option>
                        <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-[6px]">
                      <label className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                        ANTHROPIC API KEY
                      </label>
                      <input
                        type="password"
                        value={settings.anthropicApiKey || ""}
                        onChange={(e) => setSettings({ ...settings, anthropicApiKey: e.target.value })}
                        placeholder="sk-ant-..."
                        className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-card)]"
                      />
                      <span className="font-heading text-[12px] text-[var(--text-muted)]">
                        Get your key at console.anthropic.com → API keys
                      </span>
                    </div>
                    <div className="flex flex-col gap-[6px]">
                      <label className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                        MODEL
                      </label>
                      <select
                        value={settings.anthropicModel || "claude-sonnet-4-5-20250514"}
                        onChange={(e) => setSettings({ ...settings, anthropicModel: e.target.value })}
                        className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] outline-none bg-[var(--bg-card)]"
                      >
                        <option value="claude-sonnet-4-5-20250514">Claude Sonnet 4.5 (recommended)</option>
                        <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 (cheaper)</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Knowledge Block */}
                <div className="flex flex-col gap-[8px] pt-[20px] mt-[8px] border-t border-[var(--border-subtle)]">
                  <label className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                    BLOG KNOWLEDGE BLOCK
                  </label>
                  <p className="font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)]">
                    Authoritative context the AI sees on every blog generation. Includes the foundations by name, the funding model rules, the trail facts, and Paul&apos;s voice fingerprint. Edit this when you spot something the AI keeps getting wrong, or when project facts change. Saved with the rest of the settings via the SAVE SETTINGS button below.
                  </p>
                  <textarea
                    value={settings.blogKnowledge || ""}
                    onChange={(e) => setSettings({ ...settings, blogKnowledge: e.target.value })}
                    placeholder="Click LOAD DEFAULT to populate with the curated default..."
                    rows={20}
                    className="w-full px-[14px] py-[12px] border border-[var(--border-subtle)] font-heading text-[12px] leading-[1.6] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-card)] resize-y font-mono"
                  />
                  <div className="flex flex-wrap items-center gap-[10px]">
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/admin/blog-knowledge-default", {
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          if (res.ok) {
                            const data = await res.json();
                            setSettings({ ...settings, blogKnowledge: data.knowledge });
                            setStatus("Default knowledge loaded into the editor. Click SAVE SETTINGS to apply.");
                            setTimeout(() => setStatus(""), 5000);
                          } else {
                            setStatus("Failed to load default knowledge");
                          }
                        } catch {
                          setStatus("Network error loading default knowledge");
                        }
                      }}
                      className="flex items-center gap-[6px] px-[16px] py-[8px] border border-[var(--border-subtle)] hover:border-[var(--burnt-orange)] hover:text-[var(--burnt-orange)] transition-colors cursor-pointer"
                    >
                      <span className="font-label font-bold text-[11px] tracking-[1px] text-[var(--text-secondary)] hover:text-[var(--burnt-orange)]">
                        LOAD DEFAULT
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        if (!confirm("Clear the override? The AI will fall back to the hardcoded default knowledge block. You can re-load the default into the editor anytime with LOAD DEFAULT.")) return;
                        setSettings({ ...settings, blogKnowledge: "" });
                        setStatus("Override cleared in editor. Click SAVE SETTINGS to apply.");
                        setTimeout(() => setStatus(""), 5000);
                      }}
                      className="flex items-center gap-[6px] px-[16px] py-[8px] border border-[var(--border-subtle)] hover:border-red-500 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <span className="font-label font-bold text-[11px] tracking-[1px] text-[var(--text-secondary)] hover:text-red-600">
                        CLEAR OVERRIDE
                      </span>
                    </button>
                    <span className="font-heading text-[11px] text-[var(--text-muted)]">
                      {settings.blogKnowledge && settings.blogKnowledge.length > 100
                        ? `${settings.blogKnowledge.length} characters — using your override`
                        : "Empty — using hardcoded default"}
                    </span>
                  </div>
                </div>
              </div>

              {/* YouTube */}
              <div className="flex flex-col gap-[20px] p-[20px] md:p-[28px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-[10px]">
                  <Video className="w-[18px] h-[18px] text-[var(--burnt-orange)]" />
                  <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-primary)]">
                    YOUTUBE CHANNEL
                  </span>
                </div>
                <p className="font-heading text-[14px] leading-[1.7] text-[var(--text-secondary)]">
                  When Paul uploads a YouTube video, the system automatically extracts the transcript, generates a blog post + Instagram caption using AI, and saves it as a draft for review. No YouTube API key needed — it uses the public RSS feed and PubSubHubbub push notifications.
                </p>

                <div className="flex flex-col gap-[6px]">
                  <label className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                    YOUTUBE CHANNEL ID
                  </label>
                  <input
                    type="text"
                    value={settings.youtubeChannelId || ""}
                    onChange={(e) => setSettings({ ...settings, youtubeChannelId: e.target.value })}
                    placeholder="UCxxxxxxxxxxxxxxxx"
                    className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none bg-[var(--bg-card)]"
                  />
                  <span className="font-heading text-[12px] text-[var(--text-muted)]">
                    Find this at youtube.com → Your channel → Settings → Advanced settings, or use a tool like commentpicker.com/youtube-channel-id.php
                  </span>
                </div>

                <div className="flex flex-col gap-[6px]">
                  <label className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                    HIKE START DATE
                  </label>
                  <input
                    type="date"
                    value={settings.hikeStartDate || ""}
                    onChange={(e) => setSettings({ ...settings, hikeStartDate: e.target.value })}
                    className="w-full h-[48px] px-[16px] border border-[var(--border-subtle)] font-heading text-[15px] text-[var(--text-primary)] outline-none bg-[var(--bg-card)]"
                  />
                  <span className="font-heading text-[12px] text-[var(--text-muted)]">
                    Used to calculate &ldquo;Day X&rdquo; numbers for blog posts (e.g. Day 1, Day 15)
                  </span>
                </div>

                {/* How it works */}
                <div className="flex flex-col gap-[8px] p-[16px] bg-[var(--bg-warm)] border border-[var(--border-subtle)]">
                  <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">AUTOMATION FLOW</span>
                  <ol className="flex flex-col gap-[4px] font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)] list-decimal pl-[20px]">
                    <li>Paul uploads a video to YouTube</li>
                    <li>YouTube pushes a notification to the site via webhook</li>
                    <li>The system extracts the video transcript automatically</li>
                    <li>AI generates a blog post (600-1000 words, Paul&apos;s voice) + Instagram caption</li>
                    <li>Post is saved as a <strong>draft</strong> in the Journal tab</li>
                    <li>Admin reviews, edits if needed, and publishes</li>
                    <li>Instagram caption is ready to copy-paste from the admin panel</li>
                  </ol>
                </div>
              </div>

              {/* Save button */}
              <div className="flex items-center gap-[16px]">
                <button
                  onClick={handleSaveSettings}
                  disabled={settingsLoading}
                  className="flex items-center justify-center gap-[8px] px-[32px] py-[14px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                  <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-primary)]">
                    {settingsLoading ? "SAVING..." : "SAVE SETTINGS"}
                  </span>
                </button>
                {settingsSaved && (
                  <span className="font-label font-bold text-[12px] tracking-[1px] text-[var(--forest-green)]">
                    Settings saved!
                  </span>
                )}
              </div>

              {/* Email Crons control panel */}
              <div className="flex flex-col gap-[20px] p-[20px] md:p-[28px] bg-[var(--bg-white)] border-2 border-[var(--burnt-orange)] mt-[24px]">
                <div className="flex items-center gap-[10px]">
                  <Send className="w-[18px] h-[18px] text-[var(--burnt-orange)]" />
                  <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-primary)]">
                    EMAIL CRONS — AUTOMATED BLASTS
                  </span>
                </div>

                <div className="flex flex-col gap-[10px] p-[16px] bg-[var(--burnt-orange-light)] border border-[var(--burnt-orange)]/20">
                  <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--burnt-orange)]">HOW THIS WORKS</span>
                  <p className="font-heading text-[13px] leading-[1.7] text-[var(--text-secondary)]">
                    The four email types below are designed to fire <strong>automatically on a schedule</strong> (welcome drip when new pledgers sign up, weekly digest on Mondays, milestone alerts when Paul crosses a threshold, honor reminders after the hike ends). They are currently in <strong>STANDBY</strong> by default so a fresh deploy doesn&apos;t surprise-blast anyone.
                  </p>
                  <ul className="flex flex-col gap-[2px] font-heading text-[12px] leading-[1.6] text-[var(--text-secondary)] list-disc pl-[20px]">
                    <li><strong>STANDBY</strong> = crons are paused. Vercel still calls them on schedule, they just return early.</li>
                    <li><strong>ACTIVE</strong> = crons fire normally on their schedule.</li>
                    <li><strong>Send Now</strong> button = manual blast on demand. Bypasses STANDBY but still respects per-pledger dedup (clicking twice in a row skips already-sent pledgers).</li>
                  </ul>
                </div>

                {emailCronLoading && !emailCronStatus ? (
                  <span className="font-heading text-[13px] text-[var(--text-muted)]">Loading cron status&hellip;</span>
                ) : !emailCronStatus ? (
                  <span className="font-heading text-[13px] text-[var(--text-muted)]">Cron status unavailable.</span>
                ) : (
                  <>
                    {/* Master kill-switch warning */}
                    {!emailCronStatus.bulkEmailsEnabled && (
                      <div className="flex flex-col gap-[6px] p-[14px] bg-amber-50 border border-amber-300">
                        <span className="font-label font-bold text-[10px] tracking-[2px] text-amber-800">
                          EMAILS_ENABLED IS OFF
                        </span>
                        <p className="font-heading text-[13px] leading-[1.6] text-amber-900">
                          The master <code className="font-label text-[11px] bg-white px-[4px] py-[1px] border border-amber-300">EMAILS_ENABLED</code> env var is not <code className="font-label text-[11px] bg-white px-[4px] py-[1px] border border-amber-300">true</code> in Vercel. Even if you take crons off STANDBY, no emails will leave the building. Send Now buttons will also return 503.
                        </p>
                      </div>
                    )}

                    {/* Standby toggle */}
                    <div className="flex flex-col gap-[10px] p-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                      <div className="flex items-center justify-between gap-[16px]">
                        <div className="flex flex-col gap-[4px]">
                          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                            CURRENT MODE
                          </span>
                          <span
                            className={`font-heading font-semibold text-[20px] ${
                              emailCronStatus.standby ? "text-[var(--burnt-orange)]" : "text-[var(--forest-green)]"
                            }`}
                          >
                            {emailCronStatus.standby ? "🟠 STANDBY" : "🟢 ACTIVE"}
                          </span>
                          <span className="font-heading text-[12px] text-[var(--text-secondary)]">
                            {emailCronStatus.standby
                              ? "No automatic sends. Vercel still calls the endpoints, they return early."
                              : "Crons fire on schedule. Per-pledger dedup keys still prevent double-sends."}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleEmailCronStandby(!emailCronStatus.standby)}
                          disabled={emailCronToggling}
                          className={`flex items-center gap-[8px] px-[24px] py-[12px] transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                            emailCronStatus.standby
                              ? "bg-[var(--forest-green)] hover:opacity-90"
                              : "bg-[var(--burnt-orange)] hover:opacity-90"
                          }`}
                        >
                          <span className="font-label font-bold text-[12px] tracking-[2px] text-white">
                            {emailCronToggling
                              ? "…"
                              : emailCronStatus.standby
                              ? "ACTIVATE"
                              : "PAUSE (STANDBY)"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Per-cron rows: schedule, last-sent, Send Now button */}
                    <div className="flex flex-col gap-[10px]">
                      <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                        THE FOUR CRONS
                      </span>
                      {emailCronStatus.crons.map((c) => {
                        const last = emailCronStatus.lastSent[c.id];
                        const lastLabel = last?.ts
                          ? `Last sent ${new Date(last.ts).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}${last.weekNumber ? ` (week ${last.weekNumber})` : ""}`
                          : "Never sent";
                        const isThisRunning = emailCronTriggering === c.id;
                        const result = emailCronResult?.which === c.id ? emailCronResult : null;
                        return (
                          <div key={c.id} className="flex flex-col gap-[10px] p-[14px] md:p-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                            <div className="flex items-start justify-between gap-[16px] flex-wrap">
                              <div className="flex flex-col gap-[4px] flex-1 min-w-[200px]">
                                <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)]">
                                  {c.name}
                                </span>
                                <span className="font-label text-[11px] text-[var(--text-muted)]">
                                  <Clock className="inline-block w-[12px] h-[12px] mr-[4px] -mt-[2px]" />
                                  {c.schedule}
                                </span>
                                <span className="font-heading text-[12px] text-[var(--text-secondary)]">
                                  {lastLabel}
                                </span>
                              </div>
                              <button
                                onClick={() => triggerEmailCron(c.id, c.name)}
                                disabled={!!emailCronTriggering || !emailCronStatus.bulkEmailsEnabled}
                                className="flex items-center gap-[6px] px-[16px] py-[10px] bg-[var(--bg-white)] border border-[var(--burnt-orange)] hover:bg-[var(--burnt-orange-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                title={!emailCronStatus.bulkEmailsEnabled ? "EMAILS_ENABLED env var is off — sends would 503" : "Trigger this cron manually now"}
                              >
                                <Send className="w-[12px] h-[12px] text-[var(--burnt-orange)]" />
                                <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--burnt-orange)]">
                                  {isThisRunning ? "SENDING…" : "SEND NOW"}
                                </span>
                              </button>
                            </div>
                            {result && (
                              <div
                                className={`flex flex-col gap-[2px] p-[10px] border ${
                                  result.success
                                    ? "bg-[var(--forest-green-light)] border-[var(--forest-green)]"
                                    : "bg-red-50 border-red-300"
                                }`}
                              >
                                <span
                                  className={`font-label font-bold text-[10px] tracking-[2px] ${
                                    result.success ? "text-[var(--forest-green)]" : "text-red-700"
                                  }`}
                                >
                                  {result.success ? "✓ TRIGGERED" : "✗ FAILED"}
                                </span>
                                <span className="font-heading text-[12px] leading-[1.6] text-[var(--text-primary)]">
                                  {result.message}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Data Management */}
              <div className="flex flex-col gap-[20px] p-[20px] md:p-[28px] bg-[var(--bg-white)] border border-[var(--border-subtle)] mt-[24px]">
                <div className="flex items-center gap-[10px]">
                  <Trash2 className="w-[18px] h-[18px] text-red-500" />
                  <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-primary)]">
                    DATA MANAGEMENT
                  </span>
                </div>
                <p className="font-heading text-[14px] leading-[1.7] text-[var(--text-secondary)]">
                  Reset live data back to zero. Use this to clear test data before launch. These actions cannot be undone.
                </p>
                <div className="flex flex-wrap gap-[12px]">
                  <button
                    onClick={async () => {
                      if (!confirm("Are you sure you want to clear ALL pledge data? This cannot be undone.")) return;
                      try {
                        const res = await fetch("/api/admin/reset-pledges", {
                          method: "POST",
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        const data = await res.json();
                        if (res.ok) alert("Pledge data cleared!");
                        else alert("Error: " + (data.error || "Unknown error"));
                      } catch { alert("Failed to reset pledges"); }
                    }}
                    className="flex items-center gap-[8px] px-[20px] py-[10px] border border-red-300 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-[14px] h-[14px] text-red-500" />
                    <span className="font-label font-bold text-[11px] tracking-[2px] text-red-600">RESET PLEDGES</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
    );
  }

  // --- SPONSORS VIEW ---
  if (view === "sponsors" && authenticated) {
    const sponsoredSectionIds = new Set(sponsors.filter((s) => s.sectionId).map((s) => s.sectionId!));
    const editingExisting =
      sponsorForm.mode === "section" &&
      sponsors.some((s) => s.sectionId === sponsorForm.sectionId);

    return adminShell(
      <div className="flex flex-col gap-[24px] md:gap-[32px] p-[16px] md:p-[40px] max-w-[960px]">
        <div className="flex flex-col gap-[8px]">
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
            SPONSORS
          </span>
          <h1 className="font-heading font-semibold text-[28px] text-[var(--text-primary)]">
            Trail Section Sponsors
          </h1>
          <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)] max-w-[640px]">
            Manage company logos that appear on the trail map. Each sponsor can claim either one of the 32 named PCT landmarks, or a fully custom location (any lat/lng on the route). Logos are visible from day one — pledger pins only appear after Paul passes the landmark.
          </p>
        </div>

        {/* Existing sponsors list */}
        <div className="flex flex-col gap-[12px]">
          <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-muted)]">
            ACTIVE SPONSORS ({sponsors.length})
          </span>
          {sponsorsLoading ? (
            <span className="font-heading text-[14px] text-[var(--text-muted)]">Loading sponsors…</span>
          ) : sponsors.length === 0 ? (
            <div className="flex items-center justify-center p-[28px] bg-[var(--bg-warm)] border border-[var(--border-subtle)]">
              <span className="font-heading italic text-[13px] text-[var(--text-muted)]">
                No sponsors yet. Add one below.
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-[8px]">
              {sponsors.map((s) => {
                const labelTop = s.sectionId
                  ? trailSections.find((sec) => sec.id === s.sectionId)?.name || s.sectionId
                  : s.customLocation?.name || "(custom)";
                const labelBottom = s.sectionId
                  ? `MILE ${trailSections.find((sec) => sec.id === s.sectionId)?.miles?.toLocaleString("en-US") || "?"} · NAMED LANDMARK`
                  : `MILE ${(s.customLocation?.miles ?? 0).toLocaleString("en-US")} · CUSTOM LOCATION`;
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-[16px] p-[16px] bg-[var(--bg-white)] border border-[var(--border-subtle)]"
                  >
                    {/* Logo thumbnail. Plain img so SVG renders and we don't
                        need next/image's remote-host config for the Blob CDN. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.logoUrl}
                      alt={s.companyName}
                      className="w-[56px] h-[56px] object-contain border border-[var(--border-subtle)] bg-white shrink-0"
                    />
                    <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                      <span className="font-heading font-semibold text-[15px] text-[var(--text-primary)] truncate">
                        {s.companyName}
                      </span>
                      <span className="font-heading text-[13px] text-[var(--text-secondary)] truncate">
                        {labelTop}
                      </span>
                      <span className="font-label font-bold text-[10px] tracking-[1.5px] text-[var(--text-muted)] truncate">
                        {labelBottom}
                      </span>
                      {s.websiteUrl && (
                        <a
                          href={s.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-heading text-[12px] text-[var(--burnt-orange)] hover:underline truncate"
                        >
                          {s.websiteUrl}
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => handleSponsorDelete(s.id)}
                      className="flex items-center gap-[6px] px-[14px] py-[8px] border border-red-300 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-[14px] h-[14px] text-red-500" />
                      <span className="font-label font-bold text-[10px] tracking-[1.5px] text-red-600">REMOVE</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add / replace sponsor form */}
        <div className="flex flex-col gap-[20px] p-[20px] md:p-[28px] bg-[var(--bg-white)] border-2 border-[var(--burnt-orange)]">
          <div className="flex items-center gap-[10px]">
            <Plus className="w-[18px] h-[18px] text-[var(--burnt-orange)]" />
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-primary)]">
              {editingExisting ? "REPLACE EXISTING SPONSOR" : "ADD NEW SPONSOR"}
            </span>
          </div>

          {/* Mode toggle */}
          <div className="flex flex-col gap-[8px]">
            <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
              LOCATION TYPE
            </span>
            <div className="flex gap-[8px]">
              <button
                type="button"
                onClick={() => setSponsorForm((f) => ({ ...f, mode: "section" }))}
                className={`flex items-center justify-center gap-[8px] flex-1 h-[44px] cursor-pointer transition-colors ${
                  sponsorForm.mode === "section"
                    ? "bg-[var(--burnt-orange-light)] border-2 border-[var(--burnt-orange)]"
                    : "bg-[var(--bg-warm)] border-2 border-transparent hover:border-[var(--burnt-orange)]"
                }`}
              >
                <MapPin className="w-[16px] h-[16px] text-[var(--burnt-orange)]" />
                <span className="font-label font-bold text-[11px] tracking-[1.5px] text-[var(--text-primary)]">
                  NAMED PCT LANDMARK
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSponsorForm((f) => ({ ...f, mode: "custom" }))}
                className={`flex items-center justify-center gap-[8px] flex-1 h-[44px] cursor-pointer transition-colors ${
                  sponsorForm.mode === "custom"
                    ? "bg-[var(--burnt-orange-light)] border-2 border-[var(--burnt-orange)]"
                    : "bg-[var(--bg-warm)] border-2 border-transparent hover:border-[var(--burnt-orange)]"
                }`}
              >
                <Navigation className="w-[16px] h-[16px] text-[var(--burnt-orange)]" />
                <span className="font-label font-bold text-[11px] tracking-[1.5px] text-[var(--text-primary)]">
                  CUSTOM LAT/LNG
                </span>
              </button>
            </div>
          </div>

          {/* Section picker (when mode = section) */}
          {sponsorForm.mode === "section" && (
            <div className="flex flex-col gap-[8px]">
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                TRAIL SECTION
              </span>
              <select
                value={sponsorForm.sectionId}
                onChange={(e) => setSponsorForm((f) => ({ ...f, sectionId: e.target.value }))}
                className="w-full h-[44px] px-[12px] font-heading text-[14px] text-[var(--text-primary)] bg-[var(--bg-white)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--burnt-orange)]"
              >
                <option value="">— Pick a section —</option>
                {(Object.keys(TRAIL_REGIONS) as (keyof typeof TRAIL_REGIONS)[]).map((region) => (
                  <optgroup key={region} label={TRAIL_REGIONS[region].label}>
                    {trailSections.filter((s) => s.region === region).map((s) => {
                      const alreadySponsored = sponsoredSectionIds.has(s.id);
                      return (
                        <option key={s.id} value={s.id}>
                          {s.name} (mi {s.miles.toLocaleString("en-US")})
                          {alreadySponsored ? " — already sponsored" : ""}
                        </option>
                      );
                    })}
                  </optgroup>
                ))}
              </select>
              {editingExisting && (
                <span className="font-heading italic text-[12px] text-[var(--burnt-orange)]">
                  This section already has a sponsor. Submitting will replace it (and delete the old logo).
                </span>
              )}
            </div>
          )}

          {/* Custom location fields (when mode = custom) */}
          {sponsorForm.mode === "custom" && (
            <div className="flex flex-col gap-[12px]">
              <div className="flex flex-col gap-[8px]">
                <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                  LOCATION NAME
                </span>
                <input
                  type="text"
                  value={sponsorForm.customName}
                  onChange={(e) => setSponsorForm((f) => ({ ...f, customName: e.target.value }))}
                  placeholder="e.g. Acme Pass"
                  maxLength={60}
                  className="w-full h-[44px] px-[12px] font-heading text-[14px] text-[var(--text-primary)] bg-[var(--bg-white)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--burnt-orange)]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
                <div className="flex flex-col gap-[8px]">
                  <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                    MILE (0–2700)
                  </span>
                  <input
                    type="number"
                    value={sponsorForm.customMiles}
                    onChange={(e) => setSponsorForm((f) => ({ ...f, customMiles: e.target.value }))}
                    placeholder="e.g. 1234"
                    min={0}
                    max={2700}
                    step={0.1}
                    className="w-full h-[44px] px-[12px] font-heading text-[14px] text-[var(--text-primary)] bg-[var(--bg-white)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--burnt-orange)]"
                  />
                </div>
                <div className="flex flex-col gap-[8px]">
                  <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                    LATITUDE
                  </span>
                  <input
                    type="number"
                    value={sponsorForm.customLat}
                    onChange={(e) => setSponsorForm((f) => ({ ...f, customLat: e.target.value }))}
                    placeholder="e.g. 36.5"
                    min={-90}
                    max={90}
                    step={0.0001}
                    className="w-full h-[44px] px-[12px] font-heading text-[14px] text-[var(--text-primary)] bg-[var(--bg-white)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--burnt-orange)]"
                  />
                </div>
                <div className="flex flex-col gap-[8px]">
                  <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                    LONGITUDE
                  </span>
                  <input
                    type="number"
                    value={sponsorForm.customLng}
                    onChange={(e) => setSponsorForm((f) => ({ ...f, customLng: e.target.value }))}
                    placeholder="e.g. -118.2"
                    min={-180}
                    max={180}
                    step={0.0001}
                    className="w-full h-[44px] px-[12px] font-heading text-[14px] text-[var(--text-primary)] bg-[var(--bg-white)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--burnt-orange)]"
                  />
                </div>
              </div>
              <span className="font-heading italic text-[12px] text-[var(--text-muted)]">
                Hint: drop a pin on Google Maps and copy the lat/lng from the URL. Mile marker can be estimated from the nearest named landmark.
              </span>
            </div>
          )}

          {/* Company name */}
          <div className="flex flex-col gap-[8px]">
            <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
              COMPANY NAME
            </span>
            <input
              type="text"
              value={sponsorForm.companyName}
              onChange={(e) => setSponsorForm((f) => ({ ...f, companyName: e.target.value }))}
              placeholder="e.g. Acme Outfitters"
              maxLength={80}
              className="w-full h-[44px] px-[12px] font-heading text-[14px] text-[var(--text-primary)] bg-[var(--bg-white)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--burnt-orange)]"
            />
          </div>

          {/* Website URL (optional) */}
          <div className="flex flex-col gap-[8px]">
            <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
              WEBSITE URL (OPTIONAL)
            </span>
            <input
              type="url"
              value={sponsorForm.websiteUrl}
              onChange={(e) => setSponsorForm((f) => ({ ...f, websiteUrl: e.target.value }))}
              placeholder="https://acme.com"
              className="w-full h-[44px] px-[12px] font-heading text-[14px] text-[var(--text-primary)] bg-[var(--bg-white)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--burnt-orange)]"
            />
            <span className="font-heading italic text-[12px] text-[var(--text-muted)]">
              Appears as a &ldquo;Visit sponsor →&rdquo; link in the map tooltip.
            </span>
          </div>

          {/* Logo upload */}
          <div className="flex flex-col gap-[8px]">
            <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
              LOGO FILE {editingExisting ? "(leave empty to keep existing)" : "(REQUIRED)"}
            </span>
            <label className="flex items-center gap-[10px] h-[44px] px-[14px] bg-[var(--bg-warm)] border border-[var(--border-subtle)] hover:border-[var(--burnt-orange)] cursor-pointer transition-colors">
              <Upload className="w-[16px] h-[16px] text-[var(--burnt-orange)]" />
              <span className="font-heading text-[13px] text-[var(--text-secondary)] truncate flex-1">
                {sponsorForm.logoFile ? sponsorForm.logoFile.name : "Choose a JPG, PNG, WebP, or SVG (≤1MB)"}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                onChange={(e) => setSponsorForm((f) => ({ ...f, logoFile: e.target.files?.[0] || null }))}
                className="hidden"
              />
            </label>
            <span className="font-heading italic text-[12px] text-[var(--text-muted)]">
              Square or near-square renders best. Will display as a 50×50 pin on the trail map.
            </span>
          </div>

          {sponsorError && (
            <div className="flex items-center gap-[8px] bg-red-50 border border-red-200 p-[12px]">
              <XCircle className="w-[16px] h-[16px] text-red-500 shrink-0" />
              <span className="font-heading text-[13px] text-red-600">{sponsorError}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-[12px]">
            <button
              type="button"
              onClick={handleSponsorSubmit}
              disabled={sponsorSubmitting}
              className={`flex items-center justify-center gap-[10px] h-[48px] px-[28px] transition-opacity ${
                sponsorSubmitting
                  ? "bg-[var(--text-muted)] cursor-not-allowed"
                  : "bg-[var(--burnt-orange)] cursor-pointer hover:opacity-90"
              }`}
            >
              <Building2 className="w-[18px] h-[18px] text-[var(--text-white)]" />
              <span className="font-label font-bold text-[13px] tracking-[2px] text-[var(--text-white)]">
                {sponsorSubmitting ? "SAVING…" : editingExisting ? "REPLACE SPONSOR" : "ADD SPONSOR"}
              </span>
            </button>
            <button
              type="button"
              onClick={resetSponsorForm}
              className="flex items-center gap-[8px] h-[48px] px-[20px] border border-[var(--border-subtle)] hover:border-[var(--burnt-orange)] transition-colors cursor-pointer"
            >
              <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-secondary)]">
                CLEAR FORM
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- CONTACT MESSAGES VIEW (list) ---
  if (view === "contact" && authenticated) {
    const filtered = contactMessages.filter((m) => {
      if (contactFilter === "unread" && m.readAt) return false;
      if (contactFilter === "replied" && !m.repliedAt) return false;
      if (contactSearch) {
        const q = contactSearch.toLowerCase();
        if (
          !m.name.toLowerCase().includes(q) &&
          !m.email.toLowerCase().includes(q) &&
          !m.subject.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });

    return adminShell(
      <div className="flex flex-col gap-[24px] md:gap-[32px] p-[16px] md:p-[40px] max-w-[960px]">
        <div className="flex flex-col gap-[8px]">
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
            CONTACT
          </span>
          <h1 className="font-heading font-semibold text-[28px] text-[var(--text-primary)]">
            Contact Messages
          </h1>
          <p className="font-heading text-[14px] leading-[1.6] text-[var(--text-secondary)] max-w-[640px]">
            Every submission from <a href="/contact" className="text-[var(--burnt-orange)] hover:underline">/contact</a> lands here. Reply via your Gmail (Reply-To is already set), then come back to mark as replied. Messages are kept for 90 days.
          </p>
        </div>

        {/* Filters + search */}
        <div className="flex flex-col sm:flex-row gap-[12px] sm:items-center">
          <div className="flex gap-[8px]">
            {(["all", "unread", "replied"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setContactFilter(f)}
                className={`px-[14px] py-[8px] font-label font-bold text-[11px] tracking-[1.5px] transition-colors cursor-pointer ${
                  contactFilter === f
                    ? "bg-[var(--burnt-orange)] text-white"
                    : "bg-[var(--bg-warm)] text-[var(--text-secondary)] hover:bg-[var(--warm-stone)]"
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={contactSearch}
            onChange={(e) => setContactSearch(e.target.value)}
            placeholder="Search sender, email, or subject…"
            className="flex-1 h-[40px] px-[12px] font-heading text-[14px] text-[var(--text-primary)] bg-white border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--burnt-orange)]"
          />
        </div>

        {/* Message list */}
        {contactLoading ? (
          <span className="font-heading text-[14px] text-[var(--text-muted)]">Loading messages…</span>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center p-[40px] bg-[var(--bg-warm)] border border-[var(--border-subtle)]">
            <span className="font-heading italic text-[14px] text-[var(--text-muted)]">
              {contactMessages.length === 0 ? "No messages yet." : "No messages match the current filter."}
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-[8px]">
            {filtered.map((m) => {
              const isUnread = !m.readAt;
              const isReplied = !!m.repliedAt;
              const isFailed = m.deliveryStatus === "failed";
              return (
                <button
                  key={m.id}
                  onClick={() => openContactDetail(m.id)}
                  className={`flex flex-col gap-[8px] w-full p-[16px] md:p-[20px] text-left border transition-colors cursor-pointer ${
                    isUnread
                      ? "bg-white border-[var(--burnt-orange)] hover:bg-[var(--burnt-orange-light)]"
                      : "bg-[var(--bg-warm)] border-[var(--border-subtle)] hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-[12px] flex-wrap">
                    <div className="flex items-center gap-[10px] min-w-0 flex-1">
                      <span className={`font-heading text-[15px] truncate ${isUnread ? "font-bold text-[var(--text-primary)]" : "font-semibold text-[var(--text-secondary)]"}`}>
                        {m.name}
                      </span>
                      <span className="font-heading text-[13px] text-[var(--text-muted)] truncate">
                        &lt;{m.email}&gt;
                      </span>
                    </div>
                    <div className="flex items-center gap-[6px] shrink-0">
                      {isFailed && (
                        <span className="font-label font-bold text-[9px] tracking-[1.5px] text-red-700 bg-red-100 px-[8px] py-[3px]">
                          SEND FAILED
                        </span>
                      )}
                      {isUnread && (
                        <span className="font-label font-bold text-[9px] tracking-[1.5px] text-white bg-[var(--burnt-orange)] px-[8px] py-[3px]">
                          UNREAD
                        </span>
                      )}
                      {isReplied && (
                        <span className="font-label font-bold text-[9px] tracking-[1.5px] text-[var(--forest-green)] bg-[var(--forest-green-light)] px-[8px] py-[3px]">
                          REPLIED
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-[12px]">
                    <span className={`font-heading text-[14px] truncate min-w-0 flex-1 ${isUnread ? "font-semibold text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                      {m.subject}
                    </span>
                    <span className="font-label text-[11px] text-[var(--text-muted)] shrink-0">
                      {new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // --- CONTACT MESSAGE DETAIL VIEW ---
  if (view === "contact-detail" && authenticated && contactDetail) {
    const m = contactDetail;
    // Use Gmail's web compose URL rather than mailto:. The button label is
    // "REPLY VIA GMAIL" — it should open Gmail reliably regardless of the
    // OS-level mailto handler configuration. opens in a new tab so Paul
    // doesn't lose the admin view while drafting.
    const gmailReply = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(m.email)}&su=${encodeURIComponent("Re: " + m.subject)}&body=${encodeURIComponent(`Hi ${m.name},\n\n`)}`;

    return adminShell(
      <div className="flex flex-col gap-[24px] md:gap-[32px] p-[16px] md:p-[40px] max-w-[840px]">
        <button
          onClick={() => { setContactDetail(null); setView("contact"); }}
          className="flex items-center gap-[8px] self-start font-label font-bold text-[11px] tracking-[2px] text-[var(--text-secondary)] hover:text-[var(--burnt-orange)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-[14px] h-[14px]" />
          BACK TO INBOX
        </button>

        <div className="flex flex-col gap-[8px]">
          <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
            CONTACT MESSAGE
          </span>
          <h1 className="font-heading font-semibold text-[26px] md:text-[32px] text-[var(--text-primary)]">
            {m.subject}
          </h1>
        </div>

        {/* Sender metadata + status row */}
        <div className="flex flex-col gap-[16px] bg-white border border-[var(--border-subtle)] p-[20px] md:p-[28px]">
          <div className="flex items-center justify-between gap-[16px] flex-wrap">
            <div className="flex flex-col gap-[4px]">
              <span className="font-heading font-semibold text-[16px] text-[var(--text-primary)]">{m.name}</span>
              <a href={`mailto:${m.email}`} className="font-heading text-[13px] text-[var(--burnt-orange)] hover:underline">{m.email}</a>
            </div>
            <div className="flex items-center gap-[6px]">
              {m.deliveryStatus === "failed" && (
                <span className="font-label font-bold text-[10px] tracking-[1.5px] text-red-700 bg-red-100 px-[10px] py-[4px]">
                  SEND FAILED
                </span>
              )}
              {m.repliedAt ? (
                <span className="font-label font-bold text-[10px] tracking-[1.5px] text-[var(--forest-green)] bg-[var(--forest-green-light)] px-[10px] py-[4px]">
                  REPLIED
                </span>
              ) : (
                <span className="font-label font-bold text-[10px] tracking-[1.5px] text-[var(--burnt-orange)] bg-[var(--burnt-orange-light)] px-[10px] py-[4px]">
                  OPEN
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-[2px]">
            <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">RECEIVED</span>
            <span className="font-heading text-[13px] text-[var(--text-secondary)]">
              {new Date(m.createdAt).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
            </span>
          </div>
          {m.repliedAt && (
            <div className="flex flex-col gap-[2px]">
              <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">REPLIED</span>
              <span className="font-heading text-[13px] text-[var(--text-secondary)]">
                {new Date(m.repliedAt).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
              </span>
            </div>
          )}
          {m.deliveryStatus === "failed" && m.sendError && (
            <div className="flex flex-col gap-[4px] bg-red-50 border border-red-200 p-[12px]">
              <span className="font-label font-bold text-[10px] tracking-[1.5px] text-red-700">EMAIL DISPATCH ERROR</span>
              <span className="font-heading text-[12px] text-red-800 break-words">{m.sendError}</span>
              <span className="font-heading italic text-[11px] text-red-700">
                Paul never received this in his inbox. Use the mailto button below to reply manually.
              </span>
            </div>
          )}
        </div>

        {/* Message body */}
        <div className="flex flex-col gap-[8px] bg-white border border-[var(--border-subtle)] p-[20px] md:p-[28px]">
          <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">MESSAGE</span>
          <p className="font-heading text-[15px] leading-[1.7] text-[var(--text-primary)] whitespace-pre-wrap break-words">
            {m.message}
          </p>
        </div>

        {/* Action row */}
        <div className="flex flex-wrap items-center gap-[12px]">
          <a
            href={gmailReply}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-[8px] h-[48px] px-[24px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity"
          >
            <Send className="w-[16px] h-[16px] text-[var(--text-primary)]" />
            <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-primary)]">
              REPLY VIA GMAIL
            </span>
          </a>
          {m.repliedAt ? (
            <button
              onClick={() => handleContactPatch(m.id, { repliedAt: null })}
              className="flex items-center gap-[8px] h-[48px] px-[20px] border border-[var(--border-subtle)] hover:border-[var(--burnt-orange)] transition-colors cursor-pointer"
            >
              <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-secondary)]">
                MARK UNREPLIED
              </span>
            </button>
          ) : (
            <button
              onClick={() => handleContactPatch(m.id, { repliedAt: Date.now() })}
              className="flex items-center gap-[8px] h-[48px] px-[20px] bg-[var(--forest-green)] hover:opacity-90 transition-opacity cursor-pointer"
            >
              <CheckCircle2 className="w-[16px] h-[16px] text-white" />
              <span className="font-label font-bold text-[12px] tracking-[2px] text-white">
                MARK AS REPLIED
              </span>
            </button>
          )}
          <button
            onClick={() => handleContactDelete(m.id)}
            className="flex items-center gap-[8px] h-[48px] px-[20px] border border-red-300 hover:bg-red-50 transition-colors cursor-pointer ml-auto"
          >
            <Trash2 className="w-[14px] h-[14px] text-red-500" />
            <span className="font-label font-bold text-[11px] tracking-[1.5px] text-red-600">DELETE</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}
