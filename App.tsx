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

import HorizontalFlow from './src/components/HorizontalFlow'
import ControlPanel from './src/components/ControlPanel'
import { LegexContext } from './src/context/LegexContext'
import { Info } from './src/@types/info';

export function App() {
  const userInfo: Info = {
    funcName: "",
    dirName: "",
    funcPath: ""
  }

  const [info, setUserInfo] = useState<Info | null>(null)

  return (
    <LegexContext.Provider value={{ userInfo, setUserInfo }}>
      <div className='container'>
        <div style={{overflow: 'none', position: 'unset'}}>
          <HorizontalFlow />
        </div>
        <ControlPanel />
      </div>
    </LegexContext.Provider>
  )
}
