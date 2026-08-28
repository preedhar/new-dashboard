import * as React from 'react'
import { Check, ChevronDown, ChevronRight, Copy, EyeOff, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'

import bookingsIcon from '@/assets/apps/bookings.png'
import onlineStoreIcon from '@/assets/apps/online-store.png'
import qrCodeOrderingIcon from '@/assets/apps/qr-code-ordering.png'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PromoTileCard } from '../components/promo-tile-card'
import { useSetupGuideHint } from '../components/setup-guide-hint'
import { PROMO_TILES } from '../promo-tiles'
import { TypographyH2, TypographyLarge, TypographyMuted } from '@/components/ui/typography'
import { cn } from '@/lib/utils'

const STORE_URL = 'haus.cococart.co'

type StoreMetric = {
  id: string
  label: string
  // Pre-formatted so the money metric keeps the same $0,000.00 shape the
  // earnings page uses.
  value: string
}

const STORE_METRICS: StoreMetric[] = [
  { id: 'visitors', label: 'Visitors', value: '2,847' },
  { id: 'orders', label: 'Orders', value: '186' },
  { id: 'sales', label: 'Sales', value: '$4,320.75' },
]

type SetupStep = {
  id: string
  title: string
  description: string
  completed?: boolean
  // The task's own call to action, shown beside the previous/next arrows.
  action: { label: string; href: string; external?: boolean }
}

// Tasks that show up in more than one app's guide. They're the same task with
// the same state wherever they appear, so every guide points at this one copy.
const SHARED_STEPS = {
  logo: {
    id: 'logo',
    title: 'Add logo',
    description: 'We automatically added it from your Instagram',
    completed: true,
    action: { label: 'Change logo', href: '/admin/settings/website/appearance' },
  },
  customizeWebsite: {
    id: 'customize-website',
    title: 'Customize website',
    description: 'Tell customers what you sell in a line or two',
    action: { label: 'Customize', href: '/admin/settings/website/appearance' },
  },
  addProducts: {
    id: 'add-products',
    title: 'Add products',
    description: 'Create your first items so customers can start ordering',
    action: { label: 'Add products', href: '/admin/products/new' },
  },
  setUpPayments: {
    id: 'set-up-payments',
    title: 'Set up payments',
    description: 'Connect a payment method to accept customer orders',
    action: { label: 'Set up payments', href: '/admin/settings/payments' },
  },
} satisfies Record<string, SetupStep>

type SetupApp = {
  id: string
  // The app this guide sets up, picked from the card's dropdown.
  name: string
  // The app's mark, the same artwork the Apps page uses.
  icon: string
  steps: SetupStep[]
}

const SETUP_APPS: SetupApp[] = [
  {
    id: 'online-store',
    name: 'Online Store',
    icon: onlineStoreIcon,
    steps: [
      SHARED_STEPS.logo,
      SHARED_STEPS.customizeWebsite,
      SHARED_STEPS.addProducts,
      {
        id: 'set-up-fulfillment',
        title: 'Set up fulfillment methods',
        description: 'Choose pickup, delivery, or shipping options for your store',
        action: { label: 'Set up fulfillment', href: '/admin/apps/online-store/fulfillment' },
      },
      SHARED_STEPS.setUpPayments,
      {
        id: 'test-order',
        title: 'Place a test order',
        description: 'Place an order yourself to check the whole flow works',
        action: { label: 'Make a test order', href: '/admin/orders/new' },
      },
    ],
  },
  {
    id: 'qr-code-ordering',
    name: 'QR Code Ordering',
    icon: qrCodeOrderingIcon,
    steps: [
      SHARED_STEPS.logo,
      SHARED_STEPS.addProducts,
      SHARED_STEPS.setUpPayments,
      {
        id: 'download-qr-codes',
        title: 'Download QR codes',
        description: 'Print them for your tables so customers can scan to order',
        action: { label: 'Download QR codes', href: '/admin/apps' },
      },
      {
        id: 'enable-qr-orders',
        title: 'Enable orders',
        description: 'Turn on scan-to-order checkouts for your store',
        action: { label: 'Enable orders', href: '/admin/apps/qr-code/checkouts' },
      },
      {
        id: 'qr-test-order',
        title: 'Place a test order',
        description: 'Scan a code yourself to check the whole flow works',
        action: { label: 'Make a test order', href: '/admin/orders/new' },
      },
    ],
  },
  {
    id: 'bookings',
    name: 'Bookings',
    icon: bookingsIcon,
    steps: [
      SHARED_STEPS.logo,
      SHARED_STEPS.customizeWebsite,
      {
        id: 'add-booking-forms',
        title: 'Add booking forms',
        description: 'Set up the forms customers fill in to book with you',
        action: { label: 'Add booking forms', href: '/admin/bookings/forms' },
      },
      SHARED_STEPS.setUpPayments,
      {
        id: 'test-booking',
        title: 'Take a test booking',
        description: 'Book yourself in to check the whole flow works',
        action: { label: 'Make a test booking', href: '/admin/bookings/all' },
      },
    ],
  },
]

