import * as React from 'react'
import {
  ArrowLeft,
  Banknote,
  Calendar,
  ChevronRight,
  CircleDot,
  Locate,
  MapPin,
  Package,
  Search,
  Truck,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import LalamoveIcon from '@/assets/lalamove.svg?react'

import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TypographyH3, TypographyH4 } from '@/components/ui/typography'
import type { ColumnDef } from '@tanstack/react-table'

type DeliveryStatus =
  | 'Assigning driver'
  | 'Ongoing'
  | 'Picked up'
  | 'Completed'
  | 'Canceled'
  | 'Rejected'
  | 'Expired'

// Status is read-only on this page — it comes from the delivery provider, so
// it renders as a badge rather than the orders page's status dropdown.
// Assigning driver mirrors the Pending pill (primary/amber), Ongoing/Picked up
// mirror the Approved pill (blue), Completed mirrors Fulfilled (secondary/grey)
// and the terminal failures share the destructive (red) treatment.
const STATUS_BADGE_CLASS: Record<DeliveryStatus, string> = {
  'Assigning driver': 'border-transparent bg-primary/10 text-amber-700',
  Ongoing: 'border-transparent bg-[#2040B0]/10 text-[#2040B0]',
  'Picked up': 'border-transparent bg-[#2040B0]/10 text-[#2040B0]',
  Completed: 'border-transparent bg-secondary text-secondary-foreground',
  Canceled: 'border-transparent bg-destructive/10 text-destructive',
  Rejected: 'border-transparent bg-destructive/10 text-destructive',
  Expired: 'border-transparent bg-destructive/10 text-destructive',
}

// Deliveries still in flight — these back the "Ongoing" toolbar tab and decide
// whether the booking can still be canceled.
const ACTIVE_STATUSES: DeliveryStatus[] = ['Assigning driver', 'Ongoing', 'Picked up']

function DeliveryStatusBadge({ status, className }: { status: DeliveryStatus; className?: string }) {
  return <Badge className={cn('text-sm', STATUS_BADGE_CLASS[status], className)}>{status}</Badge>
}

type DeliveryStop = { orderId: string; address: string }

type Delivery = {
  id: string
  provider: 'Lalamove'
  createdAt: Date
  deliverAt: Date
  status: DeliveryStatus
  price: number
  stops: DeliveryStop[]
}

// The store's pickup location — the first stop of every route.
const PICKUP_ADDRESS =
  '113 Doña Soledad Ave, Parañaque, 1709 Metro Manila, Philippines, PIN: Ciento Cookies, Bicutan, Parañaque'

const STOP_ADDRESSES = [
  'Asiawealth Tower I Condominium, 1836 Leveriza, Pasay, Metro Manila, Philippines, 1836 leveriza st. pasay city. Unit2904 asiawealth tower. Brgy 34',
  'One Ayala Tower 2, Ayala Ave, Makati, Metro Manila, Philippines, 26th floor reception',
  'Uptown Parksuites Tower 1, 36th St, Taguig, Metro Manila, Philippines, Unit 1108, leave with the guard',
  'SM Aura Premier, McKinley Pkwy, Taguig, Metro Manila, Philippines, Concierge counter, ground floor',
  'The Residences at Greenbelt, Esperanza St, Makati, Metro Manila, Philippines, Lobby A, Unit 2210',
  'Solaire Resort North, 1 Solaire Blvd, Quezon City, Metro Manila, Philippines, Bell desk, main lobby',
]

const STOP_ORDER_IDS = [
  'MAR1031',
  'ALB1042',
  'JUL1053',
  'RIC1064',
  'ANA1075',
  'CAR1086',
  'BEA1097',
  'LEO1108',
]

// Deterministic example stops: delivery n gets `count` consecutive entries from
// the order id / address pools, so the data is varied but stable across reloads.
function makeStops(seed: number, count: number): DeliveryStop[] {
  return Array.from({ length: count }, (_, i) => ({
    orderId: STOP_ORDER_IDS[(seed + i) % STOP_ORDER_IDS.length],
    address: STOP_ADDRESSES[(seed + i) % STOP_ADDRESSES.length],
  }))
}

