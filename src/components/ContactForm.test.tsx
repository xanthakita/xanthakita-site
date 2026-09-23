import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactForm } from '@/components/ContactForm';
import type { ContactState } from '@/lib/contactState';

const fill = (overrides: Record<string, string> = {}) => {
  const v = { Name: 'Ada', Email: 'ada@example.com', Message: 'We need help with our billing rebuild.', ...overrides };
  for (const [label, value] of Object.entries(v)) {
    fireEvent.change(screen.getByLabelText(new RegExp(`^${label}`)), { target: { value } });
  }
};

describe('ContactForm', () => {
  it('offers the three engagement types and the optional organization field', () => {
    render(<ContactForm action={async () => ({ status: 'idle' })} />);
    expect(screen.getByLabelText(/^Name/)).toBeRequired();
    expect(screen.getByLabelText(/^Email/)).toBeRequired();
    expect(screen.getByLabelText(/^Organization/)).not.toBeRequired();
    expect(screen.getByRole('radio', { name: /Systems and process review/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^Consulting/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Fractional CTO/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send/ })).toBeInTheDocument();
  });

  it('keeps the honeypot out of sight of people but present for bots', () => {
    render(<ContactForm action={async () => ({ status: 'idle' })} />);
    const trap = document.querySelector('input[name="website"]') as HTMLInputElement;
    expect(trap).toBeTruthy();
    expect(trap.tabIndex).toBe(-1);
    expect(trap.getAttribute('autocomplete')).toBe('off');
  });

  it('shows the field errors the action returns, next to their fields', async () => {
    const action = vi.fn(async (): Promise<ContactState> => ({ status: 'error', errors: { email: 'Please enter a valid email address.' } }));
    render(<ContactForm action={action} />);
    fill({ Email: 'nope' });
    fireEvent.click(screen.getByRole('button', { name: /Send/ }));
    await waitFor(() => expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument());
    expect(screen.getByLabelText(/^Email/)).toHaveAttribute('aria-invalid', 'true');
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('shows a form-level error when sending fails', async () => {
    const action = async (): Promise<ContactState> => ({ status: 'error', formError: 'Something went wrong sending your message. Please email me directly.' });
    render(<ContactForm action={action} />);
    fill();
    fireEvent.click(screen.getByRole('button', { name: /Send/ }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/went wrong/));
  });

  it('replaces the form with a thank-you once the message is sent', async () => {
    const action = async (): Promise<ContactState> => ({ status: 'sent' });
    render(<ContactForm action={action} />);
    fill();
    fireEvent.click(screen.getByRole('button', { name: /Send/ }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/Thank you/));
    expect(screen.queryByRole('button', { name: /Send/ })).not.toBeInTheDocument();
  });
});
