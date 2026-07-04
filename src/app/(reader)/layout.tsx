import { getAllPosts, groupPostsByYear } from '@/lib/posts';
import { getShowcaseRepos } from '@/lib/github';
import type { Project } from '@/lib/types';
import { siteConfig } from '@/site.config';
import { Rail } from '@/components/Rail';

export const revalidate = 3600;

export default async function ReaderLayout({ children }: { children: React.ReactNode }) {
  const posts = getAllPosts();
  const postGroups = groupPostsByYear(posts);
  let projects: Project[] = [];
  try {
    projects = await getShowcaseRepos();
  } catch {
    projects = [];
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col md:flex-row">
      <Rail name={siteConfig.title} postGroups={postGroups} postCount={posts.length} projects={projects} />
      <main className="min-w-0 flex-1 px-6 py-12 md:px-10 md:py-16">{children}</main>
    </div>
  );
}
