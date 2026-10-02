import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Product,
  ProductVariant,
  CartItem,
  User,
  Order,
  OrderItem,
  EmailLog,
  CheckoutFormPayload,
} from '../src/types/store.js';
import { INITIAL_PRODUCTS } from './catalogueSeed.js';

interface PersistedState {
  users: User[];
  sessions: Record<string, string>; // token -> user_id
  products: Omit<Product, 'variants'>[];
  product_variants: ProductVariant[];
  cart_items: {
    id: string;
    session_id: string;
    user_id: string | null;
    product_id: string;
    variant_id: string;
    quantity: number;
    updated_at: string;
  }[];
  orders: Omit<Order, 'items' | 'email_log'>[];
  order_items: OrderItem[];
  email_logs: EmailLog[];
  newsletter_subscribers: { id: string; email: string; created_at: string }[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'aye_studio_relational_db.json');

function isValidSupabaseConfig(): boolean {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
  return (
    url.startsWith('https://') &&
    !url.includes('your-project-ref') &&
    key.length > 20 &&
    !key.includes('your-supabase')
  );
}

class AyeStudioDatabase {
  private state!: PersistedState;
  private supabase: SupabaseClient | null = null;

  constructor() {
    if (isValidSupabaseConfig()) {
      this.supabase = createClient(
        process.env.SUPABASE_URL!,
        (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)!
      );
    }
    this.loadOrSeed();
  }

