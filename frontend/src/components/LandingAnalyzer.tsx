/**
 * LandingAnalyzer — the full landing page UI, reusable inside dashboard tabs.
 * No nav/footer, no route dependency. Calls `onSubmit(url)` when the user
 * enters a repo URL or picks a quick example.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Github, ArrowRight, Sparkles, Network,
  Box, FolderTree, Cpu, MessageSquare,
  Code2, Terminal, Braces, Search,
  BarChart3, GitBranch, Layers, ChevronRight
} from 'lucide-react';
import Logo from './Logo';
import DemoPreview from './DemoPreview';
import { theme as P } from '../lib/theme';

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

/* ━━━━━━━━━━━━━━━━━━ MAIN COMPONENT ━━━━━━━━━━━━━━━━━━ */
export default function LandingAnalyzer({ onSubmit }: { onSubmit: (url: string) => void }) {
  const [url, setUrl] = useState('');
  const { vis, observe } = useReveal();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 200);
  }, []);

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSubmit(url.trim());
  };

  return (
    <div
      className="flex-1 overflow-y-auto overflow-x-hidden"
      style={{ background: P.bg, color: P.text }}
    >
      {/* ─── HERO ─── */}
      <section className="relative pt-24 pb-28 px-6">
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
          {/* Big Logo */}
          <div
            className="inline-flex items-center justify-center mb-8 opacity-0 animate-fade-up"
            style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
          >
            <Logo size={48} />
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
                  ref={inputRef}
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
      <DemoPreview onTryDemo={(url) => onSubmit(url)} />

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

              {/* Step 1 */}
              <div className="opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                <div className="rounded-2xl p-6" style={{ background: P.surface, border: `1px solid ${P.border}` }}>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold" style={{ background: 'rgba(37,99,235,0.12)', color: '#60A5FA' }}>1</div>
                    <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: P.muted }}>Input</span>
                  </div>
                  <h3 className="text-[15px] font-semibold mb-4" style={{ color: P.text }}>Paste GitHub Repository</h3>
                  <div className="rounded-xl p-4" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Github className="w-4 h-4" style={{ color: P.muted }} />
                      <span className="text-xs" style={{ color: P.muted }}>Repository URL</span>
                    </div>
                    <div className="rounded-lg px-3 py-2.5 text-sm font-mono flex items-center gap-2" style={{ background: P.surface, border: `1px solid ${P.border}`, color: '#60A5FA' }}>
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

              {/* Arrow 1 */}
              <div className="hidden md:flex items-center justify-center self-center opacity-0 animate-fade-up" style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-1 px-2">
                  <div className="w-8 h-px" style={{ background: 'rgba(37,99,235,0.3)' }} />
                  <ChevronRight className="w-4 h-4" style={{ color: 'rgba(37,99,235,0.5)' }} />
                </div>
              </div>

              {/* Step 2 */}
              <div className="opacity-0 animate-fade-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: P.surface, border: `1px solid ${P.border}` }}>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold" style={{ background: 'rgba(37,99,235,0.12)', color: '#60A5FA' }}>2</div>
                    <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: P.muted }}>Process</span>
                  </div>
                  <h3 className="text-[15px] font-semibold mb-4" style={{ color: P.text }}>AI Analysis Engine</h3>
                  <div className="rounded-xl p-4 space-y-3" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                    {[
                      { icon: Search, label: 'File structure scanning', delay: '0s' },
                      { icon: GitBranch, label: 'Dependency graph detection', delay: '0.6s' },
                      { icon: Layers, label: 'Architecture analysis', delay: '1.2s' },
                    ].map(({ icon: Ic, label, delay }) => (
                      <div key={label} className="flex items-center gap-3 group">
                        <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.08)' }}>
                          <Ic className="w-3.5 h-3.5" style={{ color: '#60A5FA' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs mb-1.5" style={{ color: P.text }}>{label}</p>
                          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                            <div className="h-full rounded-full" style={{ width: '100%', background: 'linear-gradient(90deg, #2563EB, #3B82F6)', animation: `shimmer 2s ease-in-out infinite`, animationDelay: delay }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#2563EB', opacity: 0.5, animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.3}s` }} />
                      ))}
                    </div>
                    <span className="text-[11px]" style={{ color: P.muted }}>Analyzing repository...</span>
                  </div>
                </div>
              </div>

              {/* Arrow 2 */}
              <div className="hidden md:flex items-center justify-center self-center opacity-0 animate-fade-up" style={{ animationDelay: '0.45s', animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-1 px-2">
                  <div className="w-8 h-px" style={{ background: 'rgba(37,99,235,0.3)' }} />
                  <ChevronRight className="w-4 h-4" style={{ color: 'rgba(37,99,235,0.5)' }} />
                </div>
              </div>

              {/* Step 3 */}
              <div className="opacity-0 animate-fade-up" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
                <div className="rounded-2xl p-6" style={{ background: P.surface, border: `1px solid ${P.border}` }}>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold" style={{ background: 'rgba(37,99,235,0.12)', color: '#60A5FA' }}>3</div>
                    <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: P.muted }}>Output</span>
                  </div>
                  <h3 className="text-[15px] font-semibold mb-4" style={{ color: P.text }}>Insights Generated</h3>
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
                        <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
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
