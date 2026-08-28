import * as React from 'react'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { PromoTileCard } from '../components/promo-tile-card'
import { SetupChecklistCard } from '../components/setup-checklist-card'
import { useSetupGuideHint } from '../components/setup-guide-hint'
import { PROMO_TILES } from '../promo-tiles'
import { SETUP_APPS } from '../setup-apps'
import { TypographyH2, TypographyMuted } from '@/components/ui/typography'

const STORE_URL = 'haus.cococart.co'

type StoreMetric = {
  id: string
  label: string
  // Pre-formatted so the money metric keeps the same $0,000.00 shape the
  // earnings page uses.
  value: string
}

const STORE_METRICS: StoreMetric[] = [
  { id: 'visitors', label: 'Visitors', value: '2,847' },
  { id: 'orders', label: 'Orders', value: '186' },
  { id: 'sales', label: 'Sales', value: '$4,320.75' },
]

export function AdminOverviewPage() {
  // A hidden guide leaves the row with fewer cards, which centres the rest.
  const [setupGuideHidden, setSetupGuideHidden] = React.useState(false)
  const [onlineStoreGuideHidden, setOnlineStoreGuideHidden] = React.useState(false)
  // Hiding a guide takes it off the page, so the user menu it can be reopened
  // from says so.
  const { showHint } = useSetupGuideHint()

  function handleCopyClick() {
    void navigator.clipboard?.writeText(STORE_URL)
    toast.success('Link copied')
  }

  return (
    <div className="flex w-full flex-col items-center gap-8">
      {/* The shop link centres on a phone and moves to the right edge from md up. */}
      <div className="flex w-full items-center justify-center gap-4 text-left md:justify-end">
        <div
          data-slot="button-group"
          className="inline-flex w-fit items-center rounded-md shadow-xs"
        >
          {/* The buttons drop their adjoining borders so the group reads as one
              outlined pill with no dividers between the segments. */}
          <Button asChild variant="outline" size="lg" className="rounded-r-none border-r-0 text-base">
            <a href={`https://${STORE_URL}`} target="_blank" rel="noreferrer">
              {STORE_URL}
            </a>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="rounded-l-none border-l-0"
            aria-label="Copy shop link"
            onClick={handleCopyClick}
          >
            <Copy aria-hidden="true" className="size-4 text-muted-foreground" />
          </Button>
        </div>

      </div>

      {/* The metrics and the cards travel together, with a wider gap between
          them from xl up. */}
      <div className="flex w-full flex-col items-center gap-8 xl:gap-[60px]">
        {/* The title introduces the figures, so it sits with them rather than a
            long gap away. */}
        <div className="flex w-full flex-col items-center gap-6">
          <TypographyH2 className="text-center font-bold md:text-4xl">Welcome</TypographyH2>

          {/* Placeholder figures. Same label-over-value stack as the All Orders
              stats, but the border belongs to the row: the stacks themselves are
              bare type, so they read as one panel rather than a set of cards. The
              panel is only as wide as its contents, and max-w-full lets it wrap
              rather than overflow a phone. Plain divs, not Card: CardHeader is a
              container-query root, so its width ignores its contents. */}
          <a
            href="/admin/orders/all"
            aria-label="View all orders"
            className="flex max-w-full flex-wrap justify-center gap-8 rounded-xl border border-border/40 p-4 text-left outline-none transition-colors hover:border-border focus-visible:ring-2 focus-visible:ring-ring sm:gap-12"
          >
            {/* The period is broken over two lines so it occupies the same two
                rows as a metric, in the label's type rather than a value's. Its
                lines are spaced further apart than body copy, and the pair sits
                centred against the taller metric stacks beside it. */}
            <div className="self-center">
              <TypographyMuted className="text-xs leading-5">Last</TypographyMuted>
              <TypographyMuted className="text-xs leading-5">30 days</TypographyMuted>
            </div>
            {STORE_METRICS.map((metric) => (
              <div key={metric.id}>
                <TypographyMuted className="text-xs">{metric.label}</TypographyMuted>
                <p className="text-base font-semibold tabular-nums sm:text-xl">{metric.value}</p>
              </div>
            ))}
          </a>
        </div>

        {/* 640px matches the card column on the store settings page; from xl up
            the column widens to fit all three cards side by side. */}
        <section className="w-full max-w-[640px] text-left xl:max-w-[1120px]">
          {/* Setup card and promo tiles share one row from 1280px up, where three
              columns still have room to breathe, and stack below that. Each card
              is a third of the row whatever the count, so one or two cards keep
              that width and justify-center puts them in the middle rather than
              stretching them across the row. */}
          <div className="flex flex-col gap-6 xl:flex-row xl:flex-wrap xl:justify-center xl:gap-10">
            {setupGuideHidden ? null : (
              <div className="flex xl:w-[calc((100%_-_5rem)/3)]">
                <SetupChecklistCard
                  onHide={() => {
                    setSetupGuideHidden(true)
                    showHint()
                  }}
                />
              </div>
            )}
            {/* The same guide pinned to one app, so it lists that app's tasks
                with no picker above them. */}
            {onlineStoreGuideHidden ? null : (
              <div className="flex xl:w-[calc((100%_-_5rem)/3)]">
                <SetupChecklistCard
                  app={SETUP_APPS[0]}
                  onHide={() => {
                    setOnlineStoreGuideHidden(true)
                    showHint()
                  }}
                />
              </div>
            )}
            {PROMO_TILES.map((tile) => (
              <div key={tile.id} className="flex xl:w-[calc((100%_-_5rem)/3)]">
                <PromoTileCard tile={tile} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
