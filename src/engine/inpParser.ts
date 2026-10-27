import {
  EpanetProject,
  Junction,
  Reservoir,
  Tank,
  Pipe,
  Pump,
  Valve,
  Pattern,
  Curve,
  Control,
  FlowUnit,
  HeadlossFormula,
  QualityType
} from '../types/epanet';

/**
 * Parses standard EPANET .INP input files into an EpanetProject
 */
export function parseInpFile(content: string): EpanetProject {
  const lines = content.split(/\r?\n/);
  let currentSection = '';

  const project: EpanetProject = {
    title: 'Imported EPANET Model',
    notes: '',
    junctions: [],
    reservoirs: [],
    tanks: [],
    pipes: [],
    pumps: [],
    valves: [],
    patterns: [],
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

  const coordinates: Record<string, { x: number; y: number }> = {};
  const descriptions: Record<string, string> = {};
  const patternsMap: Record<string, number[]> = {};
  const curvesMap: Record<string, { type: 'PUMP' | 'EFFICIENCY' | 'VOLUME' | 'HEADLOSS'; points: { x: number; y: number }[] }> = {};

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Skip empty lines
    if (!line) continue;

    // Check for section headers [SECTION]
    if (line.startsWith('[') && line.endsWith(']')) {
      currentSection = line.slice(1, -1).trim().toUpperCase();
      continue;
    }

    // Skip comment lines
    if (line.startsWith(';')) continue;

    const parts = line.split(/\s+/).filter(Boolean);
    if (parts.length === 0) continue;

    switch (currentSection) {
      case 'TITLE':
        project.title = line;
        break;

      case 'JUNCTIONS': {
        // ID Elev Demand Pattern
        const [id, elevStr, demandStr, patternId] = parts;
        project.junctions.push({
          id,
          x: 0,
          y: 0,
          elevation: parseFloat(elevStr) || 0,
          baseDemand: parseFloat(demandStr) || 0,
          demandPatternId: patternId
        });
        break;
      }

      case 'RESERVOIRS': {
        // ID Head Pattern
        const [id, headStr, patternId] = parts;
        project.reservoirs.push({
          id,
          x: 0,
          y: 0,
          totalHead: parseFloat(headStr) || 0,
          headPatternId: patternId
        });
        break;
      }

      case 'TANKS': {
        // ID Elev InitLevel MinLevel MaxLevel Diameter MinVol VolCurve
        const [id, elevStr, initStr, minStr, maxStr, diamStr] = parts;
        project.tanks.push({
          id,
          x: 0,
          y: 0,
          elevation: parseFloat(elevStr) || 0,
          initLevel: parseFloat(initStr) || 10,
          minLevel: parseFloat(minStr) || 0,
          maxLevel: parseFloat(maxStr) || 20,
          diameter: parseFloat(diamStr) || 50
        });
        break;
      }

      case 'PIPES': {
        // ID Node1 Node2 Length Diameter Roughness MinorLoss Status
        const [id, fromNode, toNode, lenStr, diamStr, roughStr, lossStr, statusStr] = parts;
        project.pipes.push({
          id,
          fromNode,
          toNode,
          length: parseFloat(lenStr) || 1000,
          diameter: parseFloat(diamStr) || 12,
          roughness: parseFloat(roughStr) || 100,
          minorLoss: parseFloat(lossStr) || 0,
          status: statusStr?.toUpperCase() === 'CLOSED' ? 'CLOSED' : 'OPEN'
        });
        break;
      }

      case 'PUMPS': {
        // ID Node1 Node2 Parameters
        const [id, fromNode, toNode, paramType, paramVal] = parts;
        let headCurveId: string | undefined;
        let power: number | undefined;

        if (paramType?.toUpperCase() === 'HEAD') {
          headCurveId = paramVal;
        } else if (paramType?.toUpperCase() === 'POWER') {
          power = parseFloat(paramVal) || 50;
        }

        project.pumps.push({
          id,
          fromNode,
          toNode,
          headCurveId,
          power: power ?? 75,
          speed: 1.0,
          status: 'OPEN'
        });
        break;
      }

      case 'VALVES': {
        // ID Node1 Node2 Diameter Type Setting MinorLoss
        const [id, fromNode, toNode, diamStr, vType, settingStr, lossStr] = parts;
        project.valves.push({
          id,
          fromNode,
          toNode,
          diameter: parseFloat(diamStr) || 12,
          valveType: (vType?.toUpperCase() as any) || 'PRV',
          setting: parseFloat(settingStr) || 50,
          minorLoss: parseFloat(lossStr) || 0,
          status: 'OPEN'
        });
        break;
      }

      case 'PATTERNS': {
        const id = parts[0];
        if (!patternsMap[id]) patternsMap[id] = [];
        for (let j = 1; j < parts.length; j++) {
          const val = parseFloat(parts[j]);
          if (!isNaN(val)) patternsMap[id].push(val);
        }
        break;
      }

      case 'CURVES': {
        const id = parts[0];
        const x = parseFloat(parts[1]);
        const y = parseFloat(parts[2]);
        if (!curvesMap[id]) {
          curvesMap[id] = { type: 'PUMP', points: [] };
        }
        if (!isNaN(x) && !isNaN(y)) {
          curvesMap[id].points.push({ x, y });
        }
        break;
      }

      case 'CONTROLS': {
        project.controls.push({
          id: `CTRL-${project.controls.length + 1}`,
          text: line
        });
        break;
      }

      case 'COORDINATES': {
        const [id, xStr, yStr] = parts;
        const x = parseFloat(xStr);
        const y = parseFloat(yStr);
        if (!isNaN(x) && !isNaN(y)) {
          coordinates[id] = { x, y };
        }
        break;
      }

      case 'OPTIONS': {
        const key = parts[0]?.toUpperCase();
        const val = parts[1]?.toUpperCase();
        if (key === 'UNITS') {
          if (['GPM', 'LPS', 'MGD', 'CFS', 'MLD'].includes(val)) {
            project.options.flowUnits = val as FlowUnit;
          }
        } else if (key === 'HEADLOSS') {
          if (['H-W', 'D-W', 'C-M'].includes(val)) {
            project.options.headlossFormula = val as HeadlossFormula;
          }
        }
        break;
      }
    }
  }

  // Populate patterns
  project.patterns = Object.entries(patternsMap).map(([id, multipliers]) => ({
    id,
    multipliers: multipliers.length > 0 ? multipliers : [1.0]
  }));

  // Populate curves
  project.curves = Object.entries(curvesMap).map(([id, data]) => ({
    id,
    type: data.type,
    points: data.points
  }));

  // Assign coordinates to nodes
  let defaultX = 200;
  let defaultY = 400;

  for (const junc of project.junctions) {
    if (coordinates[junc.id]) {
      junc.x = coordinates[junc.id].x;
      junc.y = coordinates[junc.id].y;
    } else {
      junc.x = defaultX;
      junc.y = defaultY;
      defaultX += 100;
      if (defaultX > 800) {
        defaultX = 200;
        defaultY -= 150;
      }
    }
  }

  for (const res of project.reservoirs) {
    if (coordinates[res.id]) {
      res.x = coordinates[res.id].x;
      res.y = coordinates[res.id].y;
    } else {
      res.x = 100;
      res.y = 700;
    }
  }

  for (const tank of project.tanks) {
    if (coordinates[tank.id]) {
      tank.x = coordinates[tank.id].x;
      tank.y = coordinates[tank.id].y;
    } else {
      tank.x = 500;
      tank.y = 800;
    }
  }

  return project;
}