function makeDelivery(
  seed: number,
  id: string,
  status: DeliveryStatus,
  deliverAt: Date,
  price: number,
  orderCount: number,
): Delivery {
  return {
    id,
    provider: 'Lalamove',
    // Bookings are created shortly before the scheduled delivery time.
    createdAt: new Date(deliverAt.getTime() - 45 * 60 * 1000),
    deliverAt,
    status,
    price,
    stops: makeStops(seed, orderCount),
  }
}

const DELIVERIES: Delivery[] = [
  makeDelivery(14, '184490275513', 'Assigning driver', new Date(2026, 6, 13, 11, 40), 265, 2),
  makeDelivery(15, '186732018494', 'Ongoing', new Date(2026, 6, 12, 12, 15), 198, 1),
  makeDelivery(16, '182085467320', 'Picked up', new Date(2026, 5, 30, 13, 20), 372, 3),
  makeDelivery(17, '187314906258', 'Completed', new Date(2026, 5, 18, 12, 5), 244, 2),
  makeDelivery(0, '181087864177', 'Ongoing', new Date(2025, 4, 1, 12, 2), 340, 2),
  makeDelivery(1, '183056865962', 'Ongoing', new Date(2025, 3, 27, 12, 22), 193, 1),
  makeDelivery(2, '187856862901', 'Ongoing', new Date(2025, 3, 27, 12, 18), 166, 1),
  makeDelivery(3, '182946313307', 'Picked up', new Date(2025, 3, 20, 11, 45), 405, 3),
  makeDelivery(4, '184023917465', 'Completed', new Date(2025, 3, 12, 13, 5), 289, 2),
  makeDelivery(5, '186115209834', 'Completed', new Date(2025, 2, 30, 12, 40), 152, 1),
  makeDelivery(6, '188774036221', 'Canceled', new Date(2025, 2, 18, 14, 10), 210, 1),
  makeDelivery(7, '185530968412', 'Rejected', new Date(2025, 1, 22, 10, 25), 176, 2),
  makeDelivery(8, '189381650078', 'Expired', new Date(2025, 1, 9, 12, 55), 143, 1),
  makeDelivery(9, '180257491366', 'Completed', new Date(2025, 0, 27, 13, 35), 320, 2),
  makeDelivery(10, '183362851313', 'Ongoing', new Date(2024, 7, 28, 12, 57), 119, 1),
  makeDelivery(11, '181459844483', 'Assigning driver', new Date(2024, 6, 5, 12, 53), 281, 2),
  makeDelivery(12, '181529829842', 'Assigning driver', new Date(2023, 5, 3, 13, 29), 271, 1),
  makeDelivery(13, '181409828016', 'Assigning driver', new Date(2023, 4, 14, 15, 8), 233, 1),
]

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

function formatDateTime(date: Date) {
  return `${formatDate(date)}, ${formatTime(date)}`
}

function formatPrice(amount: number) {
  return `$${amount.toLocaleString()}`
}

// Client-side navigation to the full-page delivery detail view, used on mobile.
// The delivery id rides in the query string since the router matches pathname only.
function navigateToDeliveryDetail(deliveryId: string) {
  window.history.pushState(
    null,
    '',
    `/admin/orders/deliveries/detail?delivery=${encodeURIComponent(deliveryId)}`,
  )
  window.dispatchEvent(new PopStateEvent('popstate'))
}

// Lucide icons and the SVGR-imported Lalamove icon both render as components
// taking a className, so this covers either.
type IconComponent = React.ComponentType<{ className?: string }>

// Icon on the left, a muted label on top and the value below — mirrors the
// order detail pane's layout.
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

