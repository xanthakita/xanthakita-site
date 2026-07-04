# xanthakita.com — Design Spec (v1)

**Date:** 2026-07-03
**Status:** Approved (design), pending implementation plan
**Repo:** `~/repos/xanthakita` · personal project

## Overview

A small personal site at `xanthakita.com`: a clean landing page that showcases a
curated set of Jonathan's public GitHub projects (each with its README), built to
grow into a blog (stories, projects, thoughts) later. Hosted on Vercel.

## Goals & scope

**v1 (this build):**
- A single **landing page**: name + intro/bio (see "Landing copy" below) and a
  **Projects** section.
- **Projects** = public GitHub repos tagged with the opt-in topic **`showcase`**,
  rendered as cards (name + description). Each card links to a **per-project page**
  (`/projects/<repo>`) that renders the repo's full **README**.
- Curation is by GitHub topic: add/remove `showcase` on a repo to show/hide it —
  **no code change or redeploy** required (see ISR below).

**Deferred (structured-for, not built now):**
- Blog posts (stories/thoughts) via MDX files — the per-project page pattern and
  routing establish the structure; posts come in a later pass.
- Real visual design — v1 is intentionally minimal/clean; a design pass follows.

**Non-goals:** auth, a CMS, comments, analytics, or any write path. Read-only,
statically generated.

## Landing copy (v1)

Intro/bio on the landing (Jonathan's voice, first person, no em-dashes; editable):

> I'm Jonathan Wagner. I started programming in 1980, at twelve, on a TRS-80
> Model 1 (Level 1, 4K of RAM). I learned BASIC from a book and taught myself to
> type with one hand while I held the book in the other.
>
> I've been learning ever since. I remember when neural nets were brand new and
> AI was a pipe dream, when the internet was gopher-net and the World Wide Web
> didn't exist yet. Languages, protocols, anything and everything.
>
> Now LLMs let me jump straight from an idea to a made thing. This is where I keep
> the projects, stories, and thoughts.

## Tech stack

- **Next.js (App Router) + TypeScript**, **Tailwind CSS**, deployed on **Vercel**.
- Chosen for: static generation + ISR, first-class Vercel integration, and an
  easy path to MDX blog posts later.

## Architecture & components

Small, single-purpose units:

- **`site.config.ts`** — one place for `githubUsername`, the opt-in `topic`
  (`showcase`), and site metadata (title, intro copy). No secrets.
- **`lib/github.ts`** — the only module that talks to GitHub.
  - `getShowcaseRepos(): Promise<Project[]>` — lists the user's public repos,
    keeps those whose `topics` include `showcase`, returns
    `Project { name, slug, description, url, homepage, updatedAt }` sorted by
    `updatedAt` desc.
  - `getRepoReadme(repo): Promise<string | null>` — fetches the repo README
    (raw markdown), or `null` if none.
  - Uses the GitHub REST API with a token from `process.env.GITHUB_TOKEN`.
  - Depends on: `GITHUB_TOKEN`, `site.config.ts`. No UI concerns.
- **`lib/markdown.tsx`** — renders README markdown safely (`react-markdown` +
  `rehype-sanitize`, GFM). Single responsibility: markdown → safe React.
- **`app/page.tsx`** — landing: intro + a grid of project cards (from
  `getShowcaseRepos`).
- **`app/projects/[slug]/page.tsx`** — per-project page: repo metadata + rendered
  README (`getRepoReadme`). `generateStaticParams` from the showcase list.
- **ISR:** data-fetching pages set `export const revalidate = 3600` (~hourly), so
  toggling a topic on GitHub surfaces/removes a project within the hour with no
  redeploy.

## Data flow

```
GitHub (repos + topics + README)
        │  (build + hourly ISR, authenticated via GITHUB_TOKEN)
        ▼
lib/github.ts  ──►  Project[] / README markdown
        │
        ▼
app/page.tsx (cards)  +  app/projects/[slug] (README via lib/markdown)
        │
        ▼
Static pages on Vercel CDN  ──►  xanthakita.com
```

## Secrets & config

- **`GITHUB_TOKEN`** — a **fine-grained, read-only** personal access token
  (public-repo read + metadata; no write scopes), stored as a Vercel environment
  variable and in a local `.env` (gitignored). Public repos are readable without
  a token, but the token lifts the 60/hr anonymous rate limit and returns topics
  reliably. Never committed.

## DNS & deployment

`xanthakita.com` has **live iCloud custom email** (verified 2026-07-03): MX
(mx01/mx02.mail.icloud.com), SPF (`v=spf1 include:icloud.com ~all`), Apple
verification (`apple-domain=…`), and DKIM (`sig1._domainkey → …icloudmailadmin.com`).

**Decision: keep GoDaddy as the DNS host — do NOT change nameservers.** Add only
the two records Vercel needs, leaving every email record untouched:
- `A     @    76.76.21.21`
- `CNAME  www  cname.vercel-dns.com`

Steps: create the Vercel project → add domain `xanthakita.com` (+ `www`) → add the
two records at GoDaddy → Vercel auto-provisions SSL. Verify email still resolves
after the change.

## Error handling & resilience

- GitHub fetch fails during an ISR revalidate → Next serves the last successfully
  generated page (stale-but-up). Initial build failure fails the deploy loudly.
- Repo with no README → per-project page shows metadata + description only.
- Topic returns zero repos → Projects section renders an empty-state message.

## Testing

- Unit-test `lib/github.ts` transform/filter with mocked API responses: given
  repos with/without the `showcase` topic → expected `Project[]` (filtering,
  sorting, slug derivation, missing-description handling).
- Markdown rendering sanitization: a README with a `<script>`/`<img onerror>`
  renders inert.
- Rendering is otherwise static; no e2e in v1.

## Future / deferred

- **Blog:** MDX posts under `content/posts/*.mdx` with frontmatter (title, date,
  tags), a `/posts/[slug]` route reusing the markdown renderer, and an index on
  the landing. Entries are **authored collaboratively** (Claude creates the MDX
  file, Jonathan steers the content) — no CMS.
- **Design pass:** typography, layout, dark mode.
- Optional: on-demand ISR via a GitHub webhook (instant updates) instead of hourly.

## Open questions

None blocking. Intro copy is set (see "Landing copy", editable anytime); design
is deliberately minimal for v1.
