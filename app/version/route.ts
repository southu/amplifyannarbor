// Reports the commit SHA baked in at build time (see next.config.ts `env`).
// Edge runtime is mandatory on Cloudflare Pages.
export const runtime = "edge";

export async function GET() {
  const sha = process.env.COMMIT_SHA || "unknown";
  return new Response(sha, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
