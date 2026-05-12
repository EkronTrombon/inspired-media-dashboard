import "server-only";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";

import type { Role } from "./auth-roles";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  /** bcryptjs hash. Omit for Google-only users. */
  passwordHash?: string;
  role: Role;
}

const STORE_PATH = path.join(process.cwd(), "data", "users.json");

function ensureStoreFile() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, "[]\n", "utf8");
  }
}

function readStore(): AuthUser[] {
  ensureStoreFile();
  const raw = fs.readFileSync(STORE_PATH, "utf8");
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as AuthUser[];
  } catch {
    return [];
  }
}

function writeStore(users: AuthUser[]) {
  ensureStoreFile();
  // Atomic-ish write: stage to tmp then rename so concurrent reads never see partial JSON.
  const tmp = `${STORE_PATH}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(users, null, 2) + "\n", "utf8");
  fs.renameSync(tmp, STORE_PATH);
}

// ─── Reads ───────────────────────────────────────────────────────────────────

export function listUsers(): AuthUser[] {
  return readStore();
}

export function findUserByEmail(email: string): AuthUser | undefined {
  const target = email.toLowerCase().trim();
  return readStore().find((u) => u.email.toLowerCase() === target);
}

export function findUserById(id: string): AuthUser | undefined {
  return readStore().find((u) => u.id === id);
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export interface CreateUserInput {
  email: string;
  name: string;
  role: Role;
  password?: string;
}

export function createUser(input: CreateUserInput): AuthUser {
  const email = input.email.toLowerCase().trim();
  const users = readStore();

  if (users.some((u) => u.email.toLowerCase() === email)) {
    throw new Error("A user with that email already exists.");
  }

  const user: AuthUser = {
    id: nextId(users),
    email,
    name: input.name.trim(),
    role: input.role,
    passwordHash: input.password ? bcrypt.hashSync(input.password, 10) : undefined,
  };

  users.push(user);
  writeStore(users);
  return user;
}

export interface UpdateUserInput {
  name?: string;
  role?: Role;
  /** New password. Pass `null` to clear (Google-only). */
  password?: string | null;
}

export function updateUser(id: string, input: UpdateUserInput): AuthUser {
  const users = readStore();
  const idx = users.findIndex((u) => u.id === id);
  if (idx < 0) throw new Error("User not found.");

  const user = { ...users[idx] };
  if (input.name !== undefined) user.name = input.name.trim();
  if (input.role !== undefined) user.role = input.role;
  if (input.password === null) {
    delete user.passwordHash;
  } else if (input.password !== undefined && input.password.length > 0) {
    user.passwordHash = bcrypt.hashSync(input.password, 10);
  }

  users[idx] = user;
  writeStore(users);
  return user;
}

export function deleteUser(id: string): void {
  const users = readStore();
  const remaining = users.filter((u) => u.id !== id);
  if (remaining.length === users.length) {
    throw new Error("User not found.");
  }
  if (!remaining.some((u) => u.role === "admin")) {
    throw new Error("Cannot delete the last admin.");
  }
  writeStore(remaining);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function nextId(users: AuthUser[]): string {
  const maxNumeric = users
    .map((u) => Number(u.id))
    .filter((n) => Number.isFinite(n))
    .reduce((a, b) => Math.max(a, b), 0);
  return String(maxNumeric + 1);
}
