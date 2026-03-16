import { X, Plus, Github } from 'lucide-react';
import Logo from './Logo';
import { theme as T } from '../lib/theme';

interface Tab {
  id: string;
  tabType: 'repo' | 'analyzer';
  repoName: string;
  owner: string;
  isLoading: boolean;
  isError: boolean;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onSwitchTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
}

export default function TabBar({ tabs, activeTabId, onSwitchTab, onCloseTab, onNewTab }: TabBarProps) {
  if (tabs.length === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-end"
      style={{
        background: T.bgSec,
        borderBottom: `1px solid ${T.border}`,
        height: 44,
      }}
    >
      {/* Tabs + inline new-tab button */}
      <div className="flex-1 flex items-end overflow-x-auto scrollbar-none px-2 gap-0.5" style={{ height: '100%' }}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isAnalyzer = tab.tabType === 'analyzer';

          return (
            <button
              key={tab.id}
              onClick={() => onSwitchTab(tab.id)}
              className="group relative flex items-center gap-2 px-4 py-0 shrink-0 transition-all duration-200 outline-none select-none"
              style={{
                height: isActive ? 38 : 34,
                marginTop: 'auto',
                background: isActive ? T.card : 'transparent',
                borderRadius: '10px 10px 0 0',
                border: isActive ? `1px solid ${T.border}` : '1px solid transparent',
                borderBottom: isActive ? '1px solid transparent' : 'none',
                color: isActive ? T.text : T.muted,
                minWidth: isAnalyzer ? 150 : 140,
                maxWidth: 220,
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              {/* Loading indicator */}
              {tab.isLoading && (
                <div
                  className="absolute bottom-0 left-0 h-0.5 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${T.accent}, transparent)`,
                    animation: 'tabLoadShimmer 1.5s ease-in-out infinite',
                    width: '100%',
                  }}
                />
              )}

              {/* Error indicator */}
              {tab.isError && (
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: '#EF4444' }} />
              )}

              {/* Tab icon */}
              {isAnalyzer ? (
                <Logo size={16} />
              ) : (
                !tab.isError && !tab.isLoading && (
                  <Github className="w-3.5 h-3.5 shrink-0" style={{ color: isActive ? T.accent : T.muted }} />
                )
              )}

              {/* Tab label */}
              <span className="truncate text-xs font-medium">
                {isAnalyzer ? (
                  <span style={{ color: isActive ? T.accent : T.muted }}>New Analysis</span>
                ) : tab.isLoading ? (
                  <span style={{ color: T.muted }}>Analyzing...</span>
                ) : (
                  <>
                    <span style={{ opacity: 0.5 }}>{tab.owner}/</span>
                    {tab.repoName}
                  </>
                )}
              </span>

              {/* Close button */}
              <div
                className="ml-auto shrink-0 w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <X className="w-3 h-3" />
              </div>

              {/* Active tab bottom cover */}
              {isActive && (
                <div
                  className="absolute -bottom-px left-0 right-0 h-px"
                  style={{ background: T.card }}
                />
              )}
            </button>
          );
        })}

        {/* ── Inline "+" button — appears right after the last tab ── */}
        <button
          onClick={onNewTab}
          className="shrink-0 flex items-center justify-center self-center transition-all duration-200 outline-none"
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            color: T.muted,
            background: 'transparent',
            marginLeft: 2,
          }}
          title="Open new analysis tab"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(37,99,235,0.12)';
            e.currentTarget.style.color = '#60A5FA';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = T.muted;
          }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
