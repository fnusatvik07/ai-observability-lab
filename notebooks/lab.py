"""Shared helpers for the notebooks: the demo agent's fake tools, chart styling,
a trace waterfall renderer and a tiny client for the Langfuse v2 read API."""
from __future__ import annotations

import os
import random
import time
from pathlib import Path

import json
import logging

import matplotlib.pyplot as plt
import pandas as pd
import requests
from dotenv import load_dotenv
from IPython.display import HTML, display

logging.getLogger("matplotlib.font_manager").setLevel(logging.ERROR)

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

# ---------------------------------------------------------------- palette

INK = "#0B1020"
PANEL = "#121933"
GRID = "#243052"
TEXT = "#E2E8F0"
MUTED = "#94A3B8"
KIND_COLORS = {
    "agent": "#8B5CF6",
    "chain": "#8B5CF6",
    "span": "#64748B",
    "retriever": "#22D3EE",
    "retrieval": "#22D3EE",
    "tool": "#F59E0B",
    "generation": "#2DD4BF",
    "llm": "#2DD4BF",
    "chat": "#2DD4BF",
    "embedding": "#60A5FA",
    "guardrail": "#F472B6",
    "evaluator": "#A3E635",
    "error": "#F43F5E",
    "whole request": "#8B5CF6",
    "step": "#F59E0B",
    "ai call": "#2DD4BF",
}
SERIES = ["#2DD4BF", "#8B5CF6", "#F59E0B", "#22D3EE", "#F472B6", "#A3E635"]


def use_style() -> None:
    """Dark, low-chrome chart style that matches the notebook banners."""
    plt.rcParams.update(
        {
            "figure.facecolor": INK,
            "axes.facecolor": PANEL,
            "savefig.facecolor": INK,
            "axes.edgecolor": GRID,
            "axes.labelcolor": MUTED,
            "axes.titlecolor": TEXT,
            "axes.titleweight": "bold",
            "axes.titlesize": 13,
            "axes.titlelocation": "left",
            "axes.titlepad": 14,
            "axes.grid": True,
            "axes.axisbelow": True,
            "grid.color": GRID,
            "grid.linewidth": 0.6,
            "axes.spines.top": False,
            "axes.spines.right": False,
            "xtick.color": MUTED,
            "ytick.color": TEXT,
            "font.family": "sans-serif",
            "font.sans-serif": ["Inter", "Helvetica Neue", "Helvetica", "Arial", "DejaVu Sans"],
            "font.size": 11,
            "axes.prop_cycle": plt.cycler(color=SERIES),
            "figure.dpi": 110,
        }
    )


use_style()


def callout(title: str, body: str, tone: str = "teal") -> None:
    """Render a small styled card in the output area (used for check results)."""
    color = {"teal": "#2DD4BF", "amber": "#F59E0B", "rose": "#F43F5E", "violet": "#8B5CF6"}[tone]
    display(
        HTML(
            f"""<div style="border-left:4px solid {color};background:{PANEL};color:{TEXT};
            padding:12px 16px;border-radius:8px;margin:6px 0;font-family:Inter,Helvetica,Arial,sans-serif">
            <div style="font-weight:700;color:{color};letter-spacing:.04em">{title}</div>
            <div style="margin-top:4px;color:{TEXT}">{body}</div></div>"""
        )
    )


# ---------------------------------------------------------------- waterfall


def _tree_order(spans: pd.DataFrame) -> pd.DataFrame:
    """Depth-first order (parent, then children by start time) when ids are available."""
    if not {"id", "parent"} <= set(spans.columns):
        return spans.sort_values(["start", "depth"]).reset_index(drop=True)
    spans = spans.sort_values(["start", "duration"])  # siblings starting together: the quick one ran first
    children: dict = {}
    for idx, parent in zip(spans.index, spans["parent"]):
        children.setdefault(parent if parent in set(spans["id"]) else None, []).append(idx)
    order: list = []
    stack = list(reversed(children.get(None, [])))
    while stack:
        idx = stack.pop()
        order.append(idx)
        stack.extend(reversed(children.get(spans.at[idx, "id"], [])))
    return spans.loc[order].reset_index(drop=True)


