import React from 'react';
import {
  MousePointer,
  Hand,
  CircleDot,
  Waves,
  Cylinder,
  GitCommit,
  Cpu,
  SlidersHorizontal,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  ArrowRight,
  Tag,
  Palette
} from 'lucide-react';
import { ToolMode, NodeTheme, LinkTheme } from '../types/epanet';

interface MapViewerToolbarProps {
  toolMode: ToolMode;
  onSetToolMode: (mode: ToolMode) => void;
  nodeTheme: NodeTheme;
  onSetNodeTheme: (theme: NodeTheme) => void;
  linkTheme: LinkTheme;
  onSetLinkTheme: (theme: LinkTheme) => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  showValues: boolean;
  onToggleValues: () => void;
  showArrows: boolean;
  onToggleArrows: () => void;
  basemap: 'dark' | 'light' | 'grid' | 'none';
  onSetBasemap: (bm: 'dark' | 'light' | 'grid' | 'none') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitExtent: () => void;
  hasResults: boolean;
  legendRange: {
    nodeMin: number;
    nodeMax: number;
    nodeUnit: string;
    linkMin: number;
    linkMax: number;
    linkUnit: string;
  };
}

export const MapViewerToolbar: React.FC<MapViewerToolbarProps> = ({
  toolMode,
  onSetToolMode,
  nodeTheme,
  onSetNodeTheme,
  linkTheme,
  onSetLinkTheme,
  showLabels,
  onToggleLabels,
  showValues,
  onToggleValues,
  showArrows,
  onToggleArrows,
  basemap,
  onSetBasemap,
  onZoomIn,
  onZoomOut,
  onFitExtent,
  hasResults,
  legendRange
}) => {
  return (
    <div className="absolute top-3 left-3 flex flex-col space-y-2 z-20 pointer-events-auto">
      {/* Primary Tool Mode Ribbon */}
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-lg p-1 shadow-xl flex items-center space-x-1">
        <button
          onClick={() => onSetToolMode('select')}
          title="Select / Move Elements (V)"
          className={`p-2 rounded-md transition-all ${
            toolMode === 'select'
              ? 'bg-cyan-500 text-slate-950 font-semibold shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <MousePointer className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSetToolMode('pan')}
          title="Pan Map (H)"
          className={`p-2 rounded-md transition-all ${
            toolMode === 'pan'
              ? 'bg-cyan-500 text-slate-950 font-semibold shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Hand className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-0.5" />

        {/* Add Nodes */}
        <button
          onClick={() => onSetToolMode('add_junction')}
          title="Add Junction (Click on map to place)"
          className={`p-2 rounded-md transition-all ${
            toolMode === 'add_junction'
              ? 'bg-emerald-500 text-slate-950 font-semibold shadow'
              : 'text-slate-300 hover:text-emerald-400 hover:bg-slate-800'
          }`}
        >
          <CircleDot className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSetToolMode('add_reservoir')}
          title="Add Reservoir (Water Source)"
          className={`p-2 rounded-md transition-all ${
            toolMode === 'add_reservoir'
              ? 'bg-blue-500 text-slate-950 font-semibold shadow'
              : 'text-slate-300 hover:text-blue-400 hover:bg-slate-800'
          }`}
        >
          <Waves className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSetToolMode('add_tank')}
          title="Add Elevated Storage Tank"
          className={`p-2 rounded-md transition-all ${
            toolMode === 'add_tank'
              ? 'bg-amber-500 text-slate-950 font-semibold shadow'
              : 'text-slate-300 hover:text-amber-400 hover:bg-slate-800'
          }`}
        >
          <Cylinder className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-0.5" />

        {/* Add Links */}
        <button
          onClick={() => onSetToolMode('add_pipe')}
          title="Add Pipe (Click start node, then click end node)"
          className={`p-2 rounded-md transition-all ${
            toolMode === 'add_pipe'
              ? 'bg-cyan-500 text-slate-950 font-semibold shadow'
              : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800'
          }`}
        >
          <GitCommit className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSetToolMode('add_pump')}
          title="Add Booster Pump (Click start node, then end node)"
          className={`p-2 rounded-md transition-all ${
            toolMode === 'add_pump'
              ? 'bg-rose-500 text-slate-950 font-semibold shadow'
              : 'text-slate-300 hover:text-rose-400 hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSetToolMode('add_valve')}
          title="Add Control Valve (PRV/PSV/FCV)"
          className={`p-2 rounded-md transition-all ${
            toolMode === 'add_valve'
              ? 'bg-purple-500 text-slate-950 font-semibold shadow'
              : 'text-slate-300 hover:text-purple-400 hover:bg-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-0.5" />

        <button
          onClick={() => onSetToolMode('delete')}
          title="Delete Element (Click element to remove)"
          className={`p-2 rounded-md transition-all ${
            toolMode === 'delete'
              ? 'bg-red-500 text-white font-semibold shadow'
              : 'text-slate-300 hover:text-red-400 hover:bg-slate-800'
          }`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Thematic & Display Control Palette */}
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 shadow-xl flex flex-col space-y-2.5 w-72">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200">
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            <span>Thematic Layers</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {hasResults ? 'SIMULATED' : 'GEOMETRIC'}
          </span>
        </div>

        {/* Node Theme Dropdown */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Node Theme:</span>
          <select
            value={nodeTheme}
            onChange={(e) => onSetNodeTheme(e.target.value as NodeTheme)}
            className="bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded border border-slate-700 outline-none hover:border-cyan-500 transition-colors cursor-pointer w-40"
          >
            <option value="pressure">Pressure (PSI)</option>
            <option value="head">Total Head (ft)</option>
            <option value="baseDemand">Base Demand</option>
            <option value="elevation">Elevation (ft)</option>
            <option value="quality">Water Quality / Age</option>
          </select>
        </div>

        {/* Node Theme Legend Scale */}
        <div className="flex flex-col space-y-1">
          <div className="h-2 rounded-full w-full bg-gradient-to-r from-blue-600 via-cyan-400 via-emerald-400 via-amber-400 to-rose-600 shadow-inner" />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>{legendRange.nodeMin.toFixed(1)}</span>
            <span className="text-slate-500">{legendRange.nodeUnit}</span>
            <span>{legendRange.nodeMax.toFixed(1)}</span>
          </div>
        </div>

        {/* Link Theme Dropdown */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
          <span className="text-slate-400 font-medium">Link Theme:</span>
          <select
            value={linkTheme}
            onChange={(e) => onSetLinkTheme(e.target.value as LinkTheme)}
            className="bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded border border-slate-700 outline-none hover:border-cyan-500 transition-colors cursor-pointer w-40"
          >
            <option value="flow">Flow Rate (GPM)</option>
            <option value="velocity">Velocity (ft/s)</option>
            <option value="diameter">Diameter (in)</option>
            <option value="headloss">Unit Headloss (ft/kft)</option>
            <option value="length">Length (ft)</option>
          </select>
        </div>

        {/* Link Theme Legend Scale */}
        <div className="flex flex-col space-y-1">
          <div className="h-2 rounded-full w-full bg-gradient-to-r from-slate-600 via-cyan-500 to-blue-400 shadow-inner" />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>{legendRange.linkMin.toFixed(1)}</span>
            <span className="text-slate-500">{legendRange.linkUnit}</span>
            <span>{legendRange.linkMax.toFixed(1)}</span>
          </div>
        </div>

        {/* Map Visibility Toggles */}
        <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-800/80">
          <button
            onClick={onToggleLabels}
            title="Toggle Node & Link ID Labels"
            className={`flex items-center justify-center space-x-1 py-1 rounded text-[11px] font-medium transition-colors ${
              showLabels
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-3 h-3" />
            <span>IDs</span>
          </button>

          <button
            onClick={onToggleValues}
            title="Toggle Simulated Values on Map"
            className={`flex items-center justify-center space-x-1 py-1 rounded text-[11px] font-medium transition-colors ${
              showValues
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Values</span>
          </button>

          <button
            onClick={onToggleArrows}
            title="Toggle Flow Direction Arrows"
            className={`flex items-center justify-center space-x-1 py-1 rounded text-[11px] font-medium transition-colors ${
              showArrows
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRight className="w-3 h-3" />
            <span>Arrows</span>
          </button>
        </div>

        {/* Basemap & Zoom Controls */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
          <div className="flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={basemap}
              onChange={(e) => onSetBasemap(e.target.value as any)}
              className="bg-slate-800 text-slate-300 text-[11px] px-1.5 py-0.5 rounded border border-slate-700 outline-none cursor-pointer"
            >
              <option value="grid">Grid (Engineering)</option>
              <option value="dark">Dark Carto</option>
              <option value="light">Light OSM</option>
              <option value="none">None</option>
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={onZoomIn}
              title="Zoom In (+)"
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onZoomOut}
              title="Zoom Out (-)"
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onFitExtent}
              title="Fit Full Network Extent"
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
