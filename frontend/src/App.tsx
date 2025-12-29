import InvestorGuidance from "./components/InvestorGuidance";
import RegimeTimeline from "./components/RegimeTimeline";

export default function App() {
  return (
    <div style={page}>
      <header style={hero}>
        <h1>Market Regime Analytics</h1>
        <p>Regime-aware market insights for long-term investors</p>
      </header>

      <main style={container}>
        <InvestorGuidance />
        <RegimeTimeline />
      </main>

      <footer style={footer}>
        © 2025 Market Regime Analytics
      </footer>
    </div>
  );
}

/* ---------------- Styles ---------------- */

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f5f7fa",
  fontFamily: "Inter, system-ui, sans-serif",
};

const hero: React.CSSProperties = {
  padding: "70px 80px",
  background: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
  color: "#fff",
};

const container: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "60px 40px",
};

const footer: React.CSSProperties = {
  textAlign: "center",
  padding: "30px",
  color: "#777",
};
