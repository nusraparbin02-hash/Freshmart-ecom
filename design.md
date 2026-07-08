# UI/UX Specification Document - Fresh Mart

## 1. Design System Core Strategy

Fresh Mart features a strict, clean **Light Mode Only** design system. The user interface prioritizes clarity, visibility under varied lighting (such as bright retail store environments), and fast layout traversal. Dark mode support, styles, and toggles are intentionally excluded to keep the application code lean and focused.

---

## 2. Color Palette Schema

The design employs a crisp organic theme utilizing warm neutral backgrounds, high-contrast typography, and emerald brand indicators.

| Token Group | Tailwind Key | Hex Value | Application |
| :--- | :--- | :--- | :--- |
| **Brand Primary** | `emerald-600` | `#16A34A` | Brand header accent, positive action buttons, status indicators. |
| **Brand Focus** | `emerald-700` | `#15803D` | Hover states, active focus states. |
| **Brand Active** | `emerald-500` | `#10B981` | Micro-actions, badge accents. |
| **Page Canvas** | `neutral-50` | `#FAFAFA` | Main layout backdrop. |
| **Surface Element** | `white` | `#FFFFFF` | Product cards, list lines, modal panels, checkouts. |
| **High Contrast Text**| `slate-800` | `#1E293B` | Main headers, product titles, price metrics. |
| **Medium Neutral Text**| `slate-600` | `#475569` | Descriptions, meta text, inactive controls. |
| **Border & Divider** | `gray-200` | `#E5E7EB` | Grid borders, form inputs, layout separations. |
| **Background Fill** | `gray-100` | `#F3F4F6` | Search inputs, badge backgrounds, disabled controls. |

---

## 3. Typography & Scannability

The typography scale utilizes modern geometric sans-serif fonts (**Inter** or **Geist**) optimized for high legibility at small sizes.

*   **Body Copy Default**: `text-sm` (`0.875rem` / `14px`) with a line-height of `1.5` (`leading-relaxed`) to optimize content-density on mobile screens.
*   **Administrative Tables / Grid Data**: `text-xs` (`0.75rem` / `12px`) with monospace numbers (`font-mono`) to prevent numerical alignment shifts during quantity mutations.
*   **Weight Hierarchy**:
    *   `font-bold` (`700`) - Brand headers, subtotals, active prices.
    *   `font-semibold` (`600`) - Product titles, input labels, section dividers.
    *   `font-medium` (`500`) - Interactive element text, status badges.
    *   `font-normal` (`400`) - Item descriptions, secondary details.

---

## 4. Micro-interactions & Framer Motion Transitions

Animations must be light, responsive, and provide clear physical analogies (e.g. cart items sliding into the drawer). The following Framer Motion transitions must be standard:

### 4.1 Cart Drawer Slide-in
*   **Path**: Right side of screen to screen edge.
*   **Transition Config**:
    ```javascript
    const cartDrawerTransition = {
      type: "spring",
      stiffness: 300,
      damping: 30
    };
    ```

### 4.2 Product Entry Grid Fade
*   **Path**: Scaling up slightly while fading in to prevent harsh flashing during category shifts.
*   **Transition Config**:
    ```javascript
    const productFadeTransition = {
      initial: { opacity: 0, scale: 0.96 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.96 },
      transition: { duration: 0.15, ease: "easeOut" }
    };
    ```

### 4.3 Click Feedback Micro-Bounce
*   **Path**: Small click-down scale effect to simulate physical key press.
*   **Transition Config**:
    ```javascript
    const clickBounceTransition = {
      whileTap: { scale: 0.95 },
      whileHover: { scale: 1.02 }
    };
    ```

---

## 5. Skeleton Infrastructure (CLS Mitigation)

To prevent Cumulative Layout Shift (CLS) during state hydration or search delays, gray pulse structures matching exact layout parameters must render prior to component mounts.

### 5.1 Product Grid Skeleton Card
An layout-stable mockup of the store card:
```html
<div class="bg-white border border-gray-200 rounded-2xl p-4 animate-pulse">
  <div class="h-32 bg-gray-200 rounded-lg mb-4"></div>
  <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div class="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
  <div class="flex justify-between items-center">
    <div class="h-5 bg-gray-200 rounded w-1/4"></div>
    <div class="h-8 bg-gray-200 rounded w-8"></div>
  </div>
</div>
```

### 5.2 Analytics Chart Skeleton
Pre-reserves space for Recharts SVG renderings:
```html
<div class="w-full h-80 bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between animate-pulse">
  <div class="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
  <div class="flex-1 flex items-end space-x-2">
    <div class="h-1/3 bg-gray-200 rounded-t flex-1"></div>
    <div class="h-1/2 bg-gray-200 rounded-t flex-1"></div>
    <div class="h-2/3 bg-gray-200 rounded-t flex-1"></div>
    <div class="h-3/4 bg-gray-200 rounded-t flex-1"></div>
  </div>
</div>
```

### 5.3 Order Monitoring Desk Skeleton Row
Slices for the queue:
```html
<div class="flex justify-between items-center p-4 border-b border-gray-200 animate-pulse">
  <div class="space-y-2">
    <div class="h-4 bg-gray-200 rounded w-24"></div>
    <div class="h-3 bg-gray-200 rounded w-36"></div>
  </div>
  <div class="h-8 bg-gray-200 rounded w-20"></div>
</div>
```
