// EPANET Data Types & Models

export type FlowUnit = 'GPM' | 'LPS' | 'MGD' | 'CFS' | 'MLD';
export type PressureUnit = 'PSI' | 'METERS' | 'KPA';
export type HeadlossFormula = 'H-W' | 'D-W' | 'C-M';
export type QualityType = 'NONE' | 'AGE' | 'CHEMICAL' | 'TRACE';

export interface Coordinates {
  x: number;
  y: number;
}

export interface Junction {
  id: string;
  description?: string;
  x: number;
  y: number;
  elevation: number; // ft or m
  baseDemand: number; // in flow units
  demandPatternId?: string;
  emitterCoeff?: number;
  initQuality?: number;
}

export interface Reservoir {
  id: string;
  description?: string;
  x: number;
  y: number;
  totalHead: number; // ft or m
  headPatternId?: string;
}

export interface Tank {
  id: string;
  description?: string;
  x: number;
  y: number;
  elevation: number; // bottom elevation
  initLevel: number; // initial water level above bottom
  minLevel: number;
  maxLevel: number;
  diameter: number; // ft or m
  minVolume?: number;
  volCurveId?: string;
}

export interface Pipe {
  id: string;
  description?: string;
  fromNode: string;
  toNode: string;
  length: number; // ft or m
  diameter: number; // inches or mm
  roughness: number; // Hazen-Williams C or roughness height
  minorLoss: number;
  status: 'OPEN' | 'CLOSED';
}

export interface Pump {
  id: string;
  description?: string;
  fromNode: string;
  toNode: string;
  headCurveId?: string;
  power?: number; // horsepower or kW
  speed?: number; // relative speed multiplier (default 1.0)
  status: 'OPEN' | 'CLOSED';
}

export interface Valve {
  id: string;
  description?: string;
  fromNode: string;
  toNode: string;
  diameter: number;
  valveType: 'PRV' | 'PSV' | 'PBV' | 'FCV' | 'TCV' | 'GPV';
  setting: number; // pressure (PSI/m) or flow (GPM/LPS)
  minorLoss: number;
  status: 'OPEN' | 'CLOSED';
}

export interface Pattern {
  id: string;
  description?: string;
  multipliers: number[];
}

export interface CurvePoint {
  x: number;
  y: number;
}

export interface Curve {
  id: string;
  type: 'PUMP' | 'EFFICIENCY' | 'VOLUME' | 'HEADLOSS';
  points: CurvePoint[];
}

export interface Control {
  id: string;
  text: string;
  linkId?: string;
  status?: 'OPEN' | 'CLOSED';
  nodeId?: string;
  condition?: 'ABOVE' | 'BELOW';
  value?: number;
  time?: number;
}

export interface SimulationOptions {
  flowUnits: FlowUnit;
  headlossFormula: HeadlossFormula;
  specificGravity: number;
  relativeViscosity: number;
  durationHours: number;
  hydraulicTimestepHours: number;
  qualityType: QualityType;
  qualityChemicalName?: string;
  chemicalUnits?: string;
  bulkReactionOrder?: number;
  wallReactionOrder?: number;
  globalBulkCoeff?: number;
  globalWallCoeff?: number;
  limitingPotential?: number;
  roughnessCorrelation?: number;
  traceNodeId?: string;
}

export interface EpanetProject {
  title: string;
  notes?: string;
  junctions: Junction[];
  reservoirs: Reservoir[];
  tanks: Tank[];
  pipes: Pipe[];
  pumps: Pump[];
  valves: Valve[];
  patterns: Pattern[];
  curves: Curve[];
  controls: Control[];
  options: SimulationOptions;
}

export interface NodeSimulationResult {
  demand: number;
  head: number;
  pressure: number;
  quality: number;
  waterLevel?: number; // for tanks
}

export interface LinkSimulationResult {
  flow: number; // positive = fromNode to toNode, negative = reverse
  velocity: number;
  headloss: number; // unit headloss
  status: 'OPEN' | 'CLOSED';
  frictionFactor: number;
  reactionRate: number;
  quality: number;
}

export interface TimestepResult {
  timeHours: number;
  nodes: Record<string, NodeSimulationResult>;
  links: Record<string, LinkSimulationResult>;
}

export interface PumpEnergyResult {
  pumpId: string;
  utilizationPct: number;
  avgEfficiencyPct: number;
  kwhPerMilGal: number;
  avgKw: number;
  peakKw: number;
  totalKwh: number;
  totalCost: number;
}

export interface SimulationResults {
  successful: boolean;
  message: string;
  timesteps: TimestepResult[];
  pumpEnergy: PumpEnergyResult[];
  maxPressureNode: { id: string; value: number; time: number };
  minPressureNode: { id: string; value: number; time: number };
  maxVelocityLink: { id: string; value: number; time: number };
  iterations: number;
  massBalanceErrorPct: number;
}

export type NodeTheme = 'elevation' | 'baseDemand' | 'pressure' | 'head' | 'quality';
export type LinkTheme = 'diameter' | 'length' | 'flow' | 'velocity' | 'headloss';

export type ToolMode =
  | 'select'
  | 'pan'
  | 'add_junction'
  | 'add_reservoir'
  | 'add_tank'
  | 'add_pipe'
  | 'add_pump'
  | 'add_valve'
  | 'delete';

export interface SelectedElement {
  type: 'junction' | 'reservoir' | 'tank' | 'pipe' | 'pump' | 'valve';
  id: string;
}
