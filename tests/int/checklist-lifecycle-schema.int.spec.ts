// @vitest-environment node

import { describe, expect, it } from 'vitest'

import {
  ChecklistComponent,
  LifecycleComponent,
  sectionComponents,
} from '@/blocks/Trayport/components'
import { LifecycleItems, publicActiveLifecycleItems } from '@/collections/LifecycleItems'
import { collectCacheDependencyTags } from '@/data/cacheDependencies'

const field = (name: string) =>
  LifecycleItems.fields
    .flatMap((candidate) => ('fields' in candidate ? candidate.fields : [candidate]))
    .find((candidate) => 'name' in candidate && candidate.name === name)

describe('checklist and lifecycle Payload schemas', () => {
  it('keeps checklist authoring bounded and lifecycle selection relationship-backed', () => {
    const checklistItems = ChecklistComponent.fields.find(
      (candidate) => 'name' in candidate && candidate.name === 'items',
    )
    expect(checklistItems).toMatchObject({
      maxRows: 24,
      minRows: 1,
      required: true,
      type: 'array',
    })

    const lifecycleItems = LifecycleComponent.fields.find(
      (candidate) => 'name' in candidate && candidate.name === 'lifecycleItems',
    )
    expect(lifecycleItems).toMatchObject({
      hasMany: true,
      maxRows: 100,
      minRows: 1,
      relationTo: 'lifecycle-items',
      required: true,
      type: 'relationship',
    })
    expect(sectionComponents.map(({ slug }) => slug)).toEqual(
      expect.arrayContaining(['checklist', 'lifecycle']),
    )
  })

  it('allows editors to publish while reserving deletion for administrators', async () => {
    const editor = { roles: ['editor'] }
    const admin = { roles: ['admin'] }
    const create = LifecycleItems.access?.create
    const update = LifecycleItems.access?.update
    const remove = LifecycleItems.access?.delete

    expect(await create?.({ req: { user: editor } } as never)).toBe(true)
    expect(await update?.({ req: { user: editor } } as never)).toBe(true)
    expect(await remove?.({ req: { user: editor } } as never)).toBe(false)
    expect(await remove?.({ req: { user: admin } } as never)).toBe(true)
    expect(LifecycleItems.versions).toMatchObject({ drafts: true, maxPerDoc: 30 })
  })

  it('restricts anonymous reads to active published records', async () => {
    expect(publicActiveLifecycleItems({ req: { user: null } } as never)).toEqual({
      and: [{ _status: { equals: 'published' } }, { active: { equals: true } }],
    })
    expect(publicActiveLifecycleItems({ req: { user: { roles: ['editor'] } } } as never)).toBe(true)

    expect(field('endOfLifeDate')).toMatchObject({ index: true, required: true, type: 'date' })
    expect(field('active')).toMatchObject({ defaultValue: true, index: true, required: true })
  })

  it('tags populated lifecycle dependencies for page-cache invalidation', () => {
    expect(
      collectCacheDependencyTags(
        {
          layout: [
            {
              columns: [{ components: [{ lifecycleItems: [{ id: 14 }, { id: 9 }] }] }],
            },
          ],
        },
        'pages',
      ),
    ).toEqual(['content-dependency:lifecycle-items:14', 'content-dependency:lifecycle-items:9'])
  })
})
