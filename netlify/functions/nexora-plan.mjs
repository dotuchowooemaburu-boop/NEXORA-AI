import { authenticate, json, supabaseRequest } from '../lib/shared.mjs';

const TASKS = {
  director: 'Act as an expert film director and screenwriter. Create a practical production-ready film blueprint with logline, synopsis, characters, locations, scene-by-scene script, dialogue, camera directions, lighting, sound and continuity notes.',
  world: 'Act as an expert world-building designer for film and games. Create a coherent world bible with world premise, rules, geography, cultures, key locations, character profiles, visual identity, recurring motifs and continuity rules.',
  factory: 'Act as a creative production studio. Turn the brief into a coordinated content package: campaign concept, audience, hooks, short script, storyboard, image prompts, video prompts, voiceover script, music direction, captions and platform-specific variants. Make each asset prompt independently usable in the matching NEXORA tool.',
  assistant: 'Act as the NEXORA AI creative copilot. Give direct, practical, creative help. Improve the brief, point out missing details, and provide a ready-to-use prompt or next steps.'
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') return json(200, { ok: true });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed.' });
  try {
    const auth = await authenticate(req);
    const body = JSON.parse((await req.text()) || '{}');
    const task = String(body.task || '');
    if (!TASKS[task]) return json(400, { error: 'Unsupported planning workspace.' });
    const prompt = String(body.prompt || '').trim();
    if (!prompt) return json(400, { error: 'Enter a creative brief first.' });
    if (prompt.length > 8000) return json(400, { error: 'Please keep your brief under 8,000 characters.' });
    const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    const geminiBaseUrl = (process.env.GOOGLE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com').replace(/\/$/, '');
    const response = await fetch(`${geminiBaseUrl}/v1beta/models/${model}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${TASKS[task]} Use clear headings and concrete detail. Avoid claiming you generated media files; this workspace creates a written plan only.` }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 5000 }
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return json(response.status, { error: data.error?.message || 'The planning model could not complete this request.' });
    const output = (data.candidates?.[0]?.content?.parts || []).map(part => part.text || '').join('\n').trim();
    if (!output) return json(502, { error: 'The planning model returned an empty response. Please try a more detailed brief.' });
    const projectType = task === 'director' ? 'director' : task;
    const rows = await supabaseRequest(auth, 'projects', {
      method: 'POST', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ user_id: auth.user.id, type: projectType, prompt, status: 'AI plan created', output_text: output })
    });
    return json(200, { ok: true, output, project: Array.isArray(rows) ? rows[0] : rows, model });
  } catch (error) {
    return json(400, { error: error.message || 'Could not create the plan.' });
  }
}
