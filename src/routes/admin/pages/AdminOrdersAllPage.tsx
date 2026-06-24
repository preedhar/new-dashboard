import * as React from 'react'
import {
  Archive,
  Banknote,
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  ChevronUp,
  CircleCheck,
  Copy,
  Download,
  FileDown,
  FileText,
  Gift,
  Info,
  Link2,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Tag,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  SquareDashed,
  Store,
  Truck,
  Undo2,
  User,
  X,
  type LucideIcon,
} from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { toast } from 'sonner'

import LalamoveIcon from '@/assets/lalamove.svg?react'
import WhatsappIcon from '@/assets/whatsapp.svg?react'
import productImage from '@/assets/product.png'
import globeIcon from '@/assets/channels/globe.png'
import monitorIcon from '@/assets/channels/monitor.png'
import qrIcon from '@/assets/channels/qr.png'
import adminIcon from '@/assets/channels/admin.png'
import PendingIcon from '@/assets/status/pending.svg?react'
import PaidIcon from '@/assets/status/paid.svg?react'
import FulfilledIcon from '@/assets/status/fulfilled.svg?react'
import CancelledIcon from '@/assets/status/cancelled.svg?react'
import RejectedIcon from '@/assets/status/rejected.svg?react'

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
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
import { TypographyH3, TypographyH4, TypographyLarge } from '@/components/ui/typography'
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

// Lucide icons and SVGR-imported SVGs both render as components taking a
// className, so this covers either.
type IconComponent = React.ComponentType<{ className?: string }>

type FilterOption = { label: string; icon?: IconComponent; iconSrc?: string }

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
  { label: 'Pending', icon: PendingIcon },
  { label: 'Approved', icon: PaidIcon },
  { label: 'Fulfilled', icon: FulfilledIcon },
  { label: 'Canceled', icon: CancelledIcon },
  { label: 'Rejected', icon: RejectedIcon },
]
const ACTIVE_OPTIONS = ['Active', 'Incomplete', 'Archived']

const ACTION_GROUPS: { label: string; icon: IconComponent }[][] = [
  [
    { label: 'Edit', icon: Pencil },
    { label: 'Copy', icon: Copy },
    { label: 'Delivery', icon: LalamoveIcon },
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

const STATUS_ICONS: Record<OrderStatus, IconComponent> = {
  Pending: PendingIcon,
  Approved: PaidIcon,
  Paid: PaidIcon,
  Fulfilled: FulfilledIcon,
  Canceled: CancelledIcon,
  Rejected: RejectedIcon,
}

// Actions that ask for confirmation before they run. Reject/Canceled are status
// transitions; the rest are standalone actions.
type ConfirmableAction =
  | 'Reject'
  | 'Canceled'
  | 'Archive'
  | 'Receipt'
  | 'Create payment link'
  | 'Export for Lalamove'

// Per-action context (order id, customer email, count) used to fill in the
// dialog copy.
type ConfirmContext = { orderId?: string; customerEmail?: string; count?: number }

const CONFIRM_COPY: Record<
  ConfirmableAction,
  {
    title: (ctx: ConfirmContext) => string
    // One entry per paragraph; rendered on its own line.
    description: (ctx: ConfirmContext) => string[]
    cancelLabel: string
    confirmLabel: string
    destructive?: boolean
    toast: string
  }
> = {
  Reject: {
    title: (ctx) => `Reject ${ctx.orderId ?? 'order'}?`,
    description: (ctx) => [
      `We will notify ${ctx.customerEmail ?? 'the customer'} that their order was rejected. The inventory from this order will be restocked.`,
    ],
    cancelLabel: 'Cancel',
    confirmLabel: 'Reject order',
    destructive: true,
    toast: 'Order rejected',
  },
  Canceled: {
    title: (ctx) => `Cancel ${ctx.orderId ?? 'order'}?`,
    description: (ctx) => [
      `We will notify ${ctx.customerEmail ?? 'the customer'} that their order was canceled. The inventory from this order will be restocked.`,
      "If you'd like to refund the customer, please do so separately.",
    ],
    cancelLabel: 'Keep order',
    confirmLabel: 'Cancel order',
    destructive: true,
    toast: 'Order canceled',
  },
  Archive: {
    title: (ctx) => `Archive ${ctx.orderId ?? 'orders'}?`,
    description: () => [
      'Archived orders are hidden from your active orders list. You can find archived orders again using the "Active/Archived" filter.',
      'Archived orders are not excluded from your inventory, fulfilment slots and analytics.',
    ],
    cancelLabel: 'Cancel',
    confirmLabel: 'Archive order',
    toast: 'Order archived',
  },
  Receipt: {
    title: () => 'Send receipt?',
    description: (ctx) => [
      `A receipt for this order will be emailed to ${ctx.customerEmail ?? 'the customer'}`,
    ],
    cancelLabel: 'Cancel',
    confirmLabel: 'Send',
    toast: 'Receipt will be sent to the customer',
  },
  'Create payment link': {
    title: () => 'Need to collect payment?',
    description: () => ['Create a link for your customer to pay'],
    cancelLabel: 'Cancel',
    confirmLabel: 'Create link',
    toast: 'Payment link created',
  },
  'Export for Lalamove': {
    title: (ctx) => `Export orders (${ctx.count ?? 0})?`,
    description: () => [
      'This will download delivery addresses as a CSV file that can be imported into Lalamove to book deliveries',
    ],
    cancelLabel: 'Cancel',
    confirmLabel: 'Export',
    toast: 'Orders exported',
  },
}

// Map a target status to its confirmation action, or null if no confirmation is
// needed for that transition.
function statusConfirmAction(status: OrderStatus): ConfirmableAction | null {
  if (status === 'Rejected') return 'Reject'
  if (status === 'Canceled') return 'Canceled'
  return null
}

// Toast shown after a status transition that doesn't go through a confirmation
// dialog (paid/approved/pending). Other statuses get no toast here.
function showStatusChangeToast(status: OrderStatus, customerEmail?: string) {
  if (status === 'Paid' || status === 'Approved') {
    toast.success(`Receipt will be sent to ${customerEmail ?? 'the customer'}`)
  } else if (status === 'Pending') {
    toast.success('Order marked as pending')
  } else if (status === 'Fulfilled') {
    toast.success('Order marked as fulfilled')
  }
}

type ConfirmRequest = ConfirmContext & {
  action: ConfirmableAction
  onConfirm: () => void
}

const ConfirmActionContext = React.createContext<(request: ConfirmRequest) => void>(() => {})

function useConfirmAction() {
  return React.useContext(ConfirmActionContext)
}

// Holds the pending confirmation and renders a single shared AlertDialog. On
// confirm it runs the action and shows a sonner toast. Used on both desktop and
// mobile since it wraps the whole page.
function ConfirmActionProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = React.useState<ConfirmRequest | null>(null)
  const requestConfirm = React.useCallback((request: ConfirmRequest) => {
    setPending(request)
  }, [])
  const copy = pending ? CONFIRM_COPY[pending.action] : null

  return (
    <ConfirmActionContext.Provider value={requestConfirm}>
      {children}
      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null)
        }}
      >
        {pending && copy ? (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{copy.title(pending)}</AlertDialogTitle>
              <AlertDialogDescription className="flex flex-col gap-3">
                {copy.description(pending).map((line, index) => (
                  <span key={index}>{line}</span>
                ))}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{copy.cancelLabel}</AlertDialogCancel>
              <AlertDialogAction
                variant={copy.destructive ? 'destructive' : undefined}
                onClick={() => {
                  pending.onConfirm()
                  toast.success(copy.toast)
                  setPending(null)
                }}
              >
                {copy.confirmLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        ) : null}
      </AlertDialog>
    </ConfirmActionContext.Provider>
  )
}

