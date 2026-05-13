import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { requireAdminAuth, sanitizeText } from "@/lib/security";
import { readSponsors, upsertSponsor, removeSponsor } from "@/lib/sponsors";
import { trailSections, type SponsorRecord } from "@/lib/trail";
import crypto from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const MAX_SIZE = 1 * 1024 * 1024; // 1MB — sponsor logos are small

// GET /api/admin/sponsors — list all sponsors
export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const sponsors = await readSponsors();
    return NextResponse.json({ sponsors });
  } catch (err) {
    console.error("Failed to list sponsors:", err);
    return NextResponse.json({ error: "Failed to list sponsors" }, { status: 500 });
  }
}

// POST /api/admin/sponsors — add or replace a sponsor (multipart form).
//
// Fields:
//   logo          : File (jpg/png/webp/svg, ≤1MB)
//   companyName   : string
//   websiteUrl    : string (optional)
//   mode          : "section" | "custom"
//   sectionId     : string (required when mode = section)
//   customName    : string (required when mode = custom)
//   customMiles   : number (required when mode = custom)
//   customLat     : number (required when mode = custom)
//   customLng     : number (required when mode = custom)
//
// Replacement rule (one sponsor per section): if mode=section and a sponsor
// already exists for that sectionId, the old logo is deleted from Blob and
// replaced. For custom sponsors, each POST creates a new entry.
export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const form = await request.formData();

    const companyName = sanitizeText(String(form.get("companyName") || ""), 80);
    if (!companyName) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 });
    }

    // Website URL is optional. Be friendly about it: if the admin types
    // "acme.com" we silently upgrade to "https://acme.com" so the tooltip
    // link still works. But any non-http(s) scheme (javascript:, mailto:,
    // data:, etc.) is rejected outright — that link would render as a
    // clickable target on the public trail-map tooltip.
    const websiteRaw = String(form.get("websiteUrl") || "").trim();
    let websiteUrl: string | undefined;
    if (websiteRaw) {
      if (/^https?:\/\//i.test(websiteRaw)) {
        websiteUrl = sanitizeText(websiteRaw, 200);
      } else if (/^[a-z][a-z0-9+.-]*:/i.test(websiteRaw)) {
        return NextResponse.json(
          { error: "Website URL must be http:// or https://" },
          { status: 400 }
        );
      } else {
        websiteUrl = sanitizeText(`https://${websiteRaw}`, 200);
      }
    }

    const mode = String(form.get("mode") || "");
    if (mode !== "section" && mode !== "custom") {
      return NextResponse.json({ error: "Mode must be 'section' or 'custom'" }, { status: 400 });
    }

    let sectionId: string | undefined;
    let customLocation: SponsorRecord["customLocation"] | undefined;

    if (mode === "section") {
      sectionId = String(form.get("sectionId") || "");
      if (!trailSections.some((s) => s.id === sectionId)) {
        return NextResponse.json({ error: "Unknown sectionId" }, { status: 400 });
      }
    } else {
      const customName = sanitizeText(String(form.get("customName") || ""), 60);
      const customMiles = Number(form.get("customMiles"));
      const customLat = Number(form.get("customLat"));
      const customLng = Number(form.get("customLng"));

      if (!customName) {
        return NextResponse.json({ error: "Custom location name is required" }, { status: 400 });
      }
      if (!Number.isFinite(customMiles) || customMiles < 0 || customMiles > 2700) {
        return NextResponse.json({ error: "Custom miles must be between 0 and 2700" }, { status: 400 });
      }
      if (!Number.isFinite(customLat) || customLat < -90 || customLat > 90) {
        return NextResponse.json({ error: "Custom lat must be between -90 and 90" }, { status: 400 });
      }
      if (!Number.isFinite(customLng) || customLng < -180 || customLng > 180) {
        return NextResponse.json({ error: "Custom lng must be between -180 and 180" }, { status: 400 });
      }
      customLocation = { name: customName, miles: customMiles, lat: customLat, lng: customLng };
    }

    // Logo file — required on create, optional on replace (we'll fall back to
    // existing record's URL if not provided)
    const logoFile = form.get("logo") as File | null;
    let logoUrl: string;

    if (logoFile && logoFile.size > 0) {
      if (!ALLOWED_TYPES.includes(logoFile.type)) {
        return NextResponse.json(
          { error: "Logo must be JPEG, PNG, WebP, or SVG" },
          { status: 400 }
        );
      }
      if (logoFile.size > MAX_SIZE) {
        return NextResponse.json(
          { error: "Logo must be under 1MB" },
          { status: 400 }
        );
      }

      // Stable filename per sponsor so re-uploads overwrite cleanly. For named
      // sections, key by sectionId; for custom, by record id (generated below).
      const ext =
        logoFile.type === "image/svg+xml" ? "svg"
        : logoFile.type === "image/jpeg" ? "jpg"
        : logoFile.type.split("/")[1];
      const slug = sectionId || `custom-${crypto.randomBytes(6).toString("hex")}`;
      const blob = await put(`sponsors/${slug}.${ext}`, logoFile, {
        access: "public",
        addRandomSuffix: false,
      });
      logoUrl = blob.url;
    } else {
      // No new logo — look up the existing record (only valid for replace flow).
      const existing = sectionId
        ? (await readSponsors()).find((s) => s.sectionId === sectionId)
        : undefined;
      if (!existing) {
        return NextResponse.json({ error: "Logo file is required" }, { status: 400 });
      }
      logoUrl = existing.logoUrl;
    }

    // Build the record. Reuse the existing id when replacing a named-section
    // sponsor so the entry's "createdAt" stays meaningful.
    const existingForId = sectionId
      ? (await readSponsors()).find((s) => s.sectionId === sectionId)
      : undefined;

    const record: SponsorRecord = {
      id: existingForId?.id || crypto.randomBytes(8).toString("hex"),
      companyName,
      logoUrl,
      websiteUrl,
      sectionId,
      customLocation,
      createdAt: existingForId?.createdAt || Date.now(),
    };

    // If we're replacing and the old logo URL differs from the new one, delete
    // the old blob so we don't orphan files.
    if (existingForId && existingForId.logoUrl !== logoUrl) {
      try {
        await del(existingForId.logoUrl);
      } catch {
        // Non-fatal — orphan blob is annoying but not breaking
      }
    }

    const sponsors = await upsertSponsor(record);
    return NextResponse.json({ sponsors, record });
  } catch (err) {
    // Bubble the actual message up to the admin UI. Safe to expose because
    // this route is admin-auth-guarded; the message is what we'd otherwise
    // have to dig out of Vercel logs by hand. Common failure modes here:
    //   • Vercel Blob token missing  → "No token found. Either configure the
    //     `BLOB_READ_WRITE_TOKEN` environment variable, or pass a `token`
    //     option to your calls."
    //   • Wrong blob region/store    → "Vercel Blob: ..." with explanation
    //   • Redis not configured       → "Redis not configured" (from sponsors.ts)
    console.error("Failed to save sponsor:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Failed to save sponsor: ${message}` }, { status: 500 });
  }
}

// DELETE /api/admin/sponsors?id=<id> — remove a sponsor and its logo blob.
export async function DELETE(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id parameter required" }, { status: 400 });
  }

  try {
    const before = await readSponsors();
    const target = before.find((s) => s.id === id);
    if (!target) {
      return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
    }

    const sponsors = await removeSponsor(id);

    // Delete the blob after Redis update succeeds. If the blob delete fails the
    // sponsor is still removed from the visible list — orphan blob can be
    // cleaned up later, no user-facing impact.
    try {
      await del(target.logoUrl);
    } catch {
      // swallow — non-fatal
    }

    return NextResponse.json({ sponsors });
  } catch (err) {
    console.error("Failed to delete sponsor:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Failed to delete sponsor: ${message}` }, { status: 500 });
  }
}
