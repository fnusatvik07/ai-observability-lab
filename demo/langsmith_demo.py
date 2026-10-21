"""Same weather agent traced with LangSmith.

Env: LANGSMITH_TRACING=true, LANGSMITH_API_KEY, LANGSMITH_PROJECT=ai-observability-demo, OPENAI_API_KEY
Run: python langsmith_demo.py
"""
import uuid

from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from langsmith import traceable
from langsmith.wrappers import wrap_openai
from openai import OpenAI

from tools import build_messages, get_weather_impl, search_docs_impl

client = wrap_openai(OpenAI())  # every call becomes an "llm" run with tokens + cost


@traceable(run_type="retriever")
def search_docs(question: str) -> list[str]:
    return search_docs_impl(question)


@traceable(run_type="tool")
def get_weather(city: str) -> dict:
    for attempt in range(3):
        try:
            return get_weather_impl(city)
        except TimeoutError:
            if attempt == 2:
                raise


@traceable(name="answer_question", tags=["demo"], metadata={"prompt_version": "v1"})
def answer_question(question: str) -> str:
    docs = search_docs(question)
    weather = get_weather("Paris")
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=build_messages(question, docs, weather),
    )
    return response.choices[0].message.content


if __name__ == "__main__":
    thread_id = str(uuid.uuid4())  # groups turns into a LangSmith "thread"
    for q in [
        "What's the weather in Paris, and should I carry an umbrella?",
        "Is it cold enough for a jacket there?",
    ]:
        print(answer_question(q, langsmith_extra={"metadata": {"thread_id": thread_id, "user_id": "user-42"}}), "\n")
