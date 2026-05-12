import NextAuth from "next-auth";
import authConfig from "./auth.config";

// Next.js 16: the former `middleware.ts` file is now `proxy.ts`.
// Auth.js v5 returns a request handler from `auth()`; export it as default
// so Next can pick it up as the proxy function.
export default NextAuth(authConfig).auth;

export const config = {
  // Skip auth on the auth API itself, on Next internals, and on static assets.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
