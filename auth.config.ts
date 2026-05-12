import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe config consumed by `proxy.ts` (Next.js 16 file convention) and
 * spread into the full config in `auth.ts`. Anything that must run in the
 * Edge runtime (route guards, redirect logic) belongs here. Provider modules,
 * bcrypt, DB calls, etc. live in `auth.ts` instead.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      if (isOnLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/social", nextUrl));
        }
        return true;
      }

      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
