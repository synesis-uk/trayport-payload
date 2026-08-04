import type { ReactNode } from 'react'

import { AppIcon } from '@/components/icons'
import {
  ActionGroup,
  ActionLink,
  CTASection,
  Container,
  Grid,
  HeadingGroup,
  Hero,
  IconText,
  LogoCloud,
  MediaBlock,
  Stack,
  StatGrid,
  Surface,
} from '@/components/site'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Disclosure,
  DisclosureContent,
  DisclosureTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pagination } from '@/components/ui/pagination'
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import {
  appIconNames,
  buttonFixtures,
  colourFixtures,
  gallerySections,
  iconFixtures,
  iconSizeFixtures,
  marketOptions,
  responsiveCanvases,
  type GallerySectionID,
} from './fixtures'

const sectionByID = (id: GallerySectionID) => {
  const section = gallerySections.find((candidate) => candidate.id === id)
  if (!section) throw new Error(`Unknown design-system gallery section: ${id}`)
  return section
}

function GallerySection({ children, id }: { children: ReactNode; id: GallerySectionID }) {
  const section = sectionByID(id)
  const headingID = `design-system-${id}`

  return (
    <section
      aria-labelledby={headingID}
      className="rounded-panel border border-border bg-card p-5 shadow-editorial sm:p-7 lg:p-8"
      data-visual-test={id}
    >
      <div className="mb-6 max-w-3xl border-b border-border pb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground" id={headingID}>
          {section.title}
        </h2>
        <p className="mt-2 text-sm/6 text-muted-foreground">{section.description}</p>
      </div>
      {children}
    </section>
  )
}

