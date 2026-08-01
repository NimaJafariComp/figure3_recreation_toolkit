import { parse } from 'yaml'

import modelSource from '../../shared/figure3_model.yaml?raw'

export type StateDefinition = {
  id: string
  label: string
}

export type ResolutionDefinition = {
  source: string
  target: string
  action: string
}

export type SchemaDefinition = {
  parameters: Record<string, string>
  problem: {
    initial: StateDefinition[]
    final: StateDefinition[]
  }
  decomposition: {
    states: StateDefinition[]
  }
  resolution?: ResolutionDefinition
}

export type TraceOperation =
  | { generalize: string }
  | { specialize: Record<string, string> }
  | { linear_decomposition: string }
  | { generalize_subproblem: string }
  | { resolve: string }

export type FigureModel = {
  figure: {
    id: string
    title: string
  }
  schemas: Record<'R1' | 'P6' | 'P8', SchemaDefinition>
  main_trace: {
    initial_problem: {
      initial: string
      final: string
    }
    operations: TraceOperation[]
  }
}

const parsedModel: unknown = parse(modelSource)

export const figureModel = parsedModel as FigureModel
export const schemaIds = Object.keys(figureModel.schemas) as Array<
  keyof FigureModel['schemas']
>
