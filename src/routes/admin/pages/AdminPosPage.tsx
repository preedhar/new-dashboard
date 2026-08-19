import { ArrowLeft, Star } from "lucide-react"

import appStoreBadge from "@/assets/apps/app-store-badge.svg"
import googlePlayBadge from "@/assets/apps/google-play-badge.png"
import posAppQr from "@/assets/apps/pos-app-qr.png"
import posPreview from "@/assets/apps/pos-preview.webp"
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/app-links"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TypographyMuted } from "@/components/ui/typography"

// The POS app's marketing page: a centred pitch above a screenshot of the app
// running on a tablet, with the supported devices called out underneath.
export function AdminPosPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 xl:max-w-5xl xl:flex-1">
      {/* The desktop chrome for this route is suppressed in AdminPage, so the
          page supplies its own back affordance on a phone. */}
      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        aria-label="Go back"
        onClick={() => window.history.back()}
        className="mr-auto md:hidden"
      >
        <ArrowLeft className="size-5" />
      </Button>

      {/* Stacked on narrower screens; once there's room the image and the
          download card sit side by side, with the image easing back to leave
          the card its space. */}
      <div className="flex w-full flex-col items-center gap-4 xl:flex-1 xl:flex-row xl:items-center xl:gap-6">
        {/* Scales with the column rather than sitting at a fixed size, so it
            fills the width it's given and shrinks to fit a phone. Eases back a
            notch on xl so the card has room alongside it. */}
        <img
          src={posPreview}
          alt="The POS app taking a new order on a tablet"
          className="h-auto w-full xl:min-w-0 xl:flex-1"
        />

        {/* Scanning the code sends a phone or tablet to the store it belongs to;
            the badges beside it cover anyone reading this on a desktop. The card
            is capped rather than sized to its contents, so the heading wraps
            instead of stretching it. */}
        <Card className="w-full max-w-lg gap-4 border-none bg-transparent p-4 shadow-none sm:p-6 xl:max-w-[280px] xl:shrink-0">
          <div className="flex flex-col gap-1">
            <p className="text-center text-xl font-semibold text-foreground sm:text-2xl">
              Start for free
            </p>
            <TypographyMuted className="text-center text-base">
              Take in-person orders at your physical store
            </TypographyMuted>
          </div>

          {/* QR beside the badges, so a scanner and a tapper each have their
              path. On xl the pair stacks into a column to sit within the
              narrow card beside the image. */}
          <div className="flex flex-row items-center justify-center gap-4 sm:gap-6 xl:flex-col xl:gap-4">
            <img
              src={posAppQr}
              alt="QR code to download the POS app"
              className="size-32 shrink-0 sm:size-40"
            />

            {/* Apple's and Google's official badge artwork, pinned to a shared
                width so they stack as a tidy column; each keeps its own aspect
                ratio through the auto height. The gap clears Google's required
                margin of a quarter of the badge height. */}
            <div className="flex flex-col items-center gap-3">
              <a href={APP_STORE_URL} target="_blank" rel="noreferrer">
                <img
                  src={appStoreBadge}
                  alt="Download on the App Store"
                  className="h-auto w-40 lg:w-36"
                />
              </a>
              <a href={GOOGLE_PLAY_URL} target="_blank" rel="noreferrer">
                <img
                  src={googlePlayBadge}
                  alt="Get it on Google Play"
                  className="h-auto w-40 lg:w-36"
                />
              </a>
            </div>
          </div>

          {/* Splits the free download from the paid upgrade beneath it. */}
          <Separator />
          <Button type="button" className="h-10 w-fit self-center px-3">
            <Star className="size-4" />
            Upgrade to POS Pro
          </Button>
        </Card>
      </div>
    </div>
  )
}
