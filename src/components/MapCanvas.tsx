import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  EpanetProject,
  SelectedElement,
  ToolMode,
  NodeTheme,
  LinkTheme,
  TimestepResult
} from '../types/epanet';

interface MapCanvasProps {
  project: EpanetProject;
  activeTimestepResult: TimestepResult | null;
  selectedElement: SelectedElement | null;
  onSelectElement: (el: SelectedElement | null) => void;
  toolMode: ToolMode;
  onSetToolMode: (mode: ToolMode) => void;
  nodeTheme: NodeTheme;
  linkTheme: LinkTheme;
  showLabels: boolean;
  showValues: boolean;
  showArrows: boolean;
  basemap: 'dark' | 'light' | 'grid' | 'none';
  onCursorMove: (coords: { x: number; y: number } | null) => void;
  onUpdateCoordinates: (id: string, x: number, y: number) => void;
  onAddJunction: (coords: { x: number; y: number }) => void;
  onAddReservoir: (coords: { x: number; y: number }) => void;
  onAddTank: (coords: { x: number; y: number }) => void;
  onAddLink: (type: 'pipe' | 'pump' | 'valve', fromNode: string, toNode: string) => void;
  onDeleteElement: (el: SelectedElement) => void;
  zoomLevel: number;
  onSetZoomLevel: (zoom: number) => void;
  fitExtentTrigger: number;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  project,
  activeTimestepResult,
  selectedElement,
  onSelectElement,
  toolMode,
  nodeTheme,
  linkTheme,
  showLabels,
  showValues,
  showArrows,
  basemap,
  onCursorMove,
  onUpdateCoordinates,
  onAddJunction,
  onAddReservoir,
  onAddTank,
  onAddLink,
  onDeleteElement,
  zoomLevel,
  onSetZoomLevel,
  fitExtentTrigger
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan offset (screen pixels)
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 100, y: 100 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Node dragging state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // Link creation start node
  const [linkStartNodeId, setLinkStartNodeId] = useState<string | null>(null);
  const [mouseWorldPos, setMouseWorldPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Map node lookup by ID
  const allNodesMap = useMemo(() => {
    const map = new Map<string, { id: string; type: 'junction' | 'reservoir' | 'tank'; x: number; y: number }>();
    for (const j of project.junctions) map.set(j.id, { id: j.id, type: 'junction', x: j.x, y: j.y });
    for (const r of project.reservoirs) map.set(r.id, { id: r.id, type: 'reservoir', x: r.x, y: r.y });
    for (const t of project.tanks) map.set(t.id, { id: t.id, type: 'tank', x: t.x, y: t.y });
    return map;
  }, [project.junctions, project.reservoirs, project.tanks]);

  // Network bounding box for fit to extent
  const fitToExtent = () => {
    if (allNodesMap.size === 0 || !containerRef.current) return;
    const coords = Array.from(allNodesMap.values());
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const c of coords) {
      if (c.x < minX) minX = c.x;
      if (c.x > maxX) maxX = c.x;
      if (c.y < minY) minY = c.y;
      if (c.y > maxY) maxY = c.y;
    }

    const { clientWidth, clientHeight } = containerRef.current;
    const padding = 100;
    const netWidth = Math.max(100, maxX - minX);
    const netHeight = Math.max(100, maxY - minY);

    const zoomX = (clientWidth - padding * 2) / netWidth;
    const zoomY = (clientHeight - padding * 2) / netHeight;
    const newZoom = Math.min(2.5, Math.max(0.2, Math.min(zoomX, zoomY)));

    // Invert Y coordinate so Y goes upward as standard in civil/hydraulic engineering
    const centerNetX = (minX + maxX) / 2;
    const centerNetY = (minY + maxY) / 2;

    const screenCenterX = clientWidth / 2;
    const screenCenterY = clientHeight / 2;

    setPanOffset({
      x: screenCenterX - centerNetX * newZoom,
      y: screenCenterY + centerNetY * newZoom
    });
    onSetZoomLevel(newZoom);
  };

  useEffect(() => {
    fitToExtent();
  }, [fitExtentTrigger]);

