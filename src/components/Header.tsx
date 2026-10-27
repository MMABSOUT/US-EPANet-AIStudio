import React, { useState } from 'react';
import {
  Waves,
  Play,
  RotateCcw,
  Download,
  Upload,
  FolderOpen,
  Plus,
  Map,
  BarChart3,
  Table2,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { EpanetProject, SimulationResults } from '../types/epanet';

interface HeaderProps {
  project: EpanetProject;
  results: SimulationResults | null;
  activeView: 'map' | 'reports' | 'tables';
  isSimulating: boolean;
  onViewChange: (view: 'map' | 'reports' | 'tables') => void;
  onRunSimulation: () => void;
  onNewProject: () => void;
  onLoadSample: (key: string) => void;
  onOpenInpModal: () => void;
  onOpenAboutModal: () => void;
  onUpdateTitle: (newTitle: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  results,
  activeView,
  isSimulating,
  onViewChange,
  onRunSimulation,
  onNewProject,
  onLoadSample,
  onOpenInpModal,
  onOpenAboutModal,
  onUpdateTitle,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(project.title);
  const [showSamplesMenu, setShowSamplesMenu] = useState(false);

  const handleTitleSubmit = () => {
    if (tempTitle.trim()) {
      onUpdateTitle(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold tracking-wider">
          <div className="p-1.5 bg-cyan-950/80 border border-cyan-500/40 rounded-lg shadow-sm">
            <Waves className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="text-base text-slate-100 font-semibold tracking-tight">EPANET</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-medium">WEB</span>
        </div>

        <div className="h-5 w-px bg-slate-800 mx-1" />

        {/* Project Title Editor */}
        {isEditingTitle ? (
          <input
            type="text"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            className="text-sm bg-slate-800 text-slate-100 px-2 py-1 rounded border border-cyan-500/50 outline-none w-64"
            autoFocus
          />
        ) : (
          <button
            onClick={() => {
              setTempTitle(project.title);
              setIsEditingTitle(true);
            }}
            title="Click to rename project"
            className="text-sm text-slate-300 hover:text-white font-medium max-w-[280px] truncate text-left px-2 py-1 rounded hover:bg-slate-800/60 transition-colors"
          >
            {project.title}
          </button>
        )}
      </div>

      {/* Main View Mode Tabs */}
      <div className="flex items-center bg-slate-950/80 p-1 rounded-lg border border-slate-800">
        <button
          onClick={() => onViewChange('map')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeView === 'map'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Network Map</span>
        </button>
        <button
          onClick={() => onViewChange('reports')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeView === 'reports'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Reports & Charts</span>
        </button>
        <button
          onClick={() => onViewChange('tables')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeView === 'tables'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Table2 className="w-3.5 h-3.5" />
          <span>Data Tables</span>
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        {/* Sample Networks Menu */}
        <div className="relative">
          <button
            onClick={() => setShowSamplesMenu(!showSamplesMenu)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sample Models</span>
          </button>
          {showSamplesMenu && (
            <div
              className="absolute right-0 mt-1.5 w-60 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs"
              onMouseLeave={() => setShowSamplesMenu(false)}
            >
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                EPA Benchmark Networks
              </div>
              <button
                onClick={() => {
                  onLoadSample('net1');
                  setShowSamplesMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex flex-col"
              >
                <span className="font-medium text-cyan-300">Net1 (Classic Benchmark)</span>
                <span className="text-[10px] text-slate-400">9 Junctions, 1 Reservoir, 1 Tank, 1 Pump</span>
              </button>
              <button
                onClick={() => {
                  onLoadSample('net2');
                  setShowSamplesMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex flex-col"
              >
                <span className="font-medium text-cyan-300">Net2 (Pressure-Zoned)</span>
                <span className="text-[10px] text-slate-400">Dual sources, PRV valve & storage</span>
              </button>
              <button
                onClick={() => {
                  onLoadSample('net3');
                  setShowSamplesMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex flex-col"
              >
                <span className="font-medium text-cyan-300">Net3 (Municipal Grid)</span>
                <span className="text-[10px] text-slate-400">2 Treatment Plants, 2 Storage Tanks</span>
              </button>
              <div className="border-t border-slate-800 my-1" />
              <button
                onClick={() => {
                  onNewProject();
                  setShowSamplesMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300 flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-slate-400" />
                <span>Blank Network</span>
              </button>
            </div>
          )}
        </div>

        {/* INP Import/Export Button */}
        <button
          onClick={onOpenInpModal}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          title="Import / Export standard EPANET .INP files"
        >
          <Upload className="w-3.5 h-3.5 text-emerald-400" />
          <span>INP File</span>
        </button>

        {/* Run Simulation Button */}
        <button
          onClick={onRunSimulation}
          disabled={isSimulating}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? 'animate-spin' : ''}`} />
          <span>{isSimulating ? 'Running...' : 'Run Simulation'}</span>
        </button>

        {/* Status Indicator */}
        {results ? (
          <div className="hidden xl:flex items-center space-x-1 text-xs text-emerald-400 px-2 py-1 rounded bg-emerald-950/40 border border-emerald-800/60">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Success</span>
          </div>
        ) : (
          <div className="hidden xl:flex items-center space-x-1 text-xs text-slate-400 px-2 py-1 rounded bg-slate-800/60 border border-slate-700">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Unsimulated</span>
          </div>
        )}

        <div className="h-5 w-px bg-slate-800 mx-1" />

        {/* About */}
        <button
          onClick={onOpenAboutModal}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="About EPANET Web"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
