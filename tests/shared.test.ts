import test from 'node:test';
import assert from 'node:assert/strict';
import { PLATTERS } from '../src/shared/catalog';
import {
  INITIAL_DELIVERY,
  INITIAL_EVENT,
  MOCK_EVENT_PRICING,
  STORE_CONFIG,
} from '../src/shared/config';
import { dateAfter, getAvailableDeliveryWindows, isValidDate } from '../src/shared/dates';
import {
  calculateCart,
  calculateEventQuote,
  changeCartQuantity,
  sanitizeCart,
} from '../src/shared/pricing';
import { validateDelivery, validateEventStep } from '../src/shared/validation';
import { previewBookingRequest, previewCheckout } from '../src/shared/demo';
import type { DeliveryDetails, EventRequest } from '../src/shared/types';

const now = new Date('2026-11-06T12:00:00Z');

test('catalog has at least six realistic, priced platters with local images', () => {
  assert.ok(PLATTERS.length >= 6);
  assert.equal(new Set(PLATTERS.map((item) => item.id)).size, PLATTERS.length);
  for (const item of PLATTERS) {
    assert.ok(item.price > 0 && item.serves > 0);
    assert.ok(item.image.startsWith('/assets/'));
    assert.ok(item.description.length > 30 && item.allergenNote);
  }
});

test('cart sanitizes stored data, caps quantities, removes at zero and rejects unknown items', () => {
  assert.deepEqual(
    sanitizeCart({ chicken: 2, salad: -1, cake: 1.5, unknown: 100, hummus: 999 }),
    { chicken: 2, hummus: 99 },
  );
  assert.deepEqual(sanitizeCart(null), {});
  assert.deepEqual(changeCartQuantity({ chicken: 1 }, 'chicken', -1), {});
  assert.deepEqual(changeCartQuantity({}, 'unknown', 1), {});
  assert.equal(changeCartQuantity({ chicken: 99 }, 'chicken', 1).chicken, 99);
});

test('subtotal, minimum and each delivery total are correct', () => {
  const cart = { chicken: 1, salad: 1 };
  assert.equal(calculateCart(cart, 'central').subtotal, 600);
  assert.equal(calculateCart(cart, 'central').total, 650);
  assert.equal(calculateCart(cart, 'greater').total, 690);
  assert.equal(calculateCart(cart, 'pickup').total, 600);
  assert.equal(calculateCart(cart, 'central').canCheckout, true);
  assert.equal(calculateCart({ salad: 1 }, 'central').minimumRemaining, 420);
  assert.equal(calculateCart({}, 'central').deliveryFee, 0);
});

test('Accra date rules and available delivery windows enforce a real 48-hour lead time', () => {
  assert.equal(dateAfter(2, now), '2026-11-08');
  assert.equal(isValidDate('2026-02-30', '2026-01-01'), false);
  assert.deepEqual(getAvailableDeliveryWindows('2026-11-07', now), []);
  assert.deepEqual(
    getAvailableDeliveryWindows('2026-11-08', now).map((window) => window.id),
    ['12-14', '14-16', '16-18'],
  );
  assert.deepEqual(
    getAvailableDeliveryWindows('2026-11-08', new Date('2026-11-06T18:01:00Z')),
    [],
  );
  assert.equal(getAvailableDeliveryWindows('2026-11-09', now).length, 4);
});

const validDelivery: DeliveryDetails = {
  ...INITIAL_DELIVERY,
  date: '2026-11-08',
  window: '12-14',
  name: 'Demo Host',
  email: 'host@example.com',
  phone: '0200000000',
  addressLine1: '24 Example Lane',
  area: 'Osu',
  demoAcknowledged: true,
};

test('delivery validates address, schedule, guests, contact and demo acknowledgment', () => {
  assert.deepEqual(validateDelivery(validDelivery, now), {});
  assert.ok(validateDelivery({ ...validDelivery, window: '10-12' }, now).window);
  const invalid = validateDelivery({ ...INITIAL_DELIVERY, guests: '2.5' }, now);
  for (const key of [
    'date',
    'window',
    'guests',
    'addressLine1',
    'area',
    'name',
    'email',
    'phone',
    'demoAcknowledged',
  ])
    assert.ok(invalid[key as keyof DeliveryDetails]);
  assert.deepEqual(
    validateDelivery(
      { ...validDelivery, zone: 'pickup', addressLine1: '', area: '' },
      now,
    ),
    {},
  );
});

const validEvent: EventRequest = {
  ...INITIAL_EVENT,
  eventType: 'Wedding',
  date: '2026-11-20',
  guests: '41',
  venueType: 'Outdoor',
  venueLocation: 'Example Gardens, Accra',
  fullName: 'Demo Host',
  email: 'host@example.com',
  phone: '0200000000',
  demoAcknowledged: true,
  staffing: { bartenders: false, servers: true, cleanup: false },
};

test('event estimate itemizes packages and rounded staffing with an explicit range', () => {
  const first = calculateEventQuote(validEvent);
  assert.equal(first.low, 41 * 165 + 3 * 450);
  assert.equal(
    first.high,
    Math.ceil(first.low * MOCK_EVENT_PRICING.estimateUpperMultiplier),
  );
  assert.equal(first.lines.find((line) => line.id === 'servers')?.amount, 1350);
  const full = calculateEventQuote({
    ...validEvent,
    packageId: 'plated',
    staffing: { bartenders: true, servers: true, cleanup: true },
  });
  assert.equal(full.low, 41 * 220 + 2 * 500 + 3 * 450 + 300);
  assert.equal(full.lines.length, 4);
  assert.equal(calculateEventQuote({ ...validEvent, guests: '19' }).low, 0);
  assert.equal(calculateEventQuote({ ...validEvent, guests: '201' }).high, 0);
});

test('every event step validates before advancement and enforces date and count bounds', () => {
  for (const step of [1, 2, 3])
    assert.deepEqual(validateEventStep(validEvent, step, now), {});
  assert.ok(validateEventStep({ ...validEvent, guests: '19' }, 1, now).guests);
  assert.ok(validateEventStep({ ...validEvent, guests: '201' }, 1, now).guests);
  assert.ok(validateEventStep({ ...validEvent, date: '2026-11-19' }, 1, now).date);
  assert.ok(
    validateEventStep({ ...validEvent, venueLocation: '' }, 1, now).venueLocation,
  );
  assert.ok(validateEventStep({ ...validEvent, venueType: '' }, 1, now).venueType);
  assert.ok(
    validateEventStep(
      { ...validEvent, email: 'invalid', demoAcknowledged: false },
      3,
      now,
    ).email,
  );
  assert.equal(STORE_CONFIG.currency, 'GHS');
});

test('demo adapters return local references and pending approval without making requests', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = () => {
    throw new Error('Demo must never send a network request');
  };
  try {
    const checkout = await previewCheckout({ gathering: 1 }, validDelivery);
    assert.match(checkout.reference, /^ST-[A-Z0-9]+$/);
    const booking = await previewBookingRequest(validEvent);
    assert.match(booking.reference, /^EVENT-[A-Z0-9]+$/);
    assert.equal(booking.status, 'Pending chef approval');
  } finally {
    globalThis.fetch = original;
  }
});
