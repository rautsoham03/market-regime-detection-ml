# market-regime-detection-ml
An end-to-end market regime detection and investor intelligence system using machine learning. Identifies market regimes on NIFTY-50 data and delivers regime-aware risk insights and investment guidance via a FastAPI backend and interactive React dashboard.


# 📊 Market Regime Analytics & Investor Guidance System

A full-stack, regime-aware market intelligence platform that detects market regimes using historical NIFTY-50 data and provides **actionable investor guidance**, **tactical asset allocation**, and **risk warnings**.

Built using **FastAPI**, **React (Vite + TypeScript)**, and **Machine Learning–driven regime analysis**.

---

## 🚀 Key Features

### 🧠 Intelligent Analysis
* **Regime Detection:** Classifies market states into *Stable*, *Uncertain*, or *Crisis* using ML logic.
* **Tactical Asset Allocation:** Dynamic portfolio split recommendations (Equity/Debt/Cash) based on the current regime.
* **Risk Early Warning:** Detects volatility spikes and potential regime shifts before they happen.

### 💻 Interactive Dashboard
* **Cinematic Loading Screen:** Features quotes from legendary investors (Buffett, Dalio, Lynch) while analyzing data.
* **Regime Timeline:** Interactive area chart visualizing historical regime changes.
* **Strategy Guide:** Educational "Cheat Sheet" explaining the math behind the analysis.
* **Export Reports:** Download comprehensive PDF strategy reports.

---

## 🏗️ Architecture

```text
market-regime-detection-ml/
│
├── backend/                   # FastAPI Server
│   ├── main.py                # API Endpoints & Business Logic
│   ├── rag_advisor/           # Investor Guidance Engine (Rule-based)
│   ├── data/                  # CSV Data Sources
│   │   ├── nifty50_final_with_labels.csv
│   │   └── Investors.csv
│   └── requirements.txt       # Python Dependencies
│
├── frontend/                  # React Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── InvestorGuidance.tsx   # Main Intelligence Dashboard
│   │   │   ├── RegimeTimeline.tsx     # Historical Area Chart
│   │   │   ├── TacticalAllocation.tsx # Pie Chart & Asset Mix
│   │   │   ├── StrategyGuide.tsx      # Educational Reference
│   │   │   └── LoadingOverlay.tsx     # Cinematic Quotes Loader
│   │   ├── App.tsx            # Main Layout, Navigation & State
│   │   └── App.css            # Dark Theme & Animations
│   └── package.json           # JS Dependencies
│
├── notebooks/                 # Jupyter Notebooks for ML Experiments
└── README.md                  # Documentation


⚙️ Installation & Setup

1️⃣ Backend (FastAPI)

# Navigate to backend
cd backend

# Create virtual environment
python -m venv .venv

# Activate environment
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload

Backend runs at: http://127.0.0.1:8000

2️⃣ Frontend (React + Vite)

# Navigate to frontend
cd frontend 

# Install dependencies
npm install

# Run the development server
npm run dev

Frontend runs at: http://localhost:5173


```

🧠 Market Regimes Explained

<img width="788" height="162" alt="image" src="https://github.com/user-attachments/assets/937c6f05-fd5c-4a29-bf37-5b82ce35120b" />


```text
📌 Usage Guide
Dashboard: Select a date to see the historical market regime and vital signs (Volatility, Return).

Allocation Playbook: Click the tab to see the recommended portfolio pie chart for that regime.

Strategy Guide: Learn how the model calculates risk and defines regimes.


🔮 Future Enhancements
[ ] Multi-asset regime detection (Gold, Crypto, Bonds).

[ ] User authentication and personalized portfolio tracking.

[ ] Live market data integration via Yahoo Finance API.

[ ] CI/CD pipeline for automated testing.
Export: Click "Export Report (PDF)" to save the analysis.


⚠️ Disclaimer
This project is for educational and analytical purposes only. It does not constitute financial advice.
Always do your own research before investing!!!.```
