export type ToolType =
  | "select"
  | "point"
  | "line"
  | "rectangle"
  | "polyline"
  | "circle"
  | "ellipse"
  | "dimension"
  | "trim"
  | "fillet"
  | "offset"
  | "pan"
  | "region-pick";

export interface Point2D {
  x: number;
  y: number;
}

// --- Entity types ---

interface CadEntityBase {
  id: string;
  type: string;
  stroke: string;
  strokeWidth: number;
  locked: boolean;
  lockedHandles?: number[]; // indices of handles that are pinned in place
}

export interface PointEntity extends CadEntityBase {
  type: "point";
  position: Point2D;
}

export interface LineEntity extends CadEntityBase {
  type: "line";
  start: Point2D;
  end: Point2D;
  thickness: number; // weld throat in inches
}

export interface RectEntity extends CadEntityBase {
  type: "rectangle";
  origin: Point2D;
  width: number;
  height: number;
}

export interface PolylineEntity extends CadEntityBase {
  type: "polyline";
  points: Point2D[];
  closed: boolean;
  thickness: number;
}

export interface CircleEntity extends CadEntityBase {
  type: "circle";
  center: Point2D;
  radius: number;
}

export interface EllipseEntity extends CadEntityBase {
  type: "ellipse";
  center: Point2D;
  rx: number;
  ry: number;
}

export interface DimensionEntity extends CadEntityBase {
  type: "dimension";
  dimType?: "linear" | "radius" | "angle" | "arc-length";
  startPt: Point2D;
  endPt: Point2D;
  offset: number;
  labelOverride: string | null;
  // arc/angle dimensions: arc geometry
  arcCenter?: Point2D;
  arcRadius?: number;
  arcStartAngle?: number;
  arcEndAngle?: number;
}

export interface ArcEntity extends CadEntityBase {
  type: "arc";
  center: Point2D;
  radius: number;
  startAngle: number; // radians
  endAngle: number;   // radians
  /** IDs of the two lines this fillet connects (set when created via fillet tool) */
  filletLineIds?: [string, string];
}

export type CadEntity =
  | PointEntity
  | LineEntity
  | RectEntity
  | PolylineEntity
  | CircleEntity
  | EllipseEntity
  | DimensionEntity
  | ArcEntity;

// --- Closed region ---

export interface ClosedRegion {
  id: string;
  boundary: Point2D[];
  area: number;
  centroid: Point2D;
  Ix: number;
  Iy: number;
  source: "auto" | "manual";
  sign: "add" | "subtract";
}

// --- Computed results ---

export interface SectionResult {
  totalArea: number;
  centroid: Point2D;
  Ix: number;
  Iy: number;
  Sx_top: number;
  Sx_bot: number;
  Sy_left: number;
  Sy_right: number;
  Zx: number;
  Zy: number;
  rx: number;
  ry: number;
}

export interface WeldGroupResult {
  totalLength: number;
  centroid: Point2D;
  Ix: number;
  Iy: number;
  Ip: number;
  maxDistance: number;
}

export interface BoltGroupResult {
  numBolts: number;
  centroid: Point2D;
  Ix: number;
  Iy: number;
  Ip: number;
  maxDistance: number;
}

// --- Draw state (in-progress drawing) ---

export interface DrawState {
  points: Point2D[];
}

// --- Viewport ---

export interface Viewport {
  panX: number;
  panY: number;
  zoom: number;
}

export interface GridSettings {
  size: number;
  snap: boolean;
  visible: boolean;
}

// --- CAD state ---

export interface CadState {
  entities: CadEntity[];
  selectedIds: string[];
  activeTool: ToolType;
  history: CadEntity[][];
  historyIndex: number;
  viewport: Viewport;
  grid: GridSettings;
  regions: ClosedRegion[];
  drawState: DrawState | null;
}
