import { useState, useMemo } from 'react';
import { FileCode, ExternalLink, ChevronDown, ChevronUp, FolderCog, FileText, Wrench, Package } from 'lucide-react';
import { CopyButton } from './CopyButton';

/* ═══════════════ DESIGN TOKENS ═══════════════ */
const T = {
  bg:      '#0A1A2F',
  bgSec:   '#0F243D',
  card:    '#162B4A',
  accent:  '#2563EB',
  text:    '#F1F5F9',
  muted:   '#94A3B8',
  border:  'rgba(255,255,255,0.08)',
};

/* ═══════════════ FILE CATEGORIZATION ═══════════════ */
const PRIORITY_FILES = new Set([
  'readme.md', 'readme.txt', 'readme',
  'package.json', 'package-lock.json',
  'index.js', 'index.ts', 'index.tsx', 'index.jsx',
  'app.js', 'app.ts', 'app.tsx', 'app.jsx',
  'main.js', 'main.ts', 'main.tsx', 'main.jsx',
  'server.js', 'server.ts',
  'dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
  'tsconfig.json', 'jsconfig.json',
  '.env', '.env.example', '.env.local',
  'vite.config.ts', 'vite.config.js',
  'webpack.config.js', 'webpack.config.ts',
  'next.config.js', 'next.config.mjs', 'next.config.ts',
  'tailwind.config.js', 'tailwind.config.ts',
  '.gitignore', '.eslintrc.js', '.eslintrc.json', 'eslint.config.js',
  'makefile', 'cargo.toml', 'go.mod', 'requirements.txt', 'pyproject.toml',
  'gemfile', 'pom.xml', 'build.gradle',
]);

interface CategoryDef {
  label: string;
  icon: any;
  color: string;
  match: (file: string) => boolean;
}

const CATEGORIES: CategoryDef[] = [
  {
    label: 'Core Files',
    icon: FileCode,
    color: '#60A5FA',
    match: (f) => {
      const lower = f.toLowerCase();
      const name = lower.split('/').pop() || '';
      return ['index.', 'app.', 'main.', 'server.', 'pages/', 'src/'].some(p => name.startsWith(p) || lower.includes(p));
    }
  },
  {
    label: 'Configuration',
    icon: FolderCog,
    color: '#FBBF24',
    match: (f) => {
      const lower = f.toLowerCase();
      const name = lower.split('/').pop() || '';
      return (
        name.includes('config') || name.includes('tsconfig') || name.includes('eslint') ||
        name.startsWith('.env') || name === '.gitignore' || name === 'dockerfile' ||
        name.includes('docker-compose') || name === 'makefile' || name === 'cargo.toml' ||
        name === 'go.mod' || name === 'pyproject.toml' || name === 'pom.xml' ||
        name === 'build.gradle' || name.includes('webpack') || name.includes('vite.config') ||
        name.includes('next.config') || name.includes('tailwind.config') || name.includes('postcss') ||
        name.includes('babel') || name.includes('prettier') || name.includes('jest.config')
      );
    }
  },
  {
    label: 'Documentation',
    icon: FileText,
    color: '#34D399',
    match: (f) => {
      const lower = f.toLowerCase();
      const name = lower.split('/').pop() || '';
      return (
        name.startsWith('readme') || name === 'license' || name === 'licence' ||
        name === 'changelog.md' || name === 'contributing.md' || name.includes('.md') ||
        lower.includes('docs/')
      );
    }
  },
  {
    label: 'Build & Dependencies',
    icon: Package,
    color: '#A78BFA',
    match: (f) => {
      const lower = f.toLowerCase();
      const name = lower.split('/').pop() || '';
      return (
        name === 'package.json' || name === 'package-lock.json' || name === 'yarn.lock' ||
        name === 'pnpm-lock.yaml' || name === 'requirements.txt' || name === 'gemfile' ||
        name === 'gemfile.lock' || lower.includes('build/') || lower.includes('dist/') ||
        lower.includes('.github/') || lower.includes('ci/') || lower.includes('scripts/')
      );
    }
  },
];

const DEFAULT_VISIBLE = 12;

interface ImportantFilesProps {
  keyFiles: string[];
  repoUrl: string;
  defaultBranch: string;
}

