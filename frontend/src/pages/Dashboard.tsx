import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ArrowLeft, Github, FileCode, Server, ListTree, Package, LayoutTemplate, 
  Star, GitFork, GitCommitHorizontal, Calendar, Disc, AlertCircle,
  Activity, Network, ChevronDown, ChevronUp
} from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { FolderTree } from '../components/FolderTree';
import { LanguageChart } from '../components/LanguageChart';
import { LoadingState } from '../components/LoadingState';
import { MarkdownViewer } from '../components/MarkdownViewer';
import Chat from '../components/Chat';
import TabBar from '../components/TabBar';
import ImportantFiles from '../components/ImportantFiles';
import NewTabModal from '../components/NewTabModal';
import { useTabStore } from '../store/useTabStore';

const API_URL = 'https://sourcemind.onrender.com/api';

/* ═══════════════ DESIGN TOKENS ═══════════════ */
const T = {
  bg:      '#0A1A2F',
  bgSec:   '#0F243D',
  card:    '#162B4A',
  accent:  '#2563EB',
  accentH: '#1D4ED8',
  text:    '#F1F5F9',
  muted:   '#94A3B8',
  border:  'rgba(255,255,255,0.08)',
  shadow:  'rgba(0,0,0,0.45)',
};

/* ═══════════════ FETCH ═══════════════ */
const fetchRepoData = async (url: string) => {
  const { data } = await axios.post(`${API_URL}/analyze`, { url });
  return data;
};

/* ═══════════════ COLLAPSIBLE ═══════════════ */
function CollapsibleSection({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex flex-col h-full">
      <div className={`relative overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[5000px]' : 'max-h-80'}`}>
        {children}
        {!isOpen && (
          <div
            className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{ background: `linear-gradient(to top, ${T.card}, transparent)` }}
          />
        )}
      </div>
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-xs px-4 py-1.5 rounded-lg transition-colors duration-200"
          style={{
            color: T.muted,
            border: `1px solid ${T.border}`,
            background: isOpen ? 'rgba(255,255,255,0.03)' : 'transparent',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = isOpen ? 'rgba(255,255,255,0.03)' : 'transparent'; }}
        >
          {isOpen ? (
            <><ChevronUp className="w-4 h-4" /> Show Less</>
          ) : (
            <><ChevronDown className="w-4 h-4" /> Show More</>
          )}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════ STAT CARD ═══════════════ */
function StatCard({ icon: Icon, value, label, color }: {
  icon: any; value: string; label: string; color: string;
}) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col justify-center items-center text-center transition-all duration-200 hover:-translate-y-0.5 group"
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        boxShadow: `0 4px 12px ${T.shadow}`,
      }}
    >
      <Icon className="w-5 h-5 mb-2 transition-transform group-hover:scale-110" style={{ color }} />
      <p className="text-2xl font-bold" style={{ color: T.text }}>{value}</p>
      <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: T.muted }}>{label}</p>
    </div>
  );
}

/* ═══════════════ SECTION CARD ═══════════════ */
function SectionCard({ icon: Icon, title, iconColor, accentBar, children, copyText }: {
  icon: any; title: string; iconColor: string; accentBar?: string; children: React.ReactNode; copyText?: string;
}) {
  return (
    <div
      className="rounded-xl flex flex-col transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        boxShadow: `0 4px 16px ${T.shadow}`,
      }}
    >
      {accentBar && <div className="h-1" style={{ background: accentBar }} />}
      <div className="p-6 flex items-center justify-between group">
        <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: T.text }}>
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
          {title}
        </h2>
        {copyText && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton text={copyText} />
          </div>
        )}
      </div>
      <div className="px-6 pb-6 flex-1">
        {children}
      </div>
    </div>
  );
}

