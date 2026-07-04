# Master-Detail Landing Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the single-column landing page into a two-column reader — a fixed left rail (identity + Writings/Projects accordion grouped by year) and a right reading pane that shows a revised bio by default and swaps to a selected article or project.

**Architecture:** Introduce a Next.js App Router route group `(reader)` whose shared `layout.tsx` renders the rail (a client component) once and wraps the home, post, and project pages, which render into the pane via `children`. Route groups don't change URLs, so `/`, `/posts/[slug]`, and `/projects/[slug]` are preserved and stay statically generated. Navigation uses `next/link` soft navigation, so the rail persists and only the pane re-renders.

**Tech Stack:** Next.js 16 (App Router, React 19), TypeScript, Tailwind CSS v4 (+ `@tailwindcss/typography`), Vitest + @testing-library/react (jsdom), Playwright MCP for browser smoke.

## Global Constraints

- Copy rules (apply to all user-facing text): no em-dashes; avoid the banned buzzwords in `~/.claude/SOUL.md` (leverage, seamless, robust, etc.).
- App Router only; keep existing routes `/`, `/posts/[slug]`, `/projects/[slug]` working and statically generated.
- Import alias: `@/` maps to `src/` (both tsconfig and vitest).
- Test runner: `npm test` (`vitest run`). Component tests use `@testing-library/react` in jsdom.
- Reuse existing data functions: `getAllPosts`, `getPostBySlug`, `formatPostDate` (`@/lib/posts`); `getShowcaseRepos`, `getProjectBySlug`, `getRepoReadme` (`@/lib/github`). Do not duplicate them.
- Portrait asset: `/portrait.webp`. Site name: `siteConfig.title` (`@/site.config`).
- Commit after each task with a real message (what + why).

---

### Task 1: Group posts by year

**Files:**
- Modify: `src/lib/posts.ts` (add `PostYearGroup` interface + `groupPostsByYear`)
- Test: `src/lib/posts.test.ts` (append a `describe` block)

