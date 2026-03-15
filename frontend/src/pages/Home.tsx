import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Github, ArrowRight, Sparkles, Network,
  Box, FolderTree, Cpu, MessageSquare,
  Code2, Terminal, Braces, Search,
  BarChart3, GitBranch, Layers, ChevronRight
} from 'lucide-react';
import { theme as P } from '../lib/theme';

/* ═══════════════ LOGO ═══════════════ */
function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      {/* central */}
      <circle cx="18" cy="18" r="3" fill="url(#lg)" />
      {/* ring nodes */}
      {[0, 72, 144, 216, 288].map((a) => {
        const r = 11;
        const x = 18 + r * Math.cos((a * Math.PI) / 180);
        const y = 18 + r * Math.sin((a * Math.PI) / 180);
        return (
          <g key={a}>
            <line x1="18" y1="18" x2={x} y2={y} stroke="url(#lg)" strokeWidth="0.8" opacity="0.35" />
            <circle cx={x} cy={y} r="2" fill="url(#lg)" opacity="0.8" />
          </g>
        );
      })}
    </svg>
  );
}

/* ═══════════════ SCROLL REVEAL ═══════════════ */
function useReveal() {
  const [vis, setVis] = useState<Record<string, boolean>>({});
  const observe = useCallback((id: string) => (node: HTMLElement | null) => {
    if (!node) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis((v) => ({ ...v, [id]: true })); obs.disconnect(); }
    }, { threshold: 0.12 });
    obs.observe(node);
  }, []);
  return { vis, observe };
}

/* ═══════════════ FEATURE CARD ═══════════════ */
function Card({ icon: Icon, title, desc, delay }: {
  icon: any; title: string; desc: string; delay: string;
}) {
  return (
    <div
      className="opacity-0 animate-fade-up group"
      style={{ animationDelay: delay, animationFillMode: 'forwards' }}
    >
      <div
        className="rounded-2xl p-7 h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl"
        style={{ background: P.surface, border: `1px solid ${P.border}` }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
          style={{ background: 'rgba(37,99,235,0.1)' }}
        >
          <Icon className="w-5 h-5" style={{ color: P.accent }} />
        </div>
        <h3 className="text-[15px] font-semibold mb-2" style={{ color: P.text }}>{title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: P.muted }}>{desc}</p>
      </div>
    </div>
  );
}

