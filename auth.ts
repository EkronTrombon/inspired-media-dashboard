import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import authConfig from "./auth.config";
import { findUserByEmail, findUserById } from "@/lib/auth-users";
import type { Role } from "@/lib/auth-roles";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").toLowerCase().trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = findUserByEmail(email);
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // Credentials: already verified inside authorize()
      if (account?.provider === "credentials") return true;

      // Google: gate on the allow-list in lib/auth-users.ts
      if (account?.provider === "google") {
        const email = user.email?.toLowerCase();
        if (!email) return false;

        const allowed = findUserByEmail(email);
        if (!allowed) return false;

        user.id = allowed.id;
        user.name = allowed.name;
        user.role = allowed.role;
        return true;
      }

      return false;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user) return session;

      const id = (token.id as string) ?? session.user.id;
      session.user.id = id;

      // Re-fetch the latest role + name from the user store so changes made via
      // the admin Users page propagate without forcing a sign-out. If the user
      // was deleted, leave `role` undefined; hasRole() then locks them out.
      const fresh = id ? findUserById(id) : undefined;
      if (fresh) {
        session.user.role = fresh.role;
        session.user.name = fresh.name;
        session.user.email = fresh.email;
      } else {
        session.user.role = undefined as unknown as Role;
      }
      return session;
    },
  },
});
