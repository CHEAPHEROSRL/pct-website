import { Redis } from "@upstash/redis";

const SETTINGS_KEY = "admin:settings";

let _cachedSettings: Record<string, string> | null = null;
let _cacheTime = 0;
const CACHE_TTL = 60_000; // 1 minute

async function loadSettings(): Promise<Record<string, string>> {
  if (_cachedSettings && Date.now() - _cacheTime < CACHE_TTL) {
    return _cachedSettings;
  }

  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) return {};

    const redis = new Redis({ url, token });
    const raw = await redis.get<string>(SETTINGS_KEY);
    if (!raw) return {};

    const settings = typeof raw === "string" ? JSON.parse(raw) : raw;
    _cachedSettings = settings;
    _cacheTime = Date.now();
    return settings;
  } catch {
    return {};
  }
}

/**
 * Get a setting value. Checks Redis admin settings first, then falls back to env var.
 */
export async function getSetting(
  settingsKey: string,
  envVar: string,
  fallback?: string
): Promise<string | undefined> {
  const settings = await loadSettings();
  return settings[settingsKey] || process.env[envVar] || fallback;
}
