-- ============================================
-- QUITANDAS FARM HOUSE - ESTRUTURA DO BANCO DE DADOS (SUPABASE)
-- Copie e cole este script no SQL Editor do seu projeto Supabase e clique em RUN
-- ============================================

-- 1. Tabela de Pedidos
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL,
    customer JSONB NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    delivery_fee NUMERIC(10,2) NOT NULL,
    discount NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    delivery_type TEXT NOT NULL,
    address TEXT,
    reference TEXT,
    payment_method TEXT NOT NULL,
    payment_label TEXT NOT NULL,
    change_for NUMERIC(10,2),
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Clientes Cadastrados
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    reference TEXT,
    login_method TEXT DEFAULT 'Manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabela de Visitantes Sem Cadastro
CREATE TABLE IF NOT EXISTS public.visitors (
    session_id TEXT PRIMARY KEY,
    device TEXT,
    first_visit TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    page_views INTEGER DEFAULT 1,
    items_viewed JSONB DEFAULT '[]'::jsonb,
    cart_items_count INTEGER DEFAULT 0,
    cart_total NUMERIC(10,2) DEFAULT 0,
    converted BOOLEAN DEFAULT false,
    user_identified TEXT
);

-- Habilitar Row Level Security (RLS) permissivo para APIs públicas de delivery
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura anonima em pedidos" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Permitir insercao anonima em pedidos" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizacao anonima em pedidos" ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Permitir leitura anonima em clientes" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Permitir insercao anonima em clientes" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizacao anonima em clientes" ON public.customers FOR UPDATE USING (true);

CREATE POLICY "Permitir leitura anonima em visitantes" ON public.visitors FOR SELECT USING (true);
CREATE POLICY "Permitir insercao anonima em visitantes" ON public.visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizacao anonima em visitantes" ON public.visitors FOR UPDATE USING (true);
