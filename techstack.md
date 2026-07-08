# Technical Architecture Document - Fresh Mart

## 1. Technical Stack Overview

Fresh Mart is architected for maximum client performance, immediate reactivity, and simple deployment. The selected components provide an ideal foundation for a hyper-local e-commerce catalog combined with a high-density, real-time store management system.

| Layer | Technology | Version | Purpose / Justification |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (React) | v14+ (App Router) | Hybrid static/server rendering for search engine crawlability and client-side page transitions. |
| **Styling Engine** | Tailwind CSS | v3+ | Utility-first styling enabling high density layouts and custom light-mode design tokens without CSS bloat. |
| **Animation Engine** | Framer Motion | v11+ | Smooth, declarative micro-interactions, layout transitions, and filter adjustments. |
| **State Management** | Zustand | v4+ | Ultra-lightweight, reactive global state outside the React render tree to prevent store-floor mutation lags. |
| **Analytics Visualization**| Recharts | v2+ | Declarative SVG charting optimized for React hydration and layout adaptability. |
| **Barcode Processing** | Custom JS Token Parser | N/A | High-speed parser converting physical barcode gun carriage-return feeds and CSV buffers into catalog items. |

---

## 2. Architecture & Directory Blueprint

The project follows a standard Next.js App Router structure optimized for separating storefront and store administration spaces:

```text
src/
├── app/
│   ├── layout.tsx             # Root layout with global styling and typography
│   ├── page.tsx               # Customer storefront index (catalog, fuzzy search, cart)
│   ├── admin/
│   │   ├── page.tsx           # Store operations hub (inventory intake, live modifications)
│   │   ├── orders/
│   │   │   └── page.tsx       # Real-time order monitoring desk
│   │   └── analytics/
│   │       └── page.tsx       # Gross revenue analytical desk
│   └── api/                   # (Optional) Next.js route handlers for backend integrations
├── components/
│   ├── storefront/            # Storefront-specific UI (ProductCard, SearchBar, CartDrawer)
│   ├── admin/                 # Admin-specific UI (BarcodeIntake, ProductRow, AnalyticalDesk)
│   └── shared/                # Common visual tokens (Button, Input, Skeletons)
├── store/
│   └── useStore.ts            # Central Zustand store managing cart, inventory, and order queues
└── utils/
    └── barcodeParser.ts       # Raw text stream tokenization and CSV parsing logic
```

---

## 3. Global State & Sync Strategy (Zustand)

To prevent operational friction (e.g., an item being added to a cart that was just set to 0 stock by an admin, or an admin missing a new order), a centralized **Zustand store** acts as the client-side single source of truth.

### 3.1 Store Schema Design
The global state store is defined to synchronize changes instantly across all pages:
*   **`products` Array**: Each product holds fields for ID, barcode, name, category, price, stock levels, and a short description.
*   **`cart` Map/Array**: Tracks line items added by customers. Quantity adjustments instantly perform differential assertions against the active product's stock levels.
*   **`orders` Queue**: An array of active orders. Each order captures customer data (Name, Phone, Address), Pickup Time Window, Payment route choice, items list, subtotal, status, and creation timestamps.
*   **`analytics` Dataset**: A seed of transaction timestamps, order values, and gross sales mapped over day, week, month, and year aggregates.

### 3.2 Dynamic Synchronization Logic
1.  **Cart Additions / Mutations**: Adding a product checks `product.stock`. If `requestedQty <= product.stock`, the cart state increases and the product's available visual stock updates or displays alerts.
2.  **Admin Intake Updates**: Modifying a product's stock inline or importing items via barcode scanner updates the `products` state. The catalog updates instantly. If an item's stock drops below what a customer has in their active cart, the cart dynamically downscales to match available stock.
3.  **Checkout to Order Queue**: Submitting checkout empties the customer cart, decreases the actual product stock permanent values in `products`, creates a new order object with a state of `Pending`, and prepends it to the `orders` list for immediate visual notification at the Order Monitoring Desk.

---

## 4. Client-Side Barcode Parsing Engine

Physical hardware barcode scanners act as keyboard input emulators. They read a barcode, print the character representation rapidly, and append a carriage return key (`"Enter"`). The custom parser must support two methods of ingestion:

### 4.1 Input Stream Interception
To intercept scans directly:
1.  A global or focused `onKeyDown` listener accumulates alphanumeric sequences.
2.  If the speed of input is faster than standard typing (e.g., character interval < 30ms) or if the stream terminates with a carriage return (`"Enter"`), the text is routed to the parser.
3.  If the scanner is focused on a text area, it parses the buffered block immediately.

### 4.2 Multi-Column Tokenizer (CSV Mode)
Scanners can be configured to dump comma-separated values for bulk item registration. The parsing engine processes inputs in the following formats:
1.  **Single Token (Barcode only)**:
    *   Example: `748019284729`
    *   Action: Searches existing catalog. If found, opens the modification drawer; if not, creates a blank product with that barcode and focuses the name field.
2.  **Multi-Column CSV**:
    *   Example: `880123456789,Organic Gala Apples,Fresh Produce,3.99,120,Crisp sweet red apples`
    *   Format: `[BARCODE],[NAME],[CATEGORY],[PRICE],[STOCK],[DESCRIPTION]`
    *   Action: Tokenizes the string. If fields align, it automatically instantiates or updates the item in the global store array, displaying a success toast.

---

## 5. Analytics Canvas Rendering (Recharts)

The analytical dashboard visualizes financial data dynamically.
*   **Data Structure**: Sales records are bucketed on load or checkout completion into standardized intervals:
    *   **Daily**: Hours (`09:00`, `12:00`, `15:00`, `18:00`, `21:00`)
    *   **Weekly**: Days (`Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`)
    *   **Monthly**: Weeks (`Week 1`, `Week 2`, `Week 3`, `Week 4`)
    *   **Yearly**: Months (`Jan`, `Feb`, `Mar`, ... `Dec`)
*   **Rendering**: SVG paths utilizing Recharts' `<ResponsiveContainer>`, `<AreaChart>`, and `<Tooltip>` structures, colored in Emerald Green fill/stroke vectors (`#10B981`, `#047857`) and smooth cubic ease-out entry animations.
