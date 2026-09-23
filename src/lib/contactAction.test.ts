import { describe, it, expect, vi } from 'vitest';
import { handleContact, type ContactDeps } from '@/lib/contactAction';
import { RateLimiter } from '@/lib/contact';

const fd = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};
const good = { name: 'Ada', email: 'ada@example.com', organization: '', interest: 'consulting', message: 'We need help with our billing rebuild.', website: '' };

const deps = (over: Partial<ContactDeps> = {}): ContactDeps => ({
  send: vi.fn(async () => ({ ok: true as const, id: 'msg' })),
  limiter: new RateLimiter({ limit: 5, windowMs: 60_000 }),
  clientKey: async () => '1.1.1.1',
  ...over,
});

describe('handleContact', () => {
  it('sends a valid submission and reports sent', async () => {
    const d = deps();
    const r = await handleContact({ status: 'idle' }, fd(good), d);
    expect(r).toEqual({ status: 'sent' });
    expect(d.send).toHaveBeenCalledTimes(1);
    expect(vi.mocked(d.send).mock.calls[0][0].email).toBe('ada@example.com');
  });
  it('returns field errors without sending', async () => {
    const d = deps();
    const r = await handleContact({ status: 'idle' }, fd({ ...good, email: 'nope' }), d);
    expect(r.status).toBe('error');
    if (r.status === 'error') expect(r.errors?.email).toBeTruthy();
    expect(d.send).not.toHaveBeenCalled();
  });
  it('pretends success for a bot without sending', async () => {
    const d = deps();
    const r = await handleContact({ status: 'idle' }, fd({ ...good, website: 'http://spam' }), d);
    expect(r).toEqual({ status: 'sent' });
    expect(d.send).not.toHaveBeenCalled();
  });
  it('refuses once the client has hit the rate limit', async () => {
    const d = deps({ limiter: new RateLimiter({ limit: 1, windowMs: 60_000 }) });
    await handleContact({ status: 'idle' }, fd(good), d);
    const r = await handleContact({ status: 'idle' }, fd(good), d);
    expect(r.status).toBe('error');
    if (r.status === 'error') expect(r.formError).toMatch(/too many|later/i);
    expect(d.send).toHaveBeenCalledTimes(1);
  });
  it('turns a send failure into a form-level error', async () => {
    const d = deps({ send: vi.fn(async () => ({ ok: false as const, error: 'Resend responded 500' })) });
    const r = await handleContact({ status: 'idle' }, fd(good), d);
    expect(r.status).toBe('error');
    if (r.status === 'error') expect(r.formError).toMatch(/went wrong/i);
  });
});
