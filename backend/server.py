import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from chatbot import get_response, load_responses, save_responses

app = Flask(__name__)

# --- CORS ---
# Bruk miljøvariabel ALLOWED_ORIGINS for prod (kommaseparert),
# fall tilbake til vanlige lokale porter i dev.
_env_origins = os.getenv("ALLOWED_ORIGINS")
if _env_origins:
    ALLOWED_ORIGINS = [o.strip() for o in _env_origins.split(",") if o.strip()]
else:
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3005",
        "http://127.0.0.1:3005",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

CORS(app, resources={r"/api/*": {
    "origins": ALLOWED_ORIGINS or "*",
    "methods": ["POST", "OPTIONS"],
    "allow_headers": ["Content-Type"]
}})

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
    # Bind til 0.0.0.0 for å akseptere trafikk fra Render / containere
    app.run(host="0.0.0.0", port=port, debug=debug)
