import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Markdown } from '@/lib/markdown';

describe('Markdown', () => {
  it('renders markdown headings and links', () => {
    const { container } = render(<Markdown>{'# Title\n\n[gh](https://github.com)'}</Markdown>);
    expect(container.querySelector('h1')?.textContent).toBe('Title');
    expect(container.querySelector('a')?.getAttribute('href')).toBe('https://github.com');
  });

  it('does not render raw HTML script/onerror payloads', () => {
    const { container } = render(
      <Markdown>{'# Hi\n\n<script>window.pwned=1</script>\n\n<img src=x onerror="alert(1)">'}</Markdown>,
    );
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img[onerror]')).toBeNull();
  });
});
