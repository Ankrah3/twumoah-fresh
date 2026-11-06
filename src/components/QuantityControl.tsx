import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { STORE_CONFIG } from '@/shared/config';

interface Props {
  name: string;
  quantity: number;
  onChange: (delta: number) => void;
  addLabel?: string;
}

export function QuantityControl({
  name,
  quantity,
  onChange,
  addLabel = 'Add to Cart',
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const focusAction = useRef<'add' | 'increase' | null>(null);

  useEffect(() => {
    if (!focusAction.current) return;
    container.current
      ?.querySelector<HTMLButtonElement>(
        `[data-quantity-action="${focusAction.current}"]`,
      )
      ?.focus({ preventScroll: true });
    focusAction.current = null;
  }, [quantity]);

  if (!quantity) {
    return (
      <div ref={container}>
        <button
          className="add-button"
          data-quantity-action="add"
          onClick={() => {
            focusAction.current = 'increase';
            onChange(1);
          }}
          aria-label={`Add ${name} to cart`}
        >
          {addLabel}
          <Plus size={16} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={container}
      className="quantity"
      role="group"
      aria-label={`Quantity for ${name}`}
    >
      <button
        type="button"
        onClick={() => {
          if (quantity === 1) focusAction.current = 'add';
          onChange(-1);
        }}
        aria-label={`Remove one ${name}`}
      >
        <Minus size={15} aria-hidden="true" />
      </button>
      <output aria-label={`${name} quantity`}>{quantity}</output>
      <button
        type="button"
        data-quantity-action="increase"
        onClick={() => onChange(1)}
        disabled={quantity >= STORE_CONFIG.maximumItemQuantity}
        aria-label={`Add one ${name}`}
      >
        <Plus size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
