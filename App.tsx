import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './index.css';

import HorizontalFlow, { exJson } from './src/components/HorizontalFlow';
import ControlPanel from './src/components/ControlPanel';
import dagre from '@dagrejs/dagre';
import { LegexContext } from './src/context/LegexContext';
import { Info } from './src/@types/info';

export function App() {
  const userInfo: Info = {
    funcName: "",
    dirName: "",
    funcPath: "",
    stdOut: ""
  }

  const [info, setUserInfo] = useState<Info>(userInfo);
  const [isControlPanelVisible, setControlPanelVisible] = useState(true); // Состояние для отображения панели

  const [graphJson, setGraphJson] = useState<string>(JSON.stringify(exJson))

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const position = { x: 0, y: 0 };
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  const edgeType = ConnectionLineType.SimpleBezier;
  const nodeWidth = 172;
  const nodeHeight = 36;

  const getLayoutedElements = (nodes, edges) => {
    dagreGraph.setGraph({
      rankdir: 'LR',
      nodesep: 50,
      edgesep: 200,
      ranksep: 50
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

  const getColor = (type: string) => {
    if(type == 'function') return { fontSize: "20px", padding: "20px", borderRadius: '15px', backgroundColor: 'lightgreen' }
    if(type == 'class') return { fontSize: "20px", padding: "20px", borderRadius: '15px', backgroundColor: 'lightblue' }
    return { backgroundColor: 'lightgray' }
  }

  const prepareGraph = (data) => {
    const initialNodes = data.vertices.map((vertex) => ({
      id: vertex.id,
      data: { label: vertex.name },
      position,
      group: vertex.group,
      style: getColor(vertex.type)
    }));

    const initialEdges = data.edges.map((edge) => ({
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
  }

  // Функция для переключения видимости панели
  const toggleControlPanel = () => {
    setControlPanelVisible((prev) => !prev);
  };

  return (
    <LegexContext.Provider value={{ info, setUserInfo, graphJson, setGraphJson, nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange, prepareGraph }}>
      <div className="container">
        <div style={{ overflow: 'none', position: 'unset' }}>
          <HorizontalFlow />
        </div>

        <button
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',  
            zIndex: 15,
            padding: '15px 30px',  
            fontSize: '18px',  
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',  
            transition: 'all 0.3s ease', 
          }}
          onClick={toggleControlPanel}
        >
          {isControlPanelVisible ? 'Hide Control Panel' : 'Show Control Panel'}
        </button>

        {isControlPanelVisible && <ControlPanel />}
      </div>
    </LegexContext.Provider>
  );
}
