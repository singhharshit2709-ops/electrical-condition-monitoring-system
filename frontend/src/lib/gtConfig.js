import axios from "axios";

/** Single plant for G Tank ECM — must match backend machine_config.json plants.GT */
export const PLANT_ID = "GT";

export const PLANT_LABEL = "Neutral Glass — G Tank Electrical Condition Monitoring";

/** Build /config/{plant}/{machine} URL with encoded path segments (spaces in area names). */
export function configMachineUrl(apiBase, plantId, machineId) {
  const base = apiBase.replace(/\/$/, "");
  return `${base}/config/${encodeURIComponent(plantId)}/${encodeURIComponent(machineId)}`;
}

/** Load area (machine) ids from backend — single source of truth with machine_config.json */
export async function fetchGtAreas(apiBase) {
  const base = apiBase.replace(/\/$/, "");
  const res = await axios.get(`${base}/config/plants`);
  const machines = res.data?.[PLANT_ID]?.machines;
  if (!machines || typeof machines !== "object") {
    return [];
  }
  return Object.keys(machines);
}

/** Fallback if API unavailable — mirrors machine_config.json GT machines (v3.0.0) */
export const GT_AREAS_FALLBACK = [
  "G1",
  "G2",
  "G3",
  "Furnace Cooling Blower",
  "Mold Cooling Blower",
  "Combustion Blower",
  "Block Air Fan",
  "Injector Blower",
  "Electrode Cooling Blower",
  "Electrode Water Pump",
];
