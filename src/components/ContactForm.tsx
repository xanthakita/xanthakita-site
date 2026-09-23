'use client';

import { useActionState } from 'react';
import { INTERESTS } from '@/lib/contact';
import { idleState, type ContactState } from '@/lib/contactState';

type Action = (prev: ContactState, formData: FormData) => Promise<ContactState>;

const inputClass =
  'mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-base text-neutral-100 placeholder-neutral-500 focus:border-blue-400 focus:outline-none aria-[invalid=true]:border-red-500';
const labelClass = 'block text-sm font-medium text-neutral-300';

export function ContactForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, idleState);
  const errors = state.status === 'error' ? (state.errors ?? {}) : {};

  if (state.status === 'sent') {
    return (
      <p role="status" className="rounded-md border border-neutral-700 bg-neutral-900 px-4 py-3 text-neutral-200">
        Thank you. Your message is on its way, and I will reply to the address you gave me.
      </p>
    );
  }

  return (
    <form action={formAction} noValidate className="space-y-5" aria-describedby={state.status === 'error' && state.formError ? 'contact-form-error' : undefined}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelClass}>Name</label>
          <input id="contact-name" name="name" type="text" required autoComplete="name" className={inputClass}
            aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? 'contact-name-error' : undefined} />
          {errors.name && <p id="contact-name-error" className="mt-1 text-sm text-red-400">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>Email</label>
          <input id="contact-email" name="email" type="email" required autoComplete="email" className={inputClass}
            aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? 'contact-email-error' : undefined} />
          {errors.email && <p id="contact-email-error" className="mt-1 text-sm text-red-400">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="contact-org" className={labelClass}>Organization <span className="font-normal text-neutral-500">(optional)</span></label>
        <input id="contact-org" name="organization" type="text" autoComplete="organization" className={inputClass} />
      </div>

      <fieldset>
        <legend className={labelClass}>What are you looking for?</legend>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-6">
          {INTERESTS.map((i, idx) => (
            <label key={i.value} className="flex items-center gap-2 text-neutral-200">
              <input type="radio" name="interest" value={i.value} defaultChecked={idx === 0} className="accent-blue-400" />
              {i.label}
            </label>
          ))}
        </div>
        {errors.interest && <p className="mt-1 text-sm text-red-400">{errors.interest}</p>}
      </fieldset>

      <div>
        <label htmlFor="contact-message" className={labelClass}>Message</label>
        <textarea id="contact-message" name="message" required rows={5} className={inputClass}
          placeholder="A few lines about your organization and what you need."
          aria-invalid={errors.message ? true : undefined} aria-describedby={errors.message ? 'contact-message-error' : undefined} />
        {errors.message && <p id="contact-message-error" className="mt-1 text-sm text-red-400">{errors.message}</p>}
      </div>

      {/* Honeypot: hidden from people, filled by naive bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === 'error' && state.formError && (
        <p id="contact-form-error" role="alert" className="text-sm text-red-400">{state.formError}</p>
      )}

      <button type="submit" disabled={pending}
        className="rounded-md bg-blue-500 px-5 py-2 font-semibold text-neutral-950 hover:bg-blue-400 disabled:cursor-wait disabled:opacity-60">
        {pending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
