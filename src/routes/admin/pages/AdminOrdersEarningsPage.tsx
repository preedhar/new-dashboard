import * as React from 'react'
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  CircleDot,
  Download,
  Info,
  Package,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TypographyH3, TypographyH4 } from '@/components/ui/typography'
import type { ColumnDef } from '@tanstack/react-table'

type PayoutStatus = 'Upcoming' | 'In transit' | 'Sent' | 'Failed'

// Status is read-only on this page — it comes from the payment processor, so it
// renders as a badge rather than a dropdown. The colours mirror the Deliveries
// table: Upcoming maps to the Pending pill (primary/amber), In transit maps to
// the Approved pill (blue), Sent maps to Completed/Fulfilled (secondary/grey)
// and Failed shares the destructive (red) treatment.
const STATUS_BADGE_CLASS: Record<PayoutStatus, string> = {
  Upcoming: 'border-transparent bg-primary/10 text-amber-700',
  'In transit': 'border-transparent bg-[#2040B0]/10 text-[#2040B0]',
  Sent: 'border-transparent bg-secondary text-secondary-foreground',
  Failed: 'border-transparent bg-destructive/10 text-destructive',
}

// Payouts that haven't landed yet — these back the "Upcoming" toolbar tab.
const PENDING_STATUSES: PayoutStatus[] = ['Upcoming', 'In transit']

function PayoutStatusBadge({ status, className }: { status: PayoutStatus; className?: string }) {
  return <Badge className={cn('text-sm', STATUS_BADGE_CLASS[status], className)}>{status}</Badge>
}

type PaymentMethod = 'QR Ph' | 'Card' | 'PayNow' | 'GCash'

// A single order (transaction) that contributed to a payout. Refunds carry a
// negative amount and reference the order they reverse.
type PayoutOrder = {
  id: string
  refund: boolean
  paymentMethod: PaymentMethod
  date: Date
  amount: number
  fees: number
}

type Payout = {
  id: string
  status: PayoutStatus
  payoutDate: Date
  paymentMethod: PaymentMethod
  orders: PayoutOrder[]
  // Gross of every order amount, the processor fees withheld, and the net that
  // is actually paid out (total − fees).
  totalBalance: number
  fees: number
  net: number
}

// Deterministic pseudo-random float in [0, 1) derived from a seed, so example
// data is varied but stable across reloads.
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

const ORDER_PREFIXES = [
  'KUM', 'ALE', 'KCS', 'ANG', 'ARA', 'MAR', 'ALB', 'JUL', 'RIC', 'ANA',
  'CAR', 'BEA', 'LEO', 'SOF', 'NOA', 'EMM', 'OLI', 'DAV', 'LIL', 'TER',
]

function makeOrderId(seed: number) {
  const prefix = ORDER_PREFIXES[Math.floor(pseudoRandom(seed + 3) * ORDER_PREFIXES.length)]
  const number = 100 + Math.floor(pseudoRandom(seed + 7) * 900)
  return `${prefix}${number}`
}

function round2(value: number) {
  return Math.round(value * 100) / 100
}

// Build the orders that make up a payout. Sales land in the hours before the
// payout; a quarter of payouts also include a refund reversing their first sale.
function makeOrders(seed: number, count: number, payoutDate: Date, method: PaymentMethod): PayoutOrder[] {
  const orders: PayoutOrder[] = Array.from({ length: count }, (_, i) => {
    const amount = round2(300 + pseudoRandom(seed * 10 + i) * 2400)
    return {
      id: makeOrderId(seed * 10 + i),
      refund: false,
      paymentMethod: method,
      date: new Date(payoutDate.getTime() - (i * 3 + 1) * 60 * 60 * 1000),
      amount,
      fees: round2(amount * 0.029 + 0.3),
    }
  })

  // Only reverse a sale when the payout has other orders to cover it, so the
  // payout's net always stays positive.
  if (count >= 2 && pseudoRandom(seed + 99) < 0.25) {
    const reversed = orders[0]
    orders.push({
      id: reversed.id,
      refund: true,
      paymentMethod: reversed.paymentMethod,
      date: new Date(reversed.date.getTime() + 60 * 60 * 1000),
      amount: -reversed.amount,
      fees: reversed.fees,
    })
  }

  return orders
}

