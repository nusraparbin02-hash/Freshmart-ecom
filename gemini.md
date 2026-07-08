# LLM Context & System Blueprint Prompt

This document serves as the absolute source of truth and blueprint for the "Fresh Mart" codebase. It contains the complete, production-ready, functional code files for the core layouts, pages, and components—specifically including the checkout mechanics, barcode scanner parser system, and analytics charts.

---

## 1. Global State Management (Zustand)

### File: `src/store/useStore.ts`
```typescript
import { create } from 'zustand';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  pickupWindow: '9am-12pm morning' | '12pm-4pm afternoon' | '4pm-7pm evening' | '7pm-11pm night';
  paymentRoute: 'online' | 'pickup';
  items: CartItem[];
  subtotal: number;
  status: 'Pending' | 'Packed' | 'Completed';
  createdAt: string;
}

export interface AnalyticsPoint {
  timeLabel: string;
  revenue: number;
  ordersCount: number;
}

interface StoreState {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  analyticsCycle: 'daily' | 'weekly' | 'monthly' | 'yearly';
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addToCart: (productId: string) => { success: boolean; message: string };
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => { success: boolean; message: string };
  clearCart: () => void;
  submitOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    pickupWindow: Order['pickupWindow'];
    paymentRoute: Order['paymentRoute'];
  }) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  setAnalyticsCycle: (cycle: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
  getAnalyticsData: () => AnalyticsPoint[];
}

const initialProducts: Product[] = [
  {
    id: 'p1',
    barcode: '880123456789',
    name: 'Organic Gala Apples',
    category: 'Produce',
    price: 2.99,
    stock: 45,
    description: 'Crisp, sweet, and locally harvested organic red apples.'
  },
  {
    id: 'p2',
    barcode: '880234567890',
    name: 'Fresh Bananas Bunch',
    category: 'Produce',
    price: 1.49,
    stock: 80,
    description: 'Rich in potassium, a bundle of fresh yellow sweet bananas.'
  },
  {
    id: 'p3',
    barcode: '880345678901',
    name: 'Organic Whole Milk 1G',
    category: 'Dairy',
    price: 4.89,
    stock: 20,
    description: 'Pasteurized whole milk from local pasture-raised cows.'
  },
  {
    id: 'p4',
    barcode: '880456789012',
    name: 'Country Sourdough Bread',
    category: 'Bakery',
    price: 3.99,
    stock: 12,
    description: 'Freshly baked artisanal sourdough bread with a crispy crust.'
  },
  {
    id: 'p5',
    barcode: '880567890123',
    name: 'Premium Ribeye Steak 12oz',
    category: 'Meat',
    price: 14.99,
    stock: 8,
    description: 'Marbled, grass-fed choice ribeye beef steak.'
  },
  {
    id: 'p6',
    barcode: '880678901234',
    name: 'Extra Virgin Olive Oil 500ml',
    category: 'Pantry',
    price: 9.49,
    stock: 30,
    description: 'Cold-pressed extra virgin olive oil imported from Greece.'
  }
];

export const useStore = create<StoreState>((set, get) => ({
  products: initialProducts,
  cart: [],
  orders: [],
  analyticsCycle: 'daily',

  addProduct: (product) => set((state) => {
    const exists = state.products.some((p) => p.barcode === product.barcode);
    if (exists) {
      return {
        products: state.products.map((p) =>
          p.barcode === product.barcode ? { ...p, stock: p.stock + product.stock } : p
        )
      };
    }
    return { products: [...state.products, product] };
  }),

  updateProduct: (id, updates) => set((state) => {
    const updatedProducts = state.products.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    
    // Sync cart item product metadata & adjust quantities to stay within new stock limit
    const updatedCart = state.cart.map((item) => {
      if (item.product.id === id) {
        const matchingProduct = updatedProducts.find((p) => p.id === id);
        if (matchingProduct) {
          const clampedQty = Math.min(item.quantity, matchingProduct.stock);
          return { product: matchingProduct, quantity: clampedQty };
        }
      }
      return item;
    }).filter(item => item.quantity > 0);

    return { products: updatedProducts, cart: updatedCart };
  }),

  addToCart: (productId) => {
    const { products, cart } = get();
    const product = products.find((p) => p.id === productId);
    if (!product) return { success: false, message: 'Product not found.' };
    if (product.stock <= 0) return { success: false, message: 'Item is out of stock.' };

    const cartItem = cart.find((item) => item.product.id === productId);
    const currentQty = cartItem ? cartItem.quantity : 0;

    if (currentQty >= product.stock) {
      return { success: false, message: `Only ${product.stock} units available in stock.` };
    }

    let newCart;
    if (cartItem) {
      newCart = cart.map((item) =>
        item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { product, quantity: 1 }];
    }

    set({ cart: newCart });
    return { success: true, message: 'Added to cart successfully.' };
  },

  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter((item) => item.product.id !== productId)
  })),

  updateCartQuantity: (productId, quantity) => {
    const { products, cart } = get();
    const product = products.find((p) => p.id === productId);
    if (!product) return { success: false, message: 'Product not found.' };

    if (quantity <= 0) {
      set({ cart: cart.filter((item) => item.product.id !== productId) });
      return { success: true, message: 'Item removed from cart.' };
    }

    if (quantity > product.stock) {
      return { success: false, message: `Only ${product.stock} units available in stock.` };
    }

    set({
      cart: cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    });
    return { success: true, message: 'Cart updated.' };
  },

  clearCart: () => set({ cart: [] }),

  submitOrder: (orderData) => {
    const { cart, products } = get();
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    
    // Deduct stock levels permanently in state
    set((state) => {
      const updatedProducts = state.products.map((p) => {
        const cartItem = cart.find((item) => item.product.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      });

      const newOrder: Order = {
        id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerAddress: orderData.customerAddress,
        pickupWindow: orderData.pickupWindow,
        paymentRoute: orderData.paymentRoute,
        items: [...cart],
        subtotal,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      return {
        products: updatedProducts,
        orders: [newOrder, ...state.orders],
        cart: []
      };
    });

    const currentOrders = get().orders;
    return currentOrders[0];
  },

  updateOrderStatus: (orderId, status) => set((state) => ({
    orders: state.orders.map((o) => o.id === orderId ? { ...o, status } : o)
  })),

  setAnalyticsCycle: (cycle) => set({ analyticsCycle: cycle }),

  getAnalyticsData: () => {
    const { orders, analyticsCycle } = get();
    
    // Seed standard structural data
    const dailyBase = [
      { timeLabel: '09:00 AM', revenue: 120, ordersCount: 4 },
      { timeLabel: '12:00 PM', revenue: 240, ordersCount: 8 },
      { timeLabel: '03:00 PM', revenue: 180, ordersCount: 6 },
      { timeLabel: '06:00 PM', revenue: 310, ordersCount: 11 },
      { timeLabel: '09:00 PM', revenue: 150, ordersCount: 5 }
    ];

    const weeklyBase = [
      { timeLabel: 'Mon', revenue: 450, ordersCount: 15 },
      { timeLabel: 'Tue', revenue: 380, ordersCount: 12 },
      { timeLabel: 'Wed', revenue: 520, ordersCount: 18 },
      { timeLabel: 'Thu', revenue: 490, ordersCount: 16 },
      { timeLabel: 'Fri', revenue: 750, ordersCount: 25 },
      { timeLabel: 'Sat', revenue: 980, ordersCount: 32 },
      { timeLabel: 'Sun', revenue: 840, ordersCount: 28 }
    ];

    const monthlyBase = [
      { timeLabel: 'Week 1', revenue: 2400, ordersCount: 80 },
      { timeLabel: 'Week 2', revenue: 2800, ordersCount: 95 },
      { timeLabel: 'Week 3', revenue: 3100, ordersCount: 104 },
      { timeLabel: 'Week 4', revenue: 3500, ordersCount: 115 }
    ];

    const yearlyBase = [
      { timeLabel: 'Q1', revenue: 8500, ordersCount: 280 },
      { timeLabel: 'Q2', revenue: 12400, ordersCount: 410 },
      { timeLabel: 'Q3', revenue: 14200, ordersCount: 470 },
      { timeLabel: 'Q4', revenue: 18900, ordersCount: 630 }
    ];

    // Fold completed order values from state directly into current cycle segments
    const completedOrders = orders.filter(o => o.status === 'Completed');
    const orderSum = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);

    if (orderSum === 0) {
      if (analyticsCycle === 'daily') return dailyBase;
      if (analyticsCycle === 'weekly') return weeklyBase;
      if (analyticsCycle === 'monthly') return monthlyBase;
      return yearlyBase;
    }

    // Append current store activity to the final index element of charts
    const appendActiveData = (baseArray: typeof dailyBase) => {
      const updated = [...baseArray];
      const lastIndex = updated.length - 1;
      updated[lastIndex] = {
        ...updated[lastIndex],
        revenue: updated[lastIndex].revenue + orderSum,
        ordersCount: updated[lastIndex].ordersCount + completedOrders.length
      };
      return updated;
    };

    if (analyticsCycle === 'daily') return appendActiveData(dailyBase);
    if (analyticsCycle === 'weekly') return appendActiveData(weeklyBase);
    if (analyticsCycle === 'monthly') return appendActiveData(monthlyBase);
    return appendActiveData(yearlyBase);
  }
}));
```

