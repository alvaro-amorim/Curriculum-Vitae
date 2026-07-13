import type { AnalyticsPayload, ContactPayload } from "@/lib/validators";

function metadataKeys(metadata: Record<string, unknown> | undefined) {
  return metadata ? Object.keys(metadata).slice(0, 20) : [];
}

export function logLocalContact(payload: ContactPayload) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const emailDomain = payload.email.split("@")[1] ?? "unknown";

  console.info("[api/contact] local message received", {
    nameLength: payload.name.length,
    emailDomain,
    messageLength: payload.message.length,
    sourceLength: payload.source?.length ?? 0,
  });
}

export function logLocalAnalytics(payload: AnalyticsPayload) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.info("[api/analytics] local event received", {
    event: payload.event,
    metadataKeys: metadataKeys(payload.metadata),
  });
}
