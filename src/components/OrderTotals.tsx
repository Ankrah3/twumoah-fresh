import * as React from 'react';
import { calculateCart, formatMoney } from '@/shared/pricing';
import type { Cart, DeliveryZone } from '@/shared/types';

export function OrderTotals({ cart, zone }: { cart: Cart; zone: DeliveryZone }) {
  const totals = calculateCart(cart, zone);

  return (
    <dl className="m-0">
      <div className="receipt-row">
        <dt>Food subtotal</dt>
        <dd>{formatMoney(totals.subtotal)}</dd>
      </div>
      <div className="receipt-row">
        <dt>{zone === 'pickup' ? 'Kitchen collection' : 'Delivery fee'}</dt>
        <dd>
          {!totals.count
            ? '—'
            : totals.deliveryFee
              ? formatMoney(totals.deliveryFee)
              : 'Free'}
        </dd>
      </div>
      <div className="receipt-row total">
        <dt>Total</dt>
        <dd className="font-semibold">{formatMoney(totals.total)}</dd>
      </div>
    </dl>
  );
}
