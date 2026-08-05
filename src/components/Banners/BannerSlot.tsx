import type { ComponentProps } from 'react'

import type { Banner } from '@/payload-types'
import { AppLink } from '@/components/site/AppLink'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { ContentLink } from '@/routing/contentLink'

import { DismissibleBanner } from './DismissibleBanner.client'

const bannerLink = (banner: Banner): ContentLink => ({
  label: banner.link?.label,
  newTab: banner.link?.newTab,
  reference: banner.link?.reference,
  type: banner.link?.type,
  url: banner.link?.url,
})

const SiteBanner = ({ banner }: { banner: Banner }) => {
  const large = banner.layout === 'large'

  return (
    <DismissibleBanner
      ariaLabel={`Announcement: ${banner.headline}`}
      className={`site-banner site-banner--${large ? 'large' : 'small'} site-banner--${banner.tone}`}
      dismissible={banner.dismissible !== false}
    >
      {large && banner.image && typeof banner.image === 'object' ? (
        <Media
          fill
          imgClassName="site-banner__image"
          pictureClassName="site-banner__media"
          resource={banner.image}
          sizes="100vw"
        />
      ) : null}
      <div className="site-banner__content trayport-container trayport-container--standard">
        <div className="site-banner__copy">
          <strong className="site-banner__headline">{banner.headline}</strong>
          {large && banner.body ? (
            <RichText
              className="site-banner__body"
              data={banner.body as ComponentProps<typeof RichText>['data']}
              enableGutter={false}
              enableProse={false}
            />
          ) : null}
        </div>
        <AppLink className="site-banner__link" link={bannerLink(banner)}>
          {banner.link?.label}
          <span aria-hidden="true">→</span>
        </AppLink>
      </div>
    </DismissibleBanner>
  )
}

export const BannerSlot = ({ banners }: { banners?: readonly Banner[] }) =>
  banners?.length ? banners.map((banner) => <SiteBanner banner={banner} key={banner.id} />) : null
