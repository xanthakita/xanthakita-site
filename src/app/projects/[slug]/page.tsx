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
