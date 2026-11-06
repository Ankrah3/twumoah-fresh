import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { Storefront } from '../src/components/Storefront';
import { dateAfter } from '../src/shared/dates';

async function setup() {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    url: 'https://catering.example/',
  });
  const window = dom.window;
  for (const [key, value] of Object.entries({
    window,
    document: window.document,
    HTMLElement: window.HTMLElement,
    HTMLInputElement: window.HTMLInputElement,
    HTMLDialogElement: window.HTMLDialogElement,
    localStorage: window.localStorage,
    requestAnimationFrame: (callback: () => void) => setTimeout(callback, 0),
    cancelAnimationFrame: clearTimeout,
    matchMedia: () => ({ matches: true }),
    IS_REACT_ACT_ENVIRONMENT: true,
  }))
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  window.HTMLElement.prototype.scrollIntoView = function () {};
  window.HTMLElement.prototype.scrollTo = function () {};
  window.HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  window.HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
  const { createRoot } = await import('react-dom/client');
  const root = createRoot(window.document.getElementById('root')!);
  await act(async () => root.render(<Storefront />));
  const $ = <T extends Element = HTMLElement>(selector: string) => {
    const element = window.document.querySelector<T>(selector);
    assert.ok(element, `Missing element: ${selector}`);
    return element;
  };
  async function click(selector: string) {
    await act(async () => {
      $<HTMLElement>(selector).click();
    });
  }
  async function fill(selector: string, value: string) {
    const element = $<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      selector,
    );
    const prototype =
      element instanceof window.HTMLSelectElement
        ? window.HTMLSelectElement.prototype
        : element instanceof window.HTMLTextAreaElement
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')!.set!;
    await act(async () => {
      setter.call(element, value);
      element.dispatchEvent(
        new window.Event(
          element instanceof window.HTMLSelectElement ? 'change' : 'input',
          { bubbles: true },
        ),
      );
    });
  }
  async function submit(selector: string) {
    await act(async () => {
      $(selector).dispatchEvent(
        new window.Event('submit', { bubbles: true, cancelable: true }),
      );
    });
  }
  async function finishAsync() {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    });
  }
  return {
    dom,
    window,
    $,
    click,
    fill,
    submit,
    finishAsync,
    async close() {
      await act(async () => root.unmount());
      dom.window.close();
    },
  };
}

test('React storefront preserves both tabs, validates checkout, and confirms only a local demo', async () => {
  const f = await setup();
  try {
    assert.equal(f.window.document.querySelectorAll('.product').length, 8);
    await f.click('[data-testid="product-gathering"] .add-button');
    assert.equal(f.$('.cart-count').textContent, '1');
    await f.fill('#plan-guests', '12');
    await f.click('#tab-events');
    await f.fill('#event-type', 'Private Party');
    await f.fill('#event-location', 'A very long venue name near the park, Osu, Accra');
    await f.click('#tab-dropoff');
    assert.equal(f.$<HTMLInputElement>('#plan-guests').value, '12');
    assert.equal(f.$('[data-testid="product-gathering"] output').textContent, '1');
    await f.click('#tab-events');
    assert.equal(
      f.$<HTMLInputElement>('#event-location').value,
      'A very long venue name near the park, Osu, Accra',
    );
    assert.equal(f.$<HTMLSelectElement>('#event-type').value, 'Private Party');
    await f.click('#tab-dropoff');
    f.$<HTMLButtonElement>('.cart-button').focus();
    await f.click('.cart-button');
    assert.ok(f.$<HTMLDialogElement>('dialog').open);
    await f.click('dialog .button.primary');
    await f.submit('dialog form');
    assert.ok(f.$('#delivery-date').getAttribute('aria-invalid'));
    await f.fill('#delivery-zone', 'pickup');
    await f.fill('#delivery-date', dateAfter(3));
    await f.fill('#delivery-window', '12-14');
    await f.fill('#delivery-name', 'Demo Host');
    await f.fill('#delivery-email', 'host@example.com');
    await f.fill('#delivery-phone', '0200000000');
    await f.click('dialog .check-label input');
    await f.submit('dialog form');
    await f.finishAsync();
    assert.match(f.$('dialog').textContent!, /Your demo table is set/);
    assert.match(f.$('dialog').textContent!, /No payment was taken/);
    assert.match(f.$('dialog').textContent!, /GHS 960/);
    assert.equal(f.$('.cart-count').textContent, '0');
    await f.click('dialog .close-button');
    assert.equal(f.$<HTMLDialogElement>('dialog').open, false);
    assert.equal(f.window.document.activeElement, f.$('.cart-button'));
  } finally {
    await f.close();
  }
});

