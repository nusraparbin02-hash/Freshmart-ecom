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
  addStockBulk: (parsedProducts: Product[]) => void;
  updateProductInline: (id: string, field: keyof Product, value: any) => void;
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
  },

  addStockBulk: (parsedProducts) => set((state) => {
    let updatedProducts = [...state.products];
    parsedProducts.forEach((newP) => {
      const existsIdx = updatedProducts.findIndex((p) => p.barcode === newP.barcode);
      if (existsIdx > -1) {
        updatedProducts[existsIdx] = {
          ...updatedProducts[existsIdx],
          stock: updatedProducts[existsIdx].stock + newP.stock,
          name: newP.name || updatedProducts[existsIdx].name,
          category: newP.category || updatedProducts[existsIdx].category,
          price: newP.price || updatedProducts[existsIdx].price,
          description: newP.description || updatedProducts[existsIdx].description,
        };
      } else {
        updatedProducts.push(newP);
      }
    });
    return { products: updatedProducts };
  }),

  updateProductInline: (id, field, value) => set((state) => {
    const updatedProducts = state.products.map((p) => {
      if (p.id === id) {
        let typedValue = value;
        if (field === 'price') typedValue = parseFloat(value) || 0;
        if (field === 'stock') typedValue = parseInt(value, 10) || 0;
        return { ...p, [field]: typedValue };
      }
      return p;
    });

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
  })
}));
