import React from 'react';
import {
  EpanetProject,
  SelectedElement,
  TimestepResult
} from '../types/epanet';
import {
  X,
  Trash2,
  Activity,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

interface PropertyInspectorProps {
  project: EpanetProject;
  selectedElement: SelectedElement | null;
  activeTimestepResult: TimestepResult | null;
  onClose: () => void;
  onUpdateElement: (type: SelectedElement['type'], id: string, updates: any) => void;
  onDeleteElement: (el: SelectedElement) => void;
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  project,
  selectedElement,
  activeTimestepResult,
  onClose,
  onUpdateElement,
  onDeleteElement
}) => {
  if (!selectedElement) {
    return (
      <aside className="w-80 bg-slate-900 border-l border-slate-800 p-4 flex flex-col items-center justify-center text-center text-slate-500 select-none z-10 shrink-0">
        <Sliders className="w-10 h-10 mb-2 opacity-30 text-cyan-400" />
        <p className="text-xs font-medium text-slate-400">No Element Selected</p>
        <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
          Click on any node, pipe, pump, or valve on the network map to inspect and edit its properties.
        </p>
      </aside>
    );
  }

  const { type, id } = selectedElement;

  // Find element in project
  let element: any = null;
  if (type === 'junction') element = project.junctions.find(j => j.id === id);
  else if (type === 'reservoir') element = project.reservoirs.find(r => r.id === id);
  else if (type === 'tank') element = project.tanks.find(t => t.id === id);
  else if (type === 'pipe') element = project.pipes.find(p => p.id === id);
  else if (type === 'pump') element = project.pumps.find(p => p.id === id);
  else if (type === 'valve') element = project.valves.find(v => v.id === id);

  if (!element) return null;

  // Simulation outputs
  const nodeResult = activeTimestepResult?.nodes[id];
  const linkResult = activeTimestepResult?.links[id];

  const handleFieldChange = (field: string, value: any) => {
    onUpdateElement(type, id, { [field]: value });
  };

  return (
    <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full select-none z-10 shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
            {type} PROPERTIES
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-medium">
            {id}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Property Fields Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {/* Description Field */}
        <div>
          <label className="text-[11px] font-medium text-slate-400 block mb-1">Description / Tag</label>
          <input
            type="text"
            value={element.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Optional notes..."
            className="w-full bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded border border-slate-800 focus:border-cyan-500/50 outline-none"
          />
        </div>

        {/* JUNCTION FIELDS */}
        {type === 'junction' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Elevation (ft)</label>
                <input
                  type="number"
                  value={element.elevation}
                  onChange={(e) => handleFieldChange('elevation', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 text-slate-200 font-mono text-xs px-2.5 py-1.5 rounded border border-slate-800 focus:border-cyan-500/50 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Base Demand (gpm)</label>
                <input
                  type="number"
                  value={element.baseDemand}
                  onChange={(e) => handleFieldChange('baseDemand', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 text-slate-200 font-mono text-xs px-2.5 py-1.5 rounded border border-slate-800 focus:border-cyan-500/50 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Demand Pattern</label>
              <select
                value={element.demandPatternId || ''}
                onChange={(e) => handleFieldChange('demandPatternId', e.target.value)}
                className="w-full bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded border border-slate-800 focus:border-cyan-500/50 outline-none"
              >
                <option value="">None (Constant 1.0)</option>
                {project.patterns.map(p => (
                  <option key={p.id} value={p.id}>{p.id} ({p.description || 'Diurnal'})</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* RESERVOIR FIELDS */}
        {type === 'reservoir' && (
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Total Head (ft)</label>
            <input
              type="number"
              value={element.totalHead}
              onChange={(e) => handleFieldChange('totalHead', parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 text-slate-200 font-mono text-xs px-2.5 py-1.5 rounded border border-slate-800 focus:border-cyan-500/50 outline-none"
            />
          </div>
        )}

        {/* TANK FIELDS */}
        {type === 'tank' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Bottom Elev (ft)</label>
                <input
                  type="number"
                  value={element.elevation}
                  onChange={(e) => handleFieldChange('elevation', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 text-slate-200 font-mono text-xs px-2.5 py-1.5 rounded border border-slate-800 focus:border-cyan-500/50 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Diameter (ft)</label>
                <input
                  type="number"
                  value={element.diameter}
                  onChange={(e) => handleFieldChange('diameter', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 text-slate-200 font-mono text-xs px-2.5 py-1.5 rounded border border-slate-800 focus:border-cyan-500/50 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Initial Level</label>
                <input
                  type="number"
                  value={element.initLevel}
                  onChange={(e) => handleFieldChange('initLevel', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 text-slate-200 font-mono text-xs px-2 py-1.5 rounded border border-slate-800 focus:border-cyan-500/50 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Min Level</label>
                <input
                  type="number"
                  value={element.minLevel}
                  onChange={(e) => handleFieldChange('minLevel', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 text-slate-200 font-mono text-xs px-2 py-1.5 rounded border border-slate-800 focus:border-cyan-500/50 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Max Level</label>
                <input
                  type="number"
                  value={element.maxLevel}
                  onChange={(e) => handleFieldChange('maxLevel', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 text-slate-200 font-mono text-xs px-2 py-1.5 rounded border border-slate-800 focus:border-cyan-500/50 outline-none"
                />
              </div>
            </div>
          </>
        )}

        {/* PIPE FIELDS */}
        {type === 'pipe' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">From Node</label>
                <input
                  type="text"
                  value={element.fromNode}
                  disabled
                  className="w-full bg-slate-950 text-slate-400 font-mono text-xs px-2.5 py-1.5 rounded border border-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">To Node</label>
                <input
                  type="text"
                  value={element.toNode}
                  disabled
                  className="w-full bg-slate-950 text-slate-400 font-mono text-xs px-2.5 py-1.5 rounded border border-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Length (ft)</label>
                <input
                  type="number"
                  value={element.length}
                  onChange={(e) => handleFieldChange('length', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 text-slate-200 font-mono text-xs px-2.5 py-1.5 rounded border border-slate-800 focus:border-cyan-500/50 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Diameter (in)</label>
                <input
                  type="number"
                  value={element.diameter}
                  onChange={(e) => handleFieldChange('diameter', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 text-slate-200 font-mono text-xs px-2.5 py-1.5 rounded border border-slate-800 focus:border-cyan-500/50 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Roughness (C)</label>
                <input
                  type="number"
                  value={element.roughness}
                  onChange={(e) => handleFieldChange('roughness', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 text-slate-200 font-mono text-xs px-2.5 py-1.5 rounded border border-slate-800 focus:border-cyan-500/50 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Status</label>
                <select
                  value={element.status}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded border border-slate-800 focus:border-cyan-500/50 outline-none"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* PUMP FIELDS */}
        {type === 'pump' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Power (HP)</label>
                <input
                  type="number"
                  value={element.power || 75}
                  onChange={(e) => handleFieldChange('power', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 text-slate-200 font-mono text-xs px-2.5 py-1.5 rounded border border-slate-800 focus:border-cyan-500/50 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Status</label>
                <select
                  value={element.status}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded border border-slate-800 focus:border-cyan-500/50 outline-none"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* VALVES */}
        {type === 'valve' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Valve Type</label>
              <select
                value={element.valveType}
                onChange={(e) => handleFieldChange('valveType', e.target.value)}
                className="w-full bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded border border-slate-800 focus:border-cyan-500/50 outline-none"
              >
                <option value="PRV">PRV (Pressure Reducer)</option>
                <option value="PSV">PSV (Pressure Sustaining)</option>
                <option value="PBV">PBV (Pressure Breaker)</option>
                <option value="FCV">FCV (Flow Controller)</option>
                <option value="TCV">TCV (Throttle Control)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Setting (psi)</label>
              <input
                type="number"
                value={element.setting}
                onChange={(e) => handleFieldChange('setting', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 text-slate-200 font-mono text-xs px-2.5 py-1.5 rounded border border-slate-800 focus:border-cyan-500/50 outline-none"
              />
            </div>
          </div>
        )}

        {/* SIMULATION RESULTS CARD */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-cyan-300 mb-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulated Results (Current Hour)</span>
          </div>

          {nodeResult && (
            <div className="bg-slate-950/70 rounded-lg p-2.5 border border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Pressure:</span>
                <span className={`font-mono font-medium ${nodeResult.pressure < 25 ? 'text-amber-400' : 'text-slate-200'}`}>
                  {nodeResult.pressure.toFixed(1)} psi
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Head:</span>
                <span className="font-mono text-slate-200">{nodeResult.head.toFixed(1)} ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Actual Demand:</span>
                <span className="font-mono text-slate-200">{nodeResult.demand.toFixed(1)} gpm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Water Quality:</span>
                <span className="font-mono text-emerald-400">{nodeResult.quality.toFixed(2)}</span>
              </div>
              {nodeResult.waterLevel !== undefined && (
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Water Level:</span>
                  <span className="font-mono text-cyan-400 font-semibold">{nodeResult.waterLevel.toFixed(1)} ft</span>
                </div>
              )}
            </div>
          )}

          {linkResult && (
            <div className="bg-slate-950/70 rounded-lg p-2.5 border border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Flow Rate:</span>
                <span className="font-mono text-cyan-300 font-medium">{linkResult.flow.toFixed(1)} gpm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Velocity:</span>
                <span className={`font-mono ${linkResult.velocity > 7 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {linkResult.velocity.toFixed(2)} ft/s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Unit Headloss:</span>
                <span className="font-mono text-slate-200">{linkResult.headloss.toFixed(2)} ft/kft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className={`font-mono font-medium ${linkResult.status === 'OPEN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {linkResult.status}
                </span>
              </div>
            </div>
          )}

          {!nodeResult && !linkResult && (
            <div className="p-2.5 rounded bg-slate-950/40 border border-slate-800/40 text-[11px] text-slate-500 italic">
              Run simulation to see calculated pressure, flow, and velocity.
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between">
        <button
          onClick={() => onDeleteElement(selectedElement)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-red-950/60 hover:bg-red-900/80 text-red-300 text-xs font-medium border border-red-800/40 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Element</span>
        </button>

        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </aside>
  );
};