type FulfillmentMethod = { label: string; icon: IconComponent }

type Channel = 'Online Store' | 'POS' | 'QR Code Ordering' | 'Admin Dashboard'

type PaymentMethod = 'Card' | 'GCash' | 'PayNow' | 'Cash' | 'Admin added'

type Payment = { method: PaymentMethod; automated: boolean }

// Which payment methods each channel exposes, split by whether the payment is
// captured automatically or recorded manually by staff.
const PAYMENT_METHODS: Record<Channel, { automated: PaymentMethod[]; manual: PaymentMethod[] }> = {
  'Online Store': { automated: ['Card', 'GCash'], manual: ['PayNow', 'Cash'] },
  'QR Code Ordering': { automated: ['Card', 'GCash'], manual: ['PayNow', 'Cash'] },
  POS: { automated: ['Card'], manual: ['GCash', 'PayNow', 'Cash'] },
  'Admin Dashboard': { automated: [], manual: ['Admin added'] },
}

// Allowed statuses (and extra dropdown actions) depend on how the order was paid.
type StatusCategory = 'automated' | 'manualNonCash' | 'cash'

type StatusAction = { label: string; icon: LucideIcon }

const STATUS_CATEGORY_CONFIG: Record<
  StatusCategory,
  { statuses: OrderStatus[]; actions: StatusAction[] }
> = {
  automated: {
    statuses: ['Paid', 'Fulfilled', 'Canceled'],
    actions: [
      { label: 'Refund', icon: Undo2 },
      { label: 'Archive', icon: Archive },
    ],
  },
  manualNonCash: {
    statuses: ['Pending', 'Paid', 'Rejected', 'Canceled'],
    actions: [{ label: 'Archive', icon: Archive }],
  },
  cash: {
    statuses: ['Pending', 'Approved', 'Rejected', 'Canceled'],
    actions: [{ label: 'Archive', icon: Archive }],
  },
}

function getStatusCategory(payment: Payment): StatusCategory {
  if (payment.method === 'Cash') return 'cash'
  return payment.automated ? 'automated' : 'manualNonCash'
}

// While an order is still Pending the dropdown only offers the two transitions
// that resolve it. (Automated orders are never pending.)
const PENDING_TRANSITIONS: Record<StatusCategory, { label: string; status: OrderStatus }[]> = {
  automated: [],
  manualNonCash: [
    { label: 'Mark as paid', status: 'Paid' },
    { label: 'Reject', status: 'Rejected' },
  ],
  cash: [
    { label: 'Approve', status: 'Approved' },
    { label: 'Reject', status: 'Rejected' },
  ],
}

// A Rejected order can only be moved forward (mark as paid / approve) or
// archived. (Automated orders are never rejected.)
const REJECTED_TRANSITIONS: Record<StatusCategory, { label: string; status: OrderStatus }[]> = {
  automated: [],
  manualNonCash: [{ label: 'Mark as paid', status: 'Paid' }],
  cash: [{ label: 'Approve', status: 'Approved' }],
}

