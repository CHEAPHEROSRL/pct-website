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
} from "lucide-react";
import type { JournalPost, ChallengePublic } from "@/lib/types";

type View = "login" | "list" | "editor" | "challenges" | "honor" | "waitlist" | "settings";
type AdminTab = "journal" | "challenges" | "honor" | "waitlist" | "settings";

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
  const [activeTab, setActiveTab] = useState<AdminTab>("journal");
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

  // Settings state
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Email test state
  const [testEmailTo, setTestEmailTo] = useState("ciocanraul@gmail.com");
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

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
        setView("list");
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
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setVideoResult(data);
        setVideoUrl("");
        setVideoDayNumber(undefined);
        setVideoSplit(false);
        setVideoForce(false);
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
        setView("list");
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
        <div className="flex flex-col items-center justify-center flex-1 gap-[32px] px-[60px]">
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
        <div className="flex items-center justify-between h-[64px] px-[40px] bg-[var(--bg-white)] border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-[12px]">
            <Shield className="w-[24px] h-[24px] text-[var(--forest-green)]" />
            <span className="font-label font-bold text-[14px] tracking-[3px] text-[var(--text-primary)]">
              YESCHAPTER ADMIN
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-[8px] px-[20px] py-[8px] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            <LogOut className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
            <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-secondary)]">
              LOG OUT
            </span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 px-[40px] bg-[var(--bg-white)] border-b border-[var(--border-subtle)]">
          <button
            onClick={() => { setActiveTab("journal"); setView("list"); setStatus(""); }}
            className={`flex items-center gap-[8px] px-[24px] py-[14px] font-label font-bold text-[12px] tracking-[2px] border-b-2 transition-colors cursor-pointer ${
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
            className={`flex items-center gap-[8px] px-[24px] py-[14px] font-label font-bold text-[12px] tracking-[2px] border-b-2 transition-colors cursor-pointer ${
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
            className={`flex items-center gap-[8px] px-[24px] py-[14px] font-label font-bold text-[12px] tracking-[2px] border-b-2 transition-colors cursor-pointer ${
              activeTab === "honor"
                ? "border-[var(--burnt-orange)] text-[var(--burnt-orange)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <CheckCircle className="w-[16px] h-[16px]" />
            HONOR TRACKING
          </button>
          <button
            onClick={() => { setActiveTab("waitlist"); setView("waitlist"); setStatus(""); fetchWaitlist(); }}
            className={`flex items-center gap-[8px] px-[24px] py-[14px] font-label font-bold text-[12px] tracking-[2px] border-b-2 transition-colors cursor-pointer ${
              activeTab === "waitlist"
                ? "border-[var(--burnt-orange)] text-[var(--burnt-orange)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <Mail className="w-[16px] h-[16px]" />
            WAITLIST
          </button>
          <button
            onClick={() => { setActiveTab("settings"); setView("settings"); setStatus(""); fetchSettings(); }}
            className={`flex items-center gap-[8px] px-[24px] py-[14px] font-label font-bold text-[12px] tracking-[2px] border-b-2 transition-colors cursor-pointer ${
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

  // --- LIST VIEW ---
  if (view === "list") {
    return adminShell(
        <div className="flex flex-col gap-[24px] p-[40px]">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-[8px]">
              <span className="font-label font-bold text-[12px] tracking-[3px] text-[var(--burnt-orange)]">
                JOURNAL POSTS
              </span>
              <h1 className="font-heading font-semibold text-[28px] text-[var(--text-primary)]">
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
              className="flex items-center gap-[8px] px-[28px] py-[14px] bg-[var(--burnt-orange)] hover:opacity-90 transition-opacity cursor-pointer"
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

          {/* Posts table */}
          <div className="flex flex-col bg-[var(--bg-white)] border border-[var(--border-subtle)]">
            {/* Table header */}
            <div className="flex items-center px-[20px] py-[12px] bg-[var(--warm-stone)] border-b border-[var(--border-subtle)]">
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
              <span className="w-[100px] font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
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
              <div className="flex flex-col items-center gap-[12px] py-[48px]">
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
                  className="flex items-center px-[20px] py-[16px] border-b border-[var(--border-subtle)] last:border-b-0"
                >
                  <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                    <span className="font-heading font-semibold text-[14px] text-[var(--text-primary)] truncate">
                      {post.title}
                    </span>
                    <span className="font-label text-[11px] text-[var(--text-muted)] truncate">
                      {post.slug}
                    </span>
                  </div>
                  <span className="w-[80px] font-heading text-[14px] text-[var(--text-secondary)]">
                    Day {post.dayNumber}
                  </span>
                  <span className="w-[120px] font-heading text-[13px] text-[var(--text-secondary)]">
                    {post.date}
                  </span>
                  <div className="w-[130px]">
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
                  <div className="flex gap-[8px] w-[100px]">
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
        {/* Top bar */}
        <div className="flex items-center justify-between h-[64px] px-[40px] bg-[var(--bg-white)] border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-[12px]">
            <button
              onClick={() => {
                setView("list");
                setEditingPost(null);
                setStatus("");
              }}
              className="flex items-center gap-[6px] px-[12px] py-[8px] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
              <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-secondary)]">
                BACK
              </span>
            </button>
            <div className="w-[1px] h-[24px] bg-[var(--border-subtle)]" />
            <span className="font-heading font-semibold text-[18px] text-[var(--text-primary)]">
              {isNew ? "New Post" : "Edit Post"}
            </span>
          </div>
          <div className="flex gap-[12px]">
            <button
              onClick={() => handleSave(false)}
              disabled={loading}
              className="flex items-center gap-[8px] px-[24px] py-[12px] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <span className="font-label font-bold text-[12px] tracking-[2px] text-[var(--text-secondary)]">
                {loading ? "SAVING..." : "SAVE DRAFT"}
              </span>
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={loading}
              className="flex items-center gap-[8px] px-[24px] py-[12px] bg-[var(--forest-green)] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-[14px] h-[14px] text-white" />
              <span className="font-label font-bold text-[12px] tracking-[2px] text-white">
                {loading ? "PUBLISHING..." : "PUBLISH"}
              </span>
            </button>
          </div>
        </div>

        {status && (
          <div className="px-[40px] pt-[16px]">
            <span className="font-label text-[13px] text-red-500">
              {status}
            </span>
          </div>
        )}

        {/* Form area */}
        <div className="flex gap-[32px] p-[40px]">
          {/* Main column */}
          <div className="flex flex-col gap-[24px] flex-1">
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

          {/* Side column */}
          <div className="flex flex-col gap-[24px] w-[320px] shrink-0">
            {/* Post Details card */}
            <div className="flex flex-col gap-[16px] p-[24px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
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
      </div>
    );
  }

  // --- CHALLENGES VIEW ---
  if (view === "challenges" && authenticated) {
    return adminShell(
        <div className="flex flex-col gap-[24px] p-[40px]">
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
                <div className="flex flex-col gap-[16px] p-[28px] bg-[var(--bg-white)] border-2 border-[var(--burnt-orange)]">
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
                <div className="flex flex-col gap-[20px] p-[28px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
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
        <div className="flex flex-col gap-[24px] p-[40px]">
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
        <div className="flex flex-col gap-[24px] p-[40px]">
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
              onClick={fetchWaitlist}
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

  // --- SETTINGS VIEW ---
  if (view === "settings" && authenticated) {
    return adminShell(
        <div className="flex flex-col gap-[32px] p-[40px] max-w-[720px]">
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
              <div className="flex flex-col gap-[20px] p-[28px] bg-[var(--bg-white)] border-2 border-[var(--forest-green)]">
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
              <div className="flex flex-col gap-[20px] p-[28px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-[10px]">
                  <Mail className="w-[18px] h-[18px] text-[var(--burnt-orange)]" />
                  <span className="font-label font-bold text-[11px] tracking-[2px] text-[var(--text-primary)]">
                    EMAIL NOTIFICATIONS (GMAIL)
                  </span>
                </div>
                <p className="font-heading text-[14px] leading-[1.7] text-[var(--text-secondary)]">
                  Email is sent via the Gmail API using a Google Cloud OAuth2 app. When credentials are configured, the site automatically sends new-post notifications to waitlist subscribers and pledgers, plus weekly updates, milestone emails, and honor reminders.
                </p>

                <div className="flex flex-col gap-[8px] p-[16px] bg-[var(--bg-warm)] border border-[var(--border-subtle)]">
                  <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">SETUP GUIDE</span>
                  <ol className="flex flex-col gap-[6px] font-heading text-[13px] leading-[1.6] text-[var(--text-secondary)] list-decimal pl-[20px]">
                    <li>Go to <strong>console.cloud.google.com</strong>, create a new project (e.g. &ldquo;YesChapter Email&rdquo;)</li>
                    <li>Enable the <strong>Gmail API</strong> for the project</li>
                    <li>Configure the OAuth consent screen (External, fill in app name + your email)</li>
                    <li>Create OAuth 2.0 Client ID credentials (type: Web application). Add <code className="bg-[var(--bg-card)] px-[4px]">https://developers.google.com/oauthplayground</code> as an Authorized redirect URI</li>
                    <li>Copy the <strong>Client ID</strong> and <strong>Client Secret</strong></li>
                    <li>Go to <strong>developers.google.com/oauthplayground</strong>, click the gear icon, check &ldquo;Use your own OAuth credentials&rdquo;, paste the ID + secret</li>
                    <li>In the left sidebar, find <strong>Gmail API v1</strong> and select scope <code className="bg-[var(--bg-card)] px-[4px]">https://www.googleapis.com/auth/gmail.send</code></li>
                    <li>Click <strong>Authorize APIs</strong>, sign in as the Google account that should send emails (e.g. <code className="bg-[var(--bg-card)] px-[4px]">paul@yeschapter.com</code> if it&apos;s a Workspace account)</li>
                    <li>Click <strong>Exchange authorization code for tokens</strong> and copy the <strong>Refresh token</strong></li>
                    <li>Add these as Vercel environment variables (Production): <code className="bg-[var(--bg-card)] px-[4px]">GMAIL_CLIENT_ID</code>, <code className="bg-[var(--bg-card)] px-[4px]">GMAIL_CLIENT_SECRET</code>, <code className="bg-[var(--bg-card)] px-[4px]">GMAIL_REFRESH_TOKEN</code>, <code className="bg-[var(--bg-card)] px-[4px]">EMAIL_FROM</code> (e.g. <code className="bg-[var(--bg-card)] px-[4px]">YesChapter &lt;paul@yeschapter.com&gt;</code>)</li>
                    <li>Redeploy the site (or trigger any new commit)</li>
                    <li>Use the test box below to verify it works</li>
                  </ol>
                </div>

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
              <div className="flex flex-col gap-[20px] p-[28px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
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
              </div>

              {/* AI Provider */}
              <div className="flex flex-col gap-[20px] p-[28px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
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
              </div>

              {/* YouTube */}
              <div className="flex flex-col gap-[20px] p-[28px] bg-[var(--bg-white)] border border-[var(--border-subtle)]">
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

              {/* Data Management */}
              <div className="flex flex-col gap-[20px] p-[28px] bg-[var(--bg-white)] border border-[var(--border-subtle)] mt-[24px]">
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

  return null;
}
