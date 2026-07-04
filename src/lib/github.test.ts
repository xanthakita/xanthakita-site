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
