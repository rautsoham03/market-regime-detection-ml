import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { API_BASE } from "../config";

/* -------------------------------
   Types
-------------------------------- */
type RegimePoint = {
  date: string;
  regime: number;
};

/* -------------------------------
   Helpers
-------------------------------- */
const label = (r: number) =>
  r === 0 ? "Stable" : r === 1 ? "Uncertain" : "Crisis";

const color = (r: number) =>
  r === 0 ? "#2ecc71" : r === 1 ? "#f1c40f" : "#e74c3c";

/* -------------------------------
   Component
-------------------------------- */
export default function RegimeTimeline() {
  const [data, setData] = useState<RegimePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/regime-timeline`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading market regime timeline…</p>;

  return (
    <section style={card}>
      <h3>📈 Market Regime Timeline</h3>

      <div style={{ height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis ticks={[0, 1, 2]} tickFormatter={label} />
            <Tooltip formatter={(v: number) => label(v)} />
            <Line
              type="stepAfter"
              dataKey="regime"
              stroke="#34495e"
              strokeWidth={2}
              dot={({ cx, cy, payload }) => (
                <circle cx={cx} cy={cy} r={4} fill={color(payload.regime)} />
              )}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: 10 }}>
        <span style={{ color: "#2ecc71" }}>● Stable</span>{" "}
        <span style={{ color: "#f1c40f" }}>● Uncertain</span>{" "}
        <span style={{ color: "#e74c3c" }}>● Crisis</span>
      </div>
    </section>
  );
}

const card: React.CSSProperties = {
  marginTop: "40px",
  background: "#fff",
  padding: "30px",
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
};
