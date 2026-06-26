import * as React from 'react'
import { ArrowLeft, Eye, Mail, Settings } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import { TypographyH3, TypographyH4 } from '@/components/ui/typography'
import { cn } from '@/lib/utils'

// The five rating levels shown in the product (emoji + label + score out of 5).
const RATINGS: { value: number; label: string; emoji: string }[] = [
  { value: 5, label: 'Excellent', emoji: '😍' },
  { value: 4, label: 'Good', emoji: '😃' },
  { value: 3, label: 'Average', emoji: '🙂' },
  { value: 2, label: 'Poor', emoji: '🙁' },
  { value: 1, label: 'Bad', emoji: '😠' },
]

const RATING_BY_VALUE = Object.fromEntries(RATINGS.map((r) => [r.value, r])) as Record<
  number,
  (typeof RATINGS)[number]
>

const CUSTOMERS = [
  'Aiden Carter',
  'Chloe Mitchell',
  'Teresa Nakamura',
  'Maya Rodriguez',
  'David Kim',
  'Lily Chen',
  'Sofia Rossi',
  'Noah Patel',
  'Emma Johnson',
  'Olivia Brown',
  'Lucas Müller',
  'Hana Suzuki',
]

const ITEM_SETS = [
  ['4x BBQ Baby Back Ribs', '1x Coleslaw'],
  ['1x Caesar Salad', '1x Sparkling Water'],
  ['1x Iced Coffee'],
  ['2x Croissant', '1x Latte'],
  ['1x Americano', '1x Muffin'],
  ['2x Green Tea', '1x Sandwich'],
  ['3x Pasta', '1x Garlic Bread'],
  ['1x Margherita Pizza'],
  ['2x Cheeseburger', '1x Fries'],
  ['1x Pad Thai', '1x Spring Roll'],
  ['1x Cappuccino', '2x Donut'],
  ['1x Ramen', '1x Gyoza'],
]

const REVIEW_TEXTS = [
  'Absolutely delicious and arrived right on time. Will definitely order again!',
  'Great food, though the delivery was a little later than expected.',
  'Everything was fresh and packaged really well. Loved the little note inside.',
  'The portions were generous and the flavours were spot on. Highly recommend.',
  'Decent meal but the coffee was lukewarm by the time it got to me.',
  'Not what I expected — the order was missing an item and no one followed up.',
  'Best ribs in town, hands down. The coleslaw was a perfect side.',
  'Tasted fine but nothing special for the price.',
  'Friendly driver and the food was still hot. Five stars from me.',
  'Pizza was a bit soggy on arrival, but the staff sorted out a refund quickly.',
  'Consistently good every time I order. My go-to for weekday lunches.',
  'Order came cold and the packaging had leaked. Quite disappointed this time.',
]

// Deterministic pseudo-random integer derived from a seed, so example data is
// varied but stable across reloads.
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return Math.floor((x - Math.floor(x)) * 1000)
}

type Review = {
  id: string
  customer: string
  reviewedAt: Date
  rating: number
  text: string
  orderId: string
  items: string[]
  published: boolean
}

const REVIEWS: Review[] = Array.from({ length: 24 }, (_, i) => {
  const customer = CUSTOMERS[i % CUSTOMERS.length]
  // Spread the reviews across the first half of 2026.
  const reviewedAt = new Date(2026, (i * 5) % 6, 1 + ((i * 7) % 27), 9 + ((i * 3) % 10), (i * 13) % 60)
  // Weight ratings towards the higher end, with the occasional poor/bad review.
  const ratingRoll = pseudoRandom(i + 200) % 100
  const rating = ratingRoll < 45 ? 5 : ratingRoll < 70 ? 4 : ratingRoll < 85 ? 3 : ratingRoll < 94 ? 2 : 1
  const orderId = `${customer.slice(0, 3).toUpperCase()}${10 + i}`
  // Some customers leave a rating without a written review.
  const hasReview = pseudoRandom(i + 800) % 100 < 70
  return {
    id: `REV${100 + i}`,
    customer,
    reviewedAt,
    rating,
    text: hasReview ? REVIEW_TEXTS[i % REVIEW_TEXTS.length] : '',
    orderId,
    items: ITEM_SETS[i % ITEM_SETS.length],
    // Most reviews are published by default; a handful await moderation.
    published: pseudoRandom(i + 600) % 100 < 75,
  }
})

function formatDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  // Only show the year when it differs from the current year.
  if (date.getFullYear() !== new Date().getFullYear()) {
    options.year = 'numeric'
  }
  return date.toLocaleDateString('en-US', options)
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

