import { CirclePause } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { usePausedSubscriptions } from './paused-subscriptions'

/**
 * The notice a paused shop carries on every page: its data is being kept, and
 * billing is where anything can be done about it. It sits at the top of the
 * main content column, in the same slot as the other app banners.
 *
 * Nothing to say until something is paused, so it isn't there by default.
 */
export function PausedSubscriptionBanner() {
  const { pausedPlans } = usePausedSubscriptions()

  if (pausedPlans.length === 0) {
    return null
  }

  return (
    <div className="shrink-0 px-4 pt-4 sm:px-6 lg:px-8">
      {/* A third column from md up, so the action sits against the right edge
          beside the text rather than under it. The `has-[>svg]` stack matches
          the grid the alert sets for itself, so this only overrides it. The
          rows stay top-aligned, which keeps the icon on the title's line; the
          button centres itself instead. */}
      <Alert className="md:has-[>svg]:grid-cols-[auto_1fr_auto]">
        <CirclePause />
        <AlertTitle>Your subscription has been paused.</AlertTitle>
        <AlertDescription>
          Data is being saved for a small monthly fee
        </AlertDescription>
        {/* Left under the text on a phone, where there's no room for a column
            of its own. */}
        <Button
          asChild
          variant="outline"
          size="lg"
          className="col-start-2 mt-3 w-fit md:col-start-3 md:row-span-2 md:row-start-1 md:mt-0 md:self-center"
        >
          <a href="/admin/settings/billing">View billing</a>
        </Button>
      </Alert>
    </div>
  )
}
