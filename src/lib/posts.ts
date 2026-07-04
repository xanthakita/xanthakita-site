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
