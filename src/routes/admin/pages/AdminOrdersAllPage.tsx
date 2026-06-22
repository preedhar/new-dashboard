import * as React from 'react'
import {
  Archive,
  Calendar as CalendarIcon,
  ChevronDown,
  CircleCheck,
  Copy,
  Download,
  FileDown,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Store,
  Truck,
  X,
  type LucideIcon,
} from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import globeIcon from '@/assets/channels/globe.png'
import monitorIcon from '@/assets/channels/monitor.png'
import qrIcon from '@/assets/channels/qr.png'
import adminIcon from '@/assets/channels/admin.png'
import pendingIcon from '@/assets/status/pending.svg'
import paidIcon from '@/assets/status/paid.svg'
import fulfilledIcon from '@/assets/status/fulfilled.svg'
import cancelledIcon from '@/assets/status/cancelled.svg'
import rejectedIcon from '@/assets/status/rejected.svg'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TypographyH3 } from '@/components/ui/typography'
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table'

type OrderStat = {
  label: string
  count: number
}

const ORDER_STATS: OrderStat[] = [
  { label: 'All', count: 1284 },
  { label: 'For today', count: 48 },
  { label: 'To approve', count: 12 },
  { label: 'To fulfill', count: 27 },
]

type FilterOption = { label: string; icon?: LucideIcon; iconSrc?: string }

const CHANNEL_ICON_SRC: Record<Channel, string> = {
  'Online Store': globeIcon,
  POS: monitorIcon,
  'QR Code Ordering': qrIcon,
  'Admin Dashboard': adminIcon,
}

const CHANNEL_OPTIONS: FilterOption[] = (Object.keys(CHANNEL_ICON_SRC) as Channel[]).map(
  (label) => ({ label, iconSrc: CHANNEL_ICON_SRC[label] }),
)
const FULFILLMENT_TYPE_OPTIONS: FilterOption[] = [
  { label: 'Delivery Zone 1 (0-3km)', icon: Truck },
  { label: 'Delivery Zone 2 (3-5Km)', icon: Truck },
  { label: 'Delivery Zone 3 (5+ KM)', icon: Truck },
  { label: 'Pickup method 1', icon: ShoppingBag },
  { label: 'Pickup method 2', icon: ShoppingBag },
  { label: 'In-store', icon: Store },
]
const STATUS_OPTIONS: FilterOption[] = [
  { label: 'Pending', iconSrc: pendingIcon },
  { label: 'Approved', iconSrc: paidIcon },
  { label: 'Fulfilled', iconSrc: fulfilledIcon },
  { label: 'Canceled', iconSrc: cancelledIcon },
  { label: 'Rejected', iconSrc: rejectedIcon },
]
const ACTIVE_OPTIONS = ['Active', 'Incomplete', 'Archived']

const ACTION_GROUPS: { label: string; icon: LucideIcon }[][] = [
  [
    { label: 'Edit', icon: Pencil },
    { label: 'Copy', icon: Copy },
    { label: 'Delivery', icon: Truck },
  ],
  [
    { label: 'Mark as Fulfilled', icon: CircleCheck },
    { label: 'Archive', icon: Archive },
  ],
  [
    { label: 'Export for Lalamove', icon: FileDown },
    { label: 'Export to CSV', icon: Download },
  ],
]

// Export to CSV is always available. With no selection only it is enabled;
// Edit requires exactly one selected order; everything else needs at least one.
function isActionDisabled(label: string, selectedCount: number) {
  if (label === 'Export to CSV') return false
  if (selectedCount === 0) return true
  if (label === 'Edit' && selectedCount > 1) return true
  return false
}

type OrderStatus = 'Pending' | 'Approved' | 'Paid' | 'Fulfilled' | 'Canceled' | 'Rejected'

const STATUS_ICON_SRC: Record<OrderStatus, string> = {
  Pending: pendingIcon,
  Approved: paidIcon,
  Paid: paidIcon,
  Fulfilled: fulfilledIcon,
  Canceled: cancelledIcon,
  Rejected: rejectedIcon,
}

