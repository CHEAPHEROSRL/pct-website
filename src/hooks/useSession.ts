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
    setState({ user: null, loading: false });
  }

  return { ...state, logout };
}
