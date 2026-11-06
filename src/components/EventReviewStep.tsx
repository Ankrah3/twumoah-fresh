import * as React from 'react';
import { MOCK_EVENT_PRICING } from '@/shared/config';
import { formatDate } from '@/shared/dates';
import type { EventRequest, FieldErrors, StaffingId } from '@/shared/types';
import { InputField } from './Fields';

export const APPROVAL_NOTICE =
  'Submitting this form sends a request to the chef. Your date and booking are confirmed only after manual approval. No payment is taken when you submit.';

interface Props {
  value: EventRequest;
  errors: FieldErrors<EventRequest>;
  onChange: (value: EventRequest) => void;
}

export function EventRequestSummary({ value }: { value: EventRequest }) {
  const staffing =
    (Object.keys(value.staffing) as StaffingId[])
      .filter((id) => value.staffing[id])
      .map((id) => MOCK_EVENT_PRICING.staffing[id].label)
      .join(', ') || 'No staffing selected';
  return (
    <dl className="review-details">
      <div>
        <dt>OCCASION</dt>
        <dd>{value.eventType}</dd>
      </div>
      <div>
        <dt>WHEN</dt>
        <dd>{formatDate(value.date)}</dd>
      </div>
      <div>
        <dt>GUESTS & VENUE</dt>
        <dd>
          {value.guests} guests · {value.venueType}
          <br />
          {value.venueLocation}
        </dd>
      </div>
      <div>
        <dt>PACKAGE</dt>
        <dd>{MOCK_EVENT_PRICING.packages[value.packageId].name}</dd>
      </div>
      <div>
        <dt>STAFFING</dt>
        <dd>{staffing}</dd>
      </div>
      <div>
        <dt>DIETARY REQUIREMENTS</dt>
        <dd>{value.dietaryRequirements.join(', ') || 'None specified'}</dd>
      </div>
      {value.notes && (
        <div className="col-span-full">
          <dt>YOUR NOTES</dt>
          <dd className="whitespace-pre-wrap">{value.notes}</dd>
        </div>
      )}
    </dl>
  );
}

export function EventReviewStep({ value, errors, onChange }: Props) {
  return (
    <div>
      <EventRequestSummary value={value} />
      <div className="form-grid">
        <InputField
          id="event-name"
          label="Full name *"
          required
          wide
          autoComplete="name"
          maxLength={100}
          value={value.fullName}
          error={errors.fullName}
          onChange={(event) => onChange({ ...value, fullName: event.target.value })}
        />
        <InputField
          id="event-email"
          label="Email *"
          type="email"
          required
          autoComplete="email"
          maxLength={200}
          value={value.email}
          error={errors.email}
          onChange={(event) => onChange({ ...value, email: event.target.value })}
        />
        <InputField
          id="event-phone"
          label="Phone *"
          type="tel"
          required
          autoComplete="tel"
          maxLength={30}
          value={value.phone}
          error={errors.phone}
          onChange={(event) => onChange({ ...value, phone: event.target.value })}
        />
      </div>
      <div className="approval-notice">
        <strong>How booking approval works</strong>
        <p>{APPROVAL_NOTICE}</p>
      </div>
      <p className="demo-notice">
        <strong>You’re using a local demo.</strong> The action below only previews that
        process. It does not send a request, save your information remotely, or reserve
        your date.
      </p>
      <label className="check-label">
        <input
          type="checkbox"
          checked={value.demoAcknowledged}
          onChange={(event) =>
            onChange({ ...value, demoAcknowledged: event.target.checked })
          }
          aria-invalid={!!errors.demoAcknowledged}
          aria-describedby={errors.demoAcknowledged ? 'event-demo-error' : undefined}
        />
        <span>
          I understand the approval process and that this submission is a local demo.
        </span>
      </label>
      {errors.demoAcknowledged && (
        <p className="error" id="event-demo-error">
          {errors.demoAcknowledged}
        </p>
      )}
    </div>
  );
}
