"""Shared fake tools for the weather agent demo (no external APIs besides OpenAI)."""
import random
import time

DOCS = {
    "umbrella": "Carry an umbrella if the chance of rain is above 40%.",
    "refund": "Refunds are accepted within 30 days of purchase.",
}


def search_docs_impl(question: str) -> list[str]:
    time.sleep(0.2)
    return [text for key, text in DOCS.items() if key in question.lower()]


def get_weather_impl(city: str) -> dict:
    # Simulate a flaky upstream API so the trace shows a slow span and retries
    delay = random.choice([0.3, 0.3, 1.5])
    time.sleep(delay)
    if random.random() < 0.15:
        raise TimeoutError(f"weather API timed out for {city}")
    return {"city": city, "temp_c": 14, "rain_chance": 70}


def build_messages(question: str, docs: list[str], weather: dict) -> list[dict]:
    return [
        {"role": "system", "content": "You are a helpful travel assistant. Use the context."},
        {"role": "user", "content": f"Context docs: {docs}\nWeather: {weather}\n\nQuestion: {question}"},
    ]
