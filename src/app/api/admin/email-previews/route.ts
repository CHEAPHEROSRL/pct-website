import { NextRequest, NextResponse } from "next/server";
import {
  EMAIL_TEMPLATES,
  getTemplateById,
  getTemplateMetadata,
} from "@/lib/email-templates";
import { constantTimeEqual } from "@/lib/security";

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return constantTimeEqual(token, process.env.ADMIN_AUTH_TOKEN);
}

/**
 * GET /api/admin/email-previews
 *   Returns metadata for every email template, grouped by category.
 *   Does NOT render any HTML (cheap list view).
 *
 * GET /api/admin/email-previews?id=<template-id>
 *   Renders the specific template with its sample data and returns
 *   { id, metadata, preview: { to, from, subject, html } }.
 */
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");

  // List mode — just metadata
  if (!id) {
    return NextResponse.json({
      templates: getTemplateMetadata(),
      total: EMAIL_TEMPLATES.length,
    });
  }

  // Detail mode — render one
  const template = getTemplateById(id);
  if (!template) {
    return NextResponse.json(
      { error: `Template not found: ${id}` },
      { status: 404 }
    );
  }

  try {
    const preview = await template.render();
    const { render: _render, ...metadata } = template;
    void _render;
    return NextResponse.json({
      id,
      metadata,
      preview,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: `Failed to render template ${id}: ${message}`,
      },
      { status: 500 }
    );
  }
}
