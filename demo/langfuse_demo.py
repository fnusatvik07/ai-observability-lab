"""Weather agent traced with the Langfuse Python SDK (v3, OTel-based).

Env: LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_BASE_URL=http://localhost:3000, OPENAI_API_KEY
Run: python langfuse_demo.py
"""
import uuid

from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from langfuse import get_client, observe, propagate_attributes
from langfuse.openai import OpenAI  # drop-in: every call becomes a "generation"

from tools import build_messages, get_weather_impl, search_docs_impl

client = OpenAI()
langfuse = get_client()


@observe(as_type="retriever")
def search_docs(question: str) -> list[str]:
    return search_docs_impl(question)


@observe(as_type="tool")
def get_weather(city: str) -> dict:
    for attempt in range(3):
        try:
            return get_weather_impl(city)
        except TimeoutError:
            if attempt == 2:
                raise


@observe(as_type="agent")
def answer_question(question: str, user_id: str, session_id: str) -> str:
    with propagate_attributes(
        user_id=user_id,
        session_id=session_id,
        tags=["demo", "weather-agent"],
        metadata={"prompt_version": "v1"},
    ):
        docs = search_docs(question)
        weather = get_weather("Paris")
        response = client.chat.completions.create(
            name="answer-llm",
            model="gpt-4o-mini",
            messages=build_messages(question, docs, weather),
        )
        return response.choices[0].message.content


if __name__ == "__main__":
    session = f"session-{uuid.uuid4().hex[:6]}"
    for q in [
        "What's the weather in Paris, and should I carry an umbrella?",
        "Is it cold enough for a jacket there?",
    ]:
        print(answer_question(q, user_id="user-42", session_id=session), "\n")
    langfuse.flush()  # short-lived script: send buffered spans before exit
