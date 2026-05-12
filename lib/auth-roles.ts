export type Role = "admin" | "editor" | "viewer";

export const ROLES: readonly Role[] = ["admin", "editor", "viewer"] as const;

/**
 * Returns true when `userRole` is allowed by `allowed`.
 * - If `allowed` is undefined/empty, any signed-in user passes (truthy `userRole`).
 * - Otherwise, `userRole` must be one of the allowed roles.
 */
export function hasRole(
  userRole: Role | undefined | null,
  allowed?: readonly Role[]
): boolean {
  if (!userRole) return false;
  if (!allowed || allowed.length === 0) return true;
  return allowed.includes(userRole);
}
