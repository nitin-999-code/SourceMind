import { useState } from 'react';
import { Share2, Link, Twitter, Linkedin, X } from 'lucide-react';
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
  const shareUrl = `${window.location.origin}/share/${repoOwner}/${repoName}`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=Check out this interactive architecture analysis of ${repoOwner}/${repoName}!&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleLinkedIn = () => {
    window.open(`https://www.linkedin.com/feed/`, '_blank'); // LinkedIn's share API is limited for generic urls without proper metadata, but this works
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md p-6 rounded-2xl shadow-2xl border flex flex-col gap-4"
          style={{ background: T.card, borderColor: T.border }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Share2 className="w-5 h-5 text-indigo-400" />
              Share Analysis
            </h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg transition-colors hover:bg-white/10"
            >
              <X className="w-5 h-5" style={{ color: T.muted }} />
            </button>
          </div>

          <p className="text-sm" style={{ color: T.muted }}>
            Share this repository's architectural insights with teammates, developers, or on social media.
          </p>

          <div className="flex items-center gap-2 p-3 mt-2 rounded-lg border bg-black/20" style={{ borderColor: T.border }}>
            <Link className="w-4 h-4 shrink-0 text-gray-400" />
            <input 
              type="text" 
              readOnly 
              value={shareUrl} 
              className="flex-1 bg-transparent border-none outline-none text-sm font-mono truncate text-gray-300" 
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
              style={{ background: copied ? 'rgba(52,211,153,0.2)' : T.bgSec, color: copied ? '#34D399' : T.text }}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              onClick={handleTwitter}
              className="flex justify-center items-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors hover:bg-[#1A8CD8]/20"
              style={{ background: T.bgSec, border: `1px solid ${T.border}`, color: '#1DA1F2' }}
            >
              <Twitter className="w-4 h-4" />
              Twitter
            </button>
            <button
              onClick={handleLinkedIn}
              className="flex justify-center items-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors hover:bg-[#0A66C2]/20"
              style={{ background: T.bgSec, border: `1px solid ${T.border}`, color: '#0A66C2' }}
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
