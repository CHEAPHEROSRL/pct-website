import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/instagram/image?url=<instagram-cdn-url>
 *
 * Proxies an Instagram CDN image through our own origin. Instagram's CDN sends
 * `Cross-Origin-Resource-Policy: same-origin` headers which block browsers from
 * loading the image on any other domain — even though the URL is public and
 * returns a 200. Proxying through our own Vercel edge fixes this because the
 * browser sees our own domain.
 *
 * Only allows URLs from Instagram's known CDN hostnames to prevent this being
 * abused as a generic open proxy.
 */
const ALLOWED_HOSTS = [
  "cdninstagram.com",
  "fbcdn.net",
];

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  // Only allow Instagram CDN hosts
  const hostAllowed = ALLOWED_HOSTS.some((h) => parsed.hostname.endsWith(h));
  if (!hostAllowed) {
    return new NextResponse("Host not allowed", { status: 403 });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/*,*/*;q=0.8",
      },
    });

    if (!upstream.ok) {
      return new NextResponse(`Upstream error: ${upstream.status}`, {
        status: upstream.status,
      });
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Cache for 1 day on CDN, 7 days stale. Instagram URLs have signed
        // expiry (~1 week) so don't cache longer than that.
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("Instagram image proxy error:", err);
    return new NextResponse("Proxy error", { status: 502 });
  }
}
