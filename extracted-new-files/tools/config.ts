export const BASE_URL = process.env.BASE_URL || "http://localhost:3001";

/**
 * AUTH_MODE:
 * - api_login: uses POST /auth/login to get a Bearer token
 * - direct_session: creates a session directly in DB (bypasses API login)
 */
export const AUTH_MODE = (process.env.AUTH_MODE as "api_login" | "direct_session") || "api_login";

export const SEED = {
  marker: "spine-test-seed",
  tenants: {
    a: { slug: "tenant-a", name: "Tenant A" },
    b: { slug: "tenant-b", name: "Tenant B" },
  },
  users: {
    a: { email: "a@example.com", name: "User A", deviceLabel: "AJ MacBook" },
    b: { email: "b@example.com", name: "User B", deviceLabel: "AJ iPhone" },
  },
  roles: [
    { key: "admin", label: "Admin" },
    { key: "staff", label: "Staff" },
    { key: "viewer", label: "Viewer" },
  ]
};
