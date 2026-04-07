import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_BLOG_KNOWLEDGE } from "@/lib/blog-knowledge";

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return token === process.env.ADMIN_AUTH_TOKEN;
}

/**
 * GET /api/admin/blog-knowledge-default
 *
 * Returns the hardcoded default blog knowledge block. Used by the admin
 * Settings tab so the "Reset to default" button can fetch the canonical
 * version without bundling the (long) string into the client JS.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ knowledge: DEFAULT_BLOG_KNOWLEDGE });
}
