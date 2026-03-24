// ─── Bridge protocol ───────────────────────────────────────────────

export interface BridgeRequest {
  id: string;
  method: string;
  params: Record<string, unknown>;
}

export interface BridgeResponse {
  id: string;
  result?: unknown;
  error?: { code: number; message: string };
}

export interface BridgeEvent {
  event: string;
  data: unknown;
}

export type BridgeMessage = BridgeResponse | BridgeEvent;

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

// ─── STAAD domain ──────────────────────────────────────────────────

export interface StaadNode {
  id: number;
  x: number;
  y: number;
  z: number;
}

export interface StaadMember {
  id: number;
  startNode: number;
  endNode: number;
  profile?: string;
}

export interface StaadSupport {
  nodeId: number;
  type: "pinned" | "fixed" | "roller";
}

export interface StaadLoadCase {
  id: number;
  name: string;
}

export interface StaadPointLoad {
  caseId: number;
  nodeId: number;
  fx: number;
  fy: number;
  fz: number;
  mx: number;
  my: number;
  mz: number;
}

export interface StaadMemberLoad {
  caseId: number;
  memberId: number;
  type: "uniform" | "concentrated";
  direction: "GY" | "GX" | "GZ" | "X" | "Y" | "Z";
  value: number;
  position?: number;
}

// ─── STAAD model (aggregate) ───────────────────────────────────────

export interface StaadModel {
  nodes: StaadNode[];
  members: StaadMember[];
  supports: StaadSupport[];
  loadCases: StaadLoadCase[];
  pointLoads: StaadPointLoad[];
  memberLoads: StaadMemberLoad[];
}

// ─── Analysis results ──────────────────────────────────────────────

export interface NodeDisplacement {
  nodeId: number;
  loadCase: number;
  dx: number;
  dy: number;
  dz: number;
  rx: number;
  ry: number;
  rz: number;
}

export interface MemberForce {
  memberId: number;
  loadCase: number;
  station: number;
  axial: number;
  shearY: number;
  shearZ: number;
  torsion: number;
  momentY: number;
  momentZ: number;
}

export interface AnalysisResults {
  nodeDisplacements: NodeDisplacement[];
  memberForces: MemberForce[];
}

// ─── STAAD page state ──────────────────────────────────────────────

export interface StaadState {
  connectionStatus: ConnectionStatus;
  fileName: string | null;
  error: string | null;
  model: StaadModel;
  analysisRunning: boolean;
  results: AnalysisResults | null;
}
