'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PostYearGroup } from '@/lib/posts';
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

  // Auto-expand the active item's group when the route changes, without
  // collapsing anything the user opened manually. Adjusting state during
  // render (rather than in an effect) per
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (activePost) {
      setWritingsOpen(true);
      const y = yearOf(activePost);
      if (y) setOpenYears(prev => (prev.has(y) ? prev : new Set(prev).add(y)));
    }
    if (activeProject) setProjectsOpen(true);
  }

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
            alt=""
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
