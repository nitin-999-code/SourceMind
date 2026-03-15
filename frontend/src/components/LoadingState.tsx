import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { theme as T } from '../lib/theme';

const MESSAGES = [
  "Fetching repository metadata from GitHub...",
  "Cloning and traversing file tree structure...",
  "Parsing dependencies from package files...",
  "Running AI heuristics to identify key files...",
  "Generating system architecture overview...",
  "Compiling comprehensive documentation...",
  "Finalizing analysis results..."
];

export function LoadingState() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev < MESSAGES.length - 1 ? prev + 1 : prev));
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const shimmerStyle = {
    background: T.card,
    border: `1px solid ${T.border}`,
  };

  const skeletonBar = (w: string) => (
    <div className="rounded" style={{ width: w, height: 12, background: 'rgba(255,255,255,0.04)' }} />
  );

  return (
    <div className="min-h-screen pb-20 overflow-hidden" style={{ background: T.bg, color: T.text }}>
      {/* Skeleton Header */}
      <header
        className="sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between"
        style={{
          background: 'rgba(10,26,47,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <div className="flex items-center gap-4 animate-pulse">
           <div className="w-10 h-10 rounded-lg" style={{ background: T.bgSec, border: `1px solid ${T.border}` }} />
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg" style={{ background: T.bgSec, border: `1px solid ${T.border}` }} />
              <div className="space-y-2">
                 <div className="rounded" style={{ width: 192, height: 20, background: 'rgba(255,255,255,0.05)' }} />
                 <div className="rounded" style={{ width: 128, height: 12, background: 'rgba(255,255,255,0.03)' }} />
              </div>
           </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="px-4 py-2 rounded-full flex items-center gap-2"
            style={{ background: T.bgSec, border: `1px solid ${T.border}` }}
          >
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: T.accent }} />
          </div>
          <p className="font-medium text-sm hidden md:block w-64" style={{ color: T.muted }}>
            {MESSAGES[msgIndex]}
          </p>
        </div>
      </header>

      {/* Skeleton Dashboard Layout */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
             <div key={i} className="rounded-xl h-28 flex flex-col justify-center items-center gap-3" style={shimmerStyle}>
               <div className="w-8 h-8 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
               <div className="w-16 h-4 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
               <div className="w-12 h-2 rounded" style={{ background: 'rgba(255,255,255,0.03)' }} />
             </div>
          ))}
        </div>

        {/* Big Cards Skeleton Rows */}
        {[...Array(3)].map((_, row) => (
          <div key={row} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl min-h-[300px] p-6" style={shimmerStyle}>
              <div className="mb-6">{skeletonBar('60%')}</div>
              <div className="space-y-3">
                {skeletonBar('100%')}
                {skeletonBar('85%')}
                {skeletonBar('70%')}
              </div>
              <div className="mt-6 rounded-lg" style={{ height: 96, background: 'rgba(255,255,255,0.03)' }} />
            </div>
            <div className="rounded-xl min-h-[300px] p-6" style={shimmerStyle}>
              <div className="mb-6">{skeletonBar('50%')}</div>
              <div className="space-y-3">
                {skeletonBar('100%')}
                {skeletonBar('75%')}
                {skeletonBar('90%')}
              </div>
              <div className="mt-6 rounded-xl" style={{ height: 128, background: 'rgba(255,255,255,0.03)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
