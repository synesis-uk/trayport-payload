import Link from 'next/link'
import type { CSSProperties } from 'react'

type GlobalErrorFallbackProps = {
  onRetry: () => void
}

const styles = {
  actions: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginTop: '2rem',
  },
  description: {
    color: '#4b5563',
    fontSize: '1rem',
    lineHeight: 1.65,
    margin: '1rem 0 0',
    maxWidth: '38rem',
  },
  eyebrow: {
    color: '#c9184a',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    margin: 0,
    textTransform: 'uppercase',
  },
  heading: {
    color: '#111827',
    fontSize: 'clamp(2rem, 7vw, 3.5rem)',
    fontWeight: 700,
    letterSpacing: '-0.035em',
    lineHeight: 1.05,
    margin: '0.75rem 0 0',
  },
  homeLink: {
    alignItems: 'center',
    border: '1px solid #9ca3af',
    borderRadius: '0.25rem',
    color: '#111827',
    display: 'inline-flex',
    fontSize: '1rem',
    fontWeight: 650,
    justifyContent: 'center',
    minHeight: '3rem',
    padding: '0.75rem 1.125rem',
    textDecoration: 'none',
  },
  main: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: 'clamp(1.5rem, 5vw, 4rem)',
  },
  panel: {
    borderTop: '0.3rem solid #c9184a',
    maxWidth: '48rem',
    paddingTop: '2rem',
    width: '100%',
  },
  retryButton: {
    background: '#111827',
    border: '1px solid #111827',
    borderRadius: '0.25rem',
    color: '#ffffff',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: '1rem',
    fontWeight: 650,
    minHeight: '3rem',
    padding: '0.75rem 1.125rem',
  },
} satisfies Record<string, CSSProperties>

export const GlobalErrorFallback = ({ onRetry }: GlobalErrorFallbackProps) => (
  <main aria-labelledby="global-error-heading" id="main-content" style={styles.main}>
    <section style={styles.panel}>
      <div aria-live="assertive">
        <p style={styles.eyebrow}>Temporary problem</p>
        <h1 id="global-error-heading" style={styles.heading}>
          Something went wrong.
        </h1>
        <p style={styles.description}>
          The site could not be loaded. Try again, or return to the homepage and continue from
          there.
        </p>
      </div>
      <div style={styles.actions}>
        <button onClick={onRetry} style={styles.retryButton} type="button">
          Try again
        </button>
        <Link href="/" style={styles.homeLink}>
          Return to the homepage
        </Link>
      </div>
    </section>
  </main>
)