  private loadOrSeed() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw) as PersistedState;
        if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
          this.state = parsed;
          for (const seedProd of INITIAL_PRODUCTS) {
            const existing = this.state.products.find((p) => p.id === seedProd.id);
            if (existing) {
              existing.images = seedProd.images;
            }
          }
          this.persist();
          return;
        }
      } catch {
        // Fall through to seed
      }
    }

    const products: Omit<Product, 'variants'>[] = [];
    const product_variants: ProductVariant[] = [];

    for (const item of INITIAL_PRODUCTS) {
      const { variants, ...prodData } = item;
      products.push(prodData);
      for (const v of variants) {
        product_variants.push({ ...v });
      }
    }

    this.state = {
      users: [],
      sessions: {},
      products,
      product_variants,
      cart_items: [],
      orders: [],
      order_items: [],
      email_logs: [],
      newsletter_subscribers: [],
    };

    this.persist();
  }

  private persist() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf8');
  }

  private hydrateProduct(prod: Omit<Product, 'variants'>): Product {
    const variants = this.state.product_variants.filter((v) => v.product_id === prod.id);
    const total_inventory = variants.reduce((sum, v) => sum + v.inventory_quantity, 0);
    return {
      ...prod,
      variants,
      total_inventory,
    };
  }

  public async listProducts(params: {
    category?: string;
    search?: string;
    sort?: string;
    featured?: boolean;
    newArrivals?: boolean;
  }): Promise<Product[]> {
    let list = this.state.products.map((p) => this.hydrateProduct(p));

    if (params.category && params.category !== 'All') {
      list = list.filter(
        (p) => p.category.toLowerCase() === params.category!.toLowerCase()
      );
    }

    if (params.featured) {
      list = list.filter((p) => p.is_featured);
    }

    if (params.newArrivals) {
      list = list.filter((p) => p.is_new_arrival);
    }

    if (params.search && params.search.trim().length > 0) {
      const q = params.search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.colour.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.composition.toLowerCase().includes(q)
      );
    }

    switch (params.sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        list.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'name-asc':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
        break;
    }

    return list;
  }

  public async getProductBySlugOrId(slugOrId: string): Promise<Product | null> {
    const found = this.state.products.find(
      (p) => p.slug === slugOrId || p.id === slugOrId
    );
    if (!found) return null;
    return this.hydrateProduct(found);
  }

  public async getCart(sessionId: string, userId?: string | null): Promise<CartItem[]> {
    if (userId) {
      const sessionItems = this.state.cart_items.filter(
        (ci) => ci.session_id === sessionId && !ci.user_id
      );
      if (sessionItems.length > 0) {
        for (const item of sessionItems) {
          item.user_id = userId;
        }
        this.persist();
      }
    }

    const rawItems = this.state.cart_items.filter((ci) =>
      userId ? ci.user_id === userId || ci.session_id === sessionId : ci.session_id === sessionId
    );

    const hydrated: CartItem[] = [];
    for (const ci of rawItems) {
      const prod = this.state.products.find((p) => p.id === ci.product_id);
      const variant = this.state.product_variants.find((v) => v.id === ci.variant_id);
      if (!prod || !variant) continue;

      hydrated.push({
        id: ci.id,
        session_id: ci.session_id,
        user_id: ci.user_id,
        product_id: ci.product_id,
        variant_id: ci.variant_id,
        quantity: ci.quantity,
        product: {
          id: prod.id,
          slug: prod.slug,
          name: prod.name,
          price: prod.price,
          colour: prod.colour,
          colour_hex: prod.colour_hex,
          image: prod.images[0],
          category: prod.category,
        },
        variant: {
          id: variant.id,
          sku: variant.sku,
          size: variant.size,
          colour: variant.colour,
          inventory_quantity: variant.inventory_quantity,
        },
      });
    }

    return hydrated;
  }

  public async addOrUpdateCartItem(params: {
    sessionId: string;
    userId?: string | null;
    productId: string;
    variantId: string;
    quantityDelta?: number;
    exactQuantity?: number;
  }): Promise<{ cart: CartItem[]; error?: string }> {
    const prod = this.state.products.find((p) => p.id === params.productId);
    const variant = this.state.product_variants.find(
      (v) => v.id === params.variantId && v.product_id === params.productId
    );

    if (!prod || !variant) {
      return { cart: await this.getCart(params.sessionId, params.userId), error: 'Selected garment variant was not found.' };
    }

    if (variant.inventory_quantity <= 0) {
      return {
        cart: await this.getCart(params.sessionId, params.userId),
        error: `${prod.name} in size ${variant.size} is currently out of stock.`,
      };
    }

    const existing = this.state.cart_items.find(
      (ci) =>
        ci.variant_id === params.variantId &&
        (params.userId
          ? ci.user_id === params.userId || ci.session_id === params.sessionId
          : ci.session_id === params.sessionId)
    );

    const targetQty =
      typeof params.exactQuantity === 'number'
        ? params.exactQuantity
        : (existing ? existing.quantity : 0) + (params.quantityDelta || 1);

    if (targetQty <= 0) {
      if (existing) {
        this.state.cart_items = this.state.cart_items.filter((ci) => ci.id !== existing.id);
        this.persist();
      }
      return { cart: await this.getCart(params.sessionId, params.userId) };
    }

    if (targetQty > variant.inventory_quantity) {
      return {
        cart: await this.getCart(params.sessionId, params.userId),
        error: `Only ${variant.inventory_quantity} piece${variant.inventory_quantity === 1 ? '' : 's'} available in size ${variant.size}.`,
      };
    }

    if (existing) {
      existing.quantity = targetQty;
      existing.updated_at = new Date().toISOString();
      if (params.userId) existing.user_id = params.userId;
    } else {
      this.state.cart_items.push({
        id: crypto.randomUUID(),
        session_id: params.sessionId,
        user_id: params.userId || null,
        product_id: params.productId,
        variant_id: params.variantId,
        quantity: targetQty,
        updated_at: new Date().toISOString(),
      });
    }

    this.persist();
    return { cart: await this.getCart(params.sessionId, params.userId) };
  }

  public async removeCartItem(sessionId: string, cartItemId: string, userId?: string | null): Promise<CartItem[]> {
    this.state.cart_items = this.state.cart_items.filter(
      (ci) =>
        !(
          ci.id === cartItemId &&
          (userId ? ci.user_id === userId || ci.session_id === sessionId : ci.session_id === sessionId)
        )
    );
    this.persist();
    return this.getCart(sessionId, userId);
  }

  public async clearCart(sessionId: string, userId?: string | null): Promise<void> {
    this.state.cart_items = this.state.cart_items.filter(
      (ci) =>
        !(userId ? ci.user_id === userId || ci.session_id === sessionId : ci.session_id === sessionId)
    );
    this.persist();
  }

  public async upsertGoogleUser(profile: {
    google_id: string;
    email: string;
    name: string;
    avatar_url?: string;
  }): Promise<{ user: User; token: string }> {
    const normalizedEmail = profile.email.trim().toLowerCase();
    let user = this.state.users.find(
      (u) => u.google_id === profile.google_id || u.email.toLowerCase() === normalizedEmail
    );

    if (user) {
      user.name = profile.name || user.name;
      user.google_id = profile.google_id || user.google_id;
      if (profile.avatar_url) user.avatar_url = profile.avatar_url;
    } else {
      user = {
        id: crypto.randomUUID(),
        google_id: profile.google_id,
        email: normalizedEmail,
        name: profile.name,
        avatar_url: profile.avatar_url,
        default_country: 'Nigeria',
        created_at: new Date().toISOString(),
      };
      this.state.users.push(user);
    }

    for (const ord of this.state.orders) {
      if (!ord.user_id && ord.customer_email.toLowerCase() === normalizedEmail) {
        ord.user_id = user.id;
      }
    }

    const token = `aye_sess_${crypto.randomBytes(24).toString('hex')}`;
    this.state.sessions[token] = user.id;
    this.persist();

    if (this.supabase) {
      try {
        await this.supabase.from('users').upsert({
          id: user.id,
          google_id: user.google_id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url || null,
        });
      } catch {}
    }

    return { user, token };
  }

  public async getUserByToken(token?: string | null): Promise<User | null> {
    if (!token) return null;
    const userId = this.state.sessions[token];
    if (!userId) return null;
    return this.state.users.find((u) => u.id === userId) || null;
  }

  public async updateUserProfile(
    userId: string,
    updates: Partial<Pick<User, 'name' | 'phone' | 'default_address' | 'default_city' | 'default_state' | 'default_country'>>
  ): Promise<User | null> {
    const user = this.state.users.find((u) => u.id === userId);
    if (!user) return null;
    if (updates.name !== undefined) user.name = updates.name.trim();
    if (updates.phone !== undefined) user.phone = updates.phone.trim();
    if (updates.default_address !== undefined) user.default_address = updates.default_address.trim();
    if (updates.default_city !== undefined) user.default_city = updates.default_city.trim();
    if (updates.default_state !== undefined) user.default_state = updates.default_state.trim();
    if (updates.default_country !== undefined) user.default_country = updates.default_country.trim();
    this.persist();
    return user;
  }

  public async revokeSession(token: string): Promise<void> {
    delete this.state.sessions[token];
    this.persist();
  }

  public async createOrder(params: {
    sessionId: string;
    userId?: string | null;
    payload: CheckoutFormPayload;
  }): Promise<{ order?: Order; error?: string }> {
    const cartItems = await this.getCart(params.sessionId, params.userId);
    if (cartItems.length === 0) {
      return { error: 'Your shopping bag is empty.' };
    }

    for (const item of cartItems) {
      const variant = this.state.product_variants.find((v) => v.id === item.variant_id);
      if (!variant || variant.inventory_quantity < item.quantity) {
        const avail = variant ? variant.inventory_quantity : 0;
        return {
          error:
            avail === 0
              ? `${item.product.name} (Size ${item.variant.size}) is no longer in stock. Please remove it from your bag to proceed.`
              : `Only ${avail} unit(s) of ${item.product.name} (Size ${item.variant.size}) remain in stock. Please adjust your bag quantity.`,
        };
      }
    }

    for (const item of cartItems) {
      const variant = this.state.product_variants.find((v) => v.id === item.variant_id)!;
      variant.inventory_quantity -= item.quantity;
    }

    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    let delivery_fee = 8500;
    if (params.payload.delivery_method === 'vi_ikoyi_courier') {
      delivery_fee = subtotal >= 250000 ? 0 : 5000;
    } else if (params.payload.delivery_method === 'lagos_mainland') {
      delivery_fee = subtotal >= 250000 ? 0 : 7500;
    } else if (params.payload.delivery_method === 'nigeria_dhl') {
      delivery_fee = 16500;
    } else if (params.payload.delivery_method === 'international_dhl') {
      delivery_fee = 65000;
    }

    const total = subtotal + delivery_fee;
    const orderId = crypto.randomUUID();
    const numericSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `AYE-26-${numericSuffix}`;
    const createdAt = new Date().toISOString();

    const orderItems: OrderItem[] = cartItems.map((ci) => ({
      id: crypto.randomUUID(),
      order_id: orderId,
      product_id: ci.product_id,
      variant_id: ci.variant_id,
      product_name: ci.product.name,
      product_slug: ci.product.slug,
      product_image: ci.product.image,
      size: ci.variant.size,
      colour: ci.variant.colour,
      sku: ci.variant.sku,
      unit_price: ci.product.price,
      quantity: ci.quantity,
      line_total: ci.product.price * ci.quantity,
    }));

    const matchedUser =
      (params.userId && this.state.users.find((u) => u.id === params.userId)) ||
      this.state.users.find(
        (u) => u.email.toLowerCase() === params.payload.customer_email.trim().toLowerCase()
      );

    const orderRecord: Omit<Order, 'items' | 'email_log'> = {
      id: orderId,
      order_number: orderNumber,
      user_id: matchedUser ? matchedUser.id : null,
      customer_name: params.payload.customer_name.trim(),
      customer_email: params.payload.customer_email.trim().toLowerCase(),
      customer_phone: params.payload.customer_phone.trim(),
      delivery_address: params.payload.delivery_address.trim(),
      city: params.payload.city.trim(),
      state: params.payload.state.trim(),
      country: params.payload.country.trim() || 'Nigeria',
      delivery_method: params.payload.delivery_method,
      delivery_notes: params.payload.delivery_notes?.trim() || '',
      subtotal,
      delivery_fee,
      total,
      status: 'Confirmed',
      mailgun_status: 'queued',
      created_at: createdAt,
    };

    if (matchedUser) {
      matchedUser.phone = orderRecord.customer_phone;
      matchedUser.default_address = orderRecord.delivery_address;
      matchedUser.default_city = orderRecord.city;
      matchedUser.default_state = orderRecord.state;
      matchedUser.default_country = orderRecord.country;
    }

    this.state.orders.unshift(orderRecord);
    this.state.order_items.push(...orderItems);

    await this.clearCart(params.sessionId, params.userId);
    this.persist();

    if (this.supabase) {
      try {
        await this.supabase.from('orders').insert(orderRecord);
        await this.supabase.from('order_items').insert(orderItems);
      } catch {}
    }

    return {
      order: {
        ...orderRecord,
        items: orderItems,
        email_log: null,
      },
    };
  }

  public async recordEmailLog(log: EmailLog): Promise<void> {
    this.state.email_logs.unshift(log);
    const ord = this.state.orders.find((o) => o.id === log.order_id);
    if (ord) {
      ord.mailgun_message_id = log.provider_message_id;
      ord.mailgun_status = log.status;
    }
    this.persist();
  }

  public async getOrderByNumberOrId(orderRef: string): Promise<Order | null> {
    const ord = this.state.orders.find(
      (o) => o.order_number.toLowerCase() === orderRef.toLowerCase() || o.id === orderRef
    );
    if (!ord) return null;
    const items = this.state.order_items.filter((oi) => oi.order_id === ord.id);
    const email_log = this.state.email_logs.find((el) => el.order_id === ord.id) || null;
    return {
      ...ord,
      items,
      email_log,
    };
  }

  public async getOrdersForUser(user: User): Promise<Order[]> {
    const matching = this.state.orders.filter(
      (o) =>
        o.user_id === user.id ||
        o.customer_email.toLowerCase() === user.email.toLowerCase()
    );

    return matching.map((ord) => ({
      ...ord,
      items: this.state.order_items.filter((oi) => oi.order_id === ord.id),
      email_log: this.state.email_logs.find((el) => el.order_id === ord.id) || null,
    }));
  }

  public async subscribeNewsletter(email: string): Promise<{ alreadySubscribed: boolean }> {
    const clean = email.trim().toLowerCase();
    const exists = this.state.newsletter_subscribers.find((s) => s.email === clean);
    if (exists) {
      return { alreadySubscribed: true };
    }
    this.state.newsletter_subscribers.push({
      id: crypto.randomUUID(),
      email: clean,
      created_at: new Date().toISOString(),
    });
    this.persist();
    return { alreadySubscribed: false };
  }
}

export const db = new AyeStudioDatabase();
