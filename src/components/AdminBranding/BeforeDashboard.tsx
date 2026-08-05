const quickStarts = [
  {
    description: 'Create, structure, preview, and publish core website pages.',
    href: '/admin/collections/pages',
    label: 'Pages',
  },
  {
    description: 'Draft and publish insight articles and external story links.',
    href: '/admin/collections/articles',
    label: 'Articles',
  },
  {
    description: 'Upload reusable images, documents, and other website assets.',
    href: '/admin/collections/media',
    label: 'Media library',
  },
  {
    description: 'Keep the primary and utility navigation clear and current.',
    href: '/admin/globals/navigation',
    label: 'Navigation',
  },
] as const

export const BeforeDashboard = () => (
  <section className="trayport-admin-dashboard" aria-labelledby="trayport-dashboard-title">
    <div className="trayport-admin-dashboard__intro">
      <p className="trayport-admin-eyebrow">Trayport website</p>
      <h1 id="trayport-dashboard-title">Content workspace</h1>
      <p>Choose a content area from the navigation, or start with one of these common tasks.</p>
    </div>

    <nav aria-label="Content quick start" className="trayport-admin-dashboard__quick-start">
      <ul role="list">
        {quickStarts.map(({ description, href, label }) => (
          <li key={href}>
            <a href={href}>
              <span className="trayport-admin-dashboard__quick-start-title">
                {label}
                <span aria-hidden="true">→</span>
              </span>
              <span>{description}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>

    <aside className="trayport-admin-dashboard__role-note" aria-label="Publishing permissions">
      <strong>Publishing:</strong> editors and administrators can draft and publish content.
      Deletion and CMS account administration are restricted to administrators.
    </aside>
  </section>
)

export default BeforeDashboard
