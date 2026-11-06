'use client';

import * as React from 'react';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, Clock3 } from 'lucide-react';
import { INITIAL_EVENT } from '@/shared/config';
import { previewBookingRequest } from '@/shared/demo';
import { calculateEventQuote, formatMoney } from '@/shared/pricing';
import { validateEventStep } from '@/shared/validation';
import type { DemoConfirmation, EventRequest, FieldErrors } from '@/shared/types';
import { ErrorNotice } from './Fields';
import { FoodImage } from './FoodImage';
import { EventDetailsStep } from './EventDetailsStep';
import { EventPreferencesStep } from './EventPreferencesStep';
import { EventQuote } from './EventQuote';
import { EventRequestSummary, EventReviewStep } from './EventReviewStep';

const STEPS = [
  {
    label: 'Event details',
    title: 'What are we gathering for?',
    intro: 'Start with your occasion. A few details help shape the right experience.',
  },
  {
    label: 'Service preferences',
    title: 'How would you like to share?',
    intro: 'Choose a starting point. Your final menu would be tailored with the chef.',
  },
  {
    label: 'Contact & review',
    title: 'Let’s put a name to the occasion.',
    intro:
      'Review your request, then leave a way for the chef to reach you in a live service.',
  },
];

export function EventRequestForm() {
  const [value, setValue] = useState<EventRequest>(INITIAL_EVENT);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<FieldErrors<EventRequest>>({});
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<DemoConfirmation | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const successHeading = useRef<HTMLHeadingElement>(null);
  const quote = calculateEventQuote(value);

  useEffect(() => {
    if (Object.values(errors).some(Boolean))
      form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [errors]);

  function change(next: EventRequest) {
    setValue(next);
  }

  function goToStep(next: number) {
    setErrors({});
    setStep(next);
    requestAnimationFrame(() => heading.current?.focus());
  }

  async function submit() {
    const currentErrors = validateEventStep(value, step);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length) return;
    if (step < 3) {
      goToStep(step + 1);
      return;
    }
    for (const previousStep of [1, 2]) {
      const previousErrors = validateEventStep(value, previousStep);
      if (Object.keys(previousErrors).length) {
        setStep(previousStep);
        setErrors(previousErrors);
        return;
      }
    }
    setBusy(true);
    try {
      setSuccess(await previewBookingRequest(value));
      requestAnimationFrame(() => successHeading.current?.focus());
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="event-section wrap">
      <div className="event-intro">
        <div>
          <p className="eyebrow">FULL-SERVICE EVENTS</p>
          <h2>
            Your occasion.
            <br />
            Our undivided attention.
          </h2>
          <p>
            From the first welcome to the last plate. Tell us what you have in mind, and
            we’ll help bring it to the table.
          </p>
          <div className="event-facts">
            <span>20–200 guests</span>
            <span>14 days’ notice</span>
            <span>Chef-reviewed requests</span>
          </div>
        </div>
        <FoodImage
          src="/assets/gathering.jpg"
          alt="A generous sharing spread for a catered occasion"
        />
      </div>
      <div className="event-layout">
        <div className="min-w-0">
          <ol className="steps" aria-label="Booking request progress">
            {STEPS.map((item, index) => (
              <li
                key={item.label}
                className={!success && step === index + 1 ? 'active' : ''}
                aria-current={!success && step === index + 1 ? 'step' : undefined}
              >
                {success || step > index + 1 ? (
                  <Check size={13} aria-label="Complete" />
                ) : (
                  String(index + 1).padStart(2, '0')
                )}
                <span>{item.label}</span>
              </li>
            ))}
          </ol>
          {success ? (
            <div className="event-success">
              <span className="success-symbol">
                <Check aria-hidden="true" />
              </span>
              <p className="eyebrow">LOCAL DEMO REQUEST</p>
              <h2 ref={successHeading} tabIndex={-1}>
                Your occasion is taking shape.
              </h2>
              <p className="pending-status" role="status">
                <Clock3 size={16} aria-hidden="true" /> Pending chef approval
              </p>
              <p className="my-4 text-sm">
                Mock reference <strong>{success.reference}</strong> · {value.fullName}
              </p>
              <EventRequestSummary value={value} />
              <p className="text-sm">
                Indicative range:{' '}
                <strong>
                  {formatMoney(quote.low)} – {formatMoney(quote.high)}
                </strong>
              </p>
              <div className="demo-notice mt-5">
                <strong>No payment was taken.</strong> This success state exists only on
                this page. No request was sent or saved remotely, and your date has not
                been reserved. In a live service, the chef would need to review and
                manually approve your request.
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  className="button secondary"
                  onClick={() => {
                    setSuccess(null);
                    goToStep(1);
                  }}
                >
                  Edit request
                </button>
                <button
                  className="button primary"
                  onClick={() => {
                    setValue({
                      ...INITIAL_EVENT,
                      staffing: { ...INITIAL_EVENT.staffing },
                      dietaryRequirements: [],
                    });
                    setSuccess(null);
                    goToStep(1);
                  }}
                >
                  Plan another occasion <ArrowUpRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : (
            <form
              ref={form}
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                if (!busy) void submit();
              }}
              aria-busy={busy}
            >
              <h3 className="form-title" ref={heading} tabIndex={-1}>
                {STEPS[step - 1].title}
              </h3>
              <p className="form-intro">{STEPS[step - 1].intro}</p>
              <ErrorNotice visible={Object.values(errors).some(Boolean)} />
              <fieldset disabled={busy} className="m-0 border-0 p-0">
                <legend className="sr-only">{STEPS[step - 1].label}</legend>
                {step === 1 && (
                  <EventDetailsStep value={value} errors={errors} onChange={change} />
                )}
                {step === 2 && (
                  <EventPreferencesStep value={value} errors={errors} onChange={change} />
                )}
                {step === 3 && (
                  <EventReviewStep value={value} errors={errors} onChange={change} />
                )}
                <div className="form-actions">
                  {step > 1 ? (
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => goToStep(step - 1)}
                    >
                      <ArrowLeft size={15} aria-hidden="true" /> Back
                    </button>
                  ) : (
                    <span className="receipt-note">* Required details</span>
                  )}
                  <button className="button primary" type="submit" disabled={busy}>
                    {busy
                      ? 'Preparing demo request…'
                      : step === 3
                        ? 'Submit Booking Request'
                        : 'Continue'}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </fieldset>
            </form>
          )}
        </div>
        <EventQuote value={value} />
      </div>
    </div>
  );
}
