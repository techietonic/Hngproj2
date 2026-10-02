import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Product, ProductVariant, CartItem, Order, User } from '../src/types/store';

// Check if running in browser or Node
const isBrowser = typeof window !== 'undefined';

// Read environment variables (supports Vite VITE_ prefix as well as process.env)
const envUrl =
  (isBrowser && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : '') ||
  '';

const envKey =
  (isBrowser && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined'
    ? process.env?.SUPABASE_SERVICE_ROLE_KEY || process.env?.SUPABASE_ANON_KEY
    : '') ||
  '';

export function isSupabaseConfigured(): boolean {
  return (
    typeof envUrl === 'string' &&
    envUrl.startsWith('https://') &&
    !envUrl.includes('your-project-ref') &&
    typeof envKey === 'string' &&
    envKey.length > 20 &&
    !envKey.includes('your-anon-key')
  );
}

// Fallback dummy URL so createClient does not crash if env is missing
const dummyUrl = 'https://ayestudio-placeholder.supabase.co';
const dummyKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummykeyplaceholderaye';

export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? envUrl : dummyUrl,
  isSupabaseConfigured() ? envKey : dummyKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export interface FetchProductsOptions {
  category?: string;
  search?: string;
  sort?: string;
  featured?: boolean;
}

export async function fetchProducts(options?: FetchProductsOptions): Promise<Product[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('products').select('*, variants:product_variants(*)');
      if (options?.category && options.category !== 'All') {
        query = query.eq('category', options.category);
      }
      if (options?.featured) {
        query = query.eq('is_featured', true);
      }
      if (options?.sort === 'price-low') {
        query = query.order('price', { ascending: true });
      } else if (options?.sort === 'price-high') {
        query = query.order('price', { ascending: false });
      } else if (options?.sort === 'newest') {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    } catch {
      // Fallback to API route
    }
  }

  const params = new URLSearchParams();
  if (options?.category && options.category !== 'All') params.set('category', options.category);
  if (options?.search) params.set('q', options.search);
  if (options?.sort) params.set('sort', options.sort);
  if (options?.featured) params.set('featured', 'true');

  const res = await fetch(`/api/products?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, variants:product_variants(*)')
        .eq('slug', slug)
        .single();
      if (!error && data) {
        return data as Product;
      }
    } catch {
      // Fallback
    }
  }

  const res = await fetch(`/api/products/${slug}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch product');
  }
  return res.json();
}

export async function fetchProductVariants(productId: string): Promise<ProductVariant[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId);
      if (!error && data) {
        return data as ProductVariant[];
      }
    } catch {
      // Fallback
    }
  }

  const res = await fetch(`/api/products/id/${productId}/variants`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchCart(sessionId: string, userId?: string): Promise<CartItem[]> {
  const headers: Record<string, string> = { 'x-session-id': sessionId };
  if (userId) headers['x-user-id'] = userId;

  const res = await fetch('/api/cart', { headers });
  if (!res.ok) return [];
  const data = await res.json();
  return data.cart || [];
}

export async function addToCart(payload: {
  sessionId: string;
  productId: string;
  variantId: string;
  quantity: number;
}): Promise<CartItem[]> {
  const res = await fetch('/api/cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': payload.sessionId,
    },
    body: JSON.stringify({
      product_id: payload.productId,
      variant_id: payload.variantId,
      quantity: payload.quantity,
    }),
  });
  if (!res.ok) throw new Error('Failed to add item to cart');
  const data = await res.json();
  return data.cart;
}

export async function updateCartItemQuantity(
  sessionId: string,
  productId: string,
  variantId: string,
  quantity: number
): Promise<CartItem[]> {
  const res = await fetch('/api/cart', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': sessionId,
    },
    body: JSON.stringify({
      product_id: productId,
      variant_id: variantId,
      quantity,
    }),
  });
  if (!res.ok) throw new Error('Failed to update cart quantity');
  const data = await res.json();
  return data.cart;
}

export async function removeCartItem(sessionId: string, cartItemId: string): Promise<CartItem[]> {
  const res = await fetch(`/api/cart/${cartItemId}`, {
    method: 'DELETE',
    headers: {
      'x-session-id': sessionId,
    },
  });
  if (!res.ok) throw new Error('Failed to remove cart item');
  const data = await res.json();
  return data.cart;
}

export async function createOrder(
  sessionId: string,
  orderData: any,
  authToken?: string
): Promise<{ order: Order; emailLog: any }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-session-id': sessionId,
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch('/api/orders', {
    method: 'POST',
    headers,
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.error || 'Failed to create order');
  }

  return res.json();
}

export async function fetchUserOrders(authToken: string): Promise<Order[]> {
  const res = await fetch('/api/orders/user', {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.orders || [];
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const res = await fetch(`/api/orders/${orderId}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.order || null;
}

export async function subscribeToNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Newsletter subscription failed');
  }
  return data;
}