export function ComponentGallery() {
  return (
    <main
      className="min-h-screen bg-background text-foreground"
      data-visual-test="design-system-gallery"
      id="main-content"
    >
      <header className="bg-trayport-deep text-white" data-visual-test="gallery-introduction">
        <Container className="py-14 sm:py-16 lg:py-20" width="wide">
          <p className="text-sm font-semibold tracking-[0.16em] text-trayport-cyan uppercase">
            Internal frontend reference
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl/tight font-semibold tracking-tight sm:text-5xl">
            Trayport design-system gallery
          </h1>
          <p className="mt-5 max-w-3xl text-base/7 text-white/75 sm:text-lg">
            Deterministic examples of the shared tokens and current UI primitives. This route does
            not load CMS content and is unavailable unless explicitly enabled by the server.
          </p>
        </Container>
      </header>

      <Container className="grid gap-6 py-8 sm:py-10 lg:gap-8 lg:py-12" width="wide">
        <GallerySection id="colour-tokens">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {colourFixtures.map((colour) => (
              <li
                className="overflow-hidden rounded-lg border border-border bg-background"
                key={colour.token}
              >
                <div
                  aria-hidden="true"
                  className="h-24 border-b border-border"
                  style={{ backgroundColor: `var(${colour.token})` }}
                />
                <div className="p-4">
                  <p className="text-sm font-semibold">{colour.label}</p>
                  <code className="mt-1 block text-xs text-muted-foreground">{colour.token}</code>
                </div>
              </li>
            ))}
          </ul>
        </GallerySection>

        <GallerySection id="typography">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
            <div className="space-y-5">
              <p className="text-5xl/tight font-semibold tracking-tight sm:text-6xl">
                Connecting trade globally
              </p>
              <p className="text-3xl/tight font-semibold tracking-tight">
                Energy markets, connected
              </p>
              <p className="max-w-3xl text-lg/8 text-muted-foreground">
                Trayport provides the network, data, and tools that help market participants trade
                efficiently across global energy and commodities markets.
              </p>
            </div>
            <dl className="grid content-start gap-4 rounded-lg bg-secondary p-5">
              <div>
                <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Typeface
                </dt>
                <dd className="mt-1 text-base font-medium">InterVariable 4.1</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Reading measure
                </dt>
                <dd className="mt-1 text-base font-medium">47.5rem</dd>
              </div>
            </dl>
          </div>
        </GallerySection>

        <GallerySection id="icons">
          <div aria-hidden data-visual-test="complete-icon-registry" hidden>
            {appIconNames.map((name) => (
              <span data-app-icon-name={name} key={name}>
                <AppIcon aria-hidden name={name} />
              </span>
            ))}
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {iconFixtures.map((icon) => (
              <li
                className="flex min-h-20 items-center gap-4 rounded-lg border border-border bg-background p-4"
                key={icon.name}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                  <AppIcon aria-hidden className="size-4" name={icon.name} />
                </span>
                <span>
                  <span className="block text-sm font-medium">{icon.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{icon.family}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-end gap-5 rounded-lg bg-secondary p-5">
            {iconSizeFixtures.map((size) => (
              <div className="grid justify-items-center gap-2" key={size.label}>
                <AppIcon aria-hidden className={size.className} name="chartLine" />
                <span className="text-xs text-muted-foreground">{size.label}</span>
              </div>
            ))}
          </div>
        </GallerySection>

        <GallerySection id="buttons">
          <div className="flex flex-wrap items-center gap-3" data-visual-test="button-variants">
            {buttonFixtures.map((button) => (
              <Button key={button.variant} type="button" variant={button.variant}>
                {button.label}
              </Button>
            ))}
            <Button disabled type="button">
              Disabled action
            </Button>
            <Button isLoading loadingLabel="Sending" type="button">
              Send enquiry
            </Button>
            <Button aria-label="Continue" size="icon" type="button">
              <AppIcon aria-hidden name="arrowRight" />
            </Button>
            <ButtonLink href="/products/joule/">Button link</ButtonLink>
            <ButtonLink disabled href="/products/joule/" variant="outline">
              Disabled link
            </ButtonLink>
          </div>
        </GallerySection>

        <GallerySection id="interaction-primitives">
          <div className="grid gap-8 lg:grid-cols-2" data-visual-test="interaction-primitives">
            <Surface tone="outlined">
              <h3 className="m-0 text-lg font-semibold">Overlays and menus</h3>
              <div className="mt-5 flex flex-wrap gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button type="button">Open dialog</Button>
                  </DialogTrigger>
                  <DialogPortal>
                    <DialogOverlay>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="text-xl font-semibold">
                            Request a conversation
                          </DialogTitle>
                          <DialogDescription className="text-sm/6 text-muted-foreground">
                            This deterministic dialog exercises focus containment and restoration.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-6">
                          <DialogClose asChild>
                            <Button type="button" variant="secondary">
                              Cancel
                            </Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button type="button">Continue</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </DialogOverlay>
                  </DialogPortal>
                </Dialog>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline">
                      Open popover
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <p className="m-0 font-semibold">Market status</p>
                    <p className="mt-1 text-sm/6 text-muted-foreground">
                      All monitored services are operating normally.
                    </p>
                    <PopoverClose asChild>
                      <Button className="mt-4" size="sm" type="button" variant="secondary">
                        Close
                      </Button>
                    </PopoverClose>
                  </PopoverContent>
                </Popover>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline">
                      Actions
                      <AppIcon aria-hidden name="chevronDown" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Page actions</DropdownMenuLabel>
                    <DropdownMenuItem>Preview page</DropdownMenuItem>
                    <DropdownMenuItem>Copy link</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>Archive unavailable</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Surface>

            <Surface tone="outlined">
              <h3 className="m-0 text-lg font-semibold">Disclosures</h3>
              <Accordion className="mt-3" collapsible defaultValue="markets" type="single">
                <AccordionItem value="markets">
                  <AccordionTrigger>Which markets are connected?</AccordionTrigger>
                  <AccordionContent>
                    Trayport connects participants across power, gas, environmental, and commodities
                    markets.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="access">
                  <AccordionTrigger>How do I request access?</AccordionTrigger>
                  <AccordionContent>
                    Contact the Trayport team and we will route your request to the right
                    specialist.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Disclosure className="mt-5">
                <DisclosureTrigger>View implementation note</DisclosureTrigger>
                <DisclosureContent>
                  A single-item disclosure shares the same keyboard and focus contract as the
                  accordion.
                </DisclosureContent>
              </Disclosure>
            </Surface>

            <Surface className="lg:col-span-2" tone="outlined">
              <Pagination
                currentPage={4}
                getHref={(page) => `/design-system/?page=${page}`}
                totalPages={12}
              />
            </Surface>
          </div>
        </GallerySection>

        <GallerySection id="compositions">
          <Stack gap="xl">
            <HeadingGroup
              description={
                <p>
                  Bounded layout and action APIs keep CMS values semantic while presentation stays
                  in the frontend system.
                </p>
              }
              eyebrow="Market access"
              heading="One system, reusable compositions"
            />
            <ActionGroup className="mt-0">
              <ActionLink
                link={{ label: 'Explore Joule', type: 'custom', url: '/products/joule/' }}
              />
              <ActionLink
                appearance="secondary"
                link={{ label: 'View insights', type: 'custom', url: '/resources/insights/' }}
              />
            </ActionGroup>
            <StatGrid
              items={[
                { label: 'Connected markets', value: '50+' },
                { label: 'Global offices', value: '4' },
                { label: 'Availability', value: '24/7' },
              ]}
            />
            <Surface
              aria-hidden="true"
              data-visual-test="dark-surface-prose-contract"
              hidden
              tone="dark"
            >
              <div className="trayport-prose prose">
                <p>Context-aware dark-surface prose</p>
              </div>
            </Surface>
            <div
              aria-hidden="true"
              className="trayport-section--wrapper-dark"
              data-visual-test="dark-statistics-contract"
              hidden
            >
              <StatGrid
                appearance="editorial"
                items={[{ label: 'Dark statistic label', value: '24/7' }]}
              />
            </div>
            <Hero
              actions={
                <>
                  <ActionLink
                    link={{ label: 'Explore Joule', type: 'custom', url: '/products/joule/' }}
                  />
                  <ActionLink
                    appearance="secondary"
                    link={{ label: 'Contact us', type: 'custom', url: '/contact/' }}
                  />
                </>
              }
              body={<p>One network for energy and commodities markets around the world.</p>}
              className="overflow-hidden rounded-panel"
              eyebrow="Connected markets"
              heading="Trade with confidence"
              stats={[
                { label: 'Connected markets', value: '50+' },
                { label: 'Availability', value: '24/7' },
              ]}
            />
            <Grid columns="two">
              <IconText
                description="Bounded icon roles keep editorial controls predictable."
                icon="lightbulb"
                title="Clear ideas"
              />
              <IconText
                description="Presentation remains independent from Payload field shapes."
                icon="chart"
                title="Trusted data"
              />
            </Grid>
            <LogoCloud
              className="overflow-hidden rounded-panel bg-border"
              items={[
                { name: 'EEX' },
                { name: 'ICE' },
                { name: 'CME Group' },
                { name: 'Nasdaq' },
                { name: 'Trayport' },
              ]}
            />
            <CTASection
              actions={
                <ButtonLink href="/contact/" variant="secondary">
                  Speak to Trayport
                </ButtonLink>
              }
              className="overflow-hidden rounded-panel"
              description={<p>Talk to a specialist about the markets and workflows you need.</p>}
              eyebrow="Next step"
              heading="Connect your trading community"
              spacing="compact"
            />
            <Grid columns="three">
              {['Plain', 'Soft', 'Outlined'].map((label, index) => (
                <Surface
                  key={label}
                  tone={index === 1 ? 'soft' : index === 2 ? 'outlined' : 'plain'}
                >
                  <p className="m-0 font-semibold">{label} surface</p>
                </Surface>
              ))}
            </Grid>
          </Stack>
        </GallerySection>

        <GallerySection id="forms">
          <div
            aria-label="Form-control examples"
            className="grid gap-6 lg:grid-cols-2"
            role="group"
          >
            <FormField
              description="Default populated input."
              id="gallery-name"
              label="Name"
              name="name"
              required
            >
              <Input defaultValue="Alex Morgan" />
            </FormField>

            <FormField
              error="Enter a complete email address."
              id="gallery-email"
              label="Email address"
              name="email"
            >
              <Input defaultValue="alex@" type="email" />
            </FormField>

            <div className="grid gap-2">
              <Label id="gallery-market-label">Market</Label>
              <Select defaultValue="power">
                <SelectTrigger aria-labelledby="gallery-market-label">
                  <SelectValue placeholder="Select a market" />
                </SelectTrigger>
                <SelectContent>
                  {marketOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs/5 text-muted-foreground">Current Radix select.</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gallery-disabled">Account reference</Label>
              <Input defaultValue="TP-2048" disabled id="gallery-disabled" />
              <p className="text-xs/5 text-muted-foreground">Disabled input.</p>
            </div>

            <div className="grid gap-2 lg:col-span-2">
              <Label htmlFor="gallery-message">Message</Label>
              <Textarea
                defaultValue="Please tell me more about market access through Joule."
                id="gallery-message"
                rows={4}
              />
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-4 lg:col-span-2">
              <div className="flex items-center gap-2">
                <Checkbox defaultChecked id="gallery-updates" />
                <Label htmlFor="gallery-updates">Receive product updates</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox disabled id="gallery-unavailable" />
                <Label htmlFor="gallery-unavailable">Unavailable option</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox defaultChecked="indeterminate" id="gallery-partial" />
                <Label htmlFor="gallery-partial">Partially selected option</Label>
              </div>
            </div>
          </div>
        </GallerySection>

        <GallerySection id="cards">
          <div className="grid gap-5 lg:grid-cols-3" data-visual-test="card-compositions">
            {[
              {
                description: 'Access global energy and commodities markets through one screen.',
                icon: 'chart' as const,
                title: 'Joule',
              },
              {
                description: 'Build richer market insight from trusted trading and reference data.',
                icon: 'trend' as const,
                title: 'Data analytics',
              },
              {
                description: 'Explore connected venues, hubs, and asset classes around the world.',
                icon: 'location' as const,
                title: 'Market coverage',
              },
            ].map((card) => (
              <Card className="flex h-full flex-col" key={card.title}>
                <CardHeader>
                  <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
                    <AppIcon aria-hidden className="size-5" name={card.icon} />
                  </span>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription className="pt-2 leading-6">{card.description}</CardDescription>
                </CardHeader>
                <CardContent className="grow">
                  <p className="text-sm/6 text-muted-foreground">
                    Deterministic gallery copy keeps visual comparisons independent of Payload.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button type="button" variant="outline">
                    Explore
                    <AppIcon aria-hidden name="arrowRight" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </GallerySection>

        <GallerySection id="content-resilience">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <Surface tone="outlined">
              <p className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Short content
              </p>
              <h3 className="mt-2 text-xl font-semibold">Power</h3>
              <p className="mt-2 text-sm/6 text-muted-foreground">A concise supporting line.</p>
            </Surface>
            <Surface tone="outlined">
              <p className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Long content
              </p>
              <h3 className="mt-2 text-xl font-semibold">
                A deliberately long heading that proves the component grows without clipping
              </h3>
              <p className="mt-2 text-sm/6 text-muted-foreground">
                Editorial content varies. This longer paragraph verifies wrapping, reading measure,
                and vertical rhythm without relying on a carefully selected CMS fixture.
              </p>
            </Surface>
            <Surface className="grid place-items-center text-center" tone="soft">
              <div>
                <AppIcon aria-hidden className="mx-auto size-6 text-primary" name="searchInsight" />
                <h3 className="mt-3 text-lg font-semibold">No matching insights</h3>
                <p className="mt-1 text-sm/6 text-muted-foreground">Try changing your filters.</p>
              </div>
            </Surface>
            <Surface className="border-destructive/35" tone="outlined">
              <p className="m-0 text-sm font-semibold text-destructive">Content could not load</p>
              <p className="mt-2 text-sm/6 text-muted-foreground">
                The error state explains what happened without exposing implementation details.
              </p>
              <Button className="mt-4" size="sm" type="button" variant="outline">
                Try again
              </Button>
            </Surface>
            <Surface className="grid content-start gap-4" tone="outlined">
              <p className="m-0 text-sm font-semibold">Loading state</p>
              <div className="h-3 w-3/4 animate-pulse rounded-pill bg-muted motion-reduce:animate-none" />
              <div className="h-3 w-1/2 animate-pulse rounded-pill bg-muted motion-reduce:animate-none" />
              <Button
                className="justify-self-start"
                isLoading
                loadingLabel="Loading results"
                type="button"
              >
                Load results
              </Button>
            </Surface>
            <MediaBlock missingLabel="No approved image has been selected" />
          </div>
        </GallerySection>

        <GallerySection id="responsive-surfaces">
          <div className="grid gap-6" data-visual-test="responsive-canvases">
            {responsiveCanvases.map((canvas) => (
              <div className={canvas.width} key={canvas.label}>
                <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {canvas.label}
                </p>
                <Surface className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end" tone="soft">
                  <HeadingGroup
                    description={<p>One composition, constrained to a representative canvas.</p>}
                    eyebrow="Responsive contract"
                    heading="Energy markets, connected"
                    level={3}
                  />
                  <ButtonLink className="justify-self-start" href="/contact/">
                    Contact us
                  </ButtonLink>
                </Surface>
              </div>
            ))}
          </div>
        </GallerySection>
      </Container>
    </main>
  )
}
