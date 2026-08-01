import type { ReactNode } from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@xyflow/react', () => ({
  ReactFlow: ({
    nodes,
    children,
    'aria-label': ariaLabel,
  }: {
    nodes: Array<{ id: string; data: { title: string; lines?: string[] } }>
    children: ReactNode
    'aria-label': string
  }) => (
    <div data-graph-label={ariaLabel}>
      {nodes.map((node) => (
        <div key={node.id}>
          <span>{node.data.title}</span>
          {node.data.lines?.map((line) => <span key={line}>{line}</span>)}
        </div>
      ))}
      {children}
    </div>
  ),
  Background: () => null,
  Controls: () => null,
  Handle: () => null,
  MiniMap: () => null,
  BackgroundVariant: { Dots: 'dots' },
  MarkerType: { ArrowClosed: 'arrowclosed' },
  Position: {
    Top: 'top',
    Right: 'right',
    Bottom: 'bottom',
    Left: 'left',
  },
}))

import App from '../App'

describe('interactive semantic viewer', () => {
  afterEach(cleanup)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the complete scenario trace as the default view', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /figure 3, separated by meaning/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(/grocery-delivery reasoning trace/i),
    ).toBeInTheDocument()
    expect(screen.getAllByText('specialize')).toHaveLength(3)
    expect(screen.getByText('E = G_i')).toBeInTheDocument()
    expect(screen.getByText("M closes C's doors")).toBeInTheDocument()
  })

  it('shows reusable definitions independently in the problem bank', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /problem bank/i }))

    const bank = screen.getByLabelText(/reusable problem bank/i)
    expect(within(bank).getByRole('heading', { name: 'R1' })).toBeInTheDocument()
    expect(within(bank).getByRole('heading', { name: 'P6' })).toBeInTheDocument()
    expect(within(bank).getByRole('heading', { name: 'P8' })).toBeInTheDocument()
    expect(within(bank).getByText("V closes d's doors")).toBeInTheDocument()
  })

  it('opens a selected schema detail from the problem bank', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /problem bank/i }))
    fireEvent.click(screen.getByRole('button', { name: /open p6 graph/i }))

    expect(screen.getByLabelText(/p6 schema detail/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'P6', pressed: true }),
    ).toBeInTheDocument()
    expect(screen.getByText(/5\. L_E = \*_2/)).toBeInTheDocument()
  })
})
