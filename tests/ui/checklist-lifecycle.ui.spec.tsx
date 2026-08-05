import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  normalizeChecklistComponent,
  normalizeLifecycleComponent,
} from '@/components/blocks/checklistLifecycleModels'
import {
  ChecklistPresentation,
  LifecyclePresentation,
} from '@/components/blocks/ChecklistLifecyclePresentation'

describe('checklist and lifecycle presentations', () => {
  it('renders a semantic checked list and its controlled numbered variant', () => {
    const { container, rerender } = render(
      <ChecklistPresentation
        model={normalizeChecklistComponent({
          appearance: 'checks',
          items: [{ text: 'Managed benefit', title: 'Fast' }, { text: 'Accessible benefit' }],
        })}
      />,
    )

    expect(screen.getByRole('list').tagName).toBe('UL')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(container.querySelectorAll('[data-icon="check"]')).toHaveLength(2)

    rerender(
      <ChecklistPresentation
        model={normalizeChecklistComponent({
          appearance: 'numbers',
          items: [{ text: 'First step' }],
        })}
      />,
    )
    expect(screen.getByRole('list').tagName).toBe('OL')
    expect(container.querySelector('[data-icon="check"]')).toBeNull()
  })

  it('renders grouped lifecycle tables with accessible labels and machine-readable dates', () => {
    const model = normalizeLifecycleComponent(
      {
        caption: 'Trayport lifecycle schedule',
        lifecycleItems: [
          {
            duration: '12 months',
            endOfLifeDate: '2026-11-10T00:00:00.000Z',
            endOfLifeVersion: '6.0.36',
            id: 1,
            productLabel: 'Joule',
            serviceName: 'Joule 6.0.36',
          },
          {
            endOfLifeDate: '2024-03-31T00:00:00.000Z',
            id: 2,
            productLabel: 'Broker Trading System',
            serviceName: 'Broker Trading System',
          },
        ],
      },
      { now: new Date('2026-08-04T00:00:00.000Z') },
    )
    render(<LifecyclePresentation model={model} />)

    const lifecycle = screen.getByRole('region', { name: 'Trayport lifecycle schedule' })
    expect(
      within(lifecycle).getByRole('heading', { level: 3, name: 'Upcoming End-of-Life Details' }),
    ).toBeTruthy()
    expect(within(lifecycle).getAllByRole('table')).toHaveLength(2)
    expect(
      within(lifecycle).getByRole('region', {
        name: 'Upcoming End-of-Life Details: Joule',
      }),
    ).toBeTruthy()
    expect(within(lifecycle).getByText('10/11/2026').getAttribute('datetime')).toBe('2026-11-10')
    expect(within(lifecycle).getAllByText('—').length).toBeGreaterThan(0)
  })
})
