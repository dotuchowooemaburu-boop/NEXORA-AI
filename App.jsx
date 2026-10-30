import React, { useEffect, useMemo, useState } from 'react';
import {
  Aperture, AudioLines, Clapperboard, WandSparkles, LayoutDashboard, FolderOpen,
  Settings, Sparkles, Bell, Plus, ArrowUpRight, Image as ImageIcon, Film, Crown,
  ChevronDown, Clock3, Download, Menu, X, Zap, Layers3, Globe2, ShieldCheck,
  LogOut, User, LockKeyhole, Mail, Eye, EyeOff, LoaderCircle
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

const tools = [
  { id: 'video', name: 'AI Video', desc: 'Turn prompts into cinematic clips', icon: Clapperboard, tag: 'POPULAR' },
  { id: 'image', name: 'AI Image', desc: 'Create stunning images from words', icon: ImageIcon, tag: 'FAST' },
  { id: 'audio', name: 'AI Audio', desc: 'Voice, music and sound effects', icon: AudioLines, tag: 'NEW' },
  { id: 'director', name: 'AI Film Director', desc: 'Build a story scene by scene', icon: Film, tag: 'STUDIO' },
];
const starterPrompts = [
  'A futuristic city at golden hour, cinematic aerial shot',
  'Luxury product photography on a black marble surface',
  'A warm, intimate piano soundtrack for a short film'
];

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
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { data: { full_name: name.trim() }, emailRedirectTo: `${window.location.origin}/` }
        });
        if (error) throw error;
        if (data.session) setMessage('Your account is ready. Welcome to NEXORA AI.');
        else setMessage('Registration successful. Check your inbox and verify your email before signing in.');
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
  const [mode, setMode] = useState('video');
  const [prompt, setPrompt] = useState('');
  const [aspect, setAspect] = useState('16:9');
  const [quality, setQuality] = useState('Standard');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [projects, setProjects] = useState([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) { setAuthLoading(false); return; }
    supabase.auth.getSession().then(({data, error}) => {
      if (error) setAuthError(error.message);
      setSession(data?.session || null); setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next); setAuthLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) { setProfile(null); setProjects([]); return; }
    let alive = true;
    (async () => {
      setProjectLoading(true);
      const user = session.user;
      const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Creator';
      const { data: prof } = await supabase.from('profiles').upsert(
        { id: user.id, full_name: fullName, email: user.email }, { onConflict: 'id' }
      ).select().single();
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(50);
      if (!alive) return;
      setProfile(prof || { full_name: fullName, email: user.email });
      if (error) setNotice(`Project history could not load: ${error.message}`);
      else setProjects((data || []).map(row => ({ id: row.id, type: row.type, prompt: row.prompt, createdAt: row.created_at, status: row.status })));
      setProjectLoading(false);
    })();
    return () => { alive = false; };
  }, [session?.user?.id]);

  const activeTool = tools.find(t => t.id === mode) || tools[0];
  const Icon = activeTool.icon;
  const countLabel = useMemo(() => `${projects.length} project${projects.length === 1 ? '' : 's'}`, [projects]);

  async function saveProject(item) {
    const { data, error } = await supabase.from('projects').insert({
      user_id: session.user.id, type: item.type, prompt: item.prompt,
      status: 'Brief saved — generation not connected'
    }).select().single();
    if (error) throw error;
    setProjects(prev => [{ id: data.id, type: data.type, prompt: data.prompt, createdAt: data.created_at, status: data.status }, ...prev]);
  }

  async function generate() {
    if (!prompt.trim()) { setNotice('Add a prompt first so NEXORA knows what to create.'); return; }
    setBusy(true); setNotice('');
    try {
      await saveProject({ type: mode, prompt: prompt.trim() });
      setNotice(mode === 'image'
        ? 'Your image brief is saved to your account. The secure image-generation provider is the next milestone; no fake image has been created.'
        : 'Your creative brief is saved to your account. Real media generation will be enabled when its provider is connected.');
    } catch (e) { setNotice(`Could not save this project: ${e.message}`); }
    finally { setBusy(false); }
  }

  async function logout() { await supabase.auth.signOut(); setActive('home'); }
  const navItems = [
    { id: 'home', label: 'Overview', icon: LayoutDashboard },
    { id: 'video', label: 'AI Video', icon: Clapperboard },
    { id: 'image', label: 'AI Image', icon: ImageIcon },
    { id: 'audio', label: 'AI Audio', icon: AudioLines },
    { id: 'director', label: 'AI Film Director', icon: Film },
    { id: 'projects', label: 'My Creations', icon: FolderOpen },
  ];
  function selectTool(id) { setMode(id); setActive(id); setNotice(''); }

  if (!isSupabaseConfigured) return <main className="auth-shell"><div className="auth-card setup-card"><div className="auth-brand"><div className="brand-mark"><Aperture size={25}/></div><div><div className="brand-name">NEXORA<span>AI</span></div><div className="brand-sub">THE CREATIVE UNIVERSE</div></div></div><h1>One setup step.</h1><p className="auth-intro">Authentication is implemented, but this deployment is not connected to a Supabase project yet. Add the two public project settings below to your hosting environment, then redeploy.</p><code>VITE_SUPABASE_URL</code><code>VITE_SUPABASE_ANON_KEY</code><p className="auth-alert error">Do not put a service-role key or AI provider secret in these frontend variables.</p><p className="auth-foot">Setup instructions and database SQL are included in the project ZIP.</p></div></main>;
  if (authLoading) return <main className="auth-shell"><div className="auth-loading"><LoaderCircle className="spin" size={28}/> Loading your secure workspace...</div></main>;
  if (!session) return <><AuthScreen/>{authError && <div className="auth-global-error">{authError}</div>}</>;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Aperture size={23}/></div><div><div className="brand-name">NEXORA<span>AI</span></div><div className="brand-sub">THE CREATIVE UNIVERSE</div></div><button className="close-nav" onClick={() => setMobileNav(false)}><X size={18}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{navItems.map(item => <button key={item.id} className={`nav-item ${active === item.id ? 'selected' : ''}`} onClick={() => { setActive(item.id); if (['video','image','audio','director'].includes(item.id)) setMode(item.id); setMobileNav(false); }}><item.icon size={18}/><span>{item.label}</span>{item.id === 'director' && <span className="nav-new">NEW</span>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="upgrade-card"><div className="upgrade-icon"><Crown size={17}/></div><strong>Creator mode</strong><p>Generation availability depends on connected providers and fair-use limits.</p><button onClick={() => setActive('settings')}>Explore setup <ArrowUpRight size={14}/></button></div>
        <button className={`nav-item ${active === 'settings' ? 'selected' : ''}`} onClick={() => {setActive('settings');setMobileNav(false)}}><Settings size={18}/><span>Settings</span></button>
        <div className="profile"><div className="avatar">{(profile?.full_name || 'N').slice(0,1).toUpperCase()}</div><div><strong>{profile?.full_name || 'NEXORA Creator'}</strong><small>{session.user.email}</small></div><button className="logout-btn" onClick={logout} title="Sign out" aria-label="Sign out"><LogOut size={17}/></button></div>
      </div>
    </aside>
    <main className="main">
      <header className="topbar"><button className="menu-btn" onClick={() => setMobileNav(true)}><Menu size={20}/></button><div className="crumb">Workspace <span>/</span> <b>{active === 'home' ? 'Overview' : active === 'projects' ? 'My Creations' : active === 'settings' ? 'Settings' : tools.find(t=>t.id===active)?.name}</b></div><div className="top-actions"><div className="status-pill"><span className="status-dot"></span> Account secure</div><div className="top-avatar">{(profile?.full_name || 'N').slice(0,1).toUpperCase()}</div></div></header>
      {active === 'home' && <section className="content">
        <div className="hero"><div className="hero-orb orb-one"></div><div className="hero-orb orb-two"></div><div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> YOUR IMAGINATION, ENGINEERED</div><h1>Create beyond<br/><em>the ordinary.</em></h1><p>One creative universe for cinematic video, striking images, sound and stories. Your next big idea starts here.</p><button className="gold-btn" onClick={() => selectTool('video')}>Start creating <ArrowUpRight size={17}/></button></div><div className="hero-art"><div className="art-ring ring-a"></div><div className="art-ring ring-b"></div><div className="art-core"><Aperture size={78} strokeWidth={1}/></div><div className="floating-chip chip-top"><WandSparkles size={15}/> AI CREATIVE ENGINE</div><div className="floating-chip chip-bottom"><Zap size={14}/> MAKE SOMETHING EPIC</div></div></div>
        <div className="section-heading"><div><div className="eyebrow muted">YOUR CREATIVE TOOLKIT</div><h2>What will you create today?</h2></div><span className="subtle-count">{projectLoading?'Loading…':countLabel}</span></div>
        <div className="tool-grid">{tools.map(t => <button className="tool-card" key={t.id} onClick={() => selectTool(t.id)}><div className="tool-top"><div className="tool-icon"><t.icon size={21}/></div><span className="tool-tag">{t.tag}</span></div><h3>{t.name}</h3><p>{t.desc}</p><div className="tool-arrow"><ArrowUpRight size={17}/></div></button>)}</div>
        <div className="lower-grid"><div className="panel recent"><div className="panel-head"><div><h3>Recent creations</h3><p>Your latest creative briefs</p></div><button className="text-btn" onClick={() => setActive('projects')}>View all <ArrowUpRight size={14}/></button></div>{projects.length ? projects.slice(0,3).map(p => <ProjectRow key={p.id} item={p}/>) : <div className="empty-state"><div className="empty-icon"><Layers3 size={22}/></div><strong>Your canvas is waiting</strong><p>Start a project and it will appear here.</p></div>}</div><div className="panel prompt-panel"><div className="panel-head"><div><h3>Prompt inspiration</h3><p>A spark for your next masterpiece</p></div><Sparkles size={18} className="gold-text"/></div>{starterPrompts.map((p,i)=><button className="prompt-suggestion" key={p} onClick={() => {setPrompt(p);selectTool(i===2?'audio':i===1?'image':'video')}}><span>0{i+1}</span>{p}<ArrowUpRight size={14}/></button>)}</div></div>
      </section>}
      {['video','image','audio','director'].includes(active) && <section className="content">
        <div className="page-title"><div className="eyebrow muted">NEXORA CREATIVE ENGINE</div><h1>{activeTool.name}<em>.</em></h1><p>{activeTool.desc}. Describe your vision and prepare your creative brief.</p></div>
        <div className="studio-layout"><div className="panel generator-panel"><div className="panel-head"><div><h3>Creation brief</h3><p>Give your idea a direction</p></div><span className="beta-pill">STUDIO</span></div><label className="field-label">YOUR PROMPT</label><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder={active==='video'?'A cinematic tracking shot through a neon-lit Tokyo street in the rain...':active==='image'?'An editorial portrait with dramatic studio lighting, rich textures...':active==='audio'?'A warm cinematic ambient score with soft piano and strings...':'A young explorer discovers a hidden city beneath the desert...'} rows={6}/><div className="prompt-footer"><span>Be descriptive for more control.</span><span>{prompt.length} characters</span></div>
          <div className="controls-row"><div className="control"><label className="field-label">ASPECT RATIO</label><select value={aspect} onChange={e=>setAspect(e.target.value)}><option>16:9</option><option>9:16</option><option>1:1</option><option>4:5</option></select></div><div className="control"><label className="field-label">QUALITY TARGET</label><select value={quality} onChange={e=>setQuality(e.target.value)}><option>Standard</option><option>High</option><option>Ultra</option></select></div></div>
          <div className="generation-note"><ShieldCheck size={17}/><span>Save briefs securely to your account. Real model rendering is not connected yet.</span></div><button className="gold-btn generate-btn" onClick={generate} disabled={busy}>{busy?'Saving...': 'Save creative brief'} <Sparkles size={17}/></button>{notice && <div className="notice">{notice}</div>}</div>
          <div className="panel preview-panel"><div className="panel-head"><div><h3>Preview space</h3><p>Your output will appear here</p></div><span className="live-label"><span className="status-dot"></span> READY</span></div><div className="preview-box"><div className="preview-glow"></div><div className="preview-symbol"><Icon size={35}/></div><strong>Your next creation</strong><p>Real previews will appear after a model provider is connected.</p></div><div className="preview-meta"><span><Clock3 size={14}/> Model time varies</span><span><Download size={14}/> Export after generation</span></div></div></div>
      </section>}
      {active === 'projects' && <section className="content"><div className="page-title"><div className="eyebrow muted">YOUR WORK, IN ONE PLACE</div><h1>My creations<em>.</em></h1><p>Creative briefs saved securely to your account.</p></div><div className="panel project-list">{projects.length ? projects.map(p=><ProjectRow key={p.id} item={p}/>) : <div className="empty-state"><div className="empty-icon"><FolderOpen size={22}/></div><strong>No creations yet</strong><p>Your saved briefs will show up here.</p><button className="gold-btn" onClick={()=>selectTool('video')}>Create your first brief <Plus size={16}/></button></div>}</div></section>}
      {active === 'settings' && <section className="content"><div className="page-title"><div className="eyebrow muted">MAKE NEXORA YOURS</div><h1>Studio settings<em>.</em></h1><p>Manage your account and connected services.</p></div><div className="panel settings-panel"><div className="settings-icon"><User size={22}/></div><div><h3>Your account</h3><p>{profile?.full_name} · {session.user.email}</p><p>Email verification: {session.user.email_confirmed_at ? 'Verified' : 'Pending — check your inbox'}</p><button className="text-btn" onClick={logout}>Sign out <LogOut size={14}/></button></div></div><div className="panel settings-panel"><div className="settings-icon"><Globe2 size={22}/></div><div><h3>AI provider connections</h3><p>Provider credentials must be stored as server-side environment secrets. They must never be added to this React app or shared with users.</p><div className="setup-steps"><div><b>01</b><span>Authentication and user-specific project storage are connected to Supabase.</span></div><div><b>02</b><span>Next: deploy a secure server endpoint and connect the first image model.</span></div><div><b>03</b><span>Video and audio generation will use queued background jobs.</span></div></div></div></div><div className="panel settings-panel"><div className="settings-icon"><ShieldCheck size={22}/></div><div><h3>Free access, honestly</h3><p>Real AI inference consumes compute. Free availability depends on provider credits, open-source hosting capacity and fair-use limits. No unlimited premium generation is promised.</p></div></div></section>}
      <footer className="footer"><span>© 2026 NEXORA AI</span><span>IMAGINATION HAS NO CEILING.</span></footer>
    </main>
  </div>;
}
function ProjectRow({item}) {
  const Icon = item.type === 'image' ? ImageIcon : item.type === 'audio' ? AudioLines : item.type === 'director' ? Film : Clapperboard;
  return <div className="project-row"><div className="project-type"><Icon size={17}/></div><div className="project-info"><strong>{item.prompt}</strong><small>{item.type.toUpperCase()} · {new Date(item.createdAt).toLocaleString()}</small></div><span className="draft-status">{item.status}</span></div>;
}
export default App;
