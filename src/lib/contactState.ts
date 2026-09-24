import type { ContactErrors } from '@/lib/contact';

/** State passed between the contact server action and the form. Kept free of
 *  server-only imports so the client component can import the type. */
export type ContactState =
  | { status: 'idle' }
  | { status: 'sent' }
  | { status: 'error'; errors?: ContactErrors; formError?: string };

export const idleState: ContactState = { status: 'idle' };
