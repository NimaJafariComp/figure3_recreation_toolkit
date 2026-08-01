#!/usr/bin/env bash
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
PREVIEWS="$ROOT/previews"
mkdir -p "$PREVIEWS"

if command -v pdflatex >/dev/null 2>&1 || command -v tectonic >/dev/null 2>&1; then
  "$ROOT/scripts/render_tikz.sh"
  echo "Rendered TikZ scenario, problem bank, schema detail, and atlas"
else
  echo "Skipped TikZ: pdflatex and tectonic are not installed"
fi

if command -v dot >/dev/null 2>&1; then
  dot -Tsvg "$ROOT/graphviz/p8.dot" -o "$PREVIEWS/p8_graphviz.svg"
  dot -Tpng "$ROOT/graphviz/p8.dot" -o "$PREVIEWS/p8_graphviz.png"
  dot -Tsvg "$ROOT/graphviz/scenario_trace.dot" -o "$PREVIEWS/scenario_trace_graphviz.svg"
  dot -Tpng "$ROOT/graphviz/scenario_trace.dot" -o "$PREVIEWS/scenario_trace_graphviz.png"
  dot -Tsvg "$ROOT/graphviz/problem_bank.dot" -o "$PREVIEWS/problem_bank_graphviz.svg"
  dot -Tpng "$ROOT/graphviz/problem_bank.dot" -o "$PREVIEWS/problem_bank_graphviz.png"
  for generated_dot in "$ROOT"/generated/*_from_model.dot; do
    generated_name=$(basename "${generated_dot%.dot}")
    dot -Tsvg "$generated_dot" -o "$PREVIEWS/${generated_name}_graphviz.svg"
  done
  echo "Rendered Graphviz scenario, problem bank, and schema details"
else
  echo "Skipped Graphviz: dot not installed"
fi

if command -v mmdc >/dev/null 2>&1; then
  for mermaid_source in "$ROOT"/mermaid/*.mmd "$ROOT"/generated/*_from_model.mmd; do
    mermaid_name=$(basename "${mermaid_source%.mmd}")
    mmdc -i "$mermaid_source" -o "$PREVIEWS/${mermaid_name}_mermaid.svg"
  done
  echo "Rendered all Mermaid views"
else
  echo "Skipped Mermaid: mmdc not installed"
fi

if command -v d2 >/dev/null 2>&1; then
  d2 --layout=elk "$ROOT/d2/p8.d2" "$PREVIEWS/p8_d2.svg"
  d2 --layout=elk "$ROOT/d2/figure3_overview.d2" "$PREVIEWS/scenario_trace_d2.svg"
  d2 --layout=elk "$ROOT/d2/problem_bank.d2" "$PREVIEWS/problem_bank_d2.svg"
  echo "Rendered D2 scenario, problem bank, and schema detail"
else
  echo "Skipped D2: d2 not installed"
fi

if command -v inkscape >/dev/null 2>&1; then
  inkscape "$ROOT/gui/p8_editable.svg" --export-filename="$PREVIEWS/p8_inkscape.png" >/dev/null 2>&1
  for tikz_view in scenario_trace problem_bank p8; do
    if test -f "$ROOT/tikz/$tikz_view.pdf"; then
      inkscape "$ROOT/tikz/$tikz_view.pdf" \
        --export-filename="$PREVIEWS/${tikz_view}_tikz.svg" >/dev/null 2>&1
      inkscape "$PREVIEWS/${tikz_view}_tikz.svg" \
        --export-filename="$PREVIEWS/${tikz_view}_tikz.png" >/dev/null 2>&1
    fi
  done
  echo "Rendered Inkscape SVG preview"
else
  echo "Skipped Inkscape raster preview: inkscape not installed"
fi
