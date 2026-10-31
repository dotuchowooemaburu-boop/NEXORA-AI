import { authenticate, json, supabaseRequest, firstMediaUrl } from '../lib/shared.mjs';

export default async function handler(req) {
  if (req.method === 'OPTIONS') return json(200, { ok: true });
  if (req.method !== 'GET') return json(405, { error: 'Method not allowed.' });
  try {
    const auth = await authenticate(req);
    if (!process.env.FAL_KEY) return json(503, { error: 'FAL_KEY is not configured on the server.' });
    const requestId = new URL(req.url).searchParams.get('request_id');
    if (!requestId) return json(400, { error: 'Missing request_id.' });
    const rows = await supabaseRequest(auth, `generation_jobs?request_id=eq.${encodeURIComponent(requestId)}&select=*`);
    const job = rows?.[0];
    if (!job) return json(404, { error: 'Generation job not found for this account.' });

    const statusResponse = await fetch(job.status_url, { headers: { Authorization: `Key ${process.env.FAL_KEY}` } });
    const statusData = await statusResponse.json().catch(() => ({}));
    if (!statusResponse.ok) return json(statusResponse.status, { error: statusData.detail || statusData.message || 'Could not check provider status.' });
    let result = null;
    let resultUrl = job.output_url || '';
    let status = statusData.status || job.status;
    if (status === 'COMPLETED' && !resultUrl) {
      const resultResponse = await fetch(job.response_url, { headers: { Authorization: `Key ${process.env.FAL_KEY}` } });
      result = await resultResponse.json().catch(() => ({}));
      if (!resultResponse.ok) return json(resultResponse.status, { error: result.detail || result.message || 'The provider finished but its result could not be retrieved.' });
      if (result.error || resultDataError(result)) status = 'FAILED';
      else resultUrl = firstMediaUrl(result);
    }
    const update = { status, queue_position: statusData.queue_position ?? null, output_url: resultUrl || null, updated_at: new Date().toISOString() };
    await supabaseRequest(auth, `generation_jobs?id=eq.${encodeURIComponent(job.id)}`, { method: 'PATCH', body: JSON.stringify(update) });
    if (job.project_id) {
      await supabaseRequest(auth, `projects?id=eq.${encodeURIComponent(job.project_id)}`, {
        method: 'PATCH', body: JSON.stringify({ status: status === 'COMPLETED' ? 'Generation complete' : status === 'FAILED' ? 'Generation failed' : status, result_url: resultUrl || null })
      });
    }
    return json(200, { ok: true, status, queuePosition: statusData.queue_position ?? null, resultUrl, result, error: statusData.error || result?.error || null });
  } catch (error) {
    return json(400, { error: error.message || 'Could not check generation status.' });
  }
}

function resultDataError(result) {
  return Boolean(result?.detail && !result?.images && !result?.video && !result?.audio && !result?.output);
}
