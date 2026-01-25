export function asString(value: unknown) {
  return typeof value === "string" ? value : String(value ?? "");
}

export function safeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}
