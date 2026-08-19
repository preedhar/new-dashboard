import * as React from 'react'
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  MoreHorizontal,
  Settings,
  TriangleAlert,
} from 'lucide-react'
import { toast } from 'sonner'

import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import bookingsIcon from '@/assets/apps/bookings.png'
import onlineStoreIcon from '@/assets/apps/online-store.png'
import emailCreatedImage from '@/assets/admin/email-created.png'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TypographyH2, TypographyLarge, TypographyMuted } from '@/components/ui/typography'
import { cn } from '@/lib/utils'

const STORE_URL = 'haus.cococart.co'

type SetupStep = {
  id: string
  title: string
  description: string
  completed?: boolean
  // The task's own call to action, shown beside the previous/next arrows.
  action: { label: string; href: string; external?: boolean }
}

type SetupChecklist = {
  id: string
  // Reads as the lead-in to the percentage, e.g. "Your online store is 50% complete".
  label: string
  // App artwork imported as a URL, matching the tiles on the Apps page.
  icon: string
  steps: SetupStep[]
}

const SETUP_CHECKLISTS: SetupChecklist[] = [
  {
    id: 'online-store',
    label: 'Your online store setup is',
    icon: onlineStoreIcon,
    steps: [
      {
        id: 'create-store',
        title: 'Create store',
        description: 'Your Cococart store is created',
        completed: true,
        action: { label: 'View store', href: `https://${STORE_URL}`, external: true },
      },
      {
        id: 'logo',
        title: 'Logo',
        description: 'We automatically added it from your Instagram',
        completed: true,
        action: { label: 'Change logo', href: '/admin/settings/website/appearance' },
      },
      {
        id: 'customize-website',
        title: 'Customize website',
        description: 'We automatically did it based on your Instagram',
        completed: true,
        action: { label: 'Customize', href: '/admin/settings/website/appearance' },
      },
      {
        id: 'add-products',
        title: 'Add products',
        description: 'Create your first items so customers can start ordering',
        action: { label: 'Add products', href: '/admin/products/new' },
      },
      {
        id: 'set-up-fulfillment',
        title: 'Set up fulfillment methods',
        description: 'Choose pickup, delivery, or shipping options for your store',
        action: { label: 'Set up fulfillment', href: '/admin/apps/online-store/fulfillment' },
      },
      {
        id: 'set-up-payments',
        title: 'Set up payments',
        description: 'Connect a payment method to accept customer orders',
        action: { label: 'Set up payments', href: '/admin/settings/payments' },
      },
      {
        id: 'test-order',
        title: 'Make a test order',
        description: 'Place an order yourself to check the whole flow works',
        action: { label: 'Make a test order', href: '/admin/orders/new' },
      },
    ],
  },
  {
    id: 'bookings',
    label: 'Your bookings setup is',
    icon: bookingsIcon,
    steps: [
      {
        id: 'add-bookings-app',
        title: 'Add the Bookings app',
        description: 'Bookings is installed and ready to set up',
        completed: true,
        action: { label: 'View apps', href: '/admin/apps' },
      },
      {
        id: 'booking-services',
        title: 'Add bookable services',
        description: 'List the services, classes, or events customers can book',
        action: { label: 'Add services', href: '/admin/bookings/forms' },
      },
      {
        id: 'booking-availability',
        title: 'Set your availability',
        description: 'Choose the days and times you take bookings',
        action: { label: 'Set availability', href: '/admin/bookings/timeline' },
      },
      {
        id: 'booking-questions',
        title: 'Add booking questions',
        description: 'Collect the details you need before each booking',
        action: { label: 'Add questions', href: '/admin/bookings/forms' },
      },
      {
        id: 'share-booking-link',
        title: 'Share your booking link',
        description: 'Add it to your website and social profiles so customers can book',
        action: { label: 'View bookings', href: '/admin/bookings/all' },
      },
      {
        id: 'test-booking',
        title: 'Make a test booking',
        description: 'Book a slot yourself to check the whole flow works',
        action: { label: 'Make a test booking', href: '/admin/bookings/all' },
      },
    ],
  },
]

type PromoTile = {
  id: string
  title: string
  description: string
  // Left off when there's no page to send the merchant to yet.
  action: { label: string; href?: string }
}

