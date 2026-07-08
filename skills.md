# Developer Skills Assessment Matrix - Fresh Mart

This matrix specifies the engineering competencies required to build, optimize, and maintain the Fresh Mart codebase. Developers working on this codebase should be evaluated against these domains.

---

## 1. Core Software Engineering Competencies

### 1.1 State Synchronization (Zustand & React Reactivity)
The system requires deep knowledge of React state cycles and cross-boundary state updates. State must update instantly between customer actions and admin panels.
*   **Junior Level**: Understands React `useState` and simple prop drilling. Able to write component-level states.
*   **Mid Level**: Familiar with React Context or custom store libraries (Zustand). Can write actions and connect them to triggers.
*   **Senior Level**: Master of Zustand store slices. Understands selectors and render optimization (avoiding unnecessary component re-renders). Experienced in synchronizing decoupled client routing with global caches and executing differential state reconciliation (e.g. automatically updating a customer's cart quantities when an administrator changes product inventory limits).

### 1.2 Custom Hardware Input Interception (Barcode Gun Feeds)
Physical barcode scanners simulate rapid keyboard streams. Developers must write robust handlers to capture scanner data streams without blocking standard typing inputs.
*   **Junior Level**: Able to write basic form `onChange` and `onSubmit` handlers.
*   **Mid Level**: Capable of writing keydown event listeners on specific input components.
*   **Senior Level**: Writes custom global React hooks (e.g., `useBarcodeScanner`) that monitor key velocity (measuring milliseconds between characters to distinguish hardware streams from human typists), handle multi-column CSV string parses, buffer stream packets, and flush state hooks automatically without leaking events.

### 1.3 Performance Optimizations & Large Catalog Handling
Grocery catalogs can contain thousands of stock-keeping units (SKUs). Page loading and filtering must feel instantaneous.
*   **Junior Level**: Uses standard JS array filtering (`filter`, `map`) inside React render cycles.
*   **Mid Level**: Uses React `useMemo` and `useCallback` to cache search and category filtration operations.
*   **Senior Level**: Implements windowing/virtualization techniques (e.g., `react-window`) to only render items visible in the client viewport. Fully understands fuzzy matching computational complexity (Levenshtein distance algorithms) and offloads expensive processing steps or indexes state trees to minimize render latency (<50ms filter response).

---

## 2. UI/UX Engineering Competencies

### 2.1 Cumulative Layout Shift (CLS) Mitigation
A key non-functional requirement is eliminating sudden layout jumps during data hydration, catalog updates, or search executions.
*   **Junior Level**: Understands basic loading spinner indicators.
*   **Mid Level**: Able to build standard layout placeholders with fixed aspect ratios.
*   **Senior Level**: Expert at implementing visual skeleton states that mirror the final hydrated components (e.g. grids, list rows, Recharts canvas viewports). Uses CSS Grid/Flexbox dimensions explicitly to reserve paint envelopes, ensuring zero layout shift when remote states hydrate.

### 2.2 Design Tokens & Light Mode Integrity
The app utilizes a strictly enforced, high-contrast, Light Mode Only theme to guarantee visibility under bright grocery store lighting.
*   **Junior Level**: Writes ad-hoc inline styles or standard Tailwind utility classes directly.
*   **Mid Level**: Uses Tailwind configuration custom colors (`theme.extend.colors`) to enforce simple brand parameters.
*   **Senior Level**: Architect of strict Tailwind-based design systems. Maps colors and sizing units into custom theme layers. Employs CSS variables mapped to Tailwind configs to enforce design tokens. Restricts UI from building dark-mode overrides by systematically omitting `dark:` utilities and linting out theme-toggle configurations.

### 2.3 Structural Animation Patterns (Framer Motion)
Visual feedback must guide user attention naturally without causing motion fatigue.
*   **Junior Level**: Implements standard CSS transitions on hover.
*   **Mid Level**: Able to write basic Framer Motion entry animations (`animate={{ opacity: 1 }}`).
*   **Senior Level**: Designs coordinated layouts using `AnimatePresence` and custom spring curves. Understands physics-based transitions (`stiffness`, `damping`, `mass`) over duration curves. Implements layout transitions (`layoutId`) for category tab indicator shifts, ensuring visual continuity.

### 2.4 Accessible Form Flows (Checkout Validation)
The checkout checkout process must capture address and contact info with zero accessibility friction.
*   **Junior Level**: Uses standard HTML input elements with minimal validation.
*   **Mid Level**: Uses HTML5 validation controls and custom regex strings for phone validations.
*   **Senior Level**: Implements comprehensive, highly accessible form controls (WAI-ARIA compliance, clear validation announcements, automated focus shifts). Designs flexible error boundaries that capture user input without clearing valid data, and integrates smooth step-based transitions.
