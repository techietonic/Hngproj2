# AYÉ STUDIO

The shop has server-side checkout. Bags, profiles, orders, inventory, newsletter subscriptions, sessions, and email audit logs persist in Supabase. Order confirmations are delivered through Mailgun. Google sign-in uses a Google Cloud OAuth 2.0 web client; browser-provided account details are never treated as proof of identity.

## Run locally

1. Copy `.env.example` to `.env` and fill in the Supabase service-role credentials, Mailgun credentials, app URL, and Google OAuth client credentials.
2. Apply the schema to the Supabase database:

   ```powershell
   psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f supabase/migrations/001_aye_studio_schema.sql
   ```

   The first catalogue request seeds the included products and variants if the database is empty.
3. In Google Cloud Console, add `http://localhost:3000/api/auth/google/callback` and the deployed equivalent under **Authorized redirect URIs** for the configured web client.
4. In Mailgun, verify `MAILGUN_DOMAIN` and authorize `MAILGUN_FROM_EMAIL`.
5. Install and start:

   ```powershell
   npm.cmd install
   npm.cmd run dev
   ```

## Verify

```powershell
npm.cmd run lint
npm.cmd run build
```

For a live end-to-end check, add a product to the bag, complete checkout with a deliverable email, then confirm the new `orders`, `order_items`, `email_logs`, and adjusted `product_variants.inventory_quantity` records in Supabase. The confirmation will appear in Mailgun’s Events log.

## Deploy to Vercel

`vercel.json` builds the Vite site into `dist` and routes every `/api/*` request to the Express serverless function in `api/index.ts`.

In the Vercel project settings, add these environment variables for **Production**, **Preview**, and **Development** as appropriate:

```text
APP_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
MAILGUN_API_KEY
MAILGUN_DOMAIN
MAILGUN_FROM_EMAIL
MAILGUN_API_BASE_URL
```

Set `APP_URL` to the deployed Vercel URL (or custom domain) and add `<APP_URL>/api/auth/google/callback` as an authorized Google Cloud redirect URI. Keep the Supabase service-role key server-only; do not give it a `VITE_` prefix.
