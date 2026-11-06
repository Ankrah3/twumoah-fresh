# Saffron & Table

A customer-facing catering demo built with **Next.js App Router, React, TypeScript,
Tailwind CSS and Lucide React**. The original design research, editorial direction and
seven local food photographs are retained. See [DESIGN.md](DESIGN.md) for the reference
matrix and visual brief.

## Run locally

Use Node.js 20.9 or newer and npm.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. For a production preview:

```sh
npm run build
npm start
```

The app exports to `out/` for static hosting. No backend, payment account, environment
variables or external image services are needed for the demo.

```sh
npm run check         # TypeScript and shared-logic / React DOM tests
npm run format:check  # Verify readable formatting
npm run format       # Format source after editing
```

## Structure

| Location                   | Responsibility                                                          |
| -------------------------- | ----------------------------------------------------------------------- |
| `src/app/`                 | App Router entry points, metadata, Tailwind theme and editorial styles  |
| `src/components/`          | Semantic web UI, accessible tabs, cart dialog, delivery and event steps |
| `src/shared/types.ts`      | Platform-independent domain types                                       |
| `src/shared/catalog.ts`    | Realistic mock menu data                                                |
| `src/shared/config.ts`     | Currency, mock prices, service policies and initial values              |
| `src/shared/pricing.ts`    | Cart arithmetic and event quote ranges                                  |
| `src/shared/dates.ts`      | Accra calendar and available delivery-window calculations               |
| `src/shared/validation.ts` | Delivery and per-step event validation                                  |
| `src/shared/demo.ts`       | Explicit local demo adapters and future integration boundaries          |
| `public/assets/`           | Optimized local food images and illustrated image fallback              |

The shared modules contain no React, Next.js, browser or DOM imports. Copy them into an
Expo project or extract them into a shared package. The web presentation uses semantic
HTML with Flexbox and Grid; it is intentionally separate from a future native UI.

## Behaviour

- Two accessible tabs stay mounted, preserving filters, cart, delivery draft, event
  step, preferences, contact details and local confirmation while switching.
- Eight platters have images, fallback, ingredient notes, portions and prices.
  Add becomes a quantity stepper. The floating cart shows count and food subtotal.
- Native modal cart: drawer on desktop, bottom sheet on mobile, Escape support,
  initial focus, focus restoration, quantity controls and removal.
- GHS 600 food minimum; Central Accra GHS 50, Greater Accra GHS 90 or free collection.
  Available arrival windows enforce an actual 48-hour lead time. Address, date,
  window, guest count and contact information are validated.
- Three-step event request: event and venue details; package, staffing and dietary
  preferences; contact and review. Values survive Back/Continue and tab changes.
- Event estimates itemize food and selected staffing, rounding staff counts up by
  guest ratio. The upper range adds a configurable 15% allowance. The visible label
  is “Indicative estimate — final pricing follows chef review.”
- A valid event submission shows a mock reference, summary and **Pending chef
  approval**. No request is sent or saved remotely, no date is reserved and no
  payment is taken. Contact and dietary data remain in memory only.
- Only cart and non-personal planning details persist in local storage. The original
  prototype's stored cart is migrated when present.

## Integration points

**Stripe:** replace `previewCheckout` in `src/shared/demo.ts` with a request to a secure
server endpoint that validates product IDs, current prices, delivery and availability,
then creates a Stripe Checkout session. Add webhook-based fulfilment and idempotency.
Never put a Stripe secret in client code or accept raw card details here. Apple Pay
must be provided conditionally by the real payment integration when available; the
demo does not render a working payment option.

**Chef requests:** replace `previewBookingRequest` with a secure server adapter. Repeat
validation, persist the request, issue a reference and notify the chef. Manual approval
must confirm availability and the final quote before a booking is confirmed. The
current adapter only returns a local mock result.

**Configuration:** change `STORE_CONFIG.currency` and locale in `src/shared/config.ts`
for the single storefront currency. All amounts, minimums, fees and staffing rates are
mock configuration. Review real menu portions, allergens, areas, lead times, pricing
and privacy/retention rules before launch.

## Verification and limits

TypeScript, the production static build, formatting, and eleven automated tests check
the shared calculations and React interactions. Tests cover tab preservation, cart
minimums and delivery fees, available windows, invalid fields, event steps, staffing
ranges, local demo success, keyboard tabs, Escape/focus return and image fallback.
The demo adapters are tested with network requests disallowed.

React tests run in jsdom. They do not verify CSS layout, native dialog focus trapping,
mobile keyboards or actual browser screenshots. Responsive styles cover 360px upward,
including 390px and 1440px layouts, but rendered inspection at those widths remains
unverified: no browser is connected and the Windows Computer Use helper is unavailable.
Firecrawl installation was requested; its connection was not confirmed.

Images were generated for this concept, not photographed from a real operator's menu.
They are stored locally and have no external runtime dependency. There are no real
customer orders, payments, chef notifications or remote booking records.
