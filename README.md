# Figure 3 semantic diagram toolkit

This repository recreates the meaning of Figure 3 as scalable, reproducible graph
sources. It preserves the grocery-delivery scenario, reusable problem definitions,
parameters, state properties, graph operations, substitutions, and resolved process
wires. It does not preserve the original PowerPoint geometry.

## View architecture

Every renderer targets the same three independent views:

| View | Purpose |
|---|---|
| Scenario trace | Shows the grocery-delivery reasoning sequence and compact references to R1, P6, and P8 |
| Problem bank | Shows R1, P6, and P8 as reusable definitions, independent of scenario placement |
| Schema detail | Expands one definition into its problem, decomposition, and resolved wiring diagram |

The split keeps the scenario readable while allowing the reusable definitions to
scale, reorder, or move to another page without changing their meaning.

## Interactive React viewer

The browser viewer reads `shared/figure3_model.yaml` directly and presents the
three views as an interactive, pan-and-zoom graph:

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. Use **Scenario trace** for the operation sequence,
**Problem bank** for the standalone R1/P6/P8 definitions, and **Schema detail**
for one definition's ordered states and process wiring.

Production output is written to `dist/web`:

```bash
npm run build
```

## Semantic source of truth

[`shared/figure3_model.yaml`](shared/figure3_model.yaml) contains:

- R1, P6, and P8 parameters;
- initial and goal states;
- ordered decomposition states;
- resolution sources, targets, and actions;
- the ordered grocery-delivery reasoning operations.

[`shared/visual_grammar.md`](shared/visual_grammar.md) defines the semantic
distinctions every renderer must retain. Shapes, colors, borders, and orientation
are presentation choices.

## Build everything available

```bash
make all
```

On first use, the Makefile creates `.venv` and installs PyYAML. It always regenerates
the schema DOT and Mermaid files, then renders every locally available tool.
Unavailable optional tools are reported as skipped.

Focused targets:

```bash
make generate
make graphviz
make tikz
make render
make web
```

## Formats

### Mermaid

| Source | View |
|---|---|
| `mermaid/figure3_overview.mmd` | Scenario trace |
| `mermaid/problem_bank.mmd` | Problem bank |
| `mermaid/p8_flowchart.mmd` | P8 schema detail |
| `mermaid/p8_block_experimental.mmd` | Compact P8 bank card |
| `generated/*_from_model.mmd` | Generated individual schema details |

Render one source:

```bash
npx -y @mermaid-js/mermaid-cli \
  -i mermaid/figure3_overview.mmd \
  -o previews/figure3_overview.svg
```

### Graphviz

| Source | View |
|---|---|
| `graphviz/scenario_trace.dot` | Scenario trace |
| `graphviz/problem_bank.dot` | Problem bank |
| `graphviz/p8.dot` | P8 schema detail |
| `generated/*_from_model.dot` | Generated individual schema details |

```bash
make graphviz
```

### TikZ

| Source | View |
|---|---|
| `tikz/scenario_trace.tex` | Scenario trace |
| `tikz/problem_bank.tex` | Problem bank |
| `tikz/p8.tex` | P8 schema detail |
| `tikz/figure3_full.tex` | Two-page scenario + bank atlas |

Shared styles live in `tikz/semantic_styles.tex`.

```bash
make tikz
```

The build uses `pdflatex` when available and falls back to Tectonic.

### D2

| Source | View |
|---|---|
| `d2/figure3_overview.d2` | Scenario trace |
| `d2/problem_bank.d2` | Problem bank |
| `d2/p8.d2` | P8 schema detail |

```bash
d2 --layout=elk d2/figure3_overview.d2 previews/scenario_trace_d2.svg
d2 --layout=elk d2/problem_bank.d2 previews/problem_bank_d2.svg
d2 --layout=elk d2/p8.d2 previews/p8_d2.svg
```

### Penrose

`penrose/p8.substance` now declares semantic predicates rather than positional state
subtypes. `penrose/p8.style` renders the P8 detail view.

```bash
npx -y @penrose/roger trio penrose/p8.trio.json
```

### dot2tex

`dot2tex/p8_texlabels.dot` is the LaTeX-typography P8 detail. The Graphviz scenario
and bank sources can also be passed directly to dot2tex. See
[`dot2tex/README.md`](dot2tex/README.md).

### Inkscape, diagrams.net, and Ipe

- `gui/p8_editable.svg` is a layered semantic P8 detail.
- `gui/p8.drawio` contains the same editable cards and connectors.
- `gui/wd-figure3.isy` provides role-based Ipe styles.
- `gui/IPE_WORKFLOW.md` describes separate scenario, bank, and detail documents.

## Representation contract

- Preserve all state properties verbatim.
- Display every operation name.
- Display all specialization substitutions.
- Keep process wires visually distinct from operations.
- Do not embed full problem definitions in the scenario trace.
- Do not assign meaning to schema-bank placement.

Any renderer that satisfies this contract is a faithful representation, regardless
of its shapes, colors, outlines, or page layout.
