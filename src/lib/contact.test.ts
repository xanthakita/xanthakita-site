import { describe, it, expect } from 'vitest';
import { parseContact, buildContactEmail, RateLimiter, sendContact, INTERESTS } from '@/lib/contact';

const good = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  organization: 'Analytical Engines Ltd',
  interest: 'fractional-cto',
  message: 'We need a part-time CTO to steer a rebuild of our billing platform.',
  website: '',
};

describe('parseContact', () => {
  it('accepts a complete submission and trims whitespace', () => {
    const r = parseContact({ ...good, name: '  Ada Lovelace ', message: ` ${good.message} ` });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.name).toBe('Ada Lovelace');
    expect(r.data.message).toBe(good.message);
    expect(r.data.organization).toBe('Analytical Engines Ltd');
    expect(r.data.interest).toBe('fractional-cto');
  });
  it('treats organization as optional', () => {
    const r = parseContact({ ...good, organization: undefined });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.organization).toBe('');
  });
  it('requires a name', () => {
    const r = parseContact({ ...good, name: '   ' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.name).toMatch(/name/i);
  });
  it('rejects an address without an @', () => {
    const r = parseContact({ ...good, email: 'ada.example.com' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.email).toMatch(/email/i);
  });
  it('rejects an interest outside the offered list', () => {
    const r = parseContact({ ...good, interest: 'buy-a-puppy' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.interest).toBeTruthy();
  });
  it('requires a message of at least ten characters', () => {
    const r = parseContact({ ...good, message: 'hi' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.message).toMatch(/message/i);
  });
  it('caps the message at 5000 characters', () => {
    const r = parseContact({ ...good, message: 'x'.repeat(5001) });
    expect(r.ok).toBe(false);
  });
  it('flags a filled honeypot as a bot without reporting an error', () => {
    const r = parseContact({ ...good, website: 'http://spam.example' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.bot).toBe(true);
  });
  it('reports every failing field at once', () => {
    const r = parseContact({ ...good, name: '', email: 'nope', message: '' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(['email', 'message', 'name']);
  });
});

describe('buildContactEmail', () => {
  const data = { ...good, bot: false, interest: 'consulting' as const };
  it('addresses the mail to the configured inbox with reply-to set to the visitor', () => {
    const m = buildContactEmail(data, { to: 'me@example.com', from: 'forms@example.com' });
    expect(m.to).toBe('me@example.com');
    expect(m.from).toBe('forms@example.com');
    expect(m.replyTo).toBe('ada@example.com');
  });
  it('puts the name and the interest label in the subject', () => {
    const m = buildContactEmail(data, { to: 'me@example.com', from: 'forms@example.com' });
    expect(m.subject).toBe(`[xanthakita.com] Consulting: Ada Lovelace`);
  });
  it('carries every field in the plain-text body', () => {
    const m = buildContactEmail(data, { to: 'me@example.com', from: 'forms@example.com' });
    for (const s of ['Ada Lovelace', 'ada@example.com', 'Analytical Engines Ltd', 'Consulting', good.message]) {
      expect(m.text).toContain(s);
    }
  });
});

describe('RateLimiter', () => {
  it('allows up to the limit within the window and refuses the next one', () => {
    const rl = new RateLimiter({ limit: 3, windowMs: 60_000 });
    const t = 1_000_000;
    expect(rl.allow('1.2.3.4', t)).toBe(true);
    expect(rl.allow('1.2.3.4', t + 1)).toBe(true);
    expect(rl.allow('1.2.3.4', t + 2)).toBe(true);
    expect(rl.allow('1.2.3.4', t + 3)).toBe(false);
  });
  it('forgets hits once the window has passed', () => {
    const rl = new RateLimiter({ limit: 1, windowMs: 1_000 });
    expect(rl.allow('k', 0)).toBe(true);
    expect(rl.allow('k', 500)).toBe(false);
    expect(rl.allow('k', 1_001)).toBe(true);
  });
  it('tracks keys independently', () => {
    const rl = new RateLimiter({ limit: 1, windowMs: 1_000 });
    expect(rl.allow('a', 0)).toBe(true);
    expect(rl.allow('b', 0)).toBe(true);
  });
});

describe('sendContact', () => {
  it('posts the built message to the Resend emails endpoint with the bearer key', async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const fetchImpl = (async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response(JSON.stringify({ id: 'msg_1' }), { status: 200 });
    }) as unknown as typeof fetch;
    const r = await sendContact({ ...good, bot: false, interest: 'review' }, { apiKey: 'k_test', to: 'me@example.com', from: 'forms@example.com', fetchImpl });
    expect(r.ok).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://api.resend.com/emails');
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe('Bearer k_test');
    const body = JSON.parse(calls[0].init.body as string);
    expect(body.to).toEqual(['me@example.com']);
    expect(body.reply_to).toBe('ada@example.com');
    expect(body.subject).toContain('Systems and process review');
  });
  it('returns ok:false with the status when Resend refuses the request', async () => {
    const fetchImpl = (async () => new Response('{"message":"nope"}', { status: 422 })) as unknown as typeof fetch;
    const r = await sendContact({ ...good, bot: false, interest: 'review' }, { apiKey: 'k', to: 'a@b.c', from: 'f@b.c', fetchImpl });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/422/);
  });
});

describe('INTERESTS', () => {
  it('offers the three engagement types in order', () => {
    expect(INTERESTS.map(i => i.value)).toEqual(['review', 'consulting', 'fractional-cto']);
  });
});