// Confirmation for "Cancel booking". Canceling only affects the provider
// booking — order statuses are not changed from this page.
function CancelBookingDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel delivery?</AlertDialogTitle>
          <AlertDialogDescription>
            Lalamove allows cancellation only if a driver has not been assigned, or within 5 min
            after driver assignment.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep booking</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              onOpenChange(false)
              toast.success('Delivery canceled')
            }}
          >
            Cancel booking
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function DeliveryDetailPane({
  delivery,
  onClose,
  onBack,
  hideClose = false,
  className,
}: {
  delivery: Delivery
  onClose: () => void
  // When provided, a back button is shown before the delivery id in the header.
  onBack?: () => void
  hideClose?: boolean
  className?: string
}) {
  const [cancelOpen, setCancelOpen] = React.useState(false)
  const canCancel = ACTIVE_STATUSES.includes(delivery.status)

  // The route always starts at the store's pickup location, followed by one
  // stop per order in the delivery.
  const routeStops = [
    { title: 'Your location', address: PICKUP_ADDRESS, pickup: true },
    ...delivery.stops.map((stop) => ({ title: stop.orderId, address: stop.address, pickup: false })),
  ]

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
      <Tabs defaultValue="delivery" className="gap-0">
        {/* Header: title row + the tab switcher */}
        <div className="space-y-4 p-4">
          {onBack ? (
            // Mobile full-page layout: back button pinned left, id centered.
            <div className="relative flex h-10 items-center justify-center">
              <Button
                variant="outline"
                size="icon-lg"
                aria-label="Back to deliveries"
                className="absolute left-0 text-foreground"
                onClick={onBack}
              >
                <ArrowLeft className="size-5" />
              </Button>
              <TypographyH4 className="truncate px-12 text-center">{delivery.id}</TypographyH4>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <TypographyH4 className="truncate">{delivery.id}</TypographyH4>
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
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            <TabsTrigger value="route">Route</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="delivery">
          <div className="space-y-5 border-t border-border p-4">
            <DetailRow icon={CircleDot} label="Status">
              <DeliveryStatusBadge status={delivery.status} />
            </DetailRow>
            <DetailRow icon={Package} label="Orders">
              <p>{delivery.stops.length}</p>
            </DetailRow>
            <DetailRow icon={Calendar} label="Created">
              <p>{formatDateTime(delivery.createdAt)}</p>
            </DetailRow>
            <DetailRow icon={Truck} label="Delivery">
              <p>{formatDateTime(delivery.deliverAt)}</p>
            </DetailRow>
            <DetailRow icon={Banknote} label="Price">
              <p className="font-medium">{formatPrice(delivery.price)}</p>
            </DetailRow>
            <DetailRow icon={LalamoveIcon} label="Provider">
              <p>{delivery.provider}</p>
            </DetailRow>
          </div>
          <div className="flex items-center gap-2 p-4 pt-2">
            {canCancel ? (
              <Button
                variant="destructive"
                className="h-10 flex-1"
                onClick={() => setCancelOpen(true)}
              >
                Cancel booking
              </Button>
            ) : null}
            <Button className="h-10 flex-1">View in Lalamove</Button>
          </div>
        </TabsContent>

        <TabsContent value="route">
          <div className="border-t border-border p-4">
            <ol>
              {routeStops.map((stop, idx) => {
                const isLast = idx === routeStops.length - 1
                // The pickup point uses a "locate" marker; drop-offs use map pins,
                // with the final destination highlighted in the primary color.
                const Icon = stop.pickup ? Locate : MapPin
                const iconClass = stop.pickup
                  ? 'text-primary'
                  : isLast
                    ? 'text-primary'
                    : 'text-muted-foreground'
                return (
                  <li key={`${stop.title}-${idx}`} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <Icon className={cn('mt-0.5 size-4 shrink-0', iconClass)} />
                      {!isLast ? <span className="mt-1 w-px flex-1 bg-border" /> : null}
                    </div>
                    <div className={cn('min-w-0 leading-snug', !isLast && 'pb-5')}>
                      <p className="text-base font-semibold text-foreground">{stop.title}</p>
                      <p className="text-sm text-muted-foreground">{stop.address}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </TabsContent>
      </Tabs>

      <CancelBookingDialog open={cancelOpen} onOpenChange={setCancelOpen} />
    </aside>
  )
}

const DELIVERY_COLUMNS: ColumnDef<Delivery>[] = [
  {
    accessorKey: 'id',
    header: 'Delivery ID',
    enableSorting: false,
    cell: ({ row }) => (
      <p className="font-semibold text-foreground">{row.original.id}</p>
    ),
  },
  {
    accessorKey: 'createdAt',
    sortingFn: 'datetime',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => (
      <p className="text-muted-foreground">{formatDate(row.original.createdAt)}</p>
    ),
  },
  {
    accessorKey: 'deliverAt',
    sortingFn: 'datetime',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Delivery" />,
    cell: ({ row }) => (
      <p className="text-muted-foreground">{formatDateTime(row.original.deliverAt)}</p>
    ),
  },
  {
    id: 'orders',
    accessorFn: (delivery) => delivery.stops.length,
    sortingFn: 'basic',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Orders" />,
    cell: ({ row }) => (
      <p className="text-muted-foreground tabular-nums">{row.original.stops.length}</p>
    ),
  },
  {
    accessorKey: 'price',
    sortingFn: 'basic',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
    cell: ({ row }) => (
      <p className="text-muted-foreground">{formatPrice(row.original.price)}</p>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Delivery status',
    enableSorting: false,
    cell: ({ row }) => <DeliveryStatusBadge status={row.original.status} />,
  },
]

export function AdminOrdersDeliveriesPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusTab, setStatusTab] = React.useState('all')
  const [selectedDeliveryId, setSelectedDeliveryId] = React.useState<string | null>(null)

  const selectedDelivery = selectedDeliveryId
    ? (DELIVERIES.find((delivery) => delivery.id === selectedDeliveryId) ?? null)
    : null

  // Keep the last opened delivery around so its content stays visible while the
  // pane animates closed.
  const [lastDelivery, setLastDelivery] = React.useState<Delivery | null>(null)
  if (selectedDelivery && selectedDelivery !== lastDelivery) setLastDelivery(selectedDelivery)
  const paneDelivery = selectedDelivery ?? lastDelivery

  // The "Ongoing" tab narrows to in-flight deliveries. The search query matches
  // the delivery id or any order id in the delivery.
  const filteredDeliveries = React.useMemo(() => {
    const search = searchQuery.trim().toLowerCase()
    return DELIVERIES.filter((delivery) => {
      if (statusTab === 'ongoing' && !ACTIVE_STATUSES.includes(delivery.status)) return false
      if (search) {
        const haystack = [delivery.id, delivery.provider, ...delivery.stops.map((stop) => stop.orderId)]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(search)) return false
      }
      return true
    })
  }, [statusTab, searchQuery])

  const toolbar = (
    <>
      <InputGroup className="h-10 w-full md:w-auto md:max-w-[400px] md:flex-1">
        <InputGroupAddon>
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search by delivery or order ID"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        {searchQuery ? (
          <InputGroupAddon className="pr-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Clear search"
              onClick={() => setSearchQuery('')}
            >
              <X className="size-4 text-muted-foreground" />
            </Button>
          </InputGroupAddon>
        ) : null}
      </InputGroup>
      <Tabs value={statusTab} onValueChange={setStatusTab} className="w-full md:w-auto">
        <TabsList className="h-10 w-full md:w-auto">
          <TabsTrigger value="all" className="flex-1 px-4 md:flex-none">
            All
          </TabsTrigger>
          <TabsTrigger value="ongoing" className="flex-1 px-4 md:flex-none">
            Ongoing
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </>
  )

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <div className="flex items-center md:block">
        <Button
          variant="outline"
          className="h-10 w-10 shrink-0 px-0 md:hidden"
          aria-label="Go back"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <TypographyH3 className="flex-1 text-center md:flex-none md:text-left">Deliveries</TypographyH3>
        {/* Balances the back button so the title is truly centered */}
        <div className="size-10 shrink-0 md:hidden" />
      </div>

      {/* Mobile toolbar: search on its own row, then the All/Ongoing tabs.
          Sticks to the top so it stays reachable while the list scrolls. Spans
          the full viewport width (-mx + matching px) so the full-bleed card
          list can't peek through the horizontal padding behind it. */}
      <div className="sticky top-0 z-20 -mx-4 flex flex-col gap-2 bg-background px-4 pb-2 pt-2 sm:-mx-6 sm:px-6 md:hidden">
        {toolbar}
      </div>

      {/* Desktop toolbar: search field + tabs inline. Sticks to the top so the
          controls stay reachable while the table scrolls beneath it. */}
      <div className="sticky top-0 z-20 hidden items-center gap-2 bg-background py-4 md:flex">
        {toolbar}
      </div>

      {/* Mobile: deliveries as a card list; tapping a card opens the full-page
          detail view. */}
      <div className="-mx-4 flex flex-col divide-y divide-border sm:-mx-6 md:hidden">
        {filteredDeliveries.map((delivery) => (
          <div
            key={delivery.id}
            role="button"
            tabIndex={0}
            onClick={() => navigateToDeliveryDetail(delivery.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                navigateToDeliveryDetail(delivery.id)
              }
            }}
            className="flex w-full flex-col gap-1 px-4 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-6"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">{formatDateTime(delivery.deliverAt)}</p>
              <DeliveryStatusBadge status={delivery.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {delivery.stops.length} {delivery.stops.length === 1 ? 'order' : 'orders'}
            </p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-normal text-foreground">{delivery.id}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{formatPrice(delivery.price)}</p>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}
        {filteredDeliveries.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-6">
            No deliveries found.
          </p>
        ) : null}
      </div>

      {/* Desktop: deliveries data table + detail side pane */}
      <div className="hidden md:flex">
        <div className="min-w-0 flex-1">
          <DataTable
            columns={DELIVERY_COLUMNS}
            data={filteredDeliveries}
            defaultSorting={[{ id: 'createdAt', desc: true }]}
            getRowId={(delivery) => delivery.id}
            onRowClick={(delivery) => setSelectedDeliveryId(delivery.id)}
            isRowActive={(delivery) => delivery.id === selectedDeliveryId}
            tableClassName={selectedDelivery ? 'min-w-[820px]' : undefined}
          />
        </div>
        {/* Pane stays mounted so its width/margin can animate in and out, which
            in turn smoothly resizes the flex table beside it. */}
        <div
          className={cn(
            // top-[72px] clears the sticky toolbar: h-10 controls (40px) plus
            // its py-4 (32px) white space, so the pane pins just under the bar.
            'sticky top-[72px] shrink-0 self-start overflow-hidden transition-[width,margin] duration-300 ease-in-out',
            selectedDelivery ? 'ml-6 w-[360px]' : 'ml-0 w-0',
          )}
        >
          {paneDelivery ? (
            <DeliveryDetailPane
              delivery={paneDelivery}
              onClose={() => setSelectedDeliveryId(null)}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

// Full-page delivery detail, used on mobile where tapping a card opens its own
// page (instead of a side pane). The delivery id comes from the query param.
export function AdminDeliveryDetailPage() {
  const deliveryId =
    typeof window === 'undefined'
      ? null
      : new URLSearchParams(window.location.search).get('delivery')
  const delivery = DELIVERIES.find((d) => d.id === deliveryId)

  // Opening a detail page should always start at the top, regardless of how far
  // the list was scrolled when the card was tapped.
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  function goBack() {
    window.history.pushState(null, '', '/admin/orders/deliveries')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return delivery ? (
    <DeliveryDetailPane
      delivery={delivery}
      onClose={goBack}
      onBack={goBack}
      hideClose
      className="max-h-none w-full overflow-visible rounded-none border-0"
    />
  ) : (
    <p className="px-4 text-sm text-muted-foreground">Delivery not found.</p>
  )
}
