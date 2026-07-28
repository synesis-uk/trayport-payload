import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="trayport-not-found" id="main-content">
      <div className="trayport-container trayport-container--reading">
        <p className="trayport-eyebrow">Page not found</p>
        <h1>We couldn&apos;t find that page.</h1>
        <p>The address may have changed, or the page may no longer be available.</p>
        <Link className="trayport-action trayport-action--primary" href="/">
          Return to the homepage
        </Link>
      </div>
    </main>
  )
}
