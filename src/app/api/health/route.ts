import { apiSuccess, methodNotAllowed } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export function GET() {
  return apiSuccess({
    status: "ok",
    app: "alvaro-dev-portfolio-os",
    mode: "local",
    timestamp: new Date().toISOString(),
  });
}

export function POST() {
  return methodNotAllowed(["GET"]);
}

