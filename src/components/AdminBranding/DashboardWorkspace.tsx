import Link from 'next/link'

import type { DashboardContentData, DashboardContentItem } from './dashboardData'
import { DashboardIcon } from './DashboardIcon'

type DashboardWorkspaceProps = {
  data: DashboardContentData
  isAdministrator: boolean
  userName: string
}

const quickActions = [
  {
    description: 'Create and structure a website page with preview and publishing controls.',
    href: '/admin/collections/pages/create',
    icon: 'page',
    label: 'Create a page',
  },
  {
    description: 'Draft an insight, webinar, case study, or external story listing.',
    href: '/admin/collections/articles/create',
    icon: 'article',
    label: 'Create an article',
  },
  {
    description: 'Publish a targeted website announcement with placement and schedule controls.',
    href: '/admin/collections/banners/create',
    icon: 'banner',
    label: 'Schedule a banner',
  },
  {
    description: 'Add a public or customer learning resource to the Learning Hub.',
    href: '/admin/collections/learning-videos/create',
    icon: 'video',
    label: 'Add a learning video',
  },
  {
    description: 'Upload and organise imagery, video, documents, and other website assets.',
    href: '/admin/collections/media/create',
    icon: 'media',
    label: 'Upload media',
  },
] as const

const websiteAreas = [
  {
    description: 'Primary, utility, and audience navigation',
    href: '/admin/globals/navigation',
    icon: 'navigation',
    label: 'Navigation',
  },
  {
    description: 'Images, documents, and video assets',
    href: '/admin/collections/media',
    icon: 'media',
    label: 'Media library',
  },
  {
    description: 'Trading hubs, venues, and regional relationships',
    href: '/admin/collections/hubs',
    icon: 'map',
    label: 'Market coverage',
  },
  {
    description: 'Footer groups, legal links, and destinations',
    href: '/admin/globals/footer',
    icon: 'footer',
    label: 'Footer',
  },
  {
    description: 'Maintain permanent and temporary website redirects',
    href: '/admin/collections/redirects',
    icon: 'redirect',
    label: 'Redirects',
  },
  {
    description: 'Review targeted announcements and their publishing windows',
    href: '/admin/collections/banners',
    icon: 'banner',
    label: 'Banners',
  },
] as const

const administratorAreas = [
  {
    description: 'Validate and commit volume or price datasets',
    href: '/admin/collections/market-data-imports',
    icon: 'data',
    label: 'Market data imports',
  },
  {
    description: 'Review provider-linked customer records',
    href: '/admin/collections/customer-identities',
    icon: 'identity',
    label: 'Customer identities',
  },
  {
    description: 'Manage editor and administrator accounts',
    href: '/admin/collections/users',
    icon: 'users',
    label: 'CMS users',
  },
  {
    description: 'Brand defaults, contact details, and integrations',
    href: '/admin/globals/site-settings',
    icon: 'settings',
    label: 'Site settings',
  },
] as const

const collectionLabels = {
  articles: 'Articles',
  banners: 'Banners',
  'learning-videos': 'Learning videos',
  pages: 'Pages',
} as const

const formatDate = (value: string): string => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Date unavailable'

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const RecentContentRow = ({ item }: { item: DashboardContentItem }) => (
  <li className="trayport-admin-dashboard__recent-item">
    <a href={item.href}>
      <span className="trayport-admin-dashboard__recent-icon" aria-hidden="true">
        <DashboardIcon
          name={
            item.collection === 'banners'
              ? 'banner'
              : item.collection === 'learning-videos'
                ? 'video'
                : item.collection === 'articles'
                  ? 'article'
                  : 'page'
          }
        />
      </span>
      <span className="trayport-admin-dashboard__recent-content">
        <span className="trayport-admin-dashboard__recent-title">{item.title}</span>
        <span className="trayport-admin-dashboard__recent-meta">
          {item.kind}
          <span aria-hidden="true"> · </span>
          <time dateTime={item.updatedAt}>{formatDate(item.updatedAt)}</time>
        </span>
      </span>
      <span
        className={`trayport-admin-dashboard__status trayport-admin-dashboard__status--${item.status}`}
      >
        {item.status === 'draft' ? 'Draft / changed' : 'Published'}
      </span>
      <span className="trayport-admin-dashboard__row-arrow" aria-hidden="true">
        →
      </span>
    </a>
  </li>
)