**Interfaces:**
- Consumes: existing `Post` interface from `@/lib/posts`.
- Produces:
  - `export interface PostYearGroup { year: string; posts: Post[]; }`
  - `export function groupPostsByYear(posts: Post[]): PostYearGroup[]` — groups by 4-digit year from `post.date`; groups sorted newest year first with `'Undated'` (posts whose date isn't a 4-digit year) last; posts within a group sorted newest-first by date.

- [ ] **Step 1: Write the failing test**

Append to `src/lib/posts.test.ts`:

```ts
import { groupPostsByYear } from '@/lib/posts';

describe('groupPostsByYear', () => {
  const mk = (slug: string, date: string) => ({
    slug, title: slug.toUpperCase(), date, sourceBlog: '', sourceUrl: '', excerpt: '',
  });

  it('groups by year, newest year and post first, Undated last', () => {
    const groups = groupPostsByYear([
      mk('x', '2024-01-01'),
      mk('y', '2024-06-01'),
      mk('z', '2022-03-01'),
      mk('u', ''),
    ]);
    expect(groups.map(g => g.year)).toEqual(['2024', '2022', 'Undated']);
    expect(groups[0].posts.map(p => p.slug)).toEqual(['y', 'x']);
    expect(groups[2].posts.map(p => p.slug)).toEqual(['u']);
  });

  it('returns [] for no posts', () => {
    expect(groupPostsByYear([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- posts.test`
Expected: FAIL — `groupPostsByYear is not a function` (or import error).

- [ ] **Step 3: Write minimal implementation**

Append to `src/lib/posts.ts`:

```ts
export interface PostYearGroup {
  year: string;
  posts: Post[];
}

export function groupPostsByYear(posts: Post[]): PostYearGroup[] {
  const byYear = new Map<string, Post[]>();
  for (const p of posts) {
    const year = /^\d{4}/.test(p.date) ? p.date.slice(0, 4) : 'Undated';
    const arr = byYear.get(year) ?? [];
    arr.push(p);
    byYear.set(year, arr);
  }
  return [...byYear.entries()]
    .map(([year, ps]) => ({
      year,
      posts: [...ps].sort((a, b) => b.date.localeCompare(a.date)),
    }))
    .sort((a, b) => {
      if (a.year === 'Undated') return 1;
      if (b.year === 'Undated') return -1;
      return b.year.localeCompare(a.year);
    });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- posts.test`
Expected: PASS (all `posts.test.ts` cases green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/posts.ts src/lib/posts.test.ts
git commit -m "feat: group posts by year for the rail nav"
```

---

### Task 2: Rail component

**Files:**
- Create: `src/components/Rail.tsx`
- Test: `src/components/Rail.test.tsx`

**Interfaces:**
- Consumes: `PostYearGroup` and `Post` from `@/lib/posts`; `Project` from `@/lib/types`.
- Produces:
  - `export function Rail(props: { name: string; postGroups: PostYearGroup[]; postCount: number; projects: Project[] }): JSX.Element`
  - Client component (`'use client'`). Reads `usePathname()` to derive the active post/project slug, highlight it (`aria-current="page"`), and auto-expand its group/year. Both groups start collapsed on non-item routes.

- [ ] **Step 1: Write the failing test**

Create `src/components/Rail.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Post } from '@/lib/posts';
import type { Project } from '@/lib/types';

const mockPathname = vi.fn(() => '/');
vi.mock('next/navigation', () => ({ usePathname: () => mockPathname() }));

import { Rail } from '@/components/Rail';

const post = (slug: string, title: string, date: string): Post =>
  ({ slug, title, date, sourceBlog: '', sourceUrl: '', excerpt: '' });

const postGroups = [
  { year: '2024', posts: [post('alpha', 'Alpha', '2024-03-01')] },
  { year: '2023', posts: [post('beta', 'Beta', '2023-06-01')] },
];
const projects: Project[] = [
  { name: 'toque', slug: 'toque', description: null, url: 'https://x', homepage: null, updatedAt: '2024-01-01', topics: [] },
];

const rail = () => <Rail name="Jonathan Wagner" postGroups={postGroups} postCount={2} projects={projects} />;

beforeEach(() => { mockPathname.mockReturnValue('/'); });

describe('Rail', () => {
  it('renders both groups collapsed with counts on home', () => {
    render(rail());
    expect(screen.getByRole('button', { name: /Writings/ })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: /Projects/ })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Alpha')).toBeNull();
    expect(screen.queryByText('toque')).toBeNull();
  });

  it('expands Writings then a year on click', () => {
    render(rail());
    fireEvent.click(screen.getByRole('button', { name: /Writings/ }));
    fireEvent.click(screen.getByRole('button', { name: '2024' }));
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  it('auto-expands and highlights the active post', () => {
    mockPathname.mockReturnValue('/posts/beta');
    render(rail());
    const link = screen.getByText('Beta').closest('a');
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('auto-expands Projects on a project route', () => {
    mockPathname.mockReturnValue('/projects/toque');
    render(rail());
    expect(screen.getByText('toque')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- Rail.test`
Expected: FAIL — cannot resolve `@/components/Rail`.

- [ ] **Step 3: Write minimal implementation**

Create `src/components/Rail.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Post, PostYearGroup } from '@/lib/posts';
import type { Project } from '@/lib/types';

interface RailProps {
  name: string;
  postGroups: PostYearGroup[];
  postCount: number;
  projects: Project[];
}

function slugFrom(pathname: string, prefix: string): string | null {
  return pathname.startsWith(prefix) ? decodeURIComponent(pathname.slice(prefix.length)) : null;
}

export function Rail({ name, postGroups, postCount, projects }: RailProps) {
  const pathname = usePathname();
  const activePost = slugFrom(pathname, '/posts/');
  const activeProject = slugFrom(pathname, '/projects/');

  const yearOf = (slug: string | null) =>
    slug ? postGroups.find(g => g.posts.some(p => p.slug === slug))?.year ?? null : null;

  const [writingsOpen, setWritingsOpen] = useState(activePost !== null);
  const [projectsOpen, setProjectsOpen] = useState(activeProject !== null);
  const [openYears, setOpenYears] = useState<Set<string>>(() => {
    const y = yearOf(activePost);
    return y ? new Set([y]) : new Set();
  });

  useEffect(() => {
    if (activePost) {
      setWritingsOpen(true);
      const y = yearOf(activePost);
      if (y) setOpenYears(prev => (prev.has(y) ? prev : new Set(prev).add(y)));
    }
    if (activeProject) setProjectsOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePost, activeProject]);

  const toggleYear = (year: string) =>
    setOpenYears(prev => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });

  const itemLink = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`block py-0.5 text-sm hover:text-blue-300 ${active ? 'text-blue-400' : 'text-neutral-400'}`}
    >
      {label}
    </Link>
  );

  const groupButton = (label: string, count: number, open: boolean, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className="flex w-full items-center justify-between text-left text-sm font-semibold uppercase tracking-wide text-neutral-300 hover:text-neutral-100"
    >
      <span>
        {label} <span className="text-neutral-500">{count}</span>
      </span>
      <span aria-hidden>{open ? '▾' : '▸'}</span>
    </button>
  );

  return (
    <nav
      aria-label="Site"
      className="w-full shrink-0 border-b border-neutral-800 md:sticky md:top-0 md:h-screen md:w-72 md:overflow-y-auto md:border-b-0 md:border-r"
    >
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/portrait.webp"
            alt={name}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
          />
          <span className="font-semibold text-neutral-100">{name}</span>
        </Link>

        <div className="mt-6">
          {groupButton('Writings', postCount, writingsOpen, () => setWritingsOpen(o => !o))}
          {writingsOpen && (
            <ul className="mt-2 space-y-1">
              {postGroups.map(group => (
                <li key={group.year}>
                  <button
                    type="button"
                    onClick={() => toggleYear(group.year)}
                    aria-expanded={openYears.has(group.year)}
                    className="flex w-full items-center justify-between text-left text-sm text-neutral-400 hover:text-neutral-200"
                  >
                    <span>{group.year}</span>
                    <span aria-hidden>{openYears.has(group.year) ? '▾' : '▸'}</span>
                  </button>
                  {openYears.has(group.year) && (
                    <ul className="mt-1 space-y-1 border-l border-neutral-800 pl-3">
                      {group.posts.map(p => (
                        <li key={p.slug}>
                          {itemLink(`/posts/${p.slug}`, p.title, p.slug === activePost)}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6">
          {groupButton('Projects', projects.length, projectsOpen, () => setProjectsOpen(o => !o))}
          {projectsOpen && (
            <ul className="mt-2 space-y-1">
              {projects.map(p => (
                <li key={p.slug}>{itemLink(`/projects/${p.slug}`, p.name, p.slug === activeProject)}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- Rail.test`
Expected: PASS (4 cases).

- [ ] **Step 5: Commit**

```bash
git add src/components/Rail.tsx src/components/Rail.test.tsx
git commit -m "feat: rail nav component (accordion, year groups, active-item highlight)"
```

---

### Task 3: Reader route group — shared layout + home view (revised bio)

**Files:**
- Create: `src/app/(reader)/layout.tsx`
- Create: `src/app/(reader)/page.tsx` (revised bio home)
- Delete: `src/app/page.tsx` (old home moved here, lists removed)

**Interfaces:**
- Consumes: `Rail` from `@/components/Rail`; `getAllPosts`, `groupPostsByYear` from `@/lib/posts`; `getShowcaseRepos` from `@/lib/github`; `Project` from `@/lib/types`; `siteConfig` from `@/site.config`.
- Produces: a `(reader)` layout that renders the rail + a `<main>` pane wrapping `children`. `/` renders the bio in the pane.

- [ ] **Step 1: Create the reader layout**

Create `src/app/(reader)/layout.tsx`:

```tsx
import { getAllPosts, groupPostsByYear } from '@/lib/posts';
import { getShowcaseRepos } from '@/lib/github';
import type { Project } from '@/lib/types';
import { siteConfig } from '@/site.config';
import { Rail } from '@/components/Rail';

export const revalidate = 3600;

export default async function ReaderLayout({ children }: { children: React.ReactNode }) {
  const posts = getAllPosts();
  const postGroups = groupPostsByYear(posts);
  let projects: Project[] = [];
  try {
    projects = await getShowcaseRepos();
  } catch {
    projects = [];
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col md:flex-row">
      <Rail name={siteConfig.title} postGroups={postGroups} postCount={posts.length} projects={projects} />
      <main className="min-w-0 flex-1 px-6 py-12 md:px-10 md:py-16">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Create the revised home (bio) page**

Create `src/app/(reader)/page.tsx`:

```tsx
import Image from 'next/image';
import { siteConfig } from '@/site.config';

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-col items-center text-center">
        <Image
          src="/portrait.webp"
          alt="Jonathan Wagner"
          width={400}
          height={304}
          priority
          className="h-auto w-56 select-none sm:w-64"
        />
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-neutral-50">{siteConfig.title}</h1>
      </div>

      <div className="mt-8 space-y-4 text-lg leading-relaxed text-neutral-300">
        <p>I&apos;m Jonathan Wagner. I started programming in 1980, at twelve, on a TRS-80 Model 1 (Level 1, 4K of RAM). I learned BASIC from a book and taught myself to type with one hand while I held the book in the other.</p>
        <p>I&apos;ve been learning ever since. I remember when neural nets were brand new and AI was a pipe dream, when the internet was gopher-net and the World Wide Web didn&apos;t exist yet. Languages, protocols, anything and everything.</p>
        <p>The name Xanthakita goes back to my teens. I found the writing of Piers Anthony and fell hard for his Xanth series. Years later I came to know Akitas, back when they were all simply Akitas, before the American Akita and the Akita Inu were split into two breeds. My first girl was Xena. I planned to show and breed her under a kennel I was going to call Xanth Akitas, and that is where the name comes from. I never did get to breed her, but I held onto the identity, and the domain, all these years.</p>
        <p>Life filled in around the code. I&apos;ve been married since 1989, and my wife and I raised three sons: Kenneth, Riley, and Jesse.</p>
        <p>Now LLMs let me jump straight from an idea to a made thing. This is where I keep the projects, stories, and thoughts.</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Delete the old home page**

```bash
git rm src/app/page.tsx
```

- [ ] **Step 4: Verify the app builds and the type-check passes**

Run: `npm run build`
Expected: build succeeds; `/` is generated. (Projects may be empty if GitHub is unauthenticated/rate-limited; the try/catch keeps the build green.)

- [ ] **Step 5: Commit**

```bash
git add src/app/\(reader\)/layout.tsx src/app/\(reader\)/page.tsx
git commit -m "feat: reader layout with rail + pane; revised bio home (Xanthakita origin, family)"
```

---

### Task 4: Move post & project pages into the reader pane

**Files:**
- Create: `src/app/(reader)/posts/[slug]/page.tsx` (moved; drop outer `<main>` + Back link)
- Create: `src/app/(reader)/projects/[slug]/page.tsx` (moved; drop outer `<main>` + Back link)
- Delete: `src/app/posts/[slug]/page.tsx`, `src/app/projects/[slug]/page.tsx` (and now-empty `src/app/posts`, `src/app/projects`)

**Interfaces:**
- Consumes: same data functions as before. Renders content directly into the reader `<main>` pane (no page-level `<main>`, no Back link — the rail is the navigation).

- [ ] **Step 1: Create the post page inside the reader group**

Create `src/app/(reader)/posts/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug, formatPostDate } from '@/lib/posts';
import { Markdown } from '@/lib/markdown';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  const { meta, body } = post;

  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-50">{meta.title}</h1>
      <p className="mt-2 text-sm text-neutral-500">
        {formatPostDate(meta.date)}
        {meta.sourceBlog && meta.sourceUrl && (
          <>
            {' · Originally published on '}
            <a className="text-blue-400 hover:underline" href={meta.sourceUrl} target="_blank" rel="noopener noreferrer">{meta.sourceBlog}</a>
          </>
        )}
      </p>
      <div className="mt-8">
        <Markdown>{body}</Markdown>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Create the project page inside the reader group**

Create `src/app/(reader)/projects/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { getShowcaseRepos, getProjectBySlug, getRepoReadme } from '@/lib/github';
import { Markdown } from '@/lib/markdown';

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getShowcaseRepos();
  return projects.map(p => ({ slug: p.slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const readme = await getRepoReadme(project.name);

  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-50">{project.name}</h1>
      {project.description && <p className="mt-2 text-neutral-400">{project.description}</p>}
      <p className="mt-2 text-sm">
        <a className="text-blue-400 hover:underline" href={project.url} target="_blank" rel="noopener noreferrer">View on GitHub</a>
      </p>
      <div className="mt-8">
        {readme ? <Markdown>{readme}</Markdown> : <p className="text-neutral-500">No README yet.</p>}
      </div>
    </article>
  );
}
```

- [ ] **Step 3: Delete the old routes**

```bash
git rm src/app/posts/[slug]/page.tsx src/app/projects/[slug]/page.tsx
```

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: PASS — all existing suites plus `groupPostsByYear` and `Rail` cases.

- [ ] **Step 5: Build and verify routes are generated**

Run: `npm run build`
Expected: build succeeds; `/`, `/posts/[slug]`, and `/projects/[slug]` all appear in the route output. No "conflicting routes" or duplicate-page errors (the old `src/app/posts` / `src/app/projects` are gone).

- [ ] **Step 6: Browser smoke with Playwright**

Run: `npm run dev` (background), then drive with the Playwright MCP against `http://localhost:3000`:
- Home `/`: pane shows portrait + revised bio (contains "Xanthakita" and "Kenneth, Riley, and Jesse"); rail shows `Writings 53` and `Projects` with both groups collapsed (`aria-expanded="false"`).
- Click `Writings` → year sub-headings appear; click a year → post titles appear.
- Click a post title → URL becomes `/posts/<slug>`, pane shows the article, rail keeps the Writings group + that year expanded with the item highlighted (`aria-current="page"`), no full-page reload.
- Resize to ~375px wide: rail stacks above the pane, content still readable, no horizontal overflow.

Record URLs hit and what rendered.

- [ ] **Step 7: Commit**

```bash
git add src/app/\(reader\)/posts src/app/\(reader\)/projects
git commit -m "feat: render posts & projects in the reader pane (rail replaces per-page back link)"
```

---

## Self-Review

**Spec coverage:**
- Two-column master-detail (rail + pane) → Task 3 (layout).
- Fixed left rail ~300px, sticky → Task 2 (`md:w-72 md:sticky`), rendered in Task 3.
- Identity card (portrait + name), click → home → Task 2.
- Writings accordion grouped by year, counts, newest-first → Task 1 (grouping) + Task 2 (render).
- Projects accordion with counts → Task 2.
- Default collapsed on home; contextual auto-expand + active highlight → Task 2 (tests cover both).
- Bio as default pane, revised copy (Xanthakita origin + family, no ages) → Task 3.
- Posts/projects render in pane, real shareable URLs preserved → Task 4.
- Responsive stacking below md → Task 2 (`flex-col md:flex-row`, rail `w-full`) + Task 4 smoke.
- Reuse existing data + per-item pages → Tasks 3-4 (no data-function duplication).
- Resilience if GitHub is down → Task 3 (try/catch → []).
- Tests: grouping unit, rail behavior, existing suites, Playwright smoke → Tasks 1, 2, 4.

**Placeholder scan:** none — every code and command step is concrete.

**Type consistency:** `PostYearGroup` defined in Task 1 (`@/lib/posts`), imported by `Rail` (Task 2) and the reader layout (Task 3). `Rail` prop shape (`name`, `postGroups`, `postCount`, `projects`) is identical in its definition (Task 2) and its call site (Task 3). `Post`/`Project` come from their existing modules unchanged.
