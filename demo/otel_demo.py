"""Same weather agent with plain OpenTelemetry + GenAI semantic conventions.
Backend is chosen purely by env vars (see .env.example): Langfuse, LangSmith, Datadog, Collector...

Run: python otel_demo.py            (exports via OTLP/HTTP)
     python otel_demo.py --console  (also prints spans to the terminal, handy for teaching)
"""
import sys

from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from openai import OpenAI
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter, SimpleSpanProcessor
from opentelemetry.trace import Status, StatusCode

from tools import build_messages, get_weather_impl, search_docs_impl

provider = TracerProvider(resource=Resource.create({"service.name": "weather-agent"}))
provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter()))  # reads OTEL_EXPORTER_OTLP_* env vars
if "--console" in sys.argv:
    provider.add_span_processor(SimpleSpanProcessor(ConsoleSpanExporter()))
trace.set_tracer_provider(provider)
tracer = trace.get_tracer("weather-agent")
client = OpenAI()
MODEL = "gpt-4o-mini"


def search_docs(question: str) -> list[str]:
    with tracer.start_as_current_span("retrieval docs") as span:
        span.set_attribute("gen_ai.operation.name", "retrieval")
        span.set_attribute("gen_ai.data_source.id", "docs")
        docs = search_docs_impl(question)
        span.set_attribute("retrieval.documents.count", len(docs))
        return docs


def get_weather(city: str) -> dict:
    with tracer.start_as_current_span("execute_tool get_weather") as span:
        span.set_attribute("gen_ai.operation.name", "execute_tool")
        span.set_attribute("gen_ai.tool.name", "get_weather")
        for attempt in range(3):
            try:
                result = get_weather_impl(city)
                span.set_attribute("tool.retries", attempt)
                return result
            except TimeoutError as e:
                span.add_event("retry", {"attempt": attempt + 1, "error": str(e)})
                if attempt == 2:
                    span.set_status(Status(StatusCode.ERROR, str(e)))
                    span.set_attribute("error.type", "TimeoutError")
                    raise


def call_llm(messages: list[dict]) -> str:
    with tracer.start_as_current_span(f"chat {MODEL}", kind=trace.SpanKind.CLIENT) as span:
        span.set_attribute("gen_ai.operation.name", "chat")
        span.set_attribute("gen_ai.provider.name", "openai")
        span.set_attribute("gen_ai.request.model", MODEL)
        resp = client.chat.completions.create(model=MODEL, messages=messages)
        span.set_attribute("gen_ai.response.model", resp.model)
        span.set_attribute("gen_ai.usage.input_tokens", resp.usage.prompt_tokens)
        span.set_attribute("gen_ai.usage.output_tokens", resp.usage.completion_tokens)
        span.set_attribute("gen_ai.response.finish_reasons", [c.finish_reason for c in resp.choices])
        # Prompt/response content is opt-in under the conventions; shown here for teaching
        span.set_attribute("input.value", messages[-1]["content"])
        span.set_attribute("output.value", resp.choices[0].message.content)
        return resp.choices[0].message.content


def answer_question(question: str) -> str:
    with tracer.start_as_current_span("invoke_agent weather-agent") as span:
        span.set_attribute("gen_ai.operation.name", "invoke_agent")
        span.set_attribute("gen_ai.agent.name", "weather-agent")
        span.set_attribute("user.id", "user-42")
        docs = search_docs(question)
        weather = get_weather("Paris")
        return call_llm(build_messages(question, docs, weather))


if __name__ == "__main__":
    print(answer_question("What's the weather in Paris, and should I carry an umbrella?"))
    provider.force_flush()
    provider.shutdown()
