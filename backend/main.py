from fastapi import FastAPI, Query
import pandas as pd

from rag_advisor.advisor import regime_investor_guidance_json

# ----------------------------------
# App initialization
# ----------------------------------

app = FastAPI(title="Regime-Aware Investor Guidance API")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # safe for demo; restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------------
# Load data once at startup
# ----------------------------------

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "nifty50_final_with_labels.csv"

df = pd.read_csv(
    DATA_PATH,
    index_col=0,
    parse_dates=True
)


df.sort_index(inplace=True)

# ----------------------------------
# Health check
# ----------------------------------

@app.get("/")
def home():
    return {"status": "Backend running successfully"}

# ----------------------------------
# Investor guidance endpoint
# ----------------------------------

@app.get("/investor-guidance")
def investor_guidance(
    date: str,
    persona: str = Query("Balanced", enum=["Conservative", "Balanced", "Aggressive"])
):
    """
    Returns regime-aware investor guidance for a given date & investor persona
    """

    date = pd.to_datetime(date)

    # Handle non-trading days
    if date not in df.index:
        date = df.index[df.index.get_loc(date, method="nearest")]

    row = df.loc[date]

    # -------------------------------
    # Historical stats (backend logic)
    # -------------------------------
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

    return response

# ----------------------------------
# Regime timeline endpoint
# ----------------------------------

@app.get("/regime-timeline")
def regime_timeline():
    timeline_df = (
        df.reset_index()
        .rename(columns={"index": "date"})
        [["date", "close", "regime_label"]]
        .tail(300)
    )

    timeline_df["date"] = timeline_df["date"].astype(str)
    timeline_df["close"] = timeline_df["close"].astype(float)

    return timeline_df.to_dict(orient="records")
