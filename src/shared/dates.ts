import { STORE_CONFIG } from './config';

export function dateAfter(days: number, now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: STORE_CONFIG.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)!.value;
  const date = new Date(`${value('year')}-${value('month')}-${value('day')}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function isValidDate(value: string, minimum: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(+date) &&
    date.toISOString().slice(0, 10) === value &&
    value >= minimum
  );
}

export function formatDate(value: string): string {
  if (!isValidDate(value, '2000-01-01')) return 'Date to be chosen';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: STORE_CONFIG.timeZone,
  }).format(new Date(`${value}T12:00:00Z`));
}

export const DELIVERY_WINDOWS = [
  { id: '10-12', label: '10:00–12:00', start: '10:00' },
  { id: '12-14', label: '12:00–14:00', start: '12:00' },
  { id: '14-16', label: '14:00–16:00', start: '14:00' },
  { id: '16-18', label: '16:00–18:00', start: '16:00' },
] as const;

export function getAvailableDeliveryWindows(date: string, now = new Date()) {
  if (!isValidDate(date, dateAfter(2, now))) return [];
  const threshold = +now + STORE_CONFIG.deliveryLeadHours * 60 * 60 * 1000;
  // Accra is UTC year-round. Keep delivery times independent of the device's zone.
  return DELIVERY_WINDOWS.filter(
    (window) => +new Date(`${date}T${window.start}:00Z`) >= threshold,
  );
}