def waterfall(spans: pd.DataFrame, title: str = "Trace waterfall") -> None:
    """Draw a trace as nested horizontal bars, the way tracing UIs do.

    Expects columns: name, kind, start (s from trace start), duration (s), depth,
    and optionally label (text shown after the bar) and error (bool).
    """
    spans = _tree_order(spans)
    total = (spans["start"] + spans["duration"]).max()
    height = 0.55 * len(spans) + 1.5
    fig, (names, ax) = plt.subplots(
        1, 2, figsize=(12, height), sharey=True, gridspec_kw={"width_ratios": [1, 2.6], "wspace": 0.02}
    )
    for i, row in spans.iterrows():
        kind = str(row["kind"]).lower()
        color = KIND_COLORS["error"] if row.get("error") else KIND_COLORS.get(kind, "#64748B")
        ax.barh(i, max(row["duration"], total * 0.004), left=row["start"], height=0.58, color=color, zorder=3)
        note = row.get("label") or f"{row['duration'] * 1000:.0f} ms"
        ax.text(row["start"] + row["duration"] + total * 0.01, i, note, va="center", color=MUTED, fontsize=9.5)
        indent = 0.04 + 0.07 * int(row["depth"])
        names.scatter(indent, i, s=46, color=color, zorder=3)
        names.text(indent + 0.045, i, row["name"], va="center", color=TEXT, fontsize=10.5)
        names.text(0.985, i, kind, va="center", ha="right", color=MUTED, fontsize=8.5)
    names.set_xlim(0, 1)
    names.axis("off")
    ax.invert_yaxis()
    ax.set_xlim(0, total * 1.32)
    ax.set_xlabel("seconds since trace start")
    ax.grid(axis="y", visible=False)
    ax.tick_params(axis="y", left=False, labelleft=False)
    ax.spines["left"].set_visible(False)
    fig.suptitle(title, x=0.012, ha="left", color=TEXT, fontweight="bold", fontsize=13)
    fig.subplots_adjust(left=0.01, right=0.99, top=1 - 0.55 / height, bottom=0.6 / height)
    plt.show()


# ---------------------------------------------------------------- demo agent tools

DOCS = {
    "umbrella": "Carry an umbrella if the chance of rain is above 40%.",
    "jacket": "Wear a jacket when it is below 16 degrees Celsius.",
    "refund": "Refunds are accepted within 30 days of purchase.",
}
CITIES = {
    "Paris": {"temp_c": 14, "rain_chance": 70},
    "Tokyo": {"temp_c": 21, "rain_chance": 20},
    "London": {"temp_c": 11, "rain_chance": 85},
    "Dubai": {"temp_c": 33, "rain_chance": 0},
}


def search_docs_impl(question: str) -> list[str]:
    time.sleep(random.uniform(0.12, 0.25))
    return [text for key, text in DOCS.items() if key in question.lower()]


def get_weather_impl(city: str, flaky: bool = True) -> dict:
    """A deliberately unreliable weather API: usually fast, sometimes slow, occasionally times out."""
    time.sleep(random.choice([0.25, 0.3, 0.35, 1.4]))
    if flaky and random.random() < 0.15:
        raise TimeoutError(f"weather API timed out for {city}")
    return {"city": city, **CITIES.get(city, {"temp_c": 18, "rain_chance": 30})}


def build_messages(question: str, docs: list[str], weather: dict, style: str = "concise") -> list[dict]:
    system = {
        "concise": "You are a travel assistant. Answer in at most two sentences using only the context.",
        "friendly": "You are a warm, chatty travel assistant. Use the context and add a helpful tip.",
    }[style]
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": f"Context docs: {docs}\nWeather: {weather}\n\nQuestion: {question}"},
    ]


# ---------------------------------------------------------------- Langfuse v2 read API

LANGFUSE_URL = os.getenv("LANGFUSE_BASE_URL", "http://localhost:3000")


def langfuse_observations(
    limit: int = 500, fields: str = "core,basic,usage,model,metadata", **filters
) -> pd.DataFrame:
    """Fetch observations from Langfuse's v2 Observations API into a DataFrame.

    `fields` picks column groups (add `io` for inputs and outputs); keyword filters
    such as traceId, userId, name, type or level are passed through as query params.
    """
    params = {"limit": min(limit, 1000), "fields": fields, **filters}
    resp = requests.get(
        f"{LANGFUSE_URL}/api/public/v2/observations",
        params=params,
        auth=(os.environ["LANGFUSE_PUBLIC_KEY"], os.environ["LANGFUSE_SECRET_KEY"]),
        timeout=30,
    )
    resp.raise_for_status()
    df = pd.DataFrame(resp.json()["data"])
    if df.empty:
        return df
    for col in ("startTime", "endTime"):
        df[col] = pd.to_datetime(df[col])
    df["type"] = df["type"].str.lower()
    if "output" in df:
        df["output_text"] = df["output"].map(_message_text)
    return df


def _message_text(value) -> str:
    """Langfuse returns chat outputs as a JSON string like {"role": ..., "content": ...}."""
    if isinstance(value, str):
        try:
            value = json.loads(value)
        except ValueError:
            return value
    if isinstance(value, dict):
        return value.get("content") or ""
    return "" if value is None else str(value)


