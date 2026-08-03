export type RepresentativeRoute = {
  heading: string
  legacyId: number
  path: string
  title: RegExp
}

/**
 * Audited WordPress identities, not synthetic fixture copy.
 *
 * Keeping the legacy ID beside each route makes a failed browser assertion easy
 * to trace back to the source record and the migration acceptance report.
 */
export const representativeRoutes = [
  {
    heading: 'Connecting Trade Globally',
    legacyId: 1898,
    path: '/',
    title: /Trayport \| Energy Trading Solution, Software & Market Access/i,
  },
  {
    heading: 'A mature company with a young spirit',
    legacyId: 2203,
    path: '/company/about-us/',
    title: /About Us \| Trayport/i,
  },
  {
    heading: 'Joule, the leading trading solution for energy and commodities markets',
    legacyId: 1924,
    path: '/products/joule/',
    title: /Joule Trading Screen \| Access Global Markets & Prices \| Trayport/i,
  },
  {
    heading: 'Insights',
    legacyId: 9248,
    path: '/resources/insights/',
    title: /Insights, News & Events \| Market Analysis & Updates \| Trayport/i,
  },
  {
    heading: 'Data Analytics for Energy Traders',
    legacyId: 9351,
    path: '/insights/on-demand-webinar-data-analytics-for-energy-traders/',
    title: /Data Analytics for Energy Traders \| On-Demand Webinar \| Trayport/i,
  },
  {
    heading: 'German Power',
    legacyId: 2495,
    path: '/market-coverage/german-power/',
    title: /German Power \| Virtual Hub \| Trayport/i,
  },
  {
    heading: 'Office Locations',
    legacyId: 2205,
    path: '/company/offices/',
    title: /Trayport Office Locations \| UK, Austria, Germany, Singapore/i,
  },
  {
    heading: 'Tradesignal',
    legacyId: 1926,
    path: '/products/tradesignal/',
    title: /Tradesignal \| Intuitive Charting & Analysis for Traders \| Trayport/i,
  },
  {
    heading: 'FAQs',
    legacyId: 7609,
    path: '/resources/faqs/',
    title: /Frequently Asked Questions \| Trayport/i,
  },
  {
    heading: 'News',
    legacyId: 9244,
    path: '/resources/news/',
    title: /Insights, News & Events \| Market Analysis & Updates \| Trayport/i,
  },
  {
    heading: 'Trayport confirms participation at E-World 2026',
    legacyId: 10030,
    path: '/event/e-world-2026/',
    title: /E-world 2026 \| Events \| Trayport/i,
  },
  {
    heading: 'The Learning Hub',
    legacyId: 3311,
    path: '/learning-hub/',
    title: /Trayport Learning Hub \| Product Features & Functionality Videos/i,
  },
  {
    heading: 'Trading in Joule',
    legacyId: 8454,
    path: '/learning-hub-video/trading-in-joule/',
    title: /Trading in Joule \| Learning Hub \| Trayport/i,
  },
  {
    heading: 'EEX',
    legacyId: 3363,
    path: '/venue/eex/',
    title: /EEX \| Exchange \| Trayport/i,
  },
] as const satisfies readonly RepresentativeRoute[]

export const activeNavigationRoots = ['Company', 'Products', 'Markets', 'Regions', 'Resources']

export const featuredInsights = [
  {
    legacyId: 11694,
    path: '/insights/etcsee-2026-automate-your-trading-or-lose/',
    title: 'ETCSEE 2026: Automate your trading or lose',
  },
  {
    legacyId: 11553,
    path: '/insights/navigating-the-new-energy-trading-landscape/',
    title: 'Navigating the New Energy Trading Landscape',
  },
  {
    legacyId: 11203,
    path: '/insights/why-tick-data-is-a-must-for-european-energy-trading/',
    title: 'Why Tick Data is a Must for European Energy Trading',
  },
  {
    legacyId: 10790,
    path: '/insights/from-wellhead-to-world-market-what-north-american-gas-producers-need-to-know-about-lng-pricing-and-risk/',
    title:
      'From Wellhead to World Market: What North American Gas Producers Need to Know About LNG Pricing and Risk',
  },
] as const
