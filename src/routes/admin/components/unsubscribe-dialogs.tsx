"use client"

import * as React from "react"
import {
  ArrowLeftRight,
  ArrowRight,
  BadgePercent,
  Check,
  CirclePause,
  Compass,
  Ellipsis,
  Gauge,
  Headset,
  Hourglass,
  Puzzle,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldLabel } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { TypographyH4 } from "@/components/ui/typography"

import { STORE_DOMAIN } from "../catalog"
import { PAUSE_ENABLED } from "./paused-subscriptions"

// Cancelling runs through the survey, then either an offer worth making or a
// last confirmation. They live here together so the billing page only has to
// track which step is open.

// Matches the dialogs on the All orders page: a roomier close button beside a
// centred TypographyH4 title.
const DIALOG_CLASS = "sm:max-w-lg [&_[data-slot=dialog-close]]:size-10"
const FOOTER_BUTTON_CLASS = "h-10 flex-1 px-3"

export type UnsubscribeReason = {
  label: string
  icon: LucideIcon
  // The follow-up shown once this reason is picked. A question aimed at the
  // reason gets a far more useful answer than a blank "more details" box.
  // Left off where the next step answers the reason better than a text box.
  detailsLabel?: string
  // Answering is required unless the reason says otherwise: a shop that simply
  // isn't using the app has nothing to diagnose, so it isn't held up for one.
  detailsOptional?: boolean
  // The save attempt worth making for this reason, if any. Without one the
  // survey goes straight to the confirmation.
  offer?: CancelOffer
  // Which subscriptions the reason is offered for. Listed for both unless set:
  // there's no trial left to extend on a paid plan, and nothing to pause on a
  // trial that hasn't been paid for yet.
  only?: "trial" | "paid"
}

// Doubles as the name of the step the billing page moves to.
export type CancelOffer = "trial-extension" | "discount" | "pause-plan"

const DETAILS_PLACEHOLDER = "Tell us more"

const UNSUBSCRIBE_REASONS: UnsubscribeReason[] = [
  {
    // First on the list: it's the only reason that isn't a complaint, and the
    // one with an answer that keeps the shop. No follow-up either — the offer
    // that comes next asks the only question worth asking of someone pausing,
    // and asks it with something on the table.
    label: "I wanna pause for some time",
    icon: CirclePause,
    offer: "pause-plan",
    only: "paid",
  },
  {
    label: "I need more time to try",
    icon: Hourglass,
    offer: "trial-extension",
    only: "trial",
  },
  {
    label: "Some features are missing",
    icon: Puzzle,
    detailsLabel: "Which features were missing?",
  },
  {
    label: "I'm switching to a different service",
    icon: ArrowLeftRight,
    detailsLabel: "Which service are you switching to?",
  },
  {
    label: "I don't use the service enough",
    icon: Gauge,
    detailsLabel: "Please provide more details",
    detailsOptional: true,
    offer: "discount",
  },
  {
    label: "It wasn't easy to use",
    icon: Compass,
    detailsLabel: "Please provide more details",
  },
  {
    label: "I'm not happy with the customer service",
    icon: Headset,
    detailsLabel: "Please provide more details",
  },
  {
    label: "It's too expensive",
    icon: Wallet,
    detailsLabel: "Please provide more details",
    detailsOptional: true,
    offer: "discount",
  },
  {
    label: "Other reason",
    icon: Ellipsis,
    detailsLabel: "Please provide more details",
  },
]

