import { PLATTERS } from './catalog';
import { MOCK_DELIVERY_PRICING, MOCK_EVENT_PRICING, STORE_CONFIG } from './config';
import type {
  Cart,
  DeliveryZone,
  EventQuote,
  EventRequest,
  QuoteLine,
  StaffingId,
} from './types';

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat(STORE_CONFIG.locale, {
    style: 'currency',
    currency: STORE_CONFIG.currency,
    currencyDisplay: 'code',
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\u00a0/g, ' ');
}

export function sanitizeCart(raw: unknown): Cart {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const cart: Cart = {};
  for (const platter of PLATTERS) {
    const quantity = Number((raw as Record<string, unknown>)[platter.id]);
    if (Number.isInteger(quantity) && quantity > 0) {
      cart[platter.id] = Math.min(quantity, STORE_CONFIG.maximumItemQuantity);
    }
  }
  return cart;
}

export function changeCartQuantity(cart: Cart, id: string, delta: number): Cart {
  const next = sanitizeCart(cart);
  if (!PLATTERS.some((platter) => platter.id === id) || !Number.isInteger(delta))
    return next;
  const quantity = Math.min(
    STORE_CONFIG.maximumItemQuantity,
    Math.max(0, (next[id] || 0) + delta),
  );
  if (quantity) next[id] = quantity;
  else delete next[id];
  return next;
}

export function calculateCart(cart: Cart, zone: DeliveryZone) {
  const quantities = sanitizeCart(cart);
  const items = PLATTERS.filter((platter) => quantities[platter.id]).map((platter) => ({
    platter,
    quantity: quantities[platter.id],
    lineTotal: platter.price * quantities[platter.id],
  }));
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const fee = MOCK_DELIVERY_PRICING[zone]?.fee ?? MOCK_DELIVERY_PRICING.central.fee;
  const deliveryFee = count ? fee : 0;
  return {
    items,
    count,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    minimumRemaining: Math.max(0, STORE_CONFIG.minimumFoodOrder - subtotal),
    canCheckout: subtotal >= STORE_CONFIG.minimumFoodOrder,
  };
}

export function calculateEventQuote(request: EventRequest): EventQuote {
  const parsed = Number(request.guests);
  const guestCount =
    Number.isInteger(parsed) &&
    parsed >= STORE_CONFIG.minimumEventGuests &&
    parsed <= STORE_CONFIG.maximumGuests
      ? parsed
      : 0;
  if (!guestCount) return { guestCount: 0, lines: [], low: 0, high: 0 };
  const selectedPackage = MOCK_EVENT_PRICING.packages[request.packageId];
  const lines: QuoteLine[] = [
    {
      id: 'food',
      label: selectedPackage.name,
      description: `${guestCount} guests × ${formatMoney(selectedPackage.pricePerGuest)}`,
      amount: guestCount * selectedPackage.pricePerGuest,
    },
  ];
  for (const id of Object.keys(MOCK_EVENT_PRICING.staffing) as StaffingId[]) {
    if (!request.staffing[id]) continue;
    const option = MOCK_EVENT_PRICING.staffing[id];
    const staffCount = Math.ceil(guestCount / option.guestsPerStaff);
    lines.push({
      id,
      label: `${option.label} (${staffCount})`,
      description: `${staffCount} × ${formatMoney(option.pricePerStaff)} · up to ${MOCK_EVENT_PRICING.includedServiceHours} hours`,
      amount: staffCount * option.pricePerStaff,
    });
  }
  const low = lines.reduce((sum, line) => sum + line.amount, 0);
  return {
    guestCount,
    lines,
    low,
    high: Math.ceil(low * MOCK_EVENT_PRICING.estimateUpperMultiplier),
  };
}