  // Coordinate transforms (Y is inverted for engineering standard)
  const worldToScreen = (wx: number, wy: number) => {
    return {
      sx: panOffset.x + wx * zoomLevel,
      sy: panOffset.y - wy * zoomLevel
    };
  };

  const screenToWorld = (sx: number, sy: number) => {
    return {
      x: (sx - panOffset.x) / zoomLevel,
      y: -(sy - panOffset.y) / zoomLevel
    };
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseSx = e.clientX - rect.left;
    const mouseSy = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const nextZoom = Math.max(0.15, Math.min(4.0, zoomLevel * zoomFactor));

    // Keep point under cursor fixed
    const worldPoint = screenToWorld(mouseSx, mouseSy);
    const nextOffsetX = mouseSx - worldPoint.x * nextZoom;
    const nextOffsetY = mouseSy + worldPoint.y * nextZoom;

    onSetZoomLevel(nextZoom);
    setPanOffset({ x: nextOffsetX, y: nextOffsetY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle button or Pan mode or Space key starts panning
    if (e.button === 1 || toolMode === 'pan' || (e.button === 0 && e.target === containerRef.current)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseSx = e.clientX - rect.left;
    const mouseSy = e.clientY - rect.top;
    const world = screenToWorld(mouseSx, mouseSy);
    setMouseWorldPos(world);
    onCursorMove(world);

    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    if (draggedNodeId) {
      onUpdateCoordinates(draggedNodeId, Math.round(world.x), Math.round(world.y));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target !== containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const roundCoords = { x: Math.round(world.x), y: Math.round(world.y) };

    if (toolMode === 'add_junction') {
      onAddJunction(roundCoords);
    } else if (toolMode === 'add_reservoir') {
      onAddReservoir(roundCoords);
    } else if (toolMode === 'add_tank') {
      onAddTank(roundCoords);
    } else if (toolMode === 'select') {
      onSelectElement(null);
    }

    setLinkStartNodeId(null);
  };

  // Node Click handler
  const handleNodeClick = (e: React.MouseEvent, node: { id: string; type: 'junction' | 'reservoir' | 'tank' }) => {
    e.stopPropagation();

    if (toolMode === 'delete') {
      onDeleteElement({ type: node.type, id: node.id });
      return;
    }

    if (toolMode === 'add_pipe' || toolMode === 'add_pump' || toolMode === 'add_valve') {
      if (!linkStartNodeId) {
        setLinkStartNodeId(node.id);
      } else if (linkStartNodeId !== node.id) {
        const linkType = toolMode === 'add_pipe' ? 'pipe' : toolMode === 'add_pump' ? 'pump' : 'valve';
        onAddLink(linkType, linkStartNodeId, node.id);
        setLinkStartNodeId(null);
      }
      return;
    }

    if (toolMode === 'select') {
      onSelectElement({ type: node.type, id: node.id });
      setDraggedNodeId(node.id);
    }
  };

  // Link Click handler
  const handleLinkClick = (e: React.MouseEvent, type: 'pipe' | 'pump' | 'valve', id: string) => {
    e.stopPropagation();

    if (toolMode === 'delete') {
      onDeleteElement({ type, id });
      return;
    }

    if (toolMode === 'select') {
      onSelectElement({ type, id });
    }
  };

  // Color mapper for Node themes
  const getNodeColor = (nodeId: string) => {
    const res = activeTimestepResult?.nodes[nodeId];
    if (!res) return '#38bdf8'; // sky blue default

    if (nodeTheme === 'pressure') {
      // Pressure scale: <30 red/amber, 30-70 green/cyan, >85 red
      const p = res.pressure;
      if (p < 20) return '#ef4444'; // low pressure warning
      if (p < 40) return '#f59e0b';
      if (p < 65) return '#10b981'; // ideal pressure
      if (p < 85) return '#06b6d4';
      return '#ec4899'; // high pressure
    }
    if (nodeTheme === 'quality') {
      // Quality scale 0 to 1
      const q = res.quality;
      if (q > 0.8) return '#10b981';
      if (q > 0.5) return '#06b6d4';
      if (q > 0.2) return '#f59e0b';
      return '#ef4444';
    }
    if (nodeTheme === 'elevation') {
      return '#a855f7';
    }
    return '#38bdf8';
  };

  // Color mapper for Link themes
  const getLinkColor = (pipeId: string) => {
    const res = activeTimestepResult?.links[pipeId];
    if (!res || res.status === 'CLOSED') return '#475569'; // slate grey if closed

    if (linkTheme === 'velocity') {
      // Velocity in ft/sec: < 2 blue, 2-5 green, 5-8 yellow, > 8 red
      const v = res.velocity;
      if (v < 2) return '#38bdf8';
      if (v < 5) return '#10b981';
      if (v < 8) return '#f59e0b';
      return '#ef4444';
    }
    if (linkTheme === 'flow') {
      const absQ = Math.abs(res.flow);
      if (absQ > 800) return '#3b82f6';
      if (absQ > 300) return '#06b6d4';
      if (absQ > 50) return '#10b981';
      return '#64748b';
    }
    return '#0284c7';
  };

  // Render guideline when creating a link
  const renderConnectingGuide = () => {
    if (!linkStartNodeId) return null;
    const startNode = allNodesMap.get(linkStartNodeId);
    if (!startNode) return null;

    const startPos = worldToScreen(startNode.x, startNode.y);
    const mousePos = worldToScreen(mouseWorldPos.x, mouseWorldPos.y);

    return (
      <line
        x1={startPos.sx}
        y1={startPos.sy}
        x2={mousePos.sx}
        y2={mousePos.sy}
        stroke="#06b6d4"
        strokeWidth={2}
        strokeDasharray="4 4"
        className="animate-pulse"
      />
    );
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleCanvasClick}
      className={`relative w-full h-full overflow-hidden select-none bg-slate-950 ${
        isPanning ? 'cursor-grabbing' : toolMode === 'pan' ? 'cursor-grab' : 'cursor-crosshair'
      }`}
    >
      {/* Background Cartography or Grid */}
      {basemap === 'grid' && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <defs>
            <pattern
              id="grid-pattern"
              width={50 * zoomLevel}
              height={50 * zoomLevel}
              patternUnits="userSpaceOnUse"
              patternTransform={`translate(${panOffset.x % (50 * zoomLevel)}, ${panOffset.y % (50 * zoomLevel)})`}
            >
              <path
                d={`M ${50 * zoomLevel} 0 L 0 0 0 ${50 * zoomLevel}`}
                fill="none"
                stroke="#64748b"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      )}

      {/* Main SVG Vector Layer */}
      <svg className="absolute inset-0 w-full h-full overflow-visible">
        <defs>
          {/* Arrowhead marker for directional flow */}
          <marker
            id="flow-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" />
          </marker>

          {/* Reverse arrowhead marker */}
          <marker
            id="flow-arrow-reverse"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" />
          </marker>
        </defs>

        {/* 1. PIPES */}
        {project.pipes.map((pipe) => {
          const fromNode = allNodesMap.get(pipe.fromNode);
          const toNode = allNodesMap.get(pipe.toNode);
          if (!fromNode || !toNode) return null;

          const p1 = worldToScreen(fromNode.x, fromNode.y);
          const p2 = worldToScreen(toNode.x, toNode.y);
          const isSelected = selectedElement?.type === 'pipe' && selectedElement.id === pipe.id;
          const strokeColor = getLinkColor(pipe.id);
          const res = activeTimestepResult?.links[pipe.id];
          const isFlowing = res && Math.abs(res.flow) > 0.1 && res.status === 'OPEN';

          // Midpoint for labels & arrows
          const midX = (p1.sx + p2.sx) / 2;
          const midY = (p1.sy + p2.sy) / 2;
          const angle = Math.atan2(p2.sy - p1.sy, p2.sx - p1.sx) * (180 / Math.PI);
          // Actual flow direction sign
          const flowPositive = !res || res.flow >= 0;

          // Scale pipe line thickness by diameter (e.g. 8" -> 2.5px, 24" -> 6px)
          const baseStrokeWidth = Math.max(2, Math.min(8, (pipe.diameter / 4))) * Math.max(0.6, Math.min(1.5, zoomLevel));

          return (
            <g
              key={`pipe-${pipe.id}`}
              onClick={(e) => handleLinkClick(e, 'pipe', pipe.id)}
              className="cursor-pointer group"
            >
              {/* Invisible fat hit area for easy clicking */}
              <line
                x1={p1.sx}
                y1={p1.sy}
                x2={p2.sx}
                y2={p2.sy}
                stroke="transparent"
                strokeWidth={Math.max(16, baseStrokeWidth + 10)}
              />

              {/* Selection Halo */}
              {isSelected && (
                <line
                  x1={p1.sx}
                  y1={p1.sy}
                  x2={p2.sx}
                  y2={p2.sy}
                  stroke="#38bdf8"
                  strokeWidth={baseStrokeWidth + 6}
                  strokeOpacity={0.6}
                  strokeLinecap="round"
                />
              )}

              {/* Pipe Body */}
              <line
                x1={p1.sx}
                y1={p1.sy}
                x2={p2.sx}
                y2={p2.sy}
                stroke={strokeColor}
                strokeWidth={baseStrokeWidth}
                strokeLinecap="round"
                strokeDasharray={pipe.status === 'CLOSED' ? '6 4' : undefined}
                className={isFlowing ? 'pipe-flowing' : ''}
              />

              {/* Flow Direction Arrow */}
              {showArrows && isFlowing && (
                <g transform={`translate(${midX}, ${midY}) rotate(${angle})`}>
                  <path
                    d={flowPositive ? 'M -4 -3 L 4 0 L -4 3 z' : 'M 4 -3 L -4 0 L 4 3 z'}
                    fill="#38bdf8"
                    stroke="#0f172a"
                    strokeWidth="0.5"
                  />
                </g>
              )}

              {/* Pipe ID / Value Label */}
              {showLabels && (
                <text
                  x={midX}
                  y={midY - 8}
                  fill="#94a3b8"
                  fontSize={Math.max(10, 11 * Math.min(1.2, zoomLevel))}
                  fontWeight="500"
                  textAnchor="middle"
                  className="pointer-events-none drop-shadow"
                >
                  {showValues && res ? `${pipe.id}: ${res.flow.toFixed(0)} gpm` : pipe.id}
                </text>
              )}
            </g>
          );
        })}

        {/* 2. PUMPS */}
        {project.pumps.map((pump) => {
          const fromNode = allNodesMap.get(pump.fromNode);
          const toNode = allNodesMap.get(pump.toNode);
          if (!fromNode || !toNode) return null;

          const p1 = worldToScreen(fromNode.x, fromNode.y);
          const p2 = worldToScreen(toNode.x, toNode.y);
          const midX = (p1.sx + p2.sx) / 2;
          const midY = (p1.sy + p2.sy) / 2;
          const isSelected = selectedElement?.type === 'pump' && selectedElement.id === pump.id;
          const res = activeTimestepResult?.links[pump.id];
          const isOpen = res ? res.status === 'OPEN' : pump.status === 'OPEN';

          return (
            <g
              key={`pump-${pump.id}`}
              onClick={(e) => handleLinkClick(e, 'pump', pump.id)}
              className="cursor-pointer"
            >
              {/* Connecting line */}
              <line x1={p1.sx} y1={p1.sy} x2={p2.sx} y2={p2.sy} stroke="#f43f5e" strokeWidth={3} strokeDasharray="3 3" />

              {/* Pump Icon Badge */}
              <circle
                cx={midX}
                cy={midY}
                r={14}
                fill="#0f172a"
                stroke={isSelected ? '#38bdf8' : isOpen ? '#f43f5e' : '#64748b'}
                strokeWidth={isSelected ? 3 : 2}
                className={isOpen ? 'animate-pulse' : ''}
              />
              <path
                d={`M ${midX - 7} ${midY + 5} L ${midX} ${midY - 7} L ${midX + 7} ${midY + 5} z`}
                fill={isOpen ? '#f43f5e' : '#64748b'}
              />
              {showLabels && (
                <text
                  x={midX}
                  y={midY - 18}
                  fill="#f43f5e"
                  fontSize={10}
                  fontWeight="600"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {pump.id}
                </text>
              )}
            </g>
          );
        })}

        {/* 3. VALVES */}
        {project.valves.map((valve) => {
          const fromNode = allNodesMap.get(valve.fromNode);
          const toNode = allNodesMap.get(valve.toNode);
          if (!fromNode || !toNode) return null;

          const p1 = worldToScreen(fromNode.x, fromNode.y);
          const p2 = worldToScreen(toNode.x, toNode.y);
          const midX = (p1.sx + p2.sx) / 2;
          const midY = (p1.sy + p2.sy) / 2;
          const angle = Math.atan2(p2.sy - p1.sy, p2.sx - p1.sx) * (180 / Math.PI);
          const isSelected = selectedElement?.type === 'valve' && selectedElement.id === valve.id;

          return (
            <g
              key={`valve-${valve.id}`}
              onClick={(e) => handleLinkClick(e, 'valve', valve.id)}
              className="cursor-pointer"
            >
              <line x1={p1.sx} y1={p1.sy} x2={p2.sx} y2={p2.sy} stroke="#a855f7" strokeWidth={3} />
              {/* Bowtie Valve symbol */}
              <g transform={`translate(${midX}, ${midY}) rotate(${angle})`}>
                <polygon
                  points="-10,-7 0,0 -10,7"
                  fill="#a855f7"
                  stroke={isSelected ? '#38bdf8' : '#0f172a'}
                  strokeWidth="1.5"
                />
                <polygon
                  points="10,-7 0,0 10,7"
                  fill="#a855f7"
                  stroke={isSelected ? '#38bdf8' : '#0f172a'}
                  strokeWidth="1.5"
                />
              </g>
              {showLabels && (
                <text
                  x={midX}
                  y={midY - 12}
                  fill="#c084fc"
                  fontSize={10}
                  fontWeight="600"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {valve.id} ({valve.valveType})
                </text>
              )}
            </g>
          );
        })}

        {/* 4. RESERVOIRS (Water Sources) */}
        {project.reservoirs.map((res) => {
          const pos = worldToScreen(res.x, res.y);
          const isSelected = selectedElement?.type === 'reservoir' && selectedElement.id === res.id;

          return (
            <g
              key={`res-${res.id}`}
              onClick={(e) => handleNodeClick(e, { id: res.id, type: 'reservoir' })}
              className="cursor-pointer"
            >
              {isSelected && (
                <rect
                  x={pos.sx - 20}
                  y={pos.sy - 15}
                  width={40}
                  height={30}
                  rx={4}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth={3}
                />
              )}
              {/* Reservoir Basin Box with Wave Pattern */}
              <rect
                x={pos.sx - 16}
                y={pos.sy - 12}
                width={32}
                height={24}
                rx={3}
                fill="#0284c7"
                stroke="#38bdf8"
                strokeWidth={2}
              />
              <path
                d={`M ${pos.sx - 12} ${pos.sy - 2} Q ${pos.sx - 6} ${pos.sy - 6} ${pos.sx} ${pos.sy - 2} T ${pos.sx + 12} ${pos.sy - 2}`}
                fill="none"
                stroke="#e0f2fe"
                strokeWidth={1.5}
              />
              <path
                d={`M ${pos.sx - 12} ${pos.sy + 4} Q ${pos.sx - 6} ${pos.sy} ${pos.sx} ${pos.sy + 4} T ${pos.sx + 12} ${pos.sy + 4}`}
                fill="none"
                stroke="#e0f2fe"
                strokeWidth={1.5}
              />

              {showLabels && (
                <text
                  x={pos.sx}
                  y={pos.sy - 18}
                  fill="#38bdf8"
                  fontSize={11}
                  fontWeight="bold"
                  textAnchor="middle"
                  className="pointer-events-none drop-shadow"
                >
                  {res.id} (Res)
                </text>
              )}
            </g>
          );
        })}

        {/* 5. ELEVATED STORAGE TANKS */}
        {project.tanks.map((tank) => {
          const pos = worldToScreen(tank.x, tank.y);
          const isSelected = selectedElement?.type === 'tank' && selectedElement.id === tank.id;
          const nodeRes = activeTimestepResult?.nodes[tank.id];
          const curLevel = nodeRes?.waterLevel ?? tank.initLevel;
          const fillPercent = Math.max(0.1, Math.min(1.0, (curLevel - tank.minLevel) / Math.max(1, tank.maxLevel - tank.minLevel)));
          const tankHeight = 26;
          const waterHeight = tankHeight * fillPercent;

          return (
            <g
              key={`tank-${tank.id}`}
              onClick={(e) => handleNodeClick(e, { id: tank.id, type: 'tank' })}
              className="cursor-pointer"
            >
              {isSelected && (
                <rect
                  x={pos.sx - 18}
                  y={pos.sy - 20}
                  width={36}
                  height={40}
                  rx={6}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth={3}
                />
              )}
              {/* Stand / legs */}
              <line x1={pos.sx - 10} y1={pos.sy + 10} x2={pos.sx - 6} y2={pos.sy + 20} stroke="#64748b" strokeWidth={2} />
              <line x1={pos.sx + 10} y1={pos.sy + 10} x2={pos.sx + 6} y2={pos.sy + 20} stroke="#64748b" strokeWidth={2} />

              {/* Tank Body Cylinder */}
              <rect
                x={pos.sx - 14}
                y={pos.sy - 16}
                width={28}
                height={tankHeight}
                rx={4}
                fill="#0f172a"
                stroke="#f59e0b"
                strokeWidth={2}
              />

              {/* Water level fill */}
              <rect
                x={pos.sx - 13}
                y={pos.sy - 16 + (tankHeight - waterHeight)}
                width={26}
                height={waterHeight}
                rx={3}
                fill="#0284c7"
                fillOpacity={0.85}
              />

              {showLabels && (
                <text
                  x={pos.sx}
                  y={pos.sy - 22}
                  fill="#f59e0b"
                  fontSize={11}
                  fontWeight="bold"
                  textAnchor="middle"
                  className="pointer-events-none drop-shadow"
                >
                  {tank.id}: {curLevel.toFixed(1)} ft
                </text>
              )}
            </g>
          );
        })}

        {/* 6. JUNCTIONS */}
        {project.junctions.map((junc) => {
          const pos = worldToScreen(junc.x, junc.y);
          const isSelected = selectedElement?.type === 'junction' && selectedElement.id === junc.id;
          const nodeColor = getNodeColor(junc.id);
          const nodeRes = activeTimestepResult?.nodes[junc.id];
          const isLinkStart = linkStartNodeId === junc.id;

          const radius = Math.max(6, 7 * Math.min(1.4, Math.max(0.7, zoomLevel)));

          return (
            <g
              key={`junc-${junc.id}`}
              onClick={(e) => handleNodeClick(e, { id: junc.id, type: 'junction' })}
              className="cursor-pointer group"
            >
              {/* Highlight Halo */}
              {(isSelected || isLinkStart) && (
                <circle
                  cx={pos.sx}
                  cy={pos.sy}
                  r={radius + 5}
                  fill="none"
                  stroke={isLinkStart ? '#06b6d4' : '#38bdf8'}
                  strokeWidth={2.5}
                  className="animate-pulse"
                />
              )}

              {/* Node Circle */}
              <circle
                cx={pos.sx}
                cy={pos.sy}
                r={radius}
                fill={nodeColor}
                stroke="#0f172a"
                strokeWidth={1.5}
                className="transition-transform group-hover:scale-125"
              />

              {/* ID or Simulated Value Label */}
              {showLabels && (
                <text
                  x={pos.sx}
                  y={pos.sy - radius - 5}
                  fill="#e2e8f0"
                  fontSize={Math.max(10, 11 * Math.min(1.2, zoomLevel))}
                  fontWeight="600"
                  textAnchor="middle"
                  className="pointer-events-none drop-shadow"
                >
                  {showValues && nodeRes
                    ? `${junc.id}: ${nodeRes.pressure.toFixed(1)} psi`
                    : junc.id}
                </text>
              )}
            </g>
          );
        })}

        {/* Link connecting guideline while drawing */}
        {renderConnectingGuide()}
      </svg>
    </div>
  );
};
