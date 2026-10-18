import * as React from 'react'
import { ArrowLeft, ChevronRight, EllipsisVertical } from 'lucide-react'
import { toast } from 'sonner'

import giftImage from '@/assets/admin/gift.png'
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
import { ButtonGroup } from '@/components/ui/button-group'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TypographyLarge } from '@/components/ui/typography'
import { cn } from '@/lib/utils'
import { usePausedSubscriptions } from '../components/paused-subscriptions'
import { StartTrialDialog } from '../components/start-trial-dialog'
import {
  CancelDataSavingDialog,
  DiscountOfferDialog,
  PausePlanDialog,
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
  // The day the subscription next renews, ISO so a plan that's pausing can
  // name the day it stops. Only a paid plan has one.
  renewsOn?: string
  // Set once a plan's pause has taken effect: what it costs now that it's
  // only keeping the data, with the price it charged while it ran struck
  // through beside it.
  pausedPrice?: number
}

// Held as dates rather than only in the rows' wording: the extension offer
// counts a week on from the trial end, and a pausing plan names the renewal
// it stops at.
const BOOKINGS_TRIAL_END = '2026-10-05'
const ONLINE_STORE_RENEWAL = '2026-11-05'

function dayOf(iso: string) {
  return new Date(`${iso}T00:00:00`)
}

