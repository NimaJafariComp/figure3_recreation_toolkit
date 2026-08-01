import type { FigureModel, SchemaDefinition } from '../model'

type ProblemBankProps = {
  schemas: FigureModel['schemas']
  onOpenSchema: (schemaId: keyof FigureModel['schemas']) => void
}

function stateLabel(state: { label: string }) {
  return state.label.split('\n').map((line) => (
    <span key={line}>
      {line}
      <br />
    </span>
  ))
}

function resolutionState(
  schema: SchemaDefinition,
  stateId: string,
): string {
  return (
    schema.decomposition.states.find((state) => state.id === stateId)?.label ??
    stateId
  )
}

export function ProblemBank({ schemas, onOpenSchema }: ProblemBankProps) {
  return (
    <section className="problem-bank" aria-label="Reusable problem bank">
      {(Object.entries(schemas) as Array<
        [keyof FigureModel['schemas'], SchemaDefinition]
      >).map(([schemaId, schema]) => (
        <article className="schema-card" key={schemaId}>
          <header className="schema-card__header">
            <div>
              <p className="schema-card__index">Reusable definition</p>
              <h2>{schemaId}</h2>
            </div>
            <dl className="schema-card__parameters">
              {Object.entries(schema.parameters).map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </header>

          <section className="schema-card__problem" aria-label={`${schemaId} problem`}>
            <div>
              <span>Initial</span>
              <p>{schema.problem.initial.map(stateLabel)}</p>
            </div>
            <div>
              <span>Goal</span>
              <p>{schema.problem.final.map(stateLabel)}</p>
            </div>
          </section>

          <div className="schema-card__operation">linear decomposition</div>
          <ol className="schema-card__states">
            {schema.decomposition.states.map((state) => (
              <li key={state.id}>{stateLabel(state)}</li>
            ))}
          </ol>

          {schema.resolution && (
            <section className="schema-card__resolution">
              <p className="schema-card__operation">resolution</p>
              <dl>
                <div>
                  <dt>Source</dt>
                  <dd>{resolutionState(schema, schema.resolution.source)}</dd>
                </div>
                <div>
                  <dt>Action</dt>
                  <dd>{schema.resolution.action}</dd>
                </div>
                <div>
                  <dt>Target</dt>
                  <dd>{resolutionState(schema, schema.resolution.target)}</dd>
                </div>
              </dl>
            </section>
          )}

          <button type="button" onClick={() => onOpenSchema(schemaId)}>
            Open {schemaId} graph
          </button>
        </article>
      ))}
    </section>
  )
}
