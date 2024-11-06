import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';

import './index.css';

const position = { x: 0, y: 0 };
const edgeType = ConnectionLineType.SmoothStep;

export const initialNodes = [
  { id: '1', type: 'input', data: { label: 'input' }, position, sourcePosition: 'right', targetPosition: 'left', group: 'group1' },
  { id: '2', data: { label: 'node 2' }, position, sourcePosition: 'right', targetPosition: 'left', group: 'group1' },
  { id: '2a', data: { label: 'node 2a' }, position, sourcePosition: 'right', targetPosition: 'left', group: 'group1' },
  { id: '2b', data: { label: 'node 2b' }, position, sourcePosition: 'right', targetPosition: 'left', group: 'group1' },
  { id: '2c', data: { label: 'node 2c' }, position, sourcePosition: 'right', targetPosition: 'left', group: 'group1' },
  { id: '2d', data: { label: 'node 2d' }, position, sourcePosition: 'right', targetPosition: 'left', group: 'group1' },
  { id: '3', data: { label: 'node 3' }, position, sourcePosition: 'right', targetPosition: 'left', group: 'group2' },
  { id: '4', data: { label: 'node 4' }, position, sourcePosition: 'right', targetPosition: 'left', group: 'group2' },
  { id: '5', data: { label: 'node 5' }, position, sourcePosition: 'right', targetPosition: 'left', group: 'group2' },
  { id: '6', type: 'output', data: { label: 'output' }, position, sourcePosition: 'right', targetPosition: 'left', group: 'group3' },
  { id: '7', type: 'output', data: { label: 'output' }, position, sourcePosition: 'right', targetPosition: 'left', group: 'group3' },
];

export const initialEdges = [
  { id: 'e12', source: '1', target: '2', type: edgeType, animated: true },
  { id: 'e13', source: '1', target: '3', type: edgeType, animated: true },
  { id: 'e22a', source: '2', target: '2a', type: edgeType, animated: true },
  { id: 'e22b', source: '2', target: '2b', type: edgeType, animated: true },
  { id: 'e22c', source: '2', target: '2c', type: edgeType, animated: true },
  { id: 'e2c2d', source: '2c', target: '2d', type: edgeType, animated: true },
  { id: 'e45', source: '4', target: '5', type: edgeType, animated: true },
  { id: 'e56', source: '5', target: '6', type: edgeType, animated: true },
  { id: 'e57', source: '5', target: '7', type: edgeType, animated: true },
  { id: 'e16', source: '1', target: '6', type: edgeType, animated: true },
  { id: 'e17', source: '1', target: '7', type: edgeType, animated: true },
  { id: 'e2c6', source: '2c', target: '6', type: edgeType, animated: true },
  { id: 'e7c1', source: '7', target: '1', type: edgeType, animated: true },
  { id: 'e6c1', source: '6', target: '1', type: edgeType, animated: true },
  { id: 'xx', source: '5', target: '4', type: edgeType, animated: true },
  { id: 'xxt', source: '3', target: '1', type: edgeType, animated: true },
  { id: 'xxtt', source: '3', target: '6', type: edgeType, animated: true },
  { id: 'xxtt7', source: '3', target: '7', type: edgeType, animated: true },
  { id: 'xxtta', source: '6', target: '3', type: edgeType, animated: true },
  { id: 'xxttb', source: '7', target: '3', type: edgeType, animated: true },
];

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes, edges) => {
  dagreGraph.setGraph({ rankdir: 'LR' });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      targetPosition: edges.some(e => e.source === node.id) ? 'left' : 'right',
      sourcePosition: edges.some(e => e.target === node.id) ? 'right' : 'left',
    };
  });

  return { nodes: newNodes, edges };
};

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  initialNodes,
  initialEdges
);

const HorizontalFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    layoutedEdges.map(edge => ({
      ...edge,
      markerEnd: { type: 'arrowclosed' },
    }))
  );
  const [selectedGroup, setSelectedGroup] = useState(null);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, type: ConnectionLineType.SmoothStep, animated: true, markerEnd: { type: 'arrowclosed' } }, eds)
      ),
    []
  );

  const onNodeClick = useCallback((event, node) => {
    const nodeGroup = node.group || null;
    setSelectedGroup(nodeGroup);
  }, []);

  const getNodeStyle = (node) => {
    if (selectedGroup && node.group === selectedGroup) {
      return { border: '2px solid red', backgroundColor: 'lightcoral' };
    }
    return {};
  };

  return (
    <ReactFlow
      nodes={nodes.map((node) => ({
        ...node,
        style: getNodeStyle(node),
      }))}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
      attributionPosition="bottom-left"
    />
  );
};

export function App() {
  return <HorizontalFlow />;
}
