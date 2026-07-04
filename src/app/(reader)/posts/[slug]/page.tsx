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
    <article className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-50">{meta.title}</h1>
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
    </article>
  );
}
