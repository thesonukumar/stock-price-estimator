# api_agent.py

import os
import requests
from dotenv import load_dotenv

# -------------------------------
# ✅ Load Finnhub API key
# -------------------------------
load_dotenv()
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")
BASE_URL = "https://finnhub.io/api/v1"


# ----------------------------------------
# 🔹 Get real-time quote + profile summary
# ----------------------------------------
def get_stock_summary(symbol):
    """
    Fetch real-time stock quote and company profile from Finnhub.
    Returns:
        Dictionary with current price, open, high, low, etc.
    """
    try:
        # Quote (price, open, high, low)
        quote_url = f"{BASE_URL}/quote"
        quote_params = {"symbol": symbol, "token": FINNHUB_API_KEY}
        quote_res = requests.get(quote_url, params=quote_params).json()

        # Company Profile
        profile_url = f"{BASE_URL}/stock/profile2"
        profile_params = {"symbol": symbol, "token": FINNHUB_API_KEY}
        profile_res = requests.get(profile_url, params=profile_params).json()
        predict_price_dict = {
            "previousClose": quote_res.get("pc"),
            "currentPrice": quote_res.get("c")
        }
        estimated_price = estimate_next_week_price(predict_price_dict)
        print(estimated_price)
        return {
            "symbol": symbol.upper(),
            "shortName": profile_res.get("name", "N/A"),
            "currentPrice": quote_res.get("c"),
            "open": quote_res.get("o"),
            "high": quote_res.get("h"),
            "low": quote_res.get("l"),
            "previousClose": quote_res.get("pc"),
            "exchange": profile_res.get("exchange", "N/A"),
            "industry": profile_res.get("finnhubIndustry", "N/A"),
            "currency": profile_res.get("currency", "USD"),
            "logo": profile_res.get("logo", ""),
            "estimation": estimated_price
        }

    except Exception as e:
        return {"error": f"Error fetching stock summary for {symbol}: {str(e)}"}


# ----------------------------------------
# 🔹 Estimate next week's price
# ----------------------------------------
def estimate_next_week_price(price_data):
    """
    Estimate the approximate stock price after 1 week.
    Uses a very basic projection based on current vs. previous close.
    """
    try:
        current_price = price_data.get("currentPrice")
        previous_close = price_data.get("previousClose")

        # If any key data is missing, return None
        if current_price is None or previous_close is None:
            return None

        # Calculate daily % change
        daily_change = (current_price - previous_close) / previous_close

        # Project 5 trading days ahead (linear growth assumption)
        projected_change = daily_change * 5
        estimated_price = current_price * (1 + projected_change)        

        return round(estimated_price, 2)

    except Exception:
        return None