/* ═══════════════ REPO CONTENT (single tab view) ═══════════════ */
function RepoContent({ data }: { data: any }) {
  const formattedDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(data.metadata.lastUpdated));

  return (
    <>
      {/* ═══════════ HEADER ═══════════ */}
      <div
        className="w-full px-6 py-4 flex items-center justify-between"
        style={{
          background: 'rgba(10,26,47,0.6)',
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-1 rounded-lg shrink-0"
            style={{ background: T.bgSec, border: `1px solid ${T.border}` }}
          >
            {data.metadata.avatarUrl ? (
              <img src={data.metadata.avatarUrl} alt={data.metadata.owner} className="w-8 h-8 rounded-md object-cover" />
            ) : (
              <Github className="w-8 h-8 p-1" style={{ color: T.muted }} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
               <h1 className="font-bold text-xl tracking-tight" style={{ color: T.text }}>
                 {data.metadata.owner} <span style={{ color: T.muted }}>/</span> {data.metadata.name}
               </h1>
            </div>
            {data.metadata.description && (
              <p className="text-sm mt-0.5 max-w-[600px] truncate" style={{ color: T.muted }}>{data.metadata.description}</p>
            )}
            <p className="text-xs hidden sm:block mt-1" style={{ color: T.muted }}>Last updated {formattedDate}</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 text-sm font-medium">
          {[
            { icon: Star, value: data.metadata.stars.toLocaleString(), color: '#FBBF24' },
            { icon: GitFork, value: data.metadata.forks.toLocaleString(), color: '#60A5FA' },
            { icon: Disc, value: `${data.metadata.openIssues} Issues`, color: '#34D399' },
          ].map(({ icon: Ic, value, color }) => (
            <div
              key={value}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: T.bgSec, border: `1px solid ${T.border}`, color: T.text }}
            >
              <Ic className="w-4 h-4" style={{ color }} />
              <span>{value}</span>
            </div>
          ))}
          <a
            href={data.metadata.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors duration-200"
            style={{ color: T.muted, border: `1px solid ${T.border}` }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Github className="w-4 h-4" />
            View on GitHub
          </a>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ═══════════ STATS ═══════════ */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard icon={Star} value={data.metadata.stars.toLocaleString()} label="Stars" color="#FBBF24" />
          <StatCard icon={GitFork} value={data.metadata.forks.toLocaleString()} label="Forks" color="#60A5FA" />
          <StatCard icon={Disc} value={data.metadata.openIssues.toLocaleString()} label="Issues" color="#34D399" />
          <StatCard icon={GitCommitHorizontal} value={data.metadata.defaultBranch} label="Primary Branch" color="#A78BFA" />
          <StatCard icon={Calendar} value={formattedDate} label="Updated" color="#FB923C" />
        </div>
        
        {/* ═══════════ ROW 1: Summary & Architecture ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard
            icon={LayoutTemplate}
            title="Project Summary"
            iconColor={T.accent}
            accentBar={`linear-gradient(to right, ${T.accent}, #3B82F6)`}
            copyText={data.summary}
          >
            <MarkdownViewer content={data.summary} />
          </SectionCard>

          <SectionCard icon={Server} title="System Architecture" iconColor="#60A5FA" copyText={data.architecture}>
            <MarkdownViewer content={data.architecture} />
          </SectionCard>
        </div>

        {/* ═══════════ ROW 2: Languages & Complexity ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard icon={FileCode} title="Language Distribution" iconColor="#F472B6">
            <LanguageChart languages={data.languages} totalFilesScanned={data.complexity.numFiles} />
          </SectionCard>

          <SectionCard icon={Activity} title="Complexity Analysis" iconColor="#818CF8">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Difficulty', value: data.complexity.score, badge: true },
                { label: 'Read Time', value: data.complexity.estimatedTime },
                { label: 'Files Scanned', value: data.complexity.numFiles },
                { label: 'Nested Depth', value: `${data.complexity.folderDepth} levels` },
              ].map(({ label, value, badge }) => (
                <div
                  key={label}
                  className="p-4 rounded-xl flex items-center justify-between"
                  style={{ background: T.bgSec, border: `1px solid ${T.border}` }}
                >
                  <span className="text-sm" style={{ color: T.muted }}>{label}</span>
                  {badge ? (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      value === 'High' ? 'bg-red-500/15 text-red-400' :
                      value === 'Medium' ? 'bg-orange-500/15 text-orange-400' :
                      'bg-green-500/15 text-green-400'
                    }`}>{value}</span>
                  ) : (
                    <span className="font-mono text-sm" style={{ color: T.text }}>{value}</span>
                  )}
                </div>
              ))}
              <div
                className="col-span-2 p-4 rounded-xl flex items-center justify-between"
                style={{ background: T.bgSec, border: `1px solid ${T.border}` }}
              >
                <span className="text-sm" style={{ color: T.muted }}>Approximated Code Lines</span>
                <span className="font-mono text-sm" style={{ color: T.text }}>{data.complexity.approxLOC.toLocaleString()} LOC</span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ═══════════ ROW 3: File Tree & Tech Stack ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard
            icon={ListTree}
            title="Interactive File Tree"
            iconColor="#FBBF24"
            accentBar="linear-gradient(to right, #FBBF24, #F59E0B)"
            copyText={data.folderExplanation}
          >
            <div className="space-y-4">
              <FolderTree treeData={data.tree} repoUrl={data.metadata.url} owner={data.metadata.owner} repo={data.metadata.name} />
              <div className="pt-4" style={{ borderTop: `1px solid ${T.border}` }}>
                <h4 className="font-semibold mb-2 text-sm uppercase tracking-wide" style={{ color: T.muted }}>AI Structure Context</h4>
                <MarkdownViewer content={data.folderExplanation} />
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={Network} title="Tech Stack" iconColor="#2DD4BF" copyText={data.techStack}>
            <CollapsibleSection>
              <MarkdownViewer content={data.techStack} />
            </CollapsibleSection>
          </SectionCard>
        </div>

        {/* ═══════════ KEY FILES (improved) ═══════════ */}
        <SectionCard
          icon={Star}
          title="Important Files Detected"
          iconColor={T.accent}
          accentBar={`linear-gradient(to right, ${T.accent}, #6366F1)`}
        >
          <ImportantFiles
            keyFiles={data.keyFiles || []}
            repoUrl={data.metadata.url}
            defaultBranch={data.metadata.defaultBranch}
          />
        </SectionCard>

        {/* ═══════════ ROW 4: Dependencies & Run Instructions ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard icon={Package} title="Core Dependencies" iconColor="#FB923C" copyText={data.dependenciesExplanation || 'No context'}>
            <CollapsibleSection>
              <MarkdownViewer content={data.dependenciesExplanation || 'No dependency information generated.'} />
            </CollapsibleSection>
          </SectionCard>

          <SectionCard
            icon={Server}
            title="How To Run The Project"
            iconColor="#34D399"
            accentBar="linear-gradient(to right, #34D399, #22C55E)"
            copyText={data.runInstructions}
          >
            <CollapsibleSection>
              <MarkdownViewer content={data.runInstructions || 'Instructions not available.'} />
            </CollapsibleSection>
          </SectionCard>
        </div>
      </div>
    </>
  );
}

/* ═══════════════ ERROR VIEW ═══════════════ */
function ErrorView({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4" style={{ background: T.bg }}>
      <div className="relative mb-6" style={{ padding: 20, background: 'rgba(239,68,68,0.1)', borderRadius: '50%' }}>
         <AlertCircle className="w-16 h-16 absolute top-0 -right-2 animate-bounce" style={{ color: '#EF4444' }} />
         <Github className="w-16 h-16" style={{ color: T.muted }} />
      </div>
      <h2 className="text-3xl font-bold tracking-tight" style={{ color: T.text }}>Analysis Failed</h2>
      <p
        className="mt-3 max-w-xl text-center text-lg leading-relaxed p-4 rounded-xl"
        style={{ color: T.muted, background: T.bgSec, border: `1px solid ${T.border}` }}
      >
        {error}
      </p>
      <button
        onClick={onRetry}
        className="mt-8 h-11 px-6 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-200 hover:shadow-lg"
        style={{ background: T.accent, color: '#fff' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = T.accentH; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = T.accent; }}
      >
        <ArrowLeft className="w-4 h-4" />
        Try another repository
      </button>
    </div>
  );
}

/* ═══════════════ EMPTY STATE ═══════════════ */
function EmptyState({ onNewTab }: { onNewTab: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" style={{ background: T.bg }}>
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'rgba(37,99,235,0.08)', border: `1px solid rgba(37,99,235,0.15)` }}
      >
        <Github className="w-10 h-10" style={{ color: T.accent }} />
      </div>
      <h2 className="text-2xl font-bold mb-2" style={{ color: T.text }}>No Repository Open</h2>
      <p className="text-sm mb-8 max-w-md" style={{ color: T.muted }}>
        Open a new tab to analyze a GitHub repository. You can have multiple repositories open simultaneously.
      </p>
      <button
        onClick={onNewTab}
        className="h-12 px-8 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
        style={{ background: T.accent, color: '#fff' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = T.accentH; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = T.accent; }}
      >
        <Github className="w-4 h-4" />
        Analyze a Repository
      </button>
    </div>
  );
}

/* ═══════════════ MAIN DASHBOARD ═══════════════ */
export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const initialUrl = urlParams.get('url');

  const [mounted, setMounted] = useState(false);
  const [newTabModalOpen, setNewTabModalOpen] = useState(false);
  const initializedRef = useRef(false);

  const {
    tabs,
    activeTab,
    activeTabId,
    addTab,
    closeTab,
    switchTab,
    updateTabData,
    updateTabError,
    updateTabChat,
    setChatOpen,
    setChatExpanded,
  } = useTabStore();

  /* ── Fetch repo data for a tab ── */
  const analyzeRepo = useCallback(async (tabId: string, repoUrl: string) => {
    try {
      const data = await fetchRepoData(repoUrl);
      updateTabData(tabId, data);
    } catch (err: any) {
      const errorMsg = axios.isAxiosError(err) 
        ? err.response?.data?.error || err.message 
        : err.message;
      updateTabError(tabId, errorMsg);
    }
  }, [updateTabData, updateTabError]);

  /* ── Initialize with URL param ── */
  useEffect(() => {
    if (initialUrl && !initializedRef.current) {
      initializedRef.current = true;
      const tabId = addTab(initialUrl);
      analyzeRepo(tabId, initialUrl);
    }
  }, [initialUrl, addTab, analyzeRepo]);

  /* ── Mount animation ── */
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  /* ── Handle new tab ── */
  const handleNewTab = useCallback((url: string) => {
    setNewTabModalOpen(false);
    const tabId = addTab(url);
    analyzeRepo(tabId, url);
  }, [addTab, analyzeRepo]);

  /* ── Handle close tab → go home if none left ── */
  const handleCloseTab = useCallback((tabId: string) => {
    closeTab(tabId);
    // If this was the last tab, navigate home
    if (tabs.length <= 1) {
      navigate('/');
    }
  }, [closeTab, tabs.length, navigate]);

  /* ── Navigate home if no URL ── */
  if (!initialUrl && tabs.length === 0) {
    navigate('/');
    return null;
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: T.bg,
        color: T.text,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 250ms ease-out, transform 250ms ease-out',
      }}
    >
      {/* ═══════════ TAB BAR ═══════════ */}
      <TabBar
        tabs={tabs.map(t => ({
          id: t.id,
          repoName: t.repoName,
          owner: t.owner,
          isLoading: t.isLoading,
          isError: t.isError,
        }))}
        activeTabId={activeTabId}
        onSwitchTab={switchTab}
        onCloseTab={handleCloseTab}
        onNewTab={() => setNewTabModalOpen(true)}
      />

      {/* Spacer for fixed tab bar */}
      <div style={{ height: 44 }} />

      {/* ═══════════ TAB CONTENT ═══════════ */}
      {activeTab ? (
        activeTab.isLoading ? (
          <LoadingState />
        ) : activeTab.isError ? (
          <ErrorView
            error={activeTab.error || 'Unknown error'}
            onRetry={() => setNewTabModalOpen(true)}
          />
        ) : activeTab.data ? (
          <div className="flex-1 pb-20">
            <RepoContent data={activeTab.data} />

            {/* Per-tab Chat */}
            <Chat
              repoId={activeTab.data.repoId}
              repoName={activeTab.repoName}
              messages={activeTab.chatMessages}
              onMessagesChange={(msgs) => updateTabChat(activeTab.id, msgs)}
              isOpen={activeTab.chatOpen}
              onOpenChange={(open) => setChatOpen(activeTab.id, open)}
              isExpanded={activeTab.chatExpanded}
              onExpandedChange={(expanded) => setChatExpanded(activeTab.id, expanded)}
            />
          </div>
        ) : null
      ) : (
        <EmptyState onNewTab={() => setNewTabModalOpen(true)} />
      )}

      {/* ═══════════ NEW TAB MODAL ═══════════ */}
      <NewTabModal
        isOpen={newTabModalOpen}
        onClose={() => setNewTabModalOpen(false)}
        onSubmit={handleNewTab}
      />
    </div>
  );
}
