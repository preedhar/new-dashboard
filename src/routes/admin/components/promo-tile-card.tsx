import * as React from 'react'

import { buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import emailCreatedImage from '@/assets/admin/email-created.png'
import { TypographyH4, TypographyLarge, TypographyMuted } from '@/components/ui/typography'
import type { PromoTile } from '../promo-tiles'
import { cn } from '@/lib/utils'

// The whole tile is the click target, like the Apps page cards, so the call to
// action is a styled span rather than a nested button.
const PROMO_TILE_CLASS =
  'group relative isolate flex min-h-40 w-full flex-col rounded-xl p-4 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:p-6 xl:min-h-[420px] xl:p-8'

export function PromoTileCard({ tile }: { tile: PromoTile }) {
  const [paywallOpen, setPaywallOpen] = React.useState(false)

  const body = (
    <>
      {/* Same hover as the Apps page cards: the surface sits on its own layer so
          it can grow past the card without moving the content. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-xl border border-border bg-neutral-50 transition-all duration-200 group-hover:-inset-2.5 group-hover:bg-muted"
      />
      <div className="relative z-10 max-w-[80%]">
        <TypographyLarge className="text-base sm:text-lg">{tile.title}</TypographyLarge>
        <TypographyMuted className="mt-1 leading-6 md:mt-2 md:text-base">
          {tile.description}
        </TypographyMuted>
      </div>
      {/* Artwork, bleeding off the bottom-right corner. Every file is @2x, so
          w-40 draws it at half its pixel size from 640px up; below that it steps
          down, since a square icon at full size stands as tall as the whole
          stacked card. Its height comes from the file rather than a fixed
          attribute, since the set isn't all one shape — the icons are square
          where the placeholder is landscape. The wrapper clips
          it to the card, which the surface layer can't do any more, so it grows
          on hover exactly as the surface does — otherwise the art would stay cut
          off at the resting edge while the card carried on past it. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl transition-all duration-200 group-hover:-inset-2.5"
      >
        <img
          src={tile.image ?? emailCreatedImage}
          alt=""
          className="absolute right-0 bottom-0 w-28 max-w-[55%] translate-x-3 translate-y-3 sm:w-40"
        />
      </span>
      {/* mt-auto pins the call to action to the bottom-left, clear of the art.
          The gap above it tightens when the cards are stacked. */}
      <div className="relative z-10 mt-auto pt-4 xl:pt-8">
        <span className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
          {tile.action.label}
        </span>
      </div>
    </>
  )

  // A paywalled tile goes nowhere yet — it stands in for the upgrade flow with a
  // placeholder dialog, and is checked before href so the real destination can
  // stay on the tile until the paywall is built.
  if (tile.action.paywall) {
    return (
      <>
        <button
          type="button"
          className={PROMO_TILE_CLASS}
          onClick={() => setPaywallOpen(true)}
        >
          {body}
        </button>
        <Dialog open={paywallOpen} onOpenChange={setPaywallOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle asChild>
                <TypographyH4 className="text-center font-semibold">Paywall</TypographyH4>
              </DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  if (tile.action.href) {
    return (
      <a
        href={tile.action.href}
        {...(tile.action.external ? { target: '_blank', rel: 'noreferrer' } : {})}
        className={PROMO_TILE_CLASS}
      >
        {body}
      </a>
    )
  }

  return (
    <button type="button" className={PROMO_TILE_CLASS}>
      {body}
    </button>
  )
}
