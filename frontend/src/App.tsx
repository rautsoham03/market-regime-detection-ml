import InvestorGuidance from "./components/InvestorGuidance";
import RegimeTimeline from "./components/RegimeTimeline";

export default function App() {
  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <h1 style={{ marginBottom: 8 }}>Market Regime Analytics</h1>
        <p style={{ color: "#555" }}>
          Regime-aware market insights for long-term investors
        </p>
      </header>

      <section style={containerStyle}>
        <InvestorGuidance />
        <RegimeTimeline />
      </section>

      <footer style={footerStyle}>
        © 2025 Market Regime Analytics
      </footer>
    </main>
  );
}

/* -------------------------------
   Styles
-------------------------------- */

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f4f6f8",
};

const headerStyle: React.CSSProperties = {
  padding: "40px 20px",
  background: "#ffffff",
  borderBottom: "1px solid #e5e5e5",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "40px 20px",
};

const footerStyle: React.CSSProperties = {
  marginTop: "80px",
  padding: "20px",
  textAlign: "center",
  color: "#777",
  fontSize: "14px",
};
