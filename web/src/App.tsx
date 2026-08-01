import { useMemo, useState } from 'react'

import { GraphCanvas } from './components/GraphCanvas'
import { ProblemBank } from './components/ProblemBank'
import { buildScenarioGraph, buildSchemaGraph } from './graph-builders'
import { figureModel, schemaIds, type FigureModel } from './model'

type ViewMode = 'scenario' | 'bank' | 'detail'
type SchemaId = keyof FigureModel['schemas']

const viewLabels: Record<ViewMode, string> = {
  scenario: 'Scenario trace',
  bank: 'Problem bank',
  detail: 'Schema detail',
}

export default function App() {
  const [view, setView] = useState<ViewMode>('scenario')
  const [selectedSchema, setSelectedSchema] = useState<SchemaId>('P8')

  const scenarioGraph = useMemo(() => buildScenarioGraph(figureModel), [])
  const detailGraph = useMemo(
    () => buildSchemaGraph(selectedSchema, figureModel.schemas[selectedSchema]),
    [selectedSchema],
  )

  const openSchema = (schemaId: SchemaId) => {
    setSelectedSchema(schemaId)
    setView('detail')
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <div>
          <p className="site-header__kicker">Graph of graph transformations</p>
          <h1>Figure 3, separated by meaning</h1>
          <p className="site-header__summary">
            Explore the scenario, reusable definitions, and resolved wiring without
            inheriting the original slide geometry.
          </p>
        </div>
        <div className="source-stamp" aria-label="Data source">
          <span className="source-stamp__pulse" aria-hidden="true" />
          <div>
            <strong>Live semantic source</strong>
            <code>shared/figure3_model.yaml</code>
          </div>
        </div>
      </header>

      <nav className="view-switcher" aria-label="Diagram views">
        {(Object.keys(viewLabels) as ViewMode[]).map((mode) => (
          <button
            type="button"
            key={mode}
            aria-pressed={view === mode}
            onClick={() => setView(mode)}
          >
            {viewLabels[mode]}
          </button>
        ))}
      </nav>

      <section className="view-heading">
        <div>
          <p>{view === 'bank' ? 'Definitions' : 'Interactive canvas'}</p>
          <h2>{viewLabels[view]}</h2>
        </div>
        {view === 'detail' && (
          <div className="schema-switcher" aria-label="Selected schema">
            {schemaIds.map((schemaId) => (
              <button
                type="button"
                key={schemaId}
                aria-pressed={selectedSchema === schemaId}
                onClick={() => setSelectedSchema(schemaId)}
              >
                {schemaId}
              </button>
            ))}
          </div>
        )}
        <p className="view-heading__hint">
          {view === 'bank'
            ? 'Placement is intentionally non-semantic.'
            : 'Pan, zoom, and select nodes to inspect the graph.'}
        </p>
      </section>

      {view === 'scenario' && (
        <GraphCanvas
          graph={scenarioGraph}
          graphKey="scenario"
          label="Grocery-delivery reasoning trace"
        />
      )}
      {view === 'bank' && (
        <ProblemBank
          schemas={figureModel.schemas}
          onOpenSchema={openSchema}
        />
      )}
      {view === 'detail' && (
        <GraphCanvas
          graph={detailGraph}
          graphKey={`detail-${selectedSchema}`}
          label={`${selectedSchema} schema detail`}
        />
      )}

      <footer className="semantic-legend" aria-label="Semantic legend">
        <span><i className="legend-dot legend-dot--state" />State</span>
        <span><i className="legend-dot legend-dot--operation" />Operation</span>
        <span><i className="legend-dot legend-dot--schema" />Schema reference</span>
        <span><i className="legend-dot legend-dot--result" />Resolved action</span>
        <p>Dashed connectors transform graphs. Solid labeled connectors are process wires.</p>
      </footer>
    </main>
  )
}
