import type { DeliveryDetails, EventRequest } from './types';

export const STORE_CONFIG = {
  currency: 'GHS',
  locale: 'en-GH',
  timeZone: 'Africa/Accra',
  minimumFoodOrder: 600,
  maximumItemQuantity: 99,
  deliveryLeadHours: 48,
  eventLeadDays: 14,
  minimumEventGuests: 20,
  maximumGuests: 200,
} as const;

export const MOCK_DELIVERY_PRICING = {
  central: { label: 'Central Accra', fee: 50 },
  greater: { label: 'Greater Accra', fee: 90 },
  pickup: { label: 'Kitchen collection', fee: 0 },
} as const;

export const MOCK_EVENT_PRICING = {
  packages: {
    sharing: {
      name: 'The sharing table',
      description: 'A generous buffet of two mains, three sides and dessert.',
      pricePerGuest: 165,
    },
    plated: {
      name: 'A seated occasion',
      description: 'A considered three-course menu, plated for each guest.',
      pricePerGuest: 220,
    },
    canapes: {
      name: 'Small bites, big conversations',
      description: 'Eight savoury canapés and two sweet bites per guest.',
      pricePerGuest: 125,
    },
  },
  staffing: {
    bartenders: { label: 'Bartenders', guestsPerStaff: 40, pricePerStaff: 500 },
    servers: { label: 'Servers', guestsPerStaff: 20, pricePerStaff: 450 },
    cleanup: { label: 'Clean-up Crew', guestsPerStaff: 50, pricePerStaff: 300 },
  },
  includedServiceHours: 4,
  estimateUpperMultiplier: 1.15,
} as const;

export const INITIAL_DELIVERY: DeliveryDetails = {
  zone: 'central',
  date: '',
  window: '',
  guests: '10',
  addressLine1: '',
  area: '',
  addressNotes: '',
  name: '',
  email: '',
  phone: '',
  dietaryNotes: '',
  demoAcknowledged: false,
};

export const INITIAL_EVENT: EventRequest = {
  eventType: '',
  date: '',
  guests: '40',
  venueType: '',
  venueLocation: '',
  packageId: 'sharing',
  staffing: { bartenders: false, servers: true, cleanup: false },
  dietaryRequirements: [],
  notes: '',
  fullName: '',
  email: '',
  phone: '',
  demoAcknowledged: false,
};
