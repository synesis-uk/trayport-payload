'use client'

import dynamic from 'next/dynamic'

import type { ArticleListingClientProps } from './ArticleListingClient'

const ArticleListingImplementation = dynamic(
  () => import('./ArticleListingClient').then((module) => module.ArticleListingClient),
  { ssr: true },
)

export function DynamicArticleListing(props: ArticleListingClientProps) {
  return <ArticleListingImplementation {...props} />
}