// The rating emoji rendered like an icon, mirroring the channel icon shown in
// the All Orders table.
function RatingIcon({ value, className }: { value: number; className?: string }) {
  const rating = RATING_BY_VALUE[value]
  if (!rating) return null
  return (
    <span
      role="img"
      aria-label={rating.label}
      className={cn(
        'flex size-9 shrink-0 items-center justify-center text-2xl leading-none',
        className,
      )}
    >
      {rating.emoji}
    </span>
  )
}

// Stacked score ("4/5" over the label) used in the Rating column and mobile cards.
function RatingScore({ value }: { value: number }) {
  const rating = RATING_BY_VALUE[value]
  if (!rating) return null
  return (
    <div className="leading-tight">
      <p className="text-sm font-medium text-foreground">{rating.value}/5</p>
      <p className="text-sm font-normal text-muted-foreground">{rating.label}</p>
    </div>
  )
}

function getReviewColumns(
  onTogglePublished: (id: string, published: boolean) => void,
): ColumnDef<Review>[] {
  return [
    {
      accessorKey: 'rating',
      sortingFn: 'basic',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Rating" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <RatingIcon value={row.original.rating} />
          <RatingScore value={row.original.rating} />
        </div>
      ),
      meta: { className: 'w-[120px]', headerClassName: 'w-[120px]' },
    },
    {
      accessorKey: 'text',
      header: 'Review',
      enableSorting: false,
      cell: ({ row }) =>
        row.original.text ? (
          <p className="max-w-[280px] whitespace-normal text-sm text-muted-foreground">
            {row.original.text}
          </p>
        ) : (
          <span className="text-muted-foreground/40">-</span>
        ),
      meta: { className: 'min-w-[220px]', headerClassName: 'min-w-[220px]' },
    },
    {
      accessorKey: 'orderId',
      header: 'Order',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="min-w-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="font-medium text-foreground transition-colors hover:text-muted-foreground"
              >
                {row.original.orderId}
              </button>
            </TooltipTrigger>
            <TooltipContent>View order</TooltipContent>
          </Tooltip>
          <p className="text-sm text-muted-foreground">{row.original.customer}</p>
        </div>
      ),
      meta: { className: 'w-[120px] max-w-[120px]', headerClassName: 'w-[120px] max-w-[120px]' },
    },
    {
      accessorKey: 'reviewedAt',
      sortingFn: 'datetime',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => (
        <div className="leading-tight text-muted-foreground">
          <p>
            {formatDate(row.original.reviewedAt)}, {formatTime(row.original.reviewedAt)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'published',
      enableSorting: false,
      header: 'Published',
      meta: { className: 'w-[120px] text-right', headerClassName: 'w-[120px] text-right' },
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Switch
            checked={row.original.published}
            onCheckedChange={(checked) => onTogglePublished(row.original.id, checked)}
            aria-label={`Publish review from ${row.original.customer}`}
          />
        </div>
      ),
    },
  ]
}

