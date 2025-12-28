from fastapi import FastAPI, Query
import pandas as pd

from rag_advisor.advisor import regime_investor_guidance_json

# ----------------------------------
# App initialization
# ----------------------------------

app = FastAPI(title="Regime-Aware Investor Guidance API")

# ----------------------------------
# Load data once at startup
# ----------------------------------

df = pd.read_csv(
    r"C:\Users\sanke\OneDrive\Desktop\PythonProject\market-regime-detection-ml\backend\data\nifty50_final_with_labels.csv",
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
    """
    Returns historical market regime timeline
    """

    timeline_df = (
        df.reset_index()
        [["Price", "regime_label"]]
        .rename(columns={"Price": "date"})
        .tail(300)
    )

    timeline_df["date"] = timeline_df["date"].astype(str)

    return timeline_df.to_dict(orient="records")
