import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import {
  loadRegionalMarketData,
  type RegionalMarketDataInterval,
} from '@/data/regionalMarketData.server'

const intervalFrom = (value: string | null): RegionalMarketDataInterval =>
  value === 'month' || value === 'quarter' ? value : 'year'

export async function GET(request: NextRequest) {
  const assetClassKey = request.nextUrl.searchParams.get('assetClassKey')?.trim() || ''
  const interval = intervalFrom(request.nextUrl.searchParams.get('interval'))
  const period = request.nextUrl.searchParams.get('period')?.trim() || ''
  const result = await loadRegionalMarketData(assetClassKey, interval, period)

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=300',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
    status: result.status === 'unavailable' ? 503 : 200,
  })
}
