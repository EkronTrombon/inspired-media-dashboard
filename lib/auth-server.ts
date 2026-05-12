import "server-only";
import type { Session } from "next-auth";

import { auth } from "@/auth";
import { hasRole, type Role } from "./auth-roles";

/**
 * Server-side guard used inside API route handlers. Returns the session when
 * the caller is signed in AND (optionally) has one of `allowed` roles.
 * Returns a `Response` (401 or 403) when the check fails — the route handler
 * should return that response directly:
 *
 *   const gate = await requireRole(["admin"]);
 *   if (gate instanceof Response) return gate;
 *   const { session } = gate;
 */
export async function requireRole(
  allowed?: readonly Role[]
): Promise<{ session: Session } | Response> {
  const session = (await auth()) as Session | null;
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasRole(session.user.role, allowed)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  return { session };
}
