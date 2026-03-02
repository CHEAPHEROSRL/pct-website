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
} from "lucide-react";
import type { JournalPost } from "@/lib/types";

type View = "login" | "list" | "editor";

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [view, setView] = useState<View>("login");
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [editingPost, setEditingPost] = useState<Partial<JournalPost> | null>(
    null
  );

  // Load token from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pct-admin-token");
    if (saved) setToken(saved);
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

  // Login
  async function handleLogin() {
    if (!token.trim()) return;
    setLoading(true);
    setStatus("");
    localStorage.setItem("pct-admin-token", token);

    try {
      const res = await fetch("/api/journal?all=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: JournalPost[] = await res.json();
        setPosts(data);
        setAuthenticated(true);
        setView("list");
      } else if (res.status === 401) {
        setStatus("Invalid token");
        localStorage.removeItem("pct-admin-token");
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
              Enter admin token to continue
            </span>
          </div>

          <div className="flex flex-col gap-[8px] w-full max-w-[360px]">
            <span className="font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
              ADMIN TOKEN
            </span>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Enter your admin token"
              className="w-full h-[48px] px-[16px] bg-[#2A2D28] font-heading text-[15px] text-white placeholder:text-[#666666] outline-none"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !token.trim()}
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

  // --- LIST VIEW ---
  if (view === "list") {
    return (
      <div className="flex flex-col w-full min-h-screen bg-[var(--bg-warm)]">
        {/* Top bar */}
        <div className="flex items-center justify-between h-[64px] px-[40px] bg-[var(--bg-white)] border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-[12px]">
            <Shield className="w-[24px] h-[24px] text-[var(--forest-green)]" />
            <span className="font-label font-bold text-[14px] tracking-[3px] text-[var(--text-primary)]">
              PCT ADMIN
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

        {/* Content */}
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
              <span className="w-[110px] font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
                STATUS
              </span>
              <span className="w-[130px] font-label font-bold text-[10px] tracking-[2px] text-[var(--text-muted)]">
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
                  <div className="w-[110px]">
                    <span
                      className={`inline-block px-[10px] py-[4px] font-label font-bold text-[10px] tracking-[1px] ${
                        post.published
                          ? "bg-[var(--forest-green-light)] text-[var(--forest-green)]"
                          : "bg-[var(--burnt-orange-light)] text-[var(--burnt-orange)]"
                      }`}
                    >
                      {post.published ? "PUBLISHED" : "DRAFT"}
                    </span>
                  </div>
                  <div className="flex gap-[8px] w-[130px]">
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
                      <span className="font-label font-bold text-[10px] tracking-[1px] text-[#8B2020]">
                        DELETE
                      </span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
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
                {["BLOG", "VLOG", "PHOTOS"].map((tag) => {
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

  return null;
}
