import * as React from 'react';
import { MOCK_EVENT_PRICING } from '@/shared/config';
import { formatDate } from '@/shared/dates';
import { calculateEventQuote, formatMoney } from '@/shared/pricing';
import type { EventRequest } from '@/shared/types';

export function EventQuote({ value }: { value: EventRequest }) {
  const quote = calculateEventQuote(value);
  return (
    <aside className="estimate" aria-labelledby="quote-title">
      <p className="eyebrow">A FIRST TASTE OF THE NUMBERS</p>
      <h3 id="quote-title">
        Your occasion,
        <br />
        at a glance.
      </h3>
      <div className="receipt-row">
        <span>{value.eventType || 'Your gathering'}</span>
        <strong>{quote.guestCount || '—'} guests</strong>
      </div>
      <p className="receipt-note">
        {formatDate(value.date)}
        <br />
        {value.venueLocation || 'Your venue in Accra'}
      </p>
      {quote.guestCount ? (
        <>
          <dl className="m-0 mt-5">
            {quote.lines.map((line) => (
              <div className="quote-line" key={line.id}>
                <div className="receipt-row">
                  <dt>{line.label}</dt>
                  <dd className="whitespace-nowrap">{formatMoney(line.amount)}</dd>
                </div>
                <p>{line.description}</p>
              </div>
            ))}
          </dl>
          <div className="quote-range" aria-live="polite" aria-atomic="true">
            <span>Approximate price range</span>
            <strong>
              {formatMoney(quote.low)} – {formatMoney(quote.high)}
            </strong>
          </div>
        </>
      ) : (
        <p className="estimate-empty">Enter 20–200 guests to see your estimate.</p>
      )}
      <p className="estimate-label">
        Indicative estimate — final pricing follows chef review.
      </p>
      <p className="receipt-note">
        Mock rates include selected food and staffing. The upper figure allows{' '}
        {Math.round((MOCK_EVENT_PRICING.estimateUpperMultiplier - 1) * 100)}% for menu
        adjustments. Transport, venue hire, tableware and extra hours require a final
        quote. No payment or date reservation.
      </p>
    </aside>
  );
}
