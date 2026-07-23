import * as React from 'react'
import {
  Archive,
  ArrowLeft,
  Banknote,
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  ChevronRight,
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
  Trash2,
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
import MotorcycleIcon from '@/assets/vehicles/motorcycle.svg?react'
import SedanIcon from '@/assets/vehicles/sedan.svg?react'
import MpvIcon from '@/assets/vehicles/mpv.svg?react'
import TruckVehicleIcon from '@/assets/vehicles/truck.svg?react'

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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { Combobox as ComboboxPrimitive } from '@base-ui/react'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Kbd } from '@/components/ui/kbd'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Progress } from '@/components/ui/progress'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

export const CHANNEL_OPTIONS: FilterOption[] = (Object.keys(CHANNEL_ICON_SRC) as Channel[]).map(
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
    { label: 'Receipt', icon: Mail },
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
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  // Only show the year when it differs from the current year.
  if (date.getFullYear() !== new Date().getFullYear()) {
    options.year = 'numeric'
  }
  return date.toLocaleDateString('en-US', options)
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
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

// Client-side navigation to a full-page order detail view. The order id rides
// in the query string since the router matches on pathname only.
function navigateToOrderDetail(orderId: string) {
  window.history.pushState(null, '', `/admin/orders/detail?order=${encodeURIComponent(orderId)}`)
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

  // The table sorts by date (newest first) with 10 rows per page, and year is
  // the most significant part of a date. So making the first 3 orders 2027, the
  // next 4 orders 2026 and every remaining order 2025 lands the first page as
  // 3×2027, 4×2026, 3×2025 and leaves all later pages in 2025. Fulfillment is
  // always a few (5–25) hours after the order, so it stays in the same year.
  const year = i < 3 ? 2027 : i < 7 ? 2026 : 2025
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

export function SelectFilter({
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
  variant = 'popover',
}: {
  field: string
  onFieldChange: (value: string) => void
  appliedRange: DateRange | undefined
  onApply: (range: DateRange | undefined) => void
  className?: string
  contentClassName?: string
  variant?: 'popover' | 'collapsible'
}) {
  const [open, setOpen] = React.useState(false)
  const [range, setRange] = React.useState<DateRange | undefined>(appliedRange)
  const [draftField, setDraftField] = React.useState(field)

  const active = Boolean(appliedRange?.from)
  const canClear = Boolean(range?.from || appliedRange?.from)
  const canApply = !rangesEqual(range, appliedRange) || draftField !== field

  const fieldLabel = field === 'order' ? 'Order' : 'Fulfillment'

  function formatRange(value: DateRange | undefined) {
    if (value?.from && value?.to)
      return `${formatDate(value.from)} – ${formatDate(value.to)}`
    if (value?.from) return formatDate(value.from)
    return null
  }

  const rangeLabel = formatRange(range) ?? 'Select dates'
  const appliedLabel = formatRange(appliedRange)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setRange(appliedRange)
      setDraftField(field)
    }
  }

  function clearAll() {
    setRange(undefined)
    setDraftField(field)
    onApply(undefined)
    setOpen(false)
  }

  function apply() {
    onFieldChange(draftField)
    onApply(range)
    setOpen(false)
  }

  const body = (
    <>
      <Tabs value={draftField} onValueChange={setDraftField}>
        <TabsList className="w-full">
          <TabsTrigger value="fulfillment">Fulfillment date</TabsTrigger>
          <TabsTrigger value="order">Order date</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-3 flex h-10 w-full items-center gap-2 rounded-md border border-input bg-muted/40 px-3">
        <CalendarIcon className="size-4 text-muted-foreground" />
        <span className={range?.from ? 'text-sm' : 'text-sm text-muted-foreground'}>
          {rangeLabel}
        </span>
      </div>

      <div className="mt-3 flex justify-center">
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          numberOfMonths={1}
        />
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
    </>
  )

  // On mobile the filter lives inside the Filters dialog, where a floating
  // popover would overflow the dialog. Render an inline collapsible instead.
  if (variant === 'collapsible') {
    return (
      <Collapsible open={open} onOpenChange={handleOpenChange}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className={cn(FILTER_BUTTON_CLASS, active && FILTER_BUTTON_ACTIVE_CLASS, className)}
          >
            {active ? `${fieldLabel}: ${appliedLabel}` : 'Dates'}
            {active ? (
              <ClearFilterButton label="Dates" onClear={clearAll} />
            ) : (
              <ChevronDown
                className={cn('ml-auto size-4 transition-transform', open && 'rotate-180')}
              />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 rounded-md border border-input p-3">{body}</div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(FILTER_BUTTON_CLASS, active && FILTER_BUTTON_ACTIVE_CLASS, className)}
        >
          {active ? `${fieldLabel}: ${appliedLabel}` : 'Dates'}
          {active ? (
            <ClearFilterButton label="Dates" onClear={clearAll} />
          ) : (
            <ChevronDown className="ml-auto size-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn('w-[300px] p-3', contentClassName)}>
        {body}
      </PopoverContent>
    </Popover>
  )
}

// Collapses the inline filter buttons into a single "Filters" button that opens
// a dialog. Used both on mobile and on narrow desktop widths (below xl). The
// trigger badges the number of active filters; "Clear" resets them all.
function FiltersDialog({
  open,
  onOpenChange,
  activeFilterCount,
  channel,
  onChannelChange,
  fulfillmentType,
  onFulfillmentTypeChange,
  dateField,
  onDateFieldChange,
  dateRange,
  onDateRangeChange,
  statusFilter,
  onStatusFilterChange,
  activeFilter,
  onActiveFilterChange,
  onClear,
  triggerClassName,
  disabled,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeFilterCount: number
  channel: string | null
  onChannelChange: (value: string | null) => void
  fulfillmentType: string | null
  onFulfillmentTypeChange: (value: string | null) => void
  dateField: string
  onDateFieldChange: (value: string) => void
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  statusFilter: string | null
  onStatusFilterChange: (value: string | null) => void
  activeFilter: string
  onActiveFilterChange: (value: string) => void
  onClear: () => void
  triggerClassName?: string
  disabled?: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn('h-10 px-3', triggerClassName)} disabled={disabled}>
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          Filters
          {activeFilterCount > 0 ? (
            <Badge className="ml-0.5 h-5 min-w-5 justify-center px-1 tabular-nums">
              {activeFilterCount}
            </Badge>
          ) : null}
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[100dvh] max-h-none w-screen max-w-none rounded-none sm:h-auto sm:max-h-[calc(100svh-2rem)] sm:w-full sm:max-w-md sm:rounded-xl [&_[data-slot=dialog-close]]:size-10">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle asChild>
              <TypographyH4 className="text-center font-semibold">Filters</TypographyH4>
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="grid gap-3">
            <SelectFilter
              label="Channel"
              options={CHANNEL_OPTIONS}
              value={channel}
              onChange={onChannelChange}
              className="w-full justify-start"
              contentClassName="w-(--radix-dropdown-menu-trigger-width)"
            />
            <SelectFilter
              label="Fulfillment type"
              options={FULFILLMENT_TYPE_OPTIONS}
              value={fulfillmentType}
              onChange={onFulfillmentTypeChange}
              className="w-full justify-start"
              contentClassName="w-(--radix-dropdown-menu-trigger-width)"
            />
            <DatesFilter
              variant="collapsible"
              field={dateField}
              onFieldChange={onDateFieldChange}
              appliedRange={dateRange}
              onApply={onDateRangeChange}
              className="w-full justify-start"
            />
            <SelectFilter
              label="Status"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={onStatusFilterChange}
              className="w-full justify-start"
              contentClassName="w-(--radix-dropdown-menu-trigger-width)"
            />
            <ActiveFilter
              value={activeFilter}
              onChange={onActiveFilterChange}
              className="w-full justify-start"
              contentClassName="w-(--radix-dropdown-menu-trigger-width)"
            />
          </DialogBody>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              className="h-10 flex-1"
              onClick={() => {
                onClear()
                onOpenChange(false)
              }}
            >
              Clear
            </Button>
            <Button className="h-10 flex-1" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Refund dialog for automated-payment orders. The amount defaults to the order
// total and can be edited or reset via "Full refund"; an optional switch also
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
        <DialogBody>
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
              variant="secondary"
              className="h-9"
              onClick={() => setAmount(total.toFixed(2))}
            >
              Full refund
            </Button>
          </div>
          <FieldLabel
            htmlFor="refund-cancel-order"
            className="w-full flex-col items-start gap-1 font-normal"
          >
            <div className="flex w-full items-center justify-between gap-3">
              <FieldTitle>Cancel order</FieldTitle>
              <Switch
                id="refund-cancel-order"
                checked={cancelOrder}
                onCheckedChange={setCancelOrder}
              />
            </div>
            <FieldDescription>
              Inventory will be restocked and order will be excluded from order summary
            </FieldDescription>
          </FieldLabel>
          </FieldGroup>
        </DialogBody>
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

  // Pending and Approved/Paid get a colored, translucent-background treatment
  // (like the destructive button style); every other status keeps the default
  // secondary look.
  let statusTriggerClass: string | undefined
  if (status === 'Pending') {
    statusTriggerClass = 'bg-primary/10 hover:bg-primary/20 aria-expanded:bg-primary/10'
  } else if (status === 'Approved' || status === 'Paid') {
    statusTriggerClass = 'bg-[#2040B0]/10 hover:bg-[#2040B0]/20 aria-expanded:bg-[#2040B0]/10'
  }

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className={cn('h-10 w-[152px] px-3 font-medium', statusTriggerClass, className)}
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
    return null
  }

  return <p className="text-sm text-muted-foreground">{customer.name}</p>
}

function formatDateTime(date: Date) {
  return `${formatDate(date)}, ${formatTime(date)}`
}

function parseLineItem(raw: string) {
  const match = raw.match(/^(\d+)x\s+(.*)$/)
  return match ? { qty: Number(match[1]), name: match[2] } : { qty: 1, name: raw }
}

// Render a raw line item ("1x Latte") as "1 Latte" — quantity without the "x".
function formatLineItem(raw: string) {
  const { qty, name } = parseLineItem(raw)
  return `${qty} ${name}`
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
        <TypographyLarge className="text-lg">{title}</TypographyLarge>
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
    <div className="flex gap-[18px]">
      <Icon className="ml-1.5 size-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="flex h-5 items-center text-sm text-muted-foreground">{label}</p>
        <div className="space-y-0.5 text-base text-foreground">{children}</div>
      </div>
    </div>
  )
}

function ContactPhone({ phone }: { phone: string }) {
  return (
    <p className="flex items-center gap-1.5">
      <CopyableText value={phone} />
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

// Clickable text that copies `value` to the clipboard and flashes a "Copied"
// tooltip for 2 seconds. Used for order detail fields on desktop and mobile.
function CopyableText({
  value,
  children,
  className,
}: {
  value: string
  children?: React.ReactNode
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function handleCopy() {
    navigator.clipboard?.writeText(value)
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 2000)
  }

  React.useEffect(() => () => clearTimeout(timer.current), [])

  // Only the "Copied" confirmation shows; there's no "Copy" hint on hover.
  return (
    <Tooltip open={copied}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            'cursor-pointer text-left transition-colors hover:text-muted-foreground',
            className,
          )}
        >
          {children ?? value}
        </button>
      </TooltipTrigger>
      <TooltipContent className="data-[state=instant-open]:animate-in data-[state=instant-open]:fade-in-0 data-[state=instant-open]:zoom-in-95 data-[state=instant-open]:slide-in-from-bottom-1 data-[state=instant-open]:duration-200">
        Copied
      </TooltipContent>
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
  // Anchors the popover to the value area so it spans the full available width.
  const anchor = React.useRef<HTMLDivElement | null>(null)
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

  function removeTag(tag: string) {
    setValue((prev) => prev.filter((t) => t !== tag))
  }

  // Shared chip styling for selected tags and the "Add" button.
  const chipClass =
    'inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-1 text-base font-normal text-secondary-foreground'

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
      {/* Selected tags render directly in the field, followed by an "Add"
          button (styled like a tag) that opens the searchable tag list. */}
      <div ref={anchor} className="mt-1 flex flex-wrap items-center gap-1.5">
        {value.map((tag) => (
          <span key={tag} className={chipClass}>
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => removeTag(tag)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </span>
        ))}
        <ComboboxPrimitive.Trigger
          render={
            <button
              type="button"
              className={cn(
                chipClass,
                'text-muted-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] hover:text-foreground',
              )}
            >
              <Plus className="size-4" />
              Add
            </button>
          }
        />
      </div>
      <ComboboxContent anchor={anchor}>
        <ComboboxInput
          placeholder="Search tags…"
          showTrigger={false}
          className="m-3! h-10! bg-white! pl-2"
        />
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
  const [editing, setEditing] = React.useState(false)

  function startEdit() {
    setValue(saved)
    setEditing(true)
  }

  function cancel() {
    setValue(saved)
    setEditing(false)
  }

  function save() {
    setSaved(value)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="mt-1 space-y-2">
        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Add notes about customer"
          className="min-h-10 bg-background text-sm"
          autoFocus
        />
        <div className="flex gap-2">
          <Button variant="outline" size="lg" className="px-3" onClick={cancel}>
            Cancel
          </Button>
          <Button size="lg" className="px-3" onClick={save}>
            Save
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-1 flex items-center justify-between gap-2">
      <p className={cn('text-base', saved ? 'text-foreground' : 'text-muted-foreground')}>
        {saved || 'Empty'}
      </p>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Edit notes"
        className="shrink-0 text-foreground"
        onClick={startEdit}
      >
        <Pencil className="size-4" />
      </Button>
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
  onBack,
  stickyActions = false,
}: {
  order: Order
  onClose: () => void
  onStatusChange: (id: string, status: OrderStatus) => void
  className?: string
  hideTitle?: boolean
  hideClose?: boolean
  // When provided, a back button is shown before the order id in the header.
  onBack?: () => void
  // When true, the action toolbar sticks to the top while the pane scrolls.
  stickyActions?: boolean
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

  // The per-action toolbar (Edit / Receipt / Delivery / Copy / Archive as one
  // horizontal bar) is disabled — these actions now live in the header "Actions"
  // dropdown on mobile. Kept commented in case we re-enable the bar later.
  /*
  const actionToolbar = (
    <div
      className={cn(
        'flex items-stretch border-border bg-background p-1',
        stickyActions ? 'sticky bottom-0 z-20 h-16 border-t' : 'border-b',
      )}
    >
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
  )
  */

  return (
    <aside
      className={cn(
        // Default (desktop) max height leaves room for the sticky filters/actions
        // row above the pane (top-[72px]) plus a 16px bottom margin. The
        // full-page mobile view overrides this with max-h-none.
        'max-h-[calc(100vh-88px)] w-[360px] overflow-y-auto rounded-lg border border-border',
        className,
      )}
    >
      {/* The action toolbar at the top of the desktop pane is disabled for now;
          we may re-enable it later. The mobile full-page view still shows it
          pinned to the bottom (rendered below). */}
      {/* {stickyActions ? null : actionToolbar} */}

      <Tabs defaultValue="order" className="gap-0">
      {/* Header: title row + the tab switcher */}
      <div className="space-y-4 p-4">
        {hideTitle ? null : stickyActions ? (
          // Mobile full-page layout: a centered order id, then a row with the
          // status dropdown and an "Actions" dropdown, each filling half the row.
          <div className="space-y-4">
            <div className="relative flex h-10 items-center justify-center">
              {onBack ? (
                <Button
                  variant="outline"
                  size="icon-lg"
                  aria-label="Back to orders"
                  className="absolute left-0 text-foreground"
                  onClick={onBack}
                >
                  <ArrowLeft className="size-5" />
                </Button>
              ) : null}
              <TypographyH4>{order.id}</TypographyH4>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill
                status={order.status}
                category={getStatusCategory(order.payment)}
                onChange={(status) => onStatusChange(order.id, status)}
                orderId={order.id}
                customerEmail={order.customer.email}
                paymentMethod={order.payment.method}
                total={order.total}
                className="w-full flex-1"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="h-10 flex-1 px-3 font-medium">
                    Actions
                    <ChevronDown className="ml-auto size-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {DETAIL_ACTIONS.map((action) => {
                    const Icon = action.icon
                    const confirmAction =
                      action.label in CONFIRM_COPY ? (action.label as ConfirmableAction) : null
                    return (
                      <DropdownMenuItem
                        key={action.label}
                        onSelect={
                          confirmAction
                            ? () =>
                                requestConfirm({
                                  action: confirmAction,
                                  orderId: order.id,
                                  customerEmail: order.customer.email,
                                  onConfirm: () => {},
                                })
                            : action.label === 'Edit'
                              ? () => {
                                  window.history.pushState(null, '', '/admin/orders/edit')
                                  window.dispatchEvent(new PopStateEvent('popstate'))
                                }
                              : action.label === 'Copy'
                                ? () => toast.success('Order copied')
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
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              {onBack ? (
                <Button
                  variant="outline"
                  size="icon-lg"
                  aria-label="Back to orders"
                  className="shrink-0 text-foreground"
                  onClick={onBack}
                >
                  <ArrowLeft className="size-5" />
                </Button>
              ) : null}
              <TypographyH4>{order.id}</TypographyH4>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StatusPill
                status={order.status}
                category={getStatusCategory(order.payment)}
                onChange={(status) => onStatusChange(order.id, status)}
                orderId={order.id}
                customerEmail={order.customer.email}
                paymentMethod={order.payment.method}
                total={order.total}
              />
              {hideClose ? null : (
                <Button
                  variant="secondary"
                  size="icon-lg"
                  aria-label="Close"
                  className="text-muted-foreground"
                  onClick={onClose}
                >
                  <X className="size-5" />
                </Button>
              )}
            </div>
          </div>
        )}
        <TabsList className="w-full">
          <TabsTrigger value="order">Order</TabsTrigger>
          {hasCustomer ? <TabsTrigger value="customer">Customer</TabsTrigger> : null}
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="order">
      {/* Channel + ordered time */}
      <div className="flex items-center justify-between gap-2 border-b border-border p-4 text-sm text-muted-foreground md:justify-start">
        <span className="flex items-center gap-1">
          <img src={CHANNEL_ICON_SRC[order.channel]} alt="" className="size-5" />
          {order.channel}
        </span>
        <span aria-hidden className="hidden size-1 rounded-full bg-muted-foreground/40 md:block" />
        <span>{formatDateTime(order.orderedAt)}</span>
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
              {recipient ? <CopyableText value={recipient} /> : null}
              {order.customer.phone ? <ContactPhone phone={order.customer.phone} /> : null}
              <CopyableText value={order.gift.message}>"{order.gift.message}"</CopyableText>
            </DetailRow>
          ) : !isInStore && (order.customer.name || order.customer.phone) ? (
            <DetailRow icon={User} label="Customer">
              {order.customer.name ? <CopyableText value={order.customer.name} /> : null}
              {order.customer.phone ? <ContactPhone phone={order.customer.phone} /> : null}
            </DetailRow>
          ) : null}

          {order.address ? (
            <DetailRow icon={MapPin} label="Address">
              <CopyableText value={order.address.join('\n')} className="flex flex-col items-start">
                {order.address.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </CopyableText>
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
                className="size-8 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-base font-medium text-foreground">
                    {item.name}
                    <Kbd className="text-sm text-foreground">{item.qty}</Kbd>
                  </p>
                  <p className="shrink-0 text-base font-normal text-muted-foreground">
                    {formatCurrency(prices[idx])}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Special instructions:</p>
                  <CopyableText value={item.note} className="text-muted-foreground" />
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Add-ons:</p>
                  <CopyableText
                    value={item.addOns.join(', ')}
                    className="text-muted-foreground"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="ml-11 space-y-2 text-sm">
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
            <div className="flex justify-between text-sm font-medium text-foreground">
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
          <CopyableText value={specialRequest} />
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
      </TabsContent>

      {/* Customer — the tab (trigger + content) is hidden when there's no
          customer details for the order (e.g. POS). */}
      {hasCustomer ? (
        <TabsContent value="customer">
        <CollapsibleSection title="Customer">
          <div className="space-y-4">
            {order.customer.name ? (
              <DetailRow icon={User} label="Name">
                <CopyableText value={order.customer.name} />
              </DetailRow>
            ) : null}
            {order.customer.email ? (
              <DetailRow icon={Mail} label="Email">
                <p className="flex items-center gap-1.5">
                  <CopyableText value={order.customer.email} />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="View all orders"
                        className="text-foreground"
                      >
                        <Search className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View all orders</TooltipContent>
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
        </TabsContent>
      ) : null}

      <TabsContent value="activity">
      {/* Activity */}
      <CollapsibleSection title="Activity">
        <ol>
          {activity.map((event, idx) => {
            const isLast = idx === activity.length - 1
            return (
              <li key={`${event.label}-${idx}`} className="flex gap-[18px]">
                <div className="ml-3 flex flex-col items-center">
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
      </TabsContent>
      </Tabs>
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
        <p>
          {formatDate(row.original.orderedAt)}, {formatTime(row.original.orderedAt)}
        </p>
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
          <li key={item}>{formatLineItem(item)}</li>
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Icon className="size-4 shrink-0" />
            </TooltipTrigger>
            <TooltipContent>{row.original.fulfillment.label}</TooltipContent>
          </Tooltip>
          <div className="leading-tight">
            <p>
              {formatDate(row.original.fulfillAt)}, {formatTime(row.original.fulfillAt)}
            </p>
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
          <DialogBody className="flex flex-col items-center gap-4 py-6 text-center">
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
          </DialogBody>
        ) : (
          <>
        <DialogHeader>
          <DialogTitle asChild>
            <TypographyH4 className="text-center font-semibold">Export orders ({count})</TypographyH4>
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
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
            className="w-full items-center justify-between gap-3 font-normal"
          >
            <FieldTitle>Show bundle products separately</FieldTitle>
            <Switch
              id="export-bundle-separately"
              checked={bundleSeparately}
              onCheckedChange={setBundleSeparately}
            />
          </FieldLabel>
          <FieldLabel
            htmlFor="export-include-status"
            className="w-full items-center justify-between gap-3 font-normal"
          >
            <FieldTitle>Include order status</FieldTitle>
            <Switch
              id="export-include-status"
              checked={includeStatus}
              onCheckedChange={setIncludeStatus}
            />
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
        </DialogBody>
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

// The vehicle artwork sits at different scales within each 217×217 viewBox, so
// the motorcycle/sedan/MPV get a taller box to read at a comparable size to the
// truck.
const VEHICLE_OPTIONS: {
  value: string
  label: string
  icon: IconComponent
  iconClassName: string
}[] = [
  { value: 'motorcycle', label: 'Motorcycle', icon: MotorcycleIcon, iconClassName: 'h-12' },
  { value: 'sedan', label: 'Sedan', icon: SedanIcon, iconClassName: 'h-12' },
  { value: 'mpv', label: 'MPV', icon: MpvIcon, iconClassName: 'h-12' },
  { value: 'truck', label: 'Truck', icon: TruckVehicleIcon, iconClassName: 'h-9' },
]

// When to deliver — a segmented radio choice mirroring the "Answer type"
// selector in the order form's custom questions dialog.
const SCHEDULE_OPTIONS: { value: 'now' | 'schedule'; label: string }[] = [
  { value: 'now', label: 'For now' },
  { value: 'schedule', label: 'Schedule' },
]

// Base fare per vehicle used to compute the (mock) delivery total. Additional
// drop-offs beyond the first add a flat per-stop fee.
const VEHICLE_BASE_FARE: Record<string, number> = {
  motorcycle: 49,
  sedan: 120,
  mpv: 180,
  truck: 250,
}
const PER_STOP_FARE = 35

// The merchant's pickup location, shown as the first stop in the route.
const PICKUP_LOCATION = [
  '113 Doña Soledad Ave, Parañaque, 1709',
  'Metro Manila, Philippines',
]

// Fifteen-minute time slots for the schedule picker. For today, start at the
// closest future quarter-hour; for a future date, cover the whole day. Always
// stops at 11:45 PM.
function buildTimeSlots(date: Date, now: Date) {
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  let minMinutes = 0
  if (isToday) {
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    // Closest future 15-minute interval (strictly after the current time).
    minMinutes = Math.ceil((nowMinutes + 1) / 15) * 15
  }
  const slots: { value: string; label: string }[] = []
  for (let m = minMinutes; m <= 23 * 60 + 45; m += 15) {
    const hours = Math.floor(m / 60)
    const minutes = m % 60
    const slot = new Date(date)
    slot.setHours(hours, minutes, 0, 0)
    slots.push({
      value: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      label: formatTime(slot),
    })
  }
  return slots
}

// Split a drop-off address into the street lines and the trailing unit number
// / delivery instruction, which is shown on its own row.
function splitAddress(address?: string[]) {
  const lines = address ?? []
  const hasUnit = lines.length > 1
  return {
    street: hasUnit ? lines.slice(0, -1) : lines,
    unit: hasUnit ? lines[lines.length - 1] : undefined,
  }
}

// Book a Lalamove delivery for the selected orders. Mirrors the Export to CSV
// dialog's chrome (centered title, split footer) with a scrollable body and a
// pinned total.
function DeliveryBookingDialog({
  open,
  onOpenChange,
  orders,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  orders: Order[]
}) {
  // Two-step flow: 1) vehicle, schedule and driver notes; 2) route, options
  // and price.
  const [step, setStep] = React.useState<1 | 2>(1)
  const [vehicle, setVehicle] = React.useState('motorcycle')
  const [schedule, setSchedule] = React.useState<'now' | 'schedule'>('now')
  const [dateOpen, setDateOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [time, setTime] = React.useState('')
  const [stops, setStops] = React.useState<Order[]>(orders)
  // Which drop-off addresses are in edit mode, and their draft text. Edits are
  // ephemeral (no save) — they only swap the address for a textarea.
  const [editingAddressIds, setEditingAddressIds] = React.useState<Set<string>>(() => new Set())
  const [addressDrafts, setAddressDrafts] = React.useState<Record<string, string>>({})
  const [editingPickup, setEditingPickup] = React.useState(false)
  const [pickupDraft, setPickupDraft] = React.useState('')
  const [shortestRoute, setShortestRoute] = React.useState(true)
  const [addNotes, setAddNotes] = React.useState(false)
  const [notes, setNotes] = React.useState('')
  // "Now" is snapshotted when the dialog opens so the time slots start at the
  // right quarter-hour without ticking while the dialog is open.
  const [now, setNow] = React.useState(() => new Date())

  // Snapshot the current selection (and reset the form) whenever the dialog
  // opens, so removing a stop here never mutates the table's selection.
  React.useEffect(() => {
    if (!open) return
    const opened = new Date()
    setStep(1)
    setNow(opened)
    setStops(orders)
    setEditingAddressIds(new Set())
    setAddressDrafts({})
    setEditingPickup(false)
    setPickupDraft(PICKUP_LOCATION.join('\n'))
    setSchedule('now')
    setDate(opened)
    // Preselect the closest available slot so Schedule is ready to book.
    setTime(buildTimeSlots(opened, opened)[0]?.value ?? '')
    setDateOpen(false)
  }, [open, orders])

  const timeSlots = React.useMemo(
    () => buildTimeSlots(date ?? now, now),
    [date, now],
  )

  const total =
    (VEHICLE_BASE_FARE[vehicle] ?? 0) + Math.max(0, stops.length - 1) * PER_STOP_FARE

  const scheduleIncomplete = schedule === 'schedule' && (!date || !time)
  const canBook = stops.length > 0 && !scheduleIncomplete

  const dateLabel = date
    ? isSameDay(date, now)
      ? `Today, ${formatDate(date)}`
      : formatDate(date)
    : 'Select date'

  function removeStop(id: string) {
    setStops((prev) => prev.filter((order) => order.id !== id))
  }

  function toggleEditAddress(order: Order) {
    const isEditing = editingAddressIds.has(order.id)
    setEditingAddressIds((prev) => {
      const next = new Set(prev)
      if (isEditing) next.delete(order.id)
      else next.add(order.id)
      return next
    })
    // Seed the draft from the street lines the first time it's edited. The unit
    // number is kept out of the textarea and shown separately below it.
    if (!isEditing && !(order.id in addressDrafts)) {
      setAddressDrafts((drafts) => ({
        ...drafts,
        [order.id]: splitAddress(order.address).street.join('\n'),
      }))
    }
  }

  function handleBook() {
    onOpenChange(false)
    toast.success(
      stops.length > 1 ? `Delivery booked for ${stops.length} orders` : 'Delivery booked',
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="[&_[data-slot=dialog-close]]:size-10">
        <DialogHeader>
          <DialogTitle asChild>
            <TypographyH4 className="text-center font-semibold">
              Deliver with Lalamove
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>
        {/* Two step-progress bars: first fills on step 1, both on step 2. */}
        <div className="flex shrink-0 items-center gap-2 px-6 pt-4">
          <Progress value={100} />
          <Progress value={step === 2 ? 100 : 0} />
        </div>

        <DialogBody className="flex flex-col gap-6">
          {step === 1 ? (
            <>
              {/* Vehicle type — grouped radios in one bordered container, one
                  equal-width column per option. */}
              <FieldSet>
                <FieldLegend variant="label">Vehicle type</FieldLegend>
                <RadioGroup
                  value={vehicle}
                  onValueChange={setVehicle}
                  className="grid grid-cols-4 gap-0 divide-x overflow-hidden rounded-lg border"
                >
                  {VEHICLE_OPTIONS.map((option) => {
                    const Icon = option.icon
                    return (
                      <FieldLabel
                        key={option.value}
                        htmlFor={`vehicle-${option.value}`}
                        className="relative flex w-full flex-col items-center gap-1.5 rounded-none px-2 py-3 text-center font-normal transition-colors hover:bg-muted/50 has-[[data-checked]]:bg-primary/5"
                      >
                        {/* Fixed-height, centered box so every vehicle shares a
                            baseline and the labels line up across cards. */}
                        <span className="flex h-12 w-full items-center justify-center">
                          <Icon className={cn('w-auto', option.iconClassName)} />
                        </span>
                        <span className="text-xs font-medium">{option.label}</span>
                        <RadioGroupItem
                          value={option.value}
                          id={`vehicle-${option.value}`}
                          className="absolute top-2 right-2"
                        />
                      </FieldLabel>
                    )
                  })}
                </RadioGroup>
              </FieldSet>

              {/* When to deliver — For now / Schedule. */}
              <div className="flex flex-col gap-3">
                <FieldSet>
                  <FieldLegend variant="label">Time</FieldLegend>
                  <RadioGroup
                    value={schedule}
                    onValueChange={(value) =>
                      setSchedule(value as 'now' | 'schedule')
                    }
                    className="grid w-full grid-cols-2 gap-0 divide-x overflow-hidden rounded-lg border"
                  >
                    {SCHEDULE_OPTIONS.map((option) => (
                      <FieldLabel
                        key={option.value}
                        htmlFor={`schedule-${option.value}`}
                        className="flex w-full items-center justify-between gap-1 rounded-none px-3 py-3 text-sm font-normal transition-colors hover:bg-muted/50 has-[[data-checked]]:bg-primary/5"
                      >
                        {option.label}
                        <RadioGroupItem
                          value={option.value}
                          id={`schedule-${option.value}`}
                        />
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                </FieldSet>

                {schedule === 'schedule' ? (
                  <Collapsible
                    open={dateOpen}
                    onOpenChange={setDateOpen}
                    className="flex flex-col gap-3"
                  >
                    {/* Date and time sit side by side (equal width, 8px gap)
                        from sm up; the calendar expands full width beneath. A
                        2-column grid keeps both fields exactly the same width
                        regardless of their content. */}
                    <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-2">
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-10 w-full min-w-0 justify-start gap-2 font-normal"
                        >
                          <CalendarIcon className="size-4 text-muted-foreground" />
                          <span className={date ? undefined : 'text-muted-foreground'}>
                            {dateLabel}
                          </span>
                          <ChevronDown
                            className={cn(
                              'ml-auto size-4 text-muted-foreground transition-transform',
                              dateOpen && 'rotate-180',
                            )}
                          />
                        </Button>
                      </CollapsibleTrigger>
                      <div className="min-w-0">
                        <Select value={time} onValueChange={setTime}>
                          <SelectTrigger className="h-10! w-full">
                            <SelectValue placeholder="Select a time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.length > 0 ? (
                              timeSlots.map((slot) => (
                                <SelectItem key={slot.value} value={slot.value}>
                                  {slot.label}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                No times left today
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <CollapsibleContent>
                      <div className="flex justify-center rounded-md border p-2">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(value) => {
                            setDate(value)
                            // Preselect the first available slot for the new day.
                            setTime(buildTimeSlots(value ?? now, now)[0]?.value ?? '')
                            setDateOpen(false)
                          }}
                          disabled={{ before: now }}
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ) : null}
              </div>

              {/* Driver notes — the auto-growing textarea is revealed only when
                  the toggle is on. */}
              <div className="flex flex-col gap-3">
                <FieldLabel
                  htmlFor="add-driver-notes"
                  className="w-full items-center justify-between gap-3 font-normal"
                >
                  <FieldTitle>Add notes to your driver</FieldTitle>
                  <Switch
                    id="add-driver-notes"
                    aria-label="Add notes to your driver"
                    checked={addNotes}
                    onCheckedChange={setAddNotes}
                  />
                </FieldLabel>
                {addNotes ? (
                  <div className="relative">
                    <Textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value.slice(0, 500))}
                      placeholder="Add delivery instructions here"
                      className="min-h-10 bg-background pr-14 text-sm"
                    />
                    <span className="absolute right-3 bottom-2 text-xs text-muted-foreground">
                      {notes.length}/500
                    </span>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              {/* Route — pickup location then each order's drop-off. */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  {/* Pickup row — marker, title and edit action share one line. */}
                  <div className="flex items-center gap-3">
                    <span className="flex size-4 shrink-0 items-center justify-center">
                      <span className="size-3 rounded-full border-2 border-primary" />
                    </span>
                    <p className="min-w-0 flex-1 text-sm font-semibold">Your location</p>
                    {!editingPickup ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0 text-muted-foreground"
                        aria-label="Edit your location"
                        onClick={() => setEditingPickup(true)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-1 pl-7 text-sm text-muted-foreground">
                    {editingPickup ? (
                      <Textarea
                        value={pickupDraft}
                        onChange={(event) => setPickupDraft(event.target.value)}
                        placeholder="Enter your pickup location"
                        className="min-h-10 bg-background text-sm"
                      />
                    ) : (
                      PICKUP_LOCATION.map((line) => <p key={line}>{line}</p>)
                    )}
                  </div>
                </div>

                {stops.map((order) => {
                  const editing = editingAddressIds.has(order.id)
                  const { street, unit } = splitAddress(order.address)
                  return (
                    <div key={order.id} className="flex flex-col gap-1">
                      {/* ID row — pin, order id and the edit/remove actions all
                          share one line. */}
                      <div className="flex items-center gap-3">
                        <MapPin className="size-4 shrink-0 text-muted-foreground" />
                        <p className="min-w-0 flex-1 text-sm font-semibold">{order.id}</p>
                        {/* The pencil is hidden while the textarea is open. */}
                        {!editing ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="shrink-0 text-muted-foreground"
                            aria-label={`Edit address for ${order.id}`}
                            onClick={() => toggleEditAddress(order)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        ) : null}
                        {stops.length > 1 ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="shrink-0 text-muted-foreground"
                            aria-label={`Remove ${order.id}`}
                            onClick={() => removeStop(order.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        ) : null}
                      </div>

                      {/* Address, indented to line up under the order id. */}
                      <div className="flex flex-col gap-1 pl-7 text-sm text-muted-foreground">
                        {editing ? (
                          <Textarea
                            value={addressDrafts[order.id] ?? ''}
                            onChange={(event) =>
                              setAddressDrafts((drafts) => ({
                                ...drafts,
                                [order.id]: event.target.value,
                              }))
                            }
                            placeholder="Enter a delivery address"
                            className="min-h-10 bg-background text-sm"
                          />
                        ) : street.length > 0 ? (
                          <div>
                            {street.map((line) => (
                              <p key={line}>{line}</p>
                            ))}
                          </div>
                        ) : (
                          <p>No delivery address on file</p>
                        )}
                        {/* Unit number / instructions always sit on their own
                            row, and stay visible while editing. */}
                        {unit ? <p>{unit}</p> : null}
                      </div>
                    </div>
                  )
                })}
              </div>

              <FieldLabel
                htmlFor="delivery-shortest-route"
                className="w-full items-center justify-between gap-3 font-normal"
              >
                <FieldTitle>Get the shortest route</FieldTitle>
                <Switch
                  id="delivery-shortest-route"
                  checked={shortestRoute}
                  onCheckedChange={setShortestRoute}
                />
              </FieldLabel>
            </>
          )}
        </DialogBody>

        <DialogFooter className="flex-col gap-4 sm:flex-col">
          {step === 2 ? (
            <p className="text-center text-lg font-semibold">Total ${total}</p>
          ) : null}
          <div className="flex gap-2">
            {step === 1 ? (
              <>
                <Button
                  variant="outline"
                  className="h-10 flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="h-10 flex-1"
                  onClick={() => setStep(2)}
                  disabled={scheduleIncomplete}
                >
                  Next
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="h-10 flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button className="h-10 flex-1" onClick={handleBook} disabled={!canBook}>
                  Book Delivery
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function OrdersActionsMenu({
  selectedCount,
  selectedOrders,
  totalCount,
  triggerClassName,
}: {
  selectedCount: number
  selectedOrders: Order[]
  totalCount: number
  triggerClassName?: string
}) {
  const requestConfirm = useConfirmAction()
  const [exportCsvOpen, setExportCsvOpen] = React.useState(false)
  const [deliveryOpen, setDeliveryOpen] = React.useState(false)
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
                    action.label === 'Edit'
                      ? () => {
                          window.history.pushState(null, '', '/admin/orders/edit')
                          window.dispatchEvent(new PopStateEvent('popstate'))
                        }
                      : action.label === 'Archive'
                      ? () => requestConfirm({ action: 'Archive', onConfirm: () => {} })
                      : action.label === 'Receipt'
                        ? () => requestConfirm({ action: 'Receipt', onConfirm: () => {} })
                      : action.label === 'Export for Lalamove'
                        ? () =>
                            requestConfirm({
                              action: 'Export for Lalamove',
                              count: exportCount,
                              onConfirm: () => {},
                            })
                      : action.label === 'Export to CSV'
                        ? () => setExportCsvOpen(true)
                      : action.label === 'Delivery'
                        ? () => setDeliveryOpen(true)
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
    <DeliveryBookingDialog
      open={deliveryOpen}
      onOpenChange={setDeliveryOpen}
      orders={selectedOrders}
    />
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
  // Row selection is keyed by order id (see getRowId), so the selected orders
  // are those whose id is present in the selection map.
  const selectedOrders = React.useMemo(
    () => orders.filter((order) => rowSelection[order.id]),
    [orders, rowSelection],
  )
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
    <div className="flex w-full min-w-0 flex-col gap-2">
      {/* The 8px (gap-2) spacing between the cards, the sticky filters/actions
          row and the table pairs with the row's 16px py to read as 24px. The
          title keeps its original 16/24px spacing to the cards via mb. */}
      <TypographyH3 className="mb-2 text-center md:mb-4 md:text-left">All Orders</TypographyH3>

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
            {/* Mobile: label and number share one row at the same size. Desktop:
                restore the stacked grid with the large number. */}
            <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 md:grid md:items-start md:gap-1.5 md:px-6">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-sm font-semibold tabular-nums md:text-3xl">
                {stat.count.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Mobile toolbar: search on its own row, then equal-width Filters /
          Actions / Add order. Filters are collapsed into a dialog. Sticks to
          the top so it stays reachable while the list scrolls. The top spacing
          splits into an 8px margin (scrolls away when pinned) plus an 8px sticky
          top padding, keeping the at-rest gap to the cards the same.
          Spans the full viewport width (-mx + matching px) so the full-bleed
          card list can't peek through the horizontal padding behind it. */}
      <div className="sticky top-0 z-20 -mx-4 mt-2 flex flex-col gap-2 bg-background px-4 pb-2 pt-2 sm:-mx-6 sm:px-6 md:hidden">
        {mobileSearchOpen ? (
          <InputGroup className="h-10 w-full">
            <InputGroupAddon>
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by ID, customer, product, total"
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
              Order
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
          <FiltersDialog
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            activeFilterCount={activeFilterCount}
            channel={channel}
            onChannelChange={setChannel}
            fulfillmentType={fulfillmentType}
            onFulfillmentTypeChange={setFulfillmentType}
            dateField={dateField}
            onDateFieldChange={setDateField}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            activeFilter={activeFilter}
            onActiveFilterChange={setActiveFilter}
            onClear={resetFilters}
            triggerClassName="flex-1"
            disabled={selectMode}
          />

          <OrdersActionsMenu
            selectedCount={selectedCount}
            selectedOrders={selectedOrders}
            totalCount={filteredOrders.length}
            triggerClassName="flex-1"
          />

          <Button className="h-10 flex-1 px-3" onClick={navigateToAddOrder}>
            <Plus className="size-4" />
            Add order
          </Button>
        </div>
      </div>

      {/* Desktop toolbar: inline filters with a toggleable search field.
          Sticks to the top so the filters/actions stay reachable while the
          table scrolls beneath it. */}
      <div className="sticky top-0 z-20 hidden flex-wrap items-center gap-2 bg-background py-4 md:flex">
        {searching ? (
          <InputGroup className="h-10 w-auto max-w-[400px] flex-1">
            <InputGroupAddon>
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by ID, customer, product, total"
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
              className="h-10 px-3 font-normal text-muted-foreground"
              aria-label="Search orders"
              onClick={() => setSearching(true)}
            >
              <Search className="size-4" />
              Order
            </Button>
            {/* Inline filter buttons at xl and up; below that they collapse
                into the Filters dialog. `contents` lets the buttons keep
                participating in the toolbar's flex layout. */}
            <div className="hidden xl:contents">
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
            </div>
            <div className="xl:hidden">
              <FiltersDialog
                open={filtersOpen}
                onOpenChange={setFiltersOpen}
                activeFilterCount={activeFilterCount}
                channel={channel}
                onChannelChange={setChannel}
                fulfillmentType={fulfillmentType}
                onFulfillmentTypeChange={setFulfillmentType}
                dateField={dateField}
                onDateFieldChange={setDateField}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                activeFilter={activeFilter}
                onActiveFilterChange={setActiveFilter}
                onClear={resetFilters}
              />
            </div>
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          <OrdersActionsMenu
            selectedCount={selectedCount}
            selectedOrders={selectedOrders}
            totalCount={filteredOrders.length}
          />

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
              // On mobile the detail view is its own page rather than an inline
              // expansion below the card.
              navigateToOrderDetail(order.id)
            }
          }
          return (
            <div key={order.id}>
              <div
                role="button"
                tabIndex={0}
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
                  {order.items.map(formatLineItem).join(', ')}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <FulfillmentIcon className="size-4 shrink-0" />
                    <span>
                      {formatDate(order.fulfillAt)}, {formatTime(order.fulfillAt)}
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
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
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
            getRowId={(order) => order.id}
            onRowClick={(order) => {
              if (Date.now() < suppressRowClickUntil.current) return
              setSelectedOrderId(order.id)
              // A row click is a single selection: replace whatever was selected
              // before. Checkbox selection (handled by the table) preserves the
              // previous selection for multi-select.
              setRowSelection({ [order.id]: true })
            }}
            isRowActive={(order) => order.id === selectedOrderId}
            tableClassName={selectedOrder ? 'min-w-[820px]' : undefined}
          />
        </div>
        {/* Pane stays mounted so its width/margin can animate in and out, which
            in turn smoothly resizes the flex table beside it. */}
        <div
          className={cn(
            // top-[72px] clears the sticky toolbar: h-10 buttons (40px) plus its
            // py-4 (32px) white space, so the pane pins just under the bar.
            'sticky top-[72px] shrink-0 self-start overflow-hidden transition-[width,margin] duration-300 ease-in-out',
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

// Full-page order detail, used on mobile where tapping a card opens its own page
// (instead of expanding inline). The order id comes from the `order` query param.
export function AdminOrderDetailPage() {
  const orderId =
    typeof window === 'undefined'
      ? null
      : new URLSearchParams(window.location.search).get('order')
  const [orders, setOrders] = React.useState<Order[]>(ORDERS)
  const order = orders.find((o) => o.id === orderId)

  // Opening a detail page should always start at the top, regardless of how far
  // the list was scrolled when the card was tapped.
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [orderId])

  const handleStatusChange = React.useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
  }, [])

  function goBack() {
    window.history.pushState(null, '', '/admin/orders/all')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <ConfirmActionProvider>
      {order ? (
        <OrderDetailPane
          order={order}
          onClose={goBack}
          onBack={goBack}
          stickyActions
          onStatusChange={handleStatusChange}
          hideClose
          className="max-h-none w-full overflow-visible rounded-none border-0"
        />
      ) : (
        <p className="px-4 text-sm text-muted-foreground">Order not found.</p>
      )}
    </ConfirmActionProvider>
  )
}
