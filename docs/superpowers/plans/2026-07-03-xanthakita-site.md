# xanthakita.com v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a minimal Next.js site at xanthakita.com with an intro/bio landing page plus a curated Projects section driven by a GitHub topic, each project linking to a page that renders its README.

**Architecture:** Next.js App Router (server components) fetches the owner's public repos from the GitHub REST API, keeps those carrying the `showcase` topic, and renders them at build with hourly ISR so topic changes surface without a redeploy. READMEs render as sanitized markdown. Hosted on Vercel; DNS stays at GoDaddy (two records added) so the domain's iCloud email is untouched.

**Tech Stack:** Next.js (App Router) + TypeScript + Tailwind CSS; `react-markdown` + `remark-gfm`; Vitest + Testing Library for tests; Vercel hosting.

## Global Constraints

- Next.js **App Router** + **TypeScript** + **Tailwind**, `src/` dir, import alias `@/* → src/*`.
- GitHub username: **`xanthakita`**. Opt-in topic: **`showcase`**.
- Data fetches use **ISR `revalidate = 3600`** (hourly).
- GitHub calls use **`GITHUB_TOKEN`** (fine-grained, read-only public repos) from env; never commit it.
- README markdown renders **without raw HTML** (react-markdown default) — no `rehype-raw`.
- Site copy contains **no em-dashes** (Jonathan's rule).
- **Dark theme by default** — near-black background, light text (not media-query dependent). Site ships dark.
- **Hero portrait**: `public/portrait.webp` (already in repo, 66KB, transparent). The landing shows it as the hero; it fades into the dark background by design.
- **DNS: do NOT change nameservers.** GoDaddy stays authoritative; only add `A @ 76.76.21.21` and `CNAME www → cname.vercel-dns.com`. iCloud email (MX/SPF/apple-domain/DKIM) stays as-is.
- Existing repo files to preserve during scaffold: `README.md`, `TODO.md`, `docs/`, `.claude/`, `.git/`.

---

### Task 1: Scaffold Next.js app + test runner

**Files:**
- Create (generated): `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, Tailwind config
- Create: `vitest.config.ts`, `vitest.setup.ts`, `src/lib/smoke.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: a buildable Next app with `@/*` alias → `src/*`, `npm run build` and `npm test` working.

- [ ] **Step 1: Scaffold into a temp dir (avoids clobbering existing repo files)**

```bash
npx create-next-app@latest /tmp/xkh-scaffold \
  --ts --tailwind --app --eslint --src-dir --import-alias "@/*" \
  --use-npm --skip-install --yes --no-turbopack
```

- [ ] **Step 2: Move generated files into the repo, preserving our files**

```bash
cd ~/repos/xanthakita
rsync -a --exclude '.git' --exclude 'README.md' /tmp/xkh-scaffold/ ./
rm -rf /tmp/xkh-scaffold
```

- [ ] **Step 3: Install deps (app + markdown + test tooling)**

```bash
cd ~/repos/xanthakita
npm install
npm install react-markdown remark-gfm
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom @tailwindcss/typography
```

- [ ] **Step 4: Add Vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', globals: true, setupFiles: ['./vitest.setup.ts'] },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
});
```

Create `vitest.setup.ts`:
```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 5: Add the `test` script to package.json**

In `package.json` `"scripts"`, add:
```json
"test": "vitest run"
```

- [ ] **Step 6: Write a smoke test**

Create `src/lib/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
describe('smoke', () => {
  it('runs', () => { expect(1 + 1).toBe(2); });
});
```

- [ ] **Step 7: Verify test runner and build**

Run: `npm test`
Expected: 1 passed.

Run: `npm run build`
Expected: build completes (default Next page compiles).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app (TS/Tailwind/App Router) + Vitest"
```

---

### Task 2: Site config + Project type

**Files:**
- Create: `src/site.config.ts`
- Create: `src/lib/types.ts`
- Test: `src/site.config.test.ts`

**Interfaces:**
- Produces: `siteConfig { githubUsername: string; showcaseTopic: string; title: string; description: string }`; `Project { name: string; slug: string; description: string | null; url: string; homepage: string | null; updatedAt: string; topics: string[] }`.

- [ ] **Step 1: Write the failing test**

Create `src/site.config.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { siteConfig } from '@/site.config';

