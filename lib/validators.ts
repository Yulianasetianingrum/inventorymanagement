export function validateLoginPayload(payload: Record<string, unknown>, keys: string[]) {
  const missing = keys.filter((key) => !payload[key] || typeof payload[key] !== "string");
  return {
    valid: missing.length === 0,
    missing,
  };
}

export async function readJsonOrForm(req: Request) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await req.json()) as Record<string, unknown>;
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await req.formData();
    return Object.fromEntries(form.entries());
  }

  // Fallback: try JSON, then form once each using a clone to avoid double-read errors.
  try {
    return (await req.clone().json()) as Record<string, unknown>;
  } catch {
    const form = await req.formData();
    return Object.fromEntries(form.entries());
  }
}
