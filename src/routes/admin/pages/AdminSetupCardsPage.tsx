import * as React from 'react'

import { SetupChecklistCard } from '../components/setup-checklist-card'
import { useSetupGuideHint } from '../components/setup-guide-hint'
import { SETUP_APPS, completeSetupApp, type SetupApp } from '../setup-apps'
import { TypographyMuted } from '@/components/ui/typography'

type GalleryCard = {
  id: string
  // Left off for the cards that move between apps, which pick their own.
  app?: SetupApp
  // What those cards pick from.
  apps?: SetupApp[]
}

// The same three apps with every task ticked off, which the finished cards are
// pinned to and the finished picker card chooses between.
const COMPLETED_APPS = SETUP_APPS.map(completeSetupApp)

// A card per app in the state a merchant starts in, the same three again with
// every task done, then the picker cards in both of those states — they're the
// same guide over again, so the pinned cards they summarize are read first.
const GALLERY_CARDS: GalleryCard[] = [
  ...SETUP_APPS.map((app) => ({ id: app.id, app })),
  ...COMPLETED_APPS.map((app) => ({ id: `${app.id}-complete`, app })),
  { id: 'picker' },
  { id: 'picker-complete', apps: COMPLETED_APPS },
]

// A gallery of the setup guide cards that appear on the dashboard home page, as
// handoff material for the developers — the sibling of the /admin/home-cards
// promo gallery. It runs inside the admin shell so the cards get the same
// content width they have on home, and they're the real component at the real
// size, so what's here is what ships.
//
// The apps a guide can be set up for live in ../setup-apps: adding one there
// gives it a card of its own here, in both states, and lists it in the picker
// card's menu.
export function AdminSetupCardsPage() {
  // Hiding works here exactly as it does on home — the card goes, and the hint
  // points at the user menu, whose Setup guide link reloads and brings every
  // card back.
  const [hiddenCardIds, setHiddenCardIds] = React.useState<string[]>([])
  const { showHint } = useSetupGuideHint()

  function hideCard(id: string) {
    setHiddenCardIds((ids) => [...ids, id])
    showHint()
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <TypographyMuted>
        The setup guide cards on the dashboard home page: one card per app, the
        same three finished, then the card that moves between apps in both of
        those states. Reload to bring back a hidden card.
      </TypographyMuted>

      {/* The same column and breakpoint as the home page: one card up to 1280px,
          capped at 640px wide, then thirds of a 1120px row. Equal rows across
          the whole grid, not just within one, so a finished card — which has
          only a line or two to hold — keeps the height it has beside a card
          still carrying its list. Stacked below 1280px they take their own
          height, as they do on home. */}
      <div className="grid w-full max-w-[640px] grid-cols-1 gap-6 xl:max-w-[1120px] xl:auto-rows-fr xl:grid-cols-3 xl:gap-10">
        {GALLERY_CARDS.filter((card) => !hiddenCardIds.includes(card.id)).map((card) => (
          <div key={card.id} className="flex">
            <SetupChecklistCard
              app={card.app}
              apps={card.apps}
              onHide={() => hideCard(card.id)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
