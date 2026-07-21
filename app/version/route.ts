import { NextResponse } from "next/server";

export const runtime = "edge";

/**
 * Plain-text deploy fingerprint for control-plane deploy gates.
 * Cloudflare Pages sets CF_PAGES_COMMIT_SHA at build time; we expose it
 * (and common fallbacks) so GET /version returns the live git SHA.
 */
export async function GET() {
  const sha = (
    process.env.NEXT_PUBLIC_CF_PAGES_COMMIT_SHA ||
    process.env.CF_PAGES_COMMIT_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    "unknown"
  ).trim();

  return new NextResponse(sha + "\n", {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
