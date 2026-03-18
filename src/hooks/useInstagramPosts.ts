"use client";

import { useState, useEffect } from "react";
import type { InstagramPost } from "@/lib/instagram";

interface InstagramState {
  posts: InstagramPost[];
  loading: boolean;
  error: boolean;
}

export function useInstagramPosts(): InstagramState {
  const [state, setState] = useState<InstagramState>({
    posts: [],
    loading: true,
    error: false,
  });

  useEffect(() => {
    fetch("/api/instagram")
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((data) =>
        setState({ posts: data.posts ?? [], loading: false, error: false })
      )
      .catch(() => setState({ posts: [], loading: false, error: true }));
  }, []);

  return state;
}
