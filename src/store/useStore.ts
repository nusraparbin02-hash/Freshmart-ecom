import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  supabaseConnectionStatus: 'connected' | 'local-fallback';
  fetchInitialData: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
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
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  setAnalyticsCycle: (cycle: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
  getAnalyticsData: () => AnalyticsPoint[];
  addStockBulk: (parsedProducts: Product[]) => Promise<void>;
  updateProductInline: (id: string, field: keyof Product, value: any) => Promise<void>;
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
  supabaseConnectionStatus: isSupabaseConfigured ? 'connected' : 'local-fallback',

  fetchInitialData: async () => {
    if (!isSupabaseConfigured || !supabase) {
      set({ supabaseConnectionStatus: 'local-fallback' });
      return;
    }

    try {
      // 1. Fetch Products
      const { data: dbProducts, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (prodError) throw prodError;

      // 2. Fetch Orders with Items
      const { data: dbOrders, error: orderError } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .order('created_at', { ascending: false });

      if (orderError) throw orderError;

      // Map Supabase products to state
      const mappedProducts: Product[] = (dbProducts || []).map((p: any) => ({
        id: p.id,
        barcode: p.barcode,
        name: p.name,
        category: p.category,
        price: Number(p.price),
        stock: Number(p.stock),
        description: p.description || ''
      }));

      // Map Supabase orders to state
      const mappedOrders: Order[] = (dbOrders || []).map((o: any) => ({
        id: o.id,
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        customerAddress: o.customer_address,
        pickupWindow: o.pickup_window,
        paymentRoute: o.payment_route,
        subtotal: Number(o.subtotal),
        status: o.status,
        createdAt: o.created_at,
        items: (o.order_items || []).map((oi: any) => ({
          product: {
            id: oi.products.id,
            barcode: oi.products.barcode,
            name: oi.products.name,
            category: oi.products.category,
            price: Number(oi.products.price),
            stock: Number(oi.products.stock),
            description: oi.products.description || ''
          },
          quantity: Number(oi.quantity)
        }))
      }));

      set({
        products: mappedProducts.length > 0 ? mappedProducts : initialProducts,
        orders: mappedOrders,
        supabaseConnectionStatus: 'connected'
      });
    } catch (err) {
      console.error('Failed to load data from Supabase. Falling back to local state:', err);
      set({ supabaseConnectionStatus: 'local-fallback' });
    }
  },

  addProduct: async (product) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: existing } = await supabase
          .from('products')
          .select('stock')
          .eq('barcode', product.barcode)
          .maybeSingle();

        if (existing) {
          const newStock = Number(existing.stock) + product.stock;
          await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('barcode', product.barcode);
        } else {
          await supabase
            .from('products')
            .insert({
              id: product.id,
              barcode: product.barcode,
              name: product.name,
              category: product.category,
              price: product.price,
              stock: product.stock,
              description: product.description
            });
        }
      } catch (err) {
        console.error('Supabase addProduct failed, updating local state only:', err);
      }
    }

    set((state) => {
      const exists = state.products.some((p) => p.barcode === product.barcode);
      if (exists) {
        return {
          products: state.products.map((p) =>
            p.barcode === product.barcode ? { ...p, stock: p.stock + product.stock } : p
          )
        };
      }
      return { products: [...state.products, product] };
    });
  },

  updateProduct: async (id, updates) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const dbUpdates: any = {};
        if (updates.barcode !== undefined) dbUpdates.barcode = updates.barcode;
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.price !== undefined) dbUpdates.price = updates.price;
        if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
        if (updates.description !== undefined) dbUpdates.description = updates.description;

        await supabase
          .from('products')
          .update(dbUpdates)
          .eq('id', id);
      } catch (err) {
        console.error('Supabase updateProduct failed, updating local state only:', err);
      }
    }

    set((state) => {
      const updatedProducts = state.products.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      );
      
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
    });
  },

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

  submitOrder: async (orderData) => {
    const { cart } = get();
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const orderId = `ord-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAtStr = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      try {
        // 1. Insert Order Row
        const { error: orderErr } = await supabase.from('orders').insert({
          id: orderId,
          customer_name: orderData.customerName,
          customer_phone: orderData.customerPhone,
          customer_address: orderData.customerAddress,
          pickup_window: orderData.pickupWindow,
          payment_route: orderData.paymentRoute,
          subtotal: subtotal,
          status: 'Pending',
          created_at: createdAtStr
        });

        if (orderErr) throw orderErr;

        // 2. Insert Order Items Rows
        const orderItems = cart.map((item) => ({
          order_id: orderId,
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        }));

        const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
        if (itemsErr) throw itemsErr;

        // 3. Deduct product stocks
        for (const item of cart) {
          const { data: dbProd } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product.id)
            .maybeSingle();

          const currentStock = dbProd ? Number(dbProd.stock) : item.product.stock;
          const newStock = Math.max(0, currentStock - item.quantity);

          await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.product.id);
        }
      } catch (err) {
        console.error('Supabase submitOrder failed, processing locally only:', err);
      }
    }

    // Process locally to keep frontend reactive
    let newOrder: Order = {
      id: orderId,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      pickupWindow: orderData.pickupWindow,
      paymentRoute: orderData.paymentRoute,
      items: [...cart],
      subtotal,
      status: 'Pending',
      createdAt: createdAtStr
    };

    set((state) => {
      const updatedProducts = state.products.map((p) => {
        const cartItem = cart.find((item) => item.product.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      });

      return {
        products: updatedProducts,
        orders: [newOrder, ...state.orders],
        cart: []
      };
    });

    return newOrder;
  },

  updateOrderStatus: async (orderId, status) => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('orders')
          .update({ status })
          .eq('id', orderId);
      } catch (err) {
        console.error('Supabase updateOrderStatus failed, updating locally only:', err);
      }
    }

    set((state) => ({
      orders: state.orders.map((o) => o.id === orderId ? { ...o, status } : o)
    }));
  },

  setAnalyticsCycle: (cycle) => set({ analyticsCycle: cycle }),

  getAnalyticsData: () => {
    const { orders, analyticsCycle } = get();
    
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

    const completedOrders = orders.filter(o => o.status === 'Completed');
    const orderSum = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);

    if (orderSum === 0) {
      if (analyticsCycle === 'daily') return dailyBase;
      if (analyticsCycle === 'weekly') return weeklyBase;
      if (analyticsCycle === 'monthly') return monthlyBase;
      return yearlyBase;
    }

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

  addStockBulk: async (parsedProducts) => {
    if (isSupabaseConfigured && supabase) {
      try {
        for (const newP of parsedProducts) {
          const { data: existing } = await supabase
            .from('products')
            .select('stock, name, category, price, description')
            .eq('barcode', newP.barcode)
            .maybeSingle();

          if (existing) {
            await supabase
              .from('products')
              .update({
                stock: Number(existing.stock) + newP.stock,
                name: newP.name || existing.name,
                category: newP.category || existing.category,
                price: newP.price || Number(existing.price),
                description: newP.description || existing.description
              })
              .eq('barcode', newP.barcode);
          } else {
            await supabase.from('products').insert({
              id: newP.id,
              barcode: newP.barcode,
              name: newP.name,
              category: newP.category,
              price: newP.price,
              stock: newP.stock,
              description: newP.description
            });
          }
        }
      } catch (err) {
        console.error('Supabase addStockBulk failed, updating locally only:', err);
      }
    }

    set((state) => {
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
    });
  },

  updateProductInline: async (id, field, value) => {
    if (isSupabaseConfigured && supabase) {
      try {
        let typedValue = value;
        if (field === 'price') typedValue = parseFloat(value) || 0;
        if (field === 'stock') typedValue = parseInt(value, 10) || 0;

        await supabase
          .from('products')
          .update({ [field]: typedValue })
          .eq('id', id);
      } catch (err) {
        console.error('Supabase updateProductInline failed, updating locally only:', err);
      }
    }

    set((state) => {
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
    });
  }
}));
