import {
  MarkerType,
  Position,
  type Edge,
  type Node,
} from '@xyflow/react'

import type {
  FigureModel,
  SchemaDefinition,
  TraceOperation,
} from './model'

export type SemanticKind =
  | 'state'
  | 'operation'
  | 'schema'
  | 'concept'
  | 'result'
  | 'metadata'
  | 'summary'

export type SemanticNodeData = Record<string, unknown> & {
  kind: SemanticKind
  eyebrow?: string
  title: string
  lines?: string[]
}

export type SemanticNode = Node<SemanticNodeData, 'semantic'>

export type GraphDefinition = {
  nodes: SemanticNode[]
  edges: Edge[]
}

const operationEdge = {
  type: 'smoothstep',
  animated: false,
  style: { stroke: '#52636b', strokeDasharray: '6 5', strokeWidth: 1.5 },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#52636b' },
}

const processEdge = {
  type: 'straight',
  style: { stroke: '#102128', strokeWidth: 2.2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#102128' },
}

function semanticNode(
  id: string,
  position: { x: number; y: number },
  data: SemanticNodeData,
): SemanticNode {
  return {
    id,
    type: 'semantic',
    position,
    data,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    draggable: false,
    selectable: true,
  }
}

function operationDetails(operation: TraceOperation): {
  title: string
  lines?: string[]
  output?: { kind: SemanticKind; title: string }
} {
  if ('generalize' in operation) {
    return {
      title: 'generalize',
      output: { kind: 'schema', title: operation.generalize },
    }
  }
  if ('generalize_subproblem' in operation) {
    return {
      title: 'generalize subproblem',
      output: { kind: 'schema', title: operation.generalize_subproblem },
    }
  }
  if ('specialize' in operation) {
    return {
      title: 'specialize',
      lines: Object.entries(operation.specialize).map(
        ([key, value]) => `${key} = ${value}`,
      ),
    }
  }
  if ('linear_decomposition' in operation) {
    return {
      title: 'linear decomposition',
      output: { kind: 'concept', title: operation.linear_decomposition },
    }
  }
  return {
    title: 'resolve',
    output: { kind: 'result', title: operation.resolve },
  }
}

export function buildScenarioGraph(model: FigureModel): GraphDefinition {
  const nodes: SemanticNode[] = [
    semanticNode('scenario-initial', { x: 0, y: 20 }, {
      kind: 'state',
      eyebrow: 'Initial state',
      title: model.main_trace.initial_problem.initial,
    }),
    semanticNode('scenario-goal', { x: 0, y: 170 }, {
      kind: 'state',
      eyebrow: 'Goal state',
      title: model.main_trace.initial_problem.final,
    }),
  ]
  const edges: Edge[] = []
  let x = 330
  let previousIds = ['scenario-initial', 'scenario-goal']

  model.main_trace.operations.forEach((operation, index) => {
    const details = operationDetails(operation)
    const operationId = `operation-${index}`
    nodes.push(
      semanticNode(operationId, { x, y: 95 }, {
        kind: 'operation',
        title: details.title,
        lines: details.lines,
      }),
    )
    previousIds.forEach((sourceId) => {
      edges.push({
        id: `${sourceId}-${operationId}`,
        source: sourceId,
        target: operationId,
        sourceHandle: 'right',
        targetHandle: 'left',
        ...operationEdge,
      })
    })

    previousIds = [operationId]
    x += 280

    if (details.output) {
      const outputId = `operation-${index}-output`
      nodes.push(
        semanticNode(outputId, { x, y: 95 }, {
          kind: details.output.kind,
          title: details.output.title,
        }),
      )
      edges.push({
        id: `${operationId}-${outputId}`,
        source: operationId,
        target: outputId,
        sourceHandle: 'right',
        targetHandle: 'left',
        ...operationEdge,
      })
      previousIds = [outputId]
      x += 280
    }
  })

  return { nodes, edges }
}

export function buildSchemaGraph(
  schemaId: string,
  schema: SchemaDefinition,
): GraphDefinition {
  const initialLabel = schema.problem.initial.map((state) => state.label).join('\n')
  const finalLabel = schema.problem.final.map((state) => state.label).join('\n')
  const decompositionLines = schema.decomposition.states.map(
    (state, index) => `${index + 1}. ${state.label.replaceAll('\n', '; ')}`,
  )
  const nodes: SemanticNode[] = [
    semanticNode('initial', { x: 0, y: 0 }, {
      kind: 'state',
      eyebrow: 'Initial state',
      title: initialLabel,
    }),
    semanticNode('goal', { x: 420, y: 0 }, {
      kind: 'state',
      eyebrow: 'Goal state',
      title: finalLabel,
    }),
    semanticNode('parameters', { x: 820, y: 0 }, {
      kind: 'metadata',
      eyebrow: `${schemaId} parameters`,
      title: Object.entries(schema.parameters)
        .map(([key, value]) => `${key} = ${value}`)
        .join('\n'),
    }),
    semanticNode('decompose', { x: 210, y: 190 }, {
      kind: 'operation',
      title: 'linear decomposition',
    }),
    semanticNode('states', { x: 210, y: 340 }, {
      kind: 'summary',
      eyebrow: 'Ordered states',
      title: schemaId,
      lines: decompositionLines,
    }),
  ]
  const edges: Edge[] = [
    {
      id: 'initial-decompose',
      source: 'initial',
      target: 'decompose',
      sourceHandle: 'bottom',
      targetHandle: 'top',
      ...operationEdge,
    },
    {
      id: 'goal-decompose',
      source: 'goal',
      target: 'decompose',
      sourceHandle: 'bottom',
      targetHandle: 'top',
      ...operationEdge,
    },
    {
      id: 'decompose-states',
      source: 'decompose',
      target: 'states',
      sourceHandle: 'bottom',
      targetHandle: 'top',
      ...operationEdge,
    },
  ]

  if (!schema.resolution) {
    return { nodes, edges }
  }

  const sourceState = schema.decomposition.states.find(
    (state) => state.id === schema.resolution?.source,
  )
  const targetState = schema.decomposition.states.find(
    (state) => state.id === schema.resolution?.target,
  )

  if (!sourceState || !targetState) {
    throw new Error(`${schemaId} resolution references an unknown state`)
  }

  nodes.push(
    semanticNode('resolve', { x: 210, y: 590 }, {
      kind: 'operation',
      title: 'resolution',
    }),
    semanticNode('resolved-source', { x: 0, y: 760 }, {
      kind: 'state',
      eyebrow: 'Source state',
      title: sourceState.label,
    }),
    semanticNode('resolved-target', { x: 520, y: 760 }, {
      kind: 'state',
      eyebrow: 'Target state',
      title: targetState.label,
    }),
  )
  edges.push(
    {
      id: 'states-resolve',
      source: 'states',
      target: 'resolve',
      sourceHandle: 'bottom',
      targetHandle: 'top',
      ...operationEdge,
    },
    {
      id: 'resolve-source',
      source: 'resolve',
      target: 'resolved-source',
      sourceHandle: 'bottom',
      targetHandle: 'top',
      ...operationEdge,
    },
    {
      id: 'process',
      source: 'resolved-source',
      target: 'resolved-target',
      sourceHandle: 'right',
      targetHandle: 'left',
      label: schema.resolution.action,
      labelStyle: { fill: '#102128', fontSize: 13, fontWeight: 650 },
      labelBgStyle: { fill: '#f7faf9', fillOpacity: 0.94 },
      labelBgPadding: [8, 5],
      ...processEdge,
    },
  )

  return { nodes, edges }
}
