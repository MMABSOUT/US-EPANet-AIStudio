import React from 'react';
import { EpanetProject, SimulationResults } from '../types/epanet';
import { Activity, Gauge, Network, Crosshair } from 'lucide-react';

interface StatusBarProps {
  project: EpanetProject;
  results: SimulationResults | null;
  cursorCoords: { x: number; y: number } | null;
  zoomLevel: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  project,
  results,
  cursorCoords,
  zoomLevel,
}) => {
  const totalNodes = project.junctions.length + project.reservoirs.length + project.tanks.length;
  const totalLinks = project.pipes.length + project.pumps.length + project.valves.length;

  return (
    <footer className="h-7 bg-slate-950 border-t border-slate-800 px-3 flex items-center justify-between text-[11px] text-slate-400 select-none z-20">
      {/* Left: Simulation & Model Specs */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            Units: <span className="text-slate-200 font-medium">{project.options.flowUnits}</span>
          </span>
          <span className="text-slate-600">|</span>
          <span>
            Headloss: <span className="text-slate-200 font-medium">{project.options.headlossFormula}</span>
          </span>
        </div>

        <div className="h-3 w-px bg-slate-800" />

        <div className="flex items-center space-x-1.5">
          <Network className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            Nodes: <span className="text-slate-200 font-medium">{totalNodes}</span> ({project.junctions.length} Junc, {project.reservoirs.length} Res, {project.tanks.length} Tank)
          </span>
          <span className="text-slate-600">|</span>
          <span>
            Links: <span className="text-slate-200 font-medium">{totalLinks}</span> ({project.pipes.length} Pipe, {project.pumps.length} Pump, {project.valves.length} Valve)
          </span>
        </div>
      </div>

      {/* Middle: Simulation Results Status */}
      <div className="flex items-center space-x-2">
        {results ? (
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Simulated: {project.options.durationHours}h EPS | Max Press: {results.maxPressureNode.value.toFixed(1)} PSI | Min Press: {results.minPressureNode.value.toFixed(1)} PSI
            </span>
          </div>
        ) : (
          <span className="text-slate-500 italic">No simulation results (click Run Simulation)</span>
        )}
      </div>

      {/* Right: Map Coordinates & Zoom */}
      <div className="flex items-center space-x-3">
        {cursorCoords && (
          <div className="flex items-center space-x-1 font-mono text-[10px] text-slate-300">
            <Crosshair className="w-3 h-3 text-slate-500" />
            <span>X: {cursorCoords.x.toFixed(0)}</span>
            <span className="text-slate-600">,</span>
            <span>Y: {cursorCoords.y.toFixed(0)}</span>
          </div>
        )}

        <div className="flex items-center space-x-1 font-mono text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
          <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
        </div>
      </div>
    </footer>
  );
};