function formatDay(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// What the shop is paying for (or trialling) today, subscriptions first.
const ACTIVE_PLANS: ActivePlan[] = [
  {
    title: 'Online Store Basic',
    icon: onlineStoreIcon,
    price: 19,
    note: `Renews on ${formatDay(dayOf(ONLINE_STORE_RENEWAL))}`,
    renewsOn: ONLINE_STORE_RENEWAL,
    upgradeTo: 'Online Store Pro',
  },
  {
    title: 'Bookings',
    icon: bookingsIcon,
    price: 29,
    badge: 'Free trial',
    note: `Free trial ends on ${formatDay(dayOf(BOOKINGS_TRIAL_END))}`,
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
  // Plans whose pause offer was taken. Held above the page, since the banner
  // in the shell carries the same news onto every other one. The pause only
  // starts once the period already paid for runs out, so the row says when
  // rather than changing what it charges.
  const { pausedPlans, pausePlan, resumePlan } = usePausedSubscriptions()

  // Cancelling the data saving runs the other way round from cancelling a
  // plan: the warning comes first, since the decision is already made by the
  // time the survey is worth answering, and the survey ends the flow.
  const [dataSavingPlan, setDataSavingPlan] = React.useState<ActivePlan | null>(null)
  const [dataSavingStep, setDataSavingStep] = React.useState<
    'confirm' | 'reason' | null
  >(null)
  // Remounts the survey, so it opens blank each time rather than on the last
  // answers given.
  const [dataSavingRun, setDataSavingRun] = React.useState(0)

  function handleResumePlan(plan: ActivePlan) {
    resumePlan(plan.title)
    toast.success(`${plan.title} has been resumed`)
  }

  function handleCancelDataSaving(plan: ActivePlan) {
    setDataSavingPlan(plan)
    setDataSavingStep('confirm')
    setDataSavingRun((run) => run + 1)
  }

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

      {/* The rail sits beside the plans once there's room for both columns.
          On a phone it has no column of its own: `contents` drops the aside's
          box so its two cards become items of this one, which lets the annual
          offer lead the page — it's the cheapest thing on it — while the
          bundles stay at the bottom, after the plans they'd replace. */}
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="order-2 flex min-w-0 flex-1 flex-col gap-10 lg:order-none">
          <ActivePlansSection
            pausedPlans={pausedPlans}
            onCancelPlan={handleCancelPlan}
            onResumePlan={handleResumePlan}
            onCancelDataSaving={handleCancelDataSaving}
          />
          <InactivePlansSection onStartTrial={handleStartTrial} />
        </div>
        <aside className="contents lg:flex lg:w-80 lg:shrink-0 lg:flex-col lg:gap-8">
          <div className="order-1 lg:order-none">
            <AnnualBillingSection />
          </div>
          <div className="order-3 lg:order-none">
            <BundlesSection />
          </div>
        </aside>
      </div>

      {/* The dialogs sit at the page level so they survive the row menu that
          opened them closing on select. */}
      <UnsubscribeReasonDialog
        key={cancelRun}
        onTrial={cancelPlan?.trialEndsOn !== undefined}
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
      <PausePlanDialog
        planTitle={cancelPlan?.title ?? ''}
        price={cancelPlan?.price ?? 0}
        open={cancelStep === 'pause-plan'}
        onOpenChange={(open) => setCancelStep(open ? 'pause-plan' : null)}
        onPause={() => cancelPlan && pausePlan(cancelPlan.title)}
      />
      <UnsubscribeConfirmDialog
        planTitle={cancelPlan?.title ?? ''}
        open={cancelStep === 'confirm'}
        onOpenChange={(open) => setCancelStep(open ? 'confirm' : null)}
      />
      <CancelDataSavingDialog
        planTitle={dataSavingPlan?.title ?? ''}
        open={dataSavingStep === 'confirm'}
        onOpenChange={(open) => setDataSavingStep(open ? 'confirm' : null)}
        onConfirm={() => setDataSavingStep('reason')}
      />
      {/* The same survey the plans use, minus the one reason that can't apply
          here: this plan is already paused. Whatever is picked ends the flow —
          there's no offer worth making once the data is going. */}
      <UnsubscribeReasonDialog
        key={`data-saving-${dataSavingRun}`}
        onTrial={false}
        offerPause={false}
        open={dataSavingStep === 'reason'}
        onOpenChange={(open) => setDataSavingStep(open ? 'reason' : null)}
        onContinue={() => {
          setDataSavingStep(null)
          toast.success(`Data saving cancelled for ${dataSavingPlan?.title ?? ''}`)
        }}
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
  pausedPlans,
  onCancelPlan,
  onResumePlan,
  onCancelDataSaving,
}: {
  // Titles of the plans pausing at the end of their period.
  pausedPlans: string[]
  onCancelPlan: (plan: ActivePlan) => void
  onResumePlan: (plan: ActivePlan) => void
  onCancelDataSaving: (plan: ActivePlan) => void
}) {
  return (
    <section className="space-y-3">
      <TypographyLarge>Active</TypographyLarge>
      <Card className="gap-0 px-6 py-0 shadow-none">
        {ACTIVE_PLANS.map((plan, index) => {
          // A pausing plan trades its renewal line for the day it stops. The
          // price stays: nothing changes until the period runs out.
          const pausing = pausedPlans.includes(plan.title)
          const pausesOn =
            pausing && plan.renewsOn
              ? `Pauses on ${formatDay(dayOf(plan.renewsOn))}`
              : null
          // Paused either way: one has already stopped and is only paying to
          // keep its data, the other stops at the end of the period. Both are
          // offered the way back rather than another way out.
          const paused = plan.pausedPrice !== undefined || pausing

          return (
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
                  {/* A paused plan shows what it costs now, with the price
                      it charged while it ran struck through beside it. */}
                  {plan.pausedPrice === undefined ? null : (
                    <span className="line-through">{perMonth(plan.price)}</span>
                  )}{' '}
                  {perMonth(plan.pausedPrice ?? plan.price)} ·{' '}
                  {pausesOn ?? plan.note}
                </p>
              </div>
              {/* A paused plan leads with the way back; a running one has
                  nothing to lead with, so its options stay behind the menu. */}
              {paused ? (
                <ButtonGroup className="shrink-0">
                  <Button type="button" size="sm" onClick={() => onResumePlan(plan)}>
                    Resume
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        size="icon-sm"
                        aria-label={`More options for ${plan.title}`}
                      >
                        <EllipsisVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-auto min-w-40">
                      <DropdownMenuItem onSelect={() => onCancelDataSaving(plan)}>
                        Cancel data saving
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ButtonGroup>
              ) : (
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
                      trigger — an icon button — so each row's menu is only as
                      wide as the items it actually has. */}
                  <DropdownMenuContent align="end" className="w-auto min-w-40">
                    {plan.upgradeTo ? (
                      <DropdownMenuItem>Upgrade to {plan.upgradeTo}</DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem onSelect={() => onCancelPlan(plan)}>
                      Cancel subscription
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )
        })}
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
      {/* A tint of the success colour rather than the neutral the other cards
          sit on: the offer is a saving, and the same wash backs the save
          offers' figures. */}
      <div className="flex flex-col gap-6 rounded-xl bg-success-foreground/10 px-6 py-4 text-card-foreground">
        <div className="flex items-start gap-3">
          {/* The same gift the home page's promo card is marked with, kept
              small enough to sit beside the line rather than head it. */}
          <img src={giftImage} alt="" className="size-6 shrink-0" />
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
        {/* The box the bundle is pitched as, bare rather than tiled: it
            carries its own colour, so a container only boxes a box. */}
        <span aria-hidden="true" className="shrink-0 text-xl leading-none">
          📦
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{bundle.title}</span>
        <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      </div>
      <p className="mt-3 text-sm">
        <span className="text-muted-foreground line-through">{bundle.listPrice}</span>{' '}
        {/* Green, as the saving it is — the same colour the save offers
            put their figures in. */}
        <span className="font-medium text-success-foreground">{bundle.price}</span>
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        <span className="font-semibold text-card-foreground">{bundle.appsLabel}</span>{' '}
        {bundle.apps}
      </p>
    </button>
  )
}
