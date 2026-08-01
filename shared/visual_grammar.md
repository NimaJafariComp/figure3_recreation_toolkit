# Semantic presentation grammar

The toolkit preserves the meaning of Figure 3, not its original page geometry.
Every renderer may choose its own shapes, palette, spacing, and orientation as long
as the same graph definitions, properties, substitutions, and operations remain
explicit.

## Three independent views

1. **Scenario trace**
   - Shows the grocery-delivery initial and goal states.
   - Shows the ordered reasoning operations from `R1` through `P6` and `P8`.
   - Uses compact schema references rather than embedding full schema definitions.

2. **Problem bank**
   - Renders `R1`, `P6`, and `P8` as independent reusable definitions.
   - Shows each schema's parameters, problem states, decomposition states, and
     resolution when one exists.
   - Does not encode where a schema happened to sit in the original figure.

3. **Schema detail**
   - Expands one reusable definition.
   - Separates the unresolved problem, its linear decomposition, and the resolved
     wiring diagram.

## Required semantic distinctions

- A **state** is a labeled configuration. Its shape is unrestricted.
- A **process wire** connects a source state to a target state and carries an
  action label.
- An **operation** transforms a problem or wiring diagram. The operation name must
  be visible: `generalize`, `specialize`, `linear decomposition`, or `resolution`.
- A **specialization** must display every substitution, such as `V = M` and
  `d = C`.
- A **schema reference** names `R1`, `P6`, or `P8`; a **schema definition** also
  includes parameters and all defined states.

Process wires and operations must remain visually distinguishable. No other visual
choice is normative.

## Readability rules

- Prefer semantic cards and explicit operation nodes over decorative frames.
- Keep definitions in the problem bank and references in the scenario trace.
- Preserve multiline state properties verbatim; do not shorten repeated facts.
- Number decomposition states only because their order is meaningful.
- Use layout direction appropriate to the output size: vertical for narrow pages,
  horizontal banks for wide canvases.
