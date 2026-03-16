import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { RepoContent, ErrorView } from './Dashboard';
import { LoadingState } from '../components/LoadingState';
import { theme as T } from '../lib/theme';
import Chat from '../components/Chat';

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
