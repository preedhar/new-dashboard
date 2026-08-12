import * as React from 'react'

import appStoreBadge from '@/assets/apps/app-store-badge.svg'
import googlePlayBadge from '@/assets/apps/google-play-badge.png'
import {
  APP_STORE_URL,
  GOOGLE_PLAY_URL,
  storeUrlForDevice,
} from '@/lib/app-links'
import { TypographyH2, TypographyMuted } from '@/components/ui/typography'

// The public landing page a QR code points at. A phone or tablet is sent
// straight to its app store; anything else — a desktop browser, or a device we
// can't place — is shown both badges to choose from.
export function AppRedirectPage() {
  // Deterministic for a given device, so it's resolved once at mount rather
  // than held in state.
  const target = React.useMemo(() => storeUrlForDevice(), [])

  React.useEffect(() => {
    if (!target) return
    // `replace` keeps the redirect out of the back stack, so going back from
    // the store returns to whatever preceded the scan.
    window.location.replace(target)
  }, [target])

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 py-12 text-foreground">
      <img src="/cococart-logomark.svg" alt="Cococart" className="size-12" />

      {target ? (
        <TypographyMuted className="text-center text-base">
          Opening the app store…
        </TypographyMuted>
      ) : (
        <>
          <div className="flex flex-col items-center gap-2">
            <TypographyH2 className="text-center text-2xl">
              Get the Cococart POS app
            </TypographyH2>
            <TypographyMuted className="text-center text-base">
              Available on iPad, iPhone, and Android
            </TypographyMuted>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href={APP_STORE_URL} target="_blank" rel="noreferrer">
              <img
                src={appStoreBadge}
                alt="Download on the App Store"
                className="h-12 w-auto"
              />
            </a>
            <a href={GOOGLE_PLAY_URL} target="_blank" rel="noreferrer">
              <img
                src={googlePlayBadge}
                alt="Get it on Google Play"
                className="h-12 w-auto"
              />
            </a>
          </div>
        </>
      )}
    </main>
  )
}
