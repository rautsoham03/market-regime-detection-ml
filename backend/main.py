from fastapi import FastAPI, Query
import pandas as pd
import random
import numpy as np
from rag_advisor.advisor import regime_investor_guidance_json
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
import os

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
# Robust Data Path Finder
# ----------------------------------

def find_data_file(filename):
    """
    Searches for the CSV file in common relative locations.
    Works for Local (Git) and Cloud (Render).
    """
    # 1. Get the directory where main.py is located
    base_dir = Path(__file__).resolve().parent
    
    # 2. List of relative paths to check
    possible_paths = [
        base_dir / "data" / filename,              # Standard: /backend/data/file.csv
        base_dir.parent / "data" / filename,       # Sibling: /root/data/file.csv
        Path("data") / filename,                   # CWD relative: ./data/file.csv
    ]

    for path in possible_paths:
        if path.exists():
            print(f"✅ Found {filename} at: {path}")
            return path
            
    print(f"❌ Warning: Could not find {filename}. Checked: {[str(p) for p in possible_paths]}")
    return None

# ----------------------------------
# Load Data
# ----------------------------------

# Find the files dynamically
main_csv_path = find_data_file("nifty50_final_with_labels.csv")
quotes_csv_path = find_data_file("Investors.csv")

# 1. Load Main Financial Data
if main_csv_path:
    df = pd.read_csv(main_csv_path, index_col=0, parse_dates=True)
    
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
else:
    print("CRITICAL ERROR: Main Data CSV not found. API will return errors.")
    df = pd.DataFrame() 

# 2. Load Quotes Data
quotes_data = []
if quotes_csv_path:
    try:
        quotes_df = pd.read_csv(quotes_csv_path)
        quotes_data = quotes_df.to_dict(orient="records")
    except Exception as e:
        print(f"Warning: Error reading quotes file: {e}")

# Fallback quote if file load fails
if not quotes_data:
    quotes_data = [{"name": "Market Wisdom", "quote": "Patience is key.", "url": ""}]


# ----------------------------------
# Helper: Calculate Early Warning
# ----------------------------------
def calculate_risk_metrics(row, lookback_window=5):
    """
    Calculates extra risk metrics based on volatility trends.
    """
    # 1. Early Warning Probability
    vol_20 = row.get('vol_20', 0.01)
    vol_60 = row.get('vol_60', 0.01)
    
    vol_ratio = vol_20 / vol_60 if vol_60 > 0 else 1.0
    
    # Map ratio to a 0-100% probability scale.
    prob_score = np.interp(vol_ratio, [0.8, 1.0, 1.5], [10, 40, 90])
    early_warning_prob = int(np.clip(prob_score, 0, 99))

    # 2. Recent Regime Change Alert
    current_date_idx = df.index.get_loc(row.name)
    start_idx = max(0, current_date_idx - lookback_window)
    recent_slice = df.iloc[start_idx:current_date_idx+1]
    
    has_recent_change = False
    if 'regime_change' in recent_slice.columns:
        has_recent_change = bool(recent_slice['regime_change'].any())

    return early_warning_prob, has_recent_change


# ----------------------------------
# Endpoints
# ----------------------------------

@app.get("/")
def home():
    return {"status": "Backend running successfully"}

@app.get("/random-quote")
def get_random_quote():
    if not quotes_data:
        return {"name": "N/A", "quote": "Loading...", "url": ""}
    return random.choice(quotes_data)

@app.get("/investor-guidance")
def investor_guidance(
    date: str,
    persona: str = Query("Balanced", enum=["Conservative", "Balanced", "Aggressive"])
):
    if df.empty:
        return {"error": "Data not loaded"}

    date_obj = pd.to_datetime(date)
    # Handle non-trading days
    if date_obj not in df.index:
        date_obj = df.index[df.index.get_loc(date_obj, method="nearest")]

    row = df.loc[date_obj]
    row.name = date_obj 

    ew_prob, recent_change = calculate_risk_metrics(row)

    historical_stats = {
        "avg_return": float(df["log_return"].mean()),
        "volatility": float(df["log_return"].std()),
        "max_drawdown": float(df["drawdown"].min()),
    }

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

    response["early_warning_prob"] = ew_prob
    response["recent_regime_change"] = recent_change
    
    return response

@app.get("/regime-timeline")
def regime_timeline():
    if df.empty: return []

    timeline_df = df.reset_index()
    
    # Normalize date column name
    if "Price" in timeline_df.columns: 
        timeline_df = timeline_df.rename(columns={"Price": "date"})
    elif "index" in timeline_df.columns: 
        timeline_df = timeline_df.rename(columns={"index": "date"})
    
    # Ensure we have data to return
    if "date" not in timeline_df.columns or "close" not in timeline_df.columns:
        return []

    final_df = timeline_df[["date", "close", "regime_label"]].tail(300)
    final_df["date"] = final_df["date"].astype(str)
    final_df["close"] = final_df["close"].astype(float)
    
    return final_df.to_dict(orient="records")
