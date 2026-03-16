import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { RepoContent, ErrorView } from './Dashboard';
import { LoadingState } from '../components/LoadingState';
import { theme as T } from '../lib/theme';
import Chat from '../components/Chat';
import { Share2, ArrowRight } from 'lucide-react';

const API_URL = 'https://sourcemind.onrender.com/api';

export default function SharedAnalysis() {
  const { owner, repo } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRateLimit, setIsRateLimit] = useState(false);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);

  const fetchAnalysis = async () => {
    if (!owner || !repo) {
      setError('Invalid share link: Missing repository information.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setIsRateLimit(false);
    
    const url = `https://github.com/${owner}/${repo}`;
    console.log("Share page repo:", url);

    try {
      const response = await axios.post(`${API_URL}/analyze`, { url });
      console.log("Analysis result:", response.data);
      setData(response.data);
    } catch (err: any) {
      if (err.response?.status === 429 || err.response?.data?.errorType === 'RATE_LIMIT') {
        setIsRateLimit(true);
        setError(err.response?.data?.error || 'AI analysis is temporarily busy.');
      } else {
        setError(err.response?.data?.error || err.message || 'Repository analysis failed');
      }
      console.error("Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, repo]);

  // Make sure we never render a blank screen.
  // We show loading first if it's explicitly loading, OR if we have no data and no error yet.
  if (loading || (!data && !error)) {
    return (
      <div className="min-h-screen flex flex-col pt-16" style={{ background: T.bg }}>
        <LoadingState />
      </div>
    );
  }

  // If there's an error, show it.
  if (error) {
    return (
      <div className="min-h-screen flex flex-col pt-16" style={{ background: T.bg }}>
        <ErrorView error={error} isRateLimit={isRateLimit} onRetry={fetchAnalysis} />
      </div>
    );
  }

  // Fallback safely to error if somehow data is still missing (should be impossible now).
  if (!data) {
     return (
        <div className="min-h-screen flex flex-col pt-16" style={{ background: T.bg }}>
          <ErrorView error={"Repository could not be analyzed."} onRetry={fetchAnalysis} />
        </div>
     );
  }



  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg, color: T.text, opacity: 1 }}>
      {/* ═══════════ SHARED BANNER ═══════════ */}
      <div 
        className="w-full px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(to right, rgba(10,26,47,0.9), rgba(15,35,63,0.9))', 
          borderColor: T.border 
        }}
      >
        {/* Subtle glow effect */}
        <div 
          className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl mix-blend-screen pointer-events-none" 
        />
        
        <div className="flex items-center gap-4 relative z-10">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg border"
            style={{ background: 'rgba(37,99,235,0.1)', borderColor: 'rgba(37,99,235,0.2)' }}
          >
            <Share2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide uppercase text-blue-400 mb-0.5">
              Shared Repository Analysis
            </h2>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg" style={{ color: T.text }}>
                {owner} <span style={{ color: T.muted }}>/</span> {repo}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: T.muted }}>
              This analysis was generated using SourceMind.
            </p>
          </div>
        </div>
        
        <Link
          to="/"
          className="h-10 px-5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 relative z-10"
          style={{ background: T.accent, color: '#fff', border: `1px solid ${T.accent}` }}
          onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
        >
          Analyze Your Own Repository
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex-1 pb-20">
        <RepoContent data={data} />
      </div>
      
      <Chat
        repoId={data.repoId}
        repoName={`${owner}/${repo}`}
        messages={chatMessages}
        onMessagesChange={setChatMessages}
        isOpen={chatOpen}
        onOpenChange={setChatOpen}
        isExpanded={chatExpanded}
        onExpandedChange={setChatExpanded}
      />
    </div>
  );
}
