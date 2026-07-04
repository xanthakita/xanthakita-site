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
