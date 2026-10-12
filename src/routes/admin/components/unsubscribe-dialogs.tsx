"use client"

import * as React from "react"
import {
  ArrowLeftRight,
  ArrowRight,
  BadgePercent,
  Compass,
  Ellipsis,
  Gauge,
  Headset,
  Hourglass,
  Puzzle,
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
}

// Doubles as the name of the step the billing page moves to.
export type CancelOffer = "trial-extension" | "discount"

const DETAILS_PLACEHOLDER = "Tell us more"

const UNSUBSCRIBE_REASONS: UnsubscribeReason[] = [
  {
    label: "Some features are missing",
    icon: Puzzle,
    detailsLabel: "Which features were missing?",
  },
  {
    label: "I need more time to try it",
    icon: Hourglass,
    offer: "trial-extension",
  },
  {
    label: "I'm switching to a different service",
    icon: ArrowLeftRight,
    detailsLabel: "Which service are you switching to?",
  },
  {
    label: "It wasn't easy to use",
    icon: Compass,
    detailsLabel: "Please provide more details",
  },
  {
    label: "I don't use the service enough",
    icon: Gauge,
    detailsLabel: "Please provide more details",
    detailsOptional: true,
    offer: "discount",
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
  open,
  onOpenChange,
  onContinue,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onContinue: (reason: UnsubscribeReason) => void
}) {
  const [reason, setReason] = React.useState("")
  const [details, setDetails] = React.useState("")
  const selected = UNSUBSCRIBE_REASONS.find((option) => option.label === reason)
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
            {UNSUBSCRIBE_REASONS.map(({ label, icon: Icon }, index) => {
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
              — for most of them — its follow-up are required. "Other reason"
              keeps anyone who doesn't fit the list from being stuck. */}
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

// The one number each offer turns on, sized to carry the dialog.
const OFFER_FIGURE_CLASS = "text-3xl font-semibold text-success-foreground"

function formatDay(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// Both save attempts read the same way: a headline figure, a line showing what
// it changes, and the choice between taking it and leaving anyway. Sharing the
// shell keeps the two in step — not least the fact that turning an offer down
// unsubscribes outright.
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
