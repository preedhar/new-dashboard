import { InfoIcon, TriangleAlertIcon } from 'lucide-react'

import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

/**
 * Placeholder alert banners for the admin shell. They sit at the top of the
 * main content column: below the mobile header bar on mobile, and above the
 * page chrome on desktop.
 */
export function AppAlertBanner() {
  return (
    <div className="flex shrink-0 flex-col gap-3 px-4 pt-4 sm:px-6 lg:px-8">
      <Alert className="bg-sidebar">
        <InfoIcon />
        <AlertTitle className="font-normal">
          Verify your email using the activation link we sent to john@doe.com
        </AlertTitle>
        <AlertAction className="top-1/2 -translate-y-1/2">
          <Button variant="link" size="sm">
            Resend
          </Button>
        </AlertAction>
      </Alert>

      <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
        <TriangleAlertIcon />
        <AlertTitle className="font-normal">Placeholder alert title</AlertTitle>
        <AlertDescription>
          Placeholder description text for this alert banner.
        </AlertDescription>
        <AlertAction className="top-1/2 -translate-y-1/2">
          <Button variant="outline" size="sm" className="text-foreground">
            Action
          </Button>
        </AlertAction>
      </Alert>
    </div>
  )
}
