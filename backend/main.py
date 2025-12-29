from fastapi import FastAPI, Query
import pandas as pd
import random
import numpy as np
from rag_advisor.advisor import regime_investor_guidance_json
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

# ----------------------------------
# App initialization
# ----------------------------------

app = FastAPI(title="Regime-Aware Investor Guidance API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------
# Load & Clean Data
# ----------------------------------

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MAIN_DATA_PATH = DATA_DIR / "nifty50_final_with_labels.csv"
QUOTES_PATH = DATA_DIR / "Investors.csv"

# 1. Load Main Financial Data
df = pd.read_csv(MAIN_DATA_PATH, index_col=0, parse_dates=True)

# Ensure 'close' column exists for charts
if 'close' not in df.columns:
    if 'cum_return' in df.columns:
        df['close'] = df['cum_return'] * 8500
    else:
        df['close'] = 10000

# Map Labels for frontend colors
label_map = {
    "Stable / Bull Market": "Stable",
    "Uncertain / Transition": "Uncertain",
    "Crisis / High Volatility": "Crisis"
}
df['regime_label'] = df['regime_label'].replace(label_map)
df.sort_index(inplace=True)

# 2. Load Quotes Data
try:
    quotes_df = pd.read_csv(QUOTES_PATH)
    quotes_data = quotes_df.to_dict(orient="records")
except Exception as e:
    print(f"Warning: Could not load quotes: {e}")
    quotes_data = [{"Investor": "Market Wisdom", "Quote": "Patience is key.", "Image_URL": ""}]


# ----------------------------------
# Helper: Calculate Early Warning
# ----------------------------------
def calculate_risk_metrics(row, lookback_window=5):
    # 1. Early Warning Probability (Simple Heuristic based on Volatility Trend)
    # If short-term vol (vol_20) is rising faster than long-term vol (vol_60)
    vol_ratio = row.get('vol_20', 0.01) / row.get('vol_60', 0.01) if row.get('vol_60', 0) > 0 else 1.0
    
    # Map ratio to a 0-100% probability scale. Ratio > 1.2 is high risk.
    prob_score = np.interp(vol_ratio, [0.8, 1.0, 1.5], [10, 40, 90])
    early_warning_prob = int(np.clip(prob_score, 0, 99))

    # 2. Recent Regime Change Alert
    # Check if regime changed in the last N trading days
    current_date_idx = df.index.get_loc(row.name)
    start_idx = max(0, current_date_idx - lookback_window)
    recent_slice = df.iloc[start_idx:current_date_idx+1]
    # Check if 'regime_change' column has any True values recently
    has_recent_change = recent_slice['regime_change'].any() if 'regime_change' in recent_slice.columns else False

    return early_warning_prob, bool(has_recent_change)


# ----------------------------------
# Endpoints
# ----------------------------------

@app.get("/")
def home():
    return {"status": "Backend running successfully"}

# NEW ENDPOINT: Get Random Quote
@app.get("/random-quote")
def get_random_quote():
    if not quotes_data:
        return {"Investor": "N/A", "Quote": "Loading...", "Image_URL": ""}
    return random.choice(quotes_data)

@app.get("/investor-guidance")
def investor_guidance(
    date: str,
    persona: str = Query("Balanced", enum=["Conservative", "Balanced", "Aggressive"])
):
    date_obj = pd.to_datetime(date)
    if date_obj not in df.index:
        date_obj = df.index[df.index.get_loc(date_obj, method="nearest")]

    row = df.loc[date_obj]
    row.name = date_obj # Ensure name is set for helper function

    # Calculate new metrics
    ew_prob, recent_change = calculate_risk_metrics(row)

    historical_stats = {
        "avg_return": float(df["log_return"].mean()),
        "volatility": float(df["log_return"].std()),
        "max_drawdown": float(df["drawdown"].min()),
    }

    # Get base guidance
    response = regime_investor_guidance_json(
        regime_label=row["regime_label"],
        avg_return=float(row["log_return"]),
        volatility=float(row["vol_20"]),
        max_drawdown=float(row["drawdown"]),
        regime_start_date=str(row["regime_start_date"]),
        regime_duration_days=int(row["regime_duration_days"]),
        persona=persona,
        historical_stats=historical_stats,
    )

    # Inject new metrics into response
    response["early_warning_prob"] = ew_prob
    response["recent_regime_change"] = recent_change
    
    return response

@app.get("/regime-timeline")
def regime_timeline():
    timeline_df = df.reset_index()
    # Ensure date column is named correctly
    if "Price" in timeline_df.columns: timeline_df = timeline_df.rename(columns={"Price": "date"})
    elif "index" in timeline_df.columns: timeline_df = timeline_df.rename(columns={"index": "date"})
    
    final_df = timeline_df[["date", "close", "regime_label"]].tail(300)
    final_df["date"] = final_df["date"].astype(str)
    final_df["close"] = final_df["close"].astype(float)
    return final_df.to_dict(orient="records")
