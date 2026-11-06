export type ServiceMode = 'dropoff' | 'events';
export type DietaryTag = 'vegan' | 'vegetarian' | 'gluten-free';
export type Category = 'all' | 'mains' | 'sides' | 'extras';

export interface Platter {
  id: string;
  name: string;
  description: string;
  price: number;
  serves: number;
  category: Exclude<Category, 'all'>;
  dietary: DietaryTag[];
  allergenNote: string;
  image: string;
  imageAlt: string;
  label?: string;
}

export type Cart = Record<string, number>;
export type DeliveryZone = 'central' | 'greater' | 'pickup';

export interface DeliveryDetails {
  zone: DeliveryZone;
  date: string;
  window: string;
  guests: string;
  addressLine1: string;
  area: string;
  addressNotes: string;
  name: string;
  email: string;
  phone: string;
  dietaryNotes: string;
  demoAcknowledged: boolean;
}

export type EventType = '' | 'Wedding' | 'Corporate Event' | 'Private Party' | 'Other';
export type VenueType = '' | 'Indoor' | 'Outdoor' | 'Residential';
export type PackageId = 'sharing' | 'plated' | 'canapes';
export type StaffingId = 'bartenders' | 'servers' | 'cleanup';

export interface EventRequest {
  eventType: EventType;
  date: string;
  guests: string;
  venueType: VenueType;
  venueLocation: string;
  packageId: PackageId;
  staffing: Record<StaffingId, boolean>;
  dietaryRequirements: string[];
  notes: string;
  fullName: string;
  email: string;
  phone: string;
  demoAcknowledged: boolean;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export interface QuoteLine {
  id: string;
  label: string;
  description: string;
  amount: number;
}

export interface EventQuote {
  guestCount: number;
  lines: QuoteLine[];
  low: number;
  high: number;
}

export interface DemoConfirmation {
  reference: string;
  createdAt: string;
}
