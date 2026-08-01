# Graphviz + dot2tex

This route adds native LaTeX labels to the semantic Graphviz layouts.

Render the detailed P8 definition:

```bash
dot2tex -ftikz -traw --autosize --tikzedgelabels \
  dot2tex/p8_texlabels.dot -o p8_dot2tex.tex
```

The scenario trace and problem bank use the renderer-neutral DOT files directly:

```bash
dot2tex -ftikz graphviz/scenario_trace.dot -o scenario_trace_dot2tex.tex
dot2tex -ftikz graphviz/problem_bank.dot -o problem_bank_dot2tex.tex
```

The layouts preserve semantic roles rather than the original Figure 3 geometry:
state cards hold configurations, hexagonal nodes name graph operations, schema
references remain compact, and solid labeled edges are reserved for process wires.
