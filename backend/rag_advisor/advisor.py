# ----------------------------------
# Risk classification helpers
# ----------------------------------

def classify_volatility(vol):
    if vol < 0.01:
        return "Low"
    elif vol < 0.02:
        return "Medium"
    return "High"


def classify_drawdown(dd):
    if dd > -0.05:
        return "Mild"
    elif dd > -0.15:
        return "Moderate"
    return "Severe"


def classify_persistence(days):
    if days < 20:
        return "Low"
    elif days < 60:
        return "Medium"
    return "High"


# ----------------------------------
# Persona adjustment logic
# ----------------------------------

def adjust_for_persona(base_playbook, persona):
    adjustments = {
        "Conservative": {
            "equity_allocation": "Low",
            "debt_allocation": "High",
            "cash_allocation": "High",
            "persona_note": "Focus on capital protection and stability"
        },
        "Moderate": {
            "persona_note": "Balanced approach between growth and safety"
        },
        "Aggressive": {
            "equity_allocation": "High",
            "debt_allocation": "Low",
            "cash_allocation": "Low",
            "persona_note": "Higher risk tolerance in pursuit of returns"
        }
    }

    if persona in adjustments:
        base_playbook.update(adjustments[persona])

    return base_playbook


# ----------------------------------
# Main investor guidance engine
# ----------------------------------

def regime_investor_guidance_json(
    regime_label: str,
    avg_return: float,
    volatility: float,
    max_drawdown: float,
    regime_start_date,
    regime_duration_days: int,
    persona: str,
    historical_stats: dict
):
    """
    Regime-aware investor guidance with personas + backtested performance
    """

    # -------------------------------
    # Risk Intelligence
    # -------------------------------

    risk_profile = {
        "volatility_risk": classify_volatility(volatility),
        "drawdown_severity": classify_drawdown(max_drawdown),
        "regime_confidence": classify_persistence(regime_duration_days)
    }

    # -------------------------------
    # Base Regime Playbooks
    # -------------------------------

    if "Stable" in regime_label:
        playbook = {
            "objective": "Capital growth with controlled risk",
            "equity_allocation": "High",
            "debt_allocation": "Low",
            "cash_allocation": "Low",
            "dominant_risk": "Overconfidence in prolonged bull markets",
            "actions": [
                "Maintain equity exposure",
                "Rebalance periodically",
                "Avoid leverage"
            ],
            "investment_avenues": [
                "Equity mutual funds",
                "Index funds"
            ],
            "risk_focus": "Valuation and concentration risk"
        }

    elif "Uncertain" in regime_label:
        playbook = {
            "objective": "Capital preservation with flexibility",
            "equity_allocation": "Medium",
            "debt_allocation": "Medium",
            "cash_allocation": "Medium",
            "dominant_risk": "Whipsaws and sudden drawdowns",
            "actions": [
                "Reduce concentrated bets",
                "Diversify assets",
                "Stagger investments"
            ],
            "investment_avenues": [
                "Balanced funds",
                "Low-volatility equity",
                "Short-term debt"
            ],
            "risk_focus": "Volatility control"
        }

    else:  # Crisis
        playbook = {
            "objective": "Capital protection",
            "equity_allocation": "Low",
            "debt_allocation": "High",
            "cash_allocation": "High",
            "dominant_risk": "Deep drawdowns and liquidity stress",
            "actions": [
                "Reduce equity exposure",
                "Hold liquid assets"
            ],
            "investment_avenues": [
                "Liquid funds",
                "Government securities"
            ],
            "risk_focus": "Survival and liquidity"
        }

    # -------------------------------
    # Persona Adjustment
    # -------------------------------

    playbook = adjust_for_persona(playbook, persona)

    # -------------------------------
    # Final Response
    # -------------------------------

    return {
        "regime": regime_label,
        "persona": persona,
        "start_date": str(regime_start_date),
        "duration_days": regime_duration_days,
        "metrics": {
            "average_return": avg_return,
            "volatility": volatility,
            "max_drawdown": max_drawdown
        },
        "risk_profile": risk_profile,
        "historical_performance": historical_stats,
        **playbook
    }
