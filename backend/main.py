from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from agents.api_agent import get_full_market_brief, estimate_next_week_price
from agents.language_agent import generate_market_summary

app = FastAPI(
    title="Multi-Agent Finance Assistant",
    description="Fetches stock data, generates summaries using Gemini, and supports voice input/output.",
    version="1.1.0"
)

# -------------------------------------
# ✅ Enable CORS for React frontend
# -------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific origin like ["http://localhost:5173"] for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------
# ✅ Health Check
# -------------------------------------
@app.get("/")
def home():
    return {"message": "🚀 Finance Assistant with Gemini, Whisper, and TTS is running."}


# -------------------------------------
# ✅ Market Summary from Stock Symbol
# -------------------------------------
@app.get("/summary")
def get_summary(ticker: str = Query(..., description="Stock symbol like AAPL, TSLA, GOOGL")):
    """
    Fetches market data for a stock and returns a Gemini-generated summary.
    """
    try:
        market_data = get_full_market_brief(ticker)
        summary = generate_market_summary(market_data)

        return {
            "ticker": ticker.upper(),
            "summary": summary,
            "raw_data": market_data
        }

    except Exception as e:
        return {"error": f"Error processing request: {str(e)}"}


# -------------------------------------
# ✅ Price Prediction Endpoint
# -------------------------------------
@app.get("/predict")
def predict_price(ticker: str = Query(..., description="Stock symbol like AAPL, TSLA, GOOGL")):
    """
    Fetches stock market data for the given symbol and returns next week's estimated price.
    """
    try:
        market_data = get_full_market_brief(ticker)
        prediction = estimate_next_week_price(market_data)

        return {
            "ticker": ticker.upper(),
            "prediction": prediction
        }

    except Exception as e:
        return {"error": f"Price prediction failed: {str(e)}"}

