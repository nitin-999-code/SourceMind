/**
 * DemoPreview — Premium animated "See it in Action" section.
 *
 * Features:
 *   • Simulated loading sequence with 4 analysis steps
 *   • Staggered dashboard element animations (stats, cards, charts)
 *   • "Try a Demo Repository" button with popular repo chips
 *   • Gradient glow, soft shadows, floating-window depth
 *   • Intersection-Observer triggered — only runs on scroll-in
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Github, Star, GitFork, Eye, GitBranch, Calendar,
  Search, Layers, Network, FileCode, BarChart3, FolderTree,
  ArrowRight, Sparkles, Cpu, CheckCircle2, Loader2,
} from 'lucide-react';
import Logo from './Logo';
import { theme as T } from '../lib/theme';

/* ═══ Intersection Observer hook ═══ */
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ═══ Loading Steps ═══ */
const LOAD_STEPS = [
  { label: 'Analyzing repository...', icon: Search, duration: 900 },
  { label: 'Scanning files...', icon: FolderTree, duration: 800 },
  { label: 'Building architecture map...', icon: Network, duration: 1000 },
  { label: 'Generating insights...', icon: Sparkles, duration: 700 },
];

/* ═══ Demo Repos ═══ */
const DEMO_REPOS = [
  { name: 'facebook/react', stars: '228k', lang: 'JavaScript' },
  { name: 'vercel/next.js', stars: '129k', lang: 'TypeScript' },
  { name: 'microsoft/vscode', stars: '167k', lang: 'TypeScript' },
];

/* ═══ Stat cards for the dashboard ═══ */
const STATS = [
  { icon: Star, value: '228k', label: 'Stars', color: '#FBBF24' },
  { icon: GitFork, value: '46.2k', label: 'Forks', color: '#34D399' },
  { icon: Eye, value: '6.7k', label: 'Watchers', color: '#60A5FA' },
  { icon: GitBranch, value: 'main', label: 'Branch', color: '#A78BFA' },
  { icon: Calendar, value: '2d ago', label: 'Updated', color: '#F97316' },
];

/* ═══ Analysis cards ═══ */
const ANALYSIS_CARDS = [
  {
    title: 'Project Summary',
    icon: FileCode,
    color: '#2563EB',
    lines: [
      { label: 'Purpose', w: '90%' },
      { label: 'Architecture', w: '75%' },
      { label: 'Key Features', w: '85%' },
      { label: 'Tech Stack', w: '60%' },
    ],
  },
  {
    title: 'System Architecture',
    icon: Network,
    color: '#6366F1',
    lines: [
      { label: 'Components', w: '80%' },
      { label: 'Data Flow', w: '95%' },
      { label: 'API Layer', w: '70%' },
      { label: 'State Mgmt', w: '65%' },
    ],
  },
];

