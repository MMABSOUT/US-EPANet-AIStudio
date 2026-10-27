import { EpanetProject } from '../types/epanet';

/**
 * Net1: The classic EPA Benchmark Network
 * 9 Junctions, 1 Reservoir, 1 Tank, 12 Pipes, 1 Pump
 */
export const net1Project: EpanetProject = {
  title: 'EPA Net1 Benchmark Example Network',
  notes: 'Standard 24-hour Extended Period Simulation (EPS) of a dual-source water supply network.',
  options: {
    flowUnits: 'GPM',
    headlossFormula: 'H-W',
    specificGravity: 1.0,
    relativeViscosity: 1.0,
    durationHours: 24,
    hydraulicTimestepHours: 1,
    qualityType: 'CHEMICAL',
    qualityChemicalName: 'Chlorine',
    chemicalUnits: 'mg/L',
    globalBulkCoeff: -0.5,
    globalWallCoeff: -1.0,
  },
  patterns: [
    {
      id: 'Pat-1',
      description: 'Diurnal residential demand pattern',
      multipliers: [
        0.4, 0.3, 0.2, 0.3, 0.5, 0.8, 1.2, 1.4, 1.3, 1.1, 1.0, 1.1,
        1.2, 1.3, 1.2, 1.1, 1.2, 1.4, 1.5, 1.4, 1.2, 1.0, 0.7, 0.5
      ]
    }
  ],
  curves: [
    {
      id: 'PUMP-CURVE-1',
      type: 'PUMP',
      points: [
        { x: 0, y: 200 },
        { x: 1000, y: 175 },
        { x: 2000, y: 100 }
      ]
    }
  ],
  controls: [
    {
      id: 'CTRL-1',
      text: 'LINK 9 CLOSED IF NODE 2 ABOVE 140',
      linkId: '9',
      status: 'CLOSED',
      nodeId: '2',
      condition: 'ABOVE',
      value: 140
    },
    {
      id: 'CTRL-2',
      text: 'LINK 9 OPEN IF NODE 2 BELOW 110',
      linkId: '9',
      status: 'OPEN',
      nodeId: '2',
      condition: 'BELOW',
      value: 110
    }
  ],
  reservoirs: [
    {
      id: '9',
      description: 'Lake Water Source',
      x: 100,
      y: 700,
      totalHead: 700
    }
  ],
  tanks: [
    {
      id: '2',
      description: 'North Elevated Storage Tank',
      x: 500,
      y: 900,
      elevation: 850,
      initLevel: 120,
      minLevel: 100,
      maxLevel: 150,
      diameter: 50.5
    }
  ],
  junctions: [
    { id: '10', description: 'Pump Discharge Node', x: 200, y: 700, elevation: 710, baseDemand: 0, demandPatternId: 'Pat-1' },
    { id: '11', description: 'West Junction 11', x: 300, y: 700, elevation: 710, baseDemand: 150, demandPatternId: 'Pat-1' },
    { id: '12', description: 'Center-West Junction 12', x: 500, y: 700, elevation: 700, baseDemand: 150, demandPatternId: 'Pat-1' },
    { id: '13', description: 'East Junction 13', x: 700, y: 700, elevation: 695, baseDemand: 100, demandPatternId: 'Pat-1' },
    { id: '21', description: 'Southwest Junction 21', x: 300, y: 400, elevation: 700, baseDemand: 150, demandPatternId: 'Pat-1' },
    { id: '22', description: 'South Junction 22', x: 500, y: 400, elevation: 695, baseDemand: 200, demandPatternId: 'Pat-1' },
    { id: '23', description: 'Southeast Junction 23', x: 700, y: 400, elevation: 690, baseDemand: 150, demandPatternId: 'Pat-1' },
    { id: '31', description: 'Far South Junction 31', x: 300, y: 150, elevation: 700, baseDemand: 100, demandPatternId: 'Pat-1' },
    { id: '32', description: 'Far South-East Junction 32', x: 700, y: 150, elevation: 710, baseDemand: 100, demandPatternId: 'Pat-1' }
  ],
  pumps: [
    {
      id: '9',
      description: 'Primary Intake Pump 1',
      fromNode: '9',
      toNode: '10',
      headCurveId: 'PUMP-CURVE-1',
      power: 75,
      speed: 1.0,
      status: 'OPEN'
    }
  ],
  valves: [],
  pipes: [
    { id: '10', description: 'Main Trunk 10', fromNode: '10', toNode: '11', length: 10530, diameter: 18, roughness: 100, minorLoss: 0, status: 'OPEN' },
    { id: '11', description: 'Distribution Pipe 11', fromNode: '11', toNode: '12', length: 5280, diameter: 14, roughness: 100, minorLoss: 0, status: 'OPEN' },
    { id: '12', description: 'Distribution Pipe 12', fromNode: '12', toNode: '13', length: 5280, diameter: 12, roughness: 100, minorLoss: 0, status: 'OPEN' },
    { id: '21', description: 'North-South Loop Pipe 21', fromNode: '11', toNode: '21', length: 5280, diameter: 10, roughness: 100, minorLoss: 0, status: 'OPEN' },
    { id: '22', description: 'Center Cross Pipe 22', fromNode: '12', toNode: '22', length: 5280, diameter: 12, roughness: 100, minorLoss: 0, status: 'OPEN' },
    { id: '23', description: 'East Lateral Pipe 23', fromNode: '13', toNode: '23', length: 5280, diameter: 10, roughness: 100, minorLoss: 0, status: 'OPEN' },
    { id: '31', description: 'Mid Cross Pipe 31', fromNode: '21', toNode: '22', length: 5280, diameter: 10, roughness: 100, minorLoss: 0, status: 'OPEN' },
    { id: '32', description: 'Mid East Pipe 32', fromNode: '22', toNode: '23', length: 5280, diameter: 10, roughness: 100, minorLoss: 0, status: 'OPEN' },
    { id: '110', description: 'Tank Feed Pipe 110', fromNode: '2', toNode: '12', length: 200, diameter: 14, roughness: 100, minorLoss: 0, status: 'OPEN' },
    { id: '111', description: 'South Collector 111', fromNode: '21', toNode: '31', length: 5280, diameter: 8, roughness: 100, minorLoss: 0, status: 'OPEN' },
    { id: '112', description: 'South Loop 112', fromNode: '31', toNode: '32', length: 5280, diameter: 8, roughness: 100, minorLoss: 0, status: 'OPEN' },
    { id: '113', description: 'East Return 113', fromNode: '23', toNode: '32', length: 5280, diameter: 8, roughness: 100, minorLoss: 0, status: 'OPEN' }
  ]
};

