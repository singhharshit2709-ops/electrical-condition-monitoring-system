import { useEffect, useState } from "react";
import axios from "axios";
import { GearSix, Warning } from "@phosphor-icons/react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL;

const Dashboard = () => {
  const [plantHealth, setPlantHealth] = useState([]);
  const [activeAlarms, setActiveAlarms] = useState([]);
  const [recentReadings, setRecentReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  const totalMotors = plantHealth.length;

const healthyMotors = plantHealth.filter(
  (m) => m.status === "Normal"
).length;

const warningMotors = plantHealth.filter(
  (m) => m.status === "Warning"
).length;

const criticalMotors = plantHealth.filter(
  (m) => m.status === "Alarm"
).length;

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
  try {
    const configResponse = await axios.get(
      `${BACKEND_URL}/config/A/A1`
    );

    const config = configResponse.data;

    const motors = Object.entries(config.motors).map(
  ([motorName, thresholds]) => ({
    motor: motorName,
    status: "Normal",
    thresholds
  })
);

    setPlantHealth(motors);

  } catch (e) {
    console.error("Dashboard fetch error:", e);
  } finally {
    setLoading(false);
  }
};

  const acknowledgeAlarm = async (alarmId) => {
  try {

    console.log("POSTING TO:", `${API}/acknowledge-alarm/${alarmId}`);

    const response = await axios.post(
      `${API}/acknowledge-alarm/${alarmId}`
    );

    console.log("POST SUCCESS:", response.data);

    await fetchData();

  } catch (e) {

    console.error("POST FAILED:", e);

  }
};

  const getStatusBadge = (status) => {
    if (!status) return null;
    const s = status.toLowerCase();
    if (s === "alarm" || s === "critical")
      return <span className="px-2 py-1 bg-[#E11D48] text-white text-xs font-bold uppercase tracking-wider">ALARM</span>;
    if (s === "warning")
      return <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold uppercase tracking-wider">WARNING</span>;
    return <span className="px-2 py-1 bg-[#16A34A] text-white text-xs font-bold uppercase tracking-wider">OK</span>;
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8">
        <div className="text-sm text-zinc-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-4xl font-light tracking-tight text-zinc-950">
          Neutral Glass - Instrumentation Dashboard
        </h1>
        <p className="text-sm text-zinc-700 mt-2">
          Real-time motor current monitoring and health analysis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">

        {/* ── Active Alarms / All Clear Banner ── */}
        {activeAlarms.length > 0 ? (
          <div className="col-span-1 md:col-span-12">
            <div className="border-2 border-[#E11D48] bg-red-50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Warning size={28} weight="fill" className="text-[#E11D48]" />
                <div>
                  <h3 className="text-xl font-medium tracking-tight text-[#E11D48]">
                    {activeAlarms.length} Active Alarm{activeAlarms.length > 1 ? "s" : ""} - Immediate Action Required
                  </h3>
                  <p className="text-sm text-red-700 mt-1">Motor current exceeding warning thresholds</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeAlarms.map((alarm, idx) => {
                  console.log(alarm);
                  return (
                    <div key={idx} className="bg-white border-2 border-red-300 p-4" data-testid="alarm-card">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-base font-medium text-zinc-950">
                            {alarm.plant} - {alarm.machine}
                          </p>
                          <p className="text-sm text-zinc-600 mt-1">{alarm.motor}</p>
                        </div>
                        <span className="px-2 py-1 bg-[#E11D48] text-white text-xs font-bold uppercase">
                          ALARM
                        </span>
                        <button
                          onClick={() => {
                            console.log("ACK CLICKED", alarm.id);
                            acknowledgeAlarm(alarm.id);
                          }}
                          className="mt-3 px-3 py-1 bg-zinc-900 text-white text-xs uppercase tracking-[0.2em]"
                        >
                          Acknowledge
                        </button>
                      </div>

                      <div className="mt-3 space-y-2">

                        {alarm.current !== "" && alarm.current !== null && alarm.current !== undefined && (
                          <div className="border-l-2 border-red-200 pl-3">
                            <p className="text-sm text-zinc-700">
                              <span className="font-bold">Current:</span>
                              <span className="font-mono text-[#E11D48] font-bold ml-2">
                                {alarm.current}A
                              </span>
                            </p>
                            <p className="text-xs text-zinc-600 mt-0.5">
                              <span>Normal:</span>
                              <span className="font-mono ml-1">
                                {alarm.normal_current !== "" ? `${alarm.normal_current}A` : "—"}
                              </span>
                              <span className="mx-2 text-zinc-400">|</span>
                              <span>Warning:</span>
                              <span className="font-mono ml-1">
                                {alarm.warning_current !== "" ? `${alarm.warning_current}A` : "—"}
                              </span>
                            </p>
                          </div>
                        )}

                        {alarm.temperature !== "" && alarm.temperature !== null && alarm.temperature !== undefined && (
                          <div className="border-l-2 border-red-200 pl-3">
                            <p className="text-sm text-zinc-700">
                              <span className="font-bold">Temperature:</span>
                              <span className="font-mono text-[#E11D48] font-bold ml-2">
                                {alarm.temperature}°C
                              </span>
                            </p>
                            <p className="text-xs text-zinc-600 mt-0.5">
                              <span>Normal:</span>
                              <span className="font-mono ml-1">
                                {alarm.normal_temperature !== "" ? `${alarm.normal_temperature}°C` : "—"}
                              </span>
                              <span className="mx-2 text-zinc-400">|</span>
                              <span>Warning:</span>
                              <span className="font-mono ml-1">
                                {alarm.warning_temperature !== "" ? `${alarm.warning_temperature}°C` : "—"}
                              </span>
                            </p>
                          </div>
                        )}

                        {alarm.i2t !== "" && alarm.i2t !== null && alarm.i2t !== undefined && (
                          <div className="border-l-2 border-red-200 pl-3">
                            <p className="text-sm text-zinc-700">
                              <span className="font-bold">I²t:</span>
                              <span className="font-mono text-[#E11D48] font-bold ml-2">
                                {alarm.i2t} A²s
                              </span>
                            </p>
                            <p className="text-xs text-zinc-600 mt-0.5">
                              <span>Normal:</span>
                              <span className="font-mono ml-1">
                                {alarm.normal_i2t !== "" ? `${alarm.normal_i2t}` : "—"}
                              </span>
                              <span className="mx-2 text-zinc-400">|</span>
                              <span>Warning:</span>
                              <span className="font-mono ml-1">
                                {alarm.warning_i2t !== "" ? `${alarm.warning_i2t}` : "—"}
                              </span>
                            </p>
                          </div>
                        )}

                        <p className="text-xs text-zinc-500 pt-2 border-t border-zinc-100">
                          {alarm.timestamp ? new Date(alarm.timestamp).toLocaleString() : ""}
                        </p>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="col-span-1 md:col-span-12">
            <div className="border-2 border-[#16A34A] bg-green-50 p-6">
              <div className="flex items-center space-x-3">
                <GearSix size={28} weight="fill" className="text-[#16A34A]" />
                <div>
                  <h3 className="text-xl font-medium tracking-tight text-[#16A34A]">All Systems Normal</h3>
                  <p className="text-sm text-green-700 mt-1">No active alarms - All motor currents within normal range</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Summary Cards ── */}
        <div className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-zinc-200 p-6 rounded-lg">
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500 mb-2">Total Motors</p>
            <h2 className="text-4xl font-light text-zinc-950">{totalMotors}</h2>
            <p className="text-sm text-zinc-500 mt-2">Across all plants</p>
          </div>
          <div className="bg-white border border-green-200 p-6 rounded-lg">
            <p className="text-sm uppercase tracking-[0.2em] text-green-700 mb-2">Healthy</p>
            <h2 className="text-4xl font-light text-green-700">{healthyMotors}</h2>
            <p className="text-sm text-green-600 mt-2">Running normally</p>
          </div>
          <div className="bg-white border border-yellow-200 p-6 rounded-lg">
            <p className="text-sm uppercase tracking-[0.2em] text-yellow-700 mb-2">Warning</p>
            <h2 className="text-4xl font-light text-yellow-700">{warningMotors}</h2>
            <p className="text-sm text-yellow-600 mt-2">Needs inspection</p>
          </div>
          <div className="bg-white border border-red-200 p-6 rounded-lg">
            <p className="text-sm uppercase tracking-[0.2em] text-red-700 mb-2">Critical</p>
            <h2 className="text-4xl font-light text-red-700">{criticalMotors}</h2>
            <p className="text-sm text-red-600 mt-2">Immediate action required</p>
          </div>
        </div>

        {/* ── Plant Health Overview ── */}
        <div className="col-span-1 md:col-span-12">
          <div className="border border-zinc-200 bg-white p-6">
            <h3 className="text-2xl font-light tracking-tight text-zinc-900 mb-6">Plant Health Overview</h3>
            {plantHealth.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plantHealth.map((plant) => (
                  <div
                    key={plant.plant}
                    className="border-l-4 border-[#002FA7] pl-6 py-4"
                    data-testid={`plant-health-${plant.plant}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-medium text-zinc-950">Plant {plant.plant}</h4>
                      <span className={`text-4xl font-mono font-light ${
                        plant.health_percent >= 90 ? "text-[#16A34A]" :
                        plant.health_percent >= 70 ? "text-yellow-700" :
                        "text-[#E11D48]"
                      }`}>
                        {plant.health_percent}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-[#16A34A]"></div>
                        <span className="text-zinc-600">OK: <span className="font-mono font-bold">{plant.ok}</span></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500"></div>
                        <span className="text-zinc-600">Warning: <span className="font-mono font-bold">{plant.warning}</span></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-[#E11D48]"></div>
                        <span className="text-zinc-600">Alarm: <span className="font-mono font-bold">{plant.alarm}</span></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-zinc-300"></div>
                        <span className="text-zinc-600">Total: <span className="font-mono font-bold">{plant.total}</span></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-zinc-500">No monitoring data available. Add readings from Condition Monitoring page.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Readings Table ── */}
        <div className="col-span-1 md:col-span-12">
          <div className="border border-zinc-200 bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-light tracking-tight text-zinc-900">Recent Readings</h3>
                <p className="text-sm text-zinc-500 mt-1">Latest motor data received from all plants</p>
              </div>
              <button
                onClick={fetchData}
                className="px-4 py-2 border border-[#002FA7] text-[#002FA7] text-sm font-medium hover:bg-[#002FA7] hover:text-white transition-colors duration-150"
              >
                Refresh
              </button>
            </div>

            {recentReadings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-zinc-200">
                      <th className="text-left py-3 px-4 text-xs uppercase tracking-[0.15em] text-zinc-500 font-medium">Timestamp</th>
                      <th className="text-left py-3 px-4 text-xs uppercase tracking-[0.15em] text-zinc-500 font-medium">Plant</th>
                      <th className="text-left py-3 px-4 text-xs uppercase tracking-[0.15em] text-zinc-500 font-medium">Machine</th>
                      <th className="text-left py-3 px-4 text-xs uppercase tracking-[0.15em] text-zinc-500 font-medium">Motor</th>
                      <th className="text-right py-3 px-4 text-xs uppercase tracking-[0.15em] text-zinc-500 font-medium">Current</th>
                      <th className="text-right py-3 px-4 text-xs uppercase tracking-[0.15em] text-zinc-500 font-medium">Temperature</th>
                      <th className="text-right py-3 px-4 text-xs uppercase tracking-[0.15em] text-zinc-500 font-medium">I²t</th>
                      <th className="text-center py-3 px-4 text-xs uppercase tracking-[0.15em] text-zinc-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReadings.map((reading, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-zinc-100 hover:bg-zinc-50 transition-colors duration-100 ${
                          idx % 2 === 0 ? "bg-white" : "bg-zinc-50/40"
                        }`}
                        data-testid="recent-reading-row"
                      >
                        <td className="py-3 px-4 font-mono text-xs text-zinc-500 whitespace-nowrap">
                          {reading.timestamp
                            ? new Date(reading.timestamp).toLocaleString("en-GB", {
                                day: "2-digit", month: "short", year: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })
                            : "—"}
                        </td>
                        <td className="py-3 px-4 text-zinc-800 font-medium">{reading.plant || "—"}</td>
                        <td className="py-3 px-4 text-zinc-700">{reading.machine || "—"}</td>
                        <td className="py-3 px-4 text-zinc-600 text-xs">{reading.motor || "—"}</td>
                        <td className="py-3 px-4 text-right font-mono font-medium">
                          {reading.current !== "" && reading.current !== null && reading.current !== undefined
                            ? <span className="text-zinc-900">{reading.current}A</span>
                            : <span className="text-zinc-400">—</span>}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium">
                          {reading.temperature !== "" && reading.temperature !== null && reading.temperature !== undefined
                            ? <span className="text-zinc-900">{reading.temperature}°C</span>
                            : <span className="text-zinc-400">—</span>}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-xs text-zinc-600">
                          {reading.i2t !== "" && reading.i2t !== null && reading.i2t !== undefined
                            ? `${reading.i2t}`
                            : <span className="text-zinc-400">—</span>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(reading.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-zinc-200">
                <p className="text-zinc-400 text-sm">No readings recorded yet.</p>
                <p className="text-zinc-400 text-xs mt-1">Add readings from the Condition Monitoring page.</p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
