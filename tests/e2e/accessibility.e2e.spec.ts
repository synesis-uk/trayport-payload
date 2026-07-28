import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { representativeRoutes } from '../helpers/site'

const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

test.describe('automated accessibility', () => {
  for (const route of representativeRoutes) {
    test(`${route.path} has no automated WCAG A/AA violations`, async ({ page }, testInfo) => {
      await page.goto(route.path)
      await expect(page.locator('main#main-content')).toBeVisible()

      const result = await new AxeBuilder({ page }).withTags(wcagTags).analyze()
      await testInfo.attach(`axe-${route.legacyId}-${testInfo.project.name}.json`, {
        body: JSON.stringify(result, null, 2),
        contentType: 'application/json',
      })

      const summary = result.violations
        .map(
          (violation) =>
            `${violation.id} (${violation.impact || 'unknown'}): ${violation.help} [${violation.nodes.length} node(s)]\n${violation.nodes
              .map((node) => `  - ${node.target.join(' > ')}`)
              .join('\n')}`,
        )
        .join('\n')
      expect(result.violations, summary).toEqual([])
    })
  }
})