/**
 * Net2: Dual Pressure Zone Network with PRV valve and multiple sources
 */
export const net2Project: EpanetProject = {
  title: 'EPA Net2 Pressure-Zoned Network',
  notes: 'Dual pressure zone distribution system with 2 water sources, pressure-reducing valve, and storage.',
  options: {
    flowUnits: 'GPM',
    headlossFormula: 'H-W',
    specificGravity: 1.0,
    relativeViscosity: 1.0,
    durationHours: 24,
    hydraulicTimestepHours: 1,
    qualityType: 'AGE',
  },
  patterns: [
    {
      id: 'Pat-Res',
      description: 'Residential Diurnal Pattern',
      multipliers: [0.5, 0.4, 0.3, 0.4, 0.7, 1.1, 1.5, 1.3, 1.0, 0.9, 1.0, 1.1, 1.2, 1.1, 1.0, 1.1, 1.3, 1.6, 1.5, 1.2, 1.0, 0.8, 0.6, 0.5]
    },
    {
      id: 'Pat-Com',
      description: 'Commercial Business Pattern',
      multipliers: [0.2, 0.2, 0.2, 0.3, 0.5, 0.9, 1.4, 1.7, 1.8, 1.7, 1.6, 1.5, 1.4, 1.5, 1.5, 1.3, 0.9, 0.6, 0.4, 0.3, 0.2, 0.2, 0.2, 0.2]
    }
  ],
  curves: [
    {
      id: 'WELL-PUMP',
      type: 'PUMP',
      points: [{ x: 0, y: 220 }, { x: 800, y: 190 }, { x: 1600, y: 110 }]
    }
  ],
  controls: [],
  reservoirs: [
    { id: 'Res-HighZone', description: 'High Zone Mountain Reservoir', x: 150, y: 800, totalHead: 820 },
    { id: 'Res-River', description: 'River Intake Reservoir', x: 850, y: 200, totalHead: 650 }
  ],
  tanks: [
    { id: 'Tank-West', description: 'West Valley Buffer Tank', x: 150, y: 350, elevation: 620, initLevel: 25, minLevel: 10, maxLevel: 40, diameter: 45 }
  ],
  junctions: [
    { id: 'J-101', description: 'High Zone Intake Jct', x: 300, y: 800, elevation: 750, baseDemand: 120, demandPatternId: 'Pat-Res' },
    { id: 'J-102', description: 'High Zone Ridge Jct', x: 500, y: 800, elevation: 730, baseDemand: 180, demandPatternId: 'Pat-Res' },
    { id: 'J-103', description: 'High-to-Low PRV Upstream', x: 500, y: 650, elevation: 710, baseDemand: 0 },
    { id: 'J-201', description: 'Low Zone PRV Downstream', x: 500, y: 500, elevation: 660, baseDemand: 50, demandPatternId: 'Pat-Com' },
    { id: 'J-202', description: 'Low Zone Downtown Core', x: 300, y: 500, elevation: 640, baseDemand: 250, demandPatternId: 'Pat-Com' },
    { id: 'J-203', description: 'Low Zone Commercial Jct', x: 700, y: 500, elevation: 650, baseDemand: 220, demandPatternId: 'Pat-Com' },
    { id: 'J-204', description: 'Low Zone South Jct', x: 300, y: 350, elevation: 630, baseDemand: 140, demandPatternId: 'Pat-Res' },
    { id: 'J-205', description: 'Low Zone East Jct', x: 700, y: 350, elevation: 645, baseDemand: 160, demandPatternId: 'Pat-Res' },
    { id: 'J-206', description: 'River Pump Discharge', x: 700, y: 200, elevation: 655, baseDemand: 0 }
  ],
  pumps: [
    { id: 'Pump-River', description: 'River Booster Pump', fromNode: 'Res-River', toNode: 'J-206', headCurveId: 'WELL-PUMP', power: 60, speed: 1.0, status: 'OPEN' }
  ],
  valves: [
    { id: 'PRV-1', description: 'Pressure Reducing Valve (High to Low)', fromNode: 'J-103', toNode: 'J-201', diameter: 12, valveType: 'PRV', setting: 55, minorLoss: 0.5, status: 'OPEN' }
  ],
  pipes: [
    { id: 'P-1', fromNode: 'Res-HighZone', toNode: 'J-101', length: 3000, diameter: 18, roughness: 120, minorLoss: 0, status: 'OPEN' },
    { id: 'P-2', fromNode: 'J-101', toNode: 'J-102', length: 4000, diameter: 16, roughness: 120, minorLoss: 0, status: 'OPEN' },
    { id: 'P-3', fromNode: 'J-102', toNode: 'J-103', length: 2500, diameter: 14, roughness: 115, minorLoss: 0, status: 'OPEN' },
    { id: 'P-4', fromNode: 'J-201', toNode: 'J-202', length: 3500, diameter: 12, roughness: 110, minorLoss: 0, status: 'OPEN' },
    { id: 'P-5', fromNode: 'J-201', toNode: 'J-203', length: 3500, diameter: 12, roughness: 110, minorLoss: 0, status: 'OPEN' },
    { id: 'P-6', fromNode: 'J-202', toNode: 'J-204', length: 3000, diameter: 10, roughness: 100, minorLoss: 0, status: 'OPEN' },
    { id: 'P-7', fromNode: 'J-203', toNode: 'J-205', length: 3000, diameter: 10, roughness: 100, minorLoss: 0, status: 'OPEN' },
    { id: 'P-8', fromNode: 'J-204', toNode: 'Tank-West', length: 1500, diameter: 12, roughness: 120, minorLoss: 0, status: 'OPEN' },
    { id: 'P-9', fromNode: 'J-204', toNode: 'J-205', length: 5000, diameter: 10, roughness: 100, minorLoss: 0, status: 'OPEN' },
    { id: 'P-10', fromNode: 'J-206', toNode: 'J-205', length: 2500, diameter: 14, roughness: 120, minorLoss: 0, status: 'OPEN' }
  ]
};

