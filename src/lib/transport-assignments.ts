import {
  findTransportRouteForStudent,
  normalizeStudent,
  resolveTransportFeeForStudent,
  resolveTransportFeeShift,
  studentNeedsTransport,
  type ClassConfig,
  type FeeTerm,
  type Student,
  type TransportFeeShift,
  type TransportRoute,
  type TransportVehicle,
} from "@/lib/tenant-store";

export type TransportAssignmentDraft = {
  studentId: string;
  assigned: boolean;
  busPoint1: string;
  busPoint2: string;
  transportShift: TransportFeeShift;
};

/** Classic Indian plate: KL-07-AB-4521 (hyphens/spaces optional). */
const CLASSIC_VEHICLE_REG =
  /^([A-Z]{2})[-\s]?([0-9]{1,2})[-\s]?([A-Z]{1,3})[-\s]?([0-9]{1,4})$/i;
/** Bharat series: 22-BH-1234-AB */
const BHARAT_VEHICLE_REG =
  /^([0-9]{2})[-\s]?(BH)[-\s]?([0-9]{4})[-\s]?([A-Z]{1,2})$/i;

/** Normalize a plate to `KL-07-AB-4521` / `22-BH-1234-AB`, or null if invalid. */
export function normalizeVehicleRegistrationNo(raw: string): string | null {
  const cleaned = raw.trim().toUpperCase().replace(/[./_]+/g, "-").replace(/\s+/g, "-");
  if (!cleaned) return null;
  const classic = cleaned.match(CLASSIC_VEHICLE_REG);
  if (classic) {
    return `${classic[1]}-${classic[2].padStart(2, "0")}-${classic[3]}-${classic[4]}`;
  }
  const bharat = cleaned.match(BHARAT_VEHICLE_REG);
  if (bharat) {
    return `${bharat[1]}-${bharat[2]}-${bharat[3]}-${bharat[4]}`;
  }
  return null;
}

export function isValidVehicleRegistrationNo(raw: string): boolean {
  return normalizeVehicleRegistrationNo(raw) !== null;
}

/** Compact key for uniqueness checks (ignores hyphens/spaces/case). */
export function vehicleRegistrationKey(raw: string): string {
  const normalized = normalizeVehicleRegistrationNo(raw);
  const source = normalized ?? raw.trim().toUpperCase();
  return source.replace(/[\s\-./_]+/g, "");
}

export const VEHICLE_REGISTRATION_FORMAT_HINT = "Format: KL-07-AB-4521";


export function stopsForVehicle(
  vehicle: TransportVehicle | undefined,
  routes: TransportRoute[],
): { pickups: string[]; drops: string[] } {
  const scoped =
    vehicle && vehicle.routeIds.length > 0
      ? routes.filter((route) => vehicle.routeIds.includes(route.id))
      : routes;
  const pickups = Array.from(
    new Set(scoped.map((r) => r.mapFrom.trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  const drops = Array.from(
    new Set(scoped.map((r) => r.mapTo.trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  return { pickups, drops: drops.length > 0 ? drops : pickups };
}

export function studentsOnVehicle(students: Student[], vehicleId: string): Student[] {
  const id = vehicleId.trim();
  if (!id) return [];
  return students.filter(
    (s) => !s.deletedAt && s.vehicleId === id && studentNeedsTransport(s),
  );
}

export function vehicleAssignedCount(students: Student[], vehicleId: string): number {
  return studentsOnVehicle(students, vehicleId).length;
}

export function transportShiftLabel(shift: TransportFeeShift): string {
  if (shift === "morning") return "Morning";
  if (shift === "evening") return "Evening";
  return "Both";
}

export function assignmentFareForStudent(
  student: Pick<
    Student,
    | "needsBus"
    | "busPoint1"
    | "busPoint2"
    | "vehicleId"
    | "transportShift"
    | "cls"
    | "hasConcession"
    | "concessionFees"
  >,
  routes: TransportRoute[],
  vehicles: TransportVehicle[],
  classConfig?: Pick<ClassConfig, "vehicleFeeAmount">,
  feeTerms: FeeTerm[] = [],
): number | undefined {
  return resolveTransportFeeForStudent(
    student,
    routes,
    classConfig,
    undefined,
    feeTerms,
    vehicles,
  ).amount;
}

/** Build the student patch for assigning/unassigning on a specific bus. */
export function applyVehicleAssignment(
  student: Student,
  vehicleId: string,
  draft: Omit<TransportAssignmentDraft, "studentId">,
): Student {
  if (!draft.assigned) {
    const clearingThisBus = !student.vehicleId || student.vehicleId === vehicleId;
    if (!clearingThisBus) return student;
    // needsBus:false is the clear signal — apiUpsertStudent sends null transport fields
    // (JSON drops undefined, which left vehicle_id stuck in the DB).
    return normalizeStudent({
      ...student,
      needsBus: false,
      vehicleId: undefined,
      transportShift: undefined,
      busPoint1: undefined,
      busPoint2: undefined,
    });
  }

  const shift =
    draft.transportShift === "morning" ||
    draft.transportShift === "evening" ||
    draft.transportShift === "both"
      ? draft.transportShift
      : resolveTransportFeeShift({
          busPoint1: draft.busPoint1,
          busPoint2: draft.busPoint2,
        });

  return normalizeStudent({
    ...student,
    needsBus: true,
    vehicleId,
    busPoint1: draft.busPoint1.trim() || undefined,
    busPoint2: draft.busPoint2.trim() || undefined,
    transportShift: shift,
  });
}

export function draftFromStudent(
  student: Student,
  vehicleId: string,
): TransportAssignmentDraft {
  const assigned = student.vehicleId === vehicleId;
  return {
    studentId: student.id,
    assigned,
    busPoint1: assigned ? (student.busPoint1 ?? "") : "",
    busPoint2: assigned ? (student.busPoint2 ?? "") : "",
    transportShift: assigned
      ? resolveTransportFeeShift(student)
      : "both",
  };
}

export function routeLabelForStudent(
  student: Pick<Student, "needsBus" | "busPoint1" | "busPoint2" | "vehicleId">,
  routes: TransportRoute[],
  vehicles: TransportVehicle[],
): string {
  const route = findTransportRouteForStudent(student, routes, vehicles);
  if (!route) return "—";
  return `${route.mapFrom} → ${route.mapTo}`;
}