export const DashboardWorkspace = ({
  data,
  isAdministrator,
  userName,
}: DashboardWorkspaceProps) => {
  const totalDrafts = Object.values(data.draftCounts).reduce((total, count) => total + count, 0)

  return (
    <div className="trayport-admin-dashboard">
      <header className="trayport-admin-dashboard__hero">
        <div className="trayport-admin-dashboard__hero-copy">
          <p className="trayport-admin-eyebrow">Trayport website</p>
          <h1>Content workspace</h1>
          <p>
            Welcome, {userName}. Create, review, and publish website content from one focused
            workspace.
          </p>
        </div>
        <div className="trayport-admin-dashboard__role" aria-label="Current CMS role">
          <span>{isAdministrator ? 'Administrator' : 'Editor'}</span>
          <small>
            {isAdministrator ? 'Content and system access' : 'Content publishing access'}
          </small>
        </div>
      </header>

      <section className="trayport-admin-dashboard__section" aria-labelledby="start-work-title">
        <div className="trayport-admin-dashboard__section-heading">
          <div>
            <p className="trayport-admin-dashboard__section-kicker">Common tasks</p>
            <h2 id="start-work-title">Start something</h2>
          </div>
          <Link
            className="trayport-admin-dashboard__text-link"
            href="/admin/collections/pages"
            prefetch={false}
          >
            Browse all pages <span aria-hidden="true">→</span>
          </Link>
        </div>

        <nav aria-label="Primary content actions">
          <ul className="trayport-admin-dashboard__quick-actions" role="list">
            {quickActions.map(({ description, href, icon, label }) => (
              <li key={href}>
                <a href={href}>
                  <span className="trayport-admin-dashboard__action-icon" aria-hidden="true">
                    <DashboardIcon name={icon} />
                  </span>
                  <span className="trayport-admin-dashboard__action-copy">
                    <strong>{label}</strong>
                    <span>{description}</span>
                  </span>
                  <span className="trayport-admin-dashboard__action-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <div className="trayport-admin-dashboard__workflow-grid">
        <section
          className="trayport-admin-dashboard__panel trayport-admin-dashboard__recent"
          aria-labelledby="recent-work-title"
        >
          <div className="trayport-admin-dashboard__panel-heading">
            <div>
              <p className="trayport-admin-dashboard__section-kicker">Your workspace</p>
              <h2 id="recent-work-title">Recently edited</h2>
            </div>
            <Link href="/admin/collections/pages" prefetch={false}>
              View content
            </Link>
          </div>

          {data.recent.length > 0 ? (
            <ol className="trayport-admin-dashboard__recent-list">
              {data.recent.map((item) => (
                <RecentContentRow item={item} key={`${item.collection}-${item.id}`} />
              ))}
            </ol>
          ) : (
            <div className="trayport-admin-dashboard__empty-state">
              <DashboardIcon name="page" />
              <p>No recent content yet.</p>
              <span>
                Your latest page, article, banner, and learning-video edits will appear here.
              </span>
            </div>
          )}

          {data.unavailable ? (
            <p className="trayport-admin-dashboard__data-note" role="status">
              Some activity data is temporarily unavailable. Content tools remain available.
            </p>
          ) : null}
        </section>

        <aside
          className="trayport-admin-dashboard__panel trayport-admin-dashboard__attention"
          aria-labelledby="attention-title"
        >
          <div className="trayport-admin-dashboard__attention-total">
            <span>{totalDrafts}</span>
            <div>
              <p className="trayport-admin-dashboard__section-kicker">Needs attention</p>
              <h2 id="attention-title">Drafts and changes</h2>
            </div>
          </div>
          <p className="trayport-admin-dashboard__attention-intro">
            Review work in progress before it is published to the website.
          </p>
          <ul className="trayport-admin-dashboard__draft-list" role="list">
            {(Object.keys(data.draftCounts) as (keyof typeof data.draftCounts)[]).map(
              (collection) => (
                <li key={collection}>
                  <a href={`/admin/collections/${collection}`}>
                    <span>{collectionLabels[collection]}</span>
                    <strong aria-label={`${data.draftCounts[collection]} drafts or changes`}>
                      {data.draftCounts[collection]}
                    </strong>
                  </a>
                </li>
              ),
            )}
          </ul>
          <p className="trayport-admin-dashboard__permission-note">
            Editors and administrators can draft and publish. Permanent deletion is restricted to
            administrators.
          </p>
        </aside>
      </div>

      <section className="trayport-admin-dashboard__section" aria-labelledby="manage-site-title">
        <div className="trayport-admin-dashboard__section-heading">
          <div>
            <p className="trayport-admin-dashboard__section-kicker">Website structure</p>
            <h2 id="manage-site-title">Manage the website</h2>
          </div>
        </div>
        <nav aria-label="Website management areas">
          <ul className="trayport-admin-dashboard__area-links" role="list">
            {websiteAreas.map(({ description, href, icon, label }) => (
              <li key={href}>
                <a href={href}>
                  <span className="trayport-admin-dashboard__area-icon" aria-hidden="true">
                    <DashboardIcon name={icon} />
                  </span>
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                  <span aria-hidden="true">→</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      {isAdministrator ? (
        <section
          className="trayport-admin-dashboard__section trayport-admin-dashboard__admin-section"
          aria-labelledby="administration-title"
        >
          <div className="trayport-admin-dashboard__section-heading">
            <div>
              <p className="trayport-admin-dashboard__section-kicker">Restricted workspace</p>
              <h2 id="administration-title">Administration</h2>
            </div>
            <p>System tools available to administrators only.</p>
          </div>
          <nav aria-label="Administration areas">
            <ul className="trayport-admin-dashboard__admin-links" role="list">
              {administratorAreas.map(({ description, href, icon, label }) => (
                <li key={href}>
                  <a href={href}>
                    <span className="trayport-admin-dashboard__area-icon" aria-hidden="true">
                      <DashboardIcon name={icon} />
                    </span>
                    <span>
                      <strong>{label}</strong>
                      <small>{description}</small>
                    </span>
                    <span aria-hidden="true">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </section>
      ) : null}
    </div>
  )
}
