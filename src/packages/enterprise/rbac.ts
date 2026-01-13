export type Role = "CLIENT"|"STYLIST"|"RECEPTION"|"MANAGER"|"OWNER"|"ADMIN"|"SUPPORT";

export type Perm =
  | "ops.read.users"
  | "ops.write.users"
  | "ops.read.bookings"
  | "ops.write.bookings"
  | "ops.view.pii"
  | "ops.refund.payments"
  | "studio.write.profile"
  | "studio.write.services"
  | "studio.write.availability"
  | "studio.read.bookings";

export const ROLE_PERMS: Record<Role, Perm[]> = {
  CLIENT: [],
  STYLIST: ["studio.write.profile","studio.write.services","studio.write.availability","studio.read.bookings"],
  RECEPTION: ["ops.read.bookings","ops.write.bookings"],
  MANAGER: ["ops.read.users","ops.read.bookings","ops.write.bookings","ops.view.pii"],
  OWNER: ["ops.read.users","ops.write.users","ops.read.bookings","ops.write.bookings","ops.view.pii","ops.refund.payments"],
  ADMIN: ["ops.read.users","ops.write.users","ops.read.bookings","ops.write.bookings","ops.view.pii","ops.refund.payments"],
  SUPPORT: ["ops.read.users","ops.read.bookings"],
};

export function hasPerm(role: Role, perm: Perm) {
  return (ROLE_PERMS[role] ?? []).includes(perm);
}