// The tip / upsell modules below the setup cards. The two upsells lead, so they
// fill the grid's first row.
const PROMO_TILES: PromoTile[] = [
  {
    id: 'upsell-annual',
    title: 'Save 20% with annual billing',
    description: 'Switch to a yearly plan and get two months free',
    action: { label: 'See plans' },
  },
  {
    id: 'upsell-pos',
    title: 'Sell in person with POS',
    description: 'Take counter orders on the same catalog as your store',
    action: { label: 'View POS app', href: '/admin/apps/pos' },
  },
  {
    id: 'tip-verified-badge',
    title: 'Get a verified badge',
    description:
      'Turn on automated payments and take 10 orders to show a badge customers trust',
    action: { label: 'Set up payments', href: '/admin/settings/payments' },
  },
  {
    id: 'tip-email',
    title: 'Bring customers back',
    description: 'Email everyone who ordered this month with a new offer',
    action: { label: 'Open Email Marketing', href: '/admin/marketing/email' },
  },
]

export function AdminOverviewPage() {
  function handleCopyClick() {
    void navigator.clipboard?.writeText(STORE_URL)
    toast.success('Link copied')
  }

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="flex w-full flex-col items-center gap-4 text-center md:flex-row md:items-start md:justify-between md:text-left">
        <div className="space-y-2">
          <TypographyH2 className="md:text-left">[[[WIP]]]</TypographyH2>
        </div>

        <div
          data-slot="button-group"
          className="inline-flex w-fit items-center self-center rounded-md shadow-xs md:self-auto"
        >
          <Button asChild variant="outline" size="lg" className="rounded-r-none text-base">
            <a href={`https://${STORE_URL}`} target="_blank" rel="noreferrer">
              <ArrowUpRight
                data-icon="inline-start"
                aria-hidden="true"
                className="size-5 text-muted-foreground"
              />
              {STORE_URL}
            </a>
          </Button>
          {/* -ml-px folds the two outline borders into the single divider a
              button group should show. */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className="-ml-px rounded-l-none"
                aria-label="Shop link options"
              >
                <MoreHorizontal aria-hidden="true" className="size-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a href="/admin/settings/website">
                  <Settings />
                  Edit
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleCopyClick}>
                <Copy />
                Copy
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 640px matches the card column on the store settings page. */}
      {/* Cards sit closer together on a phone, where vertical space is scarcer. */}
      <section className="w-full max-w-[640px] space-y-6 md:space-y-10 text-left">
        {/* On a phone the action drops below the copy, so the alert doesn't need
            the right-hand gutter the component reserves for it. */}
        <Alert
          variant="destructive"
          className="border-destructive/30 bg-destructive/5 has-data-[slot=alert-action]:pr-4 sm:has-data-[slot=alert-action]:pr-18"
        >
          <TriangleAlert />
          <AlertTitle>Placeholder alert title</AlertTitle>
          <AlertDescription>
            Placeholder alert copy explaining what needs the merchant's attention.
          </AlertDescription>
          <AlertAction className="static col-start-2 mt-3 sm:absolute sm:top-2.5 sm:right-3 sm:mt-0">
            <Button type="button" variant="outline" size="lg" className="text-foreground">
              Fix now
            </Button>
          </AlertAction>
        </Alert>

        {/* Same surface as the Apps page cards: soft neutral fill, no shadow. */}
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-neutral-50 p-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="min-w-0">
            {/* Same type as the checklist card titles. */}
            <TypographyLarge className="text-base sm:text-lg">
              Need help with setup?
            </TypographyLarge>
            <TypographyMuted className="mt-1 leading-6">
              Walk through your store with someone from our team
            </TypographyMuted>
          </div>
          <Button type="button" variant="outline" size="lg" className="shrink-0">
            Schedule a call
          </Button>
        </div>

        {SETUP_CHECKLISTS.map((checklist) => (
          <SetupChecklistCard key={checklist.id} checklist={checklist} />
        ))}

        {/* Tip and upsell modules: two columns from the md breakpoint up,
            stacked on a phone. */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
          {PROMO_TILES.map((tile) => (
            <PromoTileCard key={tile.id} tile={tile} />
          ))}
        </div>
      </section>
    </div>
  )
}

// The whole tile is the click target, like the Apps page cards, so the call to
// action is a styled span rather than a nested button.
const PROMO_TILE_CLASS =
  'group relative isolate flex min-h-64 w-full flex-col rounded-xl p-4 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50'

