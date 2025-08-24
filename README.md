# 📊 Stock Price Estimator: https://thesonukumar.github.io/stock-price-estimator/

A modern **AI-powered finance assistant** that fetches **real-time stock market data**, generates **intelligent summaries using Gemini**, and provides **price estimations** — all wrapped in a **FastAPI backend** with a **React + TailwindCSS frontend**.

---

## 🚀 Features
- **Real-Time Market Data** via [Finnhub API](https://finnhub.io)
- **AI-Powered Summaries** using **Google Gemini Pro**
- **Price Prediction** with basic linear growth estimation
- **Voice Input & Output** (powered by Whisper + TTS)
- **CORS Enabled** for smooth frontend-backend communication
- Minimal, **modern UI with TailwindCSS**

---

## 🛠 Tech Stack

| Layer      | Technology |
|------------|-----------|
| **Backend** | FastAPI, Python, Requests, Dotenv |
| **AI/ML**  | Google Gemini API |
| **Frontend** | React, TypeScript, TailwindCSS, Axios |
| **APIs**   | Finnhub API (Market Data), Whisper/TTS |
| **Deployment** | Render (API), GitHub Pages (Frontend) |

---

## ⚙️ Installation & Setup

### **1. Clone the repository**

```bash
git clone https://github.com/thesonukumar/stock-price-estimator.git
cd stock-price-estimator
```

### **2. Backend Setup**

```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
```

Create a .env file in the backend directory:

```
FINNHUB_API_KEY=your_finnhub_api_key
GEMINI_API_KEY=your_gemini_api_key
```

Start the server:

```
uvicorn main:app --host 0.0.0.0 -port 8000
```

Backend will run at: http://0.0.0.0:8000


### **3. Frontend Setup**

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at: http://localhost:5173


### BONUS

To run again after setup just run linux_run.sh or windows_run.ps1 according to your OS.

---

### **📂 Project Structure**

```
stock-price-estimator/
├── backend/
│   ├── main.py                # FastAPI main server
│   ├── agents/
│   │   ├── api_agent.py       # Market data handling
│   │   ├── language_agent.py  # AI summarization with Gemini
│   └── .env                   # API keys
├── frontend/
│   ├── src/                   # React App source
│   ├── public/
│   └── package.json
└── README.md
```


## **🌐 Deployment**

Backend: Deploy to [Render](https://render.com/)

Frontend: Deploy to [GitHub Pages](https://pages.github.com/) 


## **🤝 Contributing**

Contributions are welcome!
Fork the repo, make your changes, and submit a pull request.


## **📜 License**

This project is licensed under the MIT License.

## **✨ Author**

[Sonu Kumar](https://github.com/thesonukumar)