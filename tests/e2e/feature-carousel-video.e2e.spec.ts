import { expect, test } from '@playwright/test'

test.describe('content-managed feature and video presentations', () => {
  test('Home keeps the lead product and exposes a user-controlled responsive carousel', async ({
    page,
  }) => {
    await page.goto('/')

    const products = page.locator('section.trayport-section').filter({
      has: page.getByRole('heading', { exact: true, name: 'Our Products' }),
    })
    const presentation = products.locator('.trayport-features--lead-carousel')
    await expect(presentation.locator('.trayport-features__lead')).toContainText('Joule')

    const carousel = presentation.locator('section.trayport-carousel')
    const viewport = carousel.locator('.trayport-carousel__viewport')
    const slides = carousel.locator('.trayport-carousel__slide')
    await expect(slides).toHaveCount(7)
    await expect(carousel.getByRole('button', { name: 'Previous slide' })).toBeDisabled()
    await expect(carousel.getByRole('button', { name: 'Next slide' })).toBeEnabled()

    const viewportGeometry = await viewport.evaluate((element) => {
      const styles = getComputedStyle(element)
      return {
        gap: Number.parseFloat(styles.columnGap),
        paddingLeft: Number.parseFloat(styles.paddingLeft),
        paddingRight: Number.parseFloat(styles.paddingRight),
        width: element.getBoundingClientRect().width,
      }
    })
    const slideWidth = await slides
      .first()
      .evaluate((element) => element.getBoundingClientRect().width)
    const expectedVisibleItems = (page.viewportSize()?.width || 0) >= 998 ? 2 : 1
    const viewportContentWidth =
      viewportGeometry.width - viewportGeometry.paddingLeft - viewportGeometry.paddingRight
    expect(
      Math.abs(
        slideWidth -
          (viewportContentWidth - viewportGeometry.gap * (expectedVisibleItems - 1)) /
            expectedVisibleItems,
      ),
    ).toBeLessThan(1)
    expect(viewportGeometry.gap).toBe(20)
    expect(viewportGeometry.paddingLeft).toBe(expectedVisibleItems === 2 ? 48 : 8)
    expect(viewportGeometry.paddingRight).toBe(expectedVisibleItems === 2 ? 48 : 8)

    const initialScroll = await viewport.evaluate((element) => element.scrollLeft)
    await page.waitForTimeout(750)
    expect(await viewport.evaluate((element) => element.scrollLeft)).toBe(initialScroll)

    await carousel.getByRole('button', { name: 'Next slide' }).click()
    await expect(carousel.locator('.trayport-carousel__status')).toContainText(
      expectedVisibleItems === 2 ? 'Showing 2–3 of 7' : 'Showing 2–2 of 7',
    )
  })

  test('Home defers the managed Joule video source until its poster play action', async ({
    page,
  }) => {
    await page.goto('/')

    const player = page.locator('.trayport-video').filter({
      has: page.getByRole('button', { name: /^Play / }),
    })
    const video = page.locator('video[aria-label="Joule-Functionality"]')
    await expect(player).toHaveCount(1)
    await expect(video).toHaveAttribute('poster', /TMX-Trayport-Tablet-1605-v3-copy(?:-1)?\.png/)
    await expect(video).toHaveAttribute('preload', 'none')
    await expect(video).not.toHaveAttribute('controls', '')
    await expect(video.locator('source')).toHaveCount(0)

    await player.getByRole('button', { name: /^Play / }).click()

    await expect(video).toHaveAttribute('controls', '')
    await expect(video.locator('source')).toHaveAttribute('src', /Joule-Functionality(?:-1)?\.mp4/)
  })

  test('Joule carousel state follows its rendered two-up layout at extra-wide widths', async ({
    page,
  }) => {
    await page.setViewportSize({ height: 1_000, width: 1_680 })
    await page.goto('/products/joule/')

    const carousel = page.locator('#joule-mobile .trayport-carousel')
    const viewport = carousel.locator('.trayport-carousel__viewport')
    const slides = carousel.locator('.trayport-carousel__slide')

    await expect(carousel.locator('.trayport-carousel__status')).toContainText('Showing 1–2')
    await expect(carousel).toHaveCSS('--trayport-carousel-visible-items', '2')

    const geometry = await Promise.all([
      viewport.evaluate((element) => element.getBoundingClientRect().width),
      slides.first().evaluate((element) => element.getBoundingClientRect().width),
      viewport.evaluate((element) => Number.parseFloat(getComputedStyle(element).columnGap)),
    ])
    expect(Math.abs(geometry[1] - (geometry[0] - geometry[2]) / 2)).toBeLessThan(1)
  })
})