/* ═══════════════ FLOATING ICON ═══════════════ */
function FloatIcon({ icon: Icon, style: s }: { icon: any; style: React.CSSProperties }) {
  return (
    <div className="absolute pointer-events-none animate-float-gentle" style={s}>
      <div
        className="rounded-xl p-2.5"
        style={{ background: P.glass, border: `1px solid ${P.border}`, backdropFilter: 'blur(6px)' }}
      >
        <Icon className="w-4 h-4" style={{ color: P.muted }} />
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━ MAIN ━━━━━━━━━━━━━━━━━━ */
export default function Home() {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();
  const { vis, observe } = useReveal();

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    navigate(`/dashboard?url=${encodeURIComponent(url)}`);
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: P.bg, color: P.text }}>

      {/* ─── NAV ─── */}
      <nav
        className="fixed top-0 inset-x-0 z-50"
        style={{ background: 'rgba(10,26,47,0.8)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${P.border}` }}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-sm font-semibold tracking-tight" style={{ color: P.text }}>SourceMind</span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors duration-200"
            style={{ color: P.muted, border: `1px solid ${P.border}` }}
            onMouseEnter={(e) => { e.currentTarget.style.background = P.glass; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Github className="w-3.5 h-3.5" />
            GitHub
          </a>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-36 pb-28 px-6">
        {/* Spotlight */}
        <div
          className="absolute top-16 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none animate-spotlight"
          style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, transparent 70%)' }}
        />

        {/* Floats */}
        <FloatIcon icon={Github}   style={{ top: '16%', left: '7%', animationDelay: '0s', animationDuration: '7s' }} />
        <FloatIcon icon={Braces}   style={{ top: '13%', right: '9%', animationDelay: '1.5s', animationDuration: '8s' }} />
        <FloatIcon icon={Terminal} style={{ top: '52%', left: '4%', animationDelay: '2.5s', animationDuration: '6s' }} />
        <FloatIcon icon={Code2}    style={{ top: '48%', right: '5%', animationDelay: '0.5s', animationDuration: '9s' }} />
        <FloatIcon icon={Box}      style={{ top: '72%', left: '10%', animationDelay: '3s', animationDuration: '8s' }} />
        <FloatIcon icon={Cpu}      style={{ top: '68%', right: '12%', animationDelay: '1s', animationDuration: '7s' }} />

        <div className="max-w-3xl mx-auto text-center relative">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium mb-8 opacity-0 animate-fade-up"
            style={{ animationDelay: '0.1s', animationFillMode: 'forwards', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', color: '#60A5FA' }}
          >
            <Sparkles className="w-3 h-3" /> AI-powered code intelligence
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold leading-[1.15] tracking-tight mb-6 opacity-0 animate-fade-up"
            style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
          >
            Understand Any GitHub
            <br />
            Repository{' '}
            <span style={{ color: P.accent }}>Instantly</span>
          </h1>

          {/* Sub */}
          <p
            className="text-base md:text-lg max-w-xl mx-auto mb-12 leading-relaxed opacity-0 animate-fade-up"
            style={{ animationDelay: '0.35s', animationFillMode: 'forwards', color: P.muted }}
          >
            SourceMind AI analyzes GitHub repositories and explains architecture, dependencies, and project structure using advanced AI.
          </p>

          {/* Input */}
          <form onSubmit={go} className="max-w-xl mx-auto opacity-0 animate-fade-up" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
            <div
              className="flex flex-col sm:flex-row gap-2 p-2 rounded-xl"
              style={{ background: P.glass, border: `1px solid ${P.glassB}`, backdropFilter: 'blur(12px)' }}
            >
              <div className="flex items-center flex-1 gap-3 pl-3">
                <Github className="w-4 h-4 shrink-0" style={{ color: P.muted }} />
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com/facebook/react"
                  className="w-full h-11 bg-transparent text-sm outline-none"
                  style={{ color: P.text, caretColor: P.accent }}
                />
              </div>
              <button
                type="submit"
                className="h-11 px-6 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg shrink-0"
                style={{ background: P.accent, color: '#fff' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = P.accentH; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = P.accent; }}
              >
                Analyze Repo
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <p
            className="text-[11px] mt-5 opacity-0 animate-fade-up"
            style={{ animationDelay: '0.65s', animationFillMode: 'forwards', color: 'rgba(156,163,175,0.5)' }}
          >
            Works with any public GitHub repository
          </p>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="px-6 py-24" ref={observe('feat')}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3" style={{ color: P.text }}>
              Everything you need to understand code
            </h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: P.muted }}>
              Six AI-powered tools working together to give you complete clarity.
            </p>
          </div>

          {vis['feat'] && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card icon={Sparkles}      title="AI Repository Summary"  desc="Structured summaries explaining what any project does and why it exists."     delay="0.05s" />
              <Card icon={Network}       title="Architecture Analysis"  desc="System architecture breakdowns covering data flow and component hierarchy."   delay="0.1s" />
              <Card icon={Box}           title="Dependency Insights"    desc="Understand every dependency — what it does, why it's there, how it integrates." delay="0.15s" />
              <Card icon={FolderTree}    title="Interactive File Tree"  desc="Click any file to get a dedicated AI explanation of its purpose and logic."    delay="0.2s" />
              <Card icon={Cpu}           title="Complexity Analysis"    desc="Language distribution, file metrics, and estimated time to understand."        delay="0.25s" />
              <Card icon={MessageSquare} title="Repository Chat"        desc="Ask questions about the codebase and get precise answers grounded in code."    delay="0.3s" />
            </div>
          )}
        </div>
      </section>

      {/* ─── DEMO ─── */}
      <section className="px-6 py-24" ref={observe('demo')}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">See it in action</h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: P.muted }}>
              A dashboard designed for clarity, not clutter.
            </p>
          </div>

          <div
            className={`rounded-2xl overflow-hidden transition-all duration-700 ${vis['demo'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ background: P.surface, border: `1px solid ${P.border}`, boxShadow: '0 24px 48px rgba(0,0,0,0.35)' }}
          >
            {/* Browser chrome */}
            <div className="flex items-center px-5 py-3 border-b" style={{ borderColor: P.border, background: 'rgba(10,26,47,0.5)' }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md text-[11px]" style={{ background: P.glass, border: `1px solid ${P.border}`, color: P.muted }}>
                  sourcemind.ai/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard wireframe */}
            <div className="p-6 md:p-8" style={{ background: P.bg }}>
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg" style={{ background: 'rgba(37,99,235,0.1)', border: `1px solid rgba(37,99,235,0.15)` }} />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-28 h-3 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
                    <div className="w-16 h-3 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
                  </div>
                  <div className="w-40 h-2 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-5 gap-2 mb-5">
                {['★ 218k', '⑂ 44.5k', '● 1.2k', '⎇ main', '📅 2d ago'].map((s, i) => (
                  <div key={i} className="rounded-lg py-2.5 text-center text-[11px]" style={{ background: P.surface, border: `1px solid ${P.border}`, color: P.muted }}>
                    {s}
                  </div>
                ))}
              </div>

              {/* Panels */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {[P.accent, '#6366F1'].map((c, i) => (
                  <div key={i} className="rounded-lg p-5" style={{ background: P.surface, border: `1px solid ${P.border}` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-5 rounded-full" style={{ background: c }} />
                      <div className="w-24 h-3 rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
                    </div>
                    <div className="space-y-2">
                      {[100, 85, 65, 75].map((w, j) => (
                        <div key={j} className="h-2 rounded-full" style={{ width: `${w}%`, background: 'rgba(255,255,255,0.04)' }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-lg" style={{ background: P.surface, border: `1px solid ${P.border}` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="px-6 py-28" ref={observe('how')}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3" style={{ color: P.text }}>
              How SourceMind Works
            </h2>
            <p className="text-sm max-w-lg mx-auto" style={{ color: P.muted }}>
              Understand any codebase in seconds with AI-powered analysis.
            </p>
          </div>

          {vis['how'] && (
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-start gap-4 md:gap-0">

              {/* ── STEP 1: Paste Repo ── */}
              <div className="opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                <div className="rounded-2xl p-6" style={{ background: P.surface, border: `1px solid ${P.border}` }}>
                  {/* Step badge */}
                  <div className="flex items-center gap-2 mb-5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold"
                      style={{ background: 'rgba(37,99,235,0.12)', color: '#60A5FA' }}
                    >1</div>
                    <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: P.muted }}>Input</span>
                  </div>
                  <h3 className="text-[15px] font-semibold mb-4" style={{ color: P.text }}>Paste GitHub Repository</h3>

                  {/* Mock URL card */}
                  <div
                    className="rounded-xl p-4"
                    style={{ background: P.bg, border: `1px solid ${P.border}` }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Github className="w-4 h-4" style={{ color: P.muted }} />
                      <span className="text-xs" style={{ color: P.muted }}>Repository URL</span>
                    </div>
                    <div
                      className="rounded-lg px-3 py-2.5 text-sm font-mono flex items-center gap-2"
                      style={{ background: P.surface, border: `1px solid ${P.border}`, color: '#60A5FA' }}
                    >
                      <span style={{ color: P.muted }}>github.com/</span>facebook/react
                    </div>
                    <div className="flex gap-1.5 mt-3">
                      {['★ 228k', '⑂ 46k', 'JS'].map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', color: P.muted }}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── ARROW 1 ── */}
              <div className="hidden md:flex items-center justify-center self-center opacity-0 animate-fade-up" style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-1 px-2">
                  <div className="w-8 h-px" style={{ background: 'rgba(37,99,235,0.3)' }} />
                  <ChevronRight className="w-4 h-4" style={{ color: 'rgba(37,99,235,0.5)' }} />
                </div>
              </div>

              {/* ── STEP 2: AI Analysis ── */}
              <div className="opacity-0 animate-fade-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: P.surface, border: `1px solid ${P.border}` }}>
                  {/* Step badge */}
                  <div className="flex items-center gap-2 mb-5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold"
                      style={{ background: 'rgba(37,99,235,0.12)', color: '#60A5FA' }}
                    >2</div>
                    <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: P.muted }}>Process</span>
                  </div>
                  <h3 className="text-[15px] font-semibold mb-4" style={{ color: P.text }}>AI Analysis Engine</h3>

                  {/* Animated scan lines */}
                  <div className="rounded-xl p-4 space-y-3" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                    {[
                      { icon: Search, label: 'File structure scanning', delay: '0s' },
                      { icon: GitBranch, label: 'Dependency graph detection', delay: '0.6s' },
                      { icon: Layers, label: 'Architecture analysis', delay: '1.2s' },
                    ].map(({ icon: Ic, label, delay }) => (
                      <div key={label} className="flex items-center gap-3 group">
                        <div
                          className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center"
                          style={{ background: 'rgba(37,99,235,0.08)' }}
                        >
                          <Ic className="w-3.5 h-3.5" style={{ color: '#60A5FA' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs mb-1.5" style={{ color: P.text }}>{label}</p>
                          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: '100%',
                                background: 'linear-gradient(90deg, #2563EB, #3B82F6)',
                                animation: `shimmer 2s ease-in-out infinite`,
                                animationDelay: delay,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Subtle processing indicator */}
                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: '#2563EB',
                            opacity: 0.5,
                            animation: 'pulse 1.5s ease-in-out infinite',
                            animationDelay: `${i * 0.3}s`,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px]" style={{ color: P.muted }}>Analyzing repository...</span>
                  </div>
                </div>
              </div>

              {/* ── ARROW 2 ── */}
              <div className="hidden md:flex items-center justify-center self-center opacity-0 animate-fade-up" style={{ animationDelay: '0.45s', animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-1 px-2">
                  <div className="w-8 h-px" style={{ background: 'rgba(37,99,235,0.3)' }} />
                  <ChevronRight className="w-4 h-4" style={{ color: 'rgba(37,99,235,0.5)' }} />
                </div>
              </div>

              {/* ── STEP 3: Insights ── */}
              <div className="opacity-0 animate-fade-up" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
                <div className="rounded-2xl p-6" style={{ background: P.surface, border: `1px solid ${P.border}` }}>
                  {/* Step badge */}
                  <div className="flex items-center gap-2 mb-5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold"
                      style={{ background: 'rgba(37,99,235,0.12)', color: '#60A5FA' }}
                    >3</div>
                    <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: P.muted }}>Output</span>
                  </div>
                  <h3 className="text-[15px] font-semibold mb-4" style={{ color: P.text }}>Insights Generated</h3>

                  {/* Three output cards */}
                  <div className="space-y-2">
                    {[
                      { icon: Network, label: 'Architecture Overview', color: '#2563EB' },
                      { icon: GitBranch, label: 'Dependency Map', color: '#6366F1' },
                      { icon: BarChart3, label: 'Complexity Analysis', color: '#3B82F6' },
                    ].map(({ icon: Ic, label, color }) => (
                      <div
                        key={label}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-default"
                        style={{ background: P.bg, border: `1px solid ${P.border}` }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                          style={{ background: `${color}15`, border: `1px solid ${color}25` }}
                        >
                          <Ic className="w-4 h-4" style={{ color }} />
                        </div>
                        <span className="text-sm font-medium" style={{ color: P.text }}>{label}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-auto" style={{ color: P.muted }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-6 py-28 relative">
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.05) 0%, transparent 70%)' }}
        />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">
            Ready to understand any
            <br />
            <span style={{ color: P.accent }}>GitHub repository?</span>
          </h2>
          <p className="text-base mb-10" style={{ color: P.muted }}>
            Start analyzing repositories in seconds. No setup required.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 h-12 px-8 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
            style={{ background: P.accent, color: '#fff' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = P.accentH; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = P.accent; }}
          >
            Analyze Your First Repo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-8 px-6" style={{ borderTop: `1px solid ${P.border}` }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={16} />
            <span className="text-[11px]" style={{ color: 'rgba(156,163,175,0.4)' }}>SourceMind AI</span>
          </div>
          <span className="text-[11px]" style={{ color: 'rgba(156,163,175,0.3)' }}>Built for developers, by developers.</span>
        </div>
      </footer>
    </div>
  );
}
