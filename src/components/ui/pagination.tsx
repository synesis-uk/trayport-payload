import Link from 'next/link'
import * as React from 'react'

import { AppIcon } from '@/components/icons'
import { cn } from '@/utilities/ui'

export type PaginationItem = number | 'ellipsis'

export function getPaginationItems(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): PaginationItem[] {
  if (
    !Number.isInteger(currentPage) ||
    !Number.isInteger(totalPages) ||
    !Number.isInteger(siblingCount)
  ) {
    throw new TypeError('Pagination values must be integers.')
  }
  if (totalPages < 1 || currentPage < 1 || currentPage > totalPages || siblingCount < 0) {
    throw new RangeError('Pagination values are outside their supported range.')
  }

  const visiblePages = new Set<number>([1, totalPages])
  for (
    let page = Math.max(1, currentPage - siblingCount);
    page <= Math.min(totalPages, currentPage + siblingCount);
    page += 1
  ) {
    visiblePages.add(page)
  }

  const sortedPages = [...visiblePages].sort((left, right) => left - right)
  const items: PaginationItem[] = []

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1]
    if (previousPage !== undefined && page - previousPage > 1) items.push('ellipsis')
    items.push(page)
  })

  return items
}

export interface PaginationProps extends Omit<React.ComponentProps<'nav'>, 'children'> {
  currentPage: number
  getHref: (page: number) => string
  siblingCount?: number
  totalPages: number
}

const directionClassName =
  'inline-flex min-h-11 items-center gap-2 border-t-2 border-transparent px-1 pt-4 text-sm font-medium text-muted-foreground no-underline transition-colors hover:border-border hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trayport-orange'

export function Pagination({
  'aria-label': ariaLabel = 'Pagination',
  className,
  currentPage,
  getHref,
  siblingCount = 1,
  totalPages,
  ...props
}: PaginationProps) {
  if (totalPages <= 1) return null

  const items = getPaginationItems(currentPage, totalPages, siblingCount)

  return (
    <nav
      aria-label={ariaLabel}
      className={cn('flex items-center justify-between border-t border-border', className)}
      data-slot="pagination"
      {...props}
    >
      <div className="-mt-px flex w-0 flex-1">
        {currentPage > 1 ? (
          <Link className={directionClassName} href={getHref(currentPage - 1)} rel="prev">
            <AppIcon aria-hidden className="size-4" name="chevronLeft" />
            <span className="hidden sm:inline">Previous</span>
          </Link>
        ) : (
          <span aria-disabled="true" className={cn(directionClassName, 'opacity-40')}>
            <AppIcon aria-hidden className="size-4" name="chevronLeft" />
            <span className="hidden sm:inline">Previous</span>
          </span>
        )}
      </div>

      <ol className="-mt-px hidden items-stretch md:flex">
        {items.map((item, index) => (
          <li key={item === 'ellipsis' ? `ellipsis-${index}` : item}>
            {item === 'ellipsis' ? (
              <span
                aria-hidden="true"
                className="inline-flex min-h-11 items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-muted-foreground"
              >
                &hellip;
              </span>
            ) : (
              <Link
                aria-current={item === currentPage ? 'page' : undefined}
                aria-label={`Page ${item}`}
                className={cn(
                  'inline-flex min-h-11 items-center border-t-2 px-4 pt-4 text-sm font-medium no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trayport-orange',
                  item === currentPage
                    ? 'border-trayport-blue text-trayport-blue'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                )}
                href={getHref(item)}
              >
                {item}
              </Link>
            )}
          </li>
        ))}
      </ol>

      <div className="-mt-px flex w-0 flex-1 justify-end">
        {currentPage < totalPages ? (
          <Link className={directionClassName} href={getHref(currentPage + 1)} rel="next">
            <span className="hidden sm:inline">Next</span>
            <AppIcon aria-hidden className="size-4" name="chevronRight" />
          </Link>
        ) : (
          <span aria-disabled="true" className={cn(directionClassName, 'opacity-40')}>
            <span className="hidden sm:inline">Next</span>
            <AppIcon aria-hidden className="size-4" name="chevronRight" />
          </span>
        )}
      </div>
    </nav>
  )
}