// Aggregate stats for published reviews: average score, total count, and the
// distribution across the five rating levels.
function ReviewStatsPane({ reviews, className }: { reviews: Review[]; className?: string }) {
  const published = reviews.filter((review) => review.published)
  const total = published.length
  const average = total
    ? published.reduce((sum, review) => sum + review.rating, 0) / total
    : 0

  return (
    <aside className={cn('@container rounded-lg border border-border p-6', className)}>
      {/* When the pane is wide enough, the aggregate stats sit on the left and
          the distribution chart is pushed to the right; otherwise they stack. */}
      <div className="flex flex-col gap-6 @xl:flex-row @xl:items-start @xl:justify-between">
        <div className="space-y-2">
          <p className="text-base font-semibold text-foreground">Published</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight text-foreground tabular-nums">
              {average.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">({total} reviews)</span>
          </div>
        </div>

        <div className="space-y-3 @xl:w-[360px] @xl:shrink-0">
          {RATINGS.map((rating) => {
            const count = published.filter((review) => review.rating === rating.value).length
            const pct = total ? (count / total) * 100 : 0
            return (
              <div key={rating.value} className="flex items-center gap-3">
                <div className="flex w-[150px] shrink-0 items-center gap-1.5 text-sm">
                  <span aria-hidden className="text-base leading-none">
                    {rating.emoji}
                  </span>
                  <span className="font-medium text-foreground">{rating.label}</span>
                  <span className="text-muted-foreground">({rating.value}/5)</span>
                </div>
                <Progress value={pct} className="h-2.5 flex-1" />
                <span className="w-4 shrink-0 text-right text-sm text-muted-foreground tabular-nums">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

// Review collection settings, shown as choice-card switches (mirrors the Export
// to CSV dialog style on the All Orders page).
function ReviewSettingsDialog({
  open,
  onOpenChange,
  collectReviews,
  onCollectReviewsChange,
  autoPublish,
  onAutoPublishChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectReviews: boolean
  onCollectReviewsChange: (value: boolean) => void
  autoPublish: boolean
  onAutoPublishChange: (value: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="[&_[data-slot=dialog-close]]:size-10">
        <DialogHeader>
          <DialogTitle asChild>
            <TypographyH4 className="text-center font-semibold">Review settings</TypographyH4>
          </DialogTitle>
        </DialogHeader>
        <FieldGroup className="gap-6">
          <FieldLabel htmlFor="collect-reviews" className="transition-colors hover:bg-muted/50">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>
                  <Mail className="size-4" />
                  Request reviews
                </FieldTitle>
                <FieldDescription>
                  Email will be sent 24 hours after fulfillment
                </FieldDescription>
              </FieldContent>
              <Switch
                id="collect-reviews"
                checked={collectReviews}
                onCheckedChange={onCollectReviewsChange}
              />
            </Field>
          </FieldLabel>
          <FieldLabel htmlFor="auto-publish" className="transition-colors hover:bg-muted/50">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>
                  <Eye className="size-4" />
                  Auto-publish new reviews
                </FieldTitle>
                <FieldDescription>You can always hide them later</FieldDescription>
              </FieldContent>
              <Switch
                id="auto-publish"
                checked={autoPublish}
                onCheckedChange={onAutoPublishChange}
              />
            </Field>
          </FieldLabel>
        </FieldGroup>
        <DialogFooter className="flex-row">
          <Button variant="outline" className="h-10 flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="h-10 flex-1"
            onClick={() => {
              onOpenChange(false)
              toast.success('Review settings saved')
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AdminOrdersReviewsPage() {
  const [reviews, setReviews] = React.useState<Review[]>(REVIEWS)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [collectReviews, setCollectReviews] = React.useState(true)
  const [autoPublish, setAutoPublish] = React.useState(true)

  const handleTogglePublished = React.useCallback((id: string, published: boolean) => {
    setReviews((prev) =>
      prev.map((review) => (review.id === id ? { ...review, published } : review)),
    )
    toast.success(published ? 'Review published' : 'Review unpublished')
  }, [])

  const columns = React.useMemo(() => getReviewColumns(handleTogglePublished), [handleTogglePublished])

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 md:justify-between">
          <Button
            variant="outline"
            className="h-10 w-10 shrink-0 px-0 md:hidden"
            aria-label="Go back"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <TypographyH3 className="flex-1 text-center md:flex-none md:text-left">Reviews</TypographyH3>
          {/* Desktop: settings aligned to the right of the title */}
          <Button
            variant="outline"
            className="hidden h-10 px-3 md:inline-flex"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="size-4" />
            Settings
          </Button>
          {/* Mobile: settings as an icon button, right-aligned in the title row */}
          <Button
            variant="outline"
            className="h-10 w-10 shrink-0 px-0 md:hidden"
            aria-label="Settings"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="size-5" />
          </Button>
        </div>
      </div>

      <ReviewSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        collectReviews={collectReviews}
        onCollectReviewsChange={setCollectReviews}
        autoPublish={autoPublish}
        onAutoPublishChange={setAutoPublish}
      />

      {/* Mobile: stats card above the review card list */}
      <ReviewStatsPane reviews={reviews} className="p-4 md:hidden" />

      {/* Mobile: reviews as a card list */}
      <div className="-mx-4 flex flex-col divide-y divide-border sm:-mx-6 md:hidden">
        {reviews.map((review) => (
          <div key={review.id} className="flex flex-col gap-2 px-4 py-4 sm:px-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <RatingIcon value={review.rating} className="size-8 text-xl" />
                <RatingScore value={review.rating} />
              </div>
              <p className="shrink-0 text-sm text-muted-foreground">
                {formatDate(review.reviewedAt)}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{review.orderId}</p>
              <p className="text-sm text-muted-foreground">{review.customer}</p>
            </div>
            {review.text ? (
              <p className="text-sm text-muted-foreground">{review.text}</p>
            ) : null}
            <label
              htmlFor={`publish-${review.id}`}
              className="flex items-center justify-between gap-3"
            >
              <span className="text-sm font-medium text-foreground">Published</span>
              <Switch
                id={`publish-${review.id}`}
                checked={review.published}
                onCheckedChange={(checked) => handleTogglePublished(review.id, checked)}
              />
            </label>
          </div>
        ))}
      </div>

      {/* Desktop: reviews data table + always-visible stats pane. Below lg the
          pane stacks above the table (flex-col-reverse puts the last child on
          top); at lg and up it sits beside the table on the right. */}
      <div className="hidden md:flex md:flex-col-reverse md:gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <DataTable
            columns={columns}
            data={reviews}
            defaultSorting={[{ id: 'reviewedAt', desc: true }]}
          />
        </div>
        <ReviewStatsPane
          reviews={reviews}
          className="lg:sticky lg:top-4 lg:w-[340px] lg:shrink-0 lg:self-start"
        />
      </div>
    </div>
  )
}
