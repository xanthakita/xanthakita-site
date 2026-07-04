# xanthakita.com Writings (Blogger import) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Import ~53 posts from 7 of Jonathan's Blogger blogs into the repo as owned, copyedited Markdown files, and surface them in a "Writings" section above Projects with a page per post.

**Architecture:** A one-time Node import script pulls each post from Blogger's public feed (or scrapes the post page when the feed is summary-only), downloads images locally, and writes `content/posts/<slug>.md` with frontmatter. A build-time filesystem loader (`src/lib/posts.ts`) reads them. The landing lists posts; `/posts/<slug>` renders each with the existing safe Markdown renderer. After generation, every post gets a spelling/grammar copyedit that preserves voice.

**Tech Stack:** Next.js 16 App Router + TypeScript; `gray-matter` (frontmatter parsing, runtime); `turndown` (HTML→Markdown, dev-only import tool); existing `Markdown` component (react-markdown + remark-gfm); Vitest.

## Global Constraints

- Next.js **App Router** + **TypeScript**, `src/` dir, import alias `@/* → src/*`.
- Posts live at **`content/posts/<slug>.md`**; images at **`public/posts/<slug>/`**.
- Post bodies render through the existing **`@/lib/markdown` `Markdown`** component (no raw HTML, no `rehype-raw`).
- Data reads are **filesystem only** (no network at build/runtime for posts); ISR not needed.
- Import **7 blogs**: `myheartcwwg`, `my-internet-is-down`, `greercww`, `guardianofinnocence`, `crescentmoonshibas`, `tiredofthehype`, `thefiveminuteblogger`. Exclude the two Binks blogs.
- **Skip** the Tired Of The Hype stub titled "This is a cross post to two blogs at once".
- **`my-internet-is-down`** feed is summary-only → scrape the post page's `post-body entry-content` div (Blogger uses single-quoted class attrs).
- Copy contains **no em-dashes** (Jonathan's rule); copyedit corrects spelling/grammar/typos only, preserving voice and meaning.
- **Dark theme** styling consistent with existing pages (`text-neutral-*`, `prose prose-invert`).
- Landing section order: **bio → Writings → Projects**.

---

### Task 1: Posts data layer + date helper

**Files:**
- Create: `src/lib/posts.ts`
- Test: `src/lib/posts.test.ts`
- Modify: `package.json` (add `gray-matter` dependency)

**Interfaces:**
- Consumes: `gray-matter`.
- Produces:
  - `interface Post { slug: string; title: string; date: string; sourceBlog: string; sourceUrl: string; excerpt: string }`
  - `getAllPosts(dir?: string): Post[]` — reads `<dir>/*.md`, returns metadata sorted by `date` desc; `[]` if dir missing.
  - `getPostBySlug(slug: string, dir?: string): { meta: Post; body: string } | null`
  - `formatPostDate(iso: string): string` — `"2025-05-07"` → `"May 7, 2025"`; empty string in → `""`.

- [ ] **Step 1: Install gray-matter**

```bash
cd ~/repos/xanthakita
npm install gray-matter
```

- [ ] **Step 2: Write the failing tests**

Create `src/lib/posts.test.ts`:
```ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getAllPosts, getPostBySlug, formatPostDate } from '@/lib/posts';

let dir: string;
beforeAll(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'posts-'));
  fs.writeFileSync(path.join(dir, 'older.md'),
    '---\ntitle: "Older"\ndate: "2020-01-01"\nsourceBlog: "My Heart"\nsourceUrl: "https://x/1"\nexcerpt: "old"\n---\n\nBody one.\n');
  fs.writeFileSync(path.join(dir, 'newer.md'),
    '---\ntitle: "Newer"\ndate: "2025-05-07"\nsourceBlog: "Guardian"\nsourceUrl: "https://x/2"\nexcerpt: "new"\n---\n\nBody two.\n');
  fs.writeFileSync(path.join(dir, 'sparse.md'),
    '---\ntitle: "Sparse"\ndate: "2014-06-01"\n---\n\nNo optional fields.\n');
});
afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

describe('getAllPosts', () => {
  it('returns posts newest-first', () => {
    expect(getAllPosts(dir).map(p => p.slug)).toEqual(['newer', 'older', 'sparse']);
  });
  it('returns [] for a missing dir', () => {
    expect(getAllPosts(path.join(dir, 'nope'))).toEqual([]);
  });
  it('tolerates missing optional frontmatter', () => {
    const p = getAllPosts(dir).find(p => p.slug === 'sparse')!;
    expect(p.title).toBe('Sparse');
    expect(p.sourceUrl).toBe('');
    expect(p.excerpt).toBe('');
  });
});

describe('getPostBySlug', () => {
  it('returns meta + body', () => {
    const r = getPostBySlug('newer', dir)!;
    expect(r.meta.title).toBe('Newer');
    expect(r.body.trim()).toBe('Body two.');
  });
  it('returns null for unknown slug', () => {
    expect(getPostBySlug('ghost', dir)).toBeNull();
  });
});

describe('formatPostDate', () => {
  it('formats ISO date', () => { expect(formatPostDate('2025-05-07')).toBe('May 7, 2025'); });
  it('passes through empty', () => { expect(formatPostDate('')).toBe(''); });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/lib/posts.test.ts`
Expected: FAIL (cannot find module `@/lib/posts`).

- [ ] **Step 4: Implement `src/lib/posts.ts`**

```ts
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export interface Post {
  slug: string;
  title: string;
  date: string;
  sourceBlog: string;
  sourceUrl: string;
  excerpt: string;
}

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

function toMeta(slug: string, data: Record<string, unknown>): Post {
  return {
    slug,
    title: typeof data.title === 'string' ? data.title : slug,
    date: typeof data.date === 'string' ? data.date : '',
    sourceBlog: typeof data.sourceBlog === 'string' ? data.sourceBlog : '',
    sourceUrl: typeof data.sourceUrl === 'string' ? data.sourceUrl : '',
    excerpt: typeof data.excerpt === 'string' ? data.excerpt : '',
  };
}

export function getAllPosts(dir: string = POSTS_DIR): Post[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const slug = f.replace(/\.md$/, '');
      const { data } = matter(fs.readFileSync(path.join(dir, f), 'utf8'));
      return toMeta(slug, data);
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostBySlug(slug: string, dir: string = POSTS_DIR): { meta: Post; body: string } | null {
  const file = path.join(dir, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, 'utf8'));
  return { meta: toMeta(slug, data), body: content };
}

export function formatPostDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/lib/posts.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/posts.ts src/lib/posts.test.ts package.json package-lock.json
git commit -m "feat: posts data layer (frontmatter loader + date helper)"
```

---

### Task 2: Blogger import script + run it

**Files:**
- Create: `scripts/import-blogger.mjs`
- Modify: `package.json` (add `turndown` devDependency)
- Generates: `content/posts/*.md`, `public/posts/<slug>/*`

**Interfaces:**
- Consumes: Blogger public feeds/pages (network). Node 24 global `fetch`.
- Produces: the `content/posts/*.md` corpus that Task 1's loader reads and Tasks 4–5 render. Frontmatter keys exactly: `title`, `date`, `sourceBlog`, `sourceUrl`, `excerpt`.

- [ ] **Step 1: Install turndown**

```bash
npm install -D turndown
```

- [ ] **Step 2: Create `scripts/import-blogger.mjs`**

```js
import fs from 'node:fs';
import path from 'node:path';
import TurndownService from 'turndown';

const BLOGS = [
  { host: 'myheartcwwg', title: 'My Heart' },
  { host: 'my-internet-is-down', title: 'My Internet Is Down' },
  { host: 'greercww', title: 'Greer Church Without Walls' },
  { host: 'guardianofinnocence', title: 'Guardian of Innocence' },
  { host: 'crescentmoonshibas', title: 'Crescent Moon Shibas Blog' },
  { host: 'tiredofthehype', title: 'Tired Of The Hype' },
  { host: 'thefiveminuteblogger', title: '5 minute Blogger' },
];

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, 'content', 'posts');
const PUBLIC_POSTS = path.join(ROOT, 'public', 'posts');
const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });

const UA = { 'User-Agent': 'Mozilla/5.0 (import-blogger)' };
const seenSlugs = new Set();

function slugFromUrl(url, fallback) {
  try {
    const seg = new URL(url).pathname.split('/').filter(Boolean).pop() || fallback;
    let s = seg.replace(/\.html$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!s) s = fallback;
    let base = s, n = 2;
    while (seenSlugs.has(s)) { s = `${base}-${n++}`; }
    seenSlugs.add(s);
    return s;
  } catch { return fallback; }
}

function stripToText(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"').replace(/\s+/g, ' ').trim();
}

async function scrapePageBody(url) {
  const res = await fetch(url, { headers: UA });
  const html = await res.text();
  // Blogger classic template: <div class='post-body entry-content' ...> ... </div><div class='post-footer'
  const m = html.match(/class='post-body[^']*'[^>]*>([\s\S]*?)<div class='post-footer/);
  return m ? m[1] : '';
}

async function extFor(url) {
  const clean = url.split('?')[0];
  const ext = path.extname(clean).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) return ext;
  try {
    const head = await fetch(url, { method: 'HEAD', headers: UA });
    const ct = head.headers.get('content-type') || '';
    if (ct.includes('png')) return '.png';
    if (ct.includes('gif')) return '.gif';
    if (ct.includes('webp')) return '.webp';
  } catch { /* fall through */ }
  return '.jpg';
}

async function downloadImages(html, slug) {
  const dir = path.join(PUBLIC_POSTS, slug);
  const srcs = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/g)].map(m => m[1]);
  let out = html, i = 1, count = 0;
  for (const src of srcs) {
    try {
      const ext = await extFor(src);
      const res = await fetch(src, { headers: UA });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      fs.mkdirSync(dir, { recursive: true });
      const name = `${i}${ext}`;
      fs.writeFileSync(path.join(dir, name), buf);
      out = out.split(src).join(`/posts/${slug}/${name}`);
      i++; count++;
    } catch (e) { console.warn(`  ! image failed ${src}: ${e.message}`); }
  }
  return { html: out, count };
}

function fm(v) { return `"${String(v).replace(/"/g, '\\"')}"`; }

