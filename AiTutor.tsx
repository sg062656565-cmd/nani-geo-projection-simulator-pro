
import React from 'react';
import { MapSettings, ProjectionType, LightSourceType } from '../types';
import { PROJECTION_CONFIGS, ProjectionCategory, SurfaceType } from '../constants';

interface ControlsProps {
  settings: MapSettings;
  setSettings: React.Dispatch<React.SetStateAction<MapSettings>>;
}

const Controls: React.FC<ControlsProps> = ({ settings, setSettings }) => {
  const currentConfig = PROJECTION_CONFIGS[settings.projection];

  const handleProjectionChange = (proj: ProjectionType) => {
    const config = PROJECTION_CONFIGS[proj];
    setSettings(prev => ({
      ...prev,
      projection: proj,
      scale: config.defaultScale,
      rotate: config.defaultRotation
    }));
  };

  const groupedOptions = Object.values(ProjectionCategory).map(category => ({
    category,
    options: Object.entries(PROJECTION_CONFIGS)
      .filter(([_, config]) => config.category === category)
      .map(([key, _]) => key as ProjectionType)
  }));

  return (
    <div className="space-y-6 text-slate-200">
      <div className="space-y-4">
        <h3 className="font-bold text-cyan-400 text-xs uppercase tracking-wider border-b border-slate-700 pb-1">投影法選擇</h3>
        <div className="space-y-4">
          {groupedOptions.map((group) => (
            <div key={group.category} className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase pl-1 border-l-2 border-slate-600">
                {group.category}
              </h4>
              <div className="grid gap-1.5">
                {group.options.map((proj) => (
                  <button
                    key={proj}
                    onClick={() => handleProjectionChange(proj)}
                    className={`text-left px-3 py-2 rounded text-xs transition-all border ${
                      settings.projection === proj 
                        ? 'bg-blue-600/20 border-blue-500 text-blue-100 shadow-inner' 
                        : 'bg-slate-800/50 border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {proj.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-yellow-400 text-xs uppercase tracking-wider border-b border-slate-700 pb-1">3D 原理教學輔助</h3>
        
        <div className="bg-slate-800/50 p-3 rounded border border-slate-700 space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={settings.showProjectionSurface}
                onChange={(e) => setSettings(prev => ({ ...prev, showProjectionSurface: e.target.checked }))}
                className="w-4 h-4 text-yellow-500 rounded bg-slate-900 border-slate-700"
              />
              <span className="text-xs group-hover:text-yellow-400">顯示投影面 (Paper)</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={settings.showLightSource}
                onChange={(e) => setSettings(prev => ({ ...prev, showLightSource: e.target.checked }))}
                className="w-4 h-4 text-orange-500 rounded bg-slate-900 border-slate-700"
              />
              <span className="text-xs group-hover:text-orange-400">顯示光源與投射徑</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={settings.showTangent}
                onChange={(e) => setSettings(prev => ({ ...prev, showTangent: e.target.checked }))}
                className="w-4 h-4 text-cyan-500 rounded bg-slate-900 border-slate-700"
              />
              <span className="text-xs group-hover:text-cyan-400">顯示切線 / 標準緯線</span>
            </label>

            <div className="pt-2 mt-2 border-t border-slate-700 text-[10px] text-slate-400 italic">
                <p className="mb-1">💡 <span className="text-orange-300">投影邏輯：</span>{currentConfig.description.slice(0, 50)}...</p>
                <p>📍 <span className="text-cyan-300">零變形區：</span>{currentConfig.tangentDescription}</p>
            </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-emerald-400 text-xs uppercase tracking-wider border-b border-slate-700 pb-1">地圖屬性</h3>
        <div className="bg-slate-800/50 p-3 rounded border border-slate-700 space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={settings.showTissot}
              onChange={(e) => setSettings(prev => ({ ...prev, showTissot: e.target.checked }))}
              className="w-4 h-4 text-red-500 rounded bg-slate-900 border-slate-700"
            />
            <span className="text-xs group-hover:text-red-400">顯示變形圓 (Indicatrix)</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={settings.showCountryNames}
              onChange={(e) => setSettings(prev => ({ ...prev, showCountryNames: e.target.checked }))}
              className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700"
            />
            <span className="text-xs group-hover:text-emerald-400">顯示國家名稱 (Hover)</span>
          </label>
        </div>
      </div>
      
      <button 
          onClick={() => setSettings(prev => ({...prev, rotate: PROJECTION_CONFIGS[settings.projection].defaultRotation}))}
          className="w-full text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 py-2 rounded transition uppercase tracking-widest border border-slate-700"
      >
          Reset Camera
      </button>
    </div>
  );
};

export default Controls;
