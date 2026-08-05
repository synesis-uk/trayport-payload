// @vitest-environment node

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { sectionComponents } from '@/blocks/Trayport/components'
import { trayportLayoutBlocks } from '@/blocks/Trayport/config'
import {
  trayportBlockRenderKey,
  trayportLayoutBlockAdapterRegistry,
  trayportSectionComponentAdapterRegistry,
} from '@/components/blocks'
import {
  contentArchitectureContract,
  contentArchitectureContractSchema,
} from '../../migration/mappings/contentArchitecture'
import rawContract from '../../migration/mappings/content-architecture.v1.json'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

const source = (relativePath: string): string =>
  fs.readFileSync(path.resolve(root, relativePath), 'utf8')

const sha256 = (value: string): string => crypto.createHash('sha256').update(value).digest('hex')

const sorted = (values: Iterable<string>): string[] => [...new Set(values)].sort()

const capture = (value: string, expression: RegExp): string[] =>
  [...value.matchAll(expression)].map((match) => match[1]).filter(Boolean)

const between = (value: string, start: string, end?: string): string => {
  const startIndex = value.indexOf(start)
  expect(startIndex, `Missing source boundary: ${start}`).toBeGreaterThanOrEqual(0)
  const endIndex = end ? value.indexOf(end, startIndex + start.length) : value.length
  expect(endIndex, `Missing source boundary: ${end}`).toBeGreaterThan(startIndex)
  return value.slice(startIndex, endIndex)
}

const dispositionSources = (scope: string): string[] =>
  sorted(
    contentArchitectureContract.legacyLayoutDispositions
      .filter((item) => item.scope === scope)
      .map((item) => item.source),
  )

