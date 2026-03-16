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
    setLoading(true);
    setError('');
    setIsRateLimit(false);
    try {
      const url = `https://github.com/${owner}/${repo}`;
      const response = await axios.post(`${API_URL}/analyze`, { url });
      setData(response.data);
    } catch (err: any) {
      if (err.response?.status === 429 || err.response?.data?.errorType === 'RATE_LIMIT') {
        setIsRateLimit(true);
        setError(err.response?.data?.error || 'AI analysis is temporarily busy.');
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to analyze repository');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (owner && repo) {
      fetchAnalysis();
    }
  }, [owner, repo]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col pt-16" style={{ background: T.bg }}>
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col pt-16" style={{ background: T.bg }}>
        <ErrorView error={error} isRateLimit={isRateLimit} onRetry={fetchAnalysis} />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg, color: T.text }}>
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
