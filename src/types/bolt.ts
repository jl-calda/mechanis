export type BoltGrade = "A325" | "A490";
export type ConnectionType = "bearing" | "slip-critical";
export type HoleType = "standard" | "oversized" | "short-slot" | "long-slot";
export type ThreadCondition = "included" | "excluded";

export interface BoltInput {
  grade: BoltGrade;
  diameter: number; // in
  connectionType: ConnectionType;
  holeType: HoleType;
  threadCondition: ThreadCondition;
  numRows: number;
  numCols: number;
  gage: number; // in, transverse spacing
  pitch: number; // in, longitudinal spacing
  edgeDistVert: number; // in
  edgeDistHoriz: number; // in
  plateThickness: number; // in
  plateFu: number; // ksi
  numShearPlanes: number;
}

export interface BoltResult {
  shearCapacityPerBolt: number; // kips
  bearingCapacityPerBolt: number; // kips
  tearoutCapacityPerBolt: number; // kips
  groupCapacity: number; // kips
  controllingCapacity: number; // kips
  controllingMode: string;
  edgeDistanceCheck: { passes: boolean; minimum: number; provided: number };
  spacingCheck: { passes: boolean; minimum: number; provided: number };
  numBolts: number;
}