// Step one: why they're leaving, asked before the point of no return so the
// answer isn't collected from someone who then backs out. The answer also
// decides what the next step is.
export function UnsubscribeReasonDialog({
  onTrial,
  offerPause = PAUSE_ENABLED,
  open,
  onOpenChange,
  onContinue,
}: {
  // Whether the plan being cancelled is still on its free trial. Two of the
  // reasons only make sense on one side of that line.
  onTrial: boolean
  // Whether pausing is worth offering. It isn't when the thing being cancelled
  // is the pause itself, and it isn't while the offer is switched off.
  offerPause?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onContinue: (reason: UnsubscribeReason) => void
}) {
  const [reason, setReason] = React.useState("")
  const [details, setDetails] = React.useState("")
  const reasons = UNSUBSCRIBE_REASONS.filter(
    (option) =>
      (option.only === undefined || option.only === (onTrial ? "trial" : "paid")) &&
      (offerPause || option.offer !== "pause-plan"),
  )
  const selected = reasons.find((option) => option.label === reason)
  const needsDetails =
    selected?.detailsLabel !== undefined && !selected.detailsOptional
  const canContinue = selected !== undefined && (!needsDetails || details.trim() !== "")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_CLASS}>
        <DialogHeader>
          <DialogTitle asChild>
            <TypographyH4 className="text-center font-semibold">
              Please select a reason
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-5">
          {/* The dialog title already asks for a reason in writing, so the
              group carries the same wording for screen readers instead of
              repeating it on screen. */}
          <RadioGroup
            aria-label="Select a reason"
            value={reason}
            onValueChange={setReason}
            className="gap-0 divide-y overflow-hidden rounded-lg border"
          >
            {reasons.map(({ label, icon: Icon }, index) => {
              const id = `unsubscribe-reason-${index}`
              return (
                <FieldLabel
                  key={label}
                  htmlFor={id}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 font-normal transition-colors hover:bg-muted/50 has-[[data-checked]]:bg-primary/5"
                >
                  {/* Leading muted icon, as on the app links and menu rows
                      elsewhere in the dashboard. */}
                  <span className="flex min-w-0 items-center gap-3">
                    <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                    {label}
                  </span>
                  <RadioGroupItem id={id} value={label} />
                </FieldLabel>
              )
            })}
          </RadioGroup>

          {/* Nothing to follow up on until there's a reason to follow up on,
              so the field only appears once one is picked. Anything already
              typed is kept through a change of mind. */}
          {selected?.detailsLabel ? (
            <div className="space-y-2">
              <Label htmlFor="unsubscribe-details" className="font-semibold">
                {selected.detailsLabel}
              </Label>
              <Textarea
                id="unsubscribe-details"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                placeholder={DETAILS_PLACEHOLDER}
              />
            </div>
          ) : null}
        </DialogBody>

        <DialogFooter className="flex-row">
          <DialogClose asChild>
            <Button variant="outline" className={FOOTER_BUTTON_CLASS}>
              Cancel
            </Button>
          </DialogClose>
          {/* Learning why is the whole point of this step, so the reason and
              — for most of them — its follow-up are required. The ones with
              nothing to diagnose ask without holding anyone up, and "Other
              reason" keeps anyone who doesn't fit the list from being stuck. */}
          <Button
            className={FOOTER_BUTTON_CLASS}
            disabled={!canContinue}
            onClick={() => selected && onContinue(selected)}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const TRIAL_EXTENSION_DAYS = 7
const DISCOUNT_PERCENT = 20
// Dollars a month to hold a shop that isn't trading: cheap enough to sit on
// while the business is closed, which is the whole point of the offer. The
// billing rows quote it too, so it's exported rather than written twice.
export const PAUSE_PRICE = 5

// The one number each offer turns on, sized to carry the dialog.
const OFFER_FIGURE_CLASS = "text-3xl font-semibold text-success-foreground"

