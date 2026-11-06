'use client';

import * as React from 'react';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CookingPot,
  LockKeyhole,
  Trash2,
  X,
} from 'lucide-react';
import { MOCK_DELIVERY_PRICING } from '@/shared/config';
import { DELIVERY_WINDOWS, formatDate } from '@/shared/dates';
import { previewCheckout } from '@/shared/demo';
import { calculateCart, formatMoney } from '@/shared/pricing';
import type { Cart, DeliveryDetails, DemoConfirmation } from '@/shared/types';
import { DeliveryForm } from './DeliveryForm';
import { FoodImage } from './FoodImage';
import { OrderTotals } from './OrderTotals';
import { QuantityControl } from './QuantityControl';

interface Props {
  open: boolean;
  cart: Cart;
  delivery: DeliveryDetails;
  onClose: () => void;
  onQuantityChange: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onDeliveryChange: (delivery: DeliveryDetails) => void;
  onComplete: () => void;
}

interface OrderPreview extends DemoConfirmation {
  total: number;
  count: number;
  date: string;
  window: string;
  zoneLabel: string;
}

export function CartDialog({
  open,
  cart,
  delivery,
  onClose,
  onQuantityChange,
  onRemove,
  onDeliveryChange,
  onComplete,
}: Props) {
  const element = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [view, setView] = useState<'cart' | 'delivery' | 'success'>('cart');
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<OrderPreview | null>(null);
  const totals = calculateCart(cart, delivery.zone);

  useEffect(() => {
    const dialog = element.current;
    if (!open || !dialog) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setView('cart');
    dialog.showModal();
    closeButton.current?.focus();
    return () => {
      dialog.close();
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open]);

  function changeView(next: 'cart' | 'delivery') {
    setView(next);
    requestAnimationFrame(() => {
      element.current?.scrollTo(0, 0);
      heading.current?.focus();
    });
  }

  async function confirmDemo() {
    setBusy(true);
    try {
      const result = await previewCheckout(cart, delivery);
      setPreview({
        ...result,
        total: totals.total,
        count: totals.count,
        date: delivery.date,
        window:
          DELIVERY_WINDOWS.find((window) => window.id === delivery.window)?.label || '',
        zoneLabel: MOCK_DELIVERY_PRICING[delivery.zone].label,
      });
      setView('success');
      onComplete();
      requestAnimationFrame(() => {
        element.current?.scrollTo(0, 0);
        heading.current?.focus();
      });
    } finally {
      setBusy(false);
    }
  }

  function remove(id: string) {
    onRemove(id);
    requestAnimationFrame(() => heading.current?.focus());
  }

  return (
    <dialog
      ref={element}
      className="cart-dialog"
      aria-labelledby="cart-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(event) => {
        if (busy || event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose();
      }}
    >
      <div className="sheet-handle" aria-hidden="true" />
      <div className="dialog-top">
        <span className="eyebrow">SAFFRON & TABLE</span>
        <button
          ref={closeButton}
          className="close-button"
          onClick={onClose}
          disabled={busy}
          aria-label="Close cart"
        >
          <X size={20} />
        </button>
      </div>
      {view === 'cart' && (
        <>
          <div className="receipt-heading">
            <h2
              ref={heading}
              className="dialog-title mb-0!"
              id="cart-dialog-title"
              tabIndex={-1}
            >
              Your table
            </h2>
            <span>{String(totals.count).padStart(2, '0')}</span>
          </div>
          {totals.count ? (
            <div className="cart-items">
              {totals.items.map(({ platter, quantity, lineTotal }) => (
                <article
                  key={platter.id}
                  className="cart-item"
                  aria-label={`${platter.name} in cart`}
                >
                  <FoodImage src={platter.image} alt={platter.imageAlt} />
                  <div className="min-w-0 flex-1">
                    <div className="cart-line-top">
                      <strong>{platter.name}</strong>
                      <span className="whitespace-nowrap">{formatMoney(lineTotal)}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {quantity} {platter.id === 'lemonade' ? 'bottle' : 'tray'}
                      {quantity > 1 ? 's' : ''} · Serves {platter.serves * quantity}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <QuantityControl
                        name={platter.name}
                        quantity={quantity}
                        onChange={(delta) =>
                          quantity === 1 && delta < 0
                            ? remove(platter.id)
                            : onQuantityChange(platter.id, delta)
                        }
                      />
                      <button
                        className="remove-item"
                        onClick={() => remove(platter.id)}
                        aria-label={`Remove ${platter.name} from cart`}
                      >
                        <Trash2 size={14} aria-hidden="true" /> Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-cart">
              <CookingPot size={48} aria-hidden="true" />
              <strong>Your table is waiting.</strong>
              <p>Choose a platter and start putting your spread together.</p>
              <button className="button secondary mt-5" onClick={onClose}>
                Explore the menu <ArrowUpRight size={16} aria-hidden="true" />
              </button>
            </div>
          )}
          <OrderTotals cart={cart} zone={delivery.zone} />
          <p className="receipt-note">
            {totals.minimumRemaining
              ? `Add ${formatMoney(totals.minimumRemaining)} more to reach the food minimum.`
              : 'All mock prices include applicable charges.'}
          </p>
          <button
            className="button primary full mt-5"
            disabled={!totals.canCheckout}
            onClick={() => changeView('delivery')}
          >
            Continue to Checkout <ArrowUpRight size={17} aria-hidden="true" />
          </button>
          <p className="secure-caption">
            <LockKeyhole size={12} aria-hidden="true" /> Secure checkout via Stripe
          </p>
          <p className="receipt-policy">Frontend demo · No payment connection</p>
        </>
      )}
      {view === 'delivery' && (
        <>
          <button
            className="checkout-back inline-flex items-center gap-2"
            onClick={() => changeView('cart')}
            disabled={busy}
          >
            <ArrowLeft size={14} aria-hidden="true" /> Back to your table
          </button>
          <h2 ref={heading} className="dialog-title" id="cart-dialog-title" tabIndex={-1}>
            The little details.
          </h2>
          <p className="dialog-subtitle">
            Your spread, at the right place and the right time.
          </p>
          <DeliveryForm
            cart={cart}
            details={delivery}
            onChange={onDeliveryChange}
            onConfirm={confirmDemo}
            busy={busy}
          />
        </>
      )}
      {view === 'success' && preview && (
        <div className="success">
          <span className="success-symbol">
            <Check aria-hidden="true" />
          </span>
          <p className="eyebrow">LOCAL DEMO CONFIRMATION</p>
          <h2 ref={heading} id="cart-dialog-title" tabIndex={-1}>
            Your demo table is set.
          </h2>
          <div className="success-reference">
            <strong>{preview.reference}</strong>
            <br />
            {formatDate(preview.date)} · {preview.window}
            <br />
            {preview.zoneLabel}
            <br />
            {preview.count} trays / bottles · {formatMoney(preview.total)}
          </div>
          <p>
            No payment was taken. No real order was placed, emailed or saved remotely.
            Your delivery date has not been reserved.
          </p>
          <button className="button primary" onClick={onClose}>
            Back to the menu <ArrowUpRight size={17} aria-hidden="true" />
          </button>
        </div>
      )}
    </dialog>
  );
}
