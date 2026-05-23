import { useState, useEffect } from "react";
import axios from "axios";
import { Camera, XCircle, Check } from "@phosphor-icons/react";

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const API = BACKEND_URL;

const PLANT_ID = "GT";
const PLANT_LABEL = "Neutral Glass — G Tank Electrical Condition Monitoring";

const AREA_CONFIG = {
  GT: [
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
  ],
};

const BulkEntry = () => {
  const [selectedPlant, setSelectedPlant] = useState(PLANT_ID);
  const [selectedMachine, setSelectedMachine] = useState("");
  const [machineConfig, setMachineConfig] = useState(null);
  const [readings, setReadings] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [technician, setTechnician] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedPlant && selectedMachine) {
      fetchMachineConfig();
    }
  }, [selectedPlant, selectedMachine]);

  const fetchMachineConfig = async () => {
    try {
      const response = await axios.get(
        `${API}/config/${selectedPlant}/${selectedMachine}`
      );
      const motors = Array.isArray(response.data.motors)
        ? response.data.motors
        : Object.keys(response.data.motors || {});
      setMachineConfig({ ...response.data, motors });

      const motorLimits = response.data.motor_limits || response.data.motors || {};

      const initialReadings = {};
      motors.forEach((motor) => {
        const limits = motorLimits[motor] || {};
        initialReadings[motor] = {
          current: "",
          temperature: "",
          vibration: "",
          normal_current: String(limits.normal_current ?? 12),
          warning_current: String(limits.warning_current ?? 15),
          normal_temperature: String(limits.normal_temperature ?? 55),
          warning_temperature: String(limits.warning_temperature ?? 70),
          normal_vibration: String(limits.normal_vibration ?? 4.5),
          warning_vibration: String(limits.warning_vibration ?? 7.0),
        };
      });
      setReadings(initialReadings);
    } catch (e) {
      console.error("Error fetching config:", e);
    }
  };

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result);
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleValueChange = (motor, field, value) => {
    setReadings((prev) => ({
      ...prev,
      [motor]: {
        ...prev[motor],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const bulkData = {
        plant: selectedPlant,
        machine: selectedMachine,
        readings: Object.entries(readings).map(([motor, values]) => ({
          motor,
          current: values.current === "" ? null : Number(values.current),
          temperature: values.temperature === "" ? null : Number(values.temperature),
          vibration: values.vibration === "" ? null : Number(values.vibration),
          normal_current: values.normal_current === "" ? null : Number(values.normal_current),
          warning_current: values.warning_current === "" ? null : Number(values.warning_current),
          normal_temperature: values.normal_temperature === "" ? null : Number(values.normal_temperature),
          warning_temperature: values.warning_temperature === "" ? null : Number(values.warning_temperature),
          normal_vibration: values.normal_vibration === "" ? null : Number(values.normal_vibration),
          warning_vibration: values.warning_vibration === "" ? null : Number(values.warning_vibration),
        })),
        technician,
        photo_base64: photoBase64,
        entry_source: "Field",
      };

      await axios.post(`${API}/condition-monitoring/bulk`, bulkData);

      alert("All readings submitted successfully.");

      setSelectedMachine("");
      setMachineConfig(null);
      setReadings({});
      setPhotoPreview(null);
      setPhotoBase64(null);
      setTechnician("");
    } catch (error) {
      console.error("Bulk submit error:", error);
      alert("Failed to submit readings: " + (error.response?.data?.detail || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const hasParameters = (param) => machineConfig?.parameters?.includes(param);

  return (
    <div className="w-full max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-4xl font-light tracking-tight text-zinc-950">Bulk Reading Entry</h1>
        <p className="text-sm font-medium text-zinc-800 mt-1">Neutral Glass</p>
        <p className="text-sm text-zinc-600 mt-0.5">G Tank Electrical Condition Monitoring</p>
        <p className="text-sm text-zinc-700 mt-2">
          Enter current, temperature, and vibration for all equipment in an area
        </p>
      </div>

      <div className="border border-zinc-200 bg-white p-6 mb-6">
        <h3 className="text-lg font-medium tracking-tight text-zinc-900 mb-4">Select Area</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-zinc-500 mb-2 block">
              Plant *
            </label>
            <select
              value={selectedPlant}
              onChange={(e) => {
                setSelectedPlant(e.target.value);
                setSelectedMachine("");
                setMachineConfig(null);
              }}
              className="w-full border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#002FA7] focus:ring-offset-2 rounded-none"
            >
              <option value={PLANT_ID}>{PLANT_LABEL}</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-zinc-500 mb-2 block">
              Area / Line *
            </label>
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              className="w-full border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#002FA7] focus:ring-offset-2 rounded-none"
            >
              <option value="">Select area</option>
              {AREA_CONFIG[selectedPlant]?.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {machineConfig && (
        <form onSubmit={handleSubmit}>
          <div className="border border-zinc-200 bg-white p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium tracking-tight text-zinc-900">
                  {selectedMachine} — {machineConfig.motors.length} equipment
                </h3>
                <p className="text-sm text-zinc-600 mt-1">
                  Parameters: {machineConfig.parameters.map((p) => p.toUpperCase()).join(", ")}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50">
                  <tr className="border-b-2 border-zinc-200">
                    <th className="text-left px-4 py-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-zinc-500 sticky left-0 bg-zinc-50">
                      Equipment
                    </th>
                    {hasParameters("current") && (
                      <>
                        <th className="text-center px-4 py-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-zinc-500">Current (A) *</th>
                        <th className="text-center px-4 py-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-zinc-400">Normal</th>
                        <th className="text-center px-4 py-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-zinc-400">Warning</th>
                      </>
                    )}
                    {hasParameters("temperature") && (
                      <>
                        <th className="text-center px-4 py-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-zinc-500">Temp (°C) *</th>
                        <th className="text-center px-4 py-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-zinc-400">Normal</th>
                        <th className="text-center px-4 py-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-zinc-400">Warning</th>
                      </>
                    )}
                    {hasParameters("vibration") && (
                      <>
                        <th className="text-center px-4 py-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-zinc-500">Vibration (mm/s) *</th>
                        <th className="text-center px-4 py-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-zinc-400">Normal</th>
                        <th className="text-center px-4 py-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-zinc-400">Warning</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(machineConfig.motors || []).map((motor, idx) => (
                    <tr key={motor} className={`border-b border-zinc-100 ${idx % 2 === 0 ? "bg-white" : "bg-zinc-50/50"}`}>
                      <td className="px-4 py-2 text-sm font-medium text-zinc-950 sticky left-0 bg-inherit">{motor}</td>
                      {hasParameters("current") && (
                        <>
                          <td className="px-4 py-2">
                            <input type="number" step="0.01" value={readings[motor]?.current || ""} onChange={(e) => handleValueChange(motor, "current", e.target.value)} className="w-24 border border-zinc-200 px-2 py-1 text-sm font-mono text-center rounded-none focus:ring-1 focus:ring-[#002FA7]" placeholder="0.00" required />
                          </td>
                          <td className="px-4 py-2">
                            <input type="number" step="0.1" value={readings[motor]?.normal_current || ""} onChange={(e) => handleValueChange(motor, "normal_current", e.target.value)} className="w-20 border border-zinc-200 px-2 py-1 text-xs font-mono text-center rounded-none bg-zinc-50" />
                          </td>
                          <td className="px-4 py-2">
                            <input type="number" step="0.1" value={readings[motor]?.warning_current || ""} onChange={(e) => handleValueChange(motor, "warning_current", e.target.value)} className="w-20 border border-zinc-200 px-2 py-1 text-xs font-mono text-center rounded-none bg-zinc-50" />
                          </td>
                        </>
                      )}
                      {hasParameters("temperature") && (
                        <>
                          <td className="px-4 py-2">
                            <input type="number" step="0.1" value={readings[motor]?.temperature || ""} onChange={(e) => handleValueChange(motor, "temperature", e.target.value)} className="w-24 border border-zinc-200 px-2 py-1 text-sm font-mono text-center rounded-none focus:ring-1 focus:ring-[#002FA7]" placeholder="0.0" required />
                          </td>
                          <td className="px-4 py-2">
                            <input type="number" step="1" value={readings[motor]?.normal_temperature || ""} onChange={(e) => handleValueChange(motor, "normal_temperature", e.target.value)} className="w-20 border border-zinc-200 px-2 py-1 text-xs font-mono text-center rounded-none bg-zinc-50" />
                          </td>
                          <td className="px-4 py-2">
                            <input type="number" step="1" value={readings[motor]?.warning_temperature || ""} onChange={(e) => handleValueChange(motor, "warning_temperature", e.target.value)} className="w-20 border border-zinc-200 px-2 py-1 text-xs font-mono text-center rounded-none bg-zinc-50" />
                          </td>
                        </>
                      )}
                      {hasParameters("vibration") && (
                        <>
                          <td className="px-4 py-2">
                            <input type="number" step="0.1" value={readings[motor]?.vibration || ""} onChange={(e) => handleValueChange(motor, "vibration", e.target.value)} className="w-24 border border-zinc-200 px-2 py-1 text-sm font-mono text-center rounded-none focus:ring-1 focus:ring-[#002FA7]" placeholder="0.0" required />
                          </td>
                          <td className="px-4 py-2">
                            <input type="number" step="0.1" value={readings[motor]?.normal_vibration || ""} onChange={(e) => handleValueChange(motor, "normal_vibration", e.target.value)} className="w-20 border border-zinc-200 px-2 py-1 text-xs font-mono text-center rounded-none bg-zinc-50" />
                          </td>
                          <td className="px-4 py-2">
                            <input type="number" step="0.1" value={readings[motor]?.warning_vibration || ""} onChange={(e) => handleValueChange(motor, "warning_vibration", e.target.value)} className="w-20 border border-zinc-200 px-2 py-1 text-xs font-mono text-center rounded-none bg-zinc-50" />
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border border-zinc-200 bg-white p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3 block">
                  Verification photo (if any alarm/warning)
                </label>
                {!photoPreview ? (
                  <label className="flex items-center space-x-2 px-4 py-3 border-2 border-dashed border-zinc-300 hover:border-[#002FA7] bg-white cursor-pointer transition-all duration-150 rounded-none">
                    <Camera size={20} weight="bold" className="text-[#002FA7]" />
                    <span className="text-sm text-zinc-700">Capture / Upload Photo</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
                  </label>
                ) : (
                  <div className="relative inline-block">
                    <img src={photoPreview} alt="Preview" className="w-48 h-36 object-cover border-2 border-[#002FA7]" />
                    <button type="button" onClick={() => { setPhotoPreview(null); setPhotoBase64(null); }} className="absolute top-2 right-2 bg-[#E11D48] text-white p-1 hover:bg-[#E11D48]/90">
                      <XCircle size={16} weight="fill" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3 block">
                  Engineer&apos;s name *
                </label>
                <input type="text" value={technician} onChange={(e) => setTechnician(e.target.value)} placeholder="Enter your name" className="w-full border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#002FA7] focus:ring-offset-2 rounded-none" required />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={() => { setSelectedMachine(""); setMachineConfig(null); }} className="border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 px-6 py-3 text-sm font-medium tracking-tight transition-all duration-150 ease-out rounded-none">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="bg-[#16A34A] text-white hover:bg-[#16A34A]/90 px-8 py-3 text-sm font-medium tracking-tight transition-all duration-150 ease-out rounded-none disabled:opacity-50 flex items-center space-x-2">
              {submitting ? <span>Submitting...</span> : <><Check size={18} weight="bold" /><span>Submit all readings ({machineConfig.motors.length})</span></>}
            </button>
          </div>
        </form>
      )}

      {!machineConfig && selectedMachine && (
        <div className="border border-zinc-200 bg-white p-12 text-center">
          <p className="text-zinc-500">Loading area configuration...</p>
        </div>
      )}

      {!selectedMachine && (
        <div className="border border-zinc-200 bg-white p-12 text-center">
          <p className="text-zinc-500">Select an area to start bulk entry</p>
        </div>
      )}
    </div>
  );
};

export default BulkEntry;
