import * as React from 'react';
import { MOCK_EVENT_PRICING } from '@/shared/config';
import { formatMoney } from '@/shared/pricing';
import type { EventRequest, FieldErrors, PackageId, StaffingId } from '@/shared/types';
import { TextareaField } from './Fields';

interface Props {
  value: EventRequest;
  errors: FieldErrors<EventRequest>;
  onChange: (value: EventRequest) => void;
}

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-free', 'Nut allergy'];

export function EventPreferencesStep({ value, errors, onChange }: Props) {
  return (
    <div>
      <fieldset className="m-0 border-0 p-0">
        <legend className="options-label mt-0!">Catering package *</legend>
        <div className="service-options">
          {(Object.keys(MOCK_EVENT_PRICING.packages) as PackageId[]).map((id) => {
            const item = MOCK_EVENT_PRICING.packages[id];
            return (
              <label key={id} className="option-card">
                <input
                  type="radio"
                  name="package"
                  value={id}
                  checked={value.packageId === id}
                  onChange={() => onChange({ ...value, packageId: id })}
                  required
                />
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.description}</small>
                </span>
                <span>
                  {formatMoney(item.pricePerGuest)}
                  <small>per guest</small>
                </span>
              </label>
            );
          })}
        </div>
        {errors.packageId && (
          <p className="error" role="alert">
            {errors.packageId}
          </p>
        )}
      </fieldset>
      <fieldset className="m-0 mt-6 border-0 p-0">
        <legend className="options-label">The people who bring it together</legend>
        <p className="mb-3 text-xs text-muted">
          Optional staffing, for up to {MOCK_EVENT_PRICING.includedServiceHours} hours.
          The estimate adapts to your guest count.
        </p>
        {(Object.keys(MOCK_EVENT_PRICING.staffing) as StaffingId[]).map((id) => {
          const option = MOCK_EVENT_PRICING.staffing[id];
          return (
            <label className="staff-toggle" key={id}>
              <span>
                <strong>{option.label}</strong>
                <small>
                  {formatMoney(option.pricePerStaff)} per staff member · 1 per{' '}
                  {option.guestsPerStaff} guests
                </small>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={value.staffing[id]}
                onChange={(event) =>
                  onChange({
                    ...value,
                    staffing: { ...value.staffing, [id]: event.target.checked },
                  })
                }
              />
            </label>
          );
        })}
      </fieldset>
      <fieldset className="m-0 mt-6 border-0 p-0">
        <legend className="options-label">Dietary requirements</legend>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {DIETARY_OPTIONS.map((option) => (
            <label className="check-label mt-0!" key={option}>
              <input
                type="checkbox"
                checked={value.dietaryRequirements.includes(option)}
                onChange={(event) =>
                  onChange({
                    ...value,
                    dietaryRequirements: event.target.checked
                      ? [...value.dietaryRequirements, option]
                      : value.dietaryRequirements.filter((item) => item !== option),
                  })
                }
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
        <p className="receipt-note">
          Allergies and dietary needs must be reviewed by the chef. Selection does not
          guarantee an allergen-free kitchen.
        </p>
      </fieldset>
      <div className="mt-6">
        <TextareaField
          id="event-notes"
          label="Optional notes"
          maxLength={1500}
          value={value.notes}
          onChange={(event) => onChange({ ...value, notes: event.target.value })}
          hint="Tell us about your allergies, accessibility needs, or the atmosphere you have in mind."
        />
      </div>
    </div>
  );
}
