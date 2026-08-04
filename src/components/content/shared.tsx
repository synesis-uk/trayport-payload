import { cn } from '@/utilities/ui'

export const formatDate = (date?: string | null) => {
  if (!date) return null
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export const relationshipTitles = (
  values?: Array<{ title?: string | null } | number | null> | null,
): string[] =>
  (values || [])
    .filter(
      (value): value is { title?: string | null } => Boolean(value) && typeof value === 'object',
    )
    .map(({ title }) => title || '')
    .filter(Boolean)

export type OrderedRelationship = {
  displayOrder?: number | null
  title: string
}

export const orderedRelationships = (
  values?: Array<OrderedRelationship | number | null> | null,
): OrderedRelationship[] =>
  (values || [])
    .filter(
      (value): value is OrderedRelationship =>
        value !== null && typeof value === 'object' && Boolean(value.title),
    )
    .sort(
      (left, right) =>
        (left.displayOrder ?? Number.MAX_SAFE_INTEGER) -
          (right.displayOrder ?? Number.MAX_SAFE_INTEGER) || left.title.localeCompare(right.title),
    )

export const splitLeadingHero = <Block extends { blockType?: string | null }>(
  layout?: Block[] | null,
): { body: Block[]; hero: Block[] } => {
  const blocks = layout || []
  return blocks[0]?.blockType === 'trayportHero'
    ? { body: blocks.slice(1), hero: blocks.slice(0, 1) }
    : { body: blocks, hero: [] }
}

export const DetailHero = ({
  className,
  eyebrow,
  summary,
  title,
}: {
  className?: string
  eyebrow: string
  summary?: string | null
  title: string
}) => (
  <header className={cn('trayport-detail__hero', className)}>
    <div aria-hidden className="trayport-hub__polygon" />
    <div className="trayport-container trayport-detail__hero-inner">
      <p className="trayport-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {summary ? <p>{summary}</p> : null}
    </div>
  </header>
)

export const IndexHero = ({
  className,
  count,
  eyebrow,
  intro,
  title,
}: {
  className?: string
  count: number
  eyebrow?: string | null
  intro?: string | null
  title: string
}) => (
  <header className={cn('trayport-index__hero', className)}>
    <div aria-hidden className="trayport-hub__polygon" />
    <div className="trayport-container trayport-index__hero-inner">
      <div>
        <p className="trayport-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {intro ? <p>{intro}</p> : null}
      </div>
      <p aria-label={`${count} published profiles`} className="trayport-index__count">
        <strong>{count}</strong>
        <span>published profiles</span>
      </p>
    </div>
  </header>
)
