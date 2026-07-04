import Image from 'next/image';
import Link from 'next/link';
import { getShowcaseRepos } from '@/lib/github';
import { getAllPosts, formatPostDate } from '@/lib/posts';
import { siteConfig } from '@/site.config';

export const revalidate = 3600;

export default async function Home() {
  const projects = await getShowcaseRepos();
  const posts = getAllPosts();
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

      <h2 className="mt-16 text-xl font-semibold text-neutral-100">Projects</h2>
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
