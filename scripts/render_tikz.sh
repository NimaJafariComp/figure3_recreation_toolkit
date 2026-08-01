#!/usr/bin/env bash
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
TIKZ_DIR="$ROOT/tikz"

render_with_pdflatex() {
  source_name=$1
  (cd "$TIKZ_DIR" && pdflatex -interaction=nonstopmode -halt-on-error "$source_name.tex" >/dev/null)
}

render_with_tectonic() {
  source_name=$1
  (cd "$TIKZ_DIR" && tectonic --chatter minimal "$source_name.tex")
}

if command -v pdflatex >/dev/null 2>&1; then
  renderer=render_with_pdflatex
elif command -v tectonic >/dev/null 2>&1; then
  renderer=render_with_tectonic
else
  echo "TikZ rendering requires pdflatex or tectonic" >&2
  exit 127
fi

"$renderer" scenario_trace
"$renderer" problem_bank
"$renderer" p8
"$renderer" figure3_full
