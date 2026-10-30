# NEXORA AI — Authentication milestone

## What was added
- Supabase email/password registration and sign-in.
- Email verification flow (Supabase sends the confirmation email).
- Password reset email flow.
- Persistent Supabase session and secure logout.
- Protected creative dashboard.
- User profile creation and per-user project history in PostgreSQL.
- Row-level security policies so users can only read/write their own records.
- The existing React/Vite creative workspace and black/gold styling are preserved.

## Required setup (one-time)
1. Create a Supabase project.
2. In Supabase, open **SQL Editor**, paste and run `supabase/schema.sql`.
3. In Supabase **Authentication > URL Configuration**, set the Site URL to your deployed website origin. Add that same origin to Redirect URLs. For local development add `http://localhost:5173/**`.
4. In Supabase **Authentication > Providers > Email**, enable email/password. Keep email confirmation enabled for verified sign-ups.
5. Copy the Project URL and the publishable/anon key from Project Settings > API.
6. Create `.env` in the project root using `.env.example` and fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Install dependencies with `npm install`, then run `npm run dev`.
8. For Netlify/Vercel/Cloudflare Pages, add the same two variables in the site's environment-variable settings and redeploy.

## Important security notes
- The anon/publishable key is designed for browser use. The database is protected by the included RLS policies.
- Never put the Supabase `service_role` key, a model-provider API key, or any other secret in `VITE_*` variables.
- Supabase email delivery on the default configuration may have testing limits. Configure a production SMTP provider in Supabase for reliable public registration.
- Configure production redirect URLs to your exact website domain.

## Current honest status
Authentication code is implemented but requires your Supabase project URL/key and SQL setup before it can be live-tested on your deployment. The creative brief workflow now saves to the signed-in user's database account. AI media generation is intentionally not represented as working yet; the first real image model integration is the next milestone and requires a server-side provider credential and endpoint.
