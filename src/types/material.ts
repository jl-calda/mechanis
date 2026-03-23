export interface MaterialGrade {
  id: string;
  specification: string;
  grade: string;
  displayName: string;
  Fy: number; // yield strength, ksi
  Fu: number; // tensile strength, ksi
  E: number; // modulus of elasticity, ksi
  G: number; // shear modulus, ksi
  density: number; // lb/in³
  nu: number; // Poisson's ratio
  alpha: number; // coeff of thermal expansion, x10⁻⁶/°F
  applicableShapes: string[];
  notes: string;
}
