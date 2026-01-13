export const Roles = {
  ADMIN: ["*"],
  ACCOUNTANT: ["books:*","analytics:*"],
  PAYROLL: ["payroll:*"],
  HR: ["hr:*"],
  MANAGER: ["timesheets:approve","team:read"],
  EMPLOYEE: ["self:read","self:write"]
};

export function hasPermission(role: keyof typeof Roles, perm: string) {
  return Roles[role]?.includes("*") || Roles[role]?.includes(perm);
}
