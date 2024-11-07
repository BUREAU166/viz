import React, { useState } from 'react';
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
  };

  const [info, setUserInfo] = useState<Info | null>(null);
  const [isControlPanelVisible, setControlPanelVisible] = useState(true); // Состояние для отображения панели

  // Функция для переключения видимости панели
  const toggleControlPanel = () => {
    setControlPanelVisible((prev) => !prev);
  };

  return (
    <LegexContext.Provider value={{ userInfo, setUserInfo }}>
      <div className="container">
        <div style={{ overflow: 'none', position: 'unset' }}>
          <HorizontalFlow />
        </div>

        {/* Кнопка для скрытия/показа панели, теперь она слева и большая */}
        <button
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',  // Сдвиг кнопки влево
            zIndex: 15,
            padding: '15px 30px',  // Увеличенный размер
            fontSize: '18px',  // Увеличенный шрифт
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',  // Добавлен эффект тени
            transition: 'all 0.3s ease', // Плавный переход
          }}
          onClick={toggleControlPanel}
        >
          {isControlPanelVisible ? 'Hide Control Panel' : 'Show Control Panel'}
        </button>

        {/* Условный рендеринг панели */}
        {isControlPanelVisible && <ControlPanel />}
      </div>
    </LegexContext.Provider>
  );
}
