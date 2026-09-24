import { parseContact, RateLimiter, type ContactData, type SendResult } from '@/lib/contact';
import type { ContactState } from '@/lib/contactState';

/** Everything the handler needs from the outside world, injected so it is testable. */
export interface ContactDeps {
  send: (data: ContactData) => Promise<SendResult>;
  limiter: RateLimiter;
  /** Something that identifies the client for rate limiting, usually its IP. */
  clientKey: () => Promise<string>;
}

export const SEND_FAILED = 'Something went wrong sending your message. Please email me directly.';
export const TOO_MANY = 'Too many messages from this connection. Please try again later.';

export async function handleContact(_prev: ContactState, formData: FormData, deps: ContactDeps): Promise<ContactState> {
  const parsed = parseContact(Object.fromEntries(formData.entries()));
  if (!parsed.ok) return { status: 'error', errors: parsed.errors };
  if (parsed.data.bot) return { status: 'sent' };

  const key = await deps.clientKey();
  if (!deps.limiter.allow(key)) return { status: 'error', formError: TOO_MANY };

  const sent = await deps.send(parsed.data);
  if (!sent.ok) {
    console.error('contact form send failed:', sent.error);
    return { status: 'error', formError: SEND_FAILED };
  }
  return { status: 'sent' };
}
