type DashboardIconName =
  | 'article'
  | 'banner'
  | 'data'
  | 'footer'
  | 'identity'
  | 'map'
  | 'media'
  | 'navigation'
  | 'page'
  | 'redirect'
  | 'settings'
  | 'users'
  | 'video'

type DashboardIconProps = {
  name: DashboardIconName
}

export const DashboardIcon = ({ name }: DashboardIconProps) => {
  const commonProps = {
    'aria-hidden': true,
    className: 'trayport-dashboard-icon',
    fill: 'none',
    focusable: 'false' as const,
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.7,
    viewBox: '0 0 24 24',
  }

  switch (name) {
    case 'article':
      return (
        <svg {...commonProps}>
          <path d="M7 3.75h7.5L19 8.2v12.05H7z" />
          <path d="M14.5 3.75V8.2H19M10 12h6M10 15.5h6" />
        </svg>
      )
    case 'banner':
      return (
        <svg {...commonProps}>
          <path d="M4 6.25h10.75v8.5H4zM14.75 8.25 20 5v11l-5.25-3.25" />
          <path d="M7.25 14.75v4.5h3.5v-4.5" />
        </svg>
      )
    case 'data':
      return (
        <svg {...commonProps}>
          <ellipse cx="12" cy="5.5" rx="7" ry="2.75" />
          <path d="M5 5.5v6c0 1.52 3.13 2.75 7 2.75s7-1.23 7-2.75v-6M5 11.5v6c0 1.52 3.13 2.75 7 2.75s7-1.23 7-2.75v-6" />
        </svg>
      )
    case 'footer':
      return (
        <svg {...commonProps}>
          <rect height="16" rx="1.5" width="18" x="3" y="4" />
          <path d="M3 15h18M7 17.5h3M13 17.5h4" />
        </svg>
      )
    case 'identity':
      return (
        <svg {...commonProps}>
          <circle cx="9" cy="8.25" r="3.25" />
          <path d="M3.75 19.5c.45-3.4 2.2-5.1 5.25-5.1s4.8 1.7 5.25 5.1M16.5 7.5h3.75M18.375 5.625v3.75M16.25 14.25h4" />
        </svg>
      )
    case 'map':
      return (
        <svg {...commonProps}>
          <path d="m3.75 6.25 5-2.25 6.5 2.25 5-2.25v13.75l-5 2.25-6.5-2.25-5 2.25z" />
          <path d="M8.75 4v13.75M15.25 6.25V20" />
        </svg>
      )
    case 'media':
      return (
        <svg {...commonProps}>
          <rect height="16" rx="1.75" width="18" x="3" y="4" />
          <circle cx="8" cy="9" r="1.5" />
          <path d="m5.5 17 4.25-4.25 2.75 2.5 2.25-2 3.75 3.75" />
        </svg>
      )
    case 'navigation':
      return (
        <svg {...commonProps}>
          <path d="M4 6h16M4 12h10M4 18h16" />
          <path d="m17 9 3 3-3 3" />
        </svg>
      )
    case 'page':
      return (
        <svg {...commonProps}>
          <path d="M6.5 3.75h8L18.5 8v12.25h-12z" />
          <path d="M14.5 3.75V8h4M9.5 12h6M9.5 15.5h4.25" />
        </svg>
      )
    case 'redirect':
      return (
        <svg {...commonProps}>
          <path d="M4 7.5h9.5a5.5 5.5 0 0 1 0 11H9" />
          <path d="m12 4.5 3 3-3 3M12 15.5l-3 3 3 3" />
        </svg>
      )
    case 'settings':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.15 13.75a7.7 7.7 0 0 0 0-3.5l2-1.55-2-3.4-2.45 1a8 8 0 0 0-3-1.75L13.35 2h-3.7L9.3 4.55a8 8 0 0 0-3 1.75l-2.45-1-2 3.4 2 1.55a7.7 7.7 0 0 0 0 3.5l-2 1.55 2 3.4 2.45-1a8 8 0 0 0 3 1.75L9.65 22h3.7l.35-2.55a8 8 0 0 0 3-1.75l2.45 1 2-3.4z" />
        </svg>
      )
    case 'users':
      return (
        <svg {...commonProps}>
          <circle cx="9" cy="8" r="3.25" />
          <path d="M3.5 19.5c.5-3.55 2.33-5.32 5.5-5.32s5 1.77 5.5 5.32M15.5 5.4a3.25 3.25 0 0 1 0 5.2M16.5 14.3c2.35.37 3.68 2.1 4 5.2" />
        </svg>
      )
    case 'video':
      return (
        <svg {...commonProps}>
          <rect height="15" rx="1.75" width="18" x="3" y="4.5" />
          <path d="m10 9 5 3-5 3z" />
        </svg>
      )
  }
}
