import json
import os
import random
import re  # beholdes for enkel tokenisering i fallback
from typing import List

# Forsøk å laste norsk spaCy, fall tilbake til en enkel tokenizer
try:
    import spacy
    try:
        nlp = spacy.load("nb_core_news_sm")
    except Exception:
        nlp = None
except Exception:
    nlp = None

RESPONSES_FILE = "svar.json"
BACKUP_FILE = "svar_backup.json"

CATEGORIES = {
    "greeting": ["hei", "hallo", "god morgen", "hei på deg"],
    "farewell": ["ha det", "snakkes", "vi snakkes"],
    "feelings": ["hvordan har du det", "hvordan går det", "jeg er stressa", "jeg er nervøs", "jeg er trist", "jeg føler meg lei"],
    "jokes": ["fortell en vits", "en til"],
    "gratitude": ["takk", "tusen takk", "mange takk", "takk skal du ha"],
}

ALIASES = {
    "takk skal du ha": "takk",
    "mange takk": "takk",
    "fortell en til vits": "en til",
    "hei hei": "hei",
}

DEFAULT_CATEGORY_RESPONSES = {
    "greeting": ["Hei! Hvordan kan jeg hjelpe deg?", "Hallo! Hva kan jeg bistå med?"],
    "farewell": ["Ha det bra! Kom gjerne tilbake.", "Snakkes! Ha en fin dag videre."],
    "feelings": [
        "Skjønner. Pust rolig inn og ut – det hjelper 🌬️",
        "Takk som spør – jeg har det fint. Hvordan har du det?",
    ],
    "jokes": [
        "Hva sa null til åtte? – Fin belte! 😄",
        "Hva kaller man en fisk uten øyne? – Fsk 🐟",
    ],
    "gratitude": ["Bare hyggelig! 😊", "Ingen årsak – anytime!"],
}

def _normalize(text: str) -> str:
    # Ryddig, regex-fri normalisering (hindrer regex-backtracking helt)
    return " ".join((text or "").lower().split())

def load_responses():
    if os.path.exists(RESPONSES_FILE):
        try:
            with open(RESPONSES_FILE, "r", encoding="utf-8") as file:
                data = json.load(file)
                # Normaliser nøkler
                return { _normalize(k): v for k, v in data.items() }
        except json.JSONDecodeError:
            # Ta vare på korrupt fil
            try:
                os.replace(RESPONSES_FILE, BACKUP_FILE)
            except Exception:
                pass
            return {}
    return {}

def save_responses(responses):
    with open(RESPONSES_FILE, "w", encoding="utf-8") as file:
        json.dump(responses, file, indent=4, ensure_ascii=False)

def _simple_tokens(s: str) -> List[str]:
    # Fallback-tokenizer: beholdes, men inputlengden er allerede cap’et i API-laget.
    return [t for t in re.findall(r"\w+", s.lower(), flags=re.UNICODE) if t]

def extract_keywords(message: str) -> List[str]:
    if nlp is None:
        return _simple_tokens(message)
    doc = nlp(message)
    return [t.lemma_.lower() for t in doc if not t.is_stop and not t.is_punct and t.lemma_.strip()]

def match_category(message: str):
    keywords = set(extract_keywords(message))
    for category, phrases in CATEGORIES.items():
        for phrase in phrases:
            phrase_keywords = set(extract_keywords(phrase))
            # Krev litt overlapp for å unngå støy
            overlap = len(keywords & phrase_keywords)
            if overlap >= max(1, min(2, len(phrase_keywords))):
                return category
    return None

def detect_intent(message: str):
    m = message.lower()
    if any(w in m for w in ["føler", "trist", "lei", "stressa", "nervøs"]):
        return "feelings"
    if "vits" in m:
        return "jokes"
    if m.startswith(("hva ", "hvordan ", "når ", "kan du")):
        return "question"
    return None

def jaccard_similarity(a_tokens: List[str], b_tokens: List[str]) -> float:
    a, b = set(a_tokens), set(b_tokens)
    if not a and not b:
        return 0.0
    return len(a & b) / len(a | b)