describe('siteConfig', () => {
  it('targets the xanthakita account and showcase topic', () => {
    expect(siteConfig.githubUsername).toBe('xanthakita');
    expect(siteConfig.showcaseTopic).toBe('showcase');
    expect(siteConfig.title.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/site.config.test.ts`
Expected: FAIL (cannot find module `@/site.config`).

- [ ] **Step 3: Create the config and type**

Create `src/site.config.ts`:
```ts
export const siteConfig = {
  githubUsername: 'xanthakita',
  showcaseTopic: 'showcase',
  title: 'Jonathan Wagner',
  description: 'Projects, stories, and thoughts.',
} as const;
```

Create `src/lib/types.ts`:
```ts
export interface Project {
  name: string;
  slug: string;
  description: string | null;
  url: string;
  homepage: string | null;
  updatedAt: string; // ISO8601
  topics: string[];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/site.config.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/site.config.ts src/lib/types.ts src/site.config.test.ts
git commit -m "feat: site config + Project type"
```

---

### Task 3: GitHub data layer (`src/lib/github.ts`)

**Files:**
- Create: `src/lib/github.ts`
- Test: `src/lib/github.test.ts`

**Interfaces:**
- Consumes: `siteConfig` (Task 2), `Project` (Task 2), `process.env.GITHUB_TOKEN`.
- Produces:
  - `toProject(r: GhRepo): Project`
  - `getShowcaseRepos(): Promise<Project[]>` — public repos with the `showcase` topic, excludes forks/archived, sorted by `updatedAt` desc.
  - `getProjectBySlug(slug: string): Promise<Project | null>`
  - `getRepoReadme(repoName: string): Promise<string | null>` — raw README markdown, or `null` if 404.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/github.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getShowcaseRepos } from '@/lib/github';

const repo = (over: Record<string, unknown> = {}) => ({
  name: 'Foo', description: 'd', html_url: 'https://gh/Foo', homepage: null,
  updated_at: '2026-01-02T00:00:00Z', topics: ['showcase'], fork: false, archived: false, ...over,
});

describe('getShowcaseRepos', () => {
  beforeEach(() => { process.env.GITHUB_TOKEN = 'test-token'; });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('keeps only showcase-topic repos, drops forks/archived, sorts by updated desc', async () => {
    const repos = [
      repo({ name: 'A', updated_at: '2026-01-01T00:00:00Z' }),
      repo({ name: 'B', updated_at: '2026-03-01T00:00:00Z' }),
      repo({ name: 'NoTopic', topics: ['other'] }),
      repo({ name: 'Forked', fork: true }),
      repo({ name: 'Archived', archived: true }),
    ];
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => repos })));
    const out = await getShowcaseRepos();
    expect(out.map(p => p.name)).toEqual(['B', 'A']);
    expect(out[0].slug).toBe('b');
  });

  it('throws on a non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 403, json: async () => ({}) })));
    await expect(getShowcaseRepos()).rejects.toThrow('403');
  });

  it('tolerates a repo with no topics field', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => [repo({ topics: undefined })] })));
    const out = await getShowcaseRepos();
    expect(out).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/github.test.ts`
Expected: FAIL (cannot find module `@/lib/github`).

- [ ] **Step 3: Implement `src/lib/github.ts`**

```ts
import { siteConfig } from '@/site.config';
import type { Project } from '@/lib/types';

const API = 'https://api.github.com';

interface GhRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  updated_at: string;
  topics?: string[];
  fork: boolean;
  archived: boolean;
}

function ghHeaders(extra: Record<string, string> = {}): HeadersInit {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...extra,
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export function toProject(r: GhRepo): Project {
  return {
    name: r.name,
    slug: r.name.toLowerCase(),
    description: r.description,
    url: r.html_url,
    homepage: r.homepage || null,
    updatedAt: r.updated_at,
    topics: r.topics ?? [],
  };
}

export async function getShowcaseRepos(): Promise<Project[]> {
  const res = await fetch(
    `${API}/users/${siteConfig.githubUsername}/repos?per_page=100&type=owner&sort=updated`,
    { headers: ghHeaders(), next: { revalidate: 3600 } },
  );
  if (!res.ok) throw new Error(`GitHub repos fetch failed: ${res.status}`);
  const repos = (await res.json()) as GhRepo[];
  return repos
    .filter(r => !r.fork && !r.archived && (r.topics ?? []).includes(siteConfig.showcaseTopic))
    .map(toProject)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const all = await getShowcaseRepos();
  return all.find(p => p.slug === slug) ?? null;
}

export async function getRepoReadme(repoName: string): Promise<string | null> {
  const res = await fetch(`${API}/repos/${siteConfig.githubUsername}/${repoName}/readme`, {
    headers: ghHeaders({ Accept: 'application/vnd.github.raw' }),
    next: { revalidate: 3600 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub readme fetch failed: ${res.status}`);
  return await res.text();
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/github.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/github.ts src/lib/github.test.ts
git commit -m "feat: GitHub data layer (showcase filter + README fetch)"
```

---

### Task 4: Safe markdown renderer (`src/lib/markdown.tsx`)

**Files:**
- Create: `src/lib/markdown.tsx`
- Test: `src/lib/markdown.test.tsx`

**Interfaces:**
- Produces: `Markdown({ children }: { children: string }): JSX.Element` — renders GFM markdown; raw HTML is NOT rendered (react-markdown default), so embedded `<script>`/`onerror` cannot execute.

- [ ] **Step 1: Write the failing test**

Create `src/lib/markdown.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Markdown } from '@/lib/markdown';

describe('Markdown', () => {
  it('renders markdown headings and links', () => {
    const { container } = render(<Markdown>{'# Title\n\n[gh](https://github.com)'}</Markdown>);
    expect(container.querySelector('h1')?.textContent).toBe('Title');
    expect(container.querySelector('a')?.getAttribute('href')).toBe('https://github.com');
  });

  it('does not render raw HTML script/onerror payloads', () => {
    const { container } = render(
      <Markdown>{'# Hi\n\n<script>window.pwned=1</script>\n\n<img src=x onerror="alert(1)">'}</Markdown>,
    );
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img[onerror]')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/markdown.test.tsx`
Expected: FAIL (cannot find module `@/lib/markdown`).

- [ ] **Step 3: Implement `src/lib/markdown.tsx`**

```tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// react-markdown does not render raw HTML unless rehype-raw is added, so any
// <script>/<img onerror> in a README is inert. GFM enables tables/task-lists.
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/markdown.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/markdown.tsx src/lib/markdown.test.tsx
git commit -m "feat: safe markdown renderer for READMEs"
```

---

### Task 5: Landing page (`src/app/page.tsx`)

**Files:**
- Modify (replace): `src/app/page.tsx`
- Modify: `src/app/layout.tsx` (metadata title/description)

**Interfaces:**
- Consumes: `getShowcaseRepos` (Task 3), `siteConfig` (Task 2).
- Produces: the site root route with intro/bio + project cards linking to `/projects/<slug>`.

- [ ] **Step 1: Force dark theme + enable typography in `src/app/globals.css`**

Append to `src/app/globals.css` (after the existing `@import "tailwindcss";`). This registers the typography plugin (Tailwind v4 syntax) and forces a dark page regardless of system preference:
```css
@plugin "@tailwindcss/typography";

html { color-scheme: dark; }
body { background-color: #0a0a0a; color: #ededed; }
```
If the scaffold's `globals.css` has a `@media (prefers-color-scheme: dark)` block toggling `--background`/`--foreground`, remove it — we are dark unconditionally.

- [ ] **Step 2: Set metadata in `src/app/layout.tsx`**

Replace the generated `metadata` export with:
```tsx
import { siteConfig } from '@/site.config';

export const metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};
```
Keep the rest of the generated `layout.tsx` (`<html lang="en">`, `<body>`, font variables) intact — the dark background now comes from `globals.css`.

- [ ] **Step 3: Replace `src/app/page.tsx` (dark, portrait hero + project cards)**

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { getShowcaseRepos } from '@/lib/github';
import { siteConfig } from '@/site.config';

export const revalidate = 3600;

export default async function Home() {
  const projects = await getShowcaseRepos();
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
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
        <p>Now LLMs let me jump straight from an idea to a made thing. This is where I keep the projects, stories, and thoughts.</p>
      </div>

      <h2 className="mt-14 text-xl font-semibold text-neutral-100">Projects</h2>
      {projects.length === 0 ? (
        <p className="mt-4 text-neutral-500">No projects yet. Tag a repo with the &quot;{siteConfig.showcaseTopic}&quot; topic on GitHub to feature it here.</p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {projects.map(p => (
            <li key={p.slug} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 transition hover:border-neutral-700 hover:bg-neutral-900">
              <Link href={`/projects/${p.slug}`} className="text-lg font-semibold text-blue-400 hover:underline">{p.name}</Link>
              {p.description && <p className="mt-1 text-sm text-neutral-400">{p.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
```

- [ ] **Step 4: Verify build (landing compiles; needs a token for the fetch)**

Run: `export GITHUB_TOKEN=<your token> && npm run build`
Expected: build succeeds and `/` prerenders with the portrait. Without a token the anonymous GitHub fetch may rate-limit and fail the build — set the token first. `npm test` still green.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/layout.tsx src/app/globals.css
git commit -m "feat: dark landing page (portrait hero + intro + project cards)"
```

---

### Task 6: Per-project README page (`src/app/projects/[slug]/page.tsx`)

**Files:**
- Create: `src/app/projects/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getShowcaseRepos`, `getProjectBySlug`, `getRepoReadme` (Task 3), `Markdown` (Task 4).
- Produces: route `/projects/<slug>` rendering the repo README; `generateStaticParams` pre-builds one page per showcase repo.

- [ ] **Step 1: Create `src/app/projects/[slug]/page.tsx`**

```tsx
import Link from 'next/link';
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
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-blue-400 hover:underline">&larr; Back</Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-50">{project.name}</h1>
      {project.description && <p className="mt-2 text-neutral-400">{project.description}</p>}
      <p className="mt-2 text-sm">
        <a className="text-blue-400 hover:underline" href={project.url} target="_blank" rel="noopener noreferrer">View on GitHub</a>
      </p>
      <div className="mt-8">
        {readme ? <Markdown>{readme}</Markdown> : <p className="text-neutral-500">No README yet.</p>}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify build prerenders project pages**

Run: `GITHUB_TOKEN=<token> npm run build`
Expected: build lists `/projects/[slug]` prerendered for each showcase repo. `npm test` still green.

- [ ] **Step 3: Local smoke (optional but recommended)**

Run: `GITHUB_TOKEN=<token> npm run dev`, open `http://localhost:3000`, confirm intro + project cards render and a card link opens a README page. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add src/app/projects/[slug]/page.tsx
git commit -m "feat: per-project README page"
```

---

### Task 7: Deploy to Vercel + wire DNS (email-safe)

**Files:**
- Create: `.env.example` (documents `GITHUB_TOKEN`)

**Interfaces:**
- Consumes: the built app; `GITHUB_TOKEN`.
- Produces: live site at the Vercel URL, then `xanthakita.com` via GoDaddy records, SSL issued, iCloud email intact.

> Some steps are Jonathan-gated (GitHub token creation, GoDaddy DNS). Those are marked **[Jonathan]**.

- [ ] **Step 1: [Jonathan] Create a fine-grained GitHub token**

GitHub → Settings → Developer settings → Fine-grained tokens → Generate. Resource owner: `xanthakita`. Repository access: **Public repositories (read-only)**. Permissions: default read metadata is enough (public repo read + metadata). Copy the token.

- [ ] **Step 2: Document the env var**

Create `.env.example`:
```
# Fine-grained GitHub PAT, read-only public repos. Set locally and in Vercel.
GITHUB_TOKEN=
```
Commit:
```bash
git add .env.example
git commit -m "docs: document GITHUB_TOKEN env var"
```

- [ ] **Step 3: Create the Vercel project and set the env var**

```bash
cd ~/repos/xanthakita
vercel link --yes            # create/link the "xanthakita" project
printf '%s' "<TOKEN>" | vercel env add GITHUB_TOKEN production
printf '%s' "<TOKEN>" | vercel env add GITHUB_TOKEN preview
printf '%s' "<TOKEN>" | vercel env add GITHUB_TOKEN development
```

- [ ] **Step 4: Deploy to production**

```bash
vercel --prod
```
Expected: a `*.vercel.app` URL. Open it: intro + project cards render, a card opens a README page.

- [ ] **Step 5: Add the domain to the Vercel project**

```bash
vercel domains add xanthakita.com
vercel domains add www.xanthakita.com
```
Vercel will print the exact records to add (should match the two below).

- [ ] **Step 6: [Jonathan] Add the two records at GoDaddy (leave everything else)**

In GoDaddy DNS for `xanthakita.com`:
- Replace the existing apex `A` (currently GoDaddy forwarding) with: `A  @  76.76.21.21`
- Add: `CNAME  www  cname.vercel-dns.com`
- **Do NOT touch** the MX, SPF/TXT, `apple-domain`, or `sig1._domainkey` records, and **do NOT change nameservers**.

- [ ] **Step 7: Verify domain, SSL, and email**

```bash
# DNS points at Vercel:
dig +short A xanthakita.com          # expect 76.76.21.21
dig +short CNAME www.xanthakita.com  # expect cname.vercel-dns.com
# Email untouched:
dig +short MX xanthakita.com         # expect mx01/mx02.mail.icloud.com
```
Then load `https://xanthakita.com` (Vercel auto-issues SSL once DNS resolves; may take a few minutes). Confirm the site loads over HTTPS and email MX is unchanged.

- [ ] **Step 8: Final commit / TODO update**

Move the "Define the project" TODO item to Completed and add any follow-ups (blog, design pass). Commit.
```bash
git add TODO.md
git commit -m "docs: v1 shipped; note deferred blog + design pass"
```

---

## Notes for the implementer

- **Node/Next version:** use the Next version create-next-app installs; App Router `params` is a Promise (await it), as written in Task 6.
- **No token locally?** Public repo reads work unauthenticated but are rate-limited (60/hr) and topics may be omitted — set `GITHUB_TOKEN` before `npm run build`/`dev`.
- **Deferred (do NOT build now):** the blog (`content/posts/*.mdx` + `/posts/[slug]`), any real visual design, dark-mode polish. v1 is landing + projects only.
