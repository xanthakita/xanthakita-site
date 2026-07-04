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
