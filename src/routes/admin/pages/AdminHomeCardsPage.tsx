import { PromoTileCard } from '../components/promo-tile-card'
import { ALL_PROMO_TILES } from '../promo-tiles'
import { TypographyMuted } from '@/components/ui/typography'

// A gallery of every promo card that could appear on the dashboard home page, as
// handoff material for the developers. It runs inside the admin shell so the
// cards get the same content width they have on home, and they're the real
// component at the real size, so what's here is what ships.
//
// To add a card, add it to ALL_PROMO_TILES in ../promo-tiles — a card appears
// here as soon as it's listed, and only reaches home once its id is in that
// file's HOME_TILE_IDS.
export function AdminHomeCardsPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <TypographyMuted>
        Every card that could appear on the dashboard home page.
      </TypographyMuted>

      {/* The same column and breakpoint as the home page: one card up to 1280px,
          capped at 640px wide, then three across a 1120px row. Home sizes its
          cards with flex basis so a short row stays centred; a gallery always
          fills its rows, so a three-column grid does the same job and keeps
          every card in a row the same height. */}
      <div className="grid w-full max-w-[640px] grid-cols-1 gap-6 xl:max-w-[1120px] xl:grid-cols-3 xl:gap-10">
        {ALL_PROMO_TILES.map((tile) => (
          <div key={tile.id} className="flex">
            <PromoTileCard tile={tile} />
          </div>
        ))}
      </div>
    </div>
  )
}
