import {
  Product,
  CartItem,
  User,
  Order,
  EmailLog,
  CheckoutFormPayload,
} from '../types/store';

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

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
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
    const res = await fetch(`/api/products${qs ? `?${qs}` : ''}`, {
      headers: buildHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to load catalogue from server.');
    }
    const data = await res.json();
    return data.products;
  },

  async fetchProductDetail(slugOrId: string): Promise<{ product: Product; related: Product[] }> {
    const res = await fetch(`/api/products/${encodeURIComponent(slugOrId)}`, {
      headers: buildHeaders(),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Product not found.');
    }
    return res.json();
  },

  async fetchCart(): Promise<CartItem[]> {
    const res = await fetch('/api/cart', {
      headers: buildHeaders(),
    });
    if (!res.ok) throw new Error('Unable to load shopping bag.');
    const data = await res.json();
    return data.cart;
  },

  async addToCart(productId: string, variantId: string, quantity = 1): Promise<{ cart: CartItem[]; error?: string }> {
    const res = await fetch('/api/cart/items', {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ productId, variantId, quantity }),
    });
    const data = await res.json();
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
    const data = await res.json();
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
    const data = await res.json();
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
    const data = await res.json();
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
    const data = await res.json();
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
    const data = await res.json();
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
    const data = await res.json();
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
    const data = await res.json();
    return data.orders;
  },

  async fetchOrderByRef(orderRef: string): Promise<Order> {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderRef)}`, {
      headers: buildHeaders(),
    });
    const data = await res.json();
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
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Subscription failed.');
    }
    return data.message;
  },
};
