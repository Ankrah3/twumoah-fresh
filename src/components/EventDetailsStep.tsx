import * as React from 'react';
import { STORE_CONFIG } from '@/shared/config';
import { dateAfter } from '@/shared/dates';
import type { EventRequest, FieldErrors } from '@/shared/types';
import { InputField, SelectField } from './Fields';

interface Props {
  value: EventRequest;
  errors: FieldErrors<EventRequest>;
  onChange: (value: EventRequest) => void;
}

export function EventDetailsStep({ value, errors, onChange }: Props) {
  return (
    <div className="form-grid">
      <SelectField
        id="event-type"
        label="Event type *"
        required
        wide
        value={value.eventType}
        error={errors.eventType}
        onChange={(event) =>
          onChange({
            ...value,
            eventType: event.target.value as EventRequest['eventType'],
          })
        }
        options={[
          { value: '', label: 'Choose your occasion' },
          ...['Wedding', 'Corporate Event', 'Private Party', 'Other'].map((item) => ({
            value: item,
            label: item,
          })),
        ]}
      />
      <InputField
        id="event-date"
        label="Event date *"
        type="date"
        required
        min={dateAfter(STORE_CONFIG.eventLeadDays)}
        value={value.date}
        error={errors.date}
        hint="Mock policy: at least 14 days’ notice."
        onChange={(event) => onChange({ ...value, date: event.target.value })}
      />
      <InputField
        id="event-guests"
        label="Estimated guest count *"
        type="number"
        required
        min={STORE_CONFIG.minimumEventGuests}
        max={STORE_CONFIG.maximumGuests}
        value={value.guests}
        error={errors.guests}
        hint="Gatherings of 20–200 people."
        onChange={(event) => onChange({ ...value, guests: event.target.value })}
      />
      <SelectField
        id="event-venue-type"
        label="Venue type *"
        required
        value={value.venueType}
        error={errors.venueType}
        onChange={(event) =>
          onChange({
            ...value,
            venueType: event.target.value as EventRequest['venueType'],
          })
        }
        options={[
          { value: '', label: 'Choose a venue type' },
          ...['Indoor', 'Outdoor', 'Residential'].map((item) => ({
            value: item,
            label: item,
          })),
        ]}
      />
      <InputField
        id="event-location"
        label="Venue location *"
        required
        maxLength={200}
        value={value.venueLocation}
        error={errors.venueLocation}
        hint="An area in Accra is fine if the venue is undecided."
        onChange={(event) => onChange({ ...value, venueLocation: event.target.value })}
      />
    </div>
  );
}
