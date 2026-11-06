'use client';

import * as React from 'react';

import { useState } from 'react';
import { ArrowUpRight, CookingPot, Info, Truck } from 'lucide-react';
import { PLATTERS } from '@/shared/catalog';
import { MOCK_DELIVERY_PRICING, STORE_CONFIG } from '@/shared/config';
import { dateAfter } from '@/shared/dates';
import { calculateCart, formatMoney } from '@/shared/pricing';
import type { Cart, Category, DeliveryDetails, DietaryTag } from '@/shared/types';
import { FoodImage } from './FoodImage';
import { OrderTotals } from './OrderTotals';
import { QuantityControl } from './QuantityControl';

interface Props {
  cart: Cart;
  delivery: DeliveryDetails;
  onQuantityChange: (id: string, delta: number) => void;
  onDeliveryChange: (details: DeliveryDetails) => void;
  onOpenCart: () => void;
}

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'all', label: 'All dishes' },
  { id: 'mains', label: 'Sharing mains' },
  { id: 'sides', label: 'Salads & sides' },
  { id: 'extras', label: 'Sweet & sips' },
];

export function DropOffStore({
  cart,
  delivery,
  onQuantityChange,
  onDeliveryChange,
  onOpenCart,
}: Props) {
  const [category, setCategory] = useState<Category>('all');
  const [diet, setDiet] = useState<DietaryTag | 'all'>('all');
  const totals = calculateCart(cart, delivery.zone);
  const visible = PLATTERS.filter(
    (platter) =>
      (category === 'all' || category === platter.category) &&
      (diet === 'all' || platter.dietary.includes(diet)),
  );

  return (
    <div className="menu-section wrap">
      <div className="section-heading">
        <div>
          <p className="eyebrow">THE DROP-OFF MENU</p>
          <h2>A spread worth sharing.</h2>
        </div>
        <p>
          Prepared for your gathering, ready for your table.
          <br />
          Order {STORE_CONFIG.deliveryLeadHours} hours ahead ·{' '}
          {formatMoney(STORE_CONFIG.minimumFoodOrder)} food minimum
        </p>
      </div>

      <div className="delivery-bar">
        <div className="delivery-intro">
          <Truck aria-hidden="true" />
          <span>
            Let’s set your table<small>Start with the little details</small>
          </span>
        </div>
        <label htmlFor="plan-zone">
          DELIVERING TO
          <select
            id="plan-zone"
            value={delivery.zone}
            onChange={(e) =>
              onDeliveryChange({
                ...delivery,
                zone: e.target.value as DeliveryDetails['zone'],
              })
            }
          >
            {Object.entries(MOCK_DELIVERY_PRICING).map(([id, zone]) => (
              <option value={id} key={id}>
                {zone.label} · {zone.fee ? formatMoney(zone.fee) : 'Free'}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="plan-date">
          YOUR DATE
          <input
            id="plan-date"
            type="date"
            min={dateAfter(2)}
            value={delivery.date}
            onChange={(e) =>
              onDeliveryChange({ ...delivery, date: e.target.value, window: '' })
            }
          />
        </label>
        <label htmlFor="plan-guests">
          GUESTS
          <input
            id="plan-guests"
            type="number"
            min={1}
            max={200}
            value={delivery.guests}
            onChange={(e) => onDeliveryChange({ ...delivery, guests: e.target.value })}
          />
        </label>
      </div>

      <div className="catalog-layout">
        <div className="catalog min-w-0">
          <div className="menu-tools">
            <div className="categories" role="group" aria-label="Menu category">
              {CATEGORIES.map(({ id, label }) => (
                <button
                  key={id}
                  className={category === id ? 'current' : ''}
                  aria-pressed={category === id}
                  onClick={() => setCategory(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="diet-filter">
              <span className="sr-only">Dietary preference</span>
              <select
                value={diet}
                onChange={(e) => setDiet(e.target.value as typeof diet)}
              >
                <option value="all">All dietary needs</option>
                <option value="vegan">Vegan</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="gluten-free">Gluten-free ingredients</option>
              </select>
            </label>
          </div>
          <p className="menu-context">
            <span aria-live="polite">{visible.length} dishes, made to share</span>
            <span>One tray. Plenty to go around.</span>
          </p>
          <div className="product-grid">
            {visible.map((platter) => (
              <article
                key={platter.id}
                className="product"
                data-testid={`product-${platter.id}`}
              >
                <div className="product-image">
                  <FoodImage src={platter.image} alt={platter.imageAlt} />
                  {platter.label && (
                    <span className="product-label">{platter.label}</span>
                  )}
                </div>
                <h3>{platter.name}</h3>
                <p className="product-description">{platter.description}</p>
                <p className="product-diet">{platter.allergenNote}</p>
                <div className="product-footer">
                  <div className="price">
                    {formatMoney(platter.price)}
                    <small>
                      {platter.id === 'lemonade' ? '2 litres' : 'Per tray'} · Serves{' '}
                      {platter.serves}
                    </small>
                  </div>
                  <QuantityControl
                    name={platter.name}
                    quantity={cart[platter.id] || 0}
                    onChange={(delta) => onQuantityChange(platter.id, delta)}
                  />
                </div>
              </article>
            ))}
            {!visible.length && (
              <div className="no-results">
                <h3>A different kind of spread?</h3>
                <p>No dishes match these filters.</p>
                <button
                  className="button secondary"
                  onClick={() => {
                    setCategory('all');
                    setDiet('all');
                  }}
                >
                  Show all dishes
                </button>
              </div>
            )}
          </div>
          <div className="allergy-note">
            <Info aria-hidden="true" className="shrink-0" size={19} />
            <p>
              <strong>A seat for everyone.</strong> Dietary tags describe ingredients. Our
              kitchen handles gluten, nuts, dairy and other allergens. Share your
              requirements at checkout for kitchen review.
            </p>
          </div>
        </div>
        <aside className="order-summary" aria-label="Order summary">
          <div className="receipt-heading">
            <h3>Your table</h3>
            <span>{String(totals.count).padStart(2, '0')}</span>
          </div>
          {totals.count ? (
            <div className="py-4">
              <p className="text-sm">{totals.count} trays / bottles for your gathering</p>
              <button className="text-link mt-2" onClick={onOpenCart}>
                View & edit your order
              </button>
            </div>
          ) : (
            <div className="empty-cart">
              <CookingPot size={42} aria-hidden="true" />
              <strong>A little room for good food.</strong>
              <p>
                Add a dish or two to start your spread.
                <br />
                Everything tastes better shared.
              </p>
            </div>
          )}
          <OrderTotals cart={cart} zone={delivery.zone} />
          <p className="receipt-note">
            {totals.minimumRemaining
              ? `Add ${formatMoney(totals.minimumRemaining)} to meet the food minimum.`
              : 'Your spread is ready for the little details.'}
          </p>
          <button className="button primary full" onClick={onOpenCart}>
            View your cart <ArrowUpRight size={17} aria-hidden="true" />
          </button>
          <p className="receipt-policy">Demo only. No payment will be taken.</p>
        </aside>
      </div>
    </div>
  );
}
