import 'server-only'

import { SiteSearchView } from '@/components/Search/SiteSearchView'

import { loadSiteSearchCorpus } from './loadSiteSearchCorpus.server'
import {
  normalizeSiteSearchPage,
  searchSiteCorpus,
  validateSiteSearchQuery,
  type SiteSearchResult,
} from './model'

const emptyResult: SiteSearchResult = {
  currentPage: 1,
  end: 0,
  hits: [],
  pageSize: 10,
  start: 0,
  total: 0,
  totalPages: 0,
}

export const SiteSearchPage = async ({
  page,
  searchQuery,
}: {
  page?: string | string[]
  searchQuery?: string | string[]
}) => {
  const query = validateSiteSearchQuery(searchQuery)
  const result = query.issue
    ? emptyResult
    : searchSiteCorpus({
        corpus: await loadSiteSearchCorpus(),
        page: normalizeSiteSearchPage(page),
        query,
      })

  return <SiteSearchView query={query} result={result} />
}
