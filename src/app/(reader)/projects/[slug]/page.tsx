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
