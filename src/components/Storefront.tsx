'use client';

import * as React from 'react';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ShoppingBag, Sun } from 'lucide-react';
import { INITIAL_DELIVERY, MOCK_DELIVERY_PRICING } from '@/shared/config';
import { dateAfter, isValidDate } from '@/shared/dates';
import {
  calculateCart,
  changeCartQuantity,
  formatMoney,
  sanitizeCart,
} from '@/shared/pricing';
import type { Cart, DeliveryDetails, ServiceMode } from '@/shared/types';
import { CartDialog } from './CartDialog';
import { DropOffStore } from './DropOffStore';
import { EventRequestForm } from './EventRequestForm';
import { FoodImage } from './FoodImage';

const STORAGE_KEY = 'saffron-table-v2';

export function Storefront() {
  const [mode, setMode] = useState<ServiceMode>('dropoff');
  const [cart, setCart] = useState<Cart>({});
  const [delivery, setDelivery] = useState<DeliveryDetails>(INITIAL_DELIVERY);
  const [cartOpen, setCartOpen] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totals = calculateCart(cart, delivery.zone);

  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(STORAGE_KEY) || localStorage.getItem('saffron-table-v1');
      if (raw) {
        const saved = JSON.parse(raw);
        setCart(sanitizeCart(saved.cart));
        setDelivery((previous) => ({
          ...previous,
          zone: saved.zone in MOCK_DELIVERY_PRICING ? saved.zone : 'central',
          date: isValidDate(saved.date || '', dateAfter(2)) ? saved.date : '',
          guests:
            Number.isInteger(Number(saved.guests)) &&
            saved.guests >= 1 &&
            saved.guests <= 200
              ? String(saved.guests)
              : '10',
        }));
      }
    } catch {
      /* Storage is optional. Ordering still works in memory. */
    }
    setStorageReady(true);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          cart,
          zone: delivery.zone,
          date: delivery.date,
          guests: delivery.guests,
        }),
      );
    } catch {
      /* Private-browsing storage restrictions do not block the demo. */
    }
  }, [cart, delivery.zone, delivery.date, delivery.guests, storageReady]);

  function selectMode(next: ServiceMode, scroll = false) {
    setMode(next);
    if (scroll)
      requestAnimationFrame(() =>
        document.getElementById('service-choices')?.scrollIntoView({
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'instant'
            : 'smooth',
        }),
      );
  }

  function updateQuantity(id: string, delta: number) {
    setCart((previous) => changeCartQuantity(previous, id, delta));
    setAnnouncement(
      delta > 0
        ? 'A little more good food added to your table.'
        : 'Your table has been updated.',
    );
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAnnouncement(''), 2600);
  }

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="announcement">
        A little less hosting. A little more gathering.
        <span>Made for your table, in Accra.</span>
      </div>
      <header className="header wrap">
        <a className="brand" href="#" aria-label="Saffron and Table home">
          <Sun aria-hidden="true" />
          <span>
            saffron <i>&</i> table<small>FOOD MADE FOR GATHERING</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a
            className={mode === 'dropoff' ? 'active' : ''}
            href="#service-choices"
            onClick={(event) => {
              event.preventDefault();
              selectMode('dropoff', true);
            }}
          >
            Our menu
          </a>
          <a
            className={mode === 'events' ? 'active' : ''}
            href="#service-choices"
            onClick={(event) => {
              event.preventDefault();
              selectMode('events', true);
            }}
          >
            Full-service events
          </a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <button
          className="cart-button"
          onClick={() => setCartOpen(true)}
          aria-haspopup="dialog"
        >
          <ShoppingBag size={18} aria-hidden="true" /> Your table{' '}
          <span className="cart-count">{totals.count}</span>
        </button>
      </header>

      <main id="main">
        <section className="hero wrap" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="short-rule" />
              FROM OUR KITCHEN TO YOUR PEOPLE
            </p>
            <h1 id="hero-title">
              Good food.
              <br />
              Better <em>together.</em>
            </h1>
            <p>
              Seasonal spreads, generous portions, and something
              <br className="desktop" /> for everyone. We’ll bring the food. You bring the
              people.
            </p>
            <button
              className="button primary"
              onClick={() => selectMode('dropoff', true)}
            >
              Find your feast <ArrowUpRight size={17} aria-hidden="true" />
            </button>
            <div className="hero-note">
              <Sun size={20} className="text-gold" aria-hidden="true" /> Office lunches.
              Long tables. Just-because gatherings.
            </div>
          </div>
          <figure className="hero-photo">
            <FoodImage
              src="/assets/gathering.jpg"
              alt="Lemon herb chicken, hummus, fresh salad and flatbread served for sharing"
              priority
            />
            <figcaption>
              <span>THE ART OF A FULL TABLE</span>
              <span>Pass a plate. Stay a while.</span>
            </figcaption>
          </figure>
        </section>

        <div
          id="service-choices"
          className="services wrap"
          role="tablist"
          aria-label="Catering service"
          onKeyDown={(event) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const next: ServiceMode =
              event.key === 'Home'
                ? 'dropoff'
                : event.key === 'End'
                  ? 'events'
                  : mode === 'dropoff'
                    ? 'events'
                    : 'dropoff';
            setMode(next);
            event.currentTarget.querySelector<HTMLButtonElement>(`#tab-${next}`)?.focus();
          }}
        >
          <button
            id="tab-dropoff"
            className={`service ${mode === 'dropoff' ? 'selected' : ''}`}
            role="tab"
            aria-selected={mode === 'dropoff'}
            aria-controls="panel-dropoff"
            tabIndex={mode === 'dropoff' ? 0 : -1}
            onClick={() => selectMode('dropoff')}
          >
            <span className="service-number">01</span>
            <span>
              <strong>Drop-off catering</strong>
              <small>Good food, dropped off. Ready when you are.</small>
            </span>
            <span className="service-tail">
              Order your spread <ArrowUpRight size={18} aria-hidden="true" />
            </span>
          </button>
          <button
            id="tab-events"
            className={`service ${mode === 'events' ? 'selected' : ''}`}
            role="tab"
            aria-selected={mode === 'events'}
            aria-controls="panel-events"
            tabIndex={mode === 'events' ? 0 : -1}
            onClick={() => selectMode('events')}
          >
            <span className="service-number">02</span>
            <span>
              <strong>Full-service event request</strong>
              <small>A whole occasion, considered around you.</small>
            </span>
            <span className="service-tail">
              Plan an event <ArrowUpRight size={18} aria-hidden="true" />
            </span>
          </button>
        </div>

        <section
          id="panel-dropoff"
          role="tabpanel"
          aria-labelledby="tab-dropoff"
          hidden={mode !== 'dropoff'}
          tabIndex={0}
        >
          <DropOffStore
            cart={cart}
            delivery={delivery}
            onDeliveryChange={setDelivery}
            onQuantityChange={updateQuantity}
            onOpenCart={() => setCartOpen(true)}
          />
        </section>
        <section
          id="panel-events"
          role="tabpanel"
          aria-labelledby="tab-events"
          hidden={mode !== 'events'}
          tabIndex={0}
        >
          <EventRequestForm />
        </section>

        <section className="how-section wrap" id="how-it-works">
          <p className="eyebrow">LESS TO DO. MORE TO ENJOY.</p>
          <h2>Gathering, made simple.</h2>
          <div className="how-grid">
            <article>
              <span>01 / CHOOSE</span>
              <h3>Build your table.</h3>
              <p>
                Mix your favourite mains and sides, or begin a request for a full-service
                event.
              </p>
            </article>
            <article>
              <span>02 / MAKE IT YOURS</span>
              <h3>Tell us the details.</h3>
              <p>
                Pick your date, tell us where, and share the needs of the people around
                your table.
              </p>
            </article>
            <article>
              <span>03 / GATHER</span>
              <h3>Leave room for seconds.</h3>
              <p>
                Drop-off food is made for sharing. Event requests are reviewed by the chef
                before a booking is approved.
              </p>
            </article>
          </div>
        </section>
        <section className="faq wrap" aria-labelledby="faq-title">
          <h2 id="faq-title">A few things you might be wondering.</h2>
          <details>
            <summary>How much food should I order?</summary>
            <p>
              Each dish lists its serving size. For ten people, try two main trays serving
              six each and two side trays serving eight each. Portions vary with appetites
              and how many dishes you share.
            </p>
          </details>
          <details>
            <summary>What’s included in drop-off catering?</summary>
            <p>
              Food comes in serving trays. Central Accra delivery is{' '}
              {formatMoney(MOCK_DELIVERY_PRICING.central.fee)} and Greater Accra is{' '}
              {formatMoney(MOCK_DELIVERY_PRICING.greater.fee)}. Kitchen collection is
              free. Plates, cutlery and on-site staff are not included. These are mock
              service policies.
            </p>
          </details>
          <details>
            <summary>Does an event request reserve my date?</summary>
            <p>
              No. The chef must review availability, dietary needs and a final quote
              before manually approving a real booking. This demo sends no request,
              reserves no date and takes no payment.
            </p>
          </details>
        </section>
      </main>
      <footer className="footer">
        <div className="wrap">
          <a className="footer-brand" href="#">
            saffron <i>&</i> table
          </a>
          <p>
            For the everyday. For the occasion.
            <br />
            Always for the people.
          </p>
          <span>
            ACCRA, GHANA<small>Interactive concept · No real orders or bookings</small>
          </span>
        </div>
      </footer>
      <button
        className="floating-cart"
        onClick={() => setCartOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Open cart, ${totals.count} items, subtotal ${formatMoney(totals.subtotal)}`}
      >
        <span className="flex items-center gap-3">
          <ShoppingBag size={18} aria-hidden="true" />
          Your table <b className="cart-count">{totals.count}</b>
        </span>
        <span>
          {formatMoney(totals.subtotal)} <small>subtotal</small>{' '}
          <ArrowUpRight size={17} aria-hidden="true" />
        </span>
      </button>
      <CartDialog
        open={cartOpen}
        cart={cart}
        delivery={delivery}
        onClose={() => setCartOpen(false)}
        onQuantityChange={updateQuantity}
        onRemove={(id) =>
          setCart((previous) => {
            const next = { ...previous };
            delete next[id];
            return next;
          })
        }
        onDeliveryChange={setDelivery}
        onComplete={() => {
          setCart({});
          setDelivery((previous) => ({
            ...INITIAL_DELIVERY,
            zone: previous.zone,
            date: previous.date,
            guests: previous.guests,
          }));
        }}
      />
      <div
        className={`toast ${announcement ? 'visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        {announcement}
      </div>
    </>
  );
}
