'use client'

import { useEffect } from 'react'

import { ActionGroup } from '@/components/site/ActionGroup'
import { Stack } from '@/components/site/layout'
import { Section } from '@/components/site/section'
import { HeadingGroup } from '@/components/site/typography'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { reportClientError, type ClientBoundaryError } from '@/utilities/reportClientError'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: ClientBoundaryError
  reset: () => void
}) {
  useEffect(() => {
    reportClientError(error, 'frontend-route')
  }, [error])

  return (
    <main id="main-content">
      <Section spacing="generous" width="reading">
        <Stack gap="lg">
          <HeadingGroup
            description="The page could not be loaded. You can try again without losing the address you requested."
            eyebrow="Temporary problem"
            heading="Something went wrong."
            level={1}
          />
          <ActionGroup>
            <Button onClick={reset} type="button">
              Try again
            </Button>
            <ButtonLink href="/" variant="secondary">
              Return to the homepage
            </ButtonLink>
          </ActionGroup>
        </Stack>
      </Section>
    </main>
  )
}
