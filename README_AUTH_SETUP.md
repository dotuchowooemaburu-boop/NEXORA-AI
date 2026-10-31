# NEXORA AI — Authentication and AI connection setup

## Existing authentication

The app uses Supabase Auth for sign-up, email verification, sign-in, password reset and persistent sessions. Keep `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set in Netlify.

## Required database update

Run the complete updated `supabase/schema.sql` in Supabase SQL Editor. It preserves existing profile/project data and adds `generation_jobs`, `result_url`, `output_text`, expanded project types, and the `nexora-inputs` storage bucket with user-folder upload rules.

## Netlify environment variables

Add the following in Site configuration → Environment variables, then redeploy:

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Server-side Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase publishable/anon key used for session verification |
| `FAL_KEY` | Server-only Fal API key for image/video/audio models |
| `GEMINI_API_KEY` | Server-only Gemini API key for planning tools |

Do not use a Supabase service-role key. Do not prefix AI provider keys with `VITE_`.

## Workspaces and provider calls

- Media workspaces call `/.netlify/functions/nexora-generate`, then poll `/.netlify/functions/nexora-status`.
- Film Director, World Builder, One-Prompt Factory and Creative Assistant call `/.netlify/functions/nexora-plan`.
- Functions verify the user's Supabase access token before creating or reading a job.

## Note on cost

Fal and Gemini API usage can incur charges. Check current provider pricing and set provider-side budgets/limits before public launch. This project does not promise unlimited free AI generation.