---

## 2. Hardware Input & CSV Barcode Parser

### File: `src/utils/barcodeParser.ts`
```typescript
import { Product } from '../store/useStore';

export interface ScannedFields {
  barcode: string;
  name?: string;
  category?: string;
  price?: number;
  stock?: number;
  description?: string;
}

/**
 * Parses raw barcode input feeds.
 * Supports:
 * 1. Raw numeric barcodes (e.g. "880123456789")
 * 2. Multi-column CSV barcode strings (e.g. "880123456789,Apples,Produce,2.99,50,Crisp Red Apples")
 *    Expected schema order: barcode, name, category, price, stock, description
 */
export function parseBarcodeFeed(feedString: string): ScannedFields | null {
  const cleanInput = feedString.trim();
  if (!cleanInput) return null;

  // Check if this is a simple raw barcode (digits only, length 8 to 14)
  const isRawBarcode = /^\d{8,14}$/.test(cleanInput);
  if (isRawBarcode) {
    return { barcode: cleanInput };
  }

  // Handle CSV delimiter splits
  const parts = cleanInput.split(',').map((p) => p.trim());
  if (parts.length >= 1) {
    const barcode = parts[0];
    // Ensure the token represents a valid barcode structure
    if (!/^\d{8,14}$/.test(barcode)) {
      return null;
    }

    const fields: ScannedFields = { barcode };

    if (parts[1]) fields.name = parts[1];
    if (parts[2]) fields.category = parts[2];
    
    if (parts[3]) {
      const parsedPrice = parseFloat(parts[3]);
      if (!isNaN(parsedPrice)) fields.price = parsedPrice;
    }
    
    if (parts[4]) {
      const parsedStock = parseInt(parts[4], 10);
      if (!isNaN(parsedStock)) fields.stock = parsedStock;
    }
    
    if (parts[5]) fields.description = parts[5];

    return fields;
  }

  return null;
}
```

