'use server';

import { headers } from 'next/headers';
import { RateLimiter, sendContact, type ContactData } from '@/lib/contact';
import { handleContact } from '@/lib/contactAction';
import type { ContactState } from '@/lib/contactState';

// One limiter per server instance: five messages an hour per client is plenty
// for a personal site and stops a stuck script from draining the mail quota.
const limiter = new RateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 });

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

async function clientKey(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'unknown';
}

function send(data: ContactData) {
  return sendContact(data, { apiKey: env('RESEND_API_KEY'), to: env('CONTACT_TO'), from: env('CONTACT_FROM') });
}

export async function submitContact(prev: ContactState, formData: FormData): Promise<ContactState> {
  return handleContact(prev, formData, { send, limiter, clientKey });
}