export default function ImportantFiles({ keyFiles, repoUrl, defaultBranch }: ImportantFilesProps) {
  const [showAll, setShowAll] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  /* ── Sort: priority first, then alphabetical ── */
  const sortedFiles = useMemo(() => {
    if (!keyFiles || keyFiles.length === 0) return [];
    return [...keyFiles].sort((a, b) => {
      const aName = (a.split('/').pop() || '').toLowerCase();
      const bName = (b.split('/').pop() || '').toLowerCase();
      const aPriority = PRIORITY_FILES.has(aName) ? 0 : 1;
      const bPriority = PRIORITY_FILES.has(bName) ? 0 : 1;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return a.localeCompare(b);
    });
  }, [keyFiles]);

  /* ── Categorize files ── */
  const categorized = useMemo(() => {
    const result: Record<string, string[]> = {};
    const uncategorized: string[] = [];

    CATEGORIES.forEach(cat => { result[cat.label] = []; });

    sortedFiles.forEach(file => {
      let found = false;
      for (const cat of CATEGORIES) {
        if (cat.match(file)) {
          result[cat.label].push(file);
          found = true;
          break;
        }
      }
      if (!found) uncategorized.push(file);
    });

    // Add uncategorized to "Core Files" for visibility
    if (uncategorized.length > 0) {
      result['Core Files'] = [...result['Core Files'], ...uncategorized];
    }

    return result;
  }, [sortedFiles]);

  /* ── Files to display ── */
  const displayFiles = useMemo(() => {
    if (activeCategory) {
      return categorized[activeCategory] || [];
    }
    const files = showAll ? sortedFiles : sortedFiles.slice(0, DEFAULT_VISIBLE);
    return files;
  }, [sortedFiles, showAll, activeCategory, categorized]);

  const hasMore = sortedFiles.length > DEFAULT_VISIBLE;
  const hiddenCount = sortedFiles.length - DEFAULT_VISIBLE;

  if (!keyFiles || keyFiles.length === 0) {
    return (
      <p
        className="text-sm p-4 rounded-lg text-center"
        style={{ color: T.muted, background: T.bgSec, border: `1px solid ${T.border}` }}
      >
        No prominent entry files detected.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
          style={{
            background: !activeCategory ? 'rgba(37,99,235,0.15)' : 'transparent',
            border: `1px solid ${!activeCategory ? 'rgba(37,99,235,0.3)' : T.border}`,
            color: !activeCategory ? '#60A5FA' : T.muted,
          }}
        >
          <Wrench className="w-3 h-3" />
          All ({sortedFiles.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = categorized[cat.label]?.length || 0;
          if (count === 0) return null;
          const isActive = activeCategory === cat.label;
          const Icon = cat.icon;
          return (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(isActive ? null : cat.label)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                background: isActive ? `${cat.color}15` : 'transparent',
                border: `1px solid ${isActive ? `${cat.color}40` : T.border}`,
                color: isActive ? cat.color : T.muted,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon className="w-3 h-3" />
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* File chips */}
      <div className="flex flex-wrap gap-2">
        {displayFiles.map((file: string) => {
          const fileName = file.split('/').pop() || file;
          const isPriority = PRIORITY_FILES.has(fileName.toLowerCase());
          return (
            <div
              key={file}
              className="flex items-center gap-1 rounded-lg pr-1 group transition-all duration-200"
              style={{
                background: T.bgSec,
                border: `1px solid ${isPriority ? 'rgba(37,99,235,0.2)' : T.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isPriority ? 'rgba(37,99,235,0.2)' : T.border;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <a
                href={`${repoUrl}/blob/${defaultBranch}/${file}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 text-sm font-mono flex items-center gap-2 flex-1"
                style={{ color: T.text }}
              >
                <FileCode
                  className="w-4 h-4 shrink-0"
                  style={{ color: isPriority ? T.accent : T.muted }}
                />
                <span className="truncate max-w-[200px]" title={file}>
                  {file.includes('/') ? (
                    <>
                      <span style={{ opacity: 0.4 }}>{file.substring(0, file.lastIndexOf('/') + 1)}</span>
                      {fileName}
                    </>
                  ) : (
                    fileName
                  )}
                </span>
                {isPriority && (
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider shrink-0"
                    style={{ background: 'rgba(37,99,235,0.1)', color: '#60A5FA' }}
                  >
                    Key
                  </span>
                )}
                <ExternalLink
                  className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  style={{ color: T.muted }}
                />
              </a>
              <div className="pr-1">
                <CopyButton text={file} className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More / Show Less */}
      {hasMore && !activeCategory && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg transition-all duration-200"
            style={{
              color: T.muted,
              border: `1px solid ${T.border}`,
              background: showAll ? 'rgba(255,255,255,0.03)' : 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = T.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = showAll ? 'rgba(255,255,255,0.03)' : 'transparent';
              e.currentTarget.style.color = T.muted;
            }}
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show {hiddenCount} More Files
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