test('event navigation preserves preferences, updates quote and previews pending chef approval', async () => {
  const f = await setup();
  try {
    await f.click('#tab-events');
    await f.submit('#panel-events form');
    assert.equal(f.$('#event-type').getAttribute('aria-invalid'), 'true');
    await f.fill('#event-type', 'Wedding');
    await f.fill('#event-date', dateAfter(20));
    await f.fill('#event-guests', '41');
    await f.fill('#event-venue-type', 'Outdoor');
    await f.fill('#event-location', 'Example Gardens, Accra');
    await f.submit('#panel-events form');
    await f.click('[name="package"][value="plated"]');
    await f.click('.staff-toggle:nth-of-type(1) input');
    await f.fill('#event-notes', 'Please review nut allergies.');
    assert.match(f.$('.quote-range').textContent!, /11,370/);
    await f.click('#panel-events .form-actions .secondary');
    assert.equal(f.$<HTMLInputElement>('#event-guests').value, '41');
    await f.submit('#panel-events form');
    assert.ok(f.$<HTMLInputElement>('[value="plated"]').checked);
    assert.equal(
      f.$<HTMLTextAreaElement>('#event-notes').value,
      'Please review nut allergies.',
    );
    await f.submit('#panel-events form');
    assert.match(
      f.$('.approval-notice').textContent!,
      /confirmed only after manual approval/,
    );
    await f.submit('#panel-events form');
    assert.equal(f.$('#event-name').getAttribute('aria-invalid'), 'true');
    await f.fill('#event-name', 'Demo Host');
    await f.fill('#event-email', 'host@example.com');
    await f.fill('#event-phone', '0200000000');
    await f.click('#panel-events .check-label input');
    await f.submit('#panel-events form');
    await f.finishAsync();
    assert.match(f.$('.event-success').textContent!, /Pending chef approval/);
    assert.match(f.$('.event-success').textContent!, /EVENT-[A-Z0-9]+/);
    assert.match(f.$('.event-success').textContent!, /No payment was taken/);
    assert.match(
      f.$('.event-success').textContent!,
      /No request was sent or saved remotely/,
    );
  } finally {
    await f.close();
  }
});

test('tabs support arrow keys, cart Escape returns focus, images fall back locally', async () => {
  const f = await setup();
  try {
    f.$<HTMLButtonElement>('#tab-dropoff').focus();
    await act(async () =>
      f
        .$('#tab-dropoff')
        .dispatchEvent(
          new f.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
        ),
    );
    assert.equal(f.$('#tab-events').getAttribute('aria-selected'), 'true');
    assert.equal(f.window.document.activeElement, f.$('#tab-events'));
    f.$<HTMLButtonElement>('.cart-button').focus();
    await f.click('.cart-button');
    await act(async () =>
      f.$('dialog').dispatchEvent(new f.window.Event('cancel', { cancelable: true })),
    );
    assert.equal(f.$<HTMLDialogElement>('dialog').open, false);
    assert.equal(f.window.document.activeElement, f.$('.cart-button'));
    await act(async () => f.$('.product img').dispatchEvent(new f.window.Event('error')));
    assert.ok(
      f.$<HTMLImageElement>('.product img').src.endsWith('/assets/food-fallback.svg'),
    );
  } finally {
    await f.close();
  }
});
