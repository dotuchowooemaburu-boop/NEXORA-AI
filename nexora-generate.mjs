import { authenticate, json, supabaseRequest } from './_shared.mjs';

const MODEL_DEFAULTS = {
  image: 'fal-ai/flux/dev',
  image_edit: 'fal-ai/flux-kontext/dev',
  image_remove_bg: 'fal-ai/birefnet/v2',
  video: 'fal-ai/kling-video/v3/standard/text-to-video',
  video_image: 'fal-ai/kling-video/v3/standard/image-to-video',
  music: 'fal-ai/stable-audio-25/text-to-audio',
  sfx: 'fal-ai/stable-audio-25/text-to-audio',
  voice: 'fal-ai/maya',
  transcribe: 'fal-ai/speech-to-text'
};

const MODEL_ENV = {
  image: 'FAL_IMAGE_MODEL', image_edit: 'FAL_IMAGE_EDIT_MODEL', image_remove_bg: 'FAL_REMOVE_BG_MODEL',
  video: 'FAL_VIDEO_MODEL', video_image: 'FAL_IMAGE_TO_VIDEO_MODEL', music: 'FAL_MUSIC_MODEL',
  sfx: 'FAL_SFX_MODEL', voice: 'FAL_TTS_MODEL', transcribe: 'FAL_STT_MODEL'
};

function modelFor(task) { return process.env[MODEL_ENV[task]] || MODEL_DEFAULTS[task]; }
function buildInput(task, body) {
  const { prompt, aspect = '16:9', quality = 'Standard', sourceUrl, duration = '5', voiceStyle = 'Warm, natural, conversational' } = body;
  const imageSize = ({ '16:9': 'landscape_16_9', '9:16': 'portrait_16_9', '1:1': 'square_hd', '4:5': 'portrait_4_3' })[aspect] || 'landscape_16_9';
  const steps = quality === 'Ultra' ? 40 : quality === 'High' ? 34 : 28;
  if (task === 'image') return { prompt, image_size: imageSize, num_images: 1, num_inference_steps: steps, enable_safety_checker: true };
  if (task === 'image_edit') return { prompt, image_url: sourceUrl, num_images: 1, enable_safety_checker: true };
  if (task === 'image_remove_bg') return { image_url: sourceUrl };
  if (task === 'video') return { prompt, duration: String(duration), aspect_ratio: aspect, generate_audio: false };
  if (task === 'video_image') return { prompt, start_image_url: sourceUrl, duration: String(duration), aspect_ratio: aspect, generate_audio: false };
  if (task === 'music' || task === 'sfx') return { prompt };
  if (task === 'voice') return { text: prompt, prompt: voiceStyle };
  if (task === 'transcribe') return { audio_url: sourceUrl, use_pnc: true };
  throw new Error('This generation task is not supported.');
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });
  try {
    const auth = await authenticate(event);
    if (!process.env.FAL_KEY) return json(503, { error: 'The AI media engine is not configured yet. Add FAL_KEY to Netlify environment variables. The key stays on the server.' });
    const body = JSON.parse(event.body || '{}');
    const task = String(body.task || '');
    const allowed = ['image','image_edit','image_remove_bg','video','video_image','music','sfx','voice','transcribe'];
    if (!allowed.includes(task)) return json(400, { error: 'Choose a supported AI generation task.' });
    const prompt = String(body.prompt || '').trim();
    if (task !== 'image_remove_bg' && task !== 'transcribe' && !prompt) return json(400, { error: task === 'voice' ? 'Enter the words you want spoken.' : 'Enter a prompt first.' });
    if (['image_edit','image_remove_bg','video_image','transcribe'].includes(task) && !String(body.sourceUrl || '').trim()) return json(400, { error: 'Add a publicly reachable source file URL for this operation.' });
    if (prompt.length > 8000) return json(400, { error: 'Please keep the prompt under 8,000 characters.' });

    const model = modelFor(task);
    const input = buildInput(task, { ...body, prompt });
    const falResponse = await fetch(`https://queue.fal.run/${model}`, {
      method: 'POST',
      headers: { Authorization: `Key ${process.env.FAL_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    const falData = await falResponse.json().catch(() => ({}));
    if (!falResponse.ok) return json(falResponse.status, { error: falData.detail || falData.message || falData.error || 'The AI provider rejected this request. Check your provider account, model access and balance.' });

    const projectType = task.startsWith('image') ? 'image' : task.startsWith('video') ? 'video' : task === 'voice' || task === 'transcribe' || task === 'music' || task === 'sfx' ? 'audio' : 'director';
    const titlePrompt = prompt || (task === 'image_remove_bg' ? 'Remove image background' : 'Transcribe audio');
    const projectRows = await supabaseRequest(auth, 'projects', {
      method: 'POST', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ user_id: auth.user.id, type: projectType, prompt: titlePrompt, status: 'Queued — waiting for AI provider' })
    });
    const project = Array.isArray(projectRows) ? projectRows[0] : projectRows;
    const jobRows = await supabaseRequest(auth, 'generation_jobs', {
      method: 'POST', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        user_id: auth.user.id, project_id: project.id, task, model_id: model,
        request_id: falData.request_id, status_url: falData.status_url, response_url: falData.response_url,
        status: falData.status || 'IN_QUEUE', prompt: titlePrompt
      })
    });
    const job = Array.isArray(jobRows) ? jobRows[0] : jobRows;
    return json(200, { ok: true, projectId: project.id, jobId: job.id, requestId: falData.request_id, model, status: falData.status || 'IN_QUEUE', queuePosition: falData.queue_position ?? null, task });
  } catch (error) {
    return json(400, { error: error.message || 'Could not start generation.' });
  }
}