---

## 3. UI/UX Loading Skeletons (CLS Protection)

### File: `src/components/shared/Skeletons.tsx`
```react
import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 animate-pulse flex flex-col justify-between h-[360px]">
      <div>
        <div className="w-full h-40 bg-gray-200 rounded-lg mb-4" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
      </div>
      <div className="flex justify-between items-center mt-auto">
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-8 bg-gray-200 rounded w-16" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="w-full h-[320px] bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-5 bg-gray-200 rounded w-1/4" />
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 rounded w-12" />
          <div className="h-8 bg-gray-200 rounded w-12" />
          <div className="h-8 bg-gray-200 rounded w-12" />
        </div>
      </div>
      <div className="flex-1 flex items-end space-x-3 h-48">
        <div className="h-[25%] bg-gray-200 rounded-t flex-1" />
        <div className="h-[45%] bg-gray-200 rounded-t flex-1" />
        <div className="h-[30%] bg-gray-200 rounded-t flex-1" />
        <div className="h-[65%] bg-gray-200 rounded-t flex-1" />
        <div className="h-[50%] bg-gray-200 rounded-t flex-1" />
        <div className="h-[80%] bg-gray-200 rounded-t flex-1" />
      </div>
      <div className="flex justify-between mt-4">
        <div className="h-3 bg-gray-200 rounded w-8" />
        <div className="h-3 bg-gray-200 rounded w-8" />
        <div className="h-3 bg-gray-200 rounded w-8" />
        <div className="h-3 bg-gray-200 rounded w-8" />
        <div className="h-3 bg-gray-200 rounded w-8" />
      </div>
    </div>
  );
}

export function OrderRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white animate-pulse mb-3">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-3 bg-gray-200 rounded w-48" />
      </div>
      <div className="flex items-center space-x-3">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="h-8 bg-gray-200 rounded w-24" />
      </div>
    </div>
  );
}
```

---

## 4. Storefront UI Component