def trace_frame(obs: pd.DataFrame, trace_id: str) -> pd.DataFrame:
    """Convert one trace's observations into the shape `waterfall` expects."""
    t = obs[obs["traceId"] == trace_id].copy()
    parents = dict(zip(t["id"], t["parentObservationId"]))

    def depth(oid):
        d = 0
        while parents.get(oid):
            oid = parents[oid]
            d += 1
        return d

    t0 = t["startTime"].min()
    t["start"] = (t["startTime"] - t0).dt.total_seconds()
    t["duration"] = (t["endTime"] - t["startTime"]).dt.total_seconds()
    t["depth"] = t["id"].map(depth)
    t["kind"] = t["type"]
    t["parent"] = t["parentObservationId"]
    t["error"] = t["level"].eq("ERROR")

    def label(r):
        bits = [f"{r['duration'] * 1000:.0f} ms"]
        usage = r.get("usageDetails")
        if isinstance(usage, dict) and usage.get("total"):
            bits.append(f"{usage['total']} tok")
        cost = r.get("totalCost")
        if pd.notna(cost) and cost:
            bits.append(f"${cost:.6f}")
        return "  ·  ".join(bits)

    t["label"] = t.apply(label, axis=1)
    return t[["id", "parent", "name", "kind", "start", "duration", "depth", "label", "error"]]


def show_trace(trace_id: str, title: str = "Trace waterfall") -> pd.DataFrame:
    """Fetch one trace from Langfuse and draw it. Returns the observations."""
    obs = langfuse_observations(traceId=trace_id)
    waterfall(trace_frame(obs, trace_id), title)
    return obs


# ---------------------------------------------------------------- beginner helpers


def spans_frame(spans) -> pd.DataFrame:
    """Turn finished OpenTelemetry spans into a simple table: one row per step."""
    t0 = min(s.start_time for s in spans)
    ids = {s.context.span_id for s in spans}
    names = {s.context.span_id: s.name for s in spans}
    rows = []
    for s in spans:
        parent = s.parent.span_id if s.parent and s.parent.span_id in ids else None
        rows.append(
            {
                "id": s.context.span_id,
                "parent": parent,
                "step (span)": s.name,
                "inside of": names.get(parent, "(nothing, this is the whole request)"),
                "took": f"{(s.end_time - s.start_time) / 1e9:.2f} s",
                "name": s.name,
                "kind": "whole request" if parent is None else ("ai call" if "ai" in s.name.lower() else "step"),
                "start": (s.start_time - t0) / 1e9,
                "duration": (s.end_time - s.start_time) / 1e9,
                "depth": 0 if parent is None else 1,
            }
        )
    return pd.DataFrame(rows).sort_values("start").reset_index(drop=True)


def draw_spans(spans, title: str = "One request, step by step") -> None:
    """Draw finished OpenTelemetry spans as a timeline (a 'waterfall')."""
    frame = spans_frame(spans)
    waterfall(frame[["id", "parent", "name", "kind", "start", "duration", "depth"]], title)


# ---------------------------------------------------------------- LangSmith read helpers

LANGSMITH_KIND = {"llm": "generation", "tool": "tool", "retriever": "retriever", "embedding": "embedding"}


def langsmith_trace(run_id, tries: int = 20):
    """Read a LangSmith run and all its child runs, waiting for ingestion if needed."""
    from langsmith import Client

    client = Client()
    for _ in range(tries):
        try:
            return client.read_run(run_id, load_child_runs=True)
        except Exception:
            time.sleep(2)
    raise RuntimeError(f"run {run_id} did not appear in LangSmith; check LANGSMITH_API_KEY and LANGSMITH_TRACING")


def langsmith_frame(root) -> pd.DataFrame:
    """Flatten a LangSmith run tree into the shape `waterfall` expects."""
    rows = []

    def walk(run, depth, parent):
        start = (run.start_time - root.start_time).total_seconds()
        duration = ((run.end_time or run.start_time) - run.start_time).total_seconds()
        bits = [f"{duration * 1000:.0f} ms"]
        if run.run_type == "llm" and run.total_tokens:
            bits.append(f"{run.total_tokens} tok")
            if run.total_cost:
                bits.append(f"${float(run.total_cost):.6f}")
        kind = LANGSMITH_KIND.get(run.run_type, "agent" if depth == 0 else "span")
        rows.append(
            {"id": str(run.id), "parent": parent, "name": run.name, "kind": kind, "start": start,
             "duration": duration, "depth": depth, "label": "  ·  ".join(bits), "error": bool(run.error)}
        )
        for child in sorted(run.child_runs or [], key=lambda c: c.start_time):
            walk(child, depth + 1, str(run.id))

    walk(root, 0, None)
    return pd.DataFrame(rows)


def show_langsmith_trace(run_id, title: str = "Trace from LangSmith"):
    """Fetch a run tree from LangSmith, draw it, and return the root run."""
    root = langsmith_trace(run_id)
    waterfall(langsmith_frame(root), title)
    return root
