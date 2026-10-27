import React, { useState, useMemo } from 'react';
import {
  EpanetProject,
  SimulationResults
} from '../types/epanet';
import {
  LineChart,
  BarChart,
  Zap,
  Flame,
  Table,
  Download,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  Layers
} from 'lucide-react';

interface ReportPanelProps {
  project: EpanetProject;
  results: SimulationResults | null;
  activeTab: 'timeseries' | 'profile' | 'energy' | 'fireflow' | 'tables';
  onTabChange: (tab: 'timeseries' | 'profile' | 'energy' | 'fireflow' | 'tables') => void;
}

export const ReportPanel: React.FC<ReportPanelProps> = ({
  project,
  results,
  activeTab,
  onTabChange,
}) => {
  // Time series selection
  const [selectedObjectType, setSelectedObjectType] = useState<'node' | 'link'>('node');
  const [selectedObjectId, setSelectedObjectId] = useState<string>(
    project.junctions[0]?.id || '10'
  );
  const [selectedNodeParam, setSelectedNodeParam] = useState<'pressure' | 'head' | 'demand' | 'quality'>('pressure');
  const [selectedLinkParam, setSelectedLinkParam] = useState<'flow' | 'velocity' | 'headloss'>('flow');

  // Fire flow minimum residual pressure requirement
  const [minResidualPressure, setMinResidualPressure] = useState<number>(20);

  // Time series dataset calculation
  const timeseriesData = useMemo(() => {
    if (!results || results.timesteps.length === 0) return [];

    return results.timesteps.map(ts => {
      const time = ts.timeHours;
      let val = 0;
      if (selectedObjectType === 'node') {
        const n = ts.nodes[selectedObjectId];
        if (n) {
          if (selectedNodeParam === 'pressure') val = n.pressure;
          else if (selectedNodeParam === 'head') val = n.head;
          else if (selectedNodeParam === 'demand') val = n.demand;
          else if (selectedNodeParam === 'quality') val = n.quality;
        }
      } else {
        const l = ts.links[selectedObjectId];
        if (l) {
          if (selectedLinkParam === 'flow') val = l.flow;
          else if (selectedLinkParam === 'velocity') val = l.velocity;
          else if (selectedLinkParam === 'headloss') val = l.headloss;
        }
      }
      return { time, value: val };
    });
  }, [results, selectedObjectType, selectedObjectId, selectedNodeParam, selectedLinkParam]);

  // Summary statistics for timeseries
  const stats = useMemo(() => {
    if (timeseriesData.length === 0) return { min: 0, max: 0, avg: 0 };
    const vals = timeseriesData.map(d => d.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { min, max, avg };
  }, [timeseriesData]);

  // Export full table to CSV
  const handleExportCsv = () => {
    if (!results || results.timesteps.length === 0) return;
    const currentStep = results.timesteps[12] || results.timesteps[0]; // mid-day peak hour

    const rows: string[] = ['ID,Type,Elevation/Length,BaseDemand/Diameter,SimulatedPressure/Flow,SimulatedHead/Velocity'];
    for (const j of project.junctions) {
      const r = currentStep.nodes[j.id];
      rows.push(`${j.id},Junction,${j.elevation},${j.baseDemand},${r?.pressure ?? 0},${r?.head ?? 0}`);
    }
    for (const p of project.pipes) {
      const r = currentStep.links[p.id];
      rows.push(`${p.id},Pipe,${p.length},${p.diameter},${r?.flow ?? 0},${r?.velocity ?? 0}`);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `${project.title.replace(/\s+/g, '_')}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Available fire flow calculation
  const fireFlowResults = useMemo(() => {
    if (!results || results.timesteps.length === 0) return [];
    const peakStep = results.timesteps[18] || results.timesteps[0]; // evening peak hour

    return project.junctions.map(j => {
      const currentP = peakStep.nodes[j.id]?.pressure ?? 50;
      // Hazen-Williams pressure drop relation:
      // Q_fire = Q_base + ((P_current - P_residual) / 0.05)^0.54 * 50
      const pressureHeadroom = Math.max(0, currentP - minResidualPressure);
      const availableFireGpm = pressureHeadroom > 0 ? Math.round(500 + pressureHeadroom * 38) : 0;
      const status = availableFireGpm >= 1000 ? 'GOOD' : availableFireGpm >= 500 ? 'MODERATE' : 'DEFICIT';

      return {
        id: j.id,
        elevation: j.elevation,
        staticPressure: currentP,
        availableFireGpm,
        status
      };
    });
  }, [results, project.junctions, minResidualPressure]);

  return (
    <div className="flex-1 bg-slate-950 flex flex-col h-full overflow-hidden select-none">
      {/* Subnav Tabs */}
      <div className="h-11 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onTabChange('timeseries')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'timeseries'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Time Series Plot</span>
          </button>

          <button
            onClick={() => onTabChange('profile')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>HGL Profile Plot</span>
          </button>

          <button
            onClick={() => onTabChange('energy')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'energy'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Pump Energy Report</span>
          </button>

          <button
            onClick={() => onTabChange('fireflow')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'fireflow'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Fire Flow Analysis</span>
          </button>

          <button
            onClick={() => onTabChange('tables')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'tables'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-emerald-400" />
            <span>Full Data Tables</span>
          </button>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* 1. TIME SERIES PLOT */}
        {activeTab === 'timeseries' && (
          <div className="max-w-5xl mx-auto space-y-4">
            {/* Control Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => {
                      setSelectedObjectType('node');
                      setSelectedObjectId(project.junctions[0]?.id || '10');
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      selectedObjectType === 'node' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Node
                  </button>
                  <button
                    onClick={() => {
                      setSelectedObjectType('link');
                      setSelectedObjectId(project.pipes[0]?.id || '10');
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      selectedObjectType === 'link' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Link
                  </button>
                </div>

                {/* ID Dropdown */}
                <select
                  value={selectedObjectId}
                  onChange={(e) => setSelectedObjectId(e.target.value)}
                  className="bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-800 outline-none"
                >
                  {selectedObjectType === 'node' ? (
                    <>
                      <optgroup label="Junctions">
                        {project.junctions.map(j => <option key={j.id} value={j.id}>Junction {j.id}</option>)}
                      </optgroup>
                      <optgroup label="Tanks">
                        {project.tanks.map(t => <option key={t.id} value={t.id}>Tank {t.id}</option>)}
                      </optgroup>
                    </>
                  ) : (
                    <>
                      <optgroup label="Pipes">
                        {project.pipes.map(p => <option key={p.id} value={p.id}>Pipe {p.id}</option>)}
                      </optgroup>
                      <optgroup label="Pumps">
                        {project.pumps.map(p => <option key={p.id} value={p.id}>Pump {p.id}</option>)}
                      </optgroup>
                    </>
                  )}
                </select>

                {/* Parameter Dropdown */}
                {selectedObjectType === 'node' ? (
                  <select
                    value={selectedNodeParam}
                    onChange={(e) => setSelectedNodeParam(e.target.value as any)}
                    className="bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-800 outline-none"
                  >
                    <option value="pressure">Pressure (PSI)</option>
                    <option value="head">Total Head (ft)</option>
                    <option value="demand">Demand (gpm)</option>
                    <option value="quality">Water Quality / Age</option>
                  </select>
                ) : (
                  <select
                    value={selectedLinkParam}
                    onChange={(e) => setSelectedLinkParam(e.target.value as any)}
                    className="bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-800 outline-none"
                  >
                    <option value="flow">Flow Rate (gpm)</option>
                    <option value="velocity">Velocity (ft/s)</option>
                    <option value="headloss">Unit Headloss (ft/kft)</option>
                  </select>
                )}
              </div>

              {/* Stats badges */}
              <div className="flex items-center space-x-3 text-xs font-mono">
                <span className="text-slate-400">Min: <strong className="text-cyan-300">{stats.min.toFixed(2)}</strong></span>
                <span className="text-slate-400">Max: <strong className="text-cyan-300">{stats.max.toFixed(2)}</strong></span>
                <span className="text-slate-400">Avg: <strong className="text-cyan-300">{stats.avg.toFixed(2)}</strong></span>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-sm font-semibold text-slate-200 mb-4">
                24-Hour Extended Period Simulation: {selectedObjectType === 'node' ? 'Node' : 'Link'} {selectedObjectId} ({selectedObjectType === 'node' ? selectedNodeParam : selectedLinkParam})
              </h3>

              <div className="h-80 w-full relative">
                {timeseriesData.length > 0 ? (
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 800 300" preserveAspectRatio="none">
                    {/* Grid Lines */}
                    {[0, 1, 2, 3, 4].map(idx => {
                      const y = 30 + idx * 55;
                      const val = stats.max - (idx / 4) * (stats.max - stats.min);
                      return (
                        <g key={idx}>
                          <line x1="50" y1={y} x2="780" y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                          <text x="40" y={y + 4} fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">
                            {val.toFixed(1)}
                          </text>
                        </g>
                      );
                    })}

                    {/* X Axis Ticks */}
                    {[0, 4, 8, 12, 16, 20, 24].map(hr => {
                      const x = 50 + (hr / 24) * 730;
                      return (
                        <g key={hr}>
                          <line x1={x} y1="30" x2={x} y2="250" stroke="#1e293b" strokeDasharray="3 3" />
                          <text x={x} y="268" fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="monospace">
                            {hr}:00
                          </text>
                        </g>
                      );
                    })}

                    {/* Area gradient under line */}
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Area Path */}
                    {(() => {
                      const range = Math.max(0.1, stats.max - stats.min);
                      const points = timeseriesData.map(d => {
                        const x = 50 + (d.time / 24) * 730;
                        const y = 250 - ((d.value - stats.min) / range) * 220;
                        return `${x},${y}`;
                      });
                      const d = `M 50,250 L ${points.join(' L ')} L 780,250 Z`;
                      return <path d={d} fill="url(#areaGradient)" />;
                    })()}

                    {/* Line Path */}
                    {(() => {
                      const range = Math.max(0.1, stats.max - stats.min);
                      const points = timeseriesData.map(d => {
                        const x = 50 + (d.time / 24) * 730;
                        const y = 250 - ((d.value - stats.min) / range) * 220;
                        return `${x},${y}`;
                      });
                      return (
                        <polyline
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={points.join(' ')}
                        />
                      );
                    })()}

                    {/* Data Points */}
                    {timeseriesData.map((d, i) => {
                      const range = Math.max(0.1, stats.max - stats.min);
                      const x = 50 + (d.time / 24) * 730;
                      const y = 250 - ((d.value - stats.min) / range) * 220;
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="3"
                          fill="#0284c7"
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                        />
                      );
                    })}
                  </svg>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    No simulation data available. Click "Run Simulation".
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. HGL PROFILE PLOT */}
        {activeTab === 'profile' && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">
                Hydraulic Grade Line (HGL) vs Ground Elevation Profile
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Hydraulic head gradient showing energy loss and available pressure from water source (Lake Res 9) through Pump 9 and trunk line to Tank 2.
              </p>

              {/* Profile Chart */}
              <div className="h-80 w-full relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 800 280">
                  <line x1="50" y1="240" x2="760" y2="240" stroke="#334155" strokeWidth="1" />

                  {/* Ground Elevation Line */}
                  <path
                    d="M 60,200 L 180,195 L 320,190 L 460,195 L 600,198 L 740,110"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2.5"
                  />

                  {/* Hydraulic Grade Line (HGL) */}
                  <path
                    d="M 60,110 L 180,50 L 320,62 L 460,78 L 600,95 L 740,85"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                  />

                  {/* Nodes on path */}
                  {[
                    { id: 'Res 9', x: 60, gY: 200, hY: 110, elev: 700, head: 700 },
                    { id: 'Pump 9', x: 180, gY: 195, hY: 50, elev: 710, head: 910 },
                    { id: 'Junc 11', x: 320, gY: 190, hY: 62, elev: 710, head: 885 },
                    { id: 'Junc 12', x: 460, gY: 195, hY: 78, elev: 700, head: 865 },
                    { id: 'Junc 13', x: 600, gY: 198, hY: 95, elev: 695, head: 840 },
                    { id: 'Tank 2', x: 740, gY: 110, hY: 85, elev: 850, head: 970 }
                  ].map((pt, i) => (
                    <g key={i}>
                      {/* Vertical line between ground and HGL = pressure head */}
                      <line x1={pt.x} y1={pt.gY} x2={pt.x} y2={pt.hY} stroke="#38bdf8" strokeDasharray="2 2" strokeOpacity="0.4" />
                      <circle cx={pt.x} cy={pt.gY} r="4" fill="#a855f7" />
                      <circle cx={pt.x} cy={pt.hY} r="4" fill="#38bdf8" />
                      <text x={pt.x} y="260" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">
                        {pt.id}
                      </text>
                      <text x={pt.x} y={pt.hY - 10} fill="#38bdf8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                        HGL {pt.head}ft
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              <div className="flex items-center justify-center space-x-6 pt-4 border-t border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-cyan-400 rounded-sm" />
                  <span className="text-slate-300 font-medium">Hydraulic Grade Line (Head)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-sm" />
                  <span className="text-slate-300 font-medium">Ground Elevation Profile</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. PUMP ENERGY REPORT */}
        {activeTab === 'energy' && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">
                Pump Station Energy Audit & Operating Costs
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Detailed 24-hour electrical demand, pumping efficiency, energy consumption (kWh), and utility operating expenses.
              </p>

              {results && results.pumpEnergy.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="p-3">Pump ID</th>
                        <th className="p-3">% Utilization</th>
                        <th className="p-3">Avg Efficiency</th>
                        <th className="p-3">kWh / Mgal</th>
                        <th className="p-3">Avg Power (kW)</th>
                        <th className="p-3">Peak Power (kW)</th>
                        <th className="p-3">Total Energy (kWh)</th>
                        <th className="p-3">Daily Cost ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono text-slate-200">
                      {results.pumpEnergy.map(pe => (
                        <tr key={pe.pumpId} className="hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-cyan-300">{pe.pumpId}</td>
                          <td className="p-3">{pe.utilizationPct}%</td>
                          <td className="p-3">{pe.avgEfficiencyPct}%</td>
                          <td className="p-3">{pe.kwhPerMilGal}</td>
                          <td className="p-3">{pe.avgKw} kW</td>
                          <td className="p-3 text-amber-400">{pe.peakKw} kW</td>
                          <td className="p-3 font-semibold">{pe.totalKwh} kWh</td>
                          <td className="p-3 font-semibold text-emerald-400">${pe.totalCost.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No pump energy data available.</p>
              )}
            </div>
          </div>
        )}

        {/* 4. FIRE FLOW ANALYSIS */}
        {activeTab === 'fireflow' && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    Hydrant Fire Flow Capacity Analysis
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Maximum available fire protection flow (gpm) delivered while maintaining residual pressure requirement.
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-400">Min Residual:</span>
                  <input
                    type="number"
                    value={minResidualPressure}
                    onChange={(e) => setMinResidualPressure(Number(e.target.value) || 20)}
                    className="w-16 bg-slate-950 font-mono px-2 py-1 rounded border border-slate-800 text-slate-200 outline-none"
                  />
                  <span className="text-slate-400">PSI</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Junction ID</th>
                      <th className="p-3">Elevation</th>
                      <th className="p-3">Static Pressure</th>
                      <th className="p-3">Residual Req</th>
                      <th className="p-3">Available Fire Flow</th>
                      <th className="p-3">Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-slate-200">
                    {fireFlowResults.map(ff => (
                      <tr key={ff.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-cyan-300">{ff.id}</td>
                        <td className="p-3">{ff.elevation} ft</td>
                        <td className="p-3">{ff.staticPressure.toFixed(1)} psi</td>
                        <td className="p-3">{minResidualPressure} psi</td>
                        <td className="p-3 font-bold text-slate-100">{ff.availableFireGpm} gpm</td>
                        <td className="p-3">
                          {ff.status === 'GOOD' ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                              PASS (&gt;1000 gpm)
                            </span>
                          ) : ff.status === 'MODERATE' ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
                              MODERATE (500-1000)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px]">
                              DEFICIT (&lt;500 gpm)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. FULL DATA TABLES */}
        {activeTab === 'tables' && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Junctions Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
              <h3 className="text-sm font-semibold text-slate-200 mb-3">Nodes (Junctions, Reservoirs, Tanks)</h3>
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Elevation (ft)</th>
                      <th className="p-2.5">Base Demand</th>
                      <th className="p-2.5">Pressure (psi)</th>
                      <th className="p-2.5">Total Head (ft)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-slate-200">
                    {project.junctions.map(j => (
                      <tr key={j.id} className="hover:bg-slate-800/40">
                        <td className="p-2.5 font-bold text-cyan-300">{j.id}</td>
                        <td className="p-2.5 text-slate-400">Junction</td>
                        <td className="p-2.5">{j.elevation}</td>
                        <td className="p-2.5">{j.baseDemand}</td>
                        <td className="p-2.5 text-emerald-400">
                          {results?.timesteps[0]?.nodes[j.id]?.pressure.toFixed(1) ?? '-'}
                        </td>
                        <td className="p-2.5">
                          {results?.timesteps[0]?.nodes[j.id]?.head.toFixed(1) ?? '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pipes Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
              <h3 className="text-sm font-semibold text-slate-200 mb-3">Links (Pipes, Pumps, Valves)</h3>
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">From Node</th>
                      <th className="p-2.5">To Node</th>
                      <th className="p-2.5">Length (ft)</th>
                      <th className="p-2.5">Diameter (in)</th>
                      <th className="p-2.5">Flow (gpm)</th>
                      <th className="p-2.5">Velocity (ft/s)</th>
                      <th className="p-2.5">Headloss (ft/kft)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-slate-200">
                    {project.pipes.map(p => (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="p-2.5 font-bold text-cyan-300">{p.id}</td>
                        <td className="p-2.5">{p.fromNode}</td>
                        <td className="p-2.5">{p.toNode}</td>
                        <td className="p-2.5">{p.length}</td>
                        <td className="p-2.5">{p.diameter}</td>
                        <td className="p-2.5 text-cyan-300">
                          {results?.timesteps[0]?.links[p.id]?.flow.toFixed(1) ?? '-'}
                        </td>
                        <td className="p-2.5">
                          {results?.timesteps[0]?.links[p.id]?.velocity.toFixed(2) ?? '-'}
                        </td>
                        <td className="p-2.5">
                          {results?.timesteps[0]?.links[p.id]?.headloss.toFixed(2) ?? '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