const STATUS_MENU: OrderStatus[] = ['Pending', 'Approved', 'Fulfilled', 'Canceled', 'Rejected']

type FulfillmentMethod = { label: string; icon: LucideIcon }

type Channel = 'Online Store' | 'POS' | 'QR Code Ordering' | 'Admin Dashboard'

type Order = {
  id: string
  channel: Channel
  customer: string
  orderedAt: Date
  total: number
  items: string[]
  fulfillAt: Date
  fulfillment: FulfillmentMethod
  status: OrderStatus
  swatch: string
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`
}

const CHANNELS: Channel[] = ['Online Store', 'POS', 'QR Code Ordering', 'Admin Dashboard']

// POS and QR Code Ordering can only be fulfilled in-store.
const IN_STORE_ONLY_CHANNELS: Channel[] = ['POS', 'QR Code Ordering']

const FULFILLMENT_ICONS: Record<string, LucideIcon> = Object.fromEntries(
  FULFILLMENT_TYPE_OPTIONS.map((option) => [option.label, option.icon ?? Store]),
)

const SELECTABLE_FULFILLMENTS = FULFILLMENT_TYPE_OPTIONS.map((option) => option.label)

const CUSTOMERS = [
  'Aiden Carter', 'Chloe Mitchell', 'Teresa Nakamura', 'Maya Rodriguez', 'David Kim',
  'Lily Chen', 'Sofia Rossi', 'Noah Patel', 'Emma Johnson', 'Lucas Müller',
  'Olivia Brown', 'Mason Lee', 'Ava Garcia', 'Ethan Wong', 'Isabella Silva',
  'Jack Thompson', 'Mia Anderson', 'Daniel Cohen', 'Grace Park', 'Liam Walker',
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

const STATUSES: OrderStatus[] = ['Pending', 'Approved', 'Paid', 'Fulfilled', 'Canceled', 'Rejected']

const SWATCHES = [
  'bg-amber-100 text-amber-600',
  'bg-yellow-100 text-yellow-600',
  'bg-orange-100 text-orange-600',
  'bg-rose-100 text-rose-600',
  'bg-fuchsia-100 text-fuchsia-600',
  'bg-sky-100 text-sky-600',
  'bg-emerald-100 text-emerald-600',
  'bg-violet-100 text-violet-600',
  'bg-blue-100 text-blue-600',
  'bg-teal-100 text-teal-600',
]

const ORDERS: Order[] = Array.from({ length: 40 }, (_, i) => {
  const channel = CHANNELS[i % CHANNELS.length]
  const fulfillmentLabel = IN_STORE_ONLY_CHANNELS.includes(channel)
    ? 'In-store'
    : SELECTABLE_FULFILLMENTS[(i * 3) % SELECTABLE_FULFILLMENTS.length]
  const customer = CUSTOMERS[i % CUSTOMERS.length]
  const orderedAt = new Date(2027, 5, 20 - Math.floor(i / 2), 8 + ((i * 5) % 12), (i * 13) % 60)
  const fulfillAt = new Date(orderedAt.getTime() + (12 + (i % 3) * 6) * 60 * 60 * 1000)

  return {
    id: `${customer.slice(0, 3).toUpperCase()}${10 + i}`,
    channel,
    customer,
    orderedAt,
    total: Math.round((i * 37) % 9000) / 100 + 2.5,
    items: ITEM_SETS[i % ITEM_SETS.length],
    fulfillAt,
    fulfillment: { label: fulfillmentLabel, icon: FULFILLMENT_ICONS[fulfillmentLabel] },
    status: STATUSES[(i * 7) % STATUSES.length],
    swatch: SWATCHES[i % SWATCHES.length],
  }
})

const FILTER_BUTTON_CLASS = 'h-10 px-3 font-normal text-muted-foreground'
const FILTER_BUTTON_ACTIVE_CLASS = 'border-foreground text-foreground'

function ClearFilterButton({
  label,
  onClear,
}: {
  label: string
  onClear: () => void
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={`Clear ${label} filter`}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation()
        event.preventDefault()
        onClear()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClear()
        }
      }}
      className="-mr-1 inline-flex size-5 items-center justify-center rounded-sm text-foreground hover:bg-muted"
    >
      <X className="size-4" />
    </span>
  )
}

function SelectFilter({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Array<string | FilterOption>
  value: string | null
  onChange: (value: string | null) => void
}) {
  const normalized = options.map((option) =>
    typeof option === 'string' ? { label: option } : option,
  )
  const selected = value
  const active = selected !== null
  const selectedOption = normalized.find((option) => option.label === selected)
  const SelectedIcon = selectedOption?.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(FILTER_BUTTON_CLASS, active && FILTER_BUTTON_ACTIVE_CLASS)}
        >
          {selectedOption?.iconSrc ? (
            <img src={selectedOption.iconSrc} alt="" className="size-4" />
          ) : SelectedIcon ? (
            <SelectedIcon className="size-4 text-muted-foreground" />
          ) : null}
          {selected ?? label}
          {active ? (
            <ClearFilterButton label={label} onClear={() => onChange(null)} />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-auto min-w-44">
        <DropdownMenuRadioGroup value={selected ?? ''} onValueChange={onChange}>
          {normalized.map((option) => {
            const Icon = option.icon
            return (
              <DropdownMenuRadioItem
                key={option.label}
                value={option.label}
                className="whitespace-nowrap"
              >
                {option.iconSrc ? (
                  <img src={option.iconSrc} alt="" className="size-4" />
                ) : Icon ? (
                  <Icon className="size-4 text-muted-foreground" />
                ) : null}
                {option.label}
              </DropdownMenuRadioItem>
            )
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ActiveFilter({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const active = value !== 'Active'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(FILTER_BUTTON_CLASS, active && FILTER_BUTTON_ACTIVE_CLASS)}
        >
          {value}
          {active ? (
            <ClearFilterButton label="Active" onClear={() => onChange('Active')} />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {ACTIVE_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              {option}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function rangesEqual(a?: DateRange, b?: DateRange) {
  return (
    a?.from?.getTime() === b?.from?.getTime() &&
    a?.to?.getTime() === b?.to?.getTime()
  )
}

function DatesFilter({
  field,
  onFieldChange,
  appliedRange,
  onApply,
}: {
  field: string
  onFieldChange: (value: string) => void
  appliedRange: DateRange | undefined
  onApply: (range: DateRange | undefined) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [range, setRange] = React.useState<DateRange | undefined>(appliedRange)
  const [showCalendar, setShowCalendar] = React.useState(false)

  const active = Boolean(appliedRange?.from)
  const canClear = Boolean(range?.from || appliedRange?.from)
  const canApply = !rangesEqual(range, appliedRange)

  const rangeLabel =
    range?.from && range?.to
      ? `${formatDate(range.from)} – ${formatDate(range.to)}`
      : range?.from
        ? formatDate(range.from)
        : 'Select dates'

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setRange(appliedRange)
      setShowCalendar(false)
    }
  }

  function clearAll() {
    setRange(undefined)
    onApply(undefined)
    setShowCalendar(false)
  }

  function apply() {
    onApply(range)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(FILTER_BUTTON_CLASS, active && FILTER_BUTTON_ACTIVE_CLASS)}
        >
          {active ? 'Dates: Selected' : 'Dates'}
          {active ? (
            <ClearFilterButton label="Dates" onClear={clearAll} />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[300px] p-3">
        <Tabs value={field} onValueChange={onFieldChange}>
          <TabsList className="w-full">
            <TabsTrigger value="fulfillment">Fulfillment date</TabsTrigger>
            <TabsTrigger value="order">Order date</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-3">
          <Popover open={showCalendar} onOpenChange={setShowCalendar}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-10 w-full justify-start px-3 font-normal"
              >
                <CalendarIcon className="size-4 text-muted-foreground" />
                <span className={range?.from ? '' : 'text-muted-foreground'}>{rangeLabel}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
              <Calendar
                mode="range"
                selected={range}
                onSelect={setRange}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            className="h-10 px-3"
            onClick={clearAll}
            disabled={!canClear}
          >
            Clear
          </Button>
          <Button className="h-10 px-3" onClick={apply} disabled={!canApply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-10 w-[132px] px-3 font-normal">
          <img src={STATUS_ICON_SRC[status]} alt="" className="size-5" />
          {status}
          <ChevronDown className="ml-auto size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {STATUS_MENU.map((option) => (
          <DropdownMenuItem key={option}>
            <img src={STATUS_ICON_SRC[option]} alt="" className="size-4" />
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const ORDER_COLUMNS: ColumnDef<Order>[] = [
  {
    id: 'select',
    enableSorting: false,
    meta: { className: 'w-10', headerClassName: 'w-10' },
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
        aria-label="Select all orders"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        aria-label={`Select order ${row.original.id}`}
      />
    ),
  },
  {
    accessorKey: 'id',
    header: 'Order',
    enableSorting: false,
    cell: ({ row }) => {
      const order = row.original
      return (
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <img
                src={CHANNEL_ICON_SRC[order.channel]}
                alt={order.channel}
                className="size-9 shrink-0"
              />
            </TooltipTrigger>
            <TooltipContent>{order.channel}</TooltipContent>
          </Tooltip>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{order.id}</p>
            <p className="text-sm text-muted-foreground">{order.customer}</p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'orderedAt',
    sortingFn: 'datetime',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Order date" />,
    cell: ({ row }) => (
      <div className="leading-tight text-muted-foreground">
        <p>{formatDate(row.original.orderedAt)}</p>
        <p className="text-sm">{formatTime(row.original.orderedAt)}</p>
      </div>
    ),
  },
  {
    accessorKey: 'total',
    sortingFn: 'basic',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
    cell: ({ row }) => (
      <p className="font-normal text-muted-foreground tabular-nums">
        {formatCurrency(row.original.total)}
      </p>
    ),
  },
  {
    accessorKey: 'items',
    header: 'Items',
    enableSorting: false,
    cell: ({ row }) => (
      <ul className="space-y-0.5 text-sm text-muted-foreground">
        {row.original.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    ),
  },
  {
    accessorKey: 'fulfillAt',
    sortingFn: 'datetime',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fulfillment" />,
    cell: ({ row }) => {
      const Icon = row.original.fulfillment.icon
      return (
        <div className="flex items-start gap-2 text-muted-foreground">
          <Icon className="mt-0.5 size-4 shrink-0" />
          <div className="leading-tight">
            <p>{formatDate(row.original.fulfillAt)}</p>
            <p className="text-sm">{formatTime(row.original.fulfillAt)}</p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    enableSorting: false,
    meta: { className: 'text-right', headerClassName: 'text-right' },
    header: 'Status',
    cell: ({ row }) => (
      <div className="flex justify-end">
        <StatusPill status={row.original.status} />
      </div>
    ),
  },
]

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function isSameDay(a?: Date, b?: Date) {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function AdminOrdersAllPage() {
  const [searching, setSearching] = React.useState(false)
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const selectedCount = Object.keys(rowSelection).length

  const [channel, setChannel] = React.useState<string | null>(null)
  const [fulfillmentType, setFulfillmentType] = React.useState<string | null>(null)
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null)
  const [activeFilter, setActiveFilter] = React.useState('Active')
  const [dateField, setDateField] = React.useState('fulfillment')
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)

  function resetFilters() {
    setChannel(null)
    setFulfillmentType(null)
    setStatusFilter(null)
    setActiveFilter('Active')
    setDateField('fulfillment')
    setDateRange(undefined)
  }

  function applyCard(label: string) {
    resetFilters()
    if (label === 'For today') {
      const today = startOfDay(new Date())
      setDateField('fulfillment')
      setDateRange({ from: today, to: today })
    } else if (label === 'To approve') {
      setStatusFilter('Pending')
    } else if (label === 'To fulfill') {
      setStatusFilter('Approved')
    }
  }

  // Which card (if any) matches the currently applied filters.
  const baseEmpty =
    channel === null && fulfillmentType === null && activeFilter === 'Active'
  const noDate = !dateRange?.from
  const today = startOfDay(new Date())
  let activeCard: string | null = null
  if (baseEmpty && statusFilter === null && noDate) {
    activeCard = 'All'
  } else if (
    baseEmpty &&
    statusFilter === null &&
    dateField === 'fulfillment' &&
    isSameDay(dateRange?.from, today) &&
    isSameDay(dateRange?.to, today)
  ) {
    activeCard = 'For today'
  } else if (baseEmpty && noDate && statusFilter === 'Pending') {
    activeCard = 'To approve'
  } else if (baseEmpty && noDate && statusFilter === 'Approved') {
    activeCard = 'To fulfill'
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <TypographyH3>All Orders</TypographyH3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ORDER_STATS.map((stat) => (
          <Card
            key={stat.label}
            role="button"
            tabIndex={0}
            onClick={() => applyCard(stat.label)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                applyCard(stat.label)
              }
            }}
            className={cn(
              'cursor-pointer shadow-none transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              activeCard === stat.label && 'border-foreground',
            )}
          >
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">
                {stat.count.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Filters + actions toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {searching ? (
          <InputGroup className="h-10 w-auto max-w-[400px] flex-1">
            <InputGroupAddon>
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search order id, customer info" autoFocus />
            <InputGroupAddon className="pr-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Dismiss search"
                onClick={() => setSearching(false)}
              >
                <X className="size-4 text-muted-foreground" />
              </Button>
            </InputGroupAddon>
          </InputGroup>
        ) : (
          <>
            <Button
              variant="outline"
              size="icon-lg"
              aria-label="Search orders"
              onClick={() => setSearching(true)}
            >
              <Search className="size-4 text-muted-foreground" />
            </Button>
            <SelectFilter
              label="Channel"
              options={CHANNEL_OPTIONS}
              value={channel}
              onChange={setChannel}
            />
            <SelectFilter
              label="Fulfillment type"
              options={FULFILLMENT_TYPE_OPTIONS}
              value={fulfillmentType}
              onChange={setFulfillmentType}
            />
            <DatesFilter
              field={dateField}
              onFieldChange={setDateField}
              appliedRange={dateRange}
              onApply={setDateRange}
            />
            <SelectFilter
              label="Status"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <ActiveFilter value={activeFilter} onChange={setActiveFilter} />
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 px-3">
                Actions
                {selectedCount > 0 ? (
                  <span className="ml-0.5 rounded-full bg-foreground px-1.5 text-xs font-medium text-background">
                    {selectedCount}
                  </span>
                ) : null}
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {ACTION_GROUPS.map((group, groupIndex) => (
                <React.Fragment key={group[0].label}>
                  {groupIndex > 0 ? <DropdownMenuSeparator /> : null}
                  {group.map((action) => {
                    const Icon = action.icon
                    return (
                      <DropdownMenuItem
                        key={action.label}
                        disabled={isActionDisabled(action.label, selectedCount)}
                      >
                        <Icon className="size-4" />
                        {action.label}
                      </DropdownMenuItem>
                    )
                  })}
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="h-10 px-3">
            <Plus className="size-4" />
            Add order
          </Button>
        </div>
      </div>

      {/* Orders data table */}
      <DataTable
        columns={ORDER_COLUMNS}
        data={ORDERS}
        defaultSorting={[{ id: 'orderedAt', desc: true }]}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </div>
  )
}
