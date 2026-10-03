import 'dotenv/config';
import fs from 'fs';
import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import { db } from './server/db.js';
import { sendMailgunOrderConfirmation } from './server/mailgunService.js';
import { renderEditorialPhotoSvg, renderLookbookPlateSvg } from './server/lookbookRenderer.js';
import { CheckoutFormPayload } from './src/types/store.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

function createOAuthState(): string {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 10 * 60 * 1000, nonce: crypto.randomUUID() })).toString('base64url');
  const secret = process.env.GOOGLE_CLIENT_SECRET || 'development-only-oauth-state-secret';
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function isValidOAuthState(state: unknown): boolean {
  if (typeof state !== 'string') return false;
  const [payload, signature] = state.split('.');
  if (!payload || !signature) return false;
  const secret = process.env.GOOGLE_CLIENT_SECRET || 'development-only-oauth-state-secret';
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')).exp > Date.now(); } catch { return false; }
}

function extractSessionId(req: Request): string {
  const headerSession = req.headers['x-aye-session'];
  if (typeof headerSession === 'string' && headerSession.trim().length > 0) {
    return headerSession.trim();
  }
  return 'default_anon_session';
}

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

export async function createApp() {
  const app = express();
  // Vercel terminates TLS before forwarding requests to this function. Trusting
  // that proxy preserves https in the OAuth redirect URI when APP_URL is unset.
  app.set('trust proxy', 1);

  // Vercel rewrites /api/* to the single api/index function. Preserve the
  // original endpoint path carried in the rewrite query before Express starts
  // matching routes (e.g. /api/cart or /api/auth/google/url).
  app.use((req: Request, _res: Response, next) => {
    const routePath = typeof req.query.path === 'string' ? req.query.path : '';
    if (routePath && (req.path === '/api/index' || req.path === '/api')) {
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(req.query)) {
        if (key === 'path') continue;
        if (Array.isArray(value)) value.forEach((item) => query.append(key, String(item)));
        else if (value !== undefined) query.set(key, String(value));
      }
      req.url = `/api/${routePath.replace(/^\/+/, '')}${query.toString() ? `?${query}` : ''}`;
      (req as Request & { _parsedUrl?: unknown })._parsedUrl = undefined;
    }
    next();
  });
  app.use(express.json({ limit: '2mb' }));

  app.use(
    '/src/assets/images',
    express.static(path.resolve(process.cwd(), 'src/assets/images'), {
      maxAge: '7d',
    })
  );

  app.get('/api/lookbook-photo/:slugWithExt', (req: Request, res: Response) => {
    const slug = String(req.params.slugWithExt || '').replace(/\.svg$/i, '');
    const svg = renderEditorialPhotoSvg(slug);
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(svg);
  });

  app.get('/api/lookbook-plate/:slug/:viewWithExt', (req: Request, res: Response) => {
    const slug = String(req.params.slug || '');
    const view = String(req.params.viewWithExt || '').replace(/\.svg$/i, '');
    const svg = renderLookbookPlateSvg(slug, view);
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(svg);
  });

  app.get('/api/products', async (req: Request, res: Response) => {
    try {
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      const search =
        typeof req.query.q === 'string'
          ? req.query.q
          : typeof req.query.search === 'string'
          ? req.query.search
          : undefined;
      const sort = typeof req.query.sort === 'string' ? req.query.sort : undefined;
      const featured = req.query.featured === 'true';
      const newArrivals = req.query.newArrivals === 'true';

      const products = await db.listProducts({
        category,
        search,
        sort,
        featured,
        newArrivals,
      });

      res.json({ products, count: products.length });
    } catch {
      res.status(500).json({ error: 'Unable to retrieve product catalogue from database.' });
    }
  });

  app.get('/api/products/:slugOrId', async (req: Request, res: Response) => {
    try {
      const product = await db.getProductBySlugOrId(String(req.params.slugOrId));
      if (!product) {
        res.status(404).json({ error: 'Piece not found in the AYÉ STUDIO archive.' });
        return;
      }

      const allProducts = await db.listProducts({});
      const related = allProducts
        .filter((p) => p.id !== product.id && (p.category === product.category || p.is_featured))
        .slice(0, 3);

      res.json({ product, related });
    } catch {
      res.status(500).json({ error: 'Failed to retrieve product details.' });
    }
  });

  app.get('/api/cart', async (req: Request, res: Response) => {
    try {
      const sessionId = extractSessionId(req);
      const token = extractBearerToken(req);
      const user = await db.getUserByToken(token);
      const cart = await db.getCart(sessionId, user?.id);
      res.json({ cart });
    } catch {
      res.status(500).json({ error: 'Failed to load shopping bag.' });
    }
  });

  app.post('/api/cart/items', async (req: Request, res: Response) => {
    try {
      const sessionId = extractSessionId(req);
      const token = extractBearerToken(req);
      const user = await db.getUserByToken(token);
      const { productId, variantId, quantity } = req.body as {
        productId?: string;
        variantId?: string;
        quantity?: number;
      };

      if (!productId || !variantId) {
        res.status(400).json({ error: 'Please select a size before adding to your bag.' });
        return;
      }

      const result = await db.addOrUpdateCartItem({
        sessionId,
        userId: user?.id,
        productId,
        variantId,
        quantityDelta: typeof quantity === 'number' && quantity > 0 ? quantity : 1,
      });

      if (result.error) {
        res.status(400).json({ error: result.error, cart: result.cart });
        return;
      }

      res.json({ cart: result.cart });
    } catch {
      res.status(500).json({ error: 'Failed to add item to shopping bag.' });
    }
  });

  app.patch('/api/cart/items/:variantId', async (req: Request, res: Response) => {
    try {
      const sessionId = extractSessionId(req);
      const token = extractBearerToken(req);
      const user = await db.getUserByToken(token);
      const variantId = String(req.params.variantId);
      const { productId, quantity } = req.body as { productId?: string; quantity?: number };

      if (!productId || typeof quantity !== 'number') {
        res.status(400).json({ error: 'Invalid quantity update request.' });
        return;
      }

      const result = await db.addOrUpdateCartItem({
        sessionId,
        userId: user?.id,
        productId,
        variantId,
        exactQuantity: quantity,
      });

      if (result.error) {
        res.status(400).json({ error: result.error, cart: result.cart });
        return;
      }

      res.json({ cart: result.cart });
    } catch {
      res.status(500).json({ error: 'Failed to update bag quantity.' });
    }
  });

  app.delete('/api/cart/items/:cartItemId', async (req: Request, res: Response) => {
    try {
      const sessionId = extractSessionId(req);
      const token = extractBearerToken(req);
      const user = await db.getUserByToken(token);
      const cart = await db.removeCartItem(sessionId, String(req.params.cartItemId), user?.id);
      res.json({ cart });
    } catch {
      res.status(500).json({ error: 'Failed to remove item from bag.' });
    }
  });

  app.get('/api/auth/google/config', (_req: Request, res: Response) => {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
    const hasLiveGoogleClient =
      Boolean(clientId) && !clientId.includes('your-google-client-id') && Boolean(process.env.GOOGLE_CLIENT_SECRET);
    res.json({
      configured: hasLiveGoogleClient,
      clientId: hasLiveGoogleClient ? clientId : null,
    });
  });

  app.get('/api/auth/google/url', (req: Request, res: Response) => {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
    const hasLiveGoogleClient =
      Boolean(clientId) && !clientId.includes('your-google-client-id');

    const origin =
      process.env.APP_URL && !process.env.APP_URL.includes('MY_APP_URL')
        ? process.env.APP_URL.replace(/\/$/, '')
        : `${req.protocol}://${req.get('host')}`;
    const redirectUri = `${origin}/api/auth/google/callback`;

    if (hasLiveGoogleClient && process.env.GOOGLE_CLIENT_SECRET) {
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'online',
        prompt: 'select_account',
        state: createOAuthState(),
      });
      res.json({
        mode: 'google_cloud_oauth',
        url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      });
      return;
    }

    res.status(503).json({ error: 'Google OAuth is not configured. Add Google Cloud client credentials first.' });
  });

  app.get('/api/auth/google/chooser', (_req: Request, res: Response) => {
    res.status(410).type('text/plain').send('Demo account chooser removed. Configure Google Cloud OAuth to sign in.');
    return;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sign in - Google Accounts</title>
  <style>
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { margin: 0; background: #F7F5F0; color: #161514; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { width: 100%; max-width: 420px; background: #FFFFFF; border: 1px solid #DCD6CC; padding: 36px 32px; }
    .google-header { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #5f6368; border-bottom: 1px solid #eee; padding-bottom: 14px; margin-bottom: 24px; }
    h1 { font-size: 22px; font-weight: 500; margin: 0 0 8px; color: #202124; }
    .sub { font-size: 14px; color: #5f6368; margin: 0 0 24px; }
    .sub strong { color: #161514; }
    .account-btn { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #e0e0e0; background: #fff; cursor: pointer; text-align: left; margin-bottom: 10px; transition: background 0.15s; }
    .account-btn:hover { background: #f8f9fa; border-color: #161514; }
    .avatar { width: 36px; height: 36px; background: #281E18; color: #F7F5F0; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; flex-shrink: 0; }
    .acc-name { font-size: 14px; font-weight: 500; color: #202124; }
    .acc-email { font-size: 12px; color: #5f6368; }
    .divider { margin: 20px 0 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #786B5E; }
    label { display: block; font-size: 12px; color: #3c4043; margin-bottom: 6px; font-weight: 500; }
    input { width: 100%; padding: 10px 12px; border: 1px solid #dadce0; font-size: 14px; margin-bottom: 14px; outline: none; }
    input:focus { border-color: #161514; }
    .submit-btn { width: 100%; padding: 12px; background: #161514; color: #F7F5F0; border: none; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; font-weight: 500; }
    .submit-btn:hover { background: #3E3027; }
  </style>
</head>
<body>
  <div class="card">
    <div class="google-header">
      <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
      <span>Sign in with Google</span>
    </div>
    <h1>Choose an account</h1>
    <p class="sub">to continue to <strong>AYÉ STUDIO Lagos</strong></p>

    <button type="button" class="account-btn" onclick="selectAccount('Summie Apatira', 'apatirasummie@gmail.com')">
      <div class="avatar">SA</div>
      <div>
        <div class="acc-name">Summie Apatira</div>
        <div class="acc-email">apatirasummie@gmail.com</div>
      </div>
    </button>

    <button type="button" class="account-btn" onclick="selectAccount('Adesua Balogun', 'adesua.balogun@ayestudio.lagos')">
      <div class="avatar" style="background:#5A4638;">AB</div>
      <div>
        <div class="acc-name">Adesua Balogun</div>
        <div class="acc-email">adesua.balogun@ayestudio.lagos</div>
      </div>
    </button>

    <div class="divider">Or sign in with another Google account</div>
    <form onsubmit="submitCustom(event)">
      <label for="name">Full Name</label>
      <input id="name" type="text" placeholder="e.g. Temi Otedola" required />
      <label for="email">Google Email</label>
      <input id="email" type="email" placeholder="name@gmail.com" required />
      <button type="submit" class="submit-btn">Continue with Google</button>
    </form>
  </div>

  <script>
    async function selectAccount(name, email) {
      try {
        const res = await fetch('/api/auth/google/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, google_id: 'google_' + email })
        });
        const data = await res.json();
        if (window.opener) {
          window.opener.postMessage({ type: 'AYE_GOOGLE_AUTH_SUCCESS', payload: data }, window.location.origin);
          window.close();
        }
      } catch (e) {
        console.error(e);
      }
    }
    function submitCustom(e) {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      selectAccount(name, email);
    }
  </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });

  app.get('/api/auth/google/callback', async (req: Request, res: Response) => {
    try {
      const code = typeof req.query.code === 'string' ? req.query.code : '';
      const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
      const origin =
        process.env.APP_URL && !process.env.APP_URL.includes('MY_APP_URL')
          ? process.env.APP_URL.replace(/\/$/, '')
          : `${req.protocol}://${req.get('host')}`;
      const redirectUri = `${origin}/api/auth/google/callback`;

      if (!code || !clientId || !clientSecret || !isValidOAuthState(req.query.state)) {
        res.status(400).send('Google sign-in could not be verified. Please try again.');
        return;
      }

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }).toString(),
      });

      if (!tokenRes.ok) {
        res.status(502).send('Google did not accept this sign-in request. Please try again.');
        return;
      }

      const tokenData = (await tokenRes.json()) as { access_token?: string };
      const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const profile = (await profileRes.json()) as {
        id?: string;
        email?: string;
        name?: string;
        picture?: string;
        verified_email?: boolean;
      };

      if (!profileRes.ok || !profile.id || !profile.email || profile.verified_email === false) {
        res.status(502).send('Google did not return a verified account profile.');
        return;
      }

      const authData = await db.upsertGoogleUser({
        google_id: profile.id || `google_${crypto.randomUUID()}`,
        email: profile.email || 'client@ayestudio.lagos',
        name: profile.name || 'AYÉ Client',
        avatar_url: profile.picture,
      });

      res.send(`<!DOCTYPE html><html><body><script>
        if (window.opener) {
          window.opener.postMessage({ type: 'AYE_GOOGLE_AUTH_SUCCESS', payload: ${JSON.stringify(authData)} }, window.location.origin);
          window.close();
        } else {
          window.location.href = '/';
        }
      </script></body></html>`);
    } catch {
      res.status(500).send('Google sign-in could not be completed. Please try again.');
    }
  });

  app.post('/api/auth/google/verify', async (req: Request, res: Response) => {
    try {
      const { credential, name, email, google_id, avatar_url } = req.body as {
        credential?: string;
        name?: string;
        email?: string;
        google_id?: string;
        avatar_url?: string;
      };

      if (credential) {
        const verifyRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
        );
        if (verifyRes.ok) {
          const tokenInfo = (await verifyRes.json()) as {
            sub: string;
            email: string;
            name?: string;
            picture?: string;
            aud?: string;
            email_verified?: string;
          };
          const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
          if (!clientId || tokenInfo.aud !== clientId || tokenInfo.email_verified !== 'true') {
            res.status(401).json({ error: 'Google credential validation failed.' });
            return;
          }
          const result = await db.upsertGoogleUser({
            google_id: tokenInfo.sub,
            email: tokenInfo.email,
            name: tokenInfo.name || tokenInfo.email.split('@')[0],
            avatar_url: tokenInfo.picture,
          });
          res.json(result);
          return;
        }
      }

      res.status(400).json({ error: 'A verified Google credential is required.' });
    } catch {
      res.status(500).json({ error: 'Authentication verification failed.' });
    }
  });

  app.get('/api/auth/me', async (req: Request, res: Response) => {
    const token = extractBearerToken(req);
    const user = await db.getUserByToken(token);
    if (!user) {
      res.status(401).json({ user: null });
      return;
    }
    res.json({ user });
  });

  app.patch('/api/auth/me', async (req: Request, res: Response) => {
    const token = extractBearerToken(req);
    const user = await db.getUserByToken(token);
    if (!user) {
      res.status(401).json({ error: 'Please sign in to update your account details.' });
      return;
    }
    const updated = await db.updateUserProfile(user.id, req.body);
    res.json({ user: updated });
  });

  app.post('/api/auth/logout', async (req: Request, res: Response) => {
    const token = extractBearerToken(req);
    if (token) {
      await db.revokeSession(token);
    }
    res.json({ success: true });
  });

  app.post('/api/orders', async (req: Request, res: Response) => {
    try {
      const sessionId = extractSessionId(req);
      const token = extractBearerToken(req);
      const user = await db.getUserByToken(token);
      const payload = req.body as CheckoutFormPayload;

      const errors: Record<string, string> = {};
      if (!payload.customer_name || payload.customer_name.trim().length < 2) {
        errors.customer_name = 'Please enter your full name.';
      }
      if (
        !payload.customer_email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.customer_email.trim())
      ) {
        errors.customer_email = 'Please enter a valid email address for your order confirmation.';
      }
      if (!payload.customer_phone || payload.customer_phone.trim().length < 7) {
        errors.customer_phone = 'Please provide a valid contact telephone number.';
      }
      if (!payload.delivery_address || payload.delivery_address.trim().length < 5) {
        errors.delivery_address = 'Please enter a complete street delivery address.';
      }
      if (!payload.city || payload.city.trim().length < 2) {
        errors.city = 'Please enter your city.';
      }
      if (!payload.state || payload.state.trim().length < 2) {
        errors.state = 'Please specify your state or province.';
      }
      if (!payload.country || payload.country.trim().length < 2) {
        errors.country = 'Please specify your delivery country.';
      }

      if (Object.keys(errors).length > 0) {
        res.status(400).json({ error: 'Please check your delivery details.', fieldErrors: errors });
        return;
      }

      const creation = await db.createOrder({
        sessionId,
        userId: user?.id,
        payload,
      });

      if (creation.error || !creation.order) {
        res.status(400).json({ error: creation.error || 'Could not create order.' });
        return;
      }

      const emailLog = await sendMailgunOrderConfirmation(creation.order);
      await db.recordEmailLog(emailLog);

      const finalOrder = await db.getOrderByNumberOrId(creation.order.id);
      res.status(201).json({
        order: finalOrder,
        emailLog,
      });
    } catch {
      res.status(500).json({ error: 'An unexpected error occurred while processing your order.' });
    }
  });

  app.get('/api/orders/my', async (req: Request, res: Response) => {
    const token = extractBearerToken(req);
    const user = await db.getUserByToken(token);
    if (!user) {
      res.status(401).json({ error: 'Authentication required to view order history.' });
      return;
    }
    const orders = await db.getOrdersForUser(user);
    res.json({ orders });
  });

  app.get('/api/orders/:orderRef', async (req: Request, res: Response) => {
    const order = await db.getOrderByNumberOrId(String(req.params.orderRef));
    if (!order) {
      res.status(404).json({ error: 'Order record not found.' });
      return;
    }
    res.json({ order });
  });

  app.post('/api/newsletter', async (req: Request, res: Response) => {
    const { email } = req.body as { email?: string };
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    const result = await db.subscribeNewsletter(email);
    res.json({
      message: result.alreadySubscribed
        ? 'Your email is already registered for studio dispatches.'
        : 'Thank you. You are now subscribed to AYÉ STUDIO seasonal notes.',
    });
  });

  // Never let an API typo fall through to the SPA HTML document. The client
  // can then render a useful error instead of trying to parse HTML as JSON.
  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'API route not found.' });
  });

  if (process.env.NODE_ENV !== 'production') {
    // Keep Vite out of the production/serverless dependency path. The API
    // function only needs Express and the database service at runtime.
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req: Request, res: Response, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api') || url.startsWith('/src')) {
        return next();
      }
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  createApp().then((app) => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`AYE STUDIO Lagos server running on http://0.0.0.0:${PORT}`);
    });
  });
}
