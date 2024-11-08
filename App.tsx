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

import HorizontalFlow from './src/components/HorizontalFlow';
import ControlPanel from './src/components/ControlPanel';
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

  // Функция для переключения видимости панели
  const toggleControlPanel = () => {
    setControlPanelVisible((prev) => !prev);
  };

  return (
    <LegexContext.Provider value={{ info, setUserInfo }}>
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
