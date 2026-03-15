import { useState, useMemo } from 'react';
import { Folder, FolderOpen, File as FileIcon, Loader2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';
import { MarkdownViewer } from './MarkdownViewer';

export function FolderTree({ treeData, repoUrl }: { treeData: any[]; repoUrl: string; owner?: string; repo?: string }) {
  const [selectedFile, setSelectedFile] = useState<{path: string, content: string | null, loading: boolean} | null>(null);

  const tree = useMemo(() => {
    const root: any = {};
    if (!treeData) return root;

    treeData.forEach((item) => {
      const parts = item.path.split('/');
      let current = root;
      parts.forEach((part: string, i: number) => {
        if (!current[part]) {
          current[part] = {
            name: part,
            path: item.path,
            type: i === parts.length - 1 && item.type === 'blob' ? 'file' : 'folder',
            children: {}
          };
        }
        current = current[part].children;
      });
    });
    return root;
  }, [treeData]);

  const handleFileClick = async (filePath: string) => {
    setSelectedFile({ path: filePath, content: null, loading: true });
    try {
      const { data } = await axios.post('https://sourcemind.onrender.com/api/explain-file', { url: repoUrl, filePath });
      setSelectedFile({ path: filePath, content: data.explanation, loading: false });
    } catch (error: any) {
      setSelectedFile({ 
        path: filePath, 
        content: `Error: ${error.response?.data?.error || error.message}`, 
        loading: false 
      });
    }
  };

  const renderTree = (nodes: any, depth = 0) => {
    return Object.values(nodes).map((node: any) => (
      <TreeNode key={node.name} node={node} depth={depth} onFileClick={handleFileClick} selectedPath={selectedFile?.path} />
    ));
  };

  return (
    <>
      <div className="text-sm font-mono p-2 rounded-xl w-full max-h-96 overflow-y-auto" style={{ background: '#0F243D', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}>
        {Object.keys(tree).length === 0 ? "No tree data generated" : renderTree(tree)}
      </div>

      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(10,26,47,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-2xl max-h-[80vh] rounded-xl flex flex-col overflow-hidden" style={{ background: '#162B4A', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}>
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0F243D' }}>
              <h3 className="font-semibold flex items-center gap-2" style={{ color: '#F1F5F9' }}>
                <FileIcon className="w-5 h-5" style={{ color: '#2563EB' }} />
                {selectedFile.path}
              </h3>
              <button 
                onClick={() => setSelectedFile(null)}
                className="p-1 rounded-md transition-colors"
                style={{ color: '#94A3B8' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {selectedFile.loading ? (
                <div className="flex flex-col items-center justify-center py-12" style={{ color: '#94A3B8' }}>
                  <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: '#2563EB' }} />
                  <p>Analyzing file purpose and logic...</p>
                </div>
              ) : (
                <MarkdownViewer content={selectedFile.content || ''} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TreeNode({ node, depth, onFileClick, selectedPath }: { node: any, depth: number, onFileClick: (path: string) => void, selectedPath?: string }) {
  const [isOpen, setIsOpen] = useState(depth < 1);
  const isFolder = node.type === 'folder';
  const isSelected = selectedPath === node.path;

  return (
    <div className="flex flex-col">
      <div 
        className={cn(
          "flex items-center gap-1.5 py-1 px-2 rounded-md cursor-pointer transition-colors", 
          depth > 0 && "ml-4 border-b-0 pl-3 border-border/50", 
          isFolder ? "hover:bg-muted/50 text-foreground" : "hover:bg-muted/50 hover:text-primary",
          isSelected && "bg-indigo-500/10 border-l-4 border-indigo-500 text-indigo-500 hover:bg-indigo-500/20"
        )}
        onClick={() => isFolder ? setIsOpen(!isOpen) : onFileClick(node.path)}
        style={{ paddingLeft: `${depth * 10}px` }}
      >
        {isFolder ? (
          isOpen ? <FolderOpen className={cn("w-4 h-4", isSelected ? "text-indigo-500" : "text-primary")} /> : <Folder className={cn("w-4 h-4", isSelected ? "text-indigo-500" : "text-primary")} />
        ) : (
          <FileIcon className={cn("w-4 h-4 ml-4", isSelected ? "text-indigo-500" : "text-muted-foreground")} />
        )}
        <span className="truncate max-w-[90%] font-medium">{node.name}</span>
      </div>
      {isFolder && isOpen && (
        <div className="flex flex-col">
          {Object.values(node.children).map((childNode: any) => (
            <TreeNode key={childNode.name} node={childNode} depth={depth + 1} onFileClick={onFileClick} selectedPath={selectedPath} />
          ))}
        </div>
      )}
    </div>
  );
}
