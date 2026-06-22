import { apiSuccess, methodNotAllowed } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export function GET() {
  const mode = process.env.VERCEL_ENV?.trim() || process.env.NODE_ENV?.trim() || "unknown";
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.trim();

  return apiSuccess({
    status: "ok",
    app: "alvaro-dev-portfolio-os",
    mode,
    ...(commit ? { commit: commit.slice(0, 7) } : {}),
    timestamp: new Date().toISOString(),
  });
}

export function POST() {
  return methodNotAllowed(["GET"]);
}
