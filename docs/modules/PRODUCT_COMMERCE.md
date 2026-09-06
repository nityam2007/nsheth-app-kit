# Product, catalogue and commerce block

## Users and jobs

Operators prepare a sellable catalogue, manage stock without losing concurrent orders, answer enquiries, and fulfil paid orders. Customers compare product details/options, request quotes, review current prices, order once despite retries, and retain a reference.

## Planned usable baseline

- Product identity: unique optional SKU, brand, unit, collection, tags, structured specifications, ordered HTTPS media with alt text and search metadata.
- Product families: individually identified option products with their own SKU, price and stock, linked to a parent. Existing simple products remain valid. No independently purchasable parent when active options exist.
- Operator workspace: content/media/specification sections, stale-edit conflict detection, copy to a draft, retire/restore, dependency-aware deletion and useful public previews.
- Inventory: locked adjustments with a reason and expected stock/version; movement history for adjustments, orders and cancellation. Prices use minor units. Existing stock is the migration opening balance.
- Customer detail: gallery, specifications, brand/SKU/unit, option choices, availability and purchasing/RFQ paths. Public visibility excludes retired records and hidden parents.
- Orders: immutable line snapshots, idempotent checkout, searchable operational queue, separate payment and fulfilment state, fulfilment only after payment, delivery reference and operational history. Cancellation restores stock exactly once.

## Acceptance checks

Validate image schemes, duplicate specification keys, SKUs and input sizes; reject stale content/stock edits; refuse child cycles; isolate draft/retired products; prevent parent checkout when options exist; preserve dependent orders/enquiries; test duplicate checkout, concurrent stock changes and movement balances. Verify rendered HTTP markup, server operations and unit tests without a browser.

## Copy contract

Copy packages/product and packages/commerce, their app server-function files, product/shop/catalogue/order routes and product components, relevant Prisma models/migrations, identity authorization, safe-error middleware, shared UI controls and cart provider. The final composition manifest will enumerate these dependencies. Database and payment secrets are supplied by the destination app.

## Explicit boundaries

This baseline serves a single operator and currency. A configurable flat delivery fee and tax rate are snapshotted in orders. It does not include a tax jurisdiction engine, carrier APIs, subscriptions, multi-warehouse allocation, marketplace vendors, returns/RMA or automated disputes. Offline payment is explicitly recorded by an authorized operator; Stripe is optional. A real project must configure shipping/tax policy and live provider callbacks before launch. These limitations remain visible rather than being counted as completed features.

Checkout recovery closes absent attempts under the same database lock as order creation, so delayed requests cannot create a second order after restart. Only opaque key hashes are stored. Existing product families retain independently stockable option records; activate them in the normal product and sale forms.
