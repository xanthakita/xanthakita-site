import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Post } from '@/lib/posts';
import type { Project } from '@/lib/types';

const mockPathname = vi.fn(() => '/');
vi.mock('next/navigation', () => ({ usePathname: () => mockPathname() }));

import { Rail } from '@/components/Rail';

const post = (slug: string, title: string, date: string): Post =>
  ({ slug, title, date, sourceBlog: '', sourceUrl: '', excerpt: '' });

const postGroups = [
  { year: '2024', posts: [post('alpha', 'Alpha', '2024-03-01')] },
  { year: '2023', posts: [post('beta', 'Beta', '2023-06-01')] },
];
const projects: Project[] = [
  { name: 'toque', slug: 'toque', description: null, url: 'https://x', homepage: null, updatedAt: '2024-01-01', topics: [] },
];

const rail = () => <Rail name="Jonathan Wagner" postGroups={postGroups} postCount={2} projects={projects} />;

beforeEach(() => { mockPathname.mockReturnValue('/'); });

describe('Rail', () => {
  it('renders both groups collapsed with counts on home', () => {
    render(rail());
    expect(screen.getByRole('button', { name: /Writings/ })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: /Projects/ })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Alpha')).toBeNull();
    expect(screen.queryByText('toque')).toBeNull();
  });

  it('expands Writings then a year on click', () => {
    render(rail());
    fireEvent.click(screen.getByRole('button', { name: /Writings/ }));
    fireEvent.click(screen.getByRole('button', { name: '2024' }));
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  it('auto-expands and highlights the active post', () => {
    mockPathname.mockReturnValue('/posts/beta');
    render(rail());
    const link = screen.getByText('Beta').closest('a');
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('auto-expands Projects on a project route', () => {
    mockPathname.mockReturnValue('/projects/toque');
    render(rail());
    expect(screen.getByText('toque')).toBeInTheDocument();
  });
});
