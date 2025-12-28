# market-regime-detection-ml
An end-to-end market regime detection and investor intelligence system using machine learning. Identifies market regimes on NIFTY-50 data and delivers regime-aware risk insights and investment guidance via a FastAPI backend and interactive React dashboard.
# 📊 Market Regime Detection & Investor Guidance System

A full-stack, regime-aware market intelligence platform that detects market regimes using historical data and provides **actionable investor guidance** based on risk conditions.

Built using **FastAPI**, **React (Vite + TypeScript)**, and **Machine Learning–driven regime analysis**.

---

## 🚀 Features

- 📈 Market regime detection (Stable / Uncertain / Crisis)
- 🧠 Regime-aware investor guidance
- ⚠️ Early risk warnings and regime transitions
- 🧪 Stress testing across investor profiles
- 📊 Interactive frontend dashboard
- 📄 Exportable investor reports (PDF)

---

## 🏗️ Architecture

# 📊 Market Regime Detection & Investor Guidance System

A full-stack, regime-aware market intelligence platform that detects market regimes using historical data and provides **actionable investor guidance** based on risk conditions.

Built using **FastAPI**, **React (Vite + TypeScript)**, and **Machine Learning–driven regime analysis**.

---

## 🚀 Features

- 📈 Market regime detection (Stable / Uncertain / Crisis)
- 🧠 Regime-aware investor guidance
- ⚠️ Early risk warnings and regime transitions
- 🧪 Stress testing across investor profiles
- 📊 Interactive frontend dashboard
- 📄 Exportable investor reports (PDF)

---

## 🏗️ Architecture

market-regime-detection-ml/
│
├── backend/
│ ├── main.py
│ ├── rag_advisor/
│ ├── data/
│ └── requirements.txt
│
├── frontend/
│ ├── src/
│ ├── public/
│ └── package.json
│
├── notebooks/
├── .gitignore
└── README.md


---

## ⚙️ Backend Setup (FastAPI)

### 1️⃣ Create virtual environment
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

### 2️⃣ Install dependencies
cd backend
pip install -r requirements.txt

### 3️⃣ Run backend
uvicorn main:app --reload

Backend runs at:
http://127.0.0.1:8000

### Frontend Setup (React + Vite)
cd frontend 
npm install
npm run dev

Frontend runs at:
http://localhost:5173


🧠 Market Regimes
| Regime    | Description                          |
| --------- | ------------------------------------ |
| Stable    | Low volatility, steady returns       |
| Uncertain | Mixed signals, rising risk           |
| Crisis    | High drawdowns, capital preservation |

📌 Use Cases

Retail investors
Portfolio risk monitoring
Market research
Strategy stress testing
Financial dashboards


🔮 Future Enhancements

Multi-asset regime detection
Personalized investor personas
Live market data integration
Portfolio-level recommendations
Cloud deployment & CI/CD


⚠️ Disclaimer

This project is for educational and analytical purposes only.
It does not constitute financial advice.
