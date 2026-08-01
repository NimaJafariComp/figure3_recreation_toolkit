# Editing the semantic views in Ipe

The Ipe route uses the same three-view architecture as every code renderer. Load
`wd-figure3.isy`, then create separate `.ipe` documents for the scenario trace,
problem bank, and any expanded schema detail.

## Scenario trace

Use a narrow vertical canvas. Place the grocery-delivery initial and goal states in
one group at the top, then place each reasoning operation in order:

`generalize R1` → `specialize E=G_i, d=C` → `linear decomposition` →
`generalize P6` → `specialize V=M, E=C` → `resolve` →
`generalize P8` → `specialize V=M, d=C` → `resolve`.

Keep `R1`, `P6`, and `P8` as compact references. Their full definitions belong in
the problem bank.

## Problem bank

Create three independent cards, one for each reusable schema. Each card contains:

1. identifier and parameters;
2. initial and goal states;
3. every decomposition state in order;
4. resolution source, action, and target when defined.

The cards may be arranged horizontally for a wide page or vertically for a narrow
page. Their placement carries no semantic meaning.

## Schema detail

Open `p8_editable.svg` as the geometry reference. Use separate Ipe layers named
`header`, `problem`, `operations`, `decomposition`, and `wiring`.

- State cards are labeled configurations.
- Meta-operation connectors use `metaOperation`.
- The resolved process wire uses `processPen`.
- Colors and card shapes may change; operation names and all properties may not.

Export each document independently to PDF or SVG. Compose them only after the
standalone figures are readable at their intended publication size.
