import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'

// Next.js owns stylesheet order. Prevent Font Awesome from injecting a second
// copy at runtime so icons render without a flash or hydration mismatch.
config.autoAddCss = false
