import {
  Product,
  CartItem,
  User,
  Order,
  EmailLog,
  CheckoutFormPayload,
} from '../types/store';
import { INITIAL_PRODUCTS } from '../../server/catalogueSeed';

const SESSION_STORAGE_KEY = 'aye_studio_session_id';
const AUTH_TOKEN_KEY = 'aye_studio_auth_token';

export function getSessionId(): string {
  let sid = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem(SESSION_STORAGE_KEY, sid);
  }
  return sid;
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-aye-session': getSessionId(),
    ...extra,
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function readJson<T>(res: Response): Promise<T> {
  const body = await res.text();
  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error(res.ok
      ? 'The server returned an invalid response.'
      : `The server is temporarily unavailable (${res.status}). Please try again.`);
  }
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

function fallbackProducts(params?: {
  category?: string;
  q?: string;
  sort?: string;
  featured?: boolean;
  newArrivals?: boolean;
}): Product[] {
  let products = [...INITIAL_PRODUCTS];
  if (params?.category && params.category !== 'All') products = products.filter((product) => product.category.toLowerCase() === params.category!.toLowerCase());
  if (params?.featured) products = products.filter((product) => product.is_featured);
  if (params?.newArrivals) products = products.filter((product) => product.is_new_arrival);
  if (params?.q?.trim()) {
    const query = params.q.trim().toLowerCase();
    products = products.filter((product) => [product.name, product.subtitle, product.description, product.colour, product.category, product.composition].some((field) => field.toLowerCase().includes(query)));
  }
  if (params?.sort === 'price-asc') products.sort((a, b) => a.price - b.price);
  else if (params?.sort === 'price-desc') products.sort((a, b) => b.price - a.price);
  else if (params?.sort === 'newest') products.sort((a, b) => b.created_at.localeCompare(a.created_at));
  else if (params?.sort === 'name-asc') products.sort((a, b) => a.name.localeCompare(b.name));
  else products.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
  return products;
}

export const api = {
  async fetchProducts(params?: {
    category?: string;
    q?: string;
    sort?: string;
    featured?: boolean;
    newArrivals?: boolean;
  }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.set('category', params.category);
    if (params?.q && params.q.trim()) query.set('q', params.q.trim());
    if (params?.sort) query.set('sort', params.sort);
    if (params?.featured) query.set('featured', 'true');
    if (params?.newArrivals) query.set('newArrivals', 'true');

    const qs = query.toString();
    try {
      const res = await fetch(`/api/products${qs ? `?${qs}` : ''}`, { headers: buildHeaders() });
      if (!res.ok) throw new Error(`Catalogue request returned ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.products)) throw new Error('Catalogue response was invalid');
      return data.products;
    } catch {
      return fallbackProducts(params);
    }
  },

  async fetchProductDetail(slugOrId: string): Promise<{ product: Product; related: Product[] }> {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(slugOrId)}`, { headers: buildHeaders() });
      if (!res.ok) throw new Error('Product request failed');
      return readJson<{ product: Product; related: Product[] }>(res);
    } catch {
      const product = INITIAL_PRODUCTS.find((item) => item.slug === slugOrId || item.id === slugOrId);
      if (!product) throw new Error('Product not found.');
      return {
        product,
        related: INITIAL_PRODUCTS.filter((item) => item.id !== product.id && (item.category === product.category || item.is_featured)).slice(0, 3),
      };
    }
  },

  async fetchCart(): Promise<CartItem[]> {
    const res = await fetch('/api/cart', {
      headers: buildHeaders(),
    });
    if (!res.ok) throw new Error('Unable to load shopping bag.');
    const data = await readJson<{ cart: CartItem[] }>(res);
    return data.cart;
  },

  async addToCart(productId: string, variantId: string, quantity = 1): Promise<{ cart: CartItem[]; error?: string }> {
    const res = await fetch('/api/cart/items', {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ productId, variantId, quantity }),
    });
    const data = await readJson<{ cart: CartItem[]; error?: string }>(res);
    if (!res.ok) {
      throw new Error(data.error || 'Could not add item to bag.');
    }
    return data;
  },

  async updateCartQuantity(productId: string, variantId: string, quantity: number): Promise<{ cart: CartItem[] }> {
    const res = await fetch(`/api/cart/items/${encodeURIComponent(variantId)}`, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: JSON.stringify({ productId, quantity }),
    });
    const data = await readJson<{ cart: CartItem[]; error?: string }>(res);
    if (!res.ok) {
      throw new Error(data.error || 'Could not update quantity.');
    }
    return data;
  },

  async removeCartItem(cartItemId: string): Promise<{ cart: CartItem[] }> {
    const res = await fetch(`/api/cart/items/${encodeURIComponent(cartItemId)}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    });
    const data = await readJson<{ cart: CartItem[]; error?: string }>(res);
    if (!res.ok) {
      throw new Error(data.error || 'Could not remove item.');
    }
    return data;
  },

  async getCurrentUser(): Promise<User | null> {
    const token = getAuthToken();
    if (!token) return null;
    const res = await fetch('/api/auth/me', {
      headers: buildHeaders(),
    });
    if (!res.ok) {
      setAuthToken(null);
      return null;
    }
    const data = await readJson<{ user: User | null }>(res);
    return data.user;
  },

  async verifyGoogleLogin(payload: {
    credential?: string;
    name?: string;
    email?: string;
    google_id?: string;
    avatar_url?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/google/verify', {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await readJson<{ user: User; token: string; error?: string }>(res);
    if (!res.ok) {
      throw new Error(data.error || 'Google authentication failed.');
    }
    setAuthToken(data.token);
    return data;
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const res = await fetch('/api/auth/me', {
      method: 'PATCH',
      headers: buildHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await readJson<{ user: User; error?: string }>(res);
    if (!res.ok) {
      throw new Error(data.error || 'Could not update profile.');
    }
    return data.user;
  },

  async logout(): Promise<void> {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: buildHeaders(),
    }).catch(() => {});
    setAuthToken(null);
  },

  async submitOrder(payload: CheckoutFormPayload): Promise<{
    order: Order;
    emailLog: EmailLog;
  }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await readJson<{ order: Order; emailLog: EmailLog; error?: string; fieldErrors?: Record<string, string> }>(res);
    if (!res.ok) {
      const err = new Error(data.error || 'Order creation failed.') as Error & {
        fieldErrors?: Record<string, string>;
      };
      err.fieldErrors = data.fieldErrors;
      throw err;
    }
    return data;
  },

  async fetchMyOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders/my', {
      headers: buildHeaders(),
    });
    if (!res.ok) {
      throw new Error('Please sign in to view your order history.');
    }
    const data = await readJson<{ orders: Order[] }>(res);
    return data.orders;
  },

  async fetchOrderByRef(orderRef: string): Promise<Order> {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderRef)}`, {
      headers: buildHeaders(),
    });
    const data = await readJson<{ order: Order; error?: string }>(res);
    if (!res.ok) {
      throw new Error(data.error || 'Order not found.');
    }
    return data.order;
  },

  async subscribeNewsletter(email: string): Promise<string> {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ email }),
    });
    const data = await readJson<{ message: string; error?: string }>(res);
    if (!res.ok) {
      throw new Error(data.error || 'Subscription failed.');
    }
    return data.message;
  },
};
