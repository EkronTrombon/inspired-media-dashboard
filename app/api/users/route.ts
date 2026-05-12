import { NextRequest } from "next/server";

import { requireRole } from "@/lib/auth-server";
import { ROLES, type Role } from "@/lib/auth-roles";
import {
  createUser,
  listUsers,
  type AuthUser,
} from "@/lib/auth-users";

interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  hasPassword: boolean;
}

function toPublic(u: AuthUser): PublicUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    hasPassword: Boolean(u.passwordHash),
  };
}

export async function GET() {
  const gate = await requireRole(["admin"]);
  if (gate instanceof Response) return gate;

  return Response.json(listUsers().map(toPublic));
}

export async function POST(req: NextRequest) {
  const gate = await requireRole(["admin"]);
  if (gate instanceof Response) return gate;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseCreate(body);
  if ("error" in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const user = createUser(parsed);
    return Response.json(toPublic(user), { status: 201 });
  } catch (e) {
    return Response.json(
      { error: (e as Error).message || "Failed to create user." },
      { status: 400 }
    );
  }
}

function parseCreate(input: unknown):
  | { email: string; name: string; role: Role; password?: string }
  | { error: string } {
  if (!input || typeof input !== "object") return { error: "Invalid payload." };
  const raw = input as Record<string, unknown>;

  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const role = raw.role as Role | undefined;
  const password = typeof raw.password === "string" ? raw.password : undefined;

  if (!email || !/^.+@.+\..+$/.test(email)) return { error: "A valid email is required." };
  if (!name) return { error: "Name is required." };
  if (!role || !ROLES.includes(role)) return { error: "Role must be admin, editor, or viewer." };
  if (password !== undefined && password.length > 0 && password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  return {
    email,
    name,
    role,
    password: password && password.length > 0 ? password : undefined,
  };
}
