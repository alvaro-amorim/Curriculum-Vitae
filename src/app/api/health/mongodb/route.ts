import { NextResponse } from "next/server";

import { methodNotAllowed } from "@/lib/api-response";
import { checkMongoHealth } from "@/lib/mongodb/health";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await checkMongoHealth();
  const connected = health.status === "connected";
  const publicHealth = {
    configured: health.configured,
    database: health.database,
    latencyMs: health.latencyMs,
    status: health.status,
    ...(process.env.NODE_ENV !== "production" && health.message
      ? { message: health.message }
      : {}),
  };

  return NextResponse.json(
    {
      data: publicHealth,
      ok: connected,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
      status: connected ? 200 : 503,
    },
  );
}

export function POST() {
  return methodNotAllowed(["GET"]);
}
