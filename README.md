# xanthakita.com

The code behind [xanthakita.com](https://xanthakita.com) — my personal site. It is one page that reads like a small library: a short bio, the things I have written over the years, and the projects I have built, all in a two-column reader.

## What it is

The site is a master-detail reader. A fixed left rail holds an identity card and two collapsible groups:

- **Writings** — blog posts I have written, grouped by year.
- **Projects** — my public GitHub repositories tagged with the `showcase` topic.

The right pane is a reading window. It shows my bio by default, and swaps to a selected article or project when you pick one from the rail. Every selection is a real, shareable URL (`/posts/<slug>`, `/projects/<slug>`), so the rail is navigation, not a single-page gimmick.

## How it is built

- **Framework:** Next.js 16 (App Router, React 19) in TypeScript.
- **Styling:** Tailwind CSS v4 with the typography plugin. Dark theme.
- **Layout:** a route group `src/app/(reader)/` whose shared `layout.tsx` renders the rail beside the pane and wraps the home, post, and project pages. Route groups do not change the URL, so `/`, `/posts/[slug]`, and `/projects/[slug]` stay put and stay statically generated. Navigation uses soft `next/link` transitions, so the rail persists and only the pane re-renders.
- **The rail** (`src/components/Rail.tsx`) is the only client component. It reads the current path to highlight the active item and auto-expand its group and year. Manual accordion toggles are preserved across navigation. The server layout fetches all data and passes plain props in, so the rail does no client-side fetching.
- **Writings** live as Markdown files in `content/posts/` with `gray-matter` frontmatter (`title`, `date`, `sourceBlog`, `sourceUrl`, `excerpt`). They render through a sanitizing `Markdown` component (`react-markdown` + `remark-gfm`) that strips raw HTML, so imported content cannot inject scripts.
- **Projects** are pulled live from the GitHub REST API: public, non-fork, non-archived repos of the `xanthakita` user that carry the `showcase` topic, sorted by last update. Each project page renders that repo's README in the pane. Data revalidates hourly (ISR), and a fetch failure degrades to an empty list rather than breaking the site.
- **Tests:** Vitest with Testing Library in jsdom — unit tests for the post loader and year grouping, behavior tests for the rail.
- **Hosting:** Vercel, with the custom domain served through GoDaddy DNS.

## Project layout

```
src/
  app/
    (reader)/
      layout.tsx                # rail + reading pane; fetches posts & projects
      page.tsx                  # home (portrait + bio) — the default pane view
      posts/[slug]/page.tsx     # a writing, rendered in the pane
      projects/[slug]/page.tsx  # a project README, rendered in the pane
    layout.tsx                  # root html/body, fonts, metadata
  components/
    Rail.tsx                    # left-rail accordion nav (client)
  lib/
    posts.ts                    # read Markdown posts + group by year
    github.ts                   # fetch showcase repos + READMEs
    markdown.tsx                # sanitizing Markdown renderer
    types.ts                    # shared types
  site.config.ts                # username, showcase topic, title
content/
  posts/                        # Markdown blog posts
```

## Running it locally

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # vitest
npm run build    # production build
npm run lint     # eslint
```

Set `GITHUB_TOKEN` in `.env.local` to raise the GitHub API rate limit while developing (see `.env.example`). Without it the site still builds; the Projects list just falls back to empty if the anonymous rate limit is exhausted.

## Featuring a project

Tag any of your public repositories with the `showcase` topic on GitHub. Within the hour (ISR revalidation), it appears under Projects, with its README rendered on its own page.
