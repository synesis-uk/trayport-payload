import { Section, Stack } from '@/components/site'

export function ContentLoadingState() {
  return (
    <div aria-busy="true" aria-label="Loading page" role="status">
      <Section spacing="generous" width="reading">
        <Stack gap="lg">
          <span className="h-3 w-28 animate-pulse rounded-pill bg-trayport-light-blue/25 motion-reduce:animate-none" />
          <span className="h-12 w-full max-w-2xl animate-pulse rounded-control bg-trayport-deep/12 motion-reduce:animate-none" />
          <span className="h-5 w-full animate-pulse rounded-control bg-trayport-deep/8 motion-reduce:animate-none" />
          <span className="h-5 w-4/5 animate-pulse rounded-control bg-trayport-deep/8 motion-reduce:animate-none" />
        </Stack>
      </Section>
    </div>
  )
}

export default function Loading() {
  return <ContentLoadingState />
}
