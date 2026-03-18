import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Share2, Link as LinkIcon, Twitter, Linkedin, X, Copy, ExternalLink, CheckCircle2 } from 'lucide-react';
import { theme as T } from '../lib/theme';
import { motion, AnimatePresence } from 'framer-motion';

export function ShareModal({ 
  isOpen, 
  onClose, 
  repoOwner, 
  repoName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  repoOwner: string; 
  repoName: string; 
}) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(`${window.location.origin}/share/${repoOwner}/${repoName}`);
  }, [repoOwner, repoName]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=Check out this interactive architecture analysis of ${repoOwner}/${repoName}!&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleLinkedIn = () => {
    window.open(`https://www.linkedin.com/feed/`, '_blank');
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Overlay mask with blur applied only to itself */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-[520px] p-6 rounded-2xl shadow-lg border flex flex-col gap-6"
            style={{ background: T.card, border: `1px solid ${T.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 pb-1" style={{ color: T.text }}>
                  <Share2 className="w-5 h-5 text-indigo-400" />
                  Share Repository Analysis
                </h2>
                <p className="text-sm" style={{ color: T.muted }}>
                  Anyone with this link can view the analysis.
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/10 shrink-0"
              >
                <X className="w-5 h-5" style={{ color: T.muted }} />
              </button>
            </div>

            {/* Input and main actions */}
            <div className="flex flex-col gap-3">
              <div 
                className="flex items-center gap-3 p-3.5 rounded-xl border bg-black/30 w-full" 
                style={{ borderColor: T.border }}
              >
                <LinkIcon className="w-4 h-4 shrink-0 text-gray-400" />
                <input 
                  type="text" 
                  readOnly 
                  value={url} 
                  className="flex-1 bg-transparent border-none outline-none text-sm font-mono truncate text-gray-300 w-full" 
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopy}
                  className="flex-1 h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                  style={{ 
                    background: copied ? 'rgba(52,211,153,0.15)' : T.accent, 
                    color: copied ? '#34D399' : '#fff',
                    border: copied ? '1px solid rgba(52,211,153,0.3)' : `1px solid ${T.accent}`
                  }}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Link copied to clipboard.
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </button>

                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="h-11 px-6 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-white/5"
                  style={{ color: T.text, border: `1px solid ${T.border}` }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Link
                </a>
              </div>
            </div>

            {/* Social Sharing */}
            <div className="pt-4 grid grid-cols-2 gap-3 border-t" style={{ borderColor: T.border }}>
              <button
                onClick={handleTwitter}
                className="flex justify-center items-center gap-2 py-3 rounded-lg text-sm font-semibold transition-colors hover:bg-[#1A8CD8]/10"
                style={{ background: 'transparent', border: `1px solid ${T.border}`, color: '#1DA1F2' }}
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </button>
              <button
                onClick={handleLinkedIn}
                className="flex justify-center items-center gap-2 py-3 rounded-lg text-sm font-semibold transition-colors hover:bg-[#0A66C2]/10"
                style={{ background: 'transparent', border: `1px solid ${T.border}`, color: '#0A66C2' }}
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Use portal to avoid any interference from parent components (e.g. z-index or stacking context)
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
