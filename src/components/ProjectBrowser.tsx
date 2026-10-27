import React, { useState } from 'react';
import {
  EpanetProject,
  SelectedElement
} from '../types/epanet';
import {
  FolderTree,
  CircleDot,
  Waves,
  Cylinder,
  GitCommit,
  Cpu,
  SlidersHorizontal,
  TrendingUp,
  Sliders,
  ChevronDown,
  ChevronRight,
  Search,
  Plus
} from 'lucide-react';

interface ProjectBrowserProps {
  project: EpanetProject;
  selectedElement: SelectedElement | null;
  onSelectElement: (el: SelectedElement | null) => void;
  onAddElement: (category: 'junction' | 'reservoir' | 'tank' | 'pipe' | 'pump' | 'valve') => void;
}

export const ProjectBrowser: React.FC<ProjectBrowserProps> = ({
  project,
  selectedElement,
  onSelectElement,
  onAddElement,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    junctions: true,
    reservoirs: true,
    tanks: true,
    pipes: true,
    pumps: true,
    valves: true,
    patterns: false,
    curves: false
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const q = searchQuery.toLowerCase();

  const filteredJunctions = project.junctions.filter(j => j.id.toLowerCase().includes(q) || (j.description && j.description.toLowerCase().includes(q)));
  const filteredReservoirs = project.reservoirs.filter(r => r.id.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q)));
  const filteredTanks = project.tanks.filter(t => t.id.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)));
  const filteredPipes = project.pipes.filter(p => p.id.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
  const filteredPumps = project.pumps.filter(p => p.id.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
  const filteredValves = project.valves.filter(v => v.id.toLowerCase().includes(q) || (v.description && v.description.toLowerCase().includes(q)));

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none z-10 shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-slate-200 font-semibold text-xs tracking-wide">
          <FolderTree className="w-4 h-4 text-cyan-400" />
          <span>PROJECT BROWSER</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {project.junctions.length + project.pipes.length} Objects
        </span>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-slate-800">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-slate-200 placeholder-slate-500 text-xs pl-8 pr-2.5 py-1.5 rounded-md border border-slate-800 focus:border-cyan-500/50 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Categories Accordion */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* JUNCTIONS */}
        <div className="rounded-md overflow-hidden bg-slate-950/40 border border-slate-800/60">
          <div
            onClick={() => toggleSection('junctions')}
            className="flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-300 hover:text-white cursor-pointer hover:bg-slate-800/50"
          >
            <div className="flex items-center space-x-2">
              {expandedSections.junctions ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              <CircleDot className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium">Junctions</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-[10px] text-slate-400 font-mono">{filteredJunctions.length}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onAddElement('junction'); }}
                title="Add Junction"
                className="p-0.5 hover:text-emerald-400"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          {expandedSections.junctions && (
            <div className="py-1 px-1.5 space-y-0.5 border-t border-slate-800/60 max-h-40 overflow-y-auto">
              {filteredJunctions.map(j => (
                <div
                  key={j.id}
                  onClick={() => onSelectElement({ type: 'junction', id: j.id })}
                  className={`px-2 py-1 rounded text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    selectedElement?.type === 'junction' && selectedElement.id === j.id
                      ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span className="font-mono">{j.id}</span>
                  <span className="text-[10px] text-slate-500">{j.elevation} ft</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RESERVOIRS */}
        <div className="rounded-md overflow-hidden bg-slate-950/40 border border-slate-800/60">
          <div
            onClick={() => toggleSection('reservoirs')}
            className="flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-300 hover:text-white cursor-pointer hover:bg-slate-800/50"
          >
            <div className="flex items-center space-x-2">
              {expandedSections.reservoirs ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              <Waves className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-medium">Reservoirs</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-[10px] text-slate-400 font-mono">{filteredReservoirs.length}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onAddElement('reservoir'); }}
                title="Add Reservoir"
                className="p-0.5 hover:text-blue-400"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          {expandedSections.reservoirs && (
            <div className="py-1 px-1.5 space-y-0.5 border-t border-slate-800/60">
              {filteredReservoirs.map(r => (
                <div
                  key={r.id}
                  onClick={() => onSelectElement({ type: 'reservoir', id: r.id })}
                  className={`px-2 py-1 rounded text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    selectedElement?.type === 'reservoir' && selectedElement.id === r.id
                      ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span className="font-mono">{r.id}</span>
                  <span className="text-[10px] text-slate-500">Head: {r.totalHead} ft</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TANKS */}
        <div className="rounded-md overflow-hidden bg-slate-950/40 border border-slate-800/60">
          <div
            onClick={() => toggleSection('tanks')}
            className="flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-300 hover:text-white cursor-pointer hover:bg-slate-800/50"
          >
            <div className="flex items-center space-x-2">
              {expandedSections.tanks ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              <Cylinder className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium">Storage Tanks</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-[10px] text-slate-400 font-mono">{filteredTanks.length}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onAddElement('tank'); }}
                title="Add Tank"
                className="p-0.5 hover:text-amber-400"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          {expandedSections.tanks && (
            <div className="py-1 px-1.5 space-y-0.5 border-t border-slate-800/60">
              {filteredTanks.map(t => (
                <div
                  key={t.id}
                  onClick={() => onSelectElement({ type: 'tank', id: t.id })}
                  className={`px-2 py-1 rounded text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    selectedElement?.type === 'tank' && selectedElement.id === t.id
                      ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span className="font-mono">{t.id}</span>
                  <span className="text-[10px] text-slate-500">Init: {t.initLevel} ft</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PIPES */}
        <div className="rounded-md overflow-hidden bg-slate-950/40 border border-slate-800/60">
          <div
            onClick={() => toggleSection('pipes')}
            className="flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-300 hover:text-white cursor-pointer hover:bg-slate-800/50"
          >
            <div className="flex items-center space-x-2">
              {expandedSections.pipes ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-medium">Pipes</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-[10px] text-slate-400 font-mono">{filteredPipes.length}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onAddElement('pipe'); }}
                title="Add Pipe"
                className="p-0.5 hover:text-cyan-400"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          {expandedSections.pipes && (
            <div className="py-1 px-1.5 space-y-0.5 border-t border-slate-800/60 max-h-40 overflow-y-auto">
              {filteredPipes.map(p => (
                <div
                  key={p.id}
                  onClick={() => onSelectElement({ type: 'pipe', id: p.id })}
                  className={`px-2 py-1 rounded text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    selectedElement?.type === 'pipe' && selectedElement.id === p.id
                      ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span className="font-mono">{p.id}</span>
                  <span className="text-[10px] text-slate-500">Ø {p.diameter}"</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PUMPS */}
        <div className="rounded-md overflow-hidden bg-slate-950/40 border border-slate-800/60">
          <div
            onClick={() => toggleSection('pumps')}
            className="flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-300 hover:text-white cursor-pointer hover:bg-slate-800/50"
          >
            <div className="flex items-center space-x-2">
              {expandedSections.pumps ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              <Cpu className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-medium">Pumps</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-[10px] text-slate-400 font-mono">{filteredPumps.length}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onAddElement('pump'); }}
                title="Add Pump"
                className="p-0.5 hover:text-rose-400"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          {expandedSections.pumps && (
            <div className="py-1 px-1.5 space-y-0.5 border-t border-slate-800/60">
              {filteredPumps.map(p => (
                <div
                  key={p.id}
                  onClick={() => onSelectElement({ type: 'pump', id: p.id })}
                  className={`px-2 py-1 rounded text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    selectedElement?.type === 'pump' && selectedElement.id === p.id
                      ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span className="font-mono">{p.id}</span>
                  <span className="text-[10px] text-slate-500">{p.power || 75} HP</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* VALVES */}
        <div className="rounded-md overflow-hidden bg-slate-950/40 border border-slate-800/60">
          <div
            onClick={() => toggleSection('valves')}
            className="flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-300 hover:text-white cursor-pointer hover:bg-slate-800/50"
          >
            <div className="flex items-center space-x-2">
              {expandedSections.valves ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-medium">Control Valves</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-[10px] text-slate-400 font-mono">{filteredValves.length}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onAddElement('valve'); }}
                title="Add Valve"
                className="p-0.5 hover:text-purple-400"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          {expandedSections.valves && (
            <div className="py-1 px-1.5 space-y-0.5 border-t border-slate-800/60">
              {filteredValves.map(v => (
                <div
                  key={v.id}
                  onClick={() => onSelectElement({ type: 'valve', id: v.id })}
                  className={`px-2 py-1 rounded text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    selectedElement?.type === 'valve' && selectedElement.id === v.id
                      ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span className="font-mono">{v.id}</span>
                  <span className="text-[10px] text-slate-500">{v.valveType}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PATTERNS & CURVES */}
        <div className="rounded-md overflow-hidden bg-slate-950/40 border border-slate-800/60">
          <div
            onClick={() => toggleSection('patterns')}
            className="flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-300 hover:text-white cursor-pointer hover:bg-slate-800/50"
          >
            <div className="flex items-center space-x-2">
              {expandedSections.patterns ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium">Demand Patterns</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{project.patterns.length}</span>
          </div>
          {expandedSections.patterns && (
            <div className="py-1 px-1.5 space-y-0.5 border-t border-slate-800/60">
              {project.patterns.map(pat => (
                <div key={pat.id} className="px-2 py-1 rounded text-xs text-slate-400 flex items-center justify-between">
                  <span className="font-mono">{pat.id}</span>
                  <span className="text-[10px] text-slate-500">24 multipliers</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
