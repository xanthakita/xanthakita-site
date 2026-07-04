import { describe, it, expect } from 'vitest';
import { siteConfig } from '@/site.config';

describe('siteConfig', () => {
  it('targets the xanthakita account and showcase topic', () => {
    expect(siteConfig.githubUsername).toBe('xanthakita');
    expect(siteConfig.showcaseTopic).toBe('showcase');
    expect(siteConfig.title.length).toBeGreaterThan(0);
  });
});
