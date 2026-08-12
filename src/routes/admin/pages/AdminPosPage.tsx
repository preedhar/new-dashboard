import { ArrowLeft } from "lucide-react"

import appStoreBadge from "@/assets/apps/app-store-badge.svg"
import googlePlayBadge from "@/assets/apps/google-play-badge.png"
import posAppQr from "@/assets/apps/pos-app-qr.png"
import posPreview from "@/assets/apps/pos-preview.webp"
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/app-links"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TypographyH2, TypographyMuted } from "@/components/ui/typography"

// The POS app's marketing page: a centred pitch above a screenshot of the app
// running on a tablet, with the supported devices called out underneath.
export function AdminPosPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4">
      {/* The desktop chrome for this route is suppressed in AdminPage, so the
          page supplies its own back affordance on a phone. The heading clears
          the button's column until there's room to centre it against nothing. */}
      <header className="relative flex w-full flex-col items-center gap-2">
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
        <TypographyH2 className="px-12 text-center md:px-0">POS</TypographyH2>
        <TypographyMuted className="text-center text-base">
          Start for free
        </TypographyMuted>
      </header>

      {/* Scales with the column rather than sitting at a fixed size, so it
          fills the width it's given and shrinks to fit a phone. */}
      <img
        src={posPreview}
        alt="The POS app taking a new order on a tablet"
        className="h-auto w-full"
      />

      {/* Scanning the code sends a phone or tablet to the store it belongs to;
          the badges beside it cover anyone reading this on a desktop. The card
          is capped rather than sized to its contents, so the heading wraps
          instead of stretching it. */}
      <Card className="w-full max-w-lg gap-4 bg-neutral-50 p-4 shadow-none sm:p-6">
        <p className="text-center text-lg font-semibold text-foreground sm:text-xl">
          Available on iPad, iPhone, and Android
        </p>

        {/* Side by side once there's room. On a phone the column reverses so
            the badges — the tappable thing there — come first, leaving the code
            for whoever is scanning from another device. */}
        <div className="flex flex-col-reverse items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <img
            src={posAppQr}
            alt="QR code to download the POS app"
            className="size-32 shrink-0 sm:size-40"
          />
          {/* Runs the width of the row on a phone, and stands up as a hairline
              between the two columns once they sit side by side. */}
          <div
            aria-hidden="true"
            className="h-px w-full shrink-0 bg-border/50 sm:h-auto sm:w-px sm:self-stretch"
          />

          {/* Apple's and Google's official badge artwork, sized by height so
              each keeps its own aspect ratio. The gap clears Google's required
              margin of a quarter of the badge height. The badges differ in
              width, so they're centred on each other. */}
          <div className="flex flex-col items-center gap-3">
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
        </div>
      </Card>
    </div>
  )
}
