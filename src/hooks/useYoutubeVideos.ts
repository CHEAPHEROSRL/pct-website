"use client";

import { useEffect, useState } from "react";
import type { YoutubeVideo } from "@/lib/youtube-feed";

export function useYoutubeVideos() {
  const [videos, setVideos] = useState<YoutubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/youtube")
      .then((r) => r.json())
      .then((data) => setVideos(data.videos ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return { videos, loading, error };
}
