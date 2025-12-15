export const BASE_URL = process.env.BASE_URL || "http://localhost:3001";

export const TEST_TENANTS = {
  a: { slug: "tenant-a", name: "Tenant A" },
  b: { slug: "tenant-b", name: "Tenant B" },
};

export const TEST_USERS = {
  // Ensure these exist in your DB/seed OR swap to your signup endpoint.
  a: { tenantId: "tenant-a", email: "a@example.com", deviceLabel: "AJ MacBook" },
  b: { tenantId: "tenant-b", email: "b@example.com", deviceLabel: "AJ iPhone" },
};