describe('production content-architecture contract', () => {
  it('is structurally valid and remains blocked while production blockers exist', () => {
    expect(() => contentArchitectureContractSchema.parse(rawContract)).not.toThrow()

    const blockers = contentArchitectureContract.validationGates.filter(
      ({ severity, status }) => severity === 'blocker' && status !== 'passing',
    )
    expect(blockers.map(({ id, status }) => ({ id, status }))).toEqual([
      { id: 'article-detail-content-ownership', status: 'blocked' },
      { id: 'listing-detail-route-ownership', status: 'blocked' },
      { id: 'production-block-catalogue-implemented', status: 'blocked' },
      { id: 'managed-internal-link-integrity', status: 'blocked' },
      { id: 'editor-controls-have-runtime-effect', status: 'blocked' },
      { id: 'editor-role-capability-enforcement', status: 'partial' },
    ])

    const contractWithoutSourceClosureGate = {
      ...rawContract,
      approvedProductionScope: {
        ...rawContract.approvedProductionScope,
        inventoryEvidenceStatus: 'pending',
      },
      validationGates: rawContract.validationGates.filter(
        ({ id }) => id !== 'production-source-scope-complete',
      ),
    }
    expect(
      contentArchitectureContractSchema.safeParse(contractWithoutSourceClosureGate).success,
    ).toBe(false)
    expect(contentArchitectureContract.milestoneStatus).toBe('complete')
    expect(contentArchitectureContract.productionReadiness).toBe('blocked')
  })

  it('keeps the contract block library aligned with Payload configuration', () => {
    expect(sorted(trayportLayoutBlocks.map(({ slug }) => slug))).toEqual(
      sorted(contentArchitectureContract.blocks.implemented.topLevel),
    )
    expect(sorted(sectionComponents.map(({ slug }) => slug))).toEqual(
      sorted(contentArchitectureContract.blocks.implemented.sectionComponents),
    )
  })

  it('keeps every configured Payload block covered by the frontend renderer', () => {
    const sectionAdapterTypes = sorted(Object.keys(trayportSectionComponentAdapterRegistry))
    const layoutAdapterTypes = sorted(Object.keys(trayportLayoutBlockAdapterRegistry))

    expect(sectionAdapterTypes).toEqual(sorted(sectionComponents.map(({ slug }) => slug)))
    expect(layoutAdapterTypes).toEqual(sorted(trayportLayoutBlocks.map(({ slug }) => slug)))
    expect(sectionAdapterTypes).toEqual(
      sorted(contentArchitectureContract.blocks.implemented.sectionComponents),
    )
    expect(layoutAdapterTypes).toEqual(
      sorted(contentArchitectureContract.blocks.implemented.topLevel),
    )
  })

  it('uses Payload block identities as stable render keys with a deterministic import fallback', () => {
    expect(trayportBlockRenderKey({ blockType: 'heading', id: 'payload-block-id' }, 7)).toBe(
      'payload-block-id',
    )
    expect(trayportBlockRenderKey({ blockType: 'heading' }, 7)).toBe('heading-7')
  })

  it('keeps importer-emitted block types inside the configured block library', () => {
    const importer = source('migration/transform/blocks.ts')
    const emitted = sorted(capture(importer, /blockType:\s*'([^']+)'/g))
    const configured = new Set([
      ...contentArchitectureContract.blocks.implemented.topLevel,
      ...contentArchitectureContract.blocks.implemented.sectionComponents,
    ])

    expect(emitted.length).toBeGreaterThan(0)
    expect(emitted.filter((blockType) => !configured.has(blockType))).toEqual([])
  })

  it('exports site-wide Market Matrix venues independently of the German hub projection', () => {
    const exporter = source('migration/wp-exporter/export.php')
    const venueExporter = between(
      exporter,
      'function tp_export_market_matrix_venues',
      'function tp_nullable_decimal',
    )
    const orchestration = between(exporter, 'if ($hubId > 0) {', '$safeOptions =')

    expect(venueExporter).toMatch(/'post_type'\s*=>\s*'venue'/)
    expect(venueExporter).toMatch(/'post_status'\s*=>\s*'publish'/)
    expect(venueExporter).toMatch(/'connections'/)
    expect(orchestration).toMatch(
      /tp_export_market_matrix_venues\(\$rootIds, \$mediaIds, \$termIds\);/,
    )
    expect(
      orchestration.indexOf('tp_export_market_matrix_venues') >
        orchestration.indexOf("'entity' => 'hub-connections'"),
    ).toBe(true)
  })

  it('classifies every implemented legacy component and top-level layout', () => {
    const importer = source('migration/transform/blocks.ts')
    const componentMapper = between(
      importer,
      'const mapComponent =',
      'const activeBackgroundTone =',
    )
    const pageMapper = between(
      importer,
      'export const mapPageLayout =',
      'export const mapArticleLayout =',
    )
    const articleMapper = between(importer, 'export const mapArticleLayout =')

    const implementedComponents = sorted(capture(componentMapper, /case '([^']+)'/g))
    const implementedComponentDispositions = contentArchitectureContract.legacyLayoutDispositions
      .filter(
        ({ scope, targets }) =>
          scope === 'component' &&
          targets.some((target) =>
            contentArchitectureContract.blocks.implemented.sectionComponents.includes(target),
          ),
      )
      .map(({ source }) => source)
    const implementedPageLayouts = sorted(
      capture(pageMapper, /layout === '([^']+)'/g).filter((layout) =>
        ['hero', 'columns', 'single'].includes(layout),
      ),
    )
    const implementedArticleLayouts = sorted(capture(articleMapper, /layout === '([^']+)'/g))
    const plannedArticleLayouts = ['form', 'table']
    const plannedComponentLayouts = contentArchitectureContract.blocks.planned.flatMap(
      ({ sourceLayouts }) =>
        sourceLayouts.filter(({ scope }) => scope === 'component').map(({ source }) => source),
    )

    expect(dispositionSources('component')).toEqual(
      sorted([
        ...implementedComponents,
        ...implementedComponentDispositions,
        ...plannedComponentLayouts,
      ]),
    )
    expect(dispositionSources('page-top-level')).toEqual(implementedPageLayouts)
    expect(dispositionSources('article-top-level')).toEqual(
      sorted([...implementedArticleLayouts, ...plannedArticleLayouts]),
    )

    const plannedArticleCounts = Object.fromEntries(
      contentArchitectureContract.legacyLayoutDispositions
        .filter(
          ({ scope, source }) =>
            scope === 'article-top-level' && plannedArticleLayouts.includes(source),
        )
        .map(({ observedCount, source }) => [source, observedCount]),
    )
    expect(plannedArticleCounts).toEqual({
      form: 16,
      table: 1,
    })
  })

  it('classifies every reachable production taxonomy subtype', () => {
    const reachableTermSubtypes = sorted(
      contentArchitectureContract.approvedProductionScope.reachableTermSubtypes,
    )
    expect(reachableTermSubtypes).toEqual([
      'asset-class',
      'category',
      'lh-category',
      'post_tag',
      'product-feature',
      'region',
      'software-category',
      'venue-type',
    ])
    expect(dispositionSources('taxonomy')).toEqual(reachableTermSubtypes)

    const taxonomyDispositions = Object.fromEntries(
      contentArchitectureContract.legacyLayoutDispositions
        .filter(({ scope }) => scope === 'taxonomy')
        .map(({ disposition, source: taxonomy, targets }) => [taxonomy, { disposition, targets }]),
    )
    expect(taxonomyDispositions['lh-category']).toEqual({
      disposition: 'consolidate',
      targets: ['learning-video-categories'],
    })
    expect(taxonomyDispositions['software-category']).toEqual({
      disposition: 'omit',
      targets: [],
    })
    expect(contentArchitectureContract.approvedProductionScope.managedTaxonomies).toEqual([
      {
        sourceTaxonomy: 'asset-class',
        targetCollection: 'asset-classes',
        count: 12,
      },
      {
        sourceTaxonomy: 'category',
        targetCollection: 'article-categories',
        count: 3,
      },
      {
        sourceTaxonomy: 'lh-category',
        targetCollection: 'learning-video-categories',
        count: 11,
      },
      {
        sourceTaxonomy: 'region',
        targetCollection: 'regions',
        count: 4,
      },
      {
        sourceTaxonomy: 'venue-type',
        targetCollection: 'venue-types',
        count: 3,
      },
    ])

    const contractWithoutLearningCategories = {
      ...rawContract,
      legacyLayoutDispositions: rawContract.legacyLayoutDispositions.filter(
        ({ scope, source: taxonomy }) => scope !== 'taxonomy' || taxonomy !== 'lh-category',
      ),
    }
    expect(
      contentArchitectureContractSchema.safeParse(contractWithoutLearningCategories).success,
    ).toBe(false)

    const contractWithDivergentManagedTarget = {
      ...rawContract,
      approvedProductionScope: {
        ...rawContract.approvedProductionScope,
        managedTaxonomies: rawContract.approvedProductionScope.managedTaxonomies.map((taxonomy) =>
          taxonomy.sourceTaxonomy === 'category'
            ? { ...taxonomy, targetCollection: 'regions' }
            : taxonomy,
        ),
      },
    }
    expect(
      contentArchitectureContractSchema.safeParse(contractWithDivergentManagedTarget).success,
    ).toBe(false)
  })

  it('keeps planned production targets separate from implemented blocks', () => {
    const plannedSources = sorted(
      contentArchitectureContract.blocks.planned.flatMap(({ sourceLayouts }) =>
        sourceLayouts.map(({ scope, source }) => `${scope}:${source}`),
      ),
    )
    const implemented = new Set([
      ...contentArchitectureContract.blocks.implemented.topLevel,
      ...contentArchitectureContract.blocks.implemented.sectionComponents,
    ])
    const plannedBlockTypes = contentArchitectureContract.blocks.planned
      .map(({ targetBlockType }) => targetBlockType)
      .filter((value): value is string => Boolean(value))

    expect(plannedSources).toEqual([
      'article-top-level:form',
      'component:column',
      'component:form',
      'shortcode:wcc_category_list',
    ])
    expect(plannedBlockTypes.filter((blockType) => implemented.has(blockType))).toEqual([])
    expect(
      contentArchitectureContract.blocks.planned.every(
        ({ implementationStatus }) => implementationStatus === 'planned',
      ),
    ).toBe(true)
    expect(dispositionSources('shortcode')).toEqual(['wcc_category_list'])
  })

  it('records verified evidence for the approved 297-route source scope', () => {
    const scope = contentArchitectureContract.approvedProductionScope
    const routeOwners = Object.fromEntries(
      scope.routeOwners.map(({ count, id, targetOwner }) => [id, { count, targetOwner }]),
    )

    expect(scope.publicRouteTotal).toBe(297)
    expect(scope.routeOwners.reduce((total, { count }) => total + count, 0)).toBe(297)
    expect(routeOwners).toEqual({
      'editorial-posts': { count: 90, targetOwner: 'articles' },
      'hub-details': { count: 72, targetOwner: 'hubs' },
      'learning-video-details': { count: 15, targetOwner: 'learning-videos' },
      'market-coverage-index': { count: 1, targetOwner: 'hubs' },
      'page-documents': { count: 51, targetOwner: 'pages' },
      'temporary-contact-redirect': { count: 1, targetOwner: 'redirects' },
      'venue-details': { count: 66, targetOwner: 'venues' },
      'venue-index': { count: 1, targetOwner: 'venues' },
    })
    expect(scope.requiredIncludes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'faq', legacyId: 7609, path: '/resources/faqs/' }),
        expect.objectContaining({
          id: 'banner-eex-news',
          legacyId: 11299,
          path: '/eex-news/',
        }),
      ]),
    )
    expect(scope.requiredExclusions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'commodities-report',
          legacyId: 2233,
          path: '/resources/commodities-report/',
        }),
      ]),
    )
    expect(scope.inventoryEvidenceStatus).toBe('verified')

    const sourceClosureGate = contentArchitectureContract.validationGates.find(
      ({ id }) => id === 'production-source-scope-complete',
    )
    expect(sourceClosureGate).toMatchObject({
      status: 'passing',
      enforcement: 'production-inventory-verification',
      remediation: null,
    })
    expect(sourceClosureGate?.evidence).toEqual(
      expect.arrayContaining([
        'migration/inventory/report.ts',
        'docs/content-architecture/inventory-summary.json',
        'docs/content-architecture/verification.json',
        'docs/content-architecture/layout-coverage.json',
        'docs/content-architecture/route-manifest.csv',
      ]),
    )
  })

  it('keeps the retained inventory evidence internally consistent', () => {
    const summary = JSON.parse(source('docs/content-architecture/inventory-summary.json'))
    const verificationText = source('docs/content-architecture/verification.json')
    const verification = JSON.parse(verificationText)
    const layoutCoverageText = source('docs/content-architecture/layout-coverage.json')
    const layoutCoverage = JSON.parse(layoutCoverageText)
    const routeManifest = source('docs/content-architecture/route-manifest.csv')

    expect(summary.counts).toMatchObject({
      directAuthoredRouteStrings: 55,
      directPublicRoutes: 54,
      listingRoutes: 243,
      routes: 297,
      redirects: 50,
      exclusions: 1,
      unknownArchetypes: 0,
    })
    expect(summary.verification).toEqual({ status: 'passed', failures: [] })
    expect(verification.status).toBe('passed')
    expect(verification.failures).toEqual([])
    expect(verification.assertions.every(({ passed }: { passed: boolean }) => passed)).toBe(true)
    expect(layoutCoverage.summary).toMatchObject({
      layouts: 40,
      unknownLayouts: 0,
      taxonomies: 8,
      unknownTaxonomies: 0,
    })
    expect(layoutCoverage.unknownLayouts).toEqual([])
    expect(layoutCoverage.unknownTaxonomies).toEqual([])
    expect(layoutCoverage.taxonomies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          taxonomy: 'lh-category',
          classification: 'contract-disposition',
          disposition: 'consolidate',
          targets: ['learning-video-categories'],
        }),
        expect.objectContaining({
          taxonomy: 'software-category',
          classification: 'contract-disposition',
          disposition: 'omit',
          targets: [],
        }),
      ]),
    )
    expect(
      Object.fromEntries(
        verification.assertions
          .filter(({ id }: { id: string }) => id.startsWith('route-owner:'))
          .map(({ actual, expected, id }: { actual: number; expected: number; id: string }) => [
            id,
            { actual, expected },
          ]),
      ),
    ).toEqual({
      'route-owner:editorial-posts': { actual: 90, expected: 90 },
      'route-owner:hub-details': { actual: 72, expected: 72 },
      'route-owner:learning-video-details': { actual: 15, expected: 15 },
      'route-owner:market-coverage-index': { actual: 1, expected: 1 },
      'route-owner:page-documents': { actual: 51, expected: 51 },
      'route-owner:temporary-contact-redirect': { actual: 1, expected: 1 },
      'route-owner:venue-details': { actual: 66, expected: 66 },
      'route-owner:venue-index': { actual: 1, expected: 1 },
    })

    const manifestRows = routeManifest.trimEnd().split('\n').slice(1)
    expect(manifestRows.filter((row) => /,included,\d+$/.test(row))).toHaveLength(297)
    expect(manifestRows.filter((row) => /,excluded,\d+$/.test(row))).toHaveLength(1)
    expect(manifestRows.filter((row) => /,redirect,\d+$/.test(row))).toHaveLength(50)
    expect(
      manifestRows.some(
        (row) =>
          row.startsWith('/eex-news/,/eex-news/,11299,') &&
          row.includes(',banner,posts.11602.acf.all-acf-fields.link,'),
      ),
    ).toBe(true)
    expect(
      manifestRows.some(
        (row) =>
          row.startsWith('/resources/faqs/,/resources/faqs/,7609,') && /,included,\d+$/.test(row),
      ),
    ).toBe(true)
    expect(
      manifestRows.some(
        (row) =>
          row.startsWith('/resources/commodities-report/,/resources/commodities-report/,2233,') &&
          /,excluded,\d+$/.test(row),
      ),
    ).toBe(true)

    expect(sha256(routeManifest)).toBe(summary.hashes.routeManifest)
    expect(sha256(layoutCoverageText)).toBe(summary.hashes.layoutCoverage)
    expect(sha256(verificationText)).toBe(summary.hashes.verification)
  })

  it('assigns ownership and editor capabilities to current and target content resources', () => {
    const expectedResources = [
      'pages',
      'articles',
      'hubs',
      'venues',
      'learning-videos',
      'offices',
      'learning-video-categories',
      'media',
      'article-categories',
      'asset-classes',
      'venue-types',
      'regions',
      'navigation',
      'footer',
      'site-settings',
      'route-indexes',
      'route-registry',
      'redirects',
      'users',
      'app.market_volume_monthly',
    ]
    const owned = new Set(
      contentArchitectureContract.collectionOwnership.map(({ resource }) => resource),
    )
    const capabilityResources = new Set(
      contentArchitectureContract.editorCapabilities.flatMap(({ resources }) => resources),
    )

    expect(expectedResources.filter((resource) => !owned.has(resource))).toEqual([])
    expect(expectedResources.filter((resource) => !capabilityResources.has(resource))).toEqual([])
  })

  it('declares route policy for dependency-only records and every target public archetype', () => {
    const byID = new Map(
      contentArchitectureContract.archetypes.map((archetype) => [archetype.id, archetype]),
    )

    expect(byID.get('article.listing-metadata')?.routePolicy).toBe('forbidden')
    expect(byID.get('learning-video.listing-metadata')?.routePolicy).toBe('forbidden')
    expect(byID.get('hub.map-only')?.routePolicy).toBe('forbidden')
    expect(byID.get('hub.public-page')?.routePolicy).toBe('required')
    expect(byID.get('venue.structured-record')?.routePolicy).toBe('forbidden')

    for (const id of [
      'page.homepage',
      'page.legal',
      'page.conversion',
      'page.interactive-market-matrix',
      'redirect.temporary-contact',
      'learning-video.public-detail',
      'venue.public-detail',
      'index.venue',
      'index.market-coverage',
    ]) {
      expect(byID.get(id)?.routePolicy, id).toBe('required')
    }
    expect(
      [...byID.values()].every(
        ({ gap, implementationStatus }) => implementationStatus === 'passing' && gap === null,
      ),
    ).toBe(true)

    for (const id of ['cross-collection-route-uniqueness', 'archetype-discriminator-invariants']) {
      expect(
        contentArchitectureContract.validationGates.find((gate) => gate.id === id),
      ).toMatchObject({
        status: 'passing',
        remediation: null,
      })
    }
  })
})
