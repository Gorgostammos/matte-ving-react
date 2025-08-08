from flask import Flask, request, jsonify
from flask_cors import CORS
from chatbot import get_response, load_responses, save_responses

app = Flask(__name__)

# Strammere CORS: justér origin etter behov (f.eks. http://localhost:5173 for Vite)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"]}})

responses = load_responses()

@app.get("/health")
def health():
    return jsonify({"status": "ok"}), 200

@app.post("/api/chat")
def chat():
    if not request.is_json:
        return jsonify({"error": "Content-Type må være application/json"}), 415

    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    last_input = (data.get("last_input") or "").strip() or None

    if not message:
        return jsonify({"error": "Feltet 'message' er påkrevd"}), 400

    try:
        response = get_response(message, responses, last_input)
        save_responses(responses)
        return jsonify({"response": response}), 200
    except Exception as ex:
        # I en ekte prod bør dette logges til observability
        return jsonify({"error": "Uventet serverfeil", "detail": str(ex)}), 500

if __name__ == "__main__":
    # Ikke aktiver debug i prod
    app.run(host="127.0.0.1", port=5000, debug=True)
