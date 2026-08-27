import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './CustomNodes';

export default function WorkflowCanvas({
  nodes: initialNodes = [],
  edges: initialEdges = [],
  onNodeSelect,
  onNodesChangeParent,
  onEdgesChangeParent
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync with parent props
  React.useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  React.useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      if (onNodesChangeParent) onNodesChangeParent(changes);
    },
    [onNodesChange, onNodesChangeParent]
  );

  const handleEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      if (onEdgesChangeParent) onEdgesChangeParent(changes);
    },
    [onEdgesChange, onEdgesChangeParent]
  );

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        animated: true,
        style: { stroke: '#a855f7', strokeWidth: 2 }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const handleNodeClick = useCallback(
    (event, node) => {
      if (onNodeSelect) onNodeSelect(node);
    },
    [onNodeSelect]
  );

  const handlePaneClick = useCallback(() => {
    if (onNodeSelect) onNodeSelect(null);
  }, [onNodeSelect]);

  return (
    <div className="w-full h-full relative bg-[#0c0e12]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        fitView
        attributionPosition="bottom-left"
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#4b5563', strokeWidth: 2 }
        }}
      >
        <Controls className="!bottom-4 !left-4" />
        <MiniMap
          className="!bottom-4 !right-4"
          nodeColor={(n) => {
            if (n.type === 'trigger') return '#a855f7';
            if (n.type === 'ai') return '#c084fc';
            if (n.type === 'integration') return '#38bdf8';
            return '#fbbf24';
          }}
          maskColor="rgba(12, 14, 18, 0.7)"
        />
        <Background color="#242b35" gap={20} size={1.5} />
      </ReactFlow>
    </div>
  );
}
