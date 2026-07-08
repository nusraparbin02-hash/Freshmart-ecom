-- Supabase Database Schema for Fresh Mart eCommerce

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id text PRIMARY KEY,
    barcode text UNIQUE NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    price numeric(10, 2) NOT NULL DEFAULT 0.00,
    stock integer NOT NULL DEFAULT 0,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Allow public read access to products" 
ON public.products FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow public write access to products (for store admin and checkout demo operations)
CREATE POLICY "Allow public write access to products" 
ON public.products FOR ALL 
TO anon, authenticated 
USING (true)
WITH CHECK (true);


-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id text PRIMARY KEY,
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    customer_address text NOT NULL,
    pickup_window text NOT NULL,
    payment_route text NOT NULL,
    subtotal numeric(10, 2) NOT NULL,
    status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Packed', 'Completed')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow public read access to orders
CREATE POLICY "Allow public read access to orders" 
ON public.orders FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow public write access to orders (for submitting new orders and updating status)
CREATE POLICY "Allow public write access to orders" 
ON public.orders FOR ALL 
TO anon, authenticated 
USING (true)
WITH CHECK (true);


-- 3. Create Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id text REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id text REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity integer NOT NULL CHECK (quantity > 0),
    price numeric(10, 2) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on Order Items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access to order items
CREATE POLICY "Allow public read access to order_items" 
ON public.order_items FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow public write access to order items
CREATE POLICY "Allow public write access to order_items" 
ON public.order_items FOR ALL 
TO anon, authenticated 
USING (true)
WITH CHECK (true);


-- Seed default products if they don't exist
INSERT INTO public.products (id, barcode, name, category, price, stock, description)
VALUES 
    ('p1', '880123456789', 'Organic Gala Apples', 'Produce', 2.99, 45, 'Crisp, sweet, and locally harvested organic red apples.'),
    ('p2', '880234567890', 'Fresh Bananas Bunch', 'Produce', 1.49, 80, 'Rich in potassium, a bundle of fresh yellow sweet bananas.'),
    ('p3', '880345678901', 'Organic Whole Milk 1G', 'Dairy', 4.89, 20, 'Pasteurized whole milk from local pasture-raised cows.'),
    ('p4', '880456789012', 'Country Sourdough Bread', 'Bakery', 3.99, 12, 'Freshly baked artisanal sourdough bread with a crispy crust.'),
    ('p5', '880567890123', 'Premium Ribeye Steak 12oz', 'Meat', 14.99, 8, 'Marbled, grass-fed choice ribeye beef steak.'),
    ('p6', '880678901234', 'Extra Virgin Olive Oil 500ml', 'Pantry', 9.49, 30, 'Cold-pressed extra virgin olive oil imported from Greece.')
ON CONFLICT (id) DO UPDATE 
SET 
    barcode = EXCLUDED.barcode,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    description = EXCLUDED.description;
