export function assertSanitized(response: any) {
  if (!response || typeof response !== "object") return;
  if ("ssn" in response || "salary" in response || "bankAccount" in response) {
    throw new Error("SECURITY_VIOLATION: Unsanitized payload");
  }
}
