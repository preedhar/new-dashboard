import * as React from 'react'
import { ArrowLeft, ChevronRight, EllipsisVertical, Gift } from 'lucide-react'

import bookingsIcon from '@/assets/apps/bookings.png'
import crmIcon from '@/assets/apps/crm.png'
import emailMarketingIcon from '@/assets/apps/email-marketing.png'
import kitchenDisplayIcon from '@/assets/apps/kitchen-display.png'
import loyaltyProgramIcon from '@/assets/apps/loyalty-program.png'
import onlineStoreIcon from '@/assets/apps/online-store.png'
import posIcon from '@/assets/apps/pos.png'
import qrCodeOrderingIcon from '@/assets/apps/qr-code-ordering.png'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TypographyLarge } from '@/components/ui/typography'
import { cn } from '@/lib/utils'
import { StartTrialDialog } from '../components/start-trial-dialog'
import {
  DiscountOfferDialog,
  TrialExtensionDialog,
  UnsubscribeConfirmDialog,
  UnsubscribeReasonDialog,
  type CancelOffer,
} from '../components/unsubscribe-dialogs'

type AppPlan = {
  title: string
  icon: string
  // Dollars per month. Held as a number because the row shows it per month
  // and the trial dialog shows the bare amount.
  price: number
}

function perMonth(price: number) {
  return `$${price}/mo`
}

type ActivePlan = AppPlan & {
  // Only a trial is badged; a paid subscription is the unremarkable case.
  badge?: string
  // The plan one tier up, where there is one. Only Online Store has a Pro
  // tier to climb to, so only it offers the upgrade.
  upgradeTo?: string
  // Trails the price on the same line, after a middot: when the plan next
  // renews, or when its trial runs out.
  note: string
  // The day the free trial runs out, ISO so the extension offer can count
  // forward from it. Only a trial has one.
  trialEndsOn?: string
}

// Held as a date rather than only in the row's wording, since the extension
// offer has to count a week on from it.
const BOOKINGS_TRIAL_END = '2026-10-05'

function formatDay(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// What the shop is paying for (or trialling) today, subscriptions first.
const ACTIVE_PLANS: ActivePlan[] = [
  {
    title: 'Online Store Basic',
    icon: onlineStoreIcon,
    price: 19,
    note: 'Renews on Nov 5',
    upgradeTo: 'Online Store Pro',
  },
  {
    title: 'Bookings',
    icon: bookingsIcon,
    price: 29,
    badge: 'Free trial',
    note: `Free trial ends on ${formatDay(new Date(`${BOOKINGS_TRIAL_END}T00:00:00`))}`,
    trialEndsOn: BOOKINGS_TRIAL_END,
  },
]

// Everything the shop could add, in the order the apps are pitched.
const INACTIVE_PLANS: AppPlan[] = [
  { title: 'POS Pro', icon: posIcon, price: 59 },
  { title: 'QR Code Ordering', icon: qrCodeOrderingIcon, price: 39 },
  { title: 'Kitchen Display', icon: kitchenDisplayIcon, price: 39 },
  { title: 'CRM', icon: crmIcon, price: 19 },
  { title: 'Loyalty', icon: loyaltyProgramIcon, price: 39 },
  { title: 'Email Marketing', icon: emailMarketingIcon, price: 19 },
]

type Bundle = {
  title: string
  // What the same apps cost bought one by one, struck through beside the price.
  listPrice: string
  price: string
  // The top bundle carries every app, so it says so rather than reading as a
  // selection of them.
  appsLabel: string
  apps: string
}

const BUNDLES: Bundle[] = [
  {
    title: 'Cococart Value',
    listPrice: '$136/mo',
    price: '$99/mo',
    appsLabel: 'Apps included:',
    apps: 'Online Store Pro, Loyalty, Email Marketing, CRM',
  },
  {
    title: 'Cococart Essentials',
    listPrice: '$234/mo',
    price: '$199/mo',
    appsLabel: 'Apps included:',
    apps: 'Online Store Pro, Loyalty, Email Marketing, CRM, POS Pro, Kitchen Display',
  },
  {
    title: 'Cococart Premium',
    listPrice: '$302/mo',
    price: '$249/mo',
    appsLabel: 'Includes everything:',
    apps: 'Online Store Pro, Loyalty, Email Marketing, CRM, POS Pro, Kitchen Display, QR Code Ordering, Bookings',
  },
]

// A packed box with a bookmark inside: the mark the bundles are badged with.
// It isn't in lucide, so it's drawn here to lucide's metrics (24px grid, 2px
// round strokes) and sits beside their icons without standing out.
function BundleMarkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 8h18" />
      <path d="M8 8v9l4-3 4 3V8" />
    </svg>
  )
}

