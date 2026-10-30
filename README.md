# NEXORA AI — Starter Website

A responsive black-and-gold creative-studio frontend built with React + Vite.

## What works in this starter
- Responsive dashboard and navigation.
- AI Video, AI Image, AI Audio and AI Film Director workspaces.
- Prompt entry, aspect-ratio and quality-target controls.
- Saves creative briefs to the browser's local storage.
- Recent creations and project history.
- Provider setup guidance.

## Important: generation is not connected yet
This starter deliberately does **not** fake AI outputs. The generation UI saves a brief locally and explains that a provider must be connected. Real video, image and audio generation requires model-provider access, server-side API integration, and usually usage credits or compute. A free hosting plan does not make model inference free.

## Run locally
1. Install Node.js (LTS).
2. In this folder run `npm install`.
3. Run `npm run dev`.
4. Open the local address printed by Vite.

## Build for deployment
Run `npm run build`. The production site is written to `dist/`.

## Free static hosting options
You can deploy the `dist/` folder to a static host such as Netlify, Cloudflare Pages, or Vercel. Check each host's current free-plan limits before publishing.

## Next development milestone
Add a secure backend and provider adapters:
- Image model provider
- Video model provider
- Audio / speech / music provider
- Job queue and progress polling for long-running generations
- Storage for generated media and user accounts

Keep provider API keys in server-side environment variables. Never put secret keys in React/browser code or commit them to Git.
