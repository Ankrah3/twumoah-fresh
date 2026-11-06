'use client';

import * as React from 'react';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, LockKeyhole } from 'lucide-react';
import { MOCK_DELIVERY_PRICING, STORE_CONFIG } from '@/shared/config';
import { dateAfter, getAvailableDeliveryWindows } from '@/shared/dates';
import { calculateCart, formatMoney } from '@/shared/pricing';
import { validateDelivery } from '@/shared/validation';
import type { Cart, DeliveryDetails, FieldErrors } from '@/shared/types';
import { ErrorNotice, InputField, SelectField, TextareaField } from './Fields';
import { OrderTotals } from './OrderTotals';

interface Props {
  cart: Cart;
  details: DeliveryDetails;
  onChange: (details: DeliveryDetails) => void;
  onConfirm: () => Promise<void>;
  busy: boolean;
}

export function DeliveryForm({ cart, details, onChange, onConfirm, busy }: Props) {
  const [errors, setErrors] = useState<FieldErrors<DeliveryDetails>>({});
  const form = useRef<HTMLFormElement>(null);
  const focusErrors = useRef(false);
  const windows = getAvailableDeliveryWindows(details.date);
  const totals = calculateCart(cart, details.zone);

  useEffect(() => {
    if (focusErrors.current) {
      form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      focusErrors.current = false;
    }
  }, [errors]);

  const update = <K extends keyof DeliveryDetails>(key: K, value: DeliveryDetails[K]) => {
    onChange({ ...details, [key]: value });
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  return (
    <form
      ref={form}
      noValidate
      aria-busy={busy}
      onSubmit={async (event) => {
        event.preventDefault();
        const nextErrors = validateDelivery(details);
        focusErrors.current = true;
        setErrors(nextErrors);
        if (!Object.keys(nextErrors).length && totals.canCheckout && !busy)
          await onConfirm();
      }}
    >
      <ErrorNotice visible={Object.values(errors).some(Boolean)} />
      <fieldset disabled={busy} className="m-0 border-0 p-0">
        <legend className="sr-only">Delivery and contact details</legend>
        <SelectField
          id="delivery-zone"
          label="Delivery or collection *"
          value={details.zone}
          onChange={(event) =>
            update('zone', event.target.value as DeliveryDetails['zone'])
          }
          error={errors.zone}
          options={Object.entries(MOCK_DELIVERY_PRICING).map(([value, zone]) => ({
            value,
            label: `${zone.label} · ${zone.fee ? formatMoney(zone.fee) : 'Free'}`,
          }))}
        />
        <div className="form-grid mt-4">
          <InputField
            id="delivery-date"
            label="Delivery date *"
            type="date"
            min={dateAfter(2)}
            value={details.date}
            error={errors.date}
            required
            onChange={(event) => {
              onChange({ ...details, date: event.target.value, window: '' });
              setErrors({});
            }}
          />
          <InputField
            id="delivery-guests"
            label="Number of guests *"
            type="number"
            min={1}
            max={200}
            value={details.guests}
            onChange={(event) => update('guests', event.target.value)}
            error={errors.guests}
            required
          />
        </div>
        <div className="mt-4">
          <SelectField
            id="delivery-window"
            label={
              details.zone === 'pickup'
                ? 'Collection window *'
                : 'Available delivery window *'
            }
            value={details.window}
            error={errors.window}
            required
            onChange={(event) => update('window', event.target.value)}
            hint={`Mock policy: at least ${STORE_CONFIG.deliveryLeadHours} hours’ notice, based on the start of the arrival window. Times are in Accra.`}
            options={[
              {
                value: '',
                label: !details.date
                  ? 'Choose a date first'
                  : windows.length
                    ? 'Choose an available window'
                    : 'No windows — choose a later date',
              },
              ...windows.map((window) => ({ value: window.id, label: window.label })),
            ]}
          />
        </div>
        {details.zone !== 'pickup' ? (
          <>
            <div className="mt-4">
              <InputField
                id="delivery-address"
                label="Street / building address *"
                autoComplete="street-address"
                maxLength={200}
                value={details.addressLine1}
                error={errors.addressLine1}
                required
                onChange={(event) => update('addressLine1', event.target.value)}
              />
            </div>
            <div className="mt-4">
              <InputField
                id="delivery-area"
                label="Area / neighbourhood *"
                autoComplete="address-level2"
                maxLength={100}
                value={details.area}
                error={errors.area}
                required
                onChange={(event) => update('area', event.target.value)}
              />
            </div>
            <div className="mt-4">
              <InputField
                id="delivery-landmark"
                label="Landmark & arrival instructions"
                maxLength={200}
                value={details.addressNotes}
                onChange={(event) => update('addressNotes', event.target.value)}
              />
            </div>
          </>
        ) : (
          <p className="receipt-note">
            Free kitchen collection. In a live service, the team would confirm the kitchen
            address and collection instructions.
          </p>
        )}
        <div className="mt-4">
          <InputField
            id="delivery-name"
            label="Full name *"
            autoComplete="name"
            maxLength={100}
            value={details.name}
            error={errors.name}
            required
            onChange={(event) => update('name', event.target.value)}
          />
        </div>
        <div className="form-grid mt-4">
          <InputField
            id="delivery-email"
            label="Email *"
            type="email"
            autoComplete="email"
            maxLength={200}
            value={details.email}
            error={errors.email}
            required
            onChange={(event) => update('email', event.target.value)}
          />
          <InputField
            id="delivery-phone"
            label="Phone *"
            type="tel"
            autoComplete="tel"
            maxLength={30}
            value={details.phone}
            error={errors.phone}
            required
            onChange={(event) => update('phone', event.target.value)}
          />
        </div>
        <div className="mt-4">
          <TextareaField
            id="delivery-dietary"
            label="Dietary needs & allergy notes"
            maxLength={1500}
            value={details.dietaryNotes}
            onChange={(event) => update('dietaryNotes', event.target.value)}
            hint="Dietary labels are not an allergen-free guarantee. Requirements need kitchen review."
          />
        </div>
        <div className="checkout-summary">
          <OrderTotals cart={cart} zone={details.zone} />
        </div>
        <div className="demo-notice">
          <strong>Frontend checkout demo.</strong> No card details are collected and no
          payment is processed. A production checkout would open a server-created Stripe
          Checkout session. Apple Pay would appear only if supported by that integration
          and the customer’s device.
        </div>
        <label className="check-label">
          <input
            type="checkbox"
            checked={details.demoAcknowledged}
            onChange={(event) => update('demoAcknowledged', event.target.checked)}
            aria-invalid={!!errors.demoAcknowledged}
            aria-describedby={errors.demoAcknowledged ? 'delivery-demo-error' : undefined}
          />
          <span>I understand this is a local demo. No real order will be placed.</span>
        </label>
        {errors.demoAcknowledged && (
          <p className="error" id="delivery-demo-error">
            {errors.demoAcknowledged}
          </p>
        )}
        <button
          type="submit"
          className="button primary full mt-5"
          disabled={busy || !totals.canCheckout}
        >
          {busy ? 'Preparing your demo order…' : 'Confirm Demo Checkout'}
          <ArrowUpRight size={17} aria-hidden="true" />
        </button>
        <p className="secure-caption">
          <LockKeyhole size={12} aria-hidden="true" /> Secure checkout via Stripe{' '}
          <span>· integration point</span>
        </p>
      </fieldset>
    </form>
  );
}
