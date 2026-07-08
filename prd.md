# Product Requirement Document (PRD) - Fresh Mart

## 1. Project Vision & Strategy

### 1.1 Objectives
Fresh Mart is a hyper-local grocery e-commerce and store management platform. The objective is to unify the customer shopping experience and back-of-house store operations under a single, highly performant web application. The platform balances a fast, mobile-friendly storefront with an industrial-grade, metrics-driven admin suite optimized for high-density, real-time retail environments.

### 1.2 User Demographics
*   **Retail Customers:** Locally situated grocery shoppers seeking rapid, friction-free checkout, clear pickup intervals, and precise item availability updates.
*   **Store Operators & Packers:** Store employees managing order fulfillment in real-time, packing items, and updating catalog states from a high-density, quick-action workspace.
*   **Store Managers & Owners:** Business administrators monitoring real-time store throughput, sales velocity, catalog health, and long-term financial analytics.

### 1.3 Value Propositions
*   **Zero-Friction Checkout:** Clean client storefront prioritizing high speed, structured pickup time windows, and instant mock QR payments.
*   **Industrial Inventory Intake:** Support for manual edits and high-throughput barcode scanning gun feeds for rapid bulk item ingestion.
*   **Real-time Synchronization:** Visual and structural state alignment ensuring catalog counts, cart limits, and order updates coordinate seamlessly.
*   **Metrics-Driven Operations:** Clear visibility into gross revenue and operational queues, shifting back-of-house management from guesswork to data-backed decisions.

---

## 2. Customer Epics & User Stories

### Epic 1: Dynamic Categorical Browsing
Customers must be able to explore the catalog across distinct grocery categories (e.g., Produce, Dairy, Bakery, Meat, Pantry) with persistent client-side memory.
*   **User Story 1.1:** As a customer, I want to filter products by clicking category tabs so that I can quickly find items within specific classes.
*   **User Story 1.2:** As a customer, if I navigate away from a category or refresh/interact with an item detail modal, I want my selected category context to remain active so that I don't lose my place in the shopping experience.
*   **User Story 1.3:** As a customer, when categories shift, I want to see a smooth transition to reduce cognitive load.

### Epic 2: Fuzzy Search Engine
A smart client-side search engine must handle natural search behaviors, typos, and broad terms.
*   **User Story 2.1:** As a customer, I want to search for items using broad terms (e.g., "apple" matches Gala Apples, Green Apples, and Apple Juice) and see instant results.
*   **User Story 2.2:** As a customer, I want the search engine to handle minor spelling mistakes (e.g., "bannana" matching "Banana") so that typo mistakes do not break my search flow.
*   **User Story 2.3:** As a customer, I want the search input to have an instant clear button to reset the catalog filter back to the category default.

### Epic 3: Multi-Item Checkout Cart
A reactive cart sidebar that tracks selected items and coordinates item quantities against live inventory stock limits.
*   **User Story 3.1:** As a customer, I want to add items to my cart from the product grid and immediately see the cart indicator update.
*   **User Story 3.2:** As a customer, I want the cart to dynamically restrict my addition of items if I attempt to select more units than are currently available in stock (real-time availability confirmation).
*   **User Story 3.3:** As a customer, I want to modify quantities or remove items directly within the cart drawer with immediate subtotal updates.

### Epic 4: Structured Checkout Flow
A high-integrity checkout process that guarantees valid delivery details and structured operations schedules.
*   **User Story 4.1:** As a customer, I must fill out my Name, Phone Number (validated format), and Delivery/Pickup Address in a clean form.
*   **User Story 4.2:** As a customer, I must select one of the following mandatory, forced Pickup Time Windows to schedule my order pick-up:
    *   `9am-12pm morning`
    *   `12pm-4pm afternoon`
    *   `4pm-7pm evening`
    *   `7pm-11pm night`
*   **User Story 4.3:** As a customer, I want to choose between two payment routes:
    *   **Pay on Pickup:** Complete the order immediately and settle payment at the physical storefront.
    *   **Online via QR Code:** Generate a dynamic mock payment QR code containing the exact order subtotal, showing a loading transition, and confirming receipt once paid.

---

## 3. Admin Epics & User Stories

### Epic 5: High-Throughput Barcode Inventory Intake
A dedicated inventory interface optimized for manual entry and high-velocity hardware barcode scanning feeds.
*   **User Story 5.1:** As an admin, I want to enter new products manually using standard input fields (Name, Category, Price, Stock Count, Short Description, Barcode).
*   **User Story 5.2:** As an admin, I want to place my cursor in a hardware receipt field, pull the trigger on a barcode scanning gun (which feeds raw character input ending with a carriage return/enter), and have the system interpret the scanned string.
*   **User Story 5.3:** As an admin, I want the barcode scanning parser to support multi-column CSV/delimited input strings in the event the scanner is programmed to output formatted data (e.g., `barcode,name,price,stock,category`). The system must instantly parse this text and populate the staging fields or append the product directly.

### Epic 6: Live Product Modification Panel
An inline control panel for modifying existing items in the catalog.
*   **User Story 6.1:** As an admin, I want to modify an existing item's name, category, price, and stock levels inline.
*   **User Story 6.2:** As an admin, I want these modifications to save immediately and propagate back to the customer catalog view without requiring a page reload.

### Epic 7: Real-Time Order Monitoring Desk
A back-of-house dashboard for managing incoming orders in their active queue.
*   **User Story 7.1:** As a packer/admin, I want to see a live visual list of all submitted customer orders, sorted by their selected Pickup Time Window.
*   **User Story 7.2:** As a packer/admin, I want to update an order's status along a strict pipeline: `Pending` -> `Packed` -> `Completed`.
*   **User Story 7.3:** As a packer/admin, I want orders in the `Completed` stage to archive visually, keeping the main queue focused on active fulfillment.

### Epic 8: Analytical Performance Visual Desk
A high-level business intelligence dashboard to evaluate store financial performance.
*   **User Story 8.1:** As a store owner, I want to see a graphical representation of Gross Revenue to analyze performance trends.
*   **User Story 8.2:** As a store owner, I want to toggle between Daily, Weekly, Monthly, and Yearly cycles to view corresponding gross sales trends graphed against time.

---

## 4. Technical Non-Functional Requirements
1.  **Light Mode Theme Constraints:** Standardize the background theme using clean whites (`#FFFFFF`), light grays (`#F9FAFB` to `#E5E7EB`), and organic greens (`#16A34A` or `#15803D`) for headers and primary calls to action. Do not include any dark mode toggles or styles.
2.  **No Layout Shifts (CLS Mitigation):** Product grids, loading queues, and dashboard charts must use native CSS grid properties and explicit layout boundaries. Shimmering skeleton screens must render in place of loading lists to prevent sudden layout shifts.
3.  **Low Latency Search:** Fuzzy matches and categorical filters must execute in under 50ms, relying entirely on memory-cached data arrays.
