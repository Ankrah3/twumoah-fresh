import type { DemoConfirmation, DeliveryDetails, EventRequest, Cart } from './types';

function createReference(prefix: string): DemoConfirmation {
  return {
    reference: `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  };
}

/** Web and Expo can replace this adapter with a server-created Stripe Checkout session.
 * The server must revalidate products, prices and availability. Never send raw card data.
 * Apple Pay should only be exposed by the integrated provider when eligible.
 */
export async function previewCheckout(_cart: Cart, _delivery: DeliveryDetails) {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return createReference('ST');
}

/** Local-only preview. A production adapter must persist and notify the chef securely. */
export async function previewBookingRequest(_request: EventRequest) {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return { ...createReference('EVENT'), status: 'Pending chef approval' as const };
}
