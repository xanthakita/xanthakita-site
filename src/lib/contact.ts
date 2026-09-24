// Contact form: validation, the outgoing email, a small in-memory rate limiter,
// and the Resend call. Pure functions with injected dependencies so the whole
// thing is testable without a network.

export const INTERESTS = [
  { value: 'review', label: 'Systems and process review' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'fractional-cto', label: 'Fractional CTO' },
] as const;

export type Interest = (typeof INTERESTS)[number]['value'];

export interface ContactData {
  name: string;
  email: string;
  organization: string;
  interest: Interest;
  message: string;
  /** True when the honeypot field was filled: treat as a bot, never send. */
  bot: boolean;
}

export type ContactErrors = Partial<Record<'name' | 'email' | 'interest' | 'message', string>>;

export type ParseResult = { ok: true; data: ContactData } | { ok: false; errors: ContactErrors };

type RawInput = Record<string, unknown>;

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 5000;
const FIELD_MAX = 200;

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function isInterest(v: string): v is Interest {
  return INTERESTS.some(i => i.value === v);
}

export function parseContact(input: RawInput): ParseResult {
  const name = str(input.name).slice(0, FIELD_MAX);
  const email = str(input.email).slice(0, FIELD_MAX);
  const organization = str(input.organization).slice(0, FIELD_MAX);
  const interest = str(input.interest);
  const message = str(input.message);
  const bot = str(input.website) !== '';

  const errors: ContactErrors = {};
  if (!name) errors.name = 'Please tell me your name.';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email address.';
  if (!isInterest(interest)) errors.interest = 'Please choose what you are looking for.';
  if (message.length < MESSAGE_MIN) errors.message = 'Please write a message of at least ten characters.';
  else if (message.length > MESSAGE_MAX) errors.message = `Please keep the message under ${MESSAGE_MAX} characters.`;

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, data: { name, email, organization, interest: interest as Interest, message, bot } };
}

export function interestLabel(value: Interest): string {
  return INTERESTS.find(i => i.value === value)?.label ?? value;
}

export interface ContactEmail {
  to: string;
  from: string;
  replyTo: string;
  subject: string;
  text: string;
}

export function buildContactEmail(data: ContactData, opts: { to: string; from: string }): ContactEmail {
  const label = interestLabel(data.interest);
  const lines = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Organization: ${data.organization || '(not given)'}`,
    `Looking for: ${label}`,
    '',
    data.message,
  ];
  return {
    to: opts.to,
    from: opts.from,
    replyTo: data.email,
    subject: `[xanthakita.com] ${label}: ${data.name}`,
    text: lines.join('\n'),
  };
}

/** Fixed-window counter per key. Good enough for a personal site on one instance. */
export class RateLimiter {
  private hits = new Map<string, number[]>();
  constructor(private readonly opts: { limit: number; windowMs: number }) {}

  allow(key: string, now: number = Date.now()): boolean {
    const since = now - this.opts.windowMs;
    const recent = (this.hits.get(key) ?? []).filter(t => t > since);
    if (recent.length >= this.opts.limit) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }
}

export interface SendOptions {
  apiKey: string;
  to: string;
  from: string;
  fetchImpl?: typeof fetch;
}

export type SendResult = { ok: true; id: string } | { ok: false; error: string };

export async function sendContact(data: ContactData, opts: SendOptions): Promise<SendResult> {
  const f = opts.fetchImpl ?? fetch;
  const mail = buildContactEmail(data, { to: opts.to, from: opts.from });
  const res = await f('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${opts.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: mail.from, to: [mail.to], reply_to: mail.replyTo, subject: mail.subject, text: mail.text }),
  });
  if (!res.ok) return { ok: false, error: `Resend responded ${res.status}` };
  const json = (await res.json().catch(() => ({}))) as { id?: string };
  return { ok: true, id: json.id ?? '' };
}
