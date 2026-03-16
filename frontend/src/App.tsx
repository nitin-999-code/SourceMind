import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import SharedAnalysis from './pages/SharedAnalysis';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/share/:owner/:repo" element={<SharedAnalysis />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
