import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  EpanetProject,
  SimulationResults,
  SelectedElement,
  ToolMode,
  NodeTheme,
  LinkTheme
} from './types/epanet';
import { sampleNetworks, net1Project } from './data/sampleNetworks';
import { runSimulation } from './engine/epanetSolver';
import { Header } from './components/Header';
import { StatusBar } from './components/StatusBar';
import { MapViewerToolbar } from './components/MapViewerToolbar';
import { TimeSlider } from './components/TimeSlider';
import { MapCanvas } from './components/MapCanvas';
import { ProjectBrowser } from './components/ProjectBrowser';
import { PropertyInspector } from './components/PropertyInspector';
import { ReportPanel } from './components/ReportPanel';
import { InpModal } from './components/InpModal';
import { AboutModal } from './components/AboutModal';

export const App: React.FC = () => {
  // Current project
  const [project, setProject] = useState<EpanetProject>(() => JSON.parse(JSON.stringify(net1Project)));

  // Simulation results
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Active view: 'map' | 'reports' | 'tables'
  const [activeView, setActiveView] = useState<'map' | 'reports' | 'tables'>('map');
  const [reportTab, setReportTab] = useState<'timeseries' | 'profile' | 'energy' | 'fireflow' | 'tables'>('timeseries');

  // Interactive tool mode
  const [toolMode, setToolMode] = useState<ToolMode>('select');

  // Thematic layers
  const [nodeTheme, setNodeTheme] = useState<NodeTheme>('pressure');
  const [linkTheme, setLinkTheme] = useState<LinkTheme>('flow');

  // Display toggles
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showValues, setShowValues] = useState<boolean>(true);
  const [showArrows, setShowArrows] = useState<boolean>(true);
  const [basemap, setBasemap] = useState<'dark' | 'light' | 'grid' | 'none'>('grid');

  // Extended period simulation (EPS) playback
  const [currentTimeHours, setCurrentTimeHours] = useState<number>(12); // start at midday peak
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Selected element for inspection
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>({
    type: 'junction',
    id: '12'
  });

  // Map viewport & cursor
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number } | null>(null);
  const [fitExtentTrigger, setFitExtentTrigger] = useState<number>(0);

  // Modals
  const [isInpModalOpen, setIsInpModalOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);

  // Trigger hydraulic simulation
  const handleRunSimulation = useCallback((projToSim: EpanetProject = project) => {
    setIsSimulating(true);
    setTimeout(() => {
      try {
        const res = runSimulation(projToSim);
        setResults(res);
      } catch (err) {
        console.error('Simulation error:', err);
      } finally {
        setIsSimulating(false);
      }
    }, 150);
  }, [project]);

  // Run simulation initially on load
  useEffect(() => {
    handleRunSimulation(net1Project);
    setFitExtentTrigger(Date.now());
  }, []);

  // Active timestep result
  const activeTimestepResult = useMemo(() => {
    if (!results || results.timesteps.length === 0) return null;
    const hour = Math.min(currentTimeHours, results.timesteps.length - 1);
    return results.timesteps[hour] || results.timesteps[0];
  }, [results, currentTimeHours]);

  // Total system demand at active timestep
  const totalSystemDemand = useMemo(() => {
    if (!activeTimestepResult) return 0;
    let sum = 0;
    for (const j of project.junctions) {
      sum += activeTimestepResult.nodes[j.id]?.demand ?? 0;
    }
    return sum;
  }, [activeTimestepResult, project.junctions]);

  // Legend Min & Max ranges for active themes
  const legendRange = useMemo(() => {
    let nodeMin = 0, nodeMax = 100, nodeUnit = 'PSI';
    let linkMin = 0, linkMax = 1000, linkUnit = 'gpm';

    if (nodeTheme === 'pressure') {
      nodeMin = results ? results.minPressureNode.value : 20;
      nodeMax = results ? results.maxPressureNode.value : 100;
      nodeUnit = 'PSI';
    } else if (nodeTheme === 'elevation') {
      const elevs = project.junctions.map(j => j.elevation);
      nodeMin = Math.min(...elevs, 600);
      nodeMax = Math.max(...elevs, 850);
      nodeUnit = 'ft';
    } else if (nodeTheme === 'head') {
      nodeMin = 700;
      nodeMax = 950;
      nodeUnit = 'ft';
    } else if (nodeTheme === 'quality') {
      nodeMin = 0;
      nodeMax = 1.0;
      nodeUnit = 'mg/L';
    }

    if (linkTheme === 'flow') {
      linkMin = 0;
      linkMax = 1500;
      linkUnit = 'gpm';
    } else if (linkTheme === 'velocity') {
      linkMin = 0;
      linkMax = results ? Math.max(8, results.maxVelocityLink.value) : 8;
      linkUnit = 'ft/s';
    } else if (linkTheme === 'diameter') {
      const diams = project.pipes.map(p => p.diameter);
      linkMin = Math.min(...diams, 8);
      linkMax = Math.max(...diams, 24);
      linkUnit = 'in';
    }

    return { nodeMin, nodeMax, nodeUnit, linkMin, linkMax, linkUnit };
  }, [nodeTheme, linkTheme, results, project]);

  // Load sample model
  const handleLoadSample = (key: string) => {
    const sample = sampleNetworks[key];
    if (!sample) return;
    const cloned = JSON.parse(JSON.stringify(sample));
    setProject(cloned);
    setSelectedElement(null);
    handleRunSimulation(cloned);
    setTimeout(() => setFitExtentTrigger(Date.now()), 100);
  };

  // Blank project
  const handleNewProject = () => {
    const blank: EpanetProject = {
      title: 'New Water Network',
      junctions: [
        { id: 'J-1', x: 300, y: 500, elevation: 100, baseDemand: 100 },
        { id: 'J-2', x: 600, y: 500, elevation: 95, baseDemand: 150 }
      ],
      reservoirs: [
        { id: 'R-1', x: 100, y: 500, totalHead: 200 }
      ],
      tanks: [],
      pipes: [
        { id: 'P-1', fromNode: 'R-1', toNode: 'J-1', length: 2000, diameter: 12, roughness: 100, minorLoss: 0, status: 'OPEN' },
        { id: 'P-2', fromNode: 'J-1', toNode: 'J-2', length: 3000, diameter: 10, roughness: 100, minorLoss: 0, status: 'OPEN' }
      ],
      pumps: [],
      valves: [],
      patterns: [{ id: '1', multipliers: [1.0] }],
      curves: [],
      controls: [],
      options: {
        flowUnits: 'GPM',
        headlossFormula: 'H-W',
        specificGravity: 1.0,
        relativeViscosity: 1.0,
        durationHours: 24,
        hydraulicTimestepHours: 1,
        qualityType: 'NONE'
      }
    };
    setProject(blank);
    setSelectedElement(null);
    handleRunSimulation(blank);
    setTimeout(() => setFitExtentTrigger(Date.now()), 100);
  };

  // Import INP
  const handleImportProject = (imported: EpanetProject) => {
    setProject(imported);
    setSelectedElement(null);
    handleRunSimulation(imported);
    setTimeout(() => setFitExtentTrigger(Date.now()), 100);
  };

  // Add Element on canvas
  const handleAddJunction = (coords: { x: number; y: number }) => {
    const id = `J-${project.junctions.length + 1}`;
    const newJunc = {
      id,
      x: coords.x,
      y: coords.y,
      elevation: 700,
      baseDemand: 100,
      demandPatternId: project.patterns[0]?.id
    };
    const updated = { ...project, junctions: [...project.junctions, newJunc] };
    setProject(updated);
    setSelectedElement({ type: 'junction', id });
    handleRunSimulation(updated);
  };

  const handleAddReservoir = (coords: { x: number; y: number }) => {
    const id = `R-${project.reservoirs.length + 1}`;
    const newRes = {
      id,
      x: coords.x,
      y: coords.y,
      totalHead: 750
    };
    const updated = { ...project, reservoirs: [...project.reservoirs, newRes] };
    setProject(updated);
    setSelectedElement({ type: 'reservoir', id });
    handleRunSimulation(updated);
  };

  const handleAddTank = (coords: { x: number; y: number }) => {
    const id = `T-${project.tanks.length + 1}`;
    const newTank = {
      id,
      x: coords.x,
      y: coords.y,
      elevation: 800,
      initLevel: 100,
      minLevel: 80,
      maxLevel: 140,
      diameter: 50
    };
    const updated = { ...project, tanks: [...project.tanks, newTank] };
    setProject(updated);
    setSelectedElement({ type: 'tank', id });
    handleRunSimulation(updated);
  };

  const handleAddLink = (type: 'pipe' | 'pump' | 'valve', fromNode: string, toNode: string) => {
    if (type === 'pipe') {
      const id = `P-${project.pipes.length + 1}`;
      const newPipe = {
        id,
        fromNode,
        toNode,
        length: 2500,
        diameter: 12,
        roughness: 100,
        minorLoss: 0,
        status: 'OPEN' as const
      };
      const updated = { ...project, pipes: [...project.pipes, newPipe] };
      setProject(updated);
      setSelectedElement({ type: 'pipe', id });
      handleRunSimulation(updated);
    } else if (type === 'pump') {
      const id = `PUMP-${project.pumps.length + 1}`;
      const newPump = {
        id,
        fromNode,
        toNode,
        power: 75,
        speed: 1.0,
        status: 'OPEN' as const
      };
      const updated = { ...project, pumps: [...project.pumps, newPump] };
      setProject(updated);
      setSelectedElement({ type: 'pump', id });
      handleRunSimulation(updated);
    } else if (type === 'valve') {
      const id = `V-${project.valves.length + 1}`;
      const newValve = {
        id,
        fromNode,
        toNode,
        diameter: 12,
        valveType: 'PRV' as const,
        setting: 50,
        minorLoss: 0.5,
        status: 'OPEN' as const
      };
      const updated = { ...project, valves: [...project.valves, newValve] };
      setProject(updated);
      setSelectedElement({ type: 'valve', id });
      handleRunSimulation(updated);
    }
  };

  // Move node position
  const handleUpdateCoordinates = (id: string, x: number, y: number) => {
    setProject(prev => {
      const junctions = prev.junctions.map(j => j.id === id ? { ...j, x, y } : j);
      const reservoirs = prev.reservoirs.map(r => r.id === id ? { ...r, x, y } : r);
      const tanks = prev.tanks.map(t => t.id === id ? { ...t, x, y } : t);
      return { ...prev, junctions, reservoirs, tanks };
    });
  };

  // Update properties from inspector
  const handleUpdateElement = (type: SelectedElement['type'], id: string, updates: any) => {
    setProject(prev => {
      let updated = { ...prev };
      if (type === 'junction') {
        updated.junctions = prev.junctions.map(j => j.id === id ? { ...j, ...updates } : j);
      } else if (type === 'reservoir') {
        updated.reservoirs = prev.reservoirs.map(r => r.id === id ? { ...r, ...updates } : r);
      } else if (type === 'tank') {
        updated.tanks = prev.tanks.map(t => t.id === id ? { ...t, ...updates } : t);
      } else if (type === 'pipe') {
        updated.pipes = prev.pipes.map(p => p.id === id ? { ...p, ...updates } : p);
      } else if (type === 'pump') {
        updated.pumps = prev.pumps.map(p => p.id === id ? { ...p, ...updates } : p);
      } else if (type === 'valve') {
        updated.valves = prev.valves.map(v => v.id === id ? { ...v, ...updates } : v);
      }
      handleRunSimulation(updated);
      return updated;
    });
  };

  // Delete Element
  const handleDeleteElement = (el: SelectedElement) => {
    setProject(prev => {
      let updated = { ...prev };
      if (el.type === 'junction') {
        updated.junctions = prev.junctions.filter(j => j.id !== el.id);
        // Also remove connected links
        updated.pipes = prev.pipes.filter(p => p.fromNode !== el.id && p.toNode !== el.id);
        updated.pumps = prev.pumps.filter(p => p.fromNode !== el.id && p.toNode !== el.id);
        updated.valves = prev.valves.filter(v => v.fromNode !== el.id && v.toNode !== el.id);
      } else if (el.type === 'reservoir') {
        updated.reservoirs = prev.reservoirs.filter(r => r.id !== el.id);
        updated.pipes = prev.pipes.filter(p => p.fromNode !== el.id && p.toNode !== el.id);
        updated.pumps = prev.pumps.filter(p => p.fromNode !== el.id && p.toNode !== el.id);
      } else if (el.type === 'tank') {
        updated.tanks = prev.tanks.filter(t => t.id !== el.id);
        updated.pipes = prev.pipes.filter(p => p.fromNode !== el.id && p.toNode !== el.id);
      } else if (el.type === 'pipe') {
        updated.pipes = prev.pipes.filter(p => p.id !== el.id);
      } else if (el.type === 'pump') {
        updated.pumps = prev.pumps.filter(p => p.id !== el.id);
      } else if (el.type === 'valve') {
        updated.valves = prev.valves.filter(v => v.id !== el.id);
      }
      setSelectedElement(null);
      handleRunSimulation(updated);
      return updated;
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* 1. Header Toolbar */}
      <Header
        project={project}
        results={results}
        activeView={activeView}
        isSimulating={isSimulating}
        onViewChange={setActiveView}
        onRunSimulation={() => handleRunSimulation(project)}
        onNewProject={handleNewProject}
        onLoadSample={handleLoadSample}
        onOpenInpModal={() => setIsInpModalOpen(true)}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
        onUpdateTitle={(title) => setProject(prev => ({ ...prev, title }))}
      />

      {/* 2. Main Work Area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left: Project Data Browser */}
        <ProjectBrowser
          project={project}
          selectedElement={selectedElement}
          onSelectElement={setSelectedElement}
          onAddElement={(cat) => {
            if (cat === 'junction') setToolMode('add_junction');
            else if (cat === 'reservoir') setToolMode('add_reservoir');
            else if (cat === 'tank') setToolMode('add_tank');
            else if (cat === 'pipe') setToolMode('add_pipe');
            else if (cat === 'pump') setToolMode('add_pump');
            else if (cat === 'valve') setToolMode('add_valve');
          }}
        />

        {/* Center: Map or Reports or Tables */}
        {activeView === 'map' ? (
          <main className="flex-1 relative h-full w-full overflow-hidden">
            {/* Thematic Toolbars & Legends */}
            <MapViewerToolbar
              toolMode={toolMode}
              onSetToolMode={setToolMode}
              nodeTheme={nodeTheme}
              onSetNodeTheme={setNodeTheme}
              linkTheme={linkTheme}
              onSetLinkTheme={setLinkTheme}
              showLabels={showLabels}
              onToggleLabels={() => setShowLabels(!showLabels)}
              showValues={showValues}
              onToggleValues={() => setShowValues(!showValues)}
              showArrows={showArrows}
              onToggleArrows={() => setShowArrows(!showArrows)}
              basemap={basemap}
              onSetBasemap={setBasemap}
              onZoomIn={() => setZoomLevel(prev => Math.min(4.0, prev * 1.25))}
              onZoomOut={() => setZoomLevel(prev => Math.max(0.15, prev * 0.8))}
              onFitExtent={() => setFitExtentTrigger(Date.now())}
              hasResults={!!results}
              legendRange={legendRange}
            />

            {/* Canvas */}
            <MapCanvas
              project={project}
              activeTimestepResult={activeTimestepResult}
              selectedElement={selectedElement}
              onSelectElement={setSelectedElement}
              toolMode={toolMode}
              onSetToolMode={setToolMode}
              nodeTheme={nodeTheme}
              linkTheme={linkTheme}
              showLabels={showLabels}
              showValues={showValues}
              showArrows={showArrows}
              basemap={basemap}
              onCursorMove={setCursorCoords}
              onUpdateCoordinates={handleUpdateCoordinates}
              onAddJunction={handleAddJunction}
              onAddReservoir={handleAddReservoir}
              onAddTank={handleAddTank}
              onAddLink={handleAddLink}
              onDeleteElement={handleDeleteElement}
              zoomLevel={zoomLevel}
              onSetZoomLevel={setZoomLevel}
              fitExtentTrigger={fitExtentTrigger}
            />

            {/* Floating 24-Hour EPS Time Controller */}
            {results && (
              <TimeSlider
                currentTimeHours={currentTimeHours}
                maxTimeHours={project.options.durationHours}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                onSetTime={setCurrentTimeHours}
                playbackSpeed={playbackSpeed}
                onSetSpeed={setPlaybackSpeed}
                totalSystemDemand={totalSystemDemand}
                flowUnits={project.options.flowUnits}
              />
            )}
          </main>
        ) : (
          <ReportPanel
            project={project}
            results={results}
            activeTab={activeView === 'tables' ? 'tables' : reportTab}
            onTabChange={(tab) => {
              if (tab === 'tables') setActiveView('tables');
              else {
                setActiveView('reports');
                setReportTab(tab);
              }
            }}
          />
        )}

        {/* Right: Property Inspector */}
        <PropertyInspector
          project={project}
          selectedElement={selectedElement}
          activeTimestepResult={activeTimestepResult}
          onClose={() => setSelectedElement(null)}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
        />
      </div>

      {/* 3. Bottom Status Bar */}
      <StatusBar
        project={project}
        results={results}
        cursorCoords={cursorCoords}
        zoomLevel={zoomLevel}
      />

      {/* Modals */}
      <InpModal
        project={project}
        isOpen={isInpModalOpen}
        onClose={() => setIsInpModalOpen(false)}
        onImportProject={handleImportProject}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </div>
  );
};