async function run() {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
  let written = 0, skipped = 0, images = 0;
  for (const blog of BLOGS) {
    const feedUrl = `https://${blog.host}.blogspot.com/feeds/posts/default?alt=json&max-results=150`;
    const feed = await (await fetch(feedUrl, { headers: UA })).json();
    const entries = feed.feed?.entry || [];
    console.log(`\n${blog.title}: ${entries.length} entries`);
    for (const e of entries) {
      const title = (e.title?.$t || '').trim();
      const published = (e.published?.$t || '').slice(0, 10);
      const alt = (e.link || []).find(l => l.rel === 'alternate')?.href || '';
      let html = e.content?.$t || '';
      if (title === 'This is a cross post to two blogs at once') { skipped++; console.log(`  skip stub: ${title}`); continue; }
      if (!html && alt) html = await scrapePageBody(alt);
      if (stripToText(html).split(' ').filter(Boolean).length < 20 && !title) { skipped++; console.log('  skip near-empty untitled'); continue; }
      const slug = slugFromUrl(alt, `post-${published || 'undated'}`);
      const dl = await downloadImages(html, slug);
      images += dl.count;
      const body = td.turndown(dl.html).trim();
      const excerpt = stripToText(html).slice(0, 160);
      const displayTitle = title || `Untitled (${published})`;
      const front = [
        '---',
        `title: ${fm(displayTitle)}`,
        `date: ${fm(published)}`,
        `sourceBlog: ${fm(blog.title)}`,
        `sourceUrl: ${fm(alt)}`,
        `excerpt: ${fm(excerpt)}`,
        '---', '', body, '',
      ].join('\n');
      fs.writeFileSync(path.join(POSTS_DIR, `${slug}.md`), front);
      written++;
      console.log(`  wrote ${slug}.md (${dl.count} imgs)`);
    }
  }
  console.log(`\nDONE: ${written} written, ${skipped} skipped, ${images} images.`);
}
run();
```

- [ ] **Step 3: Run the import**

Run: `node scripts/import-blogger.mjs`
Expected: prints per-blog progress; final line reports ~53 written, ~1 skipped, ~9 images. `content/posts/` now holds the `.md` files and `public/posts/` holds image folders.

- [ ] **Step 4: Sanity-check the corpus**

Run:
```bash
ls content/posts | wc -l
ls public/posts
grep -L "^title:" content/posts/*.md   # expect no output (every file has a title)
```
Expected: ~53 files; image folders for `welcome-to-crescent-moon-shibas` and two Greer posts; no files missing a title.

- [ ] **Step 5: Commit the raw corpus**

```bash
git add content/posts public/posts scripts/import-blogger.mjs package.json package-lock.json
git commit -m "feat: import 7 Blogger blogs to content/posts (raw, pre-copyedit)"
```

---

### Task 3: Copyedit pass

**Files:**
- Modify: every `content/posts/*.md` (body text only)

**Interfaces:**
- Consumes: the raw corpus from Task 2.
- Produces: the same files, spelling/grammar corrected, ready to render.

- [ ] **Step 1: Copyedit each post**

For each file in `content/posts/*.md`, read the body and correct spelling, punctuation, typos, and grammar. Rules:
- Preserve the author's voice, meaning, structure, and paragraphing. This is a correction pass, NOT a rewrite: do not add or remove ideas, do not restructure.
- Fix obvious errors (e.g. "Sometes"→"Sometimes", "Aggrivated"→"Aggravated", "shepard"→"shepherd", "Offence"→"Offense", "Cmaroon"-style typos, double spaces, broken capitalization).
- Remove em-dashes; replace with a period, comma, or restructured short clause as reads best.
- Leave frontmatter untouched except fixing an obvious typo in a `title`.
- Fix any Markdown artifacts from conversion (stray escapes like `\.`, empty headings, duplicated blank lines).

- [ ] **Step 2: Verify nothing structurally broke**

Run: `npx vitest run src/lib/posts.test.ts`
Expected: the 7 loader tests still pass.

Then confirm every copyedited file still parses as valid frontmatter:
```bash
node --input-type=module -e "import matter from 'gray-matter'; import fs from 'node:fs'; for (const f of fs.readdirSync('content/posts')) { matter(fs.readFileSync('content/posts/'+f,'utf8')); } console.log('all', fs.readdirSync('content/posts').length, 'parse ok');"
```
Expected: prints "all N parse ok" with no thrown error.

- [ ] **Step 3: Commit**

```bash
git add content/posts
git commit -m "docs: copyedit imported posts (spelling/grammar, no em-dashes, voice preserved)"
```

---

### Task 4: Per-post page (`/posts/[slug]`)

**Files:**
- Create: `src/app/posts/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getAllPosts`, `getPostBySlug`, `formatPostDate` (Task 1); `Markdown` (`@/lib/markdown`).
- Produces: route `/posts/<slug>`; `generateStaticParams` prebuilds one page per post; unknown slug → 404.

- [ ] **Step 1: Create `src/app/posts/[slug]/page.tsx`**

```tsx
import Link from 'next/link';
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
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-blue-400 hover:underline">&larr; Back</Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-50">{meta.title}</h1>
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
    </main>
  );
}
```

- [ ] **Step 2: Verify build prerenders post pages**

Run: `GITHUB_TOKEN="$(gh auth token)" npm run build`
Expected: build lists `/posts/[slug]` prerendered (SSG) for each post; no type errors. `npm test` still green.

- [ ] **Step 3: Commit**

```bash
git add "src/app/posts/[slug]/page.tsx"
git commit -m "feat: per-post page at /posts/[slug]"
```

---

### Task 5: Writings section on the landing page

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `getAllPosts`, `formatPostDate` (Task 1).
- Produces: a "Writings" section between the intro and Projects, listing posts newest-first.

- [ ] **Step 1: Add imports and load posts in `src/app/page.tsx`**

At the top, add to the existing imports:
```tsx
import { getAllPosts, formatPostDate } from '@/lib/posts';
```
Inside `Home`, after `const projects = await getShowcaseRepos();`, add:
```tsx
  const posts = getAllPosts();
```

- [ ] **Step 2: Insert the Writings section before the Projects heading**

Immediately BEFORE the line `<h2 className="mt-14 text-xl font-semibold text-neutral-100">Projects</h2>`, insert:
```tsx
      <h2 className="mt-14 text-xl font-semibold text-neutral-100">Writings</h2>
      {posts.length === 0 ? (
        <p className="mt-4 text-neutral-500">No writings yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {posts.map(p => (
            <li key={p.slug} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 transition hover:border-neutral-700 hover:bg-neutral-900">
              <Link href={`/posts/${p.slug}`} className="text-lg font-semibold text-blue-400 hover:underline">{p.title}</Link>
              <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">{formatPostDate(p.date)} · {p.sourceBlog}</p>
              {p.excerpt && <p className="mt-2 text-sm text-neutral-400">{p.excerpt}</p>}
            </li>
          ))}
        </ul>
      )}
```
(`Link` is already imported in this file.)

- [ ] **Step 2b: Change the Projects margin so spacing stays even**

The Projects `<h2>` now follows the Writings list, not the intro. Change its class from `mt-14` to `mt-16` so the gap above Projects reads as a clear section break:
```tsx
      <h2 className="mt-16 text-xl font-semibold text-neutral-100">Projects</h2>
```

- [ ] **Step 3: Verify build + run tests**

Run: `GITHUB_TOKEN="$(gh auth token)" npm run build`
Expected: `/` prerenders with Writings above Projects; build clean.
Run: `npm test`
Expected: all green.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: Writings section on landing (above Projects)"
```

---

### Task 6: Local browser verification + deploy

**Files:** none (verification + deploy).

**Interfaces:**
- Consumes: the built app.
- Produces: the feature live at https://xanthakita.com.

- [ ] **Step 1: Local smoke with the dev server**

Run: `GITHUB_TOKEN="$(gh auth token)" npm run dev` (background), then load `http://localhost:3000`.
Confirm: bio → **Writings** (newest first, with dates + source-blog tags) → Projects. Click a post: title, date, "Originally published on …" link, body renders; the Crescent Moon post shows its images. Stop the server.

- [ ] **Step 2: Deploy to production**

```bash
vercel --prod
```
Expected: READY.

- [ ] **Step 3: Verify live**

Run:
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://xanthakita.com
curl -s https://xanthakita.com | grep -o "Writings" | head -1
```
Then load `https://xanthakita.com` in a browser (Playwright): Writings section present above Projects, a post page renders body + images. Confirm.

- [ ] **Step 4: Update TODO / changelog**

Mark the blog item done in `TODO.md`; add a `XAN-003` row to `~/repos/Changes.md` + detail file. Commit `TODO.md`.

---

## Notes for the implementer

- **Token for build/deploy:** GitHub fetch still needs a token; use `GITHUB_TOKEN="$(gh auth token)"` for local builds. Vercel already has the fine-grained token in its envs.
- **Turndown / gray-matter:** `turndown` is a dev-only tool for the one-time import; `gray-matter` is a runtime dependency (the loader uses it at build). Do not add MDX tooling.
- **Idempotency:** re-running the import overwrites `content/posts/*.md`, which would discard copyedits. Run the import once (Task 2); after that, edit the Markdown files by hand.
- **Deferred:** tags/categories, per-blog sections, RSS, multi-author. Not in this plan.
