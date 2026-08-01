import {
  Handle,
  Position,
  type NodeProps,
} from '@xyflow/react'

import type { SemanticNode as SemanticNodeType } from '../graph-builders'

const handlePositions = [
  ['top', Position.Top],
  ['right', Position.Right],
  ['bottom', Position.Bottom],
  ['left', Position.Left],
] as const

export function SemanticNode({ data, selected }: NodeProps<SemanticNodeType>) {
  const accessibleLabel = [data.eyebrow, data.title, ...(data.lines ?? [])]
    .filter(Boolean)
    .join('. ')

  return (
    <article
      className={`semantic-node semantic-node--${data.kind}`}
      aria-label={accessibleLabel}
      data-selected={selected || undefined}
    >
      {handlePositions.map(([id, position]) => (
        <Handle
          key={id}
          id={id}
          type={id === 'left' || id === 'top' ? 'target' : 'source'}
          position={position}
          isConnectable={false}
        />
      ))}
      {data.eyebrow && <p className="semantic-node__eyebrow">{data.eyebrow}</p>}
      <p className="semantic-node__title">{data.title}</p>
      {data.lines && data.lines.length > 0 && (
        <ul className="semantic-node__lines" aria-label="Properties">
          {data.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
    </article>
  )
}