function PromoTileCard({ tile }: { tile: PromoTile }) {
  const body = (
    <>
      {/* Same hover as the Apps page cards: the surface sits on its own layer so
          it can grow past the card without moving the content. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-xl border border-border bg-neutral-50 transition-all duration-200 group-hover:-inset-2.5 group-hover:bg-muted"
      />
      <div className="relative z-10 max-w-[80%]">
        <TypographyLarge className="text-base sm:text-lg">{tile.title}</TypographyLarge>
        <TypographyMuted className="mt-1 leading-6">{tile.description}</TypographyMuted>
      </div>
      {/* Placeholder artwork, bleeding off the bottom-right corner. It's @2x, so
          it's drawn at half its pixel size. The wrapper clips it to the card,
          which the surface layer can't do any more. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
      >
        <img
          src={emailCreatedImage}
          alt=""
          width={160}
          height={118}
          className="absolute right-0 bottom-0 w-40 max-w-[55%] translate-x-3 translate-y-3"
        />
      </span>
      {/* mt-auto pins the call to action to the bottom-left, clear of the art. */}
      <div className="relative z-10 mt-auto pt-8">
        <span className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
          {tile.action.label}
        </span>
      </div>
    </>
  )

  if (tile.action.href) {
    return (
      <a href={tile.action.href} className={PROMO_TILE_CLASS}>
        {body}
      </a>
    )
  }

  return (
    <button type="button" className={PROMO_TILE_CLASS}>
      {body}
    </button>
  )
}

type SetupChecklistCardProps = {
  checklist: SetupChecklist
}

function SetupChecklistCard({ checklist }: SetupChecklistCardProps) {
  // Only one task is on screen at a time. It starts on the first task still to
  // do, and the previous/next buttons page through the rest.
  const firstIncompleteStepIndex = Math.max(
    checklist.steps.findIndex((step) => !step.completed),
    0,
  )
  const [stepIndex, setStepIndex] = React.useState(firstIncompleteStepIndex)
  const step = checklist.steps[stepIndex]
  const checked = Boolean(step.completed)
  const completedStepCount = checklist.steps.filter((item) => item.completed).length
  const progressValue = Math.round((completedStepCount / checklist.steps.length) * 100)

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-neutral-50">
      <div className="flex items-center gap-3 p-4">
        {/* The artwork sits in a bare 40px box so it lines up with the task
            circle below it, with no tile framing it. */}
        <span className="flex size-10 shrink-0 items-center justify-center">
          <img src={checklist.icon} alt="" className="size-6" />
        </span>
        {/* Same type scale as the app names on the Apps page. */}
        <TypographyLarge className="min-w-0 flex-1 text-base sm:text-lg">
          {checklist.label} {progressValue}% complete
        </TypographyLarge>
        <ProgressRing
          value={progressValue}
          label={`${checklist.label} ${progressValue}% complete`}
        />
      </div>

      {/* The circle is inset by 10px on each side so it occupies the same 40px
          column as the header's icon tile, lining the task text up with the
          card title. */}
      <div className="flex items-start gap-3 p-4 text-left">
        <span
          aria-label={checked ? `${step.title} completed` : `${step.title} incomplete`}
          className={
            checked
              ? 'mx-2.5 mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-foreground'
              : 'mx-2.5 mt-1 size-5 shrink-0 rounded-full border border-border'
          }
          role="img"
        >
          {checked ? <Check aria-hidden="true" className="size-3.5" /> : null}
        </span>
        <div className="min-w-0 flex-1">
          <TypographyLarge
            className={
              checked
                ? 'text-base font-medium text-muted-foreground line-through'
                : 'text-base font-medium text-foreground'
            }
          >
            {step.title}
          </TypographyLarge>
          <TypographyMuted className="mt-1 leading-6">{step.description}</TypographyMuted>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Previous task"
            disabled={stepIndex === 0}
            onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
          >
            <ChevronLeft aria-hidden="true" className="size-4 text-muted-foreground" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Next task"
            disabled={stepIndex === checklist.steps.length - 1}
            onClick={() =>
              setStepIndex((current) => Math.min(current + 1, checklist.steps.length - 1))
            }
          >
            <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground" />
          </Button>
        </div>
        <Button asChild size="lg">
          <a
            href={step.action.href}
            {...(step.action.external ? { target: '_blank', rel: 'noreferrer' } : {})}
          >
            {step.action.label}
          </a>
        </Button>
      </div>
    </div>
  )
}

type ProgressRingProps = {
  value: number
  label: string
}

// A compact stand-in for the linear progress bar: the arc is drawn with a dash
// gap so it starts at twelve o'clock and sweeps clockwise.
function ProgressRing({ value, label }: ProgressRingProps) {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const filled = (Math.min(Math.max(value, 0), 100) / 100) * circumference

  return (
    <svg
      aria-label={label}
      className="size-6 shrink-0 -rotate-90"
      role="img"
      viewBox="0 0 48 48"
    >
      <circle className="stroke-muted" cx="24" cy="24" fill="none" r={radius} strokeWidth="6" />
      <circle
        className="stroke-primary transition-[stroke-dasharray]"
        cx="24"
        cy="24"
        fill="none"
        r={radius}
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeLinecap="round"
        strokeWidth="6"
      />
    </svg>
  )
}