function formatDay(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// Every save attempt reads the same way: a headline figure, a line showing
// what it changes, and the choice between taking it and leaving anyway.
// Sharing the shell keeps them in step — not least the fact that turning an
// offer down unsubscribes outright.
function SaveOfferDialog({
  planTitle,
  open,
  onOpenChange,
  title,
  acceptLabel,
  onAccept,
  children,
}: {
  planTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  acceptLabel: string
  onAccept: () => void
  // The centred stack between the header and the footer. Each offer says its
  // piece in its own order around the figure.
  children: React.ReactNode
}) {
  function handleUnsubscribe() {
    toast.success(`Unsubscribed from ${planTitle}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_CLASS}>
        <DialogHeader>
          <DialogTitle asChild>
            <TypographyH4 className="text-center font-semibold">{title}</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          {/* The offer itself, centred so the figure carries the dialog rather
              than a sentence about it. */}
          <div className="flex flex-col items-center gap-2 py-2">{children}</div>
        </DialogBody>

        <DialogFooter className="flex-row">
          {/* Turning the offer down is itself the confirmation — the offer
              already made the choice plain, so there's no second warning. */}
          <Button
            variant="destructive"
            className={FOOTER_BUTTON_CLASS}
            onClick={handleUnsubscribe}
          >
            No, unsubscribe
          </Button>
          <Button className={FOOTER_BUTTON_CLASS} onClick={onAccept}>
            {acceptLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Offered when the reason was simply not enough time: a week more costs
// nothing and may be all that's wanted.
export function TrialExtensionDialog({
  planTitle,
  trialEndsOn,
  open,
  onOpenChange,
}: {
  planTitle: string
  // ISO day the trial currently runs out. A plan without one (a paid
  // subscription) counts from today instead.
  trialEndsOn?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const currentEnd = trialEndsOn ? new Date(`${trialEndsOn}T00:00:00`) : new Date()
  const extendedEnd = new Date(currentEnd)
  extendedEnd.setDate(extendedEnd.getDate() + TRIAL_EXTENSION_DAYS)

  function handleExtend() {
    toast.success(`Your ${planTitle} free trial has been extended`)
    onOpenChange(false)
  }

  return (
    <SaveOfferDialog
      planTitle={planTitle}
      open={open}
      onOpenChange={onOpenChange}
      title="Need more time?"
      acceptLabel="Extend my trial"
      onAccept={handleExtend}
    >
      {/* Overrides the description's muted default — it reads as a statement
          here, not supporting text. */}
      <DialogDescription className="text-center font-medium text-foreground">
        We'll extend your free trial
      </DialogDescription>
      <p className={OFFER_FIGURE_CLASS}>+{TRIAL_EXTENSION_DAYS} days</p>
      {/* Struck-through old date beside the new one, the same way the bundle
          cards show a price coming down. */}
      <p className="flex items-center gap-2">
        <span className="text-muted-foreground">It will end on</span>
        <span className="text-muted-foreground line-through">{formatDay(currentEnd)}</span>
        <ArrowRight aria-hidden="true" className="size-4 text-muted-foreground" />
        <span className="font-medium">{formatDay(extendedEnd)}</span>
      </p>
    </SaveOfferDialog>
  )
}

// Offered when the reason was cost or too little use of the app: a month at a
// lower price, once, rather than losing the subscription outright.
export function DiscountOfferDialog({
  planTitle,
  open,
  onOpenChange,
}: {
  planTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  function handleApply() {
    toast.success("Your discount has been applied")
    onOpenChange(false)
  }

  return (
    <SaveOfferDialog
      planTitle={planTitle}
      open={open}
      onOpenChange={onOpenChange}
      title="Here's a discount for you"
      acceptLabel="Claim discount"
      onAccept={handleApply}
    >
      {/* The same mark the referral card uses to head a "% off" line, on a
          tint of its own colour so it reads as a badge. */}
      <span className="flex size-16 items-center justify-center rounded-full bg-success-foreground/10">
        <BadgePercent aria-hidden="true" className="size-10 text-success-foreground" />
      </span>
      <p className={OFFER_FIGURE_CLASS}>{DISCOUNT_PERCENT}% off</p>
      <p className="font-medium text-success-foreground">Next month</p>
      {/* Keeps the description's muted default: it closes the offer rather
          than announcing it. */}
      <DialogDescription className="text-center">
        We understand that running a business isn't easy, we hope this makes it
        slightly easier for you.
      </DialogDescription>
    </SaveOfferDialog>
  )
}

// What a paused shop keeps hold of. Spelled out item by item because the
// offer only persuades if it's clear what "your data" actually means.
const PAUSE_KEEPS: { key: string; text: React.ReactNode }[] = [
  {
    key: "link",
    // The domain itself carries the weight: it's the one thing on the list
    // that can't be rebuilt once someone else has taken it.
    text: (
      <>
        <span className="font-medium">{STORE_DOMAIN}</span> will be reserved for you
      </>
    ),
  },
  { key: "data", text: "Products, Orders, and other data will be saved" },
  { key: "flexibility", text: "Unpause or cancel anytime" },
]

// Offered when the reason was a pause rather than a problem: the shop isn't
// leaving over the app, it's closing for a while, so the pitch is holding
// everything intact for a price that's easy to carry while nothing is coming in.
export function PausePlanDialog({
  planTitle,
  price,
  open,
  onOpenChange,
  onPause,
}: {
  planTitle: string
  // Dollars a month the plan costs today, struck through beside the paused
  // price so the drop is read rather than worked out.
  price: number
  open: boolean
  onOpenChange: (open: boolean) => void
  // Told when the offer is taken, so the plan's row can say it's pausing
  // rather than renewing.
  onPause: () => void
}) {
  function handlePause() {
    onPause()
    toast.success(`${planTitle} is paused`)
    onOpenChange(false)
  }

  return (
    <SaveOfferDialog
      planTitle={planTitle}
      open={open}
      onOpenChange={onOpenChange}
      title="Save your data"
      acceptLabel={`Save for $${PAUSE_PRICE}/mo`}
      onAccept={handlePause}
    >
      {/* What's at stake, opening the dialog: the offer below it only means
          anything once it's clear what's being lost. */}
      <DialogDescription className="text-center">
        Unsubscribing deletes your shop data and releases your shop link for
        someone else to take. Once gone, it can't be undone.
      </DialogDescription>

      {/* The same badge treatment the discount offer uses, set down from the
          warning so the offer reads as its own half of the dialog. A shield rather
          than the reason's pause mark: what's on offer here is the data being
          kept safe from the deletion the line above warns about. Archive, the
          other candidate, already means something else on the orders page. */}
      <span className="mt-4 flex size-16 items-center justify-center rounded-full bg-success-foreground/10">
        <ShieldCheck aria-hidden="true" className="size-10 text-success-foreground" />
      </span>
      <p className={OFFER_FIGURE_CLASS}>${PAUSE_PRICE}/mo</p>
      {/* Struck-through full price beside the paused one, as on the trial
          extension and the bundle cards. */}
      <p className="flex items-center gap-2">
        <span className="text-muted-foreground">instead of</span>
        <span className="text-muted-foreground line-through">${price}/mo</span>
      </p>

      {/* Centred with the rest of the stack: each line sits on the dialog's
          axis rather than on a shared left edge. */}
      <ul className="mt-2 w-full space-y-2 text-center">
        {PAUSE_KEEPS.map(({ key, text }) => (
          <li key={key} className="flex items-start justify-center gap-2">
            <Check
              aria-hidden="true"
              className="mt-1 size-4 shrink-0 text-success-foreground"
            />
            {text}
          </li>
        ))}
      </ul>
    </SaveOfferDialog>
  )
}

// Cancelling the pause itself: the plan is already stopped, so what's at stake
// is only what's being kept. Asked before the survey rather than after it —
// the survey is worth answering once they've decided, not before.
export function CancelDataSavingDialog({
  planTitle,
  open,
  onOpenChange,
  onConfirm,
}: {
  planTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_CLASS}>
        <DialogHeader>
          <DialogTitle asChild>
            <TypographyH4 className="text-center font-semibold">
              Cancel data saving?
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <DialogDescription asChild>
            <div className="space-y-6">
              <p>
                {planTitle} is paused, not gone — the fee is what holds its data and
                keeps your shop link reserved. Cancelling deletes them, and that
                can't be undone.
              </p>
              <p>Are you sure you want to cancel data saving for {planTitle}?</p>
            </div>
          </DialogDescription>
        </DialogBody>

        <DialogFooter className="flex-row">
          <DialogClose asChild>
            <Button variant="outline" className={FOOTER_BUTTON_CLASS}>
              Keep my data
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            className={FOOTER_BUTTON_CLASS}
            onClick={onConfirm}
          >
            Cancel data saving
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Step three: the warning, and the button that actually ends the subscription.
export function UnsubscribeConfirmDialog({
  planTitle,
  open,
  onOpenChange,
}: {
  planTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  function handleUnsubscribe() {
    toast.success(`Unsubscribed from ${planTitle}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_CLASS}>
        <DialogHeader>
          <DialogTitle asChild>
            <TypographyH4 className="text-center font-semibold">Are you sure?</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <DialogDescription asChild>
            <div className="space-y-6">
              <p>
                You will lose access to this at the end of your billing period and any
                related data may get deleted.
              </p>
              <p>Are you sure you want to unsubscribe from {planTitle}?</p>
            </div>
          </DialogDescription>
        </DialogBody>

        <DialogFooter className="flex-row">
          <DialogClose asChild>
            <Button variant="outline" className={FOOTER_BUTTON_CLASS}>
              Cancel
            </Button>
          </DialogClose>
          {/* The one irreversible button in the flow, so it carries the
              destructive styling rather than the brand's primary. */}
          <Button
            variant="destructive"
            className={FOOTER_BUTTON_CLASS}
            onClick={handleUnsubscribe}
          >
            Unsubscribe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
