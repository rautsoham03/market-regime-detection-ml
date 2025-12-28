import pandas as pd
from rag_advisor.advisor import regime_ai_advisor

df = pd.read_csv(
    r"C:\Users\sanke\OneDrive\Desktop\PythonProject\market-regime-detection-ml\data\nifty50_final_with_labels.csv",
    index_col=0,
    parse_dates=True
)

row = df.iloc[-1]

output = regime_ai_advisor(
    regime_label=row["regime_label"],
    avg_return=row["log_return"],
    volatility=row["vol_20"],
    max_drawdown=row["drawdown"],
    regime_start_date=row["regime_start_date"],
    regime_duration_days=row["regime_duration_days"]
)

print(output)
