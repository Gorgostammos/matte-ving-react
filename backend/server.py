import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from chatbot import get_response, load_responses, save_responses

app = Flask(__name__)

# --- CORS ---
# Prod: sett ALLOWED_ORIGINS i Render (kommaseparert, f.eks. "https://din-app.vercel.app,https://matte-ving-react.onrender.com")
_env_origins = os.getenv("ALLOWED_ORIGINS")
if _env_origins:
    ALLOWED_ORIGINS = [o.strip() for o in _env_origins.split(",") if o.strip()]
else:
    # Default for dev + Vercel prod/preview + backendens egen URL på Render
    ALLOWED_ORIGINS = [
        r"https?://localhost(:\d+)?",
        r"https?://127\.0\.0\.1(:\d+)?",
        r"https://.*\.vercel\.app",
        "https://matte-ving-react.onrender.com",
    ]

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": ALLOWED_ORIGINS,
            "methods": ["POST", "OPTIONS"],
            "allow_headers": ["Content-Type"],
        }
    },
)

# --- State ---
responses = load_responses()

# --- Healthcheck ---
@app.get("/health")
def health():
    return jsonify({"status": "ok"}), 200

# --- Chat endpoint ---
@app.post("/api/chat")
def chat():
    # Godta kun JSON
    if request.content_type is None or "application/json" not in request.content_type:
        return jsonify({"error": "Content-Type må være application/json"}), 415

    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    last_input = (data.get("last_input") or "").strip() or None

    if not message:
        return jsonify({"error": "Feltet 'message' er påkrevd"}), 400

    try:
        reply = get_response(message, responses, last_input)
        save_responses(responses)
        return jsonify({"response": reply}), 200
    except Exception as ex:
        app.logger.exception("Uventet feil i /api/chat: %s", ex)
        return jsonify({"error": "Uventet serverfeil"}), 500

# --- Entrypoint ---
if __name__ == "__main__":
    # Render setter PORT i miljøvariabler. Lokalt faller vi tilbake til 5000.
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "").lower() in ("1", "true", "yes")
    app.run(host="0.0.0.0", port=port, debug=debug)
