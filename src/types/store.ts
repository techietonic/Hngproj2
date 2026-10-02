export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  size: string;
  colour: string;
  inventory_quantity: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  price: number; // in NGN (₦)
  description: string;
  category: 'Dresses' | 'Tops & Shirts' | 'Trousers & Skirts' | 'Outerwear' | 'Leather Goods';
  colour: string;
  colour_hex: string;
  images: string[];
  composition: string;
  fit: string;
  care: string;
  shipping: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  editorial_aspect: '3:4' | '4:5' | '4:3';
  created_at: string;
  variants: ProductVariant[];
  total_inventory?: number;
}

export interface CartItem {
  id: string;
  session_id: string;
  user_id?: string | null;
  product_id: string;
  variant_id: string;
  quantity: number;
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    colour: string;
    colour_hex: string;
    image: string;
    category: string;
  };
  variant: {
    id: string;
    sku: string;
    size: string;
    colour: string;
    inventory_quantity: number;
  };
}

export interface User {
  id: string;
  google_id: string;
  email: string;
  name: string;
  avatar_url?: string;
  phone?: string;
  default_address?: string;
  default_city?: string;
  default_state?: string;
  default_country?: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  product_slug: string;
  product_image: string;
  size: string;
  colour: string;
  sku: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface EmailLog {
  id: string;
  order_id: string;
  order_number: string;
  recipient_email: string;
  subject: string;
  provider: string;
  status: 'sent' | 'queued' | 'dispatched_local_relay';
  provider_message_id: string;
  html_body: string;
  text_body: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  city: string;
  state: string;
  country: string;
  delivery_method: string;
  delivery_notes?: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: 'Confirmed' | 'In Atelier Preparation' | 'Dispatched' | 'Delivered';
  mailgun_message_id?: string;
  mailgun_status: string;
  created_at: string;
  items: OrderItem[];
  email_log?: EmailLog | null;
}

export interface CheckoutFormPayload {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  city: string;
  state: string;
  country: string;
  delivery_method: 'vi_ikoyi_courier' | 'lagos_mainland' | 'nigeria_dhl' | 'international_dhl';
  delivery_notes?: string;
}