def better_match(message: str, known_messages, min_sim=0.45):
    input_keywords = extract_keywords(message)
    best_match = None
    best_score = 0.0
    for known in known_messages:
        known_keywords = extract_keywords(known)
        score = jaccard_similarity(input_keywords, known_keywords)
        if score > best_score:
            best_score = score
            best_match = known
    return best_match if best_score >= min_sim else None

def handle_math(message: str):
    """
    Regex-fri parser for enkle uttrykk: <int><op><int>, med valgfritt whitespace.
    Støtter + - * /
    """
    s = (message or "").strip()
    if not s:
        return None

    # Finn første støttede operator og forsøk å splitte i to deler
    for operator in "+-*/":
        if operator in s:
            left, right = s.split(operator, 1)
            left, right = left.strip(), right.strip()
            if left.isdigit() and right.isdigit():
                a, b = int(left), int(right)
                try:
                    if operator == '+':
                        result = a + b
                        return f"{a} + {b} = {result}. Hvis du har {a} epler og får {b} til, har du {result} 🍎"
                    if operator == '-':
                        result = a - b
                        return f"{a} - {b} = {result}. Hvis du har {a} kjeks og spiser {b}, har du {result} 🍪"
                    if operator == '*':
                        result = a * b
                        return f"{a} * {b} = {result}. {a} esker med {b} kuler blir {result} 🎯"
                    if operator == '/':
                        if b == 0:
                            return "Du kan ikke dele på 0!"
                        result = a / b
                        return f"{a} / {b} = {result}. {a} godteri delt på {b} personer = {result:.2f} 🍬"
                except Exception as e:
                      # Optional: log or print the error here for debugging if needed
                    # print(f"Utregningsfeil: {e}")  # Or use logging
                    return "Beklager, det oppsto en feil i utregningen."
            return None
    return None

def teach_mode(message: str, responses: dict):
    """
    Lær: hei på deg => Hei! Godt å se deg.
    eller
    lær: trigger | svar
    """
    m = _normalize(message)
    if not (m.startswith("lær:") or m.startswith("laer:") or m.startswith("teach:")):
        return None

    payload = m.split(":", 1)[1].strip()
    if "=>" in payload:
        trigger, reply = [p.strip() for p in payload.split("=>", 1)]
    elif "|" in payload:
        trigger, reply = [p.strip() for p in payload.split("|", 1)]
    else:
        return "Bruk formatet: «lær: trigger => svar»"

    if not trigger or not reply:
        return "Kunne ikke lese trigger/svar. Prøv: «lær: hei => Hei på deg!»"

    responses[_normalize(trigger)] = reply
    return f"Lagret! Når du sier «{trigger}», svarer jeg «{reply}»."

def get_response(message: str, responses: dict, last_input: str | None = None):
    original = message
    message = _normalize(message)
    message = ALIASES.get(message, message)

    # Teach-mode
    taught = teach_mode(original, responses)
    if taught:
        return taught

    # Direkte treff i lærte svar
    if message in responses:
        return responses[message]

    # Matte
    math = handle_math(message)
    if math:
        return math

    # Kategori/intent
    matched_category = match_category(message) or detect_intent(message)
    if matched_category:
        # Hvis kategorien finnes i svar.json, bruk den; ellers fallback
        if matched_category in responses:
            resp = responses[matched_category]
            return random.choice(resp) if isinstance(resp, list) else resp
        else:
            candidates = DEFAULT_CATEGORY_RESPONSES.get(matched_category)
            if candidates:
                return random.choice(candidates)

    # Fuzzy mot kjente meldinger
    token_match = better_match(message, responses.keys())
    if token_match:
        return responses[token_match]

    # Enkel kontekst: hvis forrige input var en vits, anta “en til”
    if last_input and "vits" in _normalize(last_input) and "en til" in message:
        jokes = DEFAULT_CATEGORY_RESPONSES["jokes"]
        return random.choice(jokes)

    return "Beklager, jeg forstod ikke. Prøv igjen! 🔄"