// The share of an app's tasks that are done, as a whole percentage.
function getProgressValue(app: SetupApp) {
  const completedStepCount = app.steps.filter((step) => step.completed).length
  return Math.round((completedStepCount / app.steps.length) * 100)
}

export function AdminOverviewPage() {
  // A hidden guide leaves the row with fewer cards, which centres the rest.
  const [setupGuideHidden, setSetupGuideHidden] = React.useState(false)
  const [onlineStoreGuideHidden, setOnlineStoreGuideHidden] = React.useState(false)
  // Hiding a guide takes it off the page, so the user menu it can be reopened
  // from says so.
  const { showHint } = useSetupGuideHint()

  function handleCopyClick() {
    void navigator.clipboard?.writeText(STORE_URL)
    toast.success('Link copied')
  }

  return (
    <div className="flex w-full flex-col items-center gap-8">
      {/* The shop link centres on a phone and moves to the right edge from md up. */}
      <div className="flex w-full items-center justify-center gap-4 text-left md:justify-end">
        <div
          data-slot="button-group"
          className="inline-flex w-fit items-center rounded-md shadow-xs"
        >
          {/* The buttons drop their adjoining borders so the group reads as one
              outlined pill with no dividers between the segments. */}
          <Button asChild variant="outline" size="lg" className="rounded-r-none border-r-0 text-base">
            <a href={`https://${STORE_URL}`} target="_blank" rel="noreferrer">
              {STORE_URL}
            </a>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="rounded-l-none border-l-0"
            aria-label="Copy shop link"
            onClick={handleCopyClick}
          >
            <Copy aria-hidden="true" className="size-4 text-muted-foreground" />
          </Button>
        </div>

      </div>

      {/* The metrics and the cards travel together, with a wider gap between
          them from xl up. */}
      <div className="flex w-full flex-col items-center gap-8 xl:gap-[60px]">
        {/* The title introduces the figures, so it sits with them rather than a
            long gap away. */}
        <div className="flex w-full flex-col items-center gap-6">
          <TypographyH2 className="text-center font-bold md:text-4xl">Welcome</TypographyH2>

          {/* Placeholder figures. Same label-over-value stack as the All Orders
              stats, but the border belongs to the row: the stacks themselves are
              bare type, so they read as one panel rather than a set of cards. The
              panel is only as wide as its contents, and max-w-full lets it wrap
              rather than overflow a phone. Plain divs, not Card: CardHeader is a
              container-query root, so its width ignores its contents. */}
          <a
            href="/admin/orders/all"
            aria-label="View all orders"
            className="flex max-w-full flex-wrap justify-center gap-8 rounded-xl border border-border/40 p-4 text-left outline-none transition-colors hover:border-border focus-visible:ring-2 focus-visible:ring-ring sm:gap-12"
          >
            {/* The period is broken over two lines so it occupies the same two
                rows as a metric, in the label's type rather than a value's. Its
                lines are spaced further apart than body copy, and the pair sits
                centred against the taller metric stacks beside it. */}
            <div className="self-center">
              <TypographyMuted className="text-xs leading-5">Last</TypographyMuted>
              <TypographyMuted className="text-xs leading-5">30 days</TypographyMuted>
            </div>
            {STORE_METRICS.map((metric) => (
              <div key={metric.id}>
                <TypographyMuted className="text-xs">{metric.label}</TypographyMuted>
                <p className="text-base font-semibold tabular-nums sm:text-xl">{metric.value}</p>
              </div>
            ))}
          </a>
        </div>

        {/* 640px matches the card column on the store settings page; from xl up
            the column widens to fit all three cards side by side. */}
        <section className="w-full max-w-[640px] text-left xl:max-w-[1120px]">
          {/* Setup card and promo tiles share one row from 1280px up, where three
              columns still have room to breathe, and stack below that. Each card
              is a third of the row whatever the count, so one or two cards keep
              that width and justify-center puts them in the middle rather than
              stretching them across the row. */}
          <div className="flex flex-col gap-6 xl:flex-row xl:flex-wrap xl:justify-center xl:gap-10">
            {setupGuideHidden ? null : (
              <div className="flex xl:w-[calc((100%_-_5rem)/3)]">
                <SetupChecklistCard
                  onHide={() => {
                    setSetupGuideHidden(true)
                    showHint()
                  }}
                />
              </div>
            )}
            {/* The same guide pinned to one app, so it lists that app's tasks
                with no picker above them. */}
            {onlineStoreGuideHidden ? null : (
              <div className="flex xl:w-[calc((100%_-_5rem)/3)]">
                <SetupChecklistCard
                  app={SETUP_APPS[0]}
                  onHide={() => {
                    setOnlineStoreGuideHidden(true)
                    showHint()
                  }}
                />
              </div>
            )}
            {PROMO_TILES.map((tile) => (
              <div key={tile.id} className="flex xl:w-[calc((100%_-_5rem)/3)]">
                <PromoTileCard tile={tile} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

type SetupChecklistCardProps = {
  onHide: () => void
  // Pins the card to one app's tasks. The picker only appears on a card that is
  // free to move between apps.
  app?: SetupApp
}

function SetupChecklistCard({ onHide, app: pinnedApp }: SetupChecklistCardProps) {
  const [activeAppId, setActiveAppId] = React.useState(SETUP_APPS[0].id)
  const activeApp =
    pinnedApp ?? SETUP_APPS.find((app) => app.id === activeAppId) ?? SETUP_APPS[0]
  const progressValue = getProgressValue(activeApp)

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-neutral-50">
      {/* The list sits closer to the heading than to the card's outer edges. */}
      <div className="flex flex-col gap-2 p-4 pb-2 sm:p-6 sm:pb-3 xl:p-8 xl:pb-4">
        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {/* Same type scale as the app names on the Apps page. */}
            <TypographyLarge className="min-w-0 text-base sm:text-lg">
              Finish setup
            </TypographyLarge>
            {/* A pinned card has no app row to carry its progress, so the ring
                follows the title instead. */}
            {pinnedApp ? (
              <ProgressRing
                value={progressValue}
                label={`${activeApp.name} is ${progressValue}% complete`}
              />
            ) : null}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* The button is wider than its icon, so it hangs 8px into the
                  card's padding to put that icon on the same line as the task
                  rows' trailing icons. */}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="-mr-2 shrink-0"
                aria-label="Setup guide options"
              >
                <MoreHorizontal aria-hidden="true" className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            {/* The menu would otherwise take the width of its trigger, which
                is an icon button, and wrap the item onto a second line. */}
            <DropdownMenuContent align="end" className="w-auto">
              <DropdownMenuItem onSelect={onHide}>
                <EyeOff />
                Hide setup guide
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* The app being set up sits on its own row below the card title, and
            picking another one from the menu swaps the task list below. Each
            choice carries its own ring, so the menu doubles as a progress
            summary across the apps. The trigger spans the card so the menu,
            which takes the trigger's width, lists the apps across the same
            span. A card pinned to one app has nothing to pick, so it goes
            without the row. */}
        {pinnedApp ? null : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full justify-start gap-3 text-sm font-medium md:text-base"
              >
                <img src={activeApp.icon} alt="" className="size-6 shrink-0" />
                {activeApp.name}
                <ProgressRing
                  className="ml-auto"
                  value={progressValue}
                  label={`${activeApp.name} is ${progressValue}% complete`}
                />
                <ChevronDown aria-hidden="true" className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {SETUP_APPS.map((app) => {
                const appProgressValue = getProgressValue(app)

                return (
                  <DropdownMenuItem
                    key={app.id}
                    onSelect={() => setActiveAppId(app.id)}
                    className="gap-3"
                  >
                    <img src={app.icon} alt="" className="size-6 shrink-0" />
                    {app.name}
                    <ProgressRing
                      className="ml-auto"
                      value={appProgressValue}
                      label={`${app.name} is ${appProgressValue}% complete`}
                    />
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Every step is listed, and each title is the link to its task. The rows
          are pulled out to the card's padding edge so their hover fill reads as
          a full-width band rather than a floating pill. Nothing is set aside on
          the left for a mark, since a finished task carries its mark on the
          right instead. */}
      <ul className="flex flex-1 flex-col px-2 pb-2 sm:px-4 sm:pb-3 xl:px-6 xl:pb-4">
        {activeApp.steps.map((step) => {
          const completed = Boolean(step.completed)

          return (
            <li key={step.id} className="border-b border-border/40 last:border-b-0">
              <a
                href={step.action.href}
                {...(step.action.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="flex items-center gap-3 rounded-md px-2 py-2.5 outline-none transition-colors hover:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_6%)] focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className={cn(
                    'min-w-0 flex-1 text-sm md:text-base',
                    completed ? 'text-success-foreground line-through' : 'text-foreground',
                  )}
                >
                  {step.title}
                </span>
                <span className="sr-only">{completed ? 'Completed' : 'Not started'}</span>
                {/* A finished task has nowhere left to go, so its trailing
                    chevron gives way to the mark that says it's done. */}
                {completed ? (
                  <Check aria-hidden="true" className="size-4 shrink-0 text-success-foreground" />
                ) : (
                  <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                )}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

type ProgressRingProps = {
  value: number
  label: string
  className?: string
}

// A compact stand-in for the linear progress bar: the arc is drawn with a dash
// gap so it starts at twelve o'clock and sweeps clockwise.
function ProgressRing({ value, label, className }: ProgressRingProps) {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const filled = (Math.min(Math.max(value, 0), 100) / 100) * circumference

  return (
    <svg
      aria-label={label}
      className={cn('size-4 shrink-0 -rotate-90', className)}
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
