import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MiniMap // Импортируем MiniMap
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';

const mockServerData = {
  vertices: [
    { id: 'classA', name: 'ClassA', type: 'class', group: 'group1' },
    { id: 'classB', name: 'ClassB', type: 'class', group: 'group1' },
    { id: 'classC', name: 'ClassC', type: 'class', group: 'group2' },
    { id: 'classD', name: 'ClassD', type: 'class', group: 'group2' },
    { id: 'classE', name: 'ClassE', type: 'class', group: 'group3' },
    { id: 'funcX', name: 'functionX', type: 'function', group: 'group1' },
    { id: 'funcY', name: 'functionY', type: 'function', group: 'group1' },
    { id: 'funcZ', name: 'functionZ', type: 'function', group: 'group2' },
    { id: 'funcW', name: 'functionW', type: 'function', group: 'group2' },
    { id: 'funcV', name: 'functionV', type: 'function', group: 'group3' },
    { id: 'funcU', name: 'functionU', type: 'function', group: 'group3' },
    { id: 'funcT', name: 'functionT', type: 'function', group: 'group4' },
    { id: 'funcS', name: 'functionS', type: 'function', group: 'group4' },
    { id: 'funcR', name: 'functionR', type: 'function', group: 'group4' },
    { id: 'funcQ', name: 'functionQ', type: 'function', group: 'group4' },
    { id: 'funcP', name: 'functionP', type: 'function', group: 'group5' },
  ],
  edges: [
    { fromID: 'classA', toID: 'funcX' },
    { fromID: 'funcX', toID: 'classB' },
    { fromID: 'funcX', toID: 'funcY' },
    { fromID: 'funcY', toID: 'classC' },
    { fromID: 'classB', toID: 'funcZ' },
    { fromID: 'funcZ', toID: 'funcW' },
    { fromID: 'funcW', toID: 'classD' },
    { fromID: 'classC', toID: 'funcV' },
    { fromID: 'funcV', toID: 'funcU' },
    { fromID: 'funcU', toID: 'classE' },
    { fromID: 'funcU', toID: 'funcT' },
    { fromID: 'funcT', toID: 'funcS' },
    { fromID: 'funcS', toID: 'funcR' },
    { fromID: 'funcR', toID: 'funcQ' },
    { fromID: 'funcQ', toID: 'funcP' },
    { fromID: 'funcP', toID: 'classA' }, // Потенциальная коллизия (замкнутый цикл)
  ],
};

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
const nodeWidth = 172;
const nodeHeight = 36;

const GraphComponent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const edgeType = ConnectionLineType.SimpleBezier;
  const position = { x: 0, y: 0 };

  useEffect(() => {
    const initialNodes = mockServerData.vertices.map((vertex) => ({
      id: vertex.id,
      data: { label: vertex.name },
      position,
      group: vertex.group,  // Используем новое поле group
      style: vertex.type === 'function'
        ? { borderRadius: '15px', backgroundColor: 'lightblue' }
        : { backgroundColor: 'lightgreen' }
    }));

    const initialEdges = mockServerData.edges.map((edge) => ({
      id: `e${edge.fromID}-${edge.toID}`,
      source: edge.fromID,
      target: edge.toID,
      type: edgeType,
      animated: true,
      markerEnd: { type: 'arrowclosed' }
    }));

    const layoutedElements = getLayoutedElements(initialNodes, initialEdges);
    setNodes(layoutedElements.nodes);
    setEdges(layoutedElements.edges);
  }, []);

  const getLayoutedElements = (nodes, edges) => {
    dagreGraph.setGraph({
      rankdir: 'LR', // Горизонтальная ориентация
      nodesep: 50,   // Пространство между узлами
      edgesep: 200,   // Пространство между рёбрами
      ranksep: 50   // Пространство между уровнями (ветвями)
    });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        targetPosition: 'left',
        sourcePosition: 'right',  
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  };

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, type: edgeType, animated: true, markerEnd: { type: 'arrowclosed' } }, eds)
      ),
    []
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedGroup(node.group);  // Обновляем состояние группы
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedGroup(null);  // Снимаем выделение
  }, []);

  const getNodeStyle = (node) => {
    if (selectedGroup && node.group === selectedGroup) {
      return { border: '2px solid red', backgroundColor: 'lightcoral' };  // Выделяем только по полю group
    }
    return node.style;
  };

  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: '100vh' }}>
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
          onPaneClick={onPaneClick}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
        >
          {/* Добавляем MiniMap */}
          <MiniMap 
            nodeColor={(node) => node.type === 'function' ? 'blue' : 'green'} // Цвета для разных типов
            pannable={true} // Делаем миникарту перемещаемой
            position="bottom-left"
          />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};

export default GraphComponent;
