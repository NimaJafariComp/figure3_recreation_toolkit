import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type NodeTypes,
} from '@xyflow/react'

import type { GraphDefinition, SemanticKind } from '../graph-builders'
import { SemanticNode } from './SemanticNode'

const nodeTypes: NodeTypes = {
  semantic: SemanticNode,
}

const minimapColors: Record<SemanticKind, string> = {
  state: '#dce8e8',
  operation: '#16a39a',
  schema: '#7257d8',
  concept: '#b6c4c9',
  result: '#36a36b',
  metadata: '#aac0c8',
  summary: '#89a1aa',
}

type GraphCanvasProps = {
  graph: GraphDefinition
  graphKey: string
  label: string
}

export function GraphCanvas({ graph, graphKey, label }: GraphCanvasProps) {
  return (
    <section className="graph-shell" aria-label={label}>
      <ReactFlow
        key={graphKey}
        nodes={graph.nodes}
        edges={graph.edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable
        fitView
        fitViewOptions={{ padding: 0.18, minZoom: 0.16, maxZoom: 1.2 }}
        minZoom={0.12}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        aria-label={label}
      >
        <Background
          color="#b9c9cd"
          gap={26}
          size={1}
          variant={BackgroundVariant.Dots}
        />
        <MiniMap
          pannable
          zoomable
          nodeColor={(node) =>
            minimapColors[node.data.kind as SemanticKind] ?? '#89a1aa'
          }
          maskColor="rgba(232, 241, 240, 0.78)"
        />
        <Controls showInteractive={false} />
      </ReactFlow>
    </section>
  )
}