// Rows and cards sit on a hairline that's lighter than the card's own border,
// so the outline still reads as the edge of the group.
const INNER_DIVIDER = 'border-t border-border/50'

export function AdminBillingPage() {
  // Cancelling walks through the survey, then whichever offer that reason
  // warrants, or straight to the confirmation where there's none. The plan is
  // kept separately from the step so it doesn't blank out mid-close, while the
  // step going null is what dismisses them.
  const [cancelPlan, setCancelPlan] = React.useState<ActivePlan | null>(null)
  const [cancelStep, setCancelStep] = React.useState<
    'reason' | CancelOffer | 'confirm' | null
  >(null)
  // Bumped on every run so the survey remounts, rather than reopening on the
  // answers given the last time someone started down this path.
  const [cancelRun, setCancelRun] = React.useState(0)

  function handleCancelPlan(plan: ActivePlan) {
    setCancelPlan(plan)
    setCancelStep('reason')
    setCancelRun((run) => run + 1)
  }

  // Same trick for the trial dialog: the app it was opened for outlives the
  // dialog closing, so its name and price don't blank out on the way out.
  const [trialApp, setTrialApp] = React.useState<AppPlan | null>(null)
  const [trialOpen, setTrialOpen] = React.useState(false)

  function handleStartTrial(app: AppPlan) {
    setTrialApp(app)
    setTrialOpen(true)
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      {/* The shared title and breadcrumb bar are suppressed for this route in
          AdminPage, so like the All Apps and referrals pages it supplies its own
          header, with a back button on a phone. The heading clears the button's
          column until there's room to centre it against nothing. */}
      <header className="relative flex items-center justify-center">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label="Go back"
          onClick={() => window.history.back()}
          className="absolute top-0 left-0 md:hidden"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="px-12 text-2xl font-semibold tracking-normal text-neutral-900 md:px-0">
          Subscription
        </h1>
      </header>

      {/* The bundle rail trails the plans on a phone and sits beside them once
          there's room for both columns. */}
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-10">
          <ActivePlansSection onCancelPlan={handleCancelPlan} />
          <InactivePlansSection onStartTrial={handleStartTrial} />
        </div>
        <aside className="flex flex-col gap-8 lg:w-80 lg:shrink-0">
          <AnnualBillingSection />
          <BundlesSection />
        </aside>
      </div>

      {/* The dialogs sit at the page level so they survive the row menu that
          opened them closing on select. */}
      <UnsubscribeReasonDialog
        key={cancelRun}
        open={cancelStep === 'reason'}
        onOpenChange={(open) => setCancelStep(open ? 'reason' : null)}
        onContinue={(reason) => setCancelStep(reason.offer ?? 'confirm')}
      />
      <TrialExtensionDialog
        planTitle={cancelPlan?.title ?? ''}
        trialEndsOn={cancelPlan?.trialEndsOn}
        open={cancelStep === 'trial-extension'}
        onOpenChange={(open) => setCancelStep(open ? 'trial-extension' : null)}
      />
      <DiscountOfferDialog
        planTitle={cancelPlan?.title ?? ''}
        open={cancelStep === 'discount'}
        onOpenChange={(open) => setCancelStep(open ? 'discount' : null)}
      />
      <UnsubscribeConfirmDialog
        planTitle={cancelPlan?.title ?? ''}
        open={cancelStep === 'confirm'}
        onOpenChange={(open) => setCancelStep(open ? 'confirm' : null)}
      />
      <StartTrialDialog
        appTitle={trialApp?.title ?? ''}
        price={trialApp?.price ?? 0}
        open={trialOpen}
        onOpenChange={setTrialOpen}
      />
    </div>
  )
}

