"use client"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TypographyH4 } from "@/components/ui/typography"

// Every app's trial runs the same length, so the end date is worked out from
// the day the shop starts it rather than stored per app.
const TRIAL_DAYS = 7

function getTrialEndLabel() {
  const end = new Date()
  end.setDate(end.getDate() + TRIAL_DAYS)
  return end.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// What starting a trial costs: nothing now, the app's monthly price once the
// trial runs out.
export function StartTrialDialog({
  appTitle,
  price,
  open,
  onOpenChange,
}: {
  appTitle: string
  // Dollars per month, charged only after the trial ends.
  price: number
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  function handleStart() {
    toast.success(`Your ${appTitle} free trial has started`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">{appTitle}</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3 text-lg font-medium">
            <span>Due today</span>
            <span>$0</span>
          </div>
          {/* The price lines up with the heading it belongs to, so the row is
              anchored to its top rather than centred on the two lines. */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p>After trial ends ({getTrialEndLabel()})</p>
              <p className="text-muted-foreground">Cancel anytime</p>
            </div>
            <span>${price}</span>
          </div>
        </DialogBody>

        <DialogFooter className="flex-col gap-3 sm:flex-col sm:justify-start">
          <Button type="button" size="lg" className="w-full" onClick={handleStart}>
            Start free trial
          </Button>
          <p className="text-center text-muted-foreground">You will not be charged today</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