### File: `src/components/storefront/Storefront.tsx`
```react
import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Search, ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckoutForm } from './CheckoutForm';

// Fuzzy distance evaluation (Levenshtein Distance)
function calcEditDistance(a: string, b: string): number {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

const CATEGORIES = ['All', 'Produce', 'Dairy', 'Bakery', 'Meat', 'Pantry'];

export function Storefront() {
  const { products, cart, addToCart, updateCartQuantity, removeFromCart } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);

  // Filter and Fuzzy Search calculation
  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((p) => {
        const nameClean = p.name.toLowerCase();
        const descClean = p.description.toLowerCase();

        // Exact match
        if (nameClean.includes(query) || descClean.includes(query) || p.barcode.includes(query)) {
          return true;
        }

        // Fuzzy matches on single words
        const queryWords = query.split(/\s+/);
        const nameWords = nameClean.split(/\s+/);

        return queryWords.every((qw) => {
          if (qw.length < 3) return nameWords.some((nw) => nw.startsWith(qw));
          return nameWords.some((nw) => {
            if (nw.includes(qw) || qw.includes(nw)) return true;
            const dist = calcEditDistance(qw, nw);
            return dist <= 2; // Allow up to 2 typos
          });
        });
      });
    }

    return result;
  }, [products, selectedCategory, searchQuery]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1E293B] antialiased">
      {/* Header banner */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="bg-[#16A34A] text-white p-2 rounded-xl">
            <span className="font-bold text-lg tracking-tight">FM</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">Fresh Mart</h1>
            <span className="text-xs text-gray-500 font-medium">Hyperlocal Grocery Store</span>
          </div>
        </div>

        {/* Search Bar desktop */}
        <div className="hidden md:flex relative w-1/3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search groceries (e.g., appls, sourdough)..."
            className="w-full bg-gray-100 pl-10 pr-10 py-2 rounded-xl text-sm border-0 focus:ring-2 focus:ring-[#16A34A] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Cart Trigger */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative bg-[#16A34A] hover:bg-[#15803D] text-white px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-sm"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="font-semibold text-sm hidden sm:inline">My Cart</span>
          {cartCount > 0 && (
            <span className="bg-white text-[#16A34A] font-bold text-xs h-5 w-5 rounded-full flex items-center justify-center animate-bounce">
              {cartCount}
            </span>
          )}
        </button>
      </header>

      {/* Categories Bar */}
      <section className="bg-white border-b border-gray-100 px-4 py-3 flex space-x-2 overflow-x-auto scrollbar-none shadow-sm">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#16A34A] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </section>

      {/* Main product display */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Mobile search bar */}
        <div className="flex md:hidden relative w-full mb-6">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search groceries (e.g. bannanas)..."
            className="w-full bg-white border border-gray-200 pl-10 pr-10 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-[#16A34A] focus:border-0 outline-none transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <p className="text-gray-500 font-semibold text-lg mb-2">No items found</p>
            <p className="text-sm text-gray-400">Try checking spelling errors or shifting categories.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const cartQty = cart.find((item) => item.product.id === product.id)?.quantity || 0;
                return (
                  <motion.div
                    layout
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all h-[340px]"
                  >
                    <div>
                      {/* Badge category */}
                      <span className="inline-block bg-[#F3F4F6] text-[#475569] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
                        {product.category}
                      </span>
                      <h3 className="text-base font-bold text-[#1E293B] mb-1 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-3 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-extrabold text-[#1E293B]">
                          ${product.price.toFixed(2)}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            product.stock === 0
                              ? 'bg-red-100 text-red-700'
                              : product.stock < 10
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {product.stock === 0
                            ? 'Out of Stock'
                            : `${product.stock} units left`}
                        </span>
                      </div>

                      {cartQty > 0 ? (
                        <div className="flex items-center justify-between bg-gray-100 rounded-xl p-1">
                          <button
                            onClick={() => updateCartQuantity(product.id, cartQty - 1)}
                            className="bg-white text-gray-600 hover:text-[#16A34A] h-8 w-8 rounded-lg flex items-center justify-center shadow-sm transition-all"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-bold text-sm px-2">{cartQty}</span>
                          <button
                            onClick={() => updateCartQuantity(product.id, cartQty + 1)}
                            className="bg-white text-gray-600 hover:text-[#16A34A] h-8 w-8 rounded-lg flex items-center justify-center shadow-sm transition-all"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          disabled={product.stock === 0}
                          onClick={() => addToCart(product.id)}
                          className="w-full bg-[#16A34A] hover:bg-[#15803D] disabled:bg-gray-200 disabled:text-gray-400 text-white py-2 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-1"
                        >
                          <span>Add To Cart</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Cart Drawer Slide-out overlay */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black"
              onClick={() => {
                if (!isCheckingOut) setIsCartOpen(false);
              }}
            />

            <div className="absolute inset-y-0 right-0 max-w-full flex">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="w-screen max-w-md bg-white flex flex-col shadow-xl"
              >
                <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-5 w-5 text-[#16A34A]" />
                    <h2 className="text-lg font-bold text-[#1E293B]">Shopping Cart</h2>
                  </div>
                  <button
                    disabled={isCheckingOut}
                    onClick={() => setIsCartOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {isCheckingOut ? (
                    <CheckoutForm onCancel={() => setIsCheckingOut(false)} onComplete={() => {
                      setIsCheckingOut(false);
                      setIsCartOpen(false);
                    }} />
                  ) : cart.length === 0 ? (
                    <div className="text-center py-16 flex flex-col items-center justify-center h-full">
                      <ShoppingCart className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 font-semibold mb-1">Your cart is empty</p>
                      <p className="text-xs text-gray-400">Add products from the catalog to get started.</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div className="flex-1 pr-3">
                          <h4 className="text-sm font-bold text-[#1E293B] line-clamp-1">{item.product.name}</h4>
                          <span className="text-xs text-gray-500 font-semibold">${item.product.price.toFixed(2)} each</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="bg-white text-gray-600 h-7 w-7 rounded flex items-center justify-center transition-all"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="font-bold text-xs px-2">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                              className="bg-white text-gray-600 h-7 w-7 rounded flex items-center justify-center transition-all"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-gray-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {!isCheckingOut && cart.length > 0 && (
                  <div className="p-5 border-t border-gray-200 bg-gray-50 space-y-4">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-gray-500">Cart Subtotal</span>
                      <span className="text-[#1E293B] text-lg font-extrabold">${cartSubtotal.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => setIsCheckingOut(true)}
                      className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white py-3 rounded-xl font-bold text-sm tracking-wide transition-all shadow"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## 5. Checkout Component (Slots & Mock Payments)

### File: `src/components/storefront/CheckoutForm.tsx`
```react
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { QrCode, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface CheckoutFormProps {
  onCancel: () => void;
  onComplete: () => void;
}

const PICKUP_WINDOWS = [
  '9am-12pm morning',
  '12pm-4pm afternoon',
  '4pm-7pm evening',
  '7pm-11pm night'
] as const;

export function CheckoutForm({ onCancel, onComplete }: CheckoutFormProps) {
  const { cart, submitOrder } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pickupWindow, setPickupWindow] = useState<typeof PICKUP_WINDOWS[number] | ''>('');
  const [paymentRoute, setPaymentRoute] = useState<'online' | 'pickup' | ''>('');

  // Payment UI status states
  const [qrStage, setQrStage] = useState<'none' | 'loading' | 'generated' | 'completed'>('none');
  const [errorMsg, setErrorMsg] = useState('');

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleFormSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) return setErrorMsg('Name is required.');
    if (!/^\+?[0-9\s-]{10,14}$/.test(phone.trim())) {
      return setErrorMsg('Provide a valid phone number (10-14 digits).');
    }
    if (!address.trim()) return setErrorMsg('Delivery/pickup address is required.');
    if (!pickupWindow) return setErrorMsg('Select a pickup window.');
    if (!paymentRoute) return setErrorMsg('Select payment route.');

    if (paymentRoute === 'online') {
      setQrStage('loading');
      // Simulate dynamic instant QR parsing response
      setTimeout(() => {
        setQrStage('generated');
      }, 1000);
    } else {
      // Pay on Pickup route
      submitOrder({
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        pickupWindow,
        paymentRoute: 'pickup'
      });
      setQrStage('completed');
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  };

  const handleMockPaymentSuccess = () => {
    submitOrder({
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      pickupWindow,
      paymentRoute: 'online'
    });
    setQrStage('completed');
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  if (qrStage === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-[#16A34A]"
        >
          <CheckCircle2 className="h-16 w-16 mb-4 mx-auto" />
        </motion.div>
        <h3 className="text-lg font-bold text-[#1E293B] mb-2">Order Confirmed!</h3>
        <p className="text-sm text-gray-500 leading-relaxed px-4">
          Your order has been sent to our packing queues. Thank you for shopping with Fresh Mart!
        </p>
      </div>
    );
  }

  if (qrStage === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-t-[#16A34A] border-gray-200 rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-semibold">Generating Dynamic Payment QR Code...</p>
      </div>
    );
  }

  if (qrStage === 'generated') {
    return (
      <div className="flex flex-col items-center py-4 space-y-5 text-center">
        <h3 className="text-base font-bold text-[#1E293B]">Scan to Pay Instantly</h3>
        <p className="text-xs text-gray-500">Scan this QR code using any digital banking/wallet app.</p>
        
        {/* Dynamic Mock QR Code Block */}
        <div className="border border-gray-200 p-4 rounded-2xl bg-white shadow-sm flex flex-col items-center">
          {/* Custom vector QR pattern mockup */}
          <div className="w-40 h-40 bg-gray-50 border border-gray-100 flex items-center justify-center relative rounded-xl mb-3">
            <QrCode className="h-28 w-28 text-gray-800" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
              <div className="bg-[#16A34A] text-white text-[8px] font-extrabold px-1 rounded">FM</div>
            </div>
          </div>
          <span className="text-xs font-bold text-[#1E293B]">Subtotal Due: ${cartSubtotal.toFixed(2)}</span>
        </div>

        <div className="w-full flex space-x-3 pt-4">
          <button
            onClick={() => setQrStage('none')}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2 px-4 rounded-xl text-xs hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleMockPaymentSuccess}
            className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold py-2 px-4 rounded-xl text-xs transition-all"
          >
            Verify Mock Payment
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmission} className="space-y-6">
      <h3 className="text-base font-bold text-[#1E293B] border-b border-gray-100 pb-2">Checkout Details</h3>
      
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Customer Name</label>
        <input
          type="text"
          placeholder="e.g. John Doe"
          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-[#16A34A] outline-none transition-all"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Phone Number</label>
        <input
          type="tel"
          placeholder="e.g. 555-019-2834"
          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-[#16A34A] outline-none transition-all"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Delivery / Pickup Address</label>
        <textarea
          rows={2}
          placeholder="Enter physical address details"
          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-[#16A34A] outline-none transition-all resize-none"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      {/* Pickup Windows */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Pickup Time Window</label>
        <div className="grid grid-cols-2 gap-2.5">
          {PICKUP_WINDOWS.map((window) => (
            <button
              key={window}
              type="button"
              onClick={() => setPickupWindow(window)}
              className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all text-left ${
                pickupWindow === window
                  ? 'border-[#16A34A] bg-green-50 text-[#16A34A]'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {window}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Options */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Payment Method</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentRoute('online')}
            className={`py-3 px-4 border rounded-xl flex flex-col items-center justify-center space-y-1 transition-all ${
              paymentRoute === 'online'
                ? 'border-[#16A34A] bg-green-50 text-[#16A34A]'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <QrCode className="h-5 w-5" />
            <span className="text-[11px] font-bold">Online QR Code</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentRoute('pickup')}
            className={`py-3 px-4 border rounded-xl flex flex-col items-center justify-center space-y-1 transition-all ${
              paymentRoute === 'pickup'
                ? 'border-[#16A34A] bg-green-50 text-[#16A34A]'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-[11px] font-bold">Pay on Pickup</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex space-x-3 pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl text-xs hover:bg-gray-50 transition-all"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow"
        >
          Confirm Checkout
        </button>
      </div>
    </form>
  );
}
```

---

## 6. Admin Inventory Intake & Live Modifier Component

### File: `src/components/admin/BarcodeIntake.tsx`
```react
import React, { useState, useEffect, useRef } from 'react';
import { useStore, Product } from '../../store/useStore';
import { parseBarcodeFeed } from '../../utils/barcodeParser';
import { Barcode, Plus, Check, Save } from 'lucide-react';

export function BarcodeIntake() {
  const { products, addProduct, updateProduct } = useStore();
  const [scannerFeedInput, setScannerFeedInput] = useState('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Produce');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Keep track of keystroke speed to intercept direct hardware feeds
  const lastKeyTimeRef = useRef<number>(0);
  const bufferRef = useRef<string>('');

  // Handle hardware scanner intercepts globally when focus is active
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      // Filter non-printable keys
      if (e.key.length > 1 && e.key !== 'Enter') return;

      if (e.key === 'Enter') {
        if (bufferRef.current.length > 0) {
          processRawBuffer(bufferRef.current);
          bufferRef.current = '';
          e.preventDefault();
        }
      } else {
        // Reset scanner buffer if type gap indicates human speed (>40ms)
        if (timeDiff > 40) {
          bufferRef.current = e.key;
        } else {
          bufferRef.current += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const processRawBuffer = (rawString: string) => {
    const parsed = parseBarcodeFeed(rawString);
    if (!parsed) {
      triggerToast('error', 'Barcode format or CSV scan parsing failed.');
      return;
    }

    setManualBarcode(parsed.barcode);
    if (parsed.name) setName(parsed.name);
    if (parsed.category) setCategory(parsed.category);
    if (parsed.price !== undefined) setPrice(parsed.price.toString());
    if (parsed.stock !== undefined) setStock(parsed.stock.toString());
    if (parsed.description) setDescription(parsed.description);

    // If it was a barcode-only scan, verify if it exists in store catalog
    const matched = products.find(p => p.barcode === parsed.barcode);
    if (matched && !parsed.name) {
      setName(matched.name);
      setCategory(matched.category);
      setPrice(matched.price.toString());
      setStock(matched.stock.toString());
      setDescription(matched.description);
      triggerToast('success', `Product found: ${matched.name}. Fields populated.`);
    } else if (parsed.name) {
      // Auto register complete CSV rows
      const newProduct: Product = {
        id: matched?.id || `prod-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: parsed.barcode,
        name: parsed.name,
        category: parsed.category || 'Produce',
        price: parsed.price || 0.99,
        stock: parsed.stock || 1,
        description: parsed.description || ''
      };
      
      if (matched) {
        updateProduct(matched.id, newProduct);
        triggerToast('success', `Updated catalog product via CSV scan.`);
      } else {
        addProduct(newProduct);
        triggerToast('success', `Imported new product via CSV scan.`);
      }
      clearInputs();
    } else {
      triggerToast('success', 'New barcode scanned. Fill details to register.');
    }
  };

  const triggerToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const clearInputs = () => {
    setManualBarcode('');
    setName('');
    setCategory('Produce');
    setPrice('');
    setStock('');
    setDescription('');
  };

  const handleManualRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{8,14}$/.test(manualBarcode)) {
      return triggerToast('error', 'Barcode must be 8-14 numeric digits.');
    }
    if (!name.trim()) return triggerToast('error', 'Product name is required.');
    
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10);
    
    if (isNaN(parsedPrice) || parsedPrice <= 0) return triggerToast('error', 'Provide a valid positive price.');
    if (isNaN(parsedStock) || parsedStock < 0) return triggerToast('error', 'Stock count cannot be negative.');

    const matching = products.find(p => p.barcode === manualBarcode);
    const productData: Product = {
      id: matching?.id || `prod-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: manualBarcode,
      name: name.trim(),
      category,
      price: parsedPrice,
      stock: parsedStock,
      description: description.trim()
    };

    if (matching) {
      updateProduct(matching.id, productData);
      triggerToast('success', `Product "${name}" stock/price metrics updated.`);
    } else {
      addProduct(productData);
      triggerToast('success', `Registered new product: ${name}.`);
    }

    clearInputs();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 mb-5">
        <Barcode className="h-5 w-5 text-[#16A34A]" />
        <h2 className="text-base font-bold text-[#1E293B]">Catalog & Barcode Intake Desk</h2>
      </div>

      {notification && (
        <div className={`p-3 text-xs font-semibold rounded-xl border mb-4 flex items-center justify-between ${
          notification.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span>{notification.message}</span>
          <Check className="h-4 w-4" />
        </div>
      )}

      {/* Hardware simulator box */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          Hardware Barcode Gun Parser Simulator
        </label>
        <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">
          Type or paste raw barcode patterns below and press Enter to simulate barcode scans.
          CSV example: <code className="bg-gray-200 px-1 py-0.5 rounded font-mono text-[9px]">880123456789,Gala Apples,Produce,2.99,60,Sweet fruit</code>
        </p>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Scan barcode buffer..."
            className="flex-1 bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#16A34A] transition-all font-mono"
            value={scannerFeedInput}
            onChange={(e) => setScannerFeedInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                processRawBuffer(scannerFeedInput);
                setScannerFeedInput('');
              }
            }}
          />
          <button
            onClick={() => {
              processRawBuffer(scannerFeedInput);
              setScannerFeedInput('');
            }}
            className="bg-gray-800 hover:bg-black text-white text-xs font-bold px-3 py-2 rounded-xl transition-all"
          >
            Process Scanner Feed
          </button>
        </div>
      </div>

      {/* Modification Registration Form */}
      <form onSubmit={handleManualRegistration} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Barcode (SKU)</label>
            <input
              type="text"
              placeholder="e.g. 880123456789"
              className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-[#16A34A] outline-none"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
            <select
              className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-[#16A34A] outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Produce">Produce</option>
              <option value="Dairy">Dairy</option>
              <option value="Bakery">Bakery</option>
              <option value="Meat">Meat</option>
              <option value="Pantry">Pantry</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product Name</label>
          <input
            type="text"
            placeholder="e.g. Golden Delicious Apples"
            className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-[#16A34A] outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Price ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 2.99"
              className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-[#16A34A] outline-none"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Initial Stock Units</label>
            <input
              type="number"
              placeholder="e.g. 100"
              className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-[#16A34A] outline-none"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Short Description</label>
          <textarea
            rows={2}
            placeholder="Describe product weight, organic standards..."
            className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-[#16A34A] outline-none resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            type="button"
            onClick={clearInputs}
            className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold py-2.5 rounded-xl text-xs transition-all"
          >
            Clear Fields
          </button>
          <button
            type="submit"
            className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <Save className="h-4 w-4" />
            <span>Save Catalog Item</span>
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

## 7. Admin Order Monitoring Desk

### File: `src/components/admin/OrderMonitor.tsx`
```react
import React from 'react';
import { useStore, Order } from '../../store/useStore';
import { Package, Clock, ShieldAlert, BadgeCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function OrderMonitor() {
  const { orders, updateOrderStatus } = useStore();

  // Filter out Completed to keep monitor workspace focused on queue
  const activeOrders = orders.filter((o) => o.status !== 'Completed');
  const completedOrders = orders.filter((o) => o.status === 'Completed');

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold">Pending packing</span>;
      case 'Packed':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">Packed & Ready</span>;
      case 'Completed':
        return <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[10px] font-bold">Completed</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-[#16A34A]" />
            <h2 className="text-base font-bold text-[#1E293B]">Fulfillment Queue ({activeOrders.length})</h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">Orders grouped by Pickup Window</span>
        </div>

        {activeOrders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BadgeCheck className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="font-semibold text-sm">All queues completed</p>
            <p className="text-xs text-gray-400 mt-1">Pending customer orders will print here instantly.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {activeOrders.map((order) => (
                <motion.div
                  layout
                  key={order.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white shadow-sm hover:border-gray-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-400">#{order.id}</span>
                        <h3 className="text-sm font-extrabold text-[#1E293B]">{order.customerName}</h3>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Tel: <span className="font-medium text-gray-700">{order.customerPhone}</span> | Addr: <span className="font-medium text-gray-700">{order.customerAddress}</span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                      <div className="flex items-center space-x-1 text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{order.pickupWindow}</span>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="space-y-1.5 pl-2 border-l-2 border-gray-100">
                    {order.items.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-xs">
                        <span className="text-gray-600">
                          <strong className="text-gray-800">{item.quantity}x</strong> {item.product.name}
                        </span>
                        <span className="text-gray-400 font-mono">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs font-bold text-[#1E293B]">
                      Subtotal: <span className="text-sm font-extrabold">${order.subtotal.toFixed(2)}</span>
                    </span>

                    <div className="flex space-x-2">
                      {order.status === 'Pending' ? (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Packed')}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all shadow-sm"
                        >
                          Mark as Packed
                        </button>
                      ) : (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Completed')}
                          className="bg-[#16A34A] hover:bg-[#15803D] text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all shadow-sm"
                        >
                          Archive Completed
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Archivist panel */}
      {completedOrders.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Completed Orders History Archive</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {completedOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs">
                <div>
                  <span className="font-bold text-[#1E293B]">{o.customerName}</span>
                  <span className="text-gray-400 ml-2">#{o.id}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-gray-500">${o.subtotal.toFixed(2)}</span>
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">Processed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 8. Admin Gross Revenue Analytics Desk

### File: `src/components/admin/AnalyticsDashboard.tsx`
```react
import React from 'react';
import { useStore } from '../../store/useStore';
import { BarChart2, TrendingUp, DollarSign } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export function AnalyticsDashboard() {
  const { analyticsCycle, setAnalyticsCycle, getAnalyticsData } = useStore();
  const rawChartData = getAnalyticsData();

  const totalCycleRevenue = rawChartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalCycleOrders = rawChartData.reduce((sum, item) => sum + item.ordersCount, 0);
  const averageTicketValue = totalCycleOrders > 0 ? totalCycleRevenue / totalCycleOrders : 0;

  return (
    <div className="space-y-6">
      {/* Metric Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gross Cycle Revenue</span>
            <h3 className="text-2xl font-extrabold text-[#1E293B]">${totalCycleRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
          <div className="bg-green-100 text-[#16A34A] p-3 rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Orders Processed</span>
            <h3 className="text-2xl font-extrabold text-[#1E293B]">{totalCycleOrders} orders</h3>
          </div>
          <div className="bg-green-100 text-[#16A34A] p-3 rounded-xl">
            <BarChart2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Average Basket Ticket</span>
            <h3 className="text-2xl font-extrabold text-[#1E293B]">${averageTicketValue.toFixed(2)}</h3>
          </div>
          <div className="bg-green-100 text-[#16A34A] p-3 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main chart panel */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col h-[400px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#1E293B]">Gross Revenue Overview</h2>
            <p className="text-xs text-gray-400">Track cycle financial intake metrics dynamically</p>
          </div>
          
          {/* Cycle Toggles */}
          <div className="flex space-x-1 mt-3 sm:mt-0 bg-gray-100 p-1 rounded-xl">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setAnalyticsCycle(cycle)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                  analyticsCycle === cycle
                    ? 'bg-white text-[#16A34A] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {cycle}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={rawChartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis
                dataKey="timeLabel"
                stroke="#9CA3AF"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  borderColor: '#E5E7EB',
                  fontSize: '11px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                }}
                formatter={(val: number) => [`$${val.toFixed(2)}`, 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
```