/**
 * Exports an EpanetProject to standard EPANET .INP format string
 */
export function exportToInpFile(project: EpanetProject): string {
  const parts: string[] = [];

  parts.push('[TITLE]');
  parts.push(project.title || 'EPANET Model');
  if (project.notes) parts.push(`; ${project.notes}`);
  parts.push('');

  parts.push('[JUNCTIONS]');
  parts.push(';ID              Elev         Demand       Pattern');
  for (const j of project.junctions) {
    parts.push(`${j.id.padEnd(16)} ${j.elevation.toFixed(2).padStart(12)} ${j.baseDemand.toFixed(2).padStart(12)}  ${j.demandPatternId || ''}`);
  }
  parts.push('');

  parts.push('[RESERVOIRS]');
  parts.push(';ID              Head         Pattern');
  for (const r of project.reservoirs) {
    parts.push(`${r.id.padEnd(16)} ${r.totalHead.toFixed(2).padStart(12)}  ${r.headPatternId || ''}`);
  }
  parts.push('');

  parts.push('[TANKS]');
  parts.push(';ID              Elevation    InitLevel    MinLevel     MaxLevel     Diameter     MinVol       VolCurve');
  for (const t of project.tanks) {
    parts.push(`${t.id.padEnd(16)} ${t.elevation.toFixed(2).padStart(12)} ${t.initLevel.toFixed(2).padStart(12)} ${t.minLevel.toFixed(2).padStart(12)} ${t.maxLevel.toFixed(2).padStart(12)} ${t.diameter.toFixed(2).padStart(12)} 0`);
  }
  parts.push('');

  parts.push('[PIPES]');
  parts.push(';ID              Node1            Node2            Length       Diameter     Roughness    MinorLoss    Status');
  for (const p of project.pipes) {
    parts.push(`${p.id.padEnd(16)} ${p.fromNode.padEnd(16)} ${p.toNode.padEnd(16)} ${p.length.toFixed(1).padStart(12)} ${p.diameter.toFixed(1).padStart(12)} ${p.roughness.toFixed(1).padStart(12)} ${p.minorLoss.toFixed(2).padStart(12)} ${p.status}`);
  }
  parts.push('');

  parts.push('[PUMPS]');
  parts.push(';ID              Node1            Node2            Parameters');
  for (const p of project.pumps) {
    const param = p.headCurveId ? `HEAD ${p.headCurveId}` : `POWER ${p.power || 75}`;
    parts.push(`${p.id.padEnd(16)} ${p.fromNode.padEnd(16)} ${p.toNode.padEnd(16)} ${param}`);
  }
  parts.push('');

  parts.push('[VALVES]');
  parts.push(';ID              Node1            Node2            Diameter     Type   Setting      MinorLoss');
  for (const v of project.valves) {
    parts.push(`${v.id.padEnd(16)} ${v.fromNode.padEnd(16)} ${v.toNode.padEnd(16)} ${v.diameter.toFixed(1).padStart(12)} ${v.valveType} ${v.setting.toFixed(1).padStart(12)} ${v.minorLoss.toFixed(2).padStart(12)}`);
  }
  parts.push('');

  if (project.patterns.length > 0) {
    parts.push('[PATTERNS]');
    parts.push(';ID              Multipliers');
    for (const pat of project.patterns) {
      parts.push(`${pat.id.padEnd(16)} ${pat.multipliers.map(m => m.toFixed(2)).join(' ')}`);
    }
    parts.push('');
  }

  if (project.curves.length > 0) {
    parts.push('[CURVES]');
    parts.push(';ID              X-Value      Y-Value');
    for (const c of project.curves) {
      for (const pt of c.points) {
        parts.push(`${c.id.padEnd(16)} ${pt.x.toFixed(2).padStart(12)} ${pt.y.toFixed(2).padStart(12)}`);
      }
    }
    parts.push('');
  }

  if (project.controls.length > 0) {
    parts.push('[CONTROLS]');
    for (const ctrl of project.controls) {
      parts.push(ctrl.text);
    }
    parts.push('');
  }

  parts.push('[COORDINATES]');
  parts.push(';Node            X-Coord          Y-Coord');
  for (const j of project.junctions) {
    parts.push(`${j.id.padEnd(16)} ${j.x.toFixed(2).padStart(16)} ${j.y.toFixed(2).padStart(16)}`);
  }
  for (const r of project.reservoirs) {
    parts.push(`${r.id.padEnd(16)} ${r.x.toFixed(2).padStart(16)} ${r.y.toFixed(2).padStart(16)}`);
  }
  for (const t of project.tanks) {
    parts.push(`${t.id.padEnd(16)} ${t.x.toFixed(2).padStart(16)} ${t.y.toFixed(2).padStart(16)}`);
  }
  parts.push('');

  parts.push('[OPTIONS]');
  parts.push(`Units              ${project.options.flowUnits}`);
  parts.push(`Headloss           ${project.options.headlossFormula}`);
  parts.push(`Duration           ${project.options.durationHours}:00`);
  parts.push(`Hydraulic Timestep ${project.options.hydraulicTimestepHours}:00`);
  parts.push(`Quality            ${project.options.qualityType}`);
  parts.push('');

  parts.push('[END]');
  return parts.join('\n');
}
