import InvestorGuidance from "./components/InvestorGuidance";
import RegimeTimeline from "./components/RegimeTimeline";

export default function App() {
  return (
    <div style={page}>
      {/* HERO / HEADER */}
      <header style={hero}>
        <h1 style={title}>Market Regime Analytics</h1>
        <p style={subtitle}>
          Regime-aware market insights for long-term investors
        </p>
      </header>

      {/* MAIN CONTENT */}
      <main style={main}>
        <InvestorGuidance />
        <RegimeTimeline />
      </main>

      {/* FOOTER */}
      <footer style={footer}>
        © 2025 Market Regime Analytics
      </footer>
    </div>
  );
}

/* -------------------------------
   Styles
-------------------------------- */

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f4f6f8",
};

const hero: React.CSSProperties = {
  width: "100%",
  padding: "60px 40px",
  background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
  color: "#ffffff",
};

const title: React.CSSProperties = {
  fontSize: "42px",
  marginBottom: "10px",
};

const subtitle: React.CSSProperties = {
  fontSize: "16px",
  opacity: 0.9,
};

const main: React.CSSProperties = {
  maxWidth: "1280px",
  margin: "0 auto",
  padding: "40px 30px",
};

const footer: React.CSSProperties = {
  textAlign: "center",
  padding: "30px",
  fontSize: "13px",
  color: "#777",
};
