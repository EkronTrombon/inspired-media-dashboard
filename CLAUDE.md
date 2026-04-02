@AGENTS.md

# Inspired Media Dashboard

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Next.js | 16.x | Framework (App Router) |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | 4.x | Component library |
| next-themes | 0.4.x | Theme switching (light/dark) |
| lucide-react | latest | Icons |

## Folder Structure

```
app/
  layout.tsx                    # Root layout: ThemeProvider + TooltipProvider + fonts
  page.tsx                      # Redirects to /social
  (dashboard)/
    layout.tsx                  # Dashboard shell: Sidebar + Topbar + <main>
    social/
      page.tsx                  # Social media overview (all platforms)
      instagram/page.tsx        # Instagram detailed manager
      tiktok/page.tsx           # TikTok detailed manager
      youtube/page.tsx          # YouTube detailed manager
      podcast/page.tsx          # Podcast (Simplecast) analytics
    search/
      page.tsx                  # Search page with Trends / News / Updates tabs

components/
  layout/
    sidebar.tsx                 # Fixed-width sidebar navigation
    topbar.tsx                  # Top bar: logo, app name, notifications, theme toggle, avatar
  providers/
    theme-provider.tsx          # next-themes wrapper component
  ui/                           # shadcn/ui auto-generated components (do not edit manually)

lib/
  utils.ts                      # cn() utility (clsx + tailwind-merge)
```

## Routing

Routes are grouped under the `(dashboard)` route group so all pages share the sidebar + topbar layout without the group name appearing in the URL.

| URL | Page |
|-----|------|
| `/` | Redirects to `/social` |
| `/social` | Social media overview dashboard |
| `/social/instagram` | Instagram manager |
| `/social/tiktok` | TikTok manager |
| `/social/youtube` | YouTube manager |
| `/social/podcast` | Podcast (Simplecast) analytics |
| `/search` | Trends, News & Updates (tabbed) |

## Component Conventions

- **Server components by default.** Only add `"use client"` when using hooks, browser APIs, or event handlers.
- **shadcn/ui components** live in `components/ui/`. Add new ones with `npx shadcn@latest add <component>`. Do not edit them manually.
- **Layout components** (Sidebar, Topbar) live in `components/layout/`.
- **Page-level components** use `default export` and live directly in their route file.
- **Icons** from `lucide-react` only — no other icon libraries.
- **Styling** with Tailwind utility classes. Avoid inline styles. Use `cn()` for conditional classes.
- **Theme-aware colors**: use semantic tokens (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, etc.) — never hardcode colors that don't respect light/dark mode.

## Theming

- Default theme: **light**
- Toggle available in the Topbar (Moon/Sun icon)
- Powered by `next-themes` with `attribute="class"` — adds `.dark` class to `<html>`
- CSS variables for both themes defined in `app/globals.css`
- `suppressHydrationWarning` is set on `<html>` to prevent React hydration mismatch from theme

## Key Decisions

1. **App Router over Pages Router**: Modern default, better support for React Server Components and nested layouts.
2. **Tailwind v4**: Comes with `create-next-app` by default; uses `@import "tailwindcss"` syntax (not the v3 directives).
3. **shadcn/ui v4**: Compatible with Tailwind v4; components are copied into `components/ui/` and owned by the project.
4. **Route groups** `(dashboard)`: Used to share the shell layout without polluting URLs.
5. **`enableSystem={false}` on ThemeProvider**: Forces explicit light/dark choice rather than following OS preference, since light is the app default.
6. **Fixed sidebar**: 240px (`w-60`) fixed width; no collapse for now. Add collapsible sidebar when needed using shadcn's `Sheet` component for mobile.

## Development

```bash
npm run dev      # Start dev server on http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```
