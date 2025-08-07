from flask import Flask, request, jsonify
from flask_cors import CORS
from chatbot import get_response, load_responses, save_responses

app = Flask(__name__)
CORS(app)

responses = load_responses()

@app.post("/api/chat")
def chat():
    data = request.json
    message = data.get("message", "")
    last_input = data.get("last_input", None)
    response = get_response(message, responses, last_input)
    save_responses(responses)
    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(debug=True)
