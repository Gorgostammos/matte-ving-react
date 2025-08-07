import json
import os
import re
import spacy
import random

nlp = spacy.load("nb_core_news_sm")

RESPONSES_FILE = "svar.json"
BACKUP_FILE = "svar_backup.json"

CATEGORIES = {
    "greeting": ["hei", "hallo", "god morgen", "hei på deg"],
    "farewell": ["ha det", "snakkes", "vi snakkes"],
    "feelings": ["hvordan har du det", "hvordan går det", "jeg er stressa", "jeg er nervøs"],
    "jokes": ["fortell en vits", "en til"],
    "gratitude": ["takk", "tusen takk"]
}

ALIASES = {
    "takk skal du ha": "takk",
    "mange takk": "takk",
    "fortell en til vits": "en til",
}

def load_responses():
    if os.path.exists(RESPONSES_FILE):
        try:
            with open(RESPONSES_FILE, "r", encoding="utf-8") as file:
                return json.load(file)
        except json.JSONDecodeError:
            os.rename(RESPONSES_FILE, BACKUP_FILE)
            return {}
    return {}

def save_responses(responses):
    with open(RESPONSES_FILE, "w", encoding="utf-8") as file:
        json.dump(responses, file, indent=4, ensure_ascii=False)

def extract_keywords(message):
    doc = nlp(message)
    return [token.lemma_.lower() for token in doc if not token.is_stop and not token.is_punct]

def match_category(message):
    keywords = extract_keywords(message)
    for category, phrases in CATEGORIES.items():
        for phrase in phrases:
            phrase_keywords = extract_keywords(phrase)
            if any(word in keywords for word in phrase_keywords):
                return category
    return None

def detect_intent(message):
    message = message.lower()
    if "føler" in message or "trist" in message or "lei" in message:
        return "feelings"
    if "vits" in message:
        return "jokes"
    if re.match(r"^hva|hvordan|når|kan du", message):
        return "question"
    return None

def better_match(message, known_messages):
    input_keywords = set(extract_keywords(message))
    best_match = None
    highest_overlap = 0
    for known in known_messages:
        known_keywords = set(extract_keywords(known))
        overlap = len(input_keywords & known_keywords)
        if overlap > highest_overlap:
            highest_overlap = overlap
            best_match = known
    return best_match if highest_overlap > 0 else None

def get_response(message, responses, last_input=None):
    message = message.lower().strip()
    message = ALIASES.get(message, message)

    if message in responses:
        return responses[message]

    match = re.search(r"(\d+)\s*([\+\-\*/])\s*(\d+)", message)
    if match:
        a, operator, b = int(match[1]), match[2], int(match[3])
        try:
            if operator == '+':
                result = a + b
                return f"{a} + {b} = {result}. Hvis du har {a} epler og får {b} til, har du {result} 🍎"
            elif operator == '-':
                result = a - b
                return f"{a} - {b} = {result}. Hvis du har {a} kjeks og spiser {b}, har du {result} 🍪"
            elif operator == '*':
                result = a * b
                return f"{a} * {b} = {result}. {a} esker med {b} kuler blir {result} 🎯"
            elif operator == '/':
                if b == 0:
                    return "Du kan ikke dele på 0!"
                result = a / b
                return f"{a} / {b} = {result}. {a} godteri delt på {b} personer = {result:.2f} 🍬"
        except Exception as e:
            return f"Utregningsfeil: {e}"

    matched_category = match_category(message) or detect_intent(message)
    if matched_category and matched_category in responses:
        resp = responses[matched_category]
        return random.choice(resp) if isinstance(resp, list) else resp

    token_match = better_match(message, responses.keys())
    if token_match:
        return responses[token_match]

    return "Beklager, jeg forstod ikke. Prøv igjen! 🔄"
