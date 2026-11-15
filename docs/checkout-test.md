# Inula checkout test

Branch: feat/inula-checkout-test. Do not merge or promote to production.

## Choice
Stripe hosted Checkout sends card entry to Stripe; our function receives product IDs, quantities and reward codes only. PayPal Standard Sandbox is also compatible with Vercel, but requires its own SDK, order creation and capture flow. Payment Links alone do not cover the existing dynamic cart/reward rules as directly.
Sources: https://docs.stripe.com/payments/checkout and https://developer.paypal.com/studio/checkout/standard/integrate

## Implemented
The existing request-order flow remains available. A separate test checkout link reads its cart and saved rewards. POST /api/checkout validates quantities (integers 0–20), product IDs and allowed codes; prices are 1200/5600 EUR cents from the server. Client prices and percentages are ignored. INULA05 may combine with one of RACCOLTO10/15/20, additive maximum 25%, as an explicit provisional test rule. Mystery gift is retained as test metadata. Original prices are divisible such that all allowed discounts yield exact integer cents.

Quotes work without credentials. A payment session requires CHECKOUT_ENABLED=test and an sk_test_ key. Production is blocked even with test keys. The return page retrieves the session from Stripe, verifies test mode and application metadata, and reports paid only when Stripe reports paid. Query-string success alone cannot confirm payment. Same-origin JSON requests only; no-store responses; fixed Stripe API destination; validated redirect destination; stable, cart-bound idempotency key; bounded payload and timeouts. No card data, key or customer address is returned or logged.

## Configuration proposed for approval — NOT connected
Only on the Vercel Preview environment, scoped to this branch:
- CHECKOUT_ENABLED=test
- STRIPE_SECRET_KEY: a sandbox/test secret, entered privately in Vercel; never in chat, browser JS or repository.
- CHECKOUT_ORIGIN: exact HTTPS preview origin, without trailing slash; otherwise the function uses VERCEL_URL automatically.

No public key is needed for hosted redirect. No live key is accepted. Never add these variables to Production. Current connector can see the bottegadiserste team but lists no projects; the known project ID returns 404, so deployment has not been verified.

## Validation
Run npm test and npm run dev. Visit http://localhost:4173, add products, open test checkout. Unit/API tests mock Stripe and require no credentials. After approval and configuration, use only Stripe test cards and fictitious customer details: test success, decline, cancellation and retry manually. Documentation: https://docs.stripe.com/testing . Do not use real card details.

## Explicit limits before live commerce
This is a test integration, not a production-ready order system. Browser rewards cannot prove gameplay or first-order eligibility. Before live commerce, add authenticated/server-issued reward evidence, durable single-use redemption and order storage, signed webhook processing with deduplication, fulfillment, rate limiting, stock checks and confirmed shipping/tax/terms/refund rules. No webhook or fulfillment side effect is implemented here, and no order is sent or shipped. Test shipping is deliberately 0 EUR, restricted to Italy, and clearly labeled simulated. Confirm whether the 5% and harvest rewards really stack before live use. The test page is currently Italian; existing IT/EN/JA cart and game remain intact. Merchant Center is deferred.
