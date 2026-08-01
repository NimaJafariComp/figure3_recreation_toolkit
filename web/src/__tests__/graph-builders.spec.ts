import { describe, expect, it } from 'vitest'

import { buildScenarioGraph, buildSchemaGraph } from '../graph-builders'
import { figureModel } from '../model'

describe('graph builders', () => {
  it('builds the scenario directly from all nine operations', () => {
    const graph = buildScenarioGraph(figureModel)
    const operationNodes = graph.nodes.filter(
      (node) => node.data.kind === 'operation',
    )

    expect(operationNodes).toHaveLength(9)
    expect(operationNodes.map((node) => node.data.title)).toEqual([
      'generalize',
      'specialize',
      'linear decomposition',
      'generalize subproblem',
      'specialize',
      'resolve',
      'generalize subproblem',
      'specialize',
      'resolve',
    ])
  })

  it('preserves specialization properties in scenario operation nodes', () => {
    const graph = buildScenarioGraph(figureModel)
    const specializations = graph.nodes.filter(
      (node) => node.data.title === 'specialize',
    )

    expect(specializations[0]?.data.lines).toEqual(['E = G_i', 'd = C'])
    expect(specializations[2]?.data.lines).toEqual(['V = M', 'd = C'])
  })

  it('uses a solid labeled process edge only for a resolved wiring action', () => {
    const graph = buildSchemaGraph('P8', figureModel.schemas.P8)
    const process = graph.edges.find((edge) => edge.id === 'process')

    expect(process?.label).toBe("V closes d's doors")
    expect(process?.style).toMatchObject({
      stroke: '#102128',
      strokeWidth: 2.2,
    })
  })

  it('does not invent a resolution for R1', () => {
    const graph = buildSchemaGraph('R1', figureModel.schemas.R1)

    expect(graph.nodes.some((node) => node.id === 'resolve')).toBe(false)
    expect(graph.edges.some((edge) => edge.id === 'process')).toBe(false)
  })
})
