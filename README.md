# NEXORA AI — Multi-tool Creative Universe

Responsive React + Vite application with Supabase authentication, private per-user project history, Netlify serverless API functions and provider adapters.

## Workspaces included

- **AI Image:** text-to-image, image editing and image background removal.
- **AI Video:** text-to-video and image-to-video (start-frame workflow).
- **AI Music & SFX:** text-to-audio music and sound effects.
- **AI Voice Studio:** text-to-speech voiceover generation.
- **Speech to Text:** audio transcription.
- **AI Film Director:** scripts, scene plans and shot lists.
- **AI World Builder:** character/world bibles and continuity rules.
- **One-Prompt Factory:** multi-format campaign and production plans.
- **AI Creative Assistant:** creative ideation and prompt improvement.

## Important: provider credentials are required

The frontend is wired to real provider APIs through Netlify Functions. It does not create fake images, audio or video. The media tools use Fal queue endpoints; planning workspaces use the Gemini `generateContent` API. Provider keys are read only by server-side functions and must never be placed in `VITE_` variables or browser code.

A provider account and usage balance/credits may be required. Fal pricing is pay-per-use and varies by model, output duration, resolution and options. Free Netlify hosting does not pay for AI inference.

## Setup / migration

1. Keep the existing Supabase frontend variables in Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (publishable/anon key only)
2. In Netlify, also add these server-side variables:
   - `SUPABASE_URL` — same Supabase project URL
   - `SUPABASE_ANON_KEY` — same publishable/anon key (used only to verify the signed-in user)
   - `FAL_KEY` — Fal API key
   - `GEMINI_API_KEY` — Google Gemini API key
3. Open Supabase Dashboard → SQL Editor and run the **updated** `supabase/schema.sql` file. This adds the generation-jobs table, project result fields, expanded project types and a public-read/private-upload bucket for source media. Existing profiles and projects are retained.
4. Deploy the project to Netlify. The `netlify.toml` file configures the Functions directory.
5. Sign in and test each workspace. The first successful generation will create a job and project record. Long jobs are polled through the server function.

## Provider model defaults

Defaults are defined in `netlify/functions/nexora-generate.mjs` and can be overridden with server-side environment variables:

- `FAL_IMAGE_MODEL` — `fal-ai/flux/dev`
- `FAL_IMAGE_EDIT_MODEL` — `fal-ai/flux-kontext/dev`
- `FAL_REMOVE_BG_MODEL` — `fal-ai/birefnet/v2`
- `FAL_VIDEO_MODEL` — `fal-ai/kling-video/v3/standard/text-to-video`
- `FAL_IMAGE_TO_VIDEO_MODEL` — `fal-ai/kling-video/v3/standard/image-to-video`
- `FAL_MUSIC_MODEL` / `FAL_SFX_MODEL` — `fal-ai/stable-audio-25/text-to-audio`
- `FAL_TTS_MODEL` — `fal-ai/maya`
- `FAL_STT_MODEL` — `fal-ai/speech-to-text`
- `GEMINI_MODEL` — `gemini-2.5-flash`

Model access, exact input schema, availability and price can change at the provider. If you override a model, confirm its endpoint and input fields in the provider model documentation.

## Local development

```bash
npm install
npm run dev
```

Vite alone does not execute Netlify Functions. To test serverless endpoints locally, install Netlify CLI and run `netlify dev` after setting local environment variables. Do not commit `.env` or API secrets.

## Production build

```bash
npm run build
```

The output is written to `dist/`.

## Security notes

- Users must have a valid Supabase session to call the generation and planning functions.
- Generation jobs are stored per user and protected by Row Level Security.
- Fal and Gemini secrets remain server-side.
- The `nexora-inputs` storage bucket is public-read so the remote model provider can fetch source files; uploads/deletes are restricted to the authenticated user's own folder. Do not upload confidential files.
- Add rate limits, quotas, moderation and billing controls before opening the service to the public. The starter does not yet implement a paid-credit ledger or per-user spend cap.

## Current limitations

- Source media uploads are capped at 50 MB by the bucket configuration.
- Image/video/audio processing options depend on the selected model; not every model supports every ratio, duration or quality option.
- Character memory and world continuity are currently generated as written planning documents, not yet persistent fine-tuned identity models.
- One-Prompt Factory produces a coordinated production package. It does not automatically spend credits to render every media asset in one click yet; users can take the returned prompts into the corresponding workspaces.
- Voice cloning is not enabled. Any future voice-cloning feature must require proof of speaker consent.
