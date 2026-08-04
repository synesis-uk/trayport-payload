import { HeadingGroup, Section, Stack } from '@/components/site'
import { ButtonLink } from '@/components/ui/button-link'

export const NotFoundView = () => (
  <main id="main-content">
    <Section spacing="generous" width="reading">
      <Stack gap="lg">
        <HeadingGroup
          description="The address may have changed, or the page may no longer be available."
          eyebrow="Page not found"
          heading="We couldn't find that page."
          level={1}
        />
        <ButtonLink className="w-fit" href="/">
          Return to the homepage
        </ButtonLink>
      </Stack>
    </Section>
  </main>
)