type Order = {
  id: string
  channel: Channel
  customer: {
    name?: string
    phone?: string
    email?: string
  }
  orderedAt: Date
  total: number
  items: string[]
  fulfillAt: Date
  fulfillment: FulfillmentMethod
  payment: Payment
  status: OrderStatus
  address?: string[]
  gift?: { to: string; message: string }
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

// Client-side navigation to the order create form (matches the app's router).
function navigateToAddOrder() {
  window.history.pushState(null, '', '/admin/orders/new')
  window.dispatchEvent(new PopStateEvent('popstate'))
}

const CHANNELS: Channel[] = ['Online Store', 'POS', 'QR Code Ordering', 'Admin Dashboard']

// POS and QR Code Ordering can only be fulfilled in-store.
const IN_STORE_ONLY_CHANNELS: Channel[] = ['POS', 'QR Code Ordering']

const FULFILLMENT_ICONS: Record<string, IconComponent> = Object.fromEntries(
  FULFILLMENT_TYPE_OPTIONS.map((option) => [option.label, option.icon ?? Store]),
)

const SELECTABLE_FULFILLMENTS = FULFILLMENT_TYPE_OPTIONS.map((option) => option.label)

const CUSTOMERS: Array<{ name: string; phone: string; email: string }> = [
  { name: 'Aiden Carter', phone: '+1 415 555 0102', email: 'aiden.carter@example.com' },
  { name: 'Chloe Mitchell', phone: '+1 415 555 0108', email: 'chloe.mitchell@example.com' },
  { name: 'Teresa Nakamura', phone: '+1 415 555 0114', email: 'teresa.nakamura@example.com' },
  { name: 'Maya Rodriguez', phone: '+1 415 555 0121', email: 'maya.rodriguez@example.com' },
  { name: 'David Kim', phone: '+1 415 555 0135', email: 'david.kim@example.com' },
  { name: 'Lily Chen', phone: '+1 415 555 0147', email: 'lily.chen@example.com' },
  { name: 'Sofia Rossi', phone: '+1 415 555 0159', email: 'sofia.rossi@example.com' },
  { name: 'Noah Patel', phone: '+1 415 555 0164', email: 'noah.patel@example.com' },
  { name: 'Emma Johnson', phone: '+1 415 555 0176', email: 'emma.johnson@example.com' },
  { name: 'Olivia Brown', phone: '+1 415 555 0188', email: 'olivia.brown@example.com' },
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

function getOrderCustomer(channel: Channel, customer: { name: string; phone: string; email: string }) {
  if (channel === 'POS') return {}
  if (channel === 'QR Code Ordering') return { name: customer.name }
  return customer
}

// Example detail content for the order side pane.
const ADDRESSES: string[][] = [
  ['88 Tanjong Pagar Rd, Singapore 088501', 'Unit 43'],
  ['12 Marina Blvd, Singapore 018982', '#08-12'],
  ['450 Orchard Rd, Singapore 238877', 'Tower 2, Unit 15'],
  ['9 Raffles Pl, Singapore 048619', 'Level 21'],
  ['5 Changi Business Park Cres, Singapore 486040', 'Unit 03-07'],
]

const GIFT_MESSAGES = [
  'Happy birthday! Hope you enjoy this little treat. Lots of love.',
  'Congrats on the new job — you earned this!',
  'Thinking of you today. Enjoy every bite!',
]

const ITEM_NOTES = [
  'Please make it less sweet, thank you!',
  'Extra hot, no foam.',
  'No ice please.',
]

const ADD_ON_SETS = [
  ['1x Oat Milk', '1x Espresso Shot'],
  ['1x Whipped Cream'],
  ['1x Extra Sauce', '1x Side Salad'],
]

const SPECIAL_REQUESTS = [
  'Please pack the cutlery separately',
  'Leave it at the front desk, thank you!',
  'Please call on arrival.',
]

// Deterministic pseudo-random integer derived from a seed, so example data is
// varied but stable across reloads.
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return Math.floor((x - Math.floor(x)) * 1000)
}

function getOrderId(channel: Channel, customer: { name?: string }, index: number) {
  if (customer.name) return `${customer.name.slice(0, 3).toUpperCase()}${10 + index}`

  const channelPrefix: Record<Channel, string> = {
    'Online Store': 'ONL',
    POS: 'POS',
    'QR Code Ordering': 'QRO',
    'Admin Dashboard': 'ADM',
  }

  return `${channelPrefix[channel]}${10 + index}`
}

const ORDERS: Order[] = Array.from({ length: 40 }, (_, i) => {
  // Pick the channel from the seeded hash (not i % length) so channels don't
  // cluster together once the table is sorted by date.
  const channel = CHANNELS[pseudoRandom(i + 500) % CHANNELS.length]
  const fulfillmentLabel = IN_STORE_ONLY_CHANNELS.includes(channel)
    ? 'In-store'
    : SELECTABLE_FULFILLMENTS[(i * 3) % SELECTABLE_FULFILLMENTS.length]
  const customer = getOrderCustomer(channel, CUSTOMERS[i % CUSTOMERS.length])

  // Spread orders across 2025, 2026 and 2027; fulfillment is always a few
  // (5–25) hours after the order is placed.
  const year = 2025 + (i % 3)
  const orderedAt = new Date(year, (i * 5) % 12, 1 + ((i * 7) % 27), 8 + ((i * 5) % 12), (i * 13) % 60)
  const fulfillAt = new Date(orderedAt.getTime() + (5 + (i % 6) * 4) * 60 * 60 * 1000)

  const methods = PAYMENT_METHODS[channel]
  const automated = methods.automated.length > 0 && i % 2 === 0
  const pool = automated ? methods.automated : methods.manual
  // Seed the method index separately so it isn't coupled to the automated
  // parity (which would otherwise always pick the first method, e.g. Card).
  const payment: Payment = { method: pool[pseudoRandom(i + 700) % pool.length], automated }

  // Randomly pick an allowed status for this order's payment category. A simple
  // seeded hash keeps it varied but stable across reloads. Pending is given a
  // modest extra weight so some orders show up as pending. Admin-added orders
  // that still have an open payment link are always pending.
  const allowedStatuses = STATUS_CATEGORY_CONFIG[getStatusCategory(payment)].statuses
  const hasOpenPaymentLink =
    channel === 'Admin Dashboard' && orderedAt.getMinutes() % 2 === 0
  const status: OrderStatus = hasOpenPaymentLink
    ? 'Pending'
    : allowedStatuses.includes('Pending') && pseudoRandom(i) % 100 < 25
      ? 'Pending'
      : allowedStatuses[pseudoRandom(i + 1) % allowedStatuses.length]

  // Delivery orders get a shipping address. Every Online Store order carries
  // gift details.
  const isDelivery = fulfillmentLabel.startsWith('Delivery')
  const address = isDelivery && customer.name ? ADDRESSES[i % ADDRESSES.length] : undefined
  // Gift orders are sent to someone other than the buyer, so the recipient name
  // differs from the customer name.
  const gift =
    channel === 'Online Store'
      ? {
          to: CUSTOMERS[(i + 3) % CUSTOMERS.length].name,
          message: GIFT_MESSAGES[i % GIFT_MESSAGES.length],
        }
      : undefined

  return {
    id: getOrderId(channel, customer, i),
    channel,
    customer,
    orderedAt,
    total: Math.round((i * 37) % 9000) / 100 + 2.5,
    items: ITEM_SETS[i % ITEM_SETS.length],
    fulfillAt,
    fulfillment: { label: fulfillmentLabel, icon: FULFILLMENT_ICONS[fulfillmentLabel] },
    payment,
    status,
    address,
    gift,
  }
})

// The table sorts by order date (newest first) and shows 10 rows per page, so
// force most of the most-recent orders to Pending — that's the first page the
// user lands on. Orders paid via an automated method can't be pending, so swap
// those to a manual method first.
const FIRST_PAGE_PENDING = 3
ORDERS.map((order, index) => ({ order, index }))
  .sort((a, b) => b.order.orderedAt.getTime() - a.order.orderedAt.getTime())
  .slice(0, FIRST_PAGE_PENDING)
  .forEach(({ order }) => {
    if (!STATUS_CATEGORY_CONFIG[getStatusCategory(order.payment)].statuses.includes('Pending')) {
      order.payment = { method: PAYMENT_METHODS[order.channel].manual[0], automated: false }
    }
    order.status = 'Pending'
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
      className="-mr-1 ml-auto inline-flex size-5 items-center justify-center rounded-sm text-foreground hover:bg-muted"
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
  className,
  contentClassName,
}: {
  label: string
  options: Array<string | FilterOption>
  value: string | null
  onChange: (value: string | null) => void
  className?: string
  contentClassName?: string
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
          className={cn(FILTER_BUTTON_CLASS, active && FILTER_BUTTON_ACTIVE_CLASS, className)}
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
            <ChevronDown className="ml-auto size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={cn('w-auto min-w-44', contentClassName)}>
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
  className,
  contentClassName,
}: {
  value: string
  onChange: (value: string) => void
  className?: string
  contentClassName?: string
}) {
  const active = value !== 'Active'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(FILTER_BUTTON_CLASS, active && FILTER_BUTTON_ACTIVE_CLASS, className)}
        >
          {value}
          {active ? (
            <ClearFilterButton label="Active" onClear={() => onChange('Active')} />
          ) : (
            <ChevronDown className="ml-auto size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={cn('w-44', contentClassName)}>
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

export function DatesFilter({
  field,
  onFieldChange,
  appliedRange,
  onApply,
  className,
  contentClassName,
}: {
  field: string
  onFieldChange: (value: string) => void
  appliedRange: DateRange | undefined
  onApply: (range: DateRange | undefined) => void
  className?: string
  contentClassName?: string
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
          className={cn(FILTER_BUTTON_CLASS, active && FILTER_BUTTON_ACTIVE_CLASS, className)}
        >
          {active ? 'Dates: Selected' : 'Dates'}
          {active ? (
            <ClearFilterButton label="Dates" onClear={clearAll} />
          ) : (
            <ChevronDown className="ml-auto size-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn('w-[300px] p-3', contentClassName)}>
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

// Refund dialog for automated-payment orders. The amount defaults to the order
// total and can be edited or reset via "Refund total"; an optional switch also
// cancels the order (restocking inventory).
function RefundDialog({
  open,
  onOpenChange,
  paymentMethod,
  total,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  paymentMethod: PaymentMethod
  total: number
}) {
  const [amount, setAmount] = React.useState('')
  const [cancelOrder, setCancelOrder] = React.useState(false)

  // Reset the form whenever the dialog is opened for a (possibly different) order.
  React.useEffect(() => {
    if (open) {
      setAmount('')
      setCancelOrder(false)
    }
  }, [open])

  const numericAmount = Number.parseFloat(amount) || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="[&_[data-slot=dialog-close]]:size-10">
        <DialogHeader>
          <DialogTitle asChild>
            <TypographyH4 className="text-center font-semibold">
              Refund to {paymentMethod}
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>
        <FieldGroup className="gap-6">
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-2xl text-muted-foreground">
              $
            </span>
            <Input
              inputSize="xl"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="pl-9 font-semibold tabular-nums"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Order total: {formatCurrency(total)}
            </span>
            <Button
              variant="link"
              className="h-auto p-0"
              onClick={() => setAmount(total.toFixed(2))}
            >
              Refund total
            </Button>
          </div>
          <FieldLabel
            htmlFor="refund-cancel-order"
            className="transition-colors hover:bg-muted/50"
          >
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Cancel order</FieldTitle>
                <FieldDescription>
                  Inventory will be restocked and order will be excluded from order summary
                </FieldDescription>
              </FieldContent>
              <Switch
                id="refund-cancel-order"
                checked={cancelOrder}
                onCheckedChange={setCancelOrder}
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
            disabled={numericAmount <= 0}
            onClick={() => {
              onOpenChange(false)
              toast.success(`Refunded ${formatCurrency(numericAmount)}`)
            }}
          >
            Refund {formatCurrency(numericAmount)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function StatusPill({
  status,
  category,
  onChange,
  orderId,
  customerEmail,
  paymentMethod,
  total,
  className,
  iconClassName,
}: {
  status: OrderStatus
  category: StatusCategory
  onChange: (status: OrderStatus) => void
  orderId?: string
  customerEmail?: string
  paymentMethod: PaymentMethod
  total: number
  className?: string
  iconClassName?: string
}) {
  const requestConfirm = useConfirmAction()
  const [refundOpen, setRefundOpen] = React.useState(false)
  const { statuses, actions } = STATUS_CATEGORY_CONFIG[category]

  // Pending and Rejected orders get a restricted menu of transitions; every
  // other status shows the full list of allowed statuses.
  let statusItems: { label: string; status: OrderStatus }[]
  let actionItems: StatusAction[]
  if (status === 'Pending') {
    statusItems = PENDING_TRANSITIONS[category]
    actionItems = []
  } else if (status === 'Rejected') {
    statusItems = [{ label: 'Rejected', status: 'Rejected' }, ...REJECTED_TRANSITIONS[category]]
    actionItems = actions.filter((action) => action.label === 'Archive')
  } else {
    // Rejected is only offered for orders currently in Pending or Rejected.
    const allowed = statuses.filter((s) => s !== 'Rejected')
    // Paid, Approved, Canceled and Fulfilled orders always list Fulfilled, even
    // when their payment category doesn't otherwise include it. Fulfilled always
    // sits right after the Paid/Approved option.
    const canFulfill =
      status === 'Paid' ||
      status === 'Approved' ||
      status === 'Canceled' ||
      status === 'Fulfilled'
    if (canFulfill && !allowed.includes('Fulfilled')) {
      const anchor = allowed.findIndex((s) => s === 'Paid' || s === 'Approved')
      allowed.splice(anchor === -1 ? allowed.length : anchor + 1, 0, 'Fulfilled')
    }
    statusItems = allowed.map((s) => ({ label: s, status: s }))
    actionItems = actions
  }

  const TriggerIcon = STATUS_ICONS[status]

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn('h-10 w-[152px] px-3 font-medium', className)}
        >
          <TriggerIcon className={cn('size-5', iconClassName)} />
          {status}
          <ChevronDown className="ml-auto size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {statusItems.map((option) => {
          const Icon = STATUS_ICONS[option.status]
          const confirmAction = statusConfirmAction(option.status)
          return (
            <DropdownMenuItem
              key={option.label}
              onSelect={() => {
                if (confirmAction) {
                  requestConfirm({
                    action: confirmAction,
                    orderId,
                    customerEmail,
                    onConfirm: () => onChange(option.status),
                  })
                } else {
                  onChange(option.status)
                  showStatusChangeToast(option.status, customerEmail)
                }
              }}
            >
              <Icon className="size-4" />
              {option.label}
              {option.status === status ? <Check className="ml-auto size-4" /> : null}
            </DropdownMenuItem>
          )
        })}
        {actionItems.length > 0 ? <DropdownMenuSeparator /> : null}
        {actionItems.map((action) => {
          const Icon = action.icon
          return (
            <DropdownMenuItem
              key={action.label}
              onSelect={
                action.label === 'Archive'
                  ? () => requestConfirm({ action: 'Archive', orderId, onConfirm: () => {} })
                  : action.label === 'Refund'
                    ? () => setRefundOpen(true)
                    : undefined
              }
            >
              <Icon className="size-4 text-muted-foreground" />
              {action.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
    <RefundDialog
      open={refundOpen}
      onOpenChange={setRefundOpen}
      paymentMethod={paymentMethod}
      total={total}
    />
    </>
  )
}

function CustomerDetails({ customer }: { customer: Order['customer'] }) {
  // Phone and email are intentionally hidden here — they are shown separately
  // alongside payment info elsewhere.
  if (!customer.name) {
    return <p className="text-sm text-muted-foreground">-</p>
  }

  return <p className="text-sm text-muted-foreground">{customer.name}</p>
}

function formatDateTime(date: Date) {
  return `${formatDate(date)} ${formatTime(date)}`
}

function parseLineItem(raw: string) {
  const match = raw.match(/^(\d+)x\s+(.*)$/)
  return match ? { qty: Number(match[1]), name: match[2] } : { qty: 1, name: raw }
}

const DETAIL_ACTIONS: { label: string; icon: IconComponent }[] = [
  { label: 'Edit', icon: Pencil },
  { label: 'Receipt', icon: Mail },
  { label: 'Delivery', icon: LalamoveIcon },
  { label: 'Copy', icon: Copy },
  { label: 'Archive', icon: Archive },
]

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <div className="border-b border-border p-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between"
      >
        <TypographyLarge className="text-base md:text-lg">{title}</TypographyLarge>
        <ChevronUp
          className={cn('size-4 text-muted-foreground transition-transform', !open && 'rotate-180')}
        />
      </button>
      {open ? <div className="mt-4">{children}</div> : null}
    </div>
  )
}

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
    <div className="flex gap-3">
      <Icon className="size-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="flex h-5 items-center text-sm text-muted-foreground">{label}</p>
        <div className="space-y-0.5 text-sm text-foreground md:text-base">{children}</div>
      </div>
    </div>
  )
}

function ContactPhone({ phone }: { phone: string }) {
  return (
    <p className="flex items-center gap-1.5">
      {phone}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Open in WhatsApp"
            className="text-foreground"
          >
            <WhatsappIcon className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Open in Whatsapp</TooltipContent>
      </Tooltip>
    </p>
  )
}

function CopyLinkButton({ value }: { value: string }) {
  const [open, setOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function handleCopy() {
    navigator.clipboard?.writeText(value)
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 2000)
  }

  React.useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <Tooltip open={open || copied} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Copy payment link"
          className="shrink-0 text-foreground"
          onClick={handleCopy}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{copied ? 'Copied' : 'Copy'}</TooltipContent>
    </Tooltip>
  )
}

const CUSTOMER_TAG_OPTIONS = [
  'Wholesale',
  'Regular',
  'Repeat buyer',
  'VIP',
  'New customer',
  'Corporate',
]

function TagsCombobox({ defaultTags = [] }: { defaultTags?: string[] }) {
  const anchor = useComboboxAnchor()
  const [options, setOptions] = React.useState<string[]>(() =>
    Array.from(new Set([...CUSTOMER_TAG_OPTIONS, ...defaultTags])),
  )
  const [value, setValue] = React.useState<string[]>(defaultTags)
  const [query, setQuery] = React.useState('')

  const trimmed = query.trim()
  const canCreate =
    trimmed.length > 0 &&
    !options.some((option) => option.toLowerCase() === trimmed.toLowerCase())

  function createTag() {
    if (!canCreate) return
    setOptions((prev) => [...prev, trimmed])
    setValue((prev) => [...prev, trimmed])
    setQuery('')
  }

  return (
    <Combobox
      items={options}
      value={value}
      onValueChange={(next: string[], details) => {
        // base-ui clears the whole selection on Escape — ignore that change.
        if (details.reason === 'escape-key') return
        setValue(next)
      }}
      inputValue={query}
      onInputValueChange={(next) => setQuery(next)}
      multiple
    >
      <ComboboxChips ref={anchor} className="mt-1 bg-background">
        <ComboboxValue>
          {(tags: string[]) => (
            <>
              {tags.map((tag) => (
                <ComboboxChip key={tag} aria-label={tag} className="h-auto py-0.5 text-sm font-normal">
                  {tag}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput placeholder={tags.length ? '' : 'Add tags…'} />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        {!canCreate ? <ComboboxEmpty>No tags found.</ComboboxEmpty> : null}
        <ComboboxList>
          {(tag: string) => (
            <ComboboxItem key={tag} value={tag}>
              {tag}
            </ComboboxItem>
          )}
        </ComboboxList>
        {canCreate ? (
          <button
            type="button"
            // Keep input focus (and the popover open) when clicking.
            onMouseDown={(event) => event.preventDefault()}
            onClick={createTag}
            className="flex w-full cursor-default items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden hover:bg-accent hover:text-accent-foreground"
          >
            <span>
              Create "<span className="font-medium">{trimmed}</span>"
            </span>
            <Plus className="size-4 shrink-0 text-muted-foreground" />
          </button>
        ) : null}
      </ComboboxContent>
    </Combobox>
  )
}

function NotesField() {
  const [value, setValue] = React.useState('')
  const [saved, setSaved] = React.useState('')
  const dirty = value !== saved

  return (
    <div className="mt-1 space-y-2">
      <Textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Add notes about customer"
        className="min-h-10 bg-background text-sm"
      />
      {dirty ? (
        <Button size="sm" onClick={() => setSaved(value)}>
          Save
        </Button>
      ) : null}
    </div>
  )
}

function OrderDetailPane({
  order,
  onClose,
  onStatusChange,
  className,
  hideTitle = false,
  hideClose = false,
}: {
  order: Order
  onClose: () => void
  onStatusChange: (id: string, status: OrderStatus) => void
  className?: string
  hideTitle?: boolean
  hideClose?: boolean
}) {
  const requestConfirm = useConfirmAction()
  const [otherOpen, setOtherOpen] = React.useState(false)
  const FulfillmentIcon = order.fulfillment.icon
  // Every item shows a special instruction and add-ons, picked deterministically
  // from the pools so each order/item is varied but stable.
  const itemSeed = order.orderedAt.getTime()
  const lineItems = order.items.map((raw, idx) => ({
    ...parseLineItem(raw),
    note: ITEM_NOTES[(itemSeed + idx) % ITEM_NOTES.length],
    addOns: ADD_ON_SETS[(itemSeed + idx) % ADD_ON_SETS.length],
  }))
  const per = lineItems.length ? Math.round((order.total / lineItems.length) * 100) / 100 : 0
  const prices = lineItems.map((_, idx) =>
    idx === lineItems.length - 1 ? order.total - per * (lineItems.length - 1) : per,
  )
  const hasCustomer = Boolean(order.customer.name || order.customer.phone || order.customer.email)

  // Order summary line items shown between Subtotal and Total. Some charges
  // don't apply to POS / QR Code orders.
  const isPOS = order.channel === 'POS'
  const isQR = order.channel === 'QR Code Ordering'
  const charges = [
    { label: 'Fulfillment fee', amount: 1.5, show: !isPOS && !isQR },
    { label: 'Bulk discount', amount: -1, show: !isPOS },
    { label: 'Promotional discount', amount: -2 },
    { label: 'Tip', amount: 1.2, show: !isPOS },
    { label: 'Service charge', amount: 0.25 },
    { label: 'GST (included where applicable)', amount: 0.25 },
  ].filter((charge) => charge.show !== false)
  const total = order.total + charges.reduce((sum, charge) => sum + charge.amount, 0)

  // Gift orders are delivered to the recipient, not the buyer.
  const recipient = order.gift?.to ?? order.customer.name
  // In-store orders have no customer info to show in the fulfillment section.
  const isInStore = order.fulfillment.label === 'In-store'
  const specialRequest = SPECIAL_REQUESTS[itemSeed % SPECIAL_REQUESTS.length]
  // Show a payment link for about half of the admin-added orders.
  const hasPaymentLink =
    order.payment.method === 'Admin added' && order.orderedAt.getMinutes() % 2 === 0

  // Example activity timeline derived from the order.
  const activity = [
    { label: 'Event', at: formatDateTime(order.fulfillAt) },
    { label: 'Event', at: formatDateTime(order.orderedAt) },
    { label: 'Event', at: formatDateTime(order.orderedAt) },
  ]

  return (
    <aside
      className={cn(
        'max-h-[calc(100vh-2rem)] w-[360px] overflow-y-auto rounded-lg border border-border',
        className,
      )}
    >
      {/* Action toolbar */}
      <div className="flex items-stretch border-b border-border p-1">
        {DETAIL_ACTIONS.map((action) => {
          const Icon = action.icon
          // Archive and Receipt ask for confirmation before running.
          const confirmAction =
            action.label in CONFIRM_COPY ? (action.label as ConfirmableAction) : null
          return (
            <Button
              key={action.label}
              variant="ghost"
              className="h-auto flex-1 flex-col gap-1 py-1 text-[10px] font-normal text-muted-foreground [&_svg]:size-5"
              onClick={() => {
                if (confirmAction) {
                  requestConfirm({
                    action: confirmAction,
                    orderId: order.id,
                    customerEmail: order.customer.email,
                    onConfirm: () => {},
                  })
                } else if (action.label === 'Edit') {
                  window.history.pushState(null, '', '/admin/orders/edit')
                  window.dispatchEvent(new PopStateEvent('popstate'))
                } else if (action.label === 'Copy') {
                  toast.success('Order copied')
                }
              }}
            >
              <Icon className="size-5" />
              {action.label}
            </Button>
          )
        })}
        {hideClose ? null : (
          <Button
            variant="ghost"
            onClick={onClose}
            aria-label="Close"
            className="h-auto flex-1 flex-col gap-1 py-2 text-xs font-normal text-muted-foreground"
          >
            <X className="size-5" />
            Close
          </Button>
        )}
      </div>

      {/* Header */}
      <div className="space-y-4 border-b border-border p-4">
        {hideTitle ? null : (
          <div className="flex items-center justify-between gap-2">
            <TypographyH4>{order.id}</TypographyH4>
            <StatusPill
              status={order.status}
              category={getStatusCategory(order.payment)}
              onChange={(status) => onStatusChange(order.id, status)}
              orderId={order.id}
              customerEmail={order.customer.email}
              paymentMethod={order.payment.method}
              total={order.total}
            />
          </div>
        )}
        <div className="flex flex-col items-start gap-1 text-sm text-muted-foreground md:flex-row md:items-center md:gap-2">
          <span className="flex items-center gap-1">
            <img src={CHANNEL_ICON_SRC[order.channel]} alt="" className="size-5" />
            {order.channel}
          </span>
          <span aria-hidden className="hidden size-1 rounded-full bg-muted-foreground/40 md:block" />
          <span>{formatDateTime(order.orderedAt)}</span>
        </div>
      </div>

      {/* Fulfillment */}
      <CollapsibleSection title="Fulfillment">
        <div className="space-y-5">
          <DetailRow icon={CalendarIcon} label="Date">
            <p>{formatDateTime(order.fulfillAt)}</p>
          </DetailRow>

          <DetailRow icon={FulfillmentIcon} label="Type">
            <p>{order.fulfillment.label}</p>
          </DetailRow>

          {order.gift ? (
            <DetailRow icon={Gift} label="Gift recipient">
              {recipient ? <p>{recipient}</p> : null}
              {order.customer.phone ? <ContactPhone phone={order.customer.phone} /> : null}
              <p>"{order.gift.message}"</p>
            </DetailRow>
          ) : !isInStore && (order.customer.name || order.customer.phone) ? (
            <DetailRow icon={User} label="Customer">
              {order.customer.name ? <p>{order.customer.name}</p> : null}
              {order.customer.phone ? <ContactPhone phone={order.customer.phone} /> : null}
            </DetailRow>
          ) : null}

          {order.address ? (
            <DetailRow icon={MapPin} label="Address">
              {order.address.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </DetailRow>
          ) : null}
        </div>
      </CollapsibleSection>

      {/* Items */}
      <CollapsibleSection title="Items">
        <div className="space-y-4">
          {lineItems.map((item, idx) => (
            <div key={`${item.name}-${idx}`} className="flex gap-3">
              <img
                src={productImage}
                alt=""
                className="size-10 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground md:text-base">
                    {item.qty}x {item.name}
                  </p>
                  <p className="shrink-0 text-sm font-normal text-muted-foreground">
                    {formatCurrency(prices[idx])}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Special instructions:</p>
                  <p className="text-foreground">{item.note}</p>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Add-ons:</p>
                  <p className="text-foreground">{item.addOns.join(', ')}</p>
                </div>
              </div>
            </div>
          ))}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setOtherOpen((v) => !v)}
                className="flex items-center gap-1 text-muted-foreground"
              >
                Other
                <ChevronUp
                  className={cn('size-4 transition-transform', !otherOpen && 'rotate-180')}
                />
              </button>
              {otherOpen ? (
                <div className="mt-2 space-y-2">
                  {charges.map((charge) => (
                    <div key={charge.label} className="flex justify-between">
                      <span className="text-muted-foreground">{charge.label}</span>
                      <span className="text-muted-foreground">
                        {charge.amount < 0
                          ? `-${formatCurrency(Math.abs(charge.amount))}`
                          : formatCurrency(charge.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex justify-between text-sm font-medium text-foreground md:text-base">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Other */}
      <CollapsibleSection title="Other">
        <DetailRow
          icon={ClipboardList}
          label={order.channel === 'POS' ? 'Notes' : 'Do you have any special requests?:'}
        >
          <p>{specialRequest}</p>
        </DetailRow>
      </CollapsibleSection>

      {/* Payment */}
      <CollapsibleSection title="Payment">
        <div className="space-y-4">
          {!hasPaymentLink ? (
            <DetailRow icon={Banknote} label="Method">
              <p className="flex items-center gap-1">
                <span>{order.payment.method}</span>
                {!order.payment.automated ? (
                  <span className="inline-flex items-center gap-0.5 text-muted-foreground">
                    (Manual
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          aria-label="About manual payments"
                          className="inline-flex"
                        >
                          <Info className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-56 text-center">
                        Manual payments are not processed by Cococart. You need to collect them from
                        the customer.
                      </TooltipContent>
                    </Tooltip>
                    )
                  </span>
                ) : null}
              </p>
            </DetailRow>
          ) : null}
          {!hasPaymentLink && order.payment.method === 'Admin added' ? (
            <Button
              variant="outline"
              className="h-10 w-full"
              onClick={() =>
                requestConfirm({
                  action: 'Create payment link',
                  orderId: order.id,
                  onConfirm: () => {},
                })
              }
            >
              <CircleDollarSign className="size-4" />
              Create payment link
            </Button>
          ) : null}
          {hasPaymentLink ? (
            <DetailRow icon={Link2} label="Payment link">
              <div className="flex items-center gap-1">
                <span className="min-w-0 flex-1 truncate">
                  https://cococart.co/pay/ord_8f3a9c2b4e7d1f6a0b5c2d8e
                </span>
                <CopyLinkButton value="https://cococart.co/pay/ord_8f3a9c2b4e7d1f6a0b5c2d8e" />
              </div>
            </DetailRow>
          ) : null}
          {order.payment.automated && order.payment.method === 'Card' ? (
            <DetailRow icon={CreditCard} label="Details">
              <p>Credit card **** 4242</p>
            </DetailRow>
          ) : null}
          {order.payment.automated ? (
            <DetailRow icon={CircleDollarSign} label="Amount collected">
              <p>{formatCurrency(total)}</p>
            </DetailRow>
          ) : null}
        </div>
      </CollapsibleSection>

      {/* Customer — hidden entirely when there's no customer (e.g. POS) */}
      {hasCustomer ? (
        <CollapsibleSection title="Customer">
          <div className="space-y-4">
            {order.customer.name ? (
              <DetailRow icon={User} label="Name">
                <p>{order.customer.name}</p>
              </DetailRow>
            ) : null}
            {order.customer.email ? (
              <DetailRow icon={Mail} label="Email">
                <p className="flex items-center gap-1.5">
                  {order.customer.email}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="View in CRM"
                        className="text-foreground"
                      >
                        <Search className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View in CRM</TooltipContent>
                  </Tooltip>
                </p>
              </DetailRow>
            ) : null}
            {order.customer.phone ? (
              <DetailRow icon={Phone} label="Phone">
                <ContactPhone phone={order.customer.phone} />
              </DetailRow>
            ) : null}

            <DetailRow icon={Tag} label="Tags">
              <TagsCombobox defaultTags={['Wholesale', 'Regular', 'Repeat buyer']} />
            </DetailRow>

            <DetailRow icon={FileText} label="Notes">
              <NotesField />
            </DetailRow>
          </div>
        </CollapsibleSection>
      ) : null}

      {/* Activity */}
      <CollapsibleSection title="Activity" defaultOpen={false}>
        <ol>
          {activity.map((event, idx) => {
            const isLast = idx === activity.length - 1
            return (
              <li key={`${event.label}-${idx}`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="mt-1 flex size-3.5 shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <span className="size-2 rounded-full bg-amber-400" />
                  </span>
                  {!isLast ? <span className="w-px flex-1 bg-border" /> : null}
                </div>
                <div className={cn('leading-tight', !isLast && 'pb-5')}>
                  <p className="text-sm font-medium text-foreground">{event.label}</p>
                  <p className="text-sm text-muted-foreground">{event.at}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </CollapsibleSection>
    </aside>
  )
}

function getOrderColumns(
  onStatusChange: (id: string, status: OrderStatus) => void,
): ColumnDef<Order>[] {
  return [
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
    header: 'ID',
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
            <CustomerDetails customer={order.customer} />
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'orderedAt',
    sortingFn: 'datetime',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ordered" />,
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
      <p className="font-normal text-muted-foreground">
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
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="size-4 shrink-0" />
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
    // Fixed to the status pill width (152px) plus the cell's horizontal padding.
    meta: { className: 'w-[184px] text-right', headerClassName: 'w-[184px] text-left' },
    header: 'Status',
    cell: ({ row }) => (
      <div className="flex justify-end">
        <StatusPill
          status={row.original.status}
          category={getStatusCategory(row.original.payment)}
          onChange={(status) => onStatusChange(row.original.id, status)}
          orderId={row.original.id}
          customerEmail={row.original.customer.email}
          paymentMethod={row.original.payment.method}
          total={row.original.total}
        />
      </div>
    ),
  },
  ]
}

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

type ProductLayout = 'per-column' | 'per-row' | 'one-cell'

// Options dialog for the "Export to CSV" action. Two choice-card switches plus a
// radio field controlling how product columns are laid out in the export.
function ExportCsvDialog({
  open,
  onOpenChange,
  count,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  count: number
}) {
  const [bundleSeparately, setBundleSeparately] = React.useState(false)
  const [includeStatus, setIncludeStatus] = React.useState(false)
  const [productLayout, setProductLayout] = React.useState<ProductLayout>('per-column')
  const [exporting, setExporting] = React.useState(false)

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    // Reset back to the options form once the dialog has closed.
    if (!next) setExporting(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="[&_[data-slot=dialog-close]]:size-10">
        {exporting ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <Loader2 className="size-8 animate-spin text-primary" />
            <div className="flex flex-col gap-2">
              <DialogTitle asChild>
                <TypographyH4 className="font-semibold">Exporting {count} orders</TypographyH4>
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                We'll email you when it is ready. You can close this and come back later to
                download.
              </p>
            </div>
          </div>
        ) : (
          <>
        <DialogHeader>
          <DialogTitle asChild>
            <TypographyH4 className="text-center font-semibold">Export orders ({count})</TypographyH4>
          </DialogTitle>
        </DialogHeader>
        <FieldGroup className="gap-6">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-foreground">
            <div className="flex items-center gap-2">
              <FileText className="size-4 shrink-0" />
              <span className="text-sm font-medium">
                Download your previous CSV export
              </span>
            </div>
            <Button
              size="icon"
              className="size-8 shrink-0"
              aria-label="Download previous export"
            >
              <Download className="size-4" />
            </Button>
          </div>
          <FieldLabel
            htmlFor="export-bundle-separately"
            className="transition-colors hover:bg-muted/50"
          >
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Show bundle products separately</FieldTitle>
              </FieldContent>
              <Switch
                id="export-bundle-separately"
                checked={bundleSeparately}
                onCheckedChange={setBundleSeparately}
              />
            </Field>
          </FieldLabel>
          <FieldLabel
            htmlFor="export-include-status"
            className="transition-colors hover:bg-muted/50"
          >
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Include order status</FieldTitle>
              </FieldContent>
              <Switch
                id="export-include-status"
                checked={includeStatus}
                onCheckedChange={setIncludeStatus}
              />
            </Field>
          </FieldLabel>
          <FieldSet>
            <FieldLegend variant="label">Show products</FieldLegend>
            <RadioGroup
              value={productLayout}
              onValueChange={(value) => setProductLayout(value as ProductLayout)}
              className="gap-0 divide-y overflow-hidden rounded-lg border"
            >
              <FieldLabel
                htmlFor="products-per-column"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 font-normal transition-colors hover:bg-muted/50"
              >
                One product per column
                <RadioGroupItem value="per-column" id="products-per-column" />
              </FieldLabel>
              <FieldLabel
                htmlFor="products-per-row"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 font-normal transition-colors hover:bg-muted/50"
              >
                One product per row
                <RadioGroupItem value="per-row" id="products-per-row" />
              </FieldLabel>
              <FieldLabel
                htmlFor="products-one-cell"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 font-normal transition-colors hover:bg-muted/50"
              >
                All products in one cell
                <RadioGroupItem value="one-cell" id="products-one-cell" />
              </FieldLabel>
            </RadioGroup>
          </FieldSet>
        </FieldGroup>
        <DialogFooter className="flex-row">
          <Button variant="outline" className="h-10 flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="h-10 flex-1" onClick={() => setExporting(true)}>
            Export
          </Button>
        </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function OrdersActionsMenu({
  selectedCount,
  totalCount,
  triggerClassName,
}: {
  selectedCount: number
  totalCount: number
  triggerClassName?: string
}) {
  const requestConfirm = useConfirmAction()
  const [exportCsvOpen, setExportCsvOpen] = React.useState(false)
  // With no selection, every order is exported.
  const exportCount = selectedCount > 0 ? selectedCount : totalCount
  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn('h-10 px-3', triggerClassName)}>
          Actions
          {selectedCount > 0 ? (
            <Badge className="ml-0.5 h-5 min-w-5 justify-center px-1 tabular-nums">
              {selectedCount}
            </Badge>
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
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
                  onSelect={
                    action.label === 'Archive'
                      ? () => requestConfirm({ action: 'Archive', onConfirm: () => {} })
                      : action.label === 'Export for Lalamove'
                        ? () =>
                            requestConfirm({
                              action: 'Export for Lalamove',
                              count: exportCount,
                              onConfirm: () => {},
                            })
                      : action.label === 'Export to CSV'
                        ? () => setExportCsvOpen(true)
                      : action.label === 'Copy'
                        ? () =>
                            toast.success(selectedCount > 1 ? 'Orders copied' : 'Order copied')
                        : action.label === 'Mark as Fulfilled'
                          ? () =>
                              toast.success(
                                selectedCount > 1
                                  ? 'Orders marked as fulfilled'
                                  : 'Order marked as fulfilled',
                              )
                          : undefined
                  }
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
    <ExportCsvDialog open={exportCsvOpen} onOpenChange={setExportCsvOpen} count={exportCount} />
    </>
  )
}

export function AdminOrdersAllPage() {
  const [searching, setSearching] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false)
  const [selectMode, setSelectMode] = React.useState(false)
  const [filtersOpen, setFiltersOpen] = React.useState(false)
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const selectedCount = Object.keys(rowSelection).length

  const [orders, setOrders] = React.useState<Order[]>(ORDERS)
  // Selecting a status closes the portaled dropdown, whose follow-up click can
  // land on the row underneath. Suppress row clicks briefly after a change so
  // the detail pane doesn't open.
  const suppressRowClickUntil = React.useRef(0)
  const handleStatusChange = React.useCallback((id: string, status: OrderStatus) => {
    suppressRowClickUntil.current = Date.now() + 300
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status } : order)),
    )
  }, [])
  const columns = React.useMemo(() => getOrderColumns(handleStatusChange), [handleStatusChange])

  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null)
  const selectedOrder = selectedOrderId
    ? (orders.find((order) => order.id === selectedOrderId) ?? null)
    : null

  // Keep the last opened order around so its content stays visible while the
  // pane animates closed.
  const lastOrderRef = React.useRef<Order | null>(null)
  if (selectedOrder) lastOrderRef.current = selectedOrder
  const paneOrder = selectedOrder ?? lastOrderRef.current

  const [channel, setChannel] = React.useState<string | null>(null)
  const [fulfillmentType, setFulfillmentType] = React.useState<string | null>(null)
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null)
  const [activeFilter, setActiveFilter] = React.useState('Active')
  const [dateField, setDateField] = React.useState('fulfillment')
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)

  // Apply the channel, fulfillment type and status filters. The "Approved"
  // status filter also surfaces Paid orders (there's no separate Paid option).
  // The search query matches the order id, customer name or email.
  const filteredOrders = React.useMemo(() => {
    const search = searchQuery.trim().toLowerCase()
    return orders.filter((order) => {
      if (channel && order.channel !== channel) return false
      if (fulfillmentType && order.fulfillment.label !== fulfillmentType) return false
      if (statusFilter) {
        const matches =
          statusFilter === 'Approved'
            ? order.status === 'Approved' || order.status === 'Paid'
            : order.status === statusFilter
        if (!matches) return false
      }
      if (search) {
        const haystack = [order.id, order.customer.name, order.customer.email]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(search)) return false
      }
      return true
    })
  }, [orders, channel, fulfillmentType, statusFilter, searchQuery])

  function resetFilters() {
    setChannel(null)
    setFulfillmentType(null)
    setStatusFilter(null)
    setActiveFilter('Active')
    setDateField('fulfillment')
    setDateRange(undefined)
  }

  // Number of filters currently narrowing the results, used to badge the
  // Filters button. "Active" is the default state so it only counts when changed.
  const activeFilterCount = [
    channel !== null,
    fulfillmentType !== null,
    statusFilter !== null,
    Boolean(dateRange?.from),
    activeFilter !== 'Active',
  ].filter(Boolean).length

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
    <ConfirmActionProvider>
    <div className="flex w-full min-w-0 flex-col gap-4 md:gap-6">
      <TypographyH3 className="text-center md:text-left">All Orders</TypographyH3>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
              'cursor-pointer py-4 shadow-none transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:py-6',
              activeCard === stat.label && 'border-foreground',
            )}
          >
            <CardHeader className="px-4 md:px-6">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums md:text-3xl">
                {stat.count.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Mobile toolbar: search on its own row, then equal-width Filters /
          Actions / Add order. Filters are collapsed into a dialog. */}
      <div className="flex flex-col gap-4 md:hidden">
        {mobileSearchOpen ? (
          <InputGroup className="h-10 w-full">
            <InputGroupAddon>
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search order id, customer info"
              autoFocus
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <InputGroupAddon className="pr-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Dismiss search"
                onClick={() => {
                  setSearchQuery('')
                  setMobileSearchOpen(false)
                }}
              >
                <X className="size-4 text-muted-foreground" />
              </Button>
            </InputGroupAddon>
          </InputGroup>
        ) : (
          <div className="flex w-full items-center justify-between">
            <Button
              variant="ghost"
              className="h-10 px-3"
              disabled={selectMode}
              onClick={() => setMobileSearchOpen(true)}
            >
              <Search className="size-4 text-muted-foreground" />
              Search
            </Button>
            <Button
              variant="ghost"
              className="h-10 px-3"
              onClick={() => {
                if (selectMode) {
                  // Leaving select mode discards the current selection.
                  setRowSelection({})
                  setSelectMode(false)
                } else {
                  // Entering select mode collapses any open order detail.
                  setSelectedOrderId(null)
                  setSelectMode(true)
                }
              }}
            >
              {selectMode ? (
                'Cancel'
              ) : (
                <>
                  <SquareDashed className="size-4 text-muted-foreground" />
                  Select
                </>
              )}
            </Button>
          </div>
        )}

        <div className="flex w-full items-center gap-2">
          <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-10 flex-1 px-3" disabled={selectMode}>
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                Filters
                {activeFilterCount > 0 ? (
                  <Badge className="ml-0.5 h-5 min-w-5 justify-center px-1 tabular-nums">
                    {activeFilterCount}
                  </Badge>
                ) : null}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filters</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <SelectFilter
                  label="Channel"
                  options={CHANNEL_OPTIONS}
                  value={channel}
                  onChange={setChannel}
                  className="w-full justify-start"
                  contentClassName="w-(--radix-dropdown-menu-trigger-width)"
                />
                <SelectFilter
                  label="Fulfillment type"
                  options={FULFILLMENT_TYPE_OPTIONS}
                  value={fulfillmentType}
                  onChange={setFulfillmentType}
                  className="w-full justify-start"
                  contentClassName="w-(--radix-dropdown-menu-trigger-width)"
                />
                <DatesFilter
                  field={dateField}
                  onFieldChange={setDateField}
                  appliedRange={dateRange}
                  onApply={setDateRange}
                  className="w-full justify-start"
                  contentClassName="w-(--radix-popover-trigger-width)"
                />
                <SelectFilter
                  label="Status"
                  options={STATUS_OPTIONS}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  className="w-full justify-start"
                  contentClassName="w-(--radix-dropdown-menu-trigger-width)"
                />
                <ActiveFilter
                  value={activeFilter}
                  onChange={setActiveFilter}
                  className="w-full justify-start"
                  contentClassName="w-(--radix-dropdown-menu-trigger-width)"
                />
              </div>
              <DialogFooter className="flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    resetFilters()
                    setFiltersOpen(false)
                  }}
                >
                  Clear
                </Button>
                <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
                  Done
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <OrdersActionsMenu
            selectedCount={selectedCount}
            totalCount={filteredOrders.length}
            triggerClassName="flex-1"
          />

          <Button className="h-10 flex-1 px-3" onClick={navigateToAddOrder}>
            <Plus className="size-4" />
            Add order
          </Button>
        </div>
      </div>

      {/* Desktop toolbar: inline filters with a toggleable search field. */}
      <div className="hidden flex-wrap items-center gap-2 md:flex">
        {searching ? (
          <InputGroup className="h-10 w-auto max-w-[400px] flex-1">
            <InputGroupAddon>
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search order id, customer info"
              autoFocus
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              // Collapse back to the filter buttons when the field is left empty.
              onBlur={() => {
                if (searchQuery.trim() === '') setSearching(false)
              }}
            />
            <InputGroupAddon className="pr-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Dismiss search"
                onClick={() => {
                  setSearchQuery('')
                  setSearching(false)
                }}
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
          <OrdersActionsMenu selectedCount={selectedCount} totalCount={filteredOrders.length} />

          <Button className="h-10 px-3" onClick={navigateToAddOrder}>
            <Plus className="size-4" />
            Add order
          </Button>
        </div>
      </div>

      {/* Mobile: orders as a card list, with the detail pane expanding below
          the tapped card. Tapping the same card again collapses it. */}
      <div className="-mx-4 flex flex-col divide-y divide-border sm:-mx-6 md:hidden">
        {filteredOrders.map((order) => {
          const expanded = order.id === selectedOrderId
          const FulfillmentIcon = order.fulfillment.icon
          const isSelected = Boolean(rowSelection[order.id])
          const toggleSelected = () =>
            setRowSelection((prev) => {
              const next = { ...prev }
              if (next[order.id]) {
                delete next[order.id]
              } else {
                next[order.id] = true
              }
              return next
            })
          const handleActivate = () => {
            if (Date.now() < suppressRowClickUntil.current) return
            if (selectMode) {
              toggleSelected()
            } else {
              setSelectedOrderId(expanded ? null : order.id)
            }
          }
          return (
            <div key={order.id}>
              <div
                role="button"
                tabIndex={0}
                aria-expanded={selectMode ? undefined : expanded}
                aria-pressed={selectMode ? isSelected : undefined}
                onClick={handleActivate}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleActivate()
                  }
                }}
                className="flex w-full flex-col gap-1 px-4 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-6"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <img
                      src={CHANNEL_ICON_SRC[order.channel]}
                      alt={order.channel}
                      className="size-6 shrink-0"
                    />
                    <p className="text-sm font-semibold text-foreground">{order.id}</p>
                  </div>
                  {/* Stop propagation so changing status doesn't toggle the card. */}
                  <span onClick={(event) => event.stopPropagation()}>
                    <StatusPill
                      status={order.status}
                      category={getStatusCategory(order.payment)}
                      onChange={(status) => handleStatusChange(order.id, status)}
                      orderId={order.id}
                      customerEmail={order.customer.email}
                      paymentMethod={order.payment.method}
                      total={order.total}
                      className="h-9 w-auto text-xs"
                      iconClassName="size-4"
                    />
                  </span>
                </div>
                {order.customer.name ? (
                  <CustomerDetails customer={order.customer} />
                ) : null}
                <p className="text-sm text-muted-foreground">
                  {order.items.join(', ')}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <FulfillmentIcon className="size-4 shrink-0" />
                    <span>
                      {formatDate(order.fulfillAt)} · {formatTime(order.fulfillAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {formatCurrency(order.total)}
                    </p>
                    {selectMode ? (
                      <Checkbox
                        checked={isSelected}
                        aria-hidden
                        tabIndex={-1}
                        className="pointer-events-none size-4 shrink-0"
                      />
                    ) : (
                      <ChevronDown
                        className={cn(
                          'size-4 shrink-0 text-muted-foreground transition-transform',
                          !expanded && '-rotate-90',
                        )}
                      />
                    )}
                  </div>
                </div>
              </div>
              {expanded ? (
                <div className="px-4 pb-4 sm:px-6">
                  <OrderDetailPane
                    order={order}
                    onClose={() => setSelectedOrderId(null)}
                    onStatusChange={handleStatusChange}
                    hideTitle
                    hideClose
                    className="max-h-none w-full overflow-visible rounded-lg border border-border bg-muted/50"
                  />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      {/* Desktop: orders data table + detail side pane */}
      <div className="hidden md:flex">
        <div className="min-w-0 flex-1">
          <DataTable
            columns={columns}
            data={filteredOrders}
            defaultSorting={[{ id: 'orderedAt', desc: true }]}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            onRowClick={(order) => {
              if (Date.now() < suppressRowClickUntil.current) return
              setSelectedOrderId(order.id)
            }}
            isRowActive={(order) => order.id === selectedOrderId}
            tableClassName={selectedOrder ? 'min-w-[820px]' : undefined}
          />
        </div>
        {/* Pane stays mounted so its width/margin can animate in and out, which
            in turn smoothly resizes the flex table beside it. */}
        <div
          className={cn(
            'sticky top-4 shrink-0 self-start overflow-hidden transition-[width,margin] duration-300 ease-in-out',
            selectedOrder ? 'ml-6 w-[360px]' : 'ml-0 w-0',
          )}
        >
          {paneOrder ? (
            <OrderDetailPane
              order={paneOrder}
              onClose={() => setSelectedOrderId(null)}
              onStatusChange={handleStatusChange}
            />
          ) : null}
        </div>
      </div>
    </div>
    </ConfirmActionProvider>
  )
}
