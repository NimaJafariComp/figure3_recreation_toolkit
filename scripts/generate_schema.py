#!/usr/bin/env python3
"""Generate starter diagrams from the canonical Figure 3 YAML model.

The generator deliberately targets the reusable schema panels (R1, P6, P8),
not the complete hand-composed page. Graphviz/Mermaid handle local graph layout;
TikZ remains the recommended full-page compositor.
"""
from __future__ import annotations

import argparse
import html
from pathlib import Path
from typing import Any

import yaml


def load_model(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    if not isinstance(data, dict) or "schemas" not in data:
        raise ValueError("Model must contain a top-level 'schemas' mapping")
    return data


def validate_schema(name: str, schema: dict[str, Any]) -> None:
    problem = schema.get("problem", {})
    initial = problem.get("initial", [])
    final = problem.get("final", [])
    if not initial or not final:
        raise ValueError(f"{name}: problem must have nonempty initial and final states")

    states = schema.get("decomposition", {}).get("states", [])
    ids = [state.get("id") for state in states]
    if not states or any(not state_id for state_id in ids):
        raise ValueError(f"{name}: decomposition states require nonempty ids")
    if len(ids) != len(set(ids)):
        raise ValueError(f"{name}: decomposition state ids must be unique")

    resolution = schema.get("resolution")
    if resolution:
        for key in ("source", "target", "action"):
            if not resolution.get(key):
                raise ValueError(f"{name}: resolution requires '{key}'")
        if resolution["source"] not in ids or resolution["target"] not in ids:
            raise ValueError(f"{name}: resolution endpoints must name decomposition states")


def table_label(label: str) -> str:
    rows = [html.escape(line) for line in label.splitlines()]
    body = "<BR/>".join(rows)
    return (
        '<<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">'
        '<TR><TD BORDER="1" FIXEDSIZE="TRUE" WIDTH="9" HEIGHT="9"></TD></TR>'
        f"<TR><TD>{body}</TD></TR></TABLE>>"
    )


def dot_id(raw: str) -> str:
    return "".join(ch if ch.isalnum() or ch == "_" else "_" for ch in raw)


def dot_quote(raw: str) -> str:
    return raw.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")


def render_dot(name: str, schema: dict[str, Any]) -> str:
    params = schema.get("parameters", {})
    params_label = "\\n".join(
        f"{dot_quote(str(key))} = {dot_quote(str(value))}"
        for key, value in params.items()
    )
    initial = schema["problem"]["initial"]
    final = schema["problem"]["final"]
    decomp = schema["decomposition"]["states"]
    resolution = schema.get("resolution")
    initial_label = "\\n".join(dot_quote(str(state["label"])) for state in initial)
    final_label = "\\n".join(dot_quote(str(state["label"])) for state in final)
    decomposition_label = "\\n\\n".join(
        f"{index}. {dot_quote(str(state['label']))}"
        for index, state in enumerate(decomp, start=1)
    )

    out = [
        f"digraph {dot_id(name)} {{",
        '  graph [rankdir=TB, bgcolor="white", pad=0.25, nodesep=0.65, ranksep=0.6, fontname="Helvetica"];',
        '  node [shape=box, style="rounded,filled", fillcolor="#FFFFFF", color="#475569", fontcolor="#0F172A", fontname="Helvetica", fontsize=11, margin="0.16,0.10"];',
        '  edge [color="#334155", fontcolor="#334155", fontname="Helvetica", fontsize=10, arrowsize=0.7];',
        f"  subgraph cluster_{dot_id(name)} {{",
        f'    label="{dot_quote(name)} · reusable problem schema";',
        '    color="#334155"; penwidth=1.4; margin=22; fontname="Helvetica"; fontsize=14;',
        f'    params [label="Parameters\\n{params_label}", fillcolor="#F8FAFC", color="#94A3B8"];',
        '    subgraph cluster_problem {',
        '      label="Problem definition"; color="#CBD5E1"; fillcolor="#F8FAFC"; style="rounded,filled";',
        f'      initial [label="Initial state\\n{initial_label}"];',
        f'      final [label="Goal state\\n{final_label}"];',
        '      { rank=same; initial; final; }',
        '      initial -> final [style=invis, weight=20];',
        "    }",
        '    params -> initial [style=invis, weight=10];',
        '    decompose [shape=hexagon, label="linear decomposition", fillcolor="#ECFEFF", color="#0F766E", fontcolor="#134E4A"];',
        f'    decomposition [label="Ordered states\\n\\n{decomposition_label}", fillcolor="#F1F5F9", color="#64748B"];',
        '    initial -> decompose [style=dashed];',
        '    final -> decompose [style=dashed];',
        '    decompose -> decomposition [style=dashed];',
    ]

    if resolution:
        source_label = dot_quote(
            next(
                str(state["label"])
                for state in decomp
                if state["id"] == resolution["source"]
            )
        )
        target_label = dot_quote(
            next(
                str(state["label"])
                for state in decomp
                if state["id"] == resolution["target"]
            )
        )
        action = dot_quote(str(resolution["action"]))
        out += [
            '    resolve [shape=hexagon, label="resolution", fillcolor="#ECFEFF", color="#0F766E", fontcolor="#134E4A"];',
            '    subgraph cluster_wiring {',
            '      label="Resolved wiring diagram"; color="#CBD5E1"; fillcolor="#F8FAFC"; style="rounded,filled";',
            f'      resolved_source [label="{source_label}"];',
            f'      resolved_target [label="{target_label}"];',
            f'      resolved_source -> resolved_target [label="{action}", style=solid, penwidth=1.4];',
            '      { rank=same; resolved_source; resolved_target; }',
            "    }",
            '    decomposition -> resolve [style=dashed];',
            '    resolve -> resolved_source [style=dashed];',
        ]

    out += ["  }", "}"]
    return "\n".join(out) + "\n"


def mermaid_label(label: str) -> str:
    return label.replace('"', "&quot;").replace("\n", "<br/>")


def render_mermaid(name: str, schema: dict[str, Any]) -> str:
    initial = schema["problem"]["initial"]
    final = schema["problem"]["final"]
    decomp = schema["decomposition"]["states"]
    resolution = schema.get("resolution")
    params = "<br/>".join(
        f"{mermaid_label(str(key))} = {mermaid_label(str(value))}"
        for key, value in schema.get("parameters", {}).items()
    )
    initial_text = "<br/>".join(
        mermaid_label(str(state["label"])) for state in initial
    )
    final_text = "<br/>".join(
        mermaid_label(str(state["label"])) for state in final
    )
    decomposition_text = "<br/><br/>".join(
        f"{index}. {mermaid_label(str(state['label']))}"
        for index, state in enumerate(decomp, start=1)
    )

    out = [
        "%% Generated from shared/figure3_model.yaml",
        "flowchart TB",
        f'  subgraph SCHEMA["{name} · reusable problem schema"]',
        "    direction TB",
        f'    params["Parameters<br/>{params}"]',
        '    subgraph PROBLEM["Problem definition"]',
        "      direction LR",
        f'      initial["Initial state<br/>{initial_text}"]',
        f'      final["Goal state<br/>{final_text}"]',
        "      initial ~~~ final",
        "    end",
        '    decompose{{"linear decomposition"}}',
        f'    decomposition["Ordered states<br/><br/>{decomposition_text}"]',
        "    initial -.-> decompose",
        "    final -.-> decompose",
        "    decompose -.-> decomposition",
    ]

    if resolution:
        source_i = next(i for i, s in enumerate(decomp) if s["id"] == resolution["source"])
        target_i = next(i for i, s in enumerate(decomp) if s["id"] == resolution["target"])
        source_label = mermaid_label(decomp[source_i]["label"])
        target_label = mermaid_label(decomp[target_i]["label"])
        action = mermaid_label(str(resolution["action"]))
        out += [
            '    resolve{{"resolution"}}',
            '    subgraph WIRING["Resolved wiring diagram"]',
            "      direction LR",
            f'      resolvedSource["{source_label}"]',
            f'      resolvedTarget["{target_label}"]',
            f'      resolvedSource -->|"{action}"| resolvedTarget',
            "    end",
            "    decomposition -.-> resolve",
            "    resolve -.-> resolvedSource",
        ]
    out += [
        "  end",
        "  classDef state fill:#ffffff,stroke:#475569,color:#0f172a,stroke-width:1px;",
        "  classDef operation fill:#ecfeff,stroke:#0f766e,color:#134e4a,stroke-width:1.5px;",
        "  classDef metadata fill:#f8fafc,stroke:#94a3b8,color:#334155;",
        "  classDef summary fill:#f1f5f9,stroke:#64748b,color:#0f172a;",
        "  class initial,final state;",
        "  class decompose operation;",
        "  class params metadata;",
        "  class decomposition summary;",
        "  style SCHEMA fill:#ffffff,stroke:#334155,stroke-width:1.5px",
        "  style PROBLEM fill:#f8fafc,stroke:#cbd5e1",
    ]
    if resolution:
        out += [
            "  class resolve operation;",
            "  class resolvedSource,resolvedTarget state;",
            "  style WIRING fill:#f8fafc,stroke:#cbd5e1",
        ]
    return "\n".join(out) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=Path, default=Path(__file__).resolve().parents[1] / "shared" / "figure3_model.yaml")
    parser.add_argument("--schema", default="P8")
    parser.add_argument("--format", choices=("dot", "mermaid", "all"), default="all")
    parser.add_argument("--output-dir", type=Path, default=Path(__file__).resolve().parents[1] / "generated")
    args = parser.parse_args()

    model = load_model(args.model)
    try:
        schema = model["schemas"][args.schema]
    except KeyError as exc:
        names = ", ".join(sorted(model["schemas"]))
        raise SystemExit(f"Unknown schema {args.schema!r}; available: {names}") from exc

    validate_schema(args.schema, schema)
    args.output_dir.mkdir(parents=True, exist_ok=True)

    if args.format in ("dot", "all"):
        path = args.output_dir / f"{args.schema.lower()}_from_model.dot"
        path.write_text(render_dot(args.schema, schema), encoding="utf-8")
        print(path)
    if args.format in ("mermaid", "all"):
        path = args.output_dir / f"{args.schema.lower()}_from_model.mmd"
        path.write_text(render_mermaid(args.schema, schema), encoding="utf-8")
        print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
