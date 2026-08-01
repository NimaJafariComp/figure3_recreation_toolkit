import { describe, expect, it } from 'vitest'

import { figureModel, schemaIds } from '../model'

describe('figure model adapter', () => {
  it('loads every reusable schema from the canonical YAML model', () => {
    expect(schemaIds).toEqual(['P8', 'P6', 'R1'])
    expect(figureModel.schemas.P8.parameters).toEqual({
      V: 'mover',
      d: 'vehicle',
    })
  })

  it('preserves the complete scenario operation sequence', () => {
    expect(figureModel.main_trace.operations).toHaveLength(9)
    expect(figureModel.main_trace.operations).toContainEqual({
      specialize: { E: 'G_i', d: 'C' },
    })
    expect(figureModel.main_trace.operations.at(-1)).toEqual({
      resolve: "M closes C's doors",
    })
  })

  it('preserves resolution endpoints and action properties', () => {
    expect(figureModel.schemas.P6.resolution).toEqual({
      source: 'p6_s3',
      target: 'p6_s4',
      action: 'V moves E from *_1 to *_2',
    })
  })
})
