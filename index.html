
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Map2D from './components/Map2D';
import Globe3D from './components/Globe3D';
import Controls from './components/Controls';
import AiTutor from './components/AiTutor';
import { MapSettings, ProjectionType, LatLng } from './types';
import { PROJECTION_CONFIGS } from './constants';

const App: React.FC = () => {
  const [settings, setSettings] = useState<MapSettings>({
    projection: ProjectionType.MERCATOR,
    rotate: [0, 0, 0],
    scale: 150,
    showGraticule: true,
    showTissot: false,
    showCountries: true,
    showCountryNames: false, 
    showProjectionSurface: false,
    showLightSource: false,
    showTangent: false
  });

  const [hoverPos, setHoverPos] = useState<LatLng>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Professor AI 高度控制
  const [tutorHeight, setTutorHeight] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing && sidebarRef.current) {
        const sidebarRect = sidebarRef.current.getBoundingClientRect();
        const newHeight = sidebarRect.bottom - e.clientY;
        // 限制高度範圍
        if (newHeight > 150 && newHeight < sidebarRect.height * 0.7) {
            setTutorHeight(newHeight);
        }
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans select-none">
      
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`relative flex-shrink-0 bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? 'w-80' : 'w-0 border-none'
        }`}
        style={{ overflow: 'hidden' }} 
      >
        <div className="w-80 h-full flex flex-col overflow-hidden relative">
            {/* Sidebar Header - Fixed */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900 z-10">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="font-bold text-lg">教學儀表板</span>
                 </div>
                 <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>
            </div>

            {/* Top Section: Scrollable Controls */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-10">
                 <Controls settings={settings} setSettings={setSettings} />
            </div>
            
            {/* Resize Handle */}
            <div 
                onMouseDown={startResizing}
                className={`h-1 w-full bg-slate-800 hover:bg-cyan-500/50 cursor-ns-resize transition-colors z-30 flex items-center justify-center group ${isResizing ? 'bg-cyan-500' : ''}`}
            >
                <div className="w-10 h-0.5 bg-slate-600 group-hover:bg-cyan-300 rounded-full"></div>
            </div>

            {/* Bottom Section: Resizable AiTutor */}
            <div 
                style={{ height: `${tutorHeight}px` }}
                className="p-3 bg-slate-950/50 border-t border-slate-800 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.3)] relative"
            >
                <AiTutor currentProjection={settings.projection} />
            </div>
            
            {/* Footer - Fixed */}
            <div className="p-2 px-4 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between shrink-0 bg-slate-900">
                <span>Projection Pro v1.6</span>
                <span className="text-cyan-600 animate-pulse">Professor AI Ready</span>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative h-full">
        <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 h-14 flex items-center px-4 justify-between shrink-0 z-20">
           <div className="flex items-center gap-4">
              {!isSidebarOpen && (
                  <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
              )}
              <h1 className="text-md font-bold text-white">地理投影模擬器 <span className="text-cyan-400 text-xs font-normal">實時連動教學版</span></h1>
           </div>
        </header>

        <div className="flex-1 p-3 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden min-h-0">
            <div className="flex flex-col h-full bg-slate-900/30 rounded-xl p-1 border border-slate-800/50 relative">
                <div className="flex-1 relative rounded-lg overflow-hidden bg-slate-950">
                    <Map2D settings={settings} setSettings={setSettings} onHover={setHoverPos} hoverPos={hoverPos} />
                </div>
            </div>

            <div className="flex flex-col h-full bg-slate-900/30 rounded-xl p-1 border border-slate-800/50 relative">
                <div className="flex-1 relative rounded-lg overflow-hidden bg-slate-950">
                    <Globe3D settings={settings} hoverPos={hoverPos} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;