function ActivePlansSection({
  onCancelPlan,
}: {
  onCancelPlan: (plan: ActivePlan) => void
}) {
  return (
    <section className="space-y-3">
      <TypographyLarge>Active</TypographyLarge>
      <Card className="gap-0 px-6 py-0 shadow-none">
        {ACTIVE_PLANS.map((plan, index) => (
          <div
            key={plan.title}
            className={cn('flex items-center gap-3 py-4', index > 0 && INNER_DIVIDER)}
          >
            <img src={plan.icon} alt="" className="size-8 shrink-0" />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{plan.title}</span>
                {plan.badge ? <Badge variant="secondary">{plan.badge}</Badge> : null}
              </div>
              <p className="text-sm text-muted-foreground">
                {perMonth(plan.price)} · {plan.note}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`More options for ${plan.title}`}
                >
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              {/* `w-auto` undoes the base width, which is pinned to the
                  trigger — an icon button — so each row's menu is only as wide
                  as the items it actually has. */}
              <DropdownMenuContent align="end" className="w-auto min-w-40">
                {plan.upgradeTo ? (
                  <DropdownMenuItem>Upgrade to {plan.upgradeTo}</DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onSelect={() => onCancelPlan(plan)}>
                  Cancel subscription
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
        <div className={cn(INNER_DIVIDER, 'py-4')}>
          <Button type="button" variant="outline" size="lg">
            Manage billing
          </Button>
        </div>
      </Card>
    </section>
  )
}

function InactivePlansSection({
  onStartTrial,
}: {
  onStartTrial: (app: AppPlan) => void
}) {
  return (
    <section className="space-y-3">
      <TypographyLarge>Inactive</TypographyLarge>
      <Card className="gap-0 px-6 py-0 shadow-none">
        {INACTIVE_PLANS.map((plan, index) => (
          <div
            key={plan.title}
            className={cn('flex items-center gap-3 py-4', index > 0 && INNER_DIVIDER)}
          >
            <img src={plan.icon} alt="" className="size-8 shrink-0" />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-medium">{plan.title}</p>
              <p className="text-sm text-muted-foreground">{perMonth(plan.price)}</p>
            </div>
            <Button type="button" size="lg" onClick={() => onStartTrial(plan)}>
              Start free trial
            </Button>
          </div>
        ))}
      </Card>
    </section>
  )
}

// The upsell that also runs as a home-page promo tile: pay for a year, get two
// months of it back.
function AnnualBillingSection() {
  return (
    <section className="space-y-3">
      <TypographyLarge>Get 2 months free</TypographyLarge>
      <div className="flex flex-col gap-6 rounded-xl bg-muted px-6 py-4 text-card-foreground">
        <div className="flex items-start gap-3">
          <Gift aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
          <p className="text-sm">
            Pay annually to get 2 months of your subscription for free
          </p>
        </div>
        <Button type="button" size="lg" className="w-full">
          Switch to annual billing
        </Button>
      </div>
    </section>
  )
}

function BundlesSection() {
  return (
    <section className="space-y-3">
      <TypographyLarge>Save with bundles</TypographyLarge>
      <div className="space-y-4">
        {BUNDLES.map((bundle) => (
          <BundleCard key={bundle.title} bundle={bundle} />
        ))}
      </div>
    </section>
  )
}

function BundleCard({ bundle }: { bundle: Bundle }) {
  return (
    <button
      type="button"
      className="flex w-full flex-col rounded-xl border border-border bg-card px-6 py-4 text-left text-card-foreground transition-colors hover:bg-muted/40"
    >
      <div className="flex w-full items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
          <BundleMarkIcon className="size-[18px] text-muted-foreground" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{bundle.title}</span>
        <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      </div>
      <p className="mt-3 text-sm">
        <span className="text-muted-foreground line-through">{bundle.listPrice}</span>{' '}
        <span className="font-medium">{bundle.price}</span>
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        <span className="font-semibold text-card-foreground">{bundle.appsLabel}</span>{' '}
        {bundle.apps}
      </p>
    </button>
  )
}
