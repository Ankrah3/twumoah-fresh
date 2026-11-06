import { MOCK_DELIVERY_PRICING, MOCK_EVENT_PRICING, STORE_CONFIG } from './config';
import { dateAfter, getAvailableDeliveryWindows, isValidDate } from './dates';
import type { DeliveryDetails, EventRequest, FieldErrors } from './types';

const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const validPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').length;
  return digits >= 9 && digits <= 15;
};

export function validateDelivery(
  details: DeliveryDetails,
  now = new Date(),
): FieldErrors<DeliveryDetails> {
  const errors: FieldErrors<DeliveryDetails> = {};
  if (!(details.zone in MOCK_DELIVERY_PRICING))
    errors.zone = 'Choose a delivery area or collection.';
  if (!isValidDate(details.date, dateAfter(2, now)))
    errors.date = 'Choose a date at least two days ahead.';
  if (
    !getAvailableDeliveryWindows(details.date, now).some(
      (window) => window.id === details.window,
    )
  ) {
    errors.window = 'Choose an available arrival window at least 48 hours from now.';
  }
  const guests = Number(details.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > STORE_CONFIG.maximumGuests) {
    errors.guests = 'Enter a guest count from 1 to 200.';
  }
  if (details.zone !== 'pickup') {
    if (details.addressLine1.trim().length < 5)
      errors.addressLine1 = 'Enter the street, building or delivery address.';
    if (details.area.trim().length < 2) errors.area = 'Enter your area or neighbourhood.';
  }
  if (details.name.trim().length < 2) errors.name = 'Enter your full name.';
  if (!validEmail(details.email)) errors.email = 'Enter a valid email address.';
  if (!validPhone(details.phone)) errors.phone = 'Enter a phone number with 9–15 digits.';
  if (!details.demoAcknowledged)
    errors.demoAcknowledged = 'Acknowledge that this checkout is a demo.';
  return errors;
}

export function validateEventStep(
  request: EventRequest,
  step: number,
  now = new Date(),
): FieldErrors<EventRequest> {
  const errors: FieldErrors<EventRequest> = {};
  if (step === 1) {
    if (
      !['Wedding', 'Corporate Event', 'Private Party', 'Other'].includes(
        request.eventType,
      )
    )
      errors.eventType = 'Choose an event type.';
    if (!isValidDate(request.date, dateAfter(STORE_CONFIG.eventLeadDays, now)))
      errors.date = 'Choose a date at least 14 days ahead.';
    const guests = Number(request.guests);
    if (
      !Number.isInteger(guests) ||
      guests < STORE_CONFIG.minimumEventGuests ||
      guests > STORE_CONFIG.maximumGuests
    )
      errors.guests = 'Enter 20–200 guests.';
    if (!['Indoor', 'Outdoor', 'Residential'].includes(request.venueType))
      errors.venueType = 'Choose a venue type.';
    if (request.venueLocation.trim().length < 3)
      errors.venueLocation = 'Enter a venue name or location in Accra.';
  }
  if (step === 2 && !(request.packageId in MOCK_EVENT_PRICING.packages))
    errors.packageId = 'Choose a catering package.';
  if (step === 3) {
    if (request.fullName.trim().length < 2) errors.fullName = 'Enter your full name.';
    if (!validEmail(request.email)) errors.email = 'Enter a valid email address.';
    if (!validPhone(request.phone))
      errors.phone = 'Enter a phone number with 9–15 digits.';
    if (!request.demoAcknowledged)
      errors.demoAcknowledged = 'Acknowledge that this is a local demo request.';
  }
  return errors;
}