function makePayout(
  seed: number,
  id: string,
  status: PayoutStatus,
  payoutDate: Date,
  method: PaymentMethod,
  orderCount: number,
): Payout {
  const orders = makeOrders(seed, orderCount, payoutDate, method)
  const totalBalance = round2(orders.reduce((sum, order) => sum + order.amount, 0))
  const fees = round2(orders.reduce((sum, order) => sum + order.fees, 0))
  return {
    id,
    status,
    payoutDate,
    paymentMethod: method,
    orders,
    totalBalance,
    fees,
    net: round2(totalBalance - fees),
  }
}

const PAYOUTS: Payout[] = [
  makePayout(1, 'PY10471', 'Upcoming', new Date(2026, 6, 18), 'QR Ph', 2),
  makePayout(2, 'PY10470', 'Sent', new Date(2026, 6, 17), 'QR Ph', 2),
  makePayout(3, 'PY10469', 'Sent', new Date(2026, 6, 16), 'Card', 1),
  makePayout(4, 'PY10468', 'Sent', new Date(2026, 6, 15), 'Card', 1),
  makePayout(5, 'PY10467', 'Sent', new Date(2026, 6, 14), 'PayNow', 2),
  makePayout(6, 'PY10466', 'Sent', new Date(2026, 6, 13), 'Card', 3),
  makePayout(7, 'PY10465', 'Sent', new Date(2026, 6, 11), 'GCash', 1),
  makePayout(8, 'PY10464', 'Sent', new Date(2026, 6, 10), 'Card', 1),
  makePayout(9, 'PY10463', 'Sent', new Date(2026, 6, 9), 'QR Ph', 2),
  makePayout(10, 'PY10462', 'Sent', new Date(2026, 6, 8), 'Card', 2),
  makePayout(11, 'PY10461', 'Sent', new Date(2026, 6, 7), 'PayNow', 1),
  makePayout(12, 'PY10460', 'Sent', new Date(2026, 6, 5), 'Card', 3),
  makePayout(13, 'PY10459', 'Sent', new Date(2026, 6, 3), 'GCash', 1),
  // Older payouts fall in the previous year, so the table shows the year.
  makePayout(14, 'PY10458', 'Sent', new Date(2025, 11, 18), 'Card', 2),
  makePayout(15, 'PY10457', 'Sent', new Date(2025, 10, 6), 'QR Ph', 1),
  makePayout(16, 'PY10456', 'Sent', new Date(2025, 8, 25), 'Card', 2),
]

function formatDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  // Only show the year when it differs from the current year.
  if (date.getFullYear() !== new Date().getFullYear()) {
    options.year = 'numeric'
  }
  return date.toLocaleDateString('en-US', options)
}

function formatMoney(amount: number) {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Signed amount for the orders list — refunds read as "-$960.50".
function formatSignedMoney(amount: number) {
  return amount < 0 ? `-${formatMoney(Math.abs(amount))}` : formatMoney(amount)
}

function orderCountLabel(count: number) {
  return `${count} ${count === 1 ? 'order' : 'orders'}`
}

// Top-of-page metrics. The running balance is the net still owed across payouts
// that haven't landed yet; the next expected payout is the soonest of their
// dates.
const PENDING_PAYOUTS = PAYOUTS.filter((payout) => PENDING_STATUSES.includes(payout.status))
const RUNNING_BALANCE = round2(PENDING_PAYOUTS.reduce((sum, payout) => sum + payout.net, 0))
const NEXT_PAYOUT_DATE = PENDING_PAYOUTS.reduce<Date | null>(
  (earliest, payout) => (!earliest || payout.payoutDate < earliest ? payout.payoutDate : earliest),
  null,
)

// Client-side navigation to the full-page payout detail view, used on mobile.
// The payout id rides in the query string since the router matches pathname only.
function navigateToPayoutDetail(payoutId: string) {
  window.history.pushState(
    null,
    '',
    `/admin/orders/earnings/detail?payout=${encodeURIComponent(payoutId)}`,
  )
  window.dispatchEvent(new PopStateEvent('popstate'))
}

type IconComponent = React.ComponentType<{ className?: string }>

// Icon on the left, a muted label on top and the value below — mirrors the
// delivery detail pane's layout.
function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: IconComponent
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-[18px]">
      <Icon className="ml-1.5 size-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="flex h-5 items-center text-sm text-muted-foreground">{label}</p>
        <div className="space-y-0.5 text-base text-foreground">{children}</div>
      </div>
    </div>
  )
}

