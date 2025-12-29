import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { API_BASE } from "../config";

/* -------------------------------
   Types
-------------------------------- */

type TimelinePoint = {
  date: string;
  close: number;
  regime_label: "Stable" | "Uncertain" | "Crisis";
};

/* -------------------------------
   Helpers
-------------------------------- */

const regimeColor = (label: TimelinePoint["regime_label"]) => {
  if (label === "Stable") return "#2e7d32";
  if (label === "Uncertain") return "#f9a825";
  return "#c62828";
};

/* -------------------------------
   Component
-------------------------------- */

export default function RegimeTimeline() {
  const [data, setData] = useState<TimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/regime-timeline`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading market timeline…</p>;

  return (
    <section style={section}>
      <h3 style={title}>📈 NIFTY 50 Market Regime Timeline</h3>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />

          <Line
            dataKey="close"
            strokeWidth={2}
            dot={false}
            stroke="#999"
            isAnimationActive={false}
          />

          {data.map((_, i) =>
            i === 0 ? null : (
              <Line
                key={i}
                data={[
                  data[i - 1],
                  data[i],
                ]}
                dataKey="close"
                stroke={regimeColor(data[i].regime_label)}
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
              />
            )
          )}
        </LineChart>
      </ResponsiveContainer>

      <div style={legend}>
        <span style={{ color: "#2e7d32" }}>🟢 Stable</span>
        <span style={{ color: "#f9a825" }}>🟡 Uncertain</span>
        <span style={{ color: "#c62828" }}>🔴 Crisis</span>
      </div>
    </section>
  );
}

/* -------------------------------
   Styles
-------------------------------- */

const section: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "12px",
  padding: "24px",
  marginTop: "30px",
  boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
};

const title: React.CSSProperties = {
  marginBottom: "15px",
};

const legend: React.CSSProperties = {
  display: "flex",
  gap: "20px",
  marginTop: "10px",
  fontSize: "14px",
};