/* ═══ Bottom insight cards ═══ */
const INSIGHT_CARDS = [
  { icon: Layers, label: 'Dependencies', count: '47', color: '#10B981' },
  { icon: BarChart3, label: 'Complexity', count: 'Medium', color: '#F59E0B' },
  { icon: Cpu, label: 'Languages', count: '4', color: '#8B5CF6' },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ MAIN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface DemoPreviewProps {
  /** Called when user clicks a demo repo — navigates to dashboard */
  onTryDemo?: (repoUrl: string) => void;
}

export default function DemoPreview({ onTryDemo }: DemoPreviewProps) {
  const { ref, inView } = useInView(0.15);
  const [loadStep, setLoadStep] = useState(-1); // -1 = idle
  const [dashReady, setDashReady] = useState(false);
  const [statsDone, setStatsDone] = useState(false);
  const [cardsDone, setCardsDone] = useState(false);
  const [insightsDone, setInsightsDone] = useState(false);

  /* Run simulated loading sequence */
  useEffect(() => {
    if (!inView || loadStep >= 0) return;
    setLoadStep(0);
  }, [inView, loadStep]);

  useEffect(() => {
    if (loadStep < 0) return;
    if (loadStep >= LOAD_STEPS.length) {
      // all steps done — reveal dashboard
      const t = setTimeout(() => setDashReady(true), 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setLoadStep((s) => s + 1), LOAD_STEPS[loadStep].duration);
    return () => clearTimeout(t);
  }, [loadStep]);

  /* Staggered dashboard animations */
  useEffect(() => {
    if (!dashReady) return;
    const t1 = setTimeout(() => setStatsDone(true), 200);
    const t2 = setTimeout(() => setCardsDone(true), 600);
    const t3 = setTimeout(() => setInsightsDone(true), 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [dashReady]);

  const handleDemoClick = useCallback(
    (name: string) => {
      if (onTryDemo) onTryDemo(`https://github.com/${name}`);
    },
    [onTryDemo]
  );

  return (
    <section className="px-6 py-24" ref={ref}>
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14">
          <h2
            className="text-2xl md:text-3xl font-bold tracking-tight mb-3"
            style={{ color: T.text }}
          >
            See it in action
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: T.muted }}>
            Watch how SourceMind transforms a GitHub URL into a complete code intelligence dashboard.
          </p>
        </div>

        {/* ─── Glowing container ─── */}
        <div
          className={`relative transition-all duration-1000 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* Glow behind */}
          <div
            className="absolute -inset-1 rounded-3xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(99,102,241,0.1), rgba(37,99,235,0.08))',
              filter: 'blur(24px)',
            }}
          />

          {/* Gradient border wrapper */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(37,99,235,0.3), rgba(99,102,241,0.2), rgba(37,99,235,0.15))`,
              padding: 1,
            }}
          >
            <div className="rounded-2xl overflow-hidden" style={{ background: T.bg }}>
              {/* Browser chrome */}
              <div
                className="flex items-center px-5 py-3 border-b"
                style={{ borderColor: T.border, background: 'rgba(10,26,47,0.6)' }}
              >
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <div className="flex-1 flex justify-center">
                  <div
                    className="px-4 py-1 rounded-md text-[11px] flex items-center gap-2"
                    style={{ background: T.glass, border: `1px solid ${T.border}`, color: T.muted }}
                  >
                    <Logo size={12} />
                    sourcemind.ai/dashboard/facebook/react
                  </div>
                </div>
              </div>

              {/* Content area */}
              <div className="p-6 md:p-8 min-h-[340px]" style={{ background: T.bg }}>
                {!dashReady ? (
                  /* ─── LOADING SEQUENCE ─── */
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-6">
                    {/* Pulsing logo */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{
                        background: 'rgba(37,99,235,0.08)',
                        border: '1px solid rgba(37,99,235,0.2)',
                        animation: 'pulse 2s ease-in-out infinite',
                      }}
                    >
                      <Logo size={32} />
                    </div>

                    {/* Steps */}
                    <div className="space-y-3 w-64">
                      {LOAD_STEPS.map((step, i) => {
                        const Icon = step.icon;
                        const isDone = loadStep > i;
                        const isCurrent = loadStep === i;
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-3 transition-all duration-500"
                            style={{
                              opacity: loadStep >= i ? 1 : 0.25,
                              transform: loadStep >= i ? 'translateX(0)' : 'translateX(-8px)',
                            }}
                          >
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300"
                              style={{
                                background: isDone ? 'rgba(34,197,94,0.12)' : isCurrent ? 'rgba(37,99,235,0.12)' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${isDone ? 'rgba(34,197,94,0.3)' : isCurrent ? 'rgba(37,99,235,0.3)' : T.border}`,
                              }}
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />
                              ) : isCurrent ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: T.accent }} />
                              ) : (
                                <Icon className="w-3.5 h-3.5" style={{ color: T.muted }} />
                              )}
                            </div>
                            <span
                              className="text-xs font-medium transition-colors duration-300"
                              style={{ color: isDone ? '#22C55E' : isCurrent ? T.text : T.muted }}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Progress bar */}
                    <div className="w-64 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.min(((loadStep + 1) / LOAD_STEPS.length) * 100, 100)}%`,
                          background: 'linear-gradient(90deg, #2563EB, #6366F1)',
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  /* ─── ANIMATED DASHBOARD ─── */
                  <div>
                    {/* Repo header */}
                    <div
                      className="flex items-center gap-3 mb-5 transition-all duration-500"
                      style={{
                        opacity: dashReady ? 1 : 0,
                        transform: dashReady ? 'translateY(0)' : 'translateY(8px)',
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.15)' }}
                      >
                        <Github className="w-4 h-4" style={{ color: T.accent }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold" style={{ color: T.text }}>facebook / react</span>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}
                          >
                            Public
                          </span>
                        </div>
                        <p className="text-[11px] mt-0.5" style={{ color: T.muted }}>
                          The library for web and native user interfaces.
                        </p>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-5 gap-2 mb-5">
                      {STATS.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                          <div
                            key={i}
                            className="rounded-lg py-2.5 text-center transition-all duration-500"
                            style={{
                              background: T.surface,
                              border: `1px solid ${T.border}`,
                              opacity: statsDone ? 1 : 0,
                              transform: statsDone ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.95)',
                              transitionDelay: `${i * 80}ms`,
                            }}
                          >
                            <Icon
                              className="w-3.5 h-3.5 mx-auto mb-1"
                              style={{ color: stat.color }}
                            />
                            <div className="text-xs font-semibold" style={{ color: T.text }}>{stat.value}</div>
                            <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: T.muted }}>{stat.label}</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Analysis cards */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {ANALYSIS_CARDS.map((card, i) => {
                        const Icon = card.icon;
                        return (
                          <div
                            key={i}
                            className="rounded-lg p-5 transition-all duration-600"
                            style={{
                              background: T.surface,
                              border: `1px solid ${T.border}`,
                              opacity: cardsDone ? 1 : 0,
                              transform: cardsDone ? 'translateY(0)' : 'translateY(16px)',
                              transitionDelay: `${i * 150}ms`,
                            }}
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <div
                                className="w-6 h-6 rounded flex items-center justify-center"
                                style={{ background: `${card.color}15` }}
                              >
                                <Icon className="w-3.5 h-3.5" style={{ color: card.color }} />
                              </div>
                              <span className="text-xs font-semibold" style={{ color: T.text }}>{card.title}</span>
                            </div>
                            <div className="space-y-2.5">
                              {card.lines.map((line, j) => (
                                <div key={j}>
                                  <div className="text-[10px] mb-1" style={{ color: T.muted }}>{line.label}</div>
                                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                    <div
                                      className="h-full rounded-full transition-all duration-1000 ease-out"
                                      style={{
                                        width: cardsDone ? line.w : '0%',
                                        background: `linear-gradient(90deg, ${card.color}80, ${card.color}40)`,
                                        transitionDelay: `${(i * 150) + (j * 100) + 200}ms`,
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Insight cards */}
                    <div className="grid grid-cols-3 gap-2">
                      {INSIGHT_CARDS.map((card, i) => {
                        const Icon = card.icon;
                        return (
                          <div
                            key={i}
                            className="rounded-lg p-4 flex items-center gap-3 transition-all duration-500"
                            style={{
                              background: T.surface,
                              border: `1px solid ${T.border}`,
                              opacity: insightsDone ? 1 : 0,
                              transform: insightsDone ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
                              transitionDelay: `${i * 120}ms`,
                            }}
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: `${card.color}12`, border: `1px solid ${card.color}25` }}
                            >
                              <Icon className="w-4 h-4" style={{ color: card.color }} />
                            </div>
                            <div>
                              <div className="text-xs font-semibold" style={{ color: T.text }}>{card.count}</div>
                              <div className="text-[10px]" style={{ color: T.muted }}>{card.label}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Try a Demo Repository ─── */}
        {onTryDemo && (
          <div
            className={`text-center mt-10 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '0.5s' }}
          >
            <p className="text-sm font-medium mb-4" style={{ color: T.muted }}>
              Try analyzing a demo repository
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {DEMO_REPOS.map((repo, i) => (
                <button
                  key={i}
                  onClick={() => handleDemoClick(repo.name)}
                  className="group flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    color: T.text,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(37,99,235,0.4)';
                    e.currentTarget.style.background = 'rgba(37,99,235,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.background = T.surface;
                  }}
                >
                  <Github className="w-4 h-4" style={{ color: T.muted }} />
                  <span className="font-medium">{repo.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: T.muted }}>
                    ★ {repo.stars}
                  </span>
                  <ArrowRight
                    className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                    style={{ color: T.accent }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