// The order (transaction) list shown on the pane's "Orders" tab. Each row leads
// with the order id and its net amount, followed by a muted line with the date,
// payment method and fees. Refunds are labelled and shown in the destructive hue.
function PayoutOrdersList({
  orders,
  expectedPayoutDate,
}: {
  orders: PayoutOrder[]
  // Set for upcoming payouts — the (shared) date each transaction is expected
  // to pay out, shown per row.
  expectedPayoutDate?: Date
}) {
  return (
    <ul className="divide-y divide-border">
      {orders.map((order, index) => {
        // Incoming sales get a green inbound arrow; refunds an outbound red one.
        const DirectionIcon = order.refund ? ArrowUpRight : ArrowDownLeft
        return (
          <li key={`${order.id}-${index}`} className="py-3 first:pt-0 last:pb-0">
            <div className="flex gap-[18px]">
              <DirectionIcon
                className={cn(
                  'ml-1.5 size-5 shrink-0',
                  order.refund ? 'text-destructive' : 'text-green-600',
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold text-foreground">
                    {order.refund ? `Refund for ${order.id}` : order.id}
                  </p>
                  <p
                    className={cn(
                      'shrink-0 font-semibold tabular-nums',
                      order.amount < 0 ? 'text-destructive' : 'text-foreground',
                    )}
                  >
                    {formatSignedMoney(order.amount)}
                  </p>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatDate(order.date)} • {order.paymentMethod} • Fees: {formatMoney(order.fees)}
                </p>
                {expectedPayoutDate ? (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Expected payout: {formatDate(expectedPayoutDate)}
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function PayoutDetailPane({
  payout,
  onClose,
  onBack,
  hideClose = false,
  className,
}: {
  payout: Payout
  onClose: () => void
  // When provided, a back button is shown before the payout id in the header.
  onBack?: () => void
  hideClose?: boolean
  className?: string
}) {
  const isPending = PENDING_STATUSES.includes(payout.status)

  return (
    <aside
      className={cn(
        // Default (desktop) max height leaves room for the sticky toolbar above
        // the pane (top-[72px]) plus a 16px bottom margin. The full-page mobile
        // view overrides this with max-h-none.
        'max-h-[calc(100vh-88px)] w-[360px] overflow-y-auto rounded-lg border border-border',
        className,
      )}
    >
      <Tabs defaultValue="payout" className="gap-0">
        {/* Header: title row + the tab switcher */}
        <div className="space-y-4 p-4">
          {onBack ? (
            // Mobile full-page layout: back button pinned left, id centered.
            <div className="relative flex h-10 items-center justify-center">
              <Button
                variant="outline"
                size="icon-lg"
                aria-label="Back to earnings"
                className="absolute left-0 text-foreground"
                onClick={onBack}
              >
                <ArrowLeft className="size-5" />
              </Button>
              <TypographyH4 className="truncate px-12 text-center tabular-nums">
                {formatSignedMoney(payout.net)}
              </TypographyH4>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <TypographyH4 className="truncate tabular-nums">
                {formatSignedMoney(payout.net)}
              </TypographyH4>
              {hideClose ? null : (
                <Button
                  variant="secondary"
                  size="icon-lg"
                  aria-label="Close"
                  className="shrink-0 text-muted-foreground"
                  onClick={onClose}
                >
                  <X className="size-5" />
                </Button>
              )}
            </div>
          )}
          <TabsList className="w-full">
            <TabsTrigger value="payout">Payout</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="payout">
          <div className="border-t border-border p-4">
            {/* Running-balance summary: the net paid out with the gross and fees
                that produced it. */}
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Net payout</p>
              <p className="text-2xl font-semibold tabular-nums text-foreground">
                {formatSignedMoney(payout.net)}
              </p>
              <div className="mt-3 flex gap-6 text-sm">
                <span>
                  <span className="text-muted-foreground">Total </span>
                  <span className="tabular-nums text-foreground">{formatMoney(payout.totalBalance)}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="text-muted-foreground">Fees</span>
                  <span className="tabular-nums text-foreground">{formatMoney(payout.fees)}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="About fees"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Info className="size-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[240px]">
                      Includes the disbursement fee charged by the payment processor
                    </TooltipContent>
                  </Tooltip>
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-5">
              <DetailRow icon={CircleDot} label="Status">
                <PayoutStatusBadge status={payout.status} />
              </DetailRow>
              <DetailRow icon={Package} label="Orders">
                <p>{orderCountLabel(payout.orders.length)}</p>
              </DetailRow>
              {isPending ? null : (
                <DetailRow icon={Calendar} label="Payout date">
                  <p>{formatDate(payout.payoutDate)}</p>
                </DetailRow>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <div className="border-t border-border p-4">
            <PayoutOrdersList
              orders={payout.orders}
              expectedPayoutDate={isPending ? payout.payoutDate : undefined}
            />
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  )
}

const PAYOUT_COLUMNS: ColumnDef<Payout>[] = [
  {
    accessorKey: 'net',
    sortingFn: 'basic',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => (
      <p className="font-semibold text-foreground tabular-nums">
        {formatSignedMoney(row.original.net)}
      </p>
    ),
  },
  {
    accessorKey: 'payoutDate',
    sortingFn: 'datetime',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Payout date" />,
    cell: ({ row }) => (
      <p className="text-muted-foreground">{formatDate(row.original.payoutDate)}</p>
    ),
  },
  {
    id: 'orders',
    accessorFn: (payout) => payout.orders.length,
    sortingFn: 'basic',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Orders" />,
    cell: ({ row }) => (
      <p className="text-muted-foreground">{orderCountLabel(row.original.orders.length)}</p>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    enableSorting: false,
    cell: ({ row }) => <PayoutStatusBadge status={row.original.status} />,
  },
]

export function AdminOrdersEarningsPage() {
  const [selectedPayoutId, setSelectedPayoutId] = React.useState<string | null>(null)

  const selectedPayout = selectedPayoutId
    ? (PAYOUTS.find((payout) => payout.id === selectedPayoutId) ?? null)
    : null

  // Keep the last opened payout around so its content stays visible while the
  // pane animates closed.
  const [lastPayout, setLastPayout] = React.useState<Payout | null>(null)
  if (selectedPayout && selectedPayout !== lastPayout) setLastPayout(selectedPayout)
  const panePayout = selectedPayout ?? lastPayout

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="flex items-center gap-2 md:justify-between">
        <Button
          variant="outline"
          className="h-10 w-10 shrink-0 px-0 md:hidden"
          aria-label="Go back"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <TypographyH3 className="flex-1 text-center md:flex-none md:text-left">Earnings</TypographyH3>
        {/* Desktop: export aligned to the right of the title */}
        <Button
          variant="outline"
          className="hidden h-10 px-3 md:inline-flex"
          onClick={() => toast.success('Payouts exported')}
        >
          <Download className="size-4" />
          Export
        </Button>
        {/* Mobile: export as an icon button, right-aligned in the title row */}
        <Button
          variant="outline"
          className="h-10 w-10 shrink-0 px-0 md:hidden"
          aria-label="Export"
          onClick={() => toast.success('Payouts exported')}
        >
          <Download className="size-5" />
        </Button>
      </div>

      {/* Read-only summary metrics. Unlike the All Orders stat cards these are
          not filters, so they carry no button role or click handler. */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="justify-center py-4 shadow-none md:justify-start md:py-6">
          <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 md:grid md:items-start md:gap-1.5 md:px-6">
            <CardDescription>Running balance</CardDescription>
            <CardTitle className="text-sm font-semibold tabular-nums md:text-3xl">
              {formatMoney(RUNNING_BALANCE)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="justify-center py-4 shadow-none md:justify-start md:py-6">
          <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 md:grid md:items-start md:gap-1.5 md:px-6">
            <CardDescription>Next payout</CardDescription>
            <CardTitle className="text-sm font-semibold tabular-nums md:text-3xl">
              {NEXT_PAYOUT_DATE ? formatDate(NEXT_PAYOUT_DATE) : '—'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Mobile: payouts as a card list; tapping a card opens the full-page
          detail view. */}
      <div className="-mx-4 flex flex-col divide-y divide-border sm:-mx-6 md:hidden">
        {PAYOUTS.map((payout) => (
          <div
            key={payout.id}
            role="button"
            tabIndex={0}
            onClick={() => navigateToPayoutDetail(payout.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                navigateToPayoutDetail(payout.id)
              }
            }}
            className="flex w-full flex-col gap-1 px-4 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-6"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">{formatDate(payout.payoutDate)}</p>
              <PayoutStatusBadge status={payout.status} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-foreground">{orderCountLabel(payout.orders.length)}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground tabular-nums">
                  {formatSignedMoney(payout.net)}
                </p>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}
        {PAYOUTS.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-6">
            No payouts found.
          </p>
        ) : null}
      </div>

      {/* Desktop: payouts data table + detail side pane */}
      <div className="hidden md:flex">
        <div className="min-w-0 flex-1">
          <DataTable
            columns={PAYOUT_COLUMNS}
            data={PAYOUTS}
            defaultSorting={[{ id: 'payoutDate', desc: true }]}
            getRowId={(payout) => payout.id}
            onRowClick={(payout) => setSelectedPayoutId(payout.id)}
            isRowActive={(payout) => payout.id === selectedPayoutId}
            tableClassName={selectedPayout ? 'min-w-[720px]' : undefined}
          />
        </div>
        {/* Pane stays mounted so its width/margin can animate in and out, which
            in turn smoothly resizes the flex table beside it. */}
        <div
          className={cn(
            'sticky top-4 shrink-0 self-start overflow-hidden transition-[width,margin] duration-300 ease-in-out',
            selectedPayout ? 'ml-6 w-[360px]' : 'ml-0 w-0',
          )}
        >
          {panePayout ? (
            <PayoutDetailPane
              payout={panePayout}
              onClose={() => setSelectedPayoutId(null)}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

// Full-page payout detail, used on mobile where tapping a card opens its own
// page (instead of a side pane). The payout id comes from the query param.
export function AdminPayoutDetailPage() {
  const payoutId =
    typeof window === 'undefined'
      ? null
      : new URLSearchParams(window.location.search).get('payout')
  const payout = PAYOUTS.find((p) => p.id === payoutId)

  // Opening a detail page should always start at the top, regardless of how far
  // the list was scrolled when the card was tapped.
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  function goBack() {
    window.history.pushState(null, '', '/admin/orders/earnings')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return payout ? (
    <PayoutDetailPane
      payout={payout}
      onClose={goBack}
      onBack={goBack}
      hideClose
      className="max-h-none w-full overflow-visible rounded-none border-0"
    />
  ) : (
    <p className="px-4 text-sm text-muted-foreground">Payout not found.</p>
  )
}
