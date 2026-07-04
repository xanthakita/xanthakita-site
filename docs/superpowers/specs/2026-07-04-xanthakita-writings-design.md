# xanthakita.com — Writings (blog import) Design

**Date:** 2026-07-04
**Status:** approved (pending spec review)
**Depends on:** the shipped v1 (landing + projects); see `2026-07-03-xanthakita-site-design.md`.

## Goal

Bring Jonathan's Blogger writing onto xanthakita.com as first-class content the site
fully owns. Import selected posts from 7 of his 9 Blogger blogs, convert them to
Markdown files in the repo, copyedit them, and surface them in a "Writings" section
that sits above Projects on the landing page, each post getting its own page.

## Scope

Import **7 blogs** (all of Jonathan's blogs EXCEPT "Binks Stuff – Jewelry Design"
and "Tang Soo Do, A Beginner's Point of View"):

| Blog | blogspot host | Posts | Content source |
|------|---------------|------:|----------------|
| My Heart | myheartcwwg | 1 | feed (full) |
| My Internet Is Down | my-internet-is-down | 12 | **page scrape** (feed is summary-only) |
| Greer Church Without Walls | greercww | 9 | feed (full) |
| Guardian of Innocence | guardianofinnocence | 1 | feed (full) |
| Crescent Moon Shibas Blog | crescentmoonshibas | 1 | feed (full) |
| Tired Of The Hype | tiredofthehype | 2 (1 kept) | feed (full) |
| 5 minute Blogger | thefiveminuteblogger | 28 | feed (full) |

**~53 posts land** (the 13-word 2012 "This is a cross post to two blogs at once"
stub in Tired Of The Hype is skipped).

Not in scope: the two Binks blogs; drafts/private posts (not publicly reachable);
any live sync with Blogger (this is a one-time duplication, not a mirror).

## Approach (decided)

**Convert to Markdown files in the repo.** A one-time Node import script pulls each
post, converts its HTML body to Markdown, downloads its images locally, copyedits it,
and writes `content/posts/<slug>.md`. After import the posts are plain files Jonathan
owns and edits; the running site has zero dependency on Blogger. Rejected: storing raw
Blogger HTML (messy, unsafe to render, hard to edit) and fetching from Blogger at build
time (fragile runtime tie, defeats the "duplicate here" goal).

Plain `.md`, not `.mdx`: these posts are prose and need no embedded components, so we
reuse the existing safe `Markdown` renderer (react-markdown + remark-gfm, raw HTML
disabled). A single post can be upgraded to MDX later if it ever needs components.

## Content model

Each post: `content/posts/<slug>.md`

```md
---
title: "Protecting Our Children Without Losing Ourselves"
date: "2025-05-07"
sourceBlog: "Guardian of Innocence"
sourceUrl: "https://guardianofinnocence.blogspot.com/2025/05/protecting-our-children-without-losing.html"
excerpt: "As someone who has been tinkering with computers since the days when the internet was just a whisper..."
---

<copyedited Markdown body>
```

- **slug**: derived from the original Blogger URL's last path segment (e.g.
  `protecting-our-children-without-losing`), lowercased, deduped across blogs by
  suffixing `-2` on collision.
- **date**: the original `published` date (YYYY-MM-DD), preserved.
- **sourceBlog**: the blog's display title, shown as a tag and in attribution.
- **sourceUrl**: the original post, linked from the post page.
- **excerpt**: first ~160 characters of body text, for the landing list.
- Untitled posts (one in Greer) get a title derived from the date:
  `"Untitled (YYYY-MM-DD)"`.

## Import script (`scripts/import-blogger.mjs`)

Run once by the implementer; not part of the deployed app. Steps per blog:

1. Fetch `https://<host>.blogspot.com/feeds/posts/default?alt=json&max-results=150`.
2. For each entry:
   - If the feed entry has full `content.$t`, use it. If content is empty (summary-only
     feed, i.e. My Internet Is Down), fetch the post's alternate URL and extract the
     `post-body entry-content` div (class uses single quotes in Blogger's template).
   - Skip entries whose body is under ~20 words AND whose title marks them a stub
     (the known Tired Of The Hype cross-post). Log every skip.
   - Download `<img>` sources to `public/posts/<slug>/<n>.<ext>`; rewrite `src` to the
     local `/posts/<slug>/...` path.
   - Convert HTML → Markdown (a converter such as `node-html-markdown` or `turndown`;
     dev-only dependency).
   - Write frontmatter + body to `content/posts/<slug>.md`.
3. Print a summary: posts written, skipped, images downloaded.

**Copyedit pass.** After the script produces the raw Markdown, the implementer
(Claude) reviews every post and corrects spelling, punctuation, typos, and grammar
while preserving the author's voice, meaning, structure, and intent. This is a
correction pass, not a rewrite: no restructuring, no tonal changes, no added or
removed ideas. Em-dashes are avoided per Jonathan's convention. The original,
unedited text remains available at `sourceUrl` on Blogger.

## Data layer (`src/lib/posts.ts`, tested)

- `Post` type: `{ slug, title, date, sourceBlog, sourceUrl, excerpt }`.
- `getAllPosts(): Post[]` — reads `content/posts/*.md` at build with `gray-matter`,
  returns metadata sorted by `date` desc. Filesystem only, no network.
- `getPostBySlug(slug): { meta: Post; body: string } | null`.
- Tolerates a post missing optional frontmatter fields (excerpt/sourceUrl).

## Rendering

- **Landing (`src/app/page.tsx`):** a new "Writings" section between the intro
  paragraphs and the Projects heading. Reverse-chronological list; each row: title
  linking to `/posts/<slug>`, the date, and a small source-blog tag. Empty-state text
  if there are no posts.
- **Post page (`src/app/posts/[slug]/page.tsx`):** mirrors the project page. Back link,
  title, date, "Originally published on <sourceBlog>" linking to `sourceUrl`, then the
  body via the existing `<Markdown>` component. `generateStaticParams` prebuilds one
  page per post. Local post images render from `/posts/<slug>/...`.

## Testing

- `src/lib/posts.test.ts`: frontmatter parsing, date-desc sort, slug handling, and
  tolerance of a post missing optional fields (uses a temp fixtures dir).
- The `Markdown` renderer is already covered by existing tests.
- Verification: `npm run build` prebuilds `/posts/[slug]` for every post; browser check
  that the landing shows Writings above Projects and a post page renders body + images.

## Out of scope / deferred

- The two Binks blogs.
- Any Blogger draft/private posts.
- Multi-author ("collaborative") posting, tags/categories, per-blog landing sections,
  RSS. Can come later; not needed to duplicate the existing writing.
