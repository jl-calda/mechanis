export type WeldType = "fillet" | "CJP" | "PJP";
export type ElectrodeType = "E70XX" | "E80XX" | "E90XX";

export interface WeldInput {
  weldType: WeldType;
  electrodeType: ElectrodeType;
  weldSize: number; // in (leg size for fillet)
  weldLength: number; // in
  numberOfWelds: number;
  angle: number; // degrees, load angle to weld axis
  baseMetal1Fu: number; // ksi
  baseMetal1Thickness: number; // in
  baseMetal2Fu: number; // ksi
  baseMetal2Thickness: number; // in
}

export interface WeldResult {
  weldMetalCapacity: number; // kips
  baseMetalCapacity: number; // kips
  controllingCapacity: number; // kips
  controllingMode: string;
  effectiveThroat: number; // in
  capacityPerInch: number; // kips/in
  minimumWeldSize: number; // in
  maximumWeldSize: number; // in
  sizeCheck: boolean;
  lengthCheck: boolean;
}
