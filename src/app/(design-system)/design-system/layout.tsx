import '@/components/icons/config'

import '../../(frontend)/globals.css'
import '../../(frontend)/parity-shell.css'
import '../../(frontend)/parity-structured.css'
import '../../(frontend)/parity-blocks.css'

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
