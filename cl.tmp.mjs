import { chromium } from '@playwright/test'
const b = await chromium.launch()
const p = await (await b.newContext({ viewport: { width: 1440, height: 1000 } })).newPage()
for (const [base,name] of [['http://127.0.0.1:3090','REF'],['http://127.0.0.1:3004','OURS']]) {
  await p.goto(base + '/products/exchange-trading-system/', { waitUntil: 'load' })
  await p.waitForTimeout(1500)
  const r = await p.evaluate(() => {
    const t = document.body.innerText
    const i = t.indexOf('Clients')
    return { hasClientsHeading: i >= 0, near: i>=0 ? t.slice(i, i+140).replace(/\s+/g,' ') : '', imgs: document.images.length, page: document.documentElement.scrollHeight }
  })
  console.log(name, JSON.stringify(r))
}
await b.close()