/**
 * Net3: Municipal multi-tank looped network
 */
export const net3Project: EpanetProject = {
  title: 'EPA Net3 Municipal Multi-Source Network',
  notes: 'Large looped metropolitan water network with 2 treatment plants, 2 storage tanks, and industrial demand.',
  options: {
    flowUnits: 'MGD',
    headlossFormula: 'H-W',
    specificGravity: 1.0,
    relativeViscosity: 1.0,
    durationHours: 24,
    hydraulicTimestepHours: 1,
    qualityType: 'CHEMICAL',
    qualityChemicalName: 'Chlorine',
    chemicalUnits: 'mg/L'
  },
  patterns: [
    {
      id: 'Pat-Metro',
      description: 'Metro 24h demand',
      multipliers: [0.6, 0.5, 0.4, 0.5, 0.8, 1.2, 1.6, 1.7, 1.5, 1.3, 1.2, 1.3, 1.3, 1.2, 1.2, 1.3, 1.5, 1.7, 1.6, 1.3, 1.1, 0.9, 0.8, 0.7]
    }
  ],
  curves: [
    {
      id: 'CURVE-MAIN',
      type: 'PUMP',
      points: [{ x: 0, y: 250 }, { x: 5, y: 210 }, { x: 10, y: 130 }]
    }
  ],
  controls: [],
  reservoirs: [
    { id: 'WTP-North', description: 'North Water Treatment Plant', x: 200, y: 850, totalHead: 300 },
    { id: 'WTP-South', description: 'South River Intake', x: 800, y: 150, totalHead: 240 }
  ],
  tanks: [
    { id: 'Tank-1', description: 'North Hill Tank', x: 500, y: 850, elevation: 280, initLevel: 22, minLevel: 8, maxLevel: 35, diameter: 60 },
    { id: 'Tank-2', description: 'Industrial Park Tank', x: 800, y: 600, elevation: 250, initLevel: 18, minLevel: 6, maxLevel: 30, diameter: 50 }
  ],
  junctions: [
    { id: 'J-1', x: 200, y: 600, elevation: 180, baseDemand: 1.2, demandPatternId: 'Pat-Metro' },
    { id: 'J-2', x: 350, y: 600, elevation: 190, baseDemand: 1.8, demandPatternId: 'Pat-Metro' },
    { id: 'J-3', x: 500, y: 600, elevation: 195, baseDemand: 2.2, demandPatternId: 'Pat-Metro' },
    { id: 'J-4', x: 650, y: 600, elevation: 200, baseDemand: 1.5, demandPatternId: 'Pat-Metro' },
    { id: 'J-5', x: 200, y: 350, elevation: 160, baseDemand: 0.9, demandPatternId: 'Pat-Metro' },
    { id: 'J-6', x: 350, y: 350, elevation: 175, baseDemand: 1.4, demandPatternId: 'Pat-Metro' },
    { id: 'J-7', x: 500, y: 350, elevation: 180, baseDemand: 2.0, demandPatternId: 'Pat-Metro' },
    { id: 'J-8', x: 650, y: 350, elevation: 190, baseDemand: 1.1, demandPatternId: 'Pat-Metro' },
    { id: 'J-9', x: 500, y: 150, elevation: 150, baseDemand: 0.8, demandPatternId: 'Pat-Metro' }
  ],
  pumps: [
    { id: 'Pump-1', description: 'North Booster Pump', fromNode: 'WTP-North', toNode: 'J-1', headCurveId: 'CURVE-MAIN', power: 120, speed: 1.0, status: 'OPEN' },
    { id: 'Pump-2', description: 'South High Lift Pump', fromNode: 'WTP-South', toNode: 'J-9', headCurveId: 'CURVE-MAIN', power: 100, speed: 1.0, status: 'OPEN' }
  ],
  valves: [],
  pipes: [
    { id: 'P-1', fromNode: 'J-1', toNode: 'J-2', length: 4500, diameter: 24, roughness: 130, minorLoss: 0, status: 'OPEN' },
    { id: 'P-2', fromNode: 'J-2', toNode: 'J-3', length: 4500, diameter: 24, roughness: 130, minorLoss: 0, status: 'OPEN' },
    { id: 'P-3', fromNode: 'J-3', toNode: 'J-4', length: 4500, diameter: 20, roughness: 120, minorLoss: 0, status: 'OPEN' },
    { id: 'P-4', fromNode: 'J-4', toNode: 'Tank-2', length: 2500, diameter: 16, roughness: 120, minorLoss: 0, status: 'OPEN' },
    { id: 'P-5', fromNode: 'J-3', toNode: 'Tank-1', length: 2500, diameter: 20, roughness: 130, minorLoss: 0, status: 'OPEN' },
    { id: 'P-6', fromNode: 'J-1', toNode: 'J-5', length: 5000, diameter: 18, roughness: 110, minorLoss: 0, status: 'OPEN' },
    { id: 'P-7', fromNode: 'J-2', toNode: 'J-6', length: 5000, diameter: 16, roughness: 110, minorLoss: 0, status: 'OPEN' },
    { id: 'P-8', fromNode: 'J-3', toNode: 'J-7', length: 5000, diameter: 20, roughness: 120, minorLoss: 0, status: 'OPEN' },
    { id: 'P-9', fromNode: 'J-4', toNode: 'J-8', length: 5000, diameter: 16, roughness: 110, minorLoss: 0, status: 'OPEN' },
    { id: 'P-10', fromNode: 'J-5', toNode: 'J-6', length: 4500, diameter: 16, roughness: 110, minorLoss: 0, status: 'OPEN' },
    { id: 'P-11', fromNode: 'J-6', toNode: 'J-7', length: 4500, diameter: 16, roughness: 110, minorLoss: 0, status: 'OPEN' },
    { id: 'P-12', fromNode: 'J-7', toNode: 'J-8', length: 4500, diameter: 16, roughness: 110, minorLoss: 0, status: 'OPEN' },
    { id: 'P-13', fromNode: 'J-9', toNode: 'J-7', length: 4000, diameter: 20, roughness: 125, minorLoss: 0, status: 'OPEN' },
    { id: 'P-14', fromNode: 'J-9', toNode: 'J-8', length: 4500, diameter: 18, roughness: 120, minorLoss: 0, status: 'OPEN' }
  ]
};

export const sampleNetworks: Record<string, EpanetProject> = {
  'net1': net1Project,
  'net2': net2Project,
  'net3': net3Project,
};
