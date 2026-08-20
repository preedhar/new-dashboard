import * as React from 'react'
import { Check, ChevronRight, Copy, EyeOff, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PromoTileCard } from '../components/promo-tile-card'
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

type SetupChecklist = {
  id: string
  // Reads as the lead-in to the percentage, e.g. "Your online store is 50% complete".
  label: string
  steps: SetupStep[]
}

const SETUP_CHECKLISTS: SetupChecklist[] = [
  {
    id: 'online-store',
    label: 'Your online store',
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
        title: 'Add logo',
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
        title: 'Place a test order',
        description: 'Place an order yourself to check the whole flow works',
        action: { label: 'Make a test order', href: '/admin/orders/new' },
      },
    ],
  },
]

export function AdminOverviewPage() {
  // A hidden guide leaves the row with fewer cards, which centres the rest.
  const [hiddenChecklistIds, setHiddenChecklistIds] = React.useState<string[]>([])
  const visibleChecklists = SETUP_CHECKLISTS.filter(
    (checklist) => !hiddenChecklistIds.includes(checklist.id),
  )

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
            {visibleChecklists.map((checklist) => (
              <div key={checklist.id} className="flex xl:w-[calc((100%_-_5rem)/3)]">
                <SetupChecklistCard
                  checklist={checklist}
                  onHide={() =>
                    setHiddenChecklistIds((current) => [...current, checklist.id])
                  }
                />
              </div>
            ))}
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
  checklist: SetupChecklist
  onHide: () => void
}

function SetupChecklistCard({ checklist, onHide }: SetupChecklistCardProps) {
  const completedStepCount = checklist.steps.filter((item) => item.completed).length
  const progressValue = Math.round((completedStepCount / checklist.steps.length) * 100)
  const heading = `${checklist.label} is ${progressValue}% complete`

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-neutral-50">
      {/* The list sits closer to the heading than to the card's outer edges. */}
      <div className="flex items-center gap-3 p-4 pb-2 sm:p-6 sm:pb-3 xl:p-8 xl:pb-4">
        <ProgressRing value={progressValue} label={heading} />
        {/* Same type scale as the app names on the Apps page. */}
        <TypographyLarge className="min-w-0 flex-1 text-base sm:text-lg">{heading}</TypographyLarge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0"
              aria-label="Setup guide options"
            >
              <MoreHorizontal aria-hidden="true" className="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onHide}>
              <EyeOff />
              Hide setup guide
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Every step is listed, and each title is the link to its task. The rows
          are pulled out to the card's padding edge so their hover fill reads as
          a full-width band rather than a floating pill. */}
      <ul className="flex flex-1 flex-col px-2 pb-4 sm:px-4 sm:pb-6 xl:px-6 xl:pb-8">
        {checklist.steps.map((step) => {
          const completed = Boolean(step.completed)

          return (
            <li key={step.id} className="border-b border-border/40 last:border-b-0">
              <a
                href={step.action.href}
                {...(step.action.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="flex items-center gap-3 rounded-md px-2 py-2 outline-none transition-colors hover:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_6%)] focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* Only finished steps carry a mark. The slot is the width of
                    the header's progress ring, so with the same gap-3 beside it
                    every task title lines up with the card title, mark or no
                    mark. */}
                <span
                  aria-hidden="true"
                  className="flex size-6 shrink-0 items-center justify-center"
                >
                  {completed ? <Check className="size-4 text-success-foreground" /> : null}
                </span>
                <span
                  className={cn(
                    'min-w-0 flex-1 text-sm md:text-base',
                    completed ? 'text-success-foreground line-through' : 'text-foreground',
                  )}
                >
                  {step.title}
                </span>
                <span className="sr-only">{completed ? 'Completed' : 'Not started'}</span>
                <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
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
