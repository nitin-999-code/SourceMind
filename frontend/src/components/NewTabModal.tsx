import { useState, useRef, useEffect } from 'react';
import { Github, ArrowRight, X, Sparkles } from 'lucide-react';
import { theme as T } from '../lib/theme';

const QUICK_REPOS = [
  { label: 'facebook/react', url: 'https://github.com/facebook/react' },
  { label: 'vercel/next.js', url: 'https://github.com/vercel/next.js' },
  { label: 'denoland/deno', url: 'https://github.com/denoland/deno' },
  { label: 'microsoft/vscode', url: 'https://github.com/microsoft/vscode' },
];

interface NewTabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

export default function NewTabModal({ isOpen, onClose, onSubmit }: NewTabModalProps) {
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setUrl('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!url.trim()) return;
    onSubmit(url.trim());
    setUrl('');
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(10,26,47,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: T.card,
          border: `1px solid ${T.border}`,
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          animation: 'modalSlideUp 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${T.border}` }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(37,99,235,0.1)' }}
            >
              <Sparkles className="w-4 h-4" style={{ color: T.accent }} />
            </div>
            <h2 className="font-semibold" style={{ color: T.text }}>Analyze New Repository</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200"
            style={{ color: T.muted }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <form onSubmit={handleSubmit}>
            <div
              className="flex items-center p-1 rounded-xl"
              style={{ background: T.bgSec, border: `1px solid ${T.border}` }}
            >
              <div className="flex items-center flex-1 gap-3 pl-3">
                <Github className="w-4 h-4 shrink-0" style={{ color: T.muted }} />
                <input
                  ref={inputRef}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="w-full h-11 bg-transparent text-sm outline-none"
                  style={{ color: T.text, caretColor: T.accent }}
                />
              </div>
              <button
                type="submit"
                disabled={!url.trim()}
                className="h-10 px-5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 disabled:opacity-40 shrink-0"
                style={{ background: T.accent, color: '#0A0A0A' }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) e.currentTarget.style.background = T.accentH;
                }}
                onMouseLeave={(e) => { e.currentTarget.style.background = T.accent; }}
              >
                Analyze
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick picks */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: T.muted }}>
              Quick picks
            </p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_REPOS.map(repo => (
                <button
                  key={repo.url}
                  onClick={() => onSubmit(repo.url)}
                  className="flex items-center gap-2 p-3 rounded-xl text-left transition-all duration-200 group"
                  style={{ background: T.bgSec, border: `1px solid ${T.border}` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Github className="w-4 h-4 shrink-0" style={{ color: T.muted }} />
                  <span className="text-sm font-mono truncate" style={{ color: T.text }}>
                    {repo.label}
                  </span>
                  <ArrowRight
                    className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    style={{ color: T.accent }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
