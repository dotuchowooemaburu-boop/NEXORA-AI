import React, { useEffect, useMemo, useState } from 'react';
import {
  Aperture, AudioLines, Clapperboard, WandSparkles, LayoutDashboard, FolderOpen,
  Settings, Sparkles, Plus, ArrowUpRight, Image as ImageIcon, Film, Crown,
  Clock3, Download, Menu, X, Zap, Layers3, Globe2, ShieldCheck, LogOut,
  User, LockKeyhole, Mail, Eye, EyeOff, LoaderCircle, Mic2, Music2,
  Compass, Bot, BookOpen, Video, ImagePlus, Volume2, RefreshCw, ExternalLink
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

const tools = [
  { id: 'video', name: 'AI Video', desc: 'Create cinematic clips from text or an image', icon: Clapperboard, tag: 'CINEMA', group: 'MEDIA' },
  { id: 'image', name: 'AI Image', desc: 'Generate, edit and remove image backgrounds', icon: ImageIcon, tag: 'VISUALS', group: 'MEDIA' },
  { id: 'music', name: 'AI Music & SFX', desc: 'Create original music and sound effects', icon: Music2, tag: 'AUDIO', group: 'MEDIA' },
  { id: 'voice', name: 'AI Voice Studio', desc: 'Turn scripts into expressive voiceovers', icon: Mic2, tag: 'VOICE', group: 'MEDIA' },
  { id: 'transcribe', name: 'Speech to Text', desc: 'Transcribe audio into editable text', icon: AudioLines, tag: 'TOOLS', group: 'MEDIA' },
  { id: 'director', name: 'AI Film Director', desc: 'Develop scripts, scenes and shot lists', icon: Film, tag: 'STUDIO', group: 'INTELLIGENCE' },
  { id: 'world', name: 'AI World Builder', desc: 'Create characters, worlds and visual rules', icon: Globe2, tag: 'WORLDS', group: 'INTELLIGENCE' },
  { id: 'factory', name: 'One-Prompt Factory', desc: 'Plan a coordinated multi-format campaign', icon: Layers3, tag: 'MULTI-TOOL', group: 'INTELLIGENCE' },
  { id: 'assistant', name: 'AI Creative Assistant', desc: 'Brainstorm, improve prompts and plan', icon: Bot, tag: 'COPILOT', group: 'INTELLIGENCE' },
];
const starterPrompts = [
  'A cinematic aerial shot of a futuristic African city at golden hour, atmospheric haze and rich detail',
  'Luxury product photography of a black perfume bottle on polished dark marble with warm gold rim lighting',
  'An emotional cinematic soundtrack with warm piano, subtle strings and a hopeful orchestral rise'
];
const planningModes = ['director', 'world', 'factory', 'assistant'];

function AuthScreen() {
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const titles = { login: 'Welcome back.', signup: 'Create your account.', reset: 'Reset your password.' };

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      if (view === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() }, emailRedirectTo: `${window.location.origin}/` } });
        if (error) throw error;
        setMessage(data.session ? 'Your account is ready. Welcome to NEXORA AI.' : 'Registration successful. Check your inbox and verify your email before signing in.');
      } else if (view === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/` });
        if (error) throw error;
        setMessage('Password reset instructions have been sent to your email.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (e) { setError(e.message || 'Something went wrong. Please try again.'); }
    finally { setBusy(false); }
  }

  return <main className="auth-shell"><div className="auth-card">
    <div className="auth-brand"><div className="brand-mark"><Aperture size={25}/></div><div><div className="brand-name">NEXORA<span>AI</span></div><div className="brand-sub">THE CREATIVE UNIVERSE</div></div></div>
    <div className="eyebrow"><Sparkles size={14}/> IMAGINATION HAS NO CEILING.</div>
    <h1>{titles[view]}</h1><p className="auth-intro">{view === 'login' ? 'Sign in to continue creating.' : view === 'signup' ? 'Your creative universe starts here.' : 'We will email you a secure password reset link.'}</p>
    <form onSubmit={submit}>
      {view === 'signup' && <label className="auth-field"><span>FULL NAME</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" autoComplete="name" required /></label>}
      <label className="auth-field"><span>EMAIL ADDRESS</span><div className="auth-input"><Mail size={17}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required /></div></label>
      {view !== 'reset' && <label className="auth-field"><span>PASSWORD</span><div className="auth-input"><LockKeyhole size={17}/><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} autoComplete={view==='signup'?'new-password':'current-password'} required/><button type="button" className="password-toggle" onClick={()=>setShowPassword(!showPassword)} aria-label="Toggle password visibility">{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>}
      {view === 'login' && <button type="button" className="auth-link forgot" onClick={()=>{setView('reset');setError('');setMessage('')}}>Forgot password?</button>}
      <button className="gold-btn auth-submit" disabled={busy}>{busy?<><LoaderCircle className="spin" size={17}/> Please wait...</>:view==='login'?'Sign in':view==='signup'?'Create account':'Send reset link'} <ArrowUpRight size={17}/></button>
    </form>
    {error && <div className="auth-alert error">{error}</div>}{message && <div className="auth-alert success">{message}</div>}
    <div className="auth-switch">{view==='login'?'New to NEXORA?':view==='signup'?'Already have an account?':'Remembered your password?'} <button className="auth-link" onClick={()=>{setView(view==='login'?'signup':'login');setError('');setMessage('')}}>{view==='login'?'Create account':'Sign in'}</button></div>
    {view==='reset' && <button className="auth-link back-link" onClick={()=>setView('login')}>← Back to sign in</button>}
    <div className="auth-foot"><ShieldCheck size={14}/> Your account and creative workspace are protected.</div>
  </div></main>;
}

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [active, setActive] = useState('home');
  const [mobileNav, setMobileNav] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [aspect, setAspect] = useState('16:9');
  const [duration, setDuration] = useState('5');
  const [quality, setQuality] = useState('Standard');
  const [task, setTask] = useState('generate');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceFile, setSourceFile] = useState(null);
  const [voiceStyle, setVoiceStyle] = useState('Warm, natural, conversational voice');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [projects, setProjects] = useState([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [jobStatus, setJobStatus] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [planOutput, setPlanOutput] = useState('');
  const [lastModel, setLastModel] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) { setAuthLoading(false); return; }
    supabase.auth.getSession().then(({data, error}) => { if (error) setAuthError(error.message); setSession(data?.session || null); setAuthLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => { setSession(next); setAuthLoading(false); });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) { setProfile(null); setProjects([]); return; }
    let alive = true;
    (async () => {
      setProjectLoading(true);
      const user = session.user;
      const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Creator';
      const { data: prof } = await supabase.from('profiles').upsert({ id: user.id, full_name: fullName, email: user.email }, { onConflict: 'id' }).select().single();
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(50);
      if (!alive) return;
      setProfile(prof || { full_name: fullName, email: user.email });
      if (error) setNotice(`Project history could not load: ${error.message}`);
      else setProjects(data || []);
      setProjectLoading(false);
    })();
    return () => { alive = false; };
  }, [session?.user?.id]);

  const activeTool = tools.find(t => t.id === active) || tools[0];
  const Icon = activeTool.icon;
  const countLabel = useMemo(() => `${projects.length} project${projects.length === 1 ? '' : 's'}`, [projects]);
  const token = session?.access_token;

  function resetWorkspace(id) {
    setActive(id); setMobileNav(false); setNotice(''); setResultUrl(''); setPlanOutput(''); setJobStatus(''); setTask('generate'); setSourceUrl(''); setSourceFile(null);
  }
  async function refreshProjects() {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(50);
    setProjects(data || []);
  }
  async function runPlan() {
    const response = await fetch('/.netlify/functions/nexora-plan', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ task: active, prompt }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'The planning request failed.');
    setPlanOutput(data.output || ''); setLastModel(data.model || 'Gemini'); await refreshProjects();
    setNotice('Your AI plan has been created and saved to My Creations.');
  }
  async function runMedia(sourceOverride = sourceUrl.trim()) {
    const taskMap = {
      image: task === 'edit' ? 'image_edit' : task === 'remove_bg' ? 'image_remove_bg' : 'image',
      video: sourceOverride ? 'video_image' : 'video',
      music: task === 'sfx' ? 'sfx' : 'music',
      voice: 'voice', transcribe: 'transcribe'
    };
    const providerTask = taskMap[active];
    const response = await fetch('/.netlify/functions/nexora-generate', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ task: providerTask, prompt, aspect, duration, quality, sourceUrl: sourceOverride, voiceStyle })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'The AI generation request failed.');
    setLastModel(data.model || 'AI provider'); setJobStatus(data.status || 'IN_QUEUE');
    setNotice(data.status === 'IN_QUEUE' ? `Your request is in the provider queue${data.queuePosition !== null ? ` (position ${data.queuePosition})` : ''}. NEXORA is checking its progress.` : 'Your request has been submitted to the AI provider.');
    for (let attempt = 0; attempt < 90; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 4000));
      const statusResponse = await fetch(`/.netlify/functions/nexora-status?request_id=${encodeURIComponent(data.requestId)}`, { headers: { Authorization: `Bearer ${token}` } });
      const statusData = await statusResponse.json();
      if (!statusResponse.ok) throw new Error(statusData.error || 'Could not check generation progress.');
      setJobStatus(statusData.status || 'IN_PROGRESS');
      if (statusData.status === 'COMPLETED') {
        if (statusData.resultUrl) { setResultUrl(statusData.resultUrl); setNotice('Your generation is complete. Preview or download your result below.'); }
        else if (statusData.result?.output) { setPlanOutput(statusData.result.output); setNotice('Your transcription is ready.'); }
        else setNotice('The provider completed the job but returned no preview URL. Check the provider result in your account.');
        await refreshProjects(); return;
      }
      if (statusData.status === 'FAILED') throw new Error(statusData.error || 'The AI provider could not complete this generation.');
      setNotice(statusData.status === 'IN_QUEUE' ? `Waiting in the AI provider queue${statusData.queuePosition !== null ? ` · position ${statusData.queuePosition}` : ''}…` : 'Your AI model is generating. This can take a few minutes…');
    }
    setNotice('This generation is still processing after several minutes. Its job record is saved in My Creations; the provider may still be working.');
  }
  async function generate() {
    const promptRequired = !(active === 'image' && task === 'remove_bg') && active !== 'transcribe';
    if (promptRequired && !prompt.trim()) { setNotice('Add a prompt or script first.'); return; }
    if (['edit','remove_bg'].includes(task) && !sourceUrl.trim() && !sourceFile) { setNotice('Choose an image file or add a public image URL.'); return; }
    if (active === 'transcribe' && !sourceUrl.trim() && !sourceFile) { setNotice('Choose an audio file or add a public audio URL.'); return; }
    setBusy(true); setNotice(''); setResultUrl(''); setPlanOutput(''); setJobStatus('');
    try {
      let resolvedSource = sourceUrl.trim();
      if (sourceFile) {
        if (sourceFile.size > 50 * 1024 * 1024) throw new Error('The selected file is larger than the 50 MB upload limit.');
        setNotice('Uploading your source file securely to your NEXORA storage…');
        const safeName = sourceFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `${session.user.id}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from('nexora-inputs').upload(storagePath, sourceFile, { upsert: false, contentType: sourceFile.type || 'application/octet-stream' });
        if (uploadError) throw new Error(`Source upload failed: ${uploadError.message}. Run the updated Supabase SQL setup first.`);
        resolvedSource = supabase.storage.from('nexora-inputs').getPublicUrl(storagePath).data.publicUrl;
        setSourceUrl(resolvedSource);
      }
      if (planningModes.includes(active)) await runPlan(); else await runMedia(resolvedSource);
    }
    catch (e) { setNotice(e.message || 'Something went wrong. Please try again.'); setJobStatus('FAILED'); }
    finally { setBusy(false); }
  }
  async function logout() { await supabase.auth.signOut(); setActive('home'); }

  const navItems = [
    { id: 'home', label: 'Overview', icon: LayoutDashboard },
    ...tools,
    { id: 'projects', label: 'My Creations', icon: FolderOpen },
  ];
  const isPlanning = planningModes.includes(active);
  const sourceLabel = active === 'video' ? 'START FRAME IMAGE (OPTIONAL)' : active === 'image' && ['edit','remove_bg'].includes(task) ? 'SOURCE IMAGE' : active === 'transcribe' ? 'AUDIO FILE TO TRANSCRIBE' : '';

  if (!isSupabaseConfigured) return <main className="auth-shell"><div className="auth-card setup-card"><div className="auth-brand"><div className="brand-mark"><Aperture size={25}/></div><div><div className="brand-name">NEXORA<span>AI</span></div><div className="brand-sub">THE CREATIVE UNIVERSE</div></div></div><h1>One setup step.</h1><p className="auth-intro">Authentication is implemented, but this deployment is not connected to a Supabase project yet. Add the two public project settings below to your hosting environment, then redeploy.</p><code>VITE_SUPABASE_URL</code><code>VITE_SUPABASE_ANON_KEY</code><p className="auth-alert error">Do not put a service-role key or AI provider secret in these frontend variables.</p><p className="auth-foot">Setup instructions and database SQL are included in the project ZIP.</p></div></main>;
  if (authLoading) return <main className="auth-shell"><div className="auth-loading"><LoaderCircle className="spin" size={28}/> Loading your secure workspace...</div></main>;
  if (!session) return <><AuthScreen/>{authError && <div className="auth-global-error">{authError}</div>}</>;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Aperture size={23}/></div><div><div className="brand-name">NEXORA<span>AI</span></div><div className="brand-sub">THE CREATIVE UNIVERSE</div></div><button className="close-nav" onClick={() => setMobileNav(false)}><X size={18}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{navItems.map(item => <button key={item.id} className={`nav-item ${active === item.id ? 'selected' : ''}`} onClick={() => { if (item.id === 'home' || item.id === 'projects') { setActive(item.id); setMobileNav(false); } else resetWorkspace(item.id); }}><item.icon size={18}/><span>{item.label}</span>{item.id === 'director' && <span className="nav-new">NEW</span>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="upgrade-card"><div className="upgrade-icon"><Crown size={17}/></div><strong>Creator mode</strong><p>Real model access depends on provider configuration, credits and fair-use limits.</p><button onClick={() => {setActive('settings');setMobileNav(false)}}>Explore setup <ArrowUpRight size={14}/></button></div>
        <button className={`nav-item ${active === 'settings' ? 'selected' : ''}`} onClick={() => {setActive('settings');setMobileNav(false)}}><Settings size={18}/><span>Settings</span></button>
        <div className="profile"><div className="avatar">{(profile?.full_name || 'N').slice(0,1).toUpperCase()}</div><div><strong>{profile?.full_name || 'NEXORA Creator'}</strong><small>{session.user.email}</small></div><button className="logout-btn" onClick={logout} title="Sign out" aria-label="Sign out"><LogOut size={17}/></button></div>
      </div>
    </aside>
    <main className="main">
      <header className="topbar"><button className="menu-btn" onClick={() => setMobileNav(true)}><Menu size={20}/></button><div className="crumb">Workspace <span>/</span> <b>{active === 'home' ? 'Overview' : active === 'projects' ? 'My Creations' : active === 'settings' ? 'Settings' : activeTool.name}</b></div><div className="top-actions"><div className="status-pill"><span className="status-dot"></span> Account secure</div><div className="top-avatar">{(profile?.full_name || 'N').slice(0,1).toUpperCase()}</div></div></header>
      {active === 'home' && <section className="content">
        <div className="hero"><div className="hero-orb orb-one"></div><div className="hero-orb orb-two"></div><div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> YOUR IMAGINATION, ENGINEERED</div><h1>Create beyond<br/><em>the ordinary.</em></h1><p>One creative universe for cinematic video, striking images, original sound and intelligent production planning.</p><button className="gold-btn" onClick={() => resetWorkspace('video')}>Start creating <ArrowUpRight size={17}/></button></div><div className="hero-art"><div className="art-ring ring-a"></div><div className="art-ring ring-b"></div><div className="art-core"><Aperture size={78} strokeWidth={1}/></div><div className="floating-chip chip-top"><WandSparkles size={15}/> AI CREATIVE ENGINE</div><div className="floating-chip chip-bottom"><Zap size={14}/> MAKE SOMETHING EPIC</div></div></div>
        <div className="section-heading"><div><div className="eyebrow muted">YOUR CREATIVE TOOLKIT</div><h2>What will you create today?</h2></div><span className="subtle-count">{projectLoading?'Loading…':countLabel}</span></div>
        <div className="tool-grid expanded-tools">{tools.map(t => <button className="tool-card" key={t.id} onClick={() => resetWorkspace(t.id)}><div className="tool-top"><div className="tool-icon"><t.icon size={21}/></div><span className="tool-tag">{t.tag}</span></div><h3>{t.name}</h3><p>{t.desc}</p><div className="tool-arrow"><ArrowUpRight size={17}/></div></button>)}</div>
        <div className="lower-grid"><div className="panel recent"><div className="panel-head"><div><h3>Recent creations</h3><p>Your latest projects and generated media</p></div><button className="text-btn" onClick={() => setActive('projects')}>View all <ArrowUpRight size={14}/></button></div>{projects.length ? projects.slice(0,4).map(p => <ProjectRow key={p.id} item={p}/>) : <div className="empty-state"><div className="empty-icon"><Layers3 size={22}/></div><strong>Your canvas is waiting</strong><p>Start a project and it will appear here.</p></div>}</div><div className="panel prompt-panel"><div className="panel-head"><div><h3>Prompt inspiration</h3><p>A spark for your next masterpiece</p></div><Sparkles size={18} className="gold-text"/></div>{starterPrompts.map((p,i)=><button className="prompt-suggestion" key={p} onClick={() => {setPrompt(p);resetWorkspace(i===2?'music':i===1?'image':'video')}}><span>0{i+1}</span>{p}<ArrowUpRight size={14}/></button>)}</div></div>
      </section>}
      {tools.some(t=>t.id===active) && <section className="content">
        <div className="page-title"><div className="eyebrow muted">NEXORA CREATIVE ENGINE · {isPlanning ? 'INTELLIGENCE STUDIO' : 'MEDIA STUDIO'}</div><h1>{activeTool.name}<em>.</em></h1><p>{activeTool.desc}. {isPlanning ? 'Describe your goal and let the creative intelligence build a detailed plan.' : 'Describe your vision, set your options and send it to a real model provider.'}</p></div>
        <div className="studio-layout"><div className="panel generator-panel"><div className="panel-head"><div><h3>{isPlanning ? 'Creative brief' : 'Generation controls'}</h3><p>{isPlanning ? 'Give your idea a direction' : 'Configure your AI output'}</p></div><span className="beta-pill">{isPlanning ? 'AI PLANNER' : 'AI ENGINE'}</span></div>
          {active === 'image' && <><label className="field-label">IMAGE ACTION</label><select className="wide-select" value={task} onChange={e=>setTask(e.target.value)}><option value="generate">Text to image</option><option value="edit">Edit an existing image</option><option value="remove_bg">Remove image background</option></select></>}
          {active === 'music' && <><label className="field-label">AUDIO TYPE</label><select className="wide-select" value={task} onChange={e=>setTask(e.target.value)}><option value="generate">Music / soundtrack</option><option value="sfx">Sound effect</option></select></>}
          <label className="field-label">{active === 'voice' ? 'VOICEOVER SCRIPT' : active === 'transcribe' ? 'OPTIONAL TRANSCRIPTION NOTES' : 'YOUR PROMPT / CREATIVE BRIEF'}</label>
          <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder={active==='video'?'A cinematic tracking shot through a neon-lit Lagos street at night, rain reflecting warm lights...':active==='image'?'A premium editorial portrait with dramatic studio lighting, detailed skin texture and a deep burgundy backdrop...':active==='music'?'A powerful cinematic score with African percussion, warm piano and an orchestral rise...':active==='voice'?'Welcome to NEXORA AI. Your imagination has no ceiling. Let us bring your next big idea to life...':active==='transcribe'?'Optional context to help with transcription...':active==='director'?'Create a short cinematic film about a young inventor who discovers an ancient machine beneath Kano...':active==='world'?'Build a futuristic African kingdom with unique cultures, architecture, history and memorable characters...':active==='factory'?'Create a launch campaign for a new fashion brand targeting young African creatives across Instagram, TikTok and YouTube...':'Help me improve this idea and turn it into a powerful prompt for a cinematic AI video...'} rows={7}/>
          <div className="prompt-footer"><span>{isPlanning ? 'Include audience, mood and desired outcome.' : 'Specific details improve creative control.'}</span><span>{prompt.length} characters</span></div>
          {sourceLabel && <><label className="field-label">{sourceLabel}</label><input className="url-input" type="file" accept={active==='video'?'image/*':active==='transcribe'?'audio/*':'image/*'} onChange={e=>setSourceFile(e.target.files?.[0] || null)}/>{sourceFile && <small className="helper-copy">Selected: {sourceFile.name}</small>}<div className="field-or">OR PASTE A PUBLIC FILE URL</div><input className="url-input" type="url" value={sourceUrl} onChange={e=>{setSourceUrl(e.target.value);if(e.target.value)setSourceFile(null)}} placeholder="https://..."/><small className="helper-copy">Files you select are uploaded to your NEXORA Supabase storage before the model uses them. Maximum file size: 50 MB.</small></>}
          {active === 'voice' && <><label className="field-label">VOICE DIRECTION</label><select className="wide-select" value={voiceStyle} onChange={e=>setVoiceStyle(e.target.value)}><option>Warm, natural, conversational voice</option><option>Confident, energetic commercial narrator</option><option>Deep, cinematic documentary narrator</option><option>Gentle, emotional storytelling voice</option><option>Bright, friendly social media presenter</option></select></>}
          {!isPlanning && !['voice','transcribe','music'].includes(active) && <div className="controls-row"><div className="control"><label className="field-label">ASPECT RATIO</label><select value={aspect} onChange={e=>setAspect(e.target.value)}><option>16:9</option><option>9:16</option><option>1:1</option><option>4:5</option></select></div>{active==='video' && <div className="control"><label className="field-label">DURATION</label><select value={duration} onChange={e=>setDuration(e.target.value)}><option value="5">5 seconds</option><option value="10">10 seconds</option><option value="15">15 seconds</option></select></div>}<div className="control"><label className="field-label">QUALITY TARGET</label><select value={quality} onChange={e=>setQuality(e.target.value)}><option>Standard</option><option>High</option><option>Ultra</option></select></div></div>}
          <div className="generation-note"><ShieldCheck size={17}/><span>{isPlanning ? 'This workspace creates a written AI plan using Gemini. It does not render media.' : 'Requests are sent to server-side model providers. Usage may incur provider charges; no fake outputs are shown.'}</span></div>
          <button className="gold-btn generate-btn" onClick={generate} disabled={busy}>{busy?<><LoaderCircle className="spin" size={17}/> {jobStatus || 'Working…'}</>:isPlanning?'Create AI plan':active==='transcribe'?'Transcribe audio':active==='voice'?'Generate voiceover':active==='music'?'Generate audio':active==='video'?'Generate video':'Generate image'} <Sparkles size={17}/></button>
          {busy && <div className="progress-line"><span/></div>}{notice && <div className={`notice ${jobStatus==='FAILED'?'notice-error':''}`}>{notice}</div>}
        </div>
        <div className="panel preview-panel"><div className="panel-head"><div><h3>{planOutput ? 'AI result' : 'Output preview'}</h3><p>{planOutput ? 'Generated text or production plan' : 'Your real model output will appear here'}</p></div><span className="live-label"><span className="status-dot"></span> {jobStatus || (busy?'WORKING':'READY')}</span></div>
          {resultUrl ? <div className="result-media">{active==='video' ? <video src={resultUrl} controls playsInline/> : active==='music' || active==='voice' ? <audio src={resultUrl} controls/> : <img src={resultUrl} alt="NEXORA AI generated result"/>}<a className="gold-btn result-download" href={resultUrl} target="_blank" rel="noreferrer" download><Download size={16}/> Open / download result</a></div> : planOutput ? <div className="plan-output">{planOutput}</div> : <div className="preview-box"><div className="preview-glow"></div><div className="preview-symbol"><Icon size={35}/></div><strong>Your next creation</strong><p>Submit a brief to see a real generated result or AI production plan here.</p></div>}
          {lastModel && <div className="preview-meta"><span><Zap size={14}/> Model: {lastModel}</span>{resultUrl && <a href={resultUrl} target="_blank" rel="noreferrer"><ExternalLink size={13}/> Open file</a>}</div>}
        </div></div>
      </section>}
      {active === 'projects' && <section className="content"><div className="page-title"><div className="eyebrow muted">YOUR WORK, IN ONE PLACE</div><h1>My creations<em>.</em></h1><p>Your saved briefs, AI plans and generated media.</p></div><div className="panel project-list">{projects.length ? projects.map(p=><ProjectRow key={p.id} item={p}/>) : <div className="empty-state"><div className="empty-icon"><FolderOpen size={22}/></div><strong>No creations yet</strong><p>Your projects will show up here.</p><button className="gold-btn" onClick={() => resetWorkspace('video')}>Create your first project <Plus size={16}/></button></div>}</div></section>}
      {active === 'settings' && <section className="content"><div className="page-title"><div className="eyebrow muted">MAKE NEXORA YOURS</div><h1>Studio settings<em>.</em></h1><p>Manage your account and understand connected services.</p></div><div className="panel settings-panel"><div className="settings-icon"><User size={22}/></div><div><h3>Your account</h3><p>{profile?.full_name} · {session.user.email}</p><p>Email verification: {session.user.email_confirmed_at ? 'Verified' : 'Pending — check your inbox'}</p><button className="text-btn" onClick={logout}>Sign out <LogOut size={14}/></button></div></div><div className="panel settings-panel"><div className="settings-icon"><Globe2 size={22}/></div><div><h3>AI provider connections</h3><p>Fal serves the image, video, music, voice and transcription models. Gemini powers Film Director, World Builder, One-Prompt Factory and the Creative Assistant. Provider keys must be stored only in Netlify server environment variables.</p><div className="setup-steps"><div><b>01</b><span>Supabase authenticates users and stores account-specific projects.</span></div><div><b>02</b><span>FAL_KEY enables the media generation workspaces.</span></div><div><b>03</b><span>GEMINI_API_KEY enables AI planning, world-building and assistant tools.</span></div></div></div></div><div className="panel settings-panel"><div className="settings-icon"><ShieldCheck size={22}/></div><div><h3>Fair-use and provider costs</h3><p>AI inference consumes compute. Fal models are pay-per-use and prices vary by model, duration, resolution and output. Set account limits before inviting public users. No unlimited premium generation is promised.</p></div></div></section>}
      <footer className="footer"><span>© 2026 NEXORA AI</span><span>IMAGINATION HAS NO CEILING.</span></footer>
    </main>
  </div>;
}

function ProjectRow({ item }) {
  const Icon = item.type === 'image' ? ImageIcon : item.type === 'audio' ? AudioLines : item.type === 'director' ? Film : item.type === 'world' ? Globe2 : item.type === 'factory' ? Layers3 : item.type === 'assistant' ? Bot : Clapperboard;
  return <div className="project-row"><div className="project-type"><Icon size={17}/></div><div className="project-info"><strong>{item.prompt}</strong><small>{String(item.type || 'project').toUpperCase()} · {new Date(item.created_at || item.createdAt).toLocaleString()}</small>{item.result_url && <a href={item.result_url} target="_blank" rel="noreferrer">Open generated file</a>}</div><span className="draft-status">{item.status}</span></div>;
}
export default App;
