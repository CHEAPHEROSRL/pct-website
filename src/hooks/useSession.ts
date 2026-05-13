"use client";

import { useState, useEffect } from "react";

export interface SessionUser {
  email: string;
  name: string;
  pledgeId: string | null;
  expiresAt: number;
}

interface SessionState {
  user: SessionUser | null;
  loading: boolean;
}

export function useSession(): SessionState & { logout: () => Promise<void> } {
  const [state, setState] = useState<SessionState>({ user: null, loading: true });

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => setState({ user: data.session ?? null, loading: false }))
      .catch(() => setState({ user: null, loading: false }));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    // Hard-navigate to a public page instead of just clearing React state.
    //
    // Reason: pages like /my-pledge keep their pledge data in component-
    // level state (separate from the session hook). If we only flipped
    // useSession's state to null, the dashboard view would keep rendering
    // with the cached pledge data — visible to anyone glancing at the
    // screen after sign-out. window.location.href forces a full browser
    // navigation + page reload, which destroys every piece of React state
    // and re-renders the destination page fresh.
    //
    // /pledgers is the destination because it's public, on-brand, and
    // gracefully shifts the user from "my private dashboard" to "see the
    // community I'm part of" — softer than dumping them on the homepage.
    window.location.href = "/pledgers";
  }

  return { ...state, logout };
}
