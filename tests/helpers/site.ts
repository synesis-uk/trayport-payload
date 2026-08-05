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
  {
    heading: 'Our Use Of Cookies',
    legacyId: 7589,
    path: '/legal/cookie-policy/',
    title: /Trayport \| Cookie Policy & Consent Settings/i,
  },
  {
    heading: 'Trayport Market Matrix',
    legacyId: 2231,
    path: '/resources/market-matrix/',
    title: /Trayport Market Matrix \| Commodity Market Overview/i,
  },
  {
    heading: 'Explore Trayport’s Markets Map',
    legacyId: 5920,
    path: '/resources/markets-map/',
    title: /Markets Map \| Global Coverage \| Trayport/i,
  },
  {
    heading: 'Legal',
    legacyId: 4737,
    path: '/legal/',
    title: /Legal \| Website Terms.*Trayport/i,
  },
  {
    heading: 'Terms of Use & Disclaimer',
    legacyId: 7585,
    path: '/terms-of-use-disclaimer/',
    title: /Terms of Use and Disclaimer \| Legal \| Trayport/i,
  },
  {
    heading: 'Legal Notice',
    legacyId: 4803,
    path: '/legal/legal-notice/',
    title: /Legal Notice \| Legal \| Trayport/i,
  },
  {
    heading: 'Modern Slavery',
    legacyId: 7573,
    path: '/legal/modern-slavery/',
    title: /Modern Slavery \| Legal \| Trayport/i,
  },
  {
    heading: 'Asia Pacific',
    legacyId: 5983,
    path: '/regions/asia-pacific/',
    title: /Asia Pacific Energy Markets \| Trayport/i,
  },
  {
    heading: 'North America',
    legacyId: 2221,
    path: '/regions/north-america/',
    title: /North American Energy Markets \| Trayport/i,
  },
  {
    heading: 'Power Your Career',
    legacyId: 11475,
    path: '/company/careers/',
    title: /Careers at Trayport \| Jobs in Energy Trading Technology/i,
  },
  {
    heading: 'Europe',
    legacyId: 5981,
    path: '/regions/europe/',
    title: /Europe \| Energy Markets \| Trayport/i,
  },
  {
    heading: 'Contact Us',
    legacyId: 34,
    path: '/contact/',
    title: /Contact Trayport \| Get in Touch & Request a Demo \| Trayport/i,
  },
  {
    heading: 'Data Analytics',
    legacyId: 1930,
    path: '/products/data-analytics/',
    title: /Data Analytics \| Advanced Insights \| Trayport/i,
  },
  {
    heading: 'An end-to-end solution catering to your market requirements',
    legacyId: 1940,
    path: '/products/exchange-trading-system/',
    title: /Exchange Trading System \| Trayport Solutions/i,
  },
  {
    heading: 'Lifecycle Information',
    legacyId: 4028,
    path: '/resources/lifecycle-information/',
    title: /Lifecycle Information \| Product Support \| Trayport/i,
  },
  {
    heading: 'Exchange Connectivity',
    legacyId: 6773,
    path: '/products/exchange-connectivity/',
    title: /Exchange Connectivity \| Trayport Products/i,
  },
  {
    heading: 'EEX’s New Natural Gas Spot Trading System',
    legacyId: 11299,
    path: '/eex-news/',
    title: /EEX's New Natural Gas Spot Trading System/i,
  },
] as const satisfies readonly RepresentativeRoute[]

export const activeNavigationRoots = ['Company', 'Products', 'Markets', 'Regions', 'Resources']

export const managedRedirectRoutes = [
  {
    legacyId: 4031,
    path: '/request-a-demo/',
    status: 302,
    target: '/contact/',
  },
] as const

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

export const goldenRoutes = [
  { heading: 'Connecting Trade Globally', name: 'home', path: '/' },
  {
    heading: 'Joule, the leading trading solution for energy and commodities markets',
    name: 'joule',
    path: '/products/joule/',
  },
  { heading: 'Insights', name: 'insights', path: '/resources/insights/' },
  {
    heading: 'German Power',
    name: 'german-power',
    path: '/market-coverage/german-power/',
  },
  { heading: 'EEX', name: 'eex', path: '/venue/eex/' },
] as const
