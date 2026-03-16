import { useState, useMemo, useCallback, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { Folder, FolderOpen, File as FileIcon, Loader2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';
import { MarkdownViewer } from './MarkdownViewer';

/* ═══════════════ MEMOIZED FILE EXPLANATION MODAL ═══════════════ */
/**
 * Rendered via createPortal at document.body level.
 * Completely decoupled from the FolderTree and SectionCard DOM hierarchy,
 * preventing hover-triggered re-renders from causing flickering.
 */
const FileExplanationModal = memo(function FileExplanationModal({
  file,
  onClose,
}: {
  file: { path: string; content: string | null; loading: boolean };
  onClose: () => void;
}) {
  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Disable background scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="file-modal-overlay"
      onClick={(e) => {
        // Close when clicking the overlay background (not the card itself)
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(10,26,47,0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        pointerEvents: 'auto',
        animation: 'fadeIn 150ms ease-out',
      }}
    >
      <div
        className="file-modal-card"
        style={{
          width: '100%',
          maxWidth: '42rem',
          maxHeight: '80vh',
          borderRadius: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: '#162B4A',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
          animation: 'scaleIn 150ms ease-out',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: '#0F243D',
          }}
        >
          <h3
            className="font-semibold flex items-center gap-2 min-w-0"
            style={{ color: '#F1F5F9' }}
          >
            <FileIcon className="w-5 h-5 shrink-0" style={{ color: '#2563EB' }} />
            <span className="truncate">{file.path}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md transition-colors shrink-0 ml-2"
            style={{ color: '#94A3B8' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {file.loading ? (
            <div
              className="flex flex-col items-center justify-center py-12"
              style={{ color: '#94A3B8' }}
            >
              <Loader2
                className="w-8 h-8 animate-spin mb-4"
                style={{ color: '#2563EB' }}
              />
              <p>Analyzing file purpose and logic...</p>
            </div>
          ) : (
            <MarkdownViewer content={file.content || ''} />
          )}
        </div>
      </div>
    </div>
  );
});

/* ═══════════════ TREE NODE ═══════════════ */
function TreeNode({
  node,
  depth,
  onFileClick,
  selectedPath,
  modalOpen,
}: {
  node: any;
  depth: number;
  onFileClick: (path: string) => void;
  selectedPath?: string;
  modalOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(depth < 1);
  const isFolder = node.type === 'folder';
  const isSelected = selectedPath === node.path;

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          'flex items-center gap-1.5 py-1 px-2 rounded-md cursor-pointer transition-colors',
          depth > 0 && 'ml-4 border-b-0 pl-3 border-border/50',
          // Only apply hover styles when modal is NOT open
          !modalOpen && isFolder && 'hover:bg-muted/50 text-foreground',
          !modalOpen && !isFolder && 'hover:bg-muted/50 hover:text-primary',
          isSelected &&
            'bg-indigo-500/10 border-l-4 border-indigo-500 text-indigo-500 hover:bg-indigo-500/20'
        )}
        onClick={() => (isFolder ? setIsOpen(!isOpen) : onFileClick(node.path))}
        style={{
          paddingLeft: `${depth * 10}px`,
          // Freeze pointer events on file items when modal is open
          pointerEvents: modalOpen && !isFolder ? 'none' : 'auto',
        }}
      >
        {isFolder ? (
          isOpen ? (
            <FolderOpen
              className={cn(
                'w-4 h-4',
                isSelected ? 'text-indigo-500' : 'text-primary'
              )}
            />
          ) : (
            <Folder
              className={cn(
                'w-4 h-4',
                isSelected ? 'text-indigo-500' : 'text-primary'
              )}
            />
          )
        ) : (
          <FileIcon
            className={cn(
              'w-4 h-4 ml-4',
              isSelected ? 'text-indigo-500' : 'text-muted-foreground'
            )}
          />
        )}
        <span className="truncate max-w-[90%] font-medium">{node.name}</span>
      </div>
      {isFolder && isOpen && (
        <div className="flex flex-col">
          {Object.values(node.children).map((childNode: any) => (
            <TreeNode
              key={childNode.name}
              node={childNode}
              depth={depth + 1}
              onFileClick={onFileClick}
              selectedPath={selectedPath}
              modalOpen={modalOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════ FOLDER TREE (main export) ═══════════════ */
export function FolderTree({
  treeData,
  repoUrl,
}: {
  treeData: any[];
  repoUrl: string;
  owner?: string;
  repo?: string;
}) {
  const [selectedFile, setSelectedFile] = useState<{
    path: string;
    content: string | null;
    loading: boolean;
  } | null>(null);

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
            type:
              i === parts.length - 1 && item.type === 'blob' ? 'file' : 'folder',
            children: {},
          };
        }
        current = current[part].children;
      });
    });
    return root;
  }, [treeData]);

  // Stable callback — does NOT depend on hover state
  const handleFileClick = useCallback(
    async (filePath: string) => {
      setSelectedFile({ path: filePath, content: null, loading: true });
      try {
        const { data } = await axios.post(
          'https://sourcemind.onrender.com/api/explain-file',
          { url: repoUrl, filePath }
        );
        setSelectedFile({
          path: filePath,
          content: data.explanation,
          loading: false,
        });
      } catch (error: any) {
        setSelectedFile({
          path: filePath,
          content: `Error: ${error.response?.data?.error || error.message}`,
          loading: false,
        });
      }
    },
    [repoUrl]
  );

  const handleCloseModal = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const modalOpen = selectedFile !== null;

  const renderTree = (nodes: any, depth = 0) => {
    return Object.values(nodes).map((node: any) => (
      <TreeNode
        key={node.name}
        node={node}
        depth={depth}
        onFileClick={handleFileClick}
        selectedPath={selectedFile?.path}
        modalOpen={modalOpen}
      />
    ));
  };

  return (
    <>
      <div
        className="text-sm font-mono p-2 rounded-xl w-full max-h-96 overflow-y-auto"
        style={{
          background: '#0F243D',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#94A3B8',
        }}
      >
        {Object.keys(tree).length === 0 ? 'No tree data generated' : renderTree(tree)}
      </div>

      {/* ── Modal rendered via Portal at document.body ── */}
      {selectedFile &&
        createPortal(
          <FileExplanationModal file={selectedFile} onClose={handleCloseModal} />,
          document.body
        )}

      {/* ── Inline keyframe styles for modal animations ── */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
