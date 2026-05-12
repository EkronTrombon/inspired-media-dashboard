import { NextRequest } from "next/server";

import { requireRole } from "@/lib/auth-server";
import { ROLES, hasRole, type Role } from "@/lib/auth-roles";
import {
  deleteUser,
  findUserById,
  listUsers,
  updateUser,
  type AuthUser,
} from "@/lib/auth-users";

function toPublic(u: AuthUser) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    hasPassword: Boolean(u.passwordHash),
  };
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  // Any signed-in user can hit this; admin check happens below per-target.
  const gate = await requireRole();
  if (gate instanceof Response) return gate;
  const { session } = gate;

  const { id } = await ctx.params;
  const target = findUserById(id);
  if (!target) {
    return Response.json({ error: "User not found." }, { status: 404 });
  }

  const isSelf = session.user.id === target.id;
  if (!isSelf && !hasRole(session.user.role, ["admin"])) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parsePatch(body);
  if ("error" in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  // Self-update path: silently drop role so users can't elevate themselves.
  if (isSelf) {
    delete parsed.role;
    if (Object.keys(parsed).length === 0) {
      return Response.json({ error: "No fields to update." }, { status: 400 });
    }
  }

  // Guard: an admin must not demote themselves if they're the last admin.
  if (
    parsed.role !== undefined &&
    target.id === session.user.id &&
    target.role === "admin" &&
    parsed.role !== "admin"
  ) {
    const otherAdmins = listUsers().filter(
      (u) => u.id !== target.id && u.role === "admin"
    );
    if (otherAdmins.length === 0) {
      return Response.json(
        { error: "You can't change your own role — you're the last admin." },
        { status: 400 }
      );
    }
  }

  try {
    const updated = updateUser(id, parsed);
    return Response.json(toPublic(updated));
  } catch (e) {
    return Response.json(
      { error: (e as Error).message || "Failed to update user." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const gate = await requireRole(["admin"]);
  if (gate instanceof Response) return gate;
  const { session } = gate;

  const { id } = await ctx.params;

  if (id === session.user.id) {
    return Response.json(
      { error: "You can't delete your own account." },
      { status: 400 }
    );
  }

  try {
    deleteUser(id);
    return new Response(null, { status: 204 });
  } catch (e) {
    return Response.json(
      { error: (e as Error).message || "Failed to delete user." },
      { status: 400 }
    );
  }
}

function parsePatch(input: unknown):
  | { name?: string; role?: Role; password?: string | null }
  | { error: string } {
  if (!input || typeof input !== "object") return { error: "Invalid payload." };
  const raw = input as Record<string, unknown>;

  const out: { name?: string; role?: Role; password?: string | null } = {};

  if (raw.name !== undefined) {
    if (typeof raw.name !== "string" || !raw.name.trim()) {
      return { error: "Name must be a non-empty string." };
    }
    out.name = raw.name.trim();
  }

  if (raw.role !== undefined) {
    if (typeof raw.role !== "string" || !ROLES.includes(raw.role as Role)) {
      return { error: "Role must be admin, editor, or viewer." };
    }
    out.role = raw.role as Role;
  }

  if (raw.password !== undefined) {
    if (raw.password === null) {
      out.password = null;
    } else if (typeof raw.password === "string") {
      if (raw.password.length > 0 && raw.password.length < 8) {
        return { error: "Password must be at least 8 characters." };
      }
      out.password = raw.password;
    } else {
      return { error: "Password must be a string or null." };
    }
  }

  if (Object.keys(out).length === 0) {
    return { error: "No fields to update." };
  }

  return out;
}
