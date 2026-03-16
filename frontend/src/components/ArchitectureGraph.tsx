import { useMemo } from 'react';
import ReactFlow, { Background, Controls, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { theme as T } from '../lib/theme';
import dagre from 'dagre';
import { Folder, Package, PlayCircle, Library } from 'lucide-react';

const nodeTypes = {
  customNode: ({ data }: any) => (
    <div
      className="px-4 py-2 rounded-lg shadow-md border group relative min-w-[150px] flex items-center gap-3 transition-transform hover:scale-105"
      style={{
        background: T.bgSec,
        borderColor: T.border,
        color: T.text,
      }}
      title={data.description}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2" style={{ background: T.muted, border: 'none' }} />
      {data.icon}
      <div>
        <div className="font-semibold text-sm">{data.label}</div>
        {data.subtext && <div className="text-[10px] uppercase tracking-wider" style={{ color: T.muted }}>{data.subtext}</div>}
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2" style={{ background: T.muted, border: 'none' }} />
    </div>
  ),
};

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const nodeWidth = 200;
  const nodeHeight = 60;
  
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 80 });
  
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });
  
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  
  dagre.layout(dagreGraph);
  
  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = direction === 'TB' ? Position.Top : Position.Left;
    node.sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right;
    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });
  
  return { nodes, edges };
};

export function ArchitectureGraph({ data }: { data: any }) {
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const nodes: any[] = [];
    const edges: any[] = [];
    
    // 1. Entry Point
    if (data.primaryEntry) {
      nodes.push({
        id: 'entry',
        type: 'customNode',
        data: {
          label: data.primaryEntry,
          subtext: 'Primary Entry',
          icon: <PlayCircle className="w-5 h-5 text-emerald-400" />,
          description: 'The main starting point of the application',
        },
      });
    }

    // 2. Core Modules
    const coreIds: string[] = [];
    if (data.coreModules && data.coreModules.length > 0) {
      data.coreModules.forEach((mod: any, i: number) => {
        const id = `core-${i}`;
        coreIds.push(id);
        nodes.push({
          id,
          type: 'customNode',
          data: {
            label: mod.directory,
            subtext: `${mod.fileCount} files`,
            icon: <Folder className="w-5 h-5 text-indigo-400" />,
            description: mod.label || 'Core module',
          },
        });
        
        if (data.primaryEntry) {
          edges.push({
            id: `edge-entry-${id}`,
            source: 'entry',
            target: id,
            type: 'smoothstep',
            animated: true,
            style: { stroke: T.muted },
          });
        }
      });
    } else if (data.majorDirectories && data.majorDirectories.length > 0) {
      data.majorDirectories.forEach((dir: string, i: number) => {
        const id = `dir-${i}`;
        coreIds.push(id);
        nodes.push({
          id,
          type: 'customNode',
          data: {
            label: dir,
            subtext: 'Directory',
            icon: <Folder className="w-5 h-5 text-indigo-400" />,
            description: 'Major directory',
          },
        });
        if (data.primaryEntry) {
          edges.push({
            id: `edge-entry-${id}`,
            source: 'entry',
            target: id,
            type: 'smoothstep',
            animated: true,
            style: { stroke: T.muted },
          });
        }
      });
    }

    // 3. Dependencies
    const depIds: string[] = [];
    const frameworksAndCore = [
      ...(data.depGroups?.frameworks || []),
      ...(data.depGroups?.coreLibraries || [])
    ].slice(0, 4);

    if (frameworksAndCore.length > 0) {
      frameworksAndCore.forEach((fw: string, i: number) => {
        const id = `fw-${i}`;
        depIds.push(id);
        nodes.push({
          id,
          type: 'customNode',
          data: {
            label: fw,
            subtext: 'Dependency',
            icon: <Library className="w-5 h-5 text-sky-400" />,
            description: 'Core dependency',
          },
        });
        
        coreIds.forEach(coreId => {
          edges.push({
            id: `edge-${coreId}-${id}`,
            source: coreId,
            target: id,
            type: 'smoothstep',
            style: { stroke: T.border, strokeDasharray: '4' },
          });
        });

        if (coreIds.length === 0 && data.primaryEntry) {
           edges.push({
             id: `edge-entry-${id}`,
             source: 'entry',
             target: id,
             type: 'smoothstep',
             style: { stroke: T.border, strokeDasharray: '4' },
           });
        }
      });
    }
    
    if (nodes.length === 0) {
       return { nodes: [], edges: [] };
    }

    return getLayoutedElements(nodes, edges);
  }, [data]);

  if (layoutedNodes.length === 0) return (
     <div className="flex justify-center flex-col items-center h-full text-sm" style={{ color: T.muted }}>
       <Package className="w-8 h-8 mb-2 opacity-50" />
       <p>No visual architecture available</p>
     </div>
  );

  return (
    <div style={{ height: 400 }} className="w-full relative">
      <ReactFlow
        nodes={layoutedNodes}
        edges={layoutedEdges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color={T.muted} gap={16} size={1} />
        <Controls 
          showInteractive={false} 
          style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '4px'
          }} 
        />
      </ReactFlow>
    </div>
  );
}
