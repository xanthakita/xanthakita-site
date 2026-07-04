# xanthakita.com — Master-Detail Redesign

**Date:** 2026-07-04
**Status:** Approved (pending spec review)
**Supersedes landing layout from:** 2026-07-03-xanthakita-site-design.md, 2026-07-04-xanthakita-writings-design.md

## Summary

Replace the current single-column, top-to-bottom landing page (portrait/bio, then a
Writings list, then a Projects grid) with a two-column master-detail reader:

- A fixed **left rail** (~300px) holding a compact identity card and a stacked
  accordion navigation (Writings, Projects).
- A **right reading pane** (remaining width) that shows the bio by default and swaps
  to a selected article or project.

The page widens from `max-w-3xl` (768px) to roughly 1200px so the pane has room.

## Goals

- Show both the tech side and the personal side of Jonathan (revised bio).
- Give Writings and Projects a compact, scannable home that handles the 53-vs-7
  content imbalance gracefully.
- Keep every item a real, shareable, search-indexable URL.
- Preserve existing per-post and per-project pages and data loading.

## Non-goals (deferred to the separate "real visual design" TODO)

- Typography and color polish beyond what's needed to make the layout legible.
- Animations beyond a simple expand/collapse.
- Search or filter within the rail.
- Ages on the sons in the bio (intentionally omitted to avoid staleness).

## Layout

### Overall

- Container widens to ~1200px (`max-w-6xl` or similar), centered.
- Two columns on desktop (≥768px): fixed left rail ~300px, fluid right pane.
- The rail is sticky so it stays in view while the pane scrolls.

### Left rail (top to bottom)

1. **Identity card:** small portrait + name. Clicking it navigates home (`/`),
   restoring the bio in the pane.
2. **`Writings  53  ▸`** — accordion group. When expanded, shows year sub-headings
   (e.g. 2024, 2023, …), newest year first. Each year expands to its post titles,
   newest first.
3. **`Projects  7  ▸`** — accordion group. When expanded, lists repo names.

Counts next to each group label are derived from the data (post count, showcase repo
count), not hardcoded.

**Default / resting state (homepage, nothing selected):** both groups collapsed,
showing only their labels and counts.

**Contextual expansion:** when the current URL is a post, the Writings group and the
year containing that post auto-expand, and the active post is highlighted. When the
current URL is a project, the Projects group auto-expands with the active project
highlighted. This lets a reader see and jump to neighbors.

### Right reading pane

- **Default (`/`):** portrait + revised bio (see Content below).
- **Writing (`/posts/[slug]`):** full article; the pane scrolls independently if long.
- **Project (`/projects/[slug]`):** full project view, same treatment.

## Content — revised bio (default pane)

> I'm Jonathan Wagner. I started programming in 1980, at twelve, on a TRS-80 Model 1
> (Level 1, 4K of RAM). I learned BASIC from a book and taught myself to type with one
> hand while I held the book in the other.
>
> I've been learning ever since. I remember when neural nets were brand new and AI was
> a pipe dream, when the internet was gopher-net and the World Wide Web didn't exist
> yet. Languages, protocols, anything and everything.
>
> The name Xanthakita goes back to my teens. I found the writing of Piers Anthony and
> fell hard for his Xanth series. Years later I came to know Akitas, back when they
> were all simply Akitas, before the American Akita and the Akita Inu were split into
> two breeds. My first girl was Xena. I planned to show and breed her under a kennel I
> was going to call Xanth Akitas, and that is where the name comes from. I never did
> get to breed her, but I held onto the identity, and the domain, all these years.
>
> Life filled in around the code. I've been married since 1989, and my wife and I
> raised three sons: Kenneth, Riley, and Jesse.
>
> Now LLMs let me jump straight from an idea to a made thing. This is where I keep the
> projects, stories, and thoughts.

## Architecture

### Shared layout

A shared layout renders the rail once and wraps the home page and the existing
`/posts/[slug]` and `/projects/[slug]` routes. Options considered:

- **Root `layout.tsx` for all three** — simplest, but the rail would also wrap any
  future unrelated routes.
- **A route group** (e.g. `(reader)`) whose `layout.tsx` renders the rail, containing
  home, posts, and projects. Keeps the rail scoped to reader routes. **Chosen.**

The layout fetches the data the rail needs (`getAllPosts`, `getShowcaseRepos`) and
passes it to the rail component. Home, post, and project pages remain server
components rendering into the pane slot (`children`).

### Rail component

- A **client component** (needs interactivity: which groups/years are open) that reads
  the current path (`usePathname`) to compute active item and contextual expansion.
- Receives posts (grouped by year) and projects as props from the server layout — no
  client-side data fetching.
- Renders identity card, then the two accordion groups.
- Navigation uses `next/link`, so clicks are soft navigations: the rail persists, only
  the pane's `children` re-render. URLs stay shareable and indexable.

### Data / grouping

- Add a helper to group posts by year (derived from existing post dates), newest year
  and newest post first. Colocate with `lib/posts.ts`.
- Projects continue to come from `getShowcaseRepos`.

### Home view

- The bio (revised) moves into the home page rendered inside the reader layout's pane.
- The portrait asset (`/portrait.webp`) is reused for both the pane hero and the small
  rail identity card.

## Responsive behavior

Below ~768px the columns stack: identity card, then the accordion, then the pane
content beneath. Standard docs-site collapse — no separate mobile design, the same
components reflow. (Optionally the rail can collapse behind a toggle on mobile; default
is simple stacking unless it proves too tall in practice.)

## Reuse vs. new

**Reused:** `getAllPosts`, `getShowcaseRepos`, markdown rendering, per-post and
per-project page bodies, `portrait.webp`, `site.config`.

**New:** the reader route group + shared layout, the rail client component, the
year-grouping helper, and moving the bio into a home view. The revised bio is new copy.

## Testing

- Unit-test the year-grouping helper (ordering: newest year first, newest post first
  within a year; correct counts).
- Component/behavior test the rail: default collapsed state, contextual auto-expansion
  for a post URL (group + year) and a project URL, active-item highlighting.
- Existing post/project page and data tests continue to pass.
- Browser smoke via Playwright: home shows bio + collapsed rail with counts; clicking a
  writing loads it in the pane without a full reload and expands its year; clicking a
  project loads it; mobile width stacks cleanly.
