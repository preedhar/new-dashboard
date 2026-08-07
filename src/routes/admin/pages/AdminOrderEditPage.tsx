import * as React from 'react'
import {
  ArrowLeft,
  BadgePercent,
  Calendar as CalendarIcon,
  CircleDot,
  CircleHelp,
  Clock,
  Coins,
  ConciergeBell,
  FileText,
  Gift,
  Landmark,
  Mail,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Package,
  Pencil,
  Phone,
  Plus,
  Receipt,
  ShoppingBag,
  Store,
  Tag,
  Trash2,
  Truck,
  User,
} from 'lucide-react'
import { toast } from 'sonner'

import { Combobox as ComboboxPrimitive } from '@base-ui/react'

import PendingIcon from '@/assets/status/pending.svg?react'
import PaidIcon from '@/assets/status/paid.svg?react'
import FulfilledIcon from '@/assets/status/fulfilled.svg?react'
import CancelledIcon from '@/assets/status/cancelled.svg?react'
import RejectedIcon from '@/assets/status/rejected.svg?react'
import productImage from '@/assets/product.png'

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
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Kbd } from '@/components/ui/kbd'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { TypographyH4, TypographyLarge } from '@/components/ui/typography'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  useComboboxAnchor,
} from '@/components/ui/combobox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type IconComponent = React.ComponentType<{ className?: string }>

type OptionWithIcon = { label: string; icon: IconComponent }

const STATUS_OPTIONS: OptionWithIcon[] = [
  { label: 'Pending', icon: PendingIcon },
  { label: 'Approved', icon: PaidIcon },
  { label: 'Fulfilled', icon: FulfilledIcon },
  { label: 'Canceled', icon: CancelledIcon },
  { label: 'Rejected', icon: RejectedIcon },
]

const FULFILLMENT_TYPES: OptionWithIcon[] = [
  { label: 'Delivery Zone 1 (0-3km)', icon: Truck },
  { label: 'Delivery Zone 2 (3-5Km)', icon: Truck },
  { label: 'Delivery Zone 3 (5+ KM)', icon: Truck },
  { label: 'Pickup method 1', icon: ShoppingBag },
  { label: 'Pickup method 2', icon: ShoppingBag },
  { label: 'In-store', icon: Store },
]

const TIME_SLOTS = [
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
] as const

const PRODUCT_OPTIONS = [
  'Classic Croissant',
  'Almond Croissant',
  'Sourdough Loaf',
  'Chocolate Chip Cookie',
  'Matcha Latte',
  'Cold Brew',
] as const

type OrderEditForm = {
  // Customer
  customerName: string
  customerPhoneCountry: string
  customerPhone: string
  customerEmail: string
  status: string
  // Fulfillment
  fulfillDate: Date | undefined
  timeSlot: string
  fulfillType: string
  address: string
  instructions: string
  giftRecipientName: string
  giftRecipientPhoneCountry: string
  giftRecipientPhone: string
  giftMessage: string
  // Other charges
  fulfillmentFee: string
  promotionalDiscount: string
  serviceCharge: string
  gst: string
  tip: string
  // Other questions
  specialRequests: string
  // Items
  items: OrderItem[]
}

type OrderItem = {
  id: string
  product: string
  unitPrice: string
  quantity: string
  discount: string
  instructions: string
  instructionsSurcharge: string
  addOns: string
  addonsSurcharge: string
}

// Everything the item dialog edits; the page assigns the id on save.
type OrderItemDraft = Omit<OrderItem, 'id'>

// Monotonic id source for items. A module-level counter keeps ids stable across
// dialog remounts. Mirrors the product form page.
let idCounter = 0
function nextId(prefix: string) {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

function itemDraft(item: OrderItem | null): OrderItemDraft {
  return {
    product: item?.product ?? '',
    unitPrice: item?.unitPrice ?? '',
    quantity: item?.quantity ?? '1',
    discount: item?.discount ?? '',
    instructions: item?.instructions ?? '',
    instructionsSurcharge: item?.instructionsSurcharge ?? '',
    addOns: item?.addOns ?? '',
    addonsSurcharge: item?.addonsSurcharge ?? '',
  }
}

function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`
}

// What the line costs: the unit price times how many of it, then the
// customization surcharges added and the discount taken off — those three price
// the line as a whole rather than each unit. A discount bigger than the rest
// takes the line to zero rather than below it.
function lineItemPrice(item: OrderItem) {
  const amount = (value: string) => Number.parseFloat(value) || 0
  const quantity = Number.parseInt(item.quantity, 10) || 1
  const total =
    amount(item.unitPrice) * quantity +
    amount(item.instructionsSurcharge) +
    amount(item.addonsSurcharge) -
    amount(item.discount)
  return Math.max(0, total)
}

// The special instructions and add-ons an item was ordered with — what the
// product form calls its customizations.
function hasCustomizations(item: OrderItem) {
  return item.instructions.trim() !== '' || item.addOns.trim() !== ''
}

// What the order comes to: every line it's for, plus the charges that price the
// order as a whole. A charge that sits behind a switch only counts while that
// switch is on, since the value stays in the form when it's turned off. Rounded
// to cents so the summary can compare two totals as the numbers it prints.
function orderTotal(form: OrderEditForm, enabled: Record<string, boolean>) {
  const amount = (value: string) => Number.parseFloat(value) || 0
  const optional = (key: string, value: string) =>
    enabled[key] ? amount(value) : 0
  const items = form.items.reduce((sum, item) => sum + lineItemPrice(item), 0)
  const total =
    items +
    optional('fulfillmentFee', form.fulfillmentFee) -
    optional('promotionalDiscount', form.promotionalDiscount) +
    optional('tip', form.tip) +
    amount(form.serviceCharge) +
    amount(form.gst)
  return Math.round(Math.max(0, total) * 100) / 100
}

const INITIAL_FORM: OrderEditForm = {
  customerName: '',
  customerPhoneCountry: 'US',
  customerPhone: '',
  customerEmail: '',
  status: 'Pending',
  fulfillDate: undefined,
  timeSlot: '',
  fulfillType: '',
  address: '',
  instructions: '',
  giftRecipientName: '',
  giftRecipientPhoneCountry: 'US',
  giftRecipientPhone: '',
  giftMessage: '',
  fulfillmentFee: '',
  promotionalDiscount: '',
  serviceCharge: '',
  gst: '',
  tip: '',
  specialRequests: '',
  items: [],
}

// The order the edit page opens on. There's no order store behind these screens
// yet, so it stands in for a fetch — and the summary needs something to compare
// against, since "New Total" only means anything next to what the order was
// placed for. Mirrors EDIT_FORM on the product form page.
const EDIT_FORM: OrderEditForm = {
  ...INITIAL_FORM,
  customerName: 'Jane Doe',
  customerPhone: '812 3456 7890',
  customerEmail: 'jane@example.com',
  status: 'Approved',
  timeSlot: '11:00 AM',
  fulfillType: 'Delivery Zone 1 (0-3km)',
  address: '18 Boon Lay Way, Singapore 609966',
  fulfillmentFee: '1.50',
  serviceCharge: '0.25',
  gst: '0.25',
  items: [
    {
      ...itemDraft(null),
      id: 'seed-item-latte',
      product: 'Matcha Latte',
      unitPrice: '6.50',
      quantity: '2',
    },
    {
      ...itemDraft(null),
      id: 'seed-item-croissant',
      product: 'Almond Croissant',
      unitPrice: '4.80',
      quantity: '1',
    },
  ],
}

// Which optional fields the form opens with switched on: the ones the order
// already carries a value for.
function enabledFieldsFor(form: OrderEditForm): Record<string, boolean> {
  const filled = (value: string) => value.trim() !== ''
  const isGift =
    filled(form.giftRecipientName) ||
    filled(form.giftRecipientPhone) ||
    filled(form.giftMessage)
  return {
    customerPhone: filled(form.customerPhone),
    customerEmail: filled(form.customerEmail),
    address: filled(form.address),
    instructions: filled(form.instructions),
    giftOrder: isGift,
    giftMessage: filled(form.giftMessage),
    specialRequests: filled(form.specialRequests),
    fulfillmentFee: filled(form.fulfillmentFee),
    promotionalDiscount: filled(form.promotionalDiscount),
    tip: filled(form.tip),
  }
}

type Country = { name: string; code: string; dial: string; flag: string }

// Sorted alphabetically by country name, matching the reference dropdown.
const COUNTRIES: Country[] = [
  { name: 'Australia', code: 'AU', dial: '+61', flag: '🇦🇺' },
  { name: 'Brazil', code: 'BR', dial: '+55', flag: '🇧🇷' },
  { name: 'Canada', code: 'CA', dial: '+1', flag: '🇨🇦' },
  { name: 'China', code: 'CN', dial: '+86', flag: '🇨🇳' },
  { name: 'Curacao', code: 'CW', dial: '+599', flag: '🇨🇼' },
  { name: 'Cyprus', code: 'CY', dial: '+357', flag: '🇨🇾' },
  { name: 'Czech Republic', code: 'CZ', dial: '+420', flag: '🇨🇿' },
  { name: 'Democratic Republic of the Congo', code: 'CD', dial: '+243', flag: '🇨🇩' },
  { name: 'Denmark', code: 'DK', dial: '+45', flag: '🇩🇰' },
  { name: 'Djibouti', code: 'DJ', dial: '+253', flag: '🇩🇯' },
  { name: 'France', code: 'FR', dial: '+33', flag: '🇫🇷' },
  { name: 'Germany', code: 'DE', dial: '+49', flag: '🇩🇪' },
  { name: 'India', code: 'IN', dial: '+91', flag: '🇮🇳' },
  { name: 'Indonesia', code: 'ID', dial: '+62', flag: '🇮🇩' },
  { name: 'Italy', code: 'IT', dial: '+39', flag: '🇮🇹' },
  { name: 'Japan', code: 'JP', dial: '+81', flag: '🇯🇵' },
  { name: 'Malaysia', code: 'MY', dial: '+60', flag: '🇲🇾' },
  { name: 'Mexico', code: 'MX', dial: '+52', flag: '🇲🇽' },
  { name: 'Netherlands', code: 'NL', dial: '+31', flag: '🇳🇱' },
  { name: 'Philippines', code: 'PH', dial: '+63', flag: '🇵🇭' },
  { name: 'Singapore', code: 'SG', dial: '+65', flag: '🇸🇬' },
  { name: 'Spain', code: 'ES', dial: '+34', flag: '🇪🇸' },
  { name: 'United Kingdom', code: 'GB', dial: '+44', flag: '🇬🇧' },
  { name: 'United States', code: 'US', dial: '+1', flag: '🇺🇸' },
]

function formatDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  // Only show the year when it differs from the current year.
  if (date.getFullYear() !== new Date().getFullYear()) {
    options.year = 'numeric'
  }
  return date.toLocaleDateString('en-US', options)
}

// A titled section: heading (with an optional right-aligned action) sits outside
// the card, fields stack as divided rows inside it. Form rows lose their
// dividers on mobile, where each row already stacks; list rows (items) keep them
// at every width. Mirrors the product form page.
function Section({
  title,
  action,
  divided = false,
  children,
}: {
  title?: string
  action?: React.ReactNode
  divided?: boolean
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      {title || action ? (
        <div className="flex items-center justify-between gap-4">
          {title ? <TypographyLarge>{title}</TypographyLarge> : <span />}
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <Card className="gap-0 py-0 shadow-none">
        <div
          className={cn(
            'px-4 sm:px-6',
            divided
              ? 'divide-y divide-border/50'
              : 'divide-y-0 divide-border/50 sm:divide-y',
          )}
        >
          {children}
        </div>
      </Card>
    </section>
  )
}

// A single field row: label on the left and control on the right on desktop,
// stacked on mobile.
function FormRow({
  id,
  label,
  icon: Icon,
  children,
}: {
  id: string
  label: string
  icon: IconComponent
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <Label
        htmlFor={id}
        className="flex items-center gap-3 text-sm font-medium sm:flex-1 sm:gap-6"
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        {label}
      </Label>
      <div className="w-full sm:w-72 sm:shrink-0">{children}</div>
    </div>
  )
}

// An optional field: a ghost Plus button (off by default) sits where the
// control would be; clicking it reveals the input in that same spot/row.
function OptionalField({
  fieldKey,
  label,
  icon: Icon,
  enabled,
  onToggle,
  controlClassName = 'w-full sm:w-72 sm:shrink-0',
  children,
}: {
  fieldKey: string
  label: string
  icon: IconComponent
  enabled: boolean
  onToggle: (value: boolean) => void
  controlClassName?: string
  children: React.ReactNode
}) {
  // Off: label on the left, Plus button on the right (where the toggle used to be).
  if (!enabled) {
    return (
      <div className="flex items-center justify-between gap-6">
        <Label className="flex items-center gap-3 text-sm font-medium sm:gap-6">
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          {label}
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          aria-label={`Add ${label}`}
          className="shrink-0 text-muted-foreground"
          onClick={() => onToggle(true)}
        >
          <Plus className="size-4" />
        </Button>
      </div>
    )
  }

  // On: label and input share one row, matching the always-on FormRow layout.
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <Label
        htmlFor={fieldKey}
        className="flex items-center gap-3 text-sm font-medium sm:flex-1 sm:gap-6"
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        {label}
      </Label>
      <div className={controlClassName}>{children}</div>
    </div>
  )
}

// A full-width row wrapping a single optional field.
function OptionalFormRow(props: React.ComponentProps<typeof OptionalField>) {
  return (
    <div className="py-4">
      <OptionalField {...props} />
    </div>
  )
}

// Phone input with a country-code dropdown on the left (flag emoji + dial code)
// and the number field on the right.
function PhoneInput({
  id,
  country,
  onCountryChange,
  number,
  onNumberChange,
  placeholder,
}: {
  id: string
  country: string
  onCountryChange: (code: string) => void
  number: string
  onNumberChange: (value: string) => void
  placeholder?: string
}) {
  const selected = COUNTRIES.find((item) => item.code === country) ?? COUNTRIES[0]
  const groupRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const [menu, setMenu] = React.useState<{ width: number; offset: number }>()

  return (
    <div ref={groupRef} className="w-full">
      <InputGroup className="h-10">
        <InputGroupAddon align="inline-start">
          <Select
            value={selected.code}
            onValueChange={onCountryChange}
            onOpenChange={(open) => {
              if (open && groupRef.current && triggerRef.current) {
                const group = groupRef.current.getBoundingClientRect()
                const trigger = triggerRef.current.getBoundingClientRect()
                setMenu({ width: group.width, offset: group.left - trigger.left })
              }
            }}
          >
            <SelectTrigger
              ref={triggerRef}
              aria-label="Country code"
              className="h-full gap-1 border-0 bg-transparent px-0 text-foreground shadow-none focus-visible:ring-0 dark:bg-transparent"
            >
              <span className="text-base leading-none">{selected.flag}</span>
              <span className="tabular-nums">{selected.dial}</span>
            </SelectTrigger>
            <SelectContent
              align="start"
              alignOffset={menu?.offset}
              style={menu ? { width: menu.width } : undefined}
            >
              {COUNTRIES.map((item) => (
                <SelectItem
                  key={item.code}
                  value={item.code}
                  className="[&>span:last-child]:w-full"
                >
                  <span className="text-base leading-none">{item.flag}</span>
                  <span className="flex-1">{item.name}</span>
                  <span className="text-muted-foreground">{item.dial}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          type="tel"
          value={number}
          onChange={(event) => onNumberChange(event.target.value)}
          placeholder={placeholder}
        />
      </InputGroup>
    </div>
  )
}

// Currency input with a leading "$" affix, used by the Other charges section.
function CurrencyInput({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
        $
      </span>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        placeholder="0.00"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 pl-7 tabular-nums"
      />
    </div>
  )
}

// Searchable product picker. Shows the product image in the field and in each
// dropdown option.
function ProductCombobox({
  id,
  value,
  onChange,
  container,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  // Mounts the popup inside the dialog rather than at <body>, so it isn't
  // trapped behind the modal overlay.
  container?: HTMLElement | null
}) {
  const anchor = useComboboxAnchor()

  return (
    <Combobox
      items={[...PRODUCT_OPTIONS]}
      value={value || null}
      onValueChange={(next: string | null, details) => {
        // base-ui clears the selection on Escape — ignore that change.
        if (details.reason === 'escape-key') return
        onChange(next ?? '')
      }}
    >
      <InputGroup ref={anchor} className="h-10">
        {value ? (
          <InputGroupAddon align="inline-start">
            <img
              src={productImage}
              alt=""
              className="size-6 shrink-0 rounded-sm object-cover"
            />
          </InputGroupAddon>
        ) : null}
        <ComboboxPrimitive.Input
          render={
            <InputGroupInput
              id={id}
              placeholder="Search products…"
              className={value ? undefined : 'pl-3'}
            />
          }
        />
        <InputGroupAddon align="inline-end">
          <ComboboxTrigger />
        </InputGroupAddon>
      </InputGroup>
      <ComboboxContent anchor={anchor} container={container}>
        <ComboboxEmpty>No products found.</ComboboxEmpty>
        <ComboboxList>
          {(product: string) => (
            <ComboboxItem key={product} value={product}>
              <img
                src={productImage}
                alt=""
                className="size-6 shrink-0 rounded-sm object-cover"
              />
              {product}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

// A single item row: product name with its quantity beside it, over a
// description of what the line costs and what was asked for. Mirrors the
// bundle's product rows on the product form page, and the item lines in the
// order details pane on the All Orders page.
function ItemRow({
  item,
  onEdit,
  onDelete,
}: {
  item: OrderItem
  onEdit: () => void
  onDelete: () => void
}) {
  const name = item.product
  // Each part of the description, separated by a dot when there's more than one.
  const details: { key: string; icon?: IconComponent; label: string }[] = [
    { key: 'price', label: formatCurrency(lineItemPrice(item)) },
    ...(item.discount.trim() !== ''
      ? [{ key: 'discount', icon: Tag, label: 'Discount' }]
      : []),
    ...(hasCustomizations(item)
      ? [{ key: 'customizations', icon: CircleHelp, label: 'Customizations' }]
      : []),
  ]

  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-4 md:gap-6">
          <Package className="size-4 shrink-0 text-muted-foreground" />
          {/* The quantity rides beside the name, as it does in the details pane. */}
          <p className="flex min-w-0 flex-1 items-center gap-1.5 text-sm font-medium">
            <span className="truncate">{name}</span>
            <Kbd className="text-sm text-foreground">
              {item.quantity.trim() || '1'}
            </Kbd>
          </p>
        </div>
        {/* Description aligns with the icon on mobile and under the name on desktop. */}
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground md:pl-10">
          {details.map(({ key, icon: Icon, label }, index) => (
            <React.Fragment key={key}>
              {index > 0 ? (
                <span
                  aria-hidden
                  className="size-1 shrink-0 rounded-full bg-muted-foreground/40"
                />
              ) : null}
              <span className="flex items-center gap-1.5">
                {Icon ? <Icon className="size-3.5 shrink-0" /> : null}
                {label}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 text-muted-foreground"
            aria-label={`Manage ${name}`}
          >
            <MoreHorizontal className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuItem onSelect={onEdit}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={onDelete}>
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// Every optional field in the item dialog is a label + switch, with the control
// revealed beneath it. Declared out here so typing in a revealed field doesn't
// remount it (and drop focus) on every render. Mirrors the variant dialog.
function OptionalSection({
  id,
  label,
  nested = false,
  enabled,
  onToggle,
  children,
}: {
  id: string
  label: string
  // Set by a field that hangs off another one, which names itself in the
  // quieter style the customization dialog gives its "Choice"/"Surcharge"
  // sub-labels.
  nested?: boolean
  enabled: boolean
  onToggle: (value: boolean) => void
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        {/* The label drives the switch, not the control it reveals — clicking
            the field's name is how you turn it on. */}
        <Label
          htmlFor={`${id}-enabled`}
          className={cn(
            'text-sm',
            nested ? 'font-normal text-muted-foreground' : 'font-medium',
          )}
        >
          {label}
        </Label>
        <Switch
          id={`${id}-enabled`}
          aria-label={label}
          checked={enabled}
          onCheckedChange={onToggle}
        />
      </div>
      {enabled ? children : null}
    </div>
  )
}

// The add/edit dialog for one of the order's items. Product, price and quantity
// are always asked for; the customization fields sit behind switches, as the
// optional fields in the product form's dialogs do. Re-mounted per open so the
// draft always starts fresh from the item being edited.
function ItemDialog({
  initial,
  saveLabel,
  onOpenChange,
  onSave,
}: {
  initial: OrderItem | null
  saveLabel: string
  onOpenChange: (open: boolean) => void
  onSave: (draft: OrderItemDraft) => void
}) {
  const isEditing = initial !== null
  // The picker's popup mounts inside the dialog rather than at <body> — see
  // `ProductCombobox`.
  const [content, setContent] = React.useState<HTMLDivElement | null>(null)

  const [draft, setDraft] = React.useState<OrderItemDraft>(() =>
    itemDraft(initial),
  )

  // A switch starts on when the item already carries that field, the way the
  // other dialogs default theirs.
  const filled = (value: string | undefined) => (value ?? '').trim() !== ''
  const [discountOn, setDiscountOn] = React.useState(() =>
    filled(initial?.discount),
  )
  const [instructionsOn, setInstructionsOn] = React.useState(() =>
    filled(initial?.instructions),
  )
  const [instructionsSurchargeOn, setInstructionsSurchargeOn] = React.useState(
    () => filled(initial?.instructionsSurcharge),
  )
  const [addOnsOn, setAddOnsOn] = React.useState(() => filled(initial?.addOns))
  const [addonsSurchargeOn, setAddonsSurchargeOn] = React.useState(() =>
    filled(initial?.addonsSurcharge),
  )

  function update<K extends keyof OrderItemDraft>(
    key: K,
    value: OrderItemDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  // An item is bought at least once, so an emptied quantity falls back on one
  // rather than blocking the save. A field whose switch is off saves empty, and
  // a surcharge only travels with the field it's charged for.
  const payload: OrderItemDraft = {
    product: draft.product,
    unitPrice: draft.unitPrice.trim(),
    quantity: draft.quantity.trim() || '1',
    discount: discountOn ? draft.discount.trim() : '',
    instructions: instructionsOn ? draft.instructions.trim() : '',
    instructionsSurcharge:
      instructionsOn && instructionsSurchargeOn
        ? draft.instructionsSurcharge.trim()
        : '',
    addOns: addOnsOn ? draft.addOns.trim() : '',
    addonsSurcharge:
      addOnsOn && addonsSurchargeOn ? draft.addonsSurcharge.trim() : '',
  }
  const changed =
    initial === null ||
    (Object.keys(payload) as Array<keyof OrderItemDraft>).some(
      (key) => payload[key] !== initial[key],
    )
  const canSave = payload.product !== '' && changed

  function handleSave() {
    if (payload.product === '') {
      toast.error('Select a product')
      return
    }
    onSave(payload)
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent
        ref={setContent}
        className="sm:max-w-lg [&_[data-slot=dialog-close]]:size-10"
      >
        <DialogHeader className="text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">
              {isEditing ? 'Edit item' : 'Add item'}
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="item-product" className="text-sm font-medium">
              Product
            </Label>
            <ProductCombobox
              id="item-product"
              value={draft.product}
              onChange={(value) => update('product', value)}
              container={content}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-unit-price" className="text-sm font-medium">
              Unit price
            </Label>
            <CurrencyInput
              id="item-unit-price"
              value={draft.unitPrice}
              onChange={(value) => update('unitPrice', value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-quantity" className="text-sm font-medium">
              Quantity
            </Label>
            <Input
              id="item-quantity"
              type="number"
              min={1}
              value={draft.quantity}
              onChange={(event) => update('quantity', event.target.value)}
              className="h-10"
            />
          </div>

          <OptionalSection
            id="item-discount"
            label="Discount"
            enabled={discountOn}
            onToggle={setDiscountOn}
          >
            <CurrencyInput
              id="item-discount"
              value={draft.discount}
              onChange={(value) => update('discount', value)}
            />
          </OptionalSection>

          <OptionalSection
            id="item-instructions"
            label="Special instructions"
            enabled={instructionsOn}
            onToggle={setInstructionsOn}
          >
            {/* 40px tall to start; `field-sizing-content` grows it as the
                instructions are typed. */}
            <Textarea
              id="item-instructions"
              value={draft.instructions}
              onChange={(event) => update('instructions', event.target.value)}
              placeholder="e.g. Less sweet, no ice"
              className="min-h-10"
            />
            <OptionalSection
              id="item-instructions-surcharge"
              label="Surcharge"
              nested
              enabled={instructionsSurchargeOn}
              onToggle={setInstructionsSurchargeOn}
            >
              <CurrencyInput
                id="item-instructions-surcharge"
                value={draft.instructionsSurcharge}
                onChange={(value) => update('instructionsSurcharge', value)}
              />
            </OptionalSection>
          </OptionalSection>

          <OptionalSection
            id="item-addons"
            label="Add-ons"
            enabled={addOnsOn}
            onToggle={setAddOnsOn}
          >
            <Input
              id="item-addons"
              value={draft.addOns}
              onChange={(event) => update('addOns', event.target.value)}
              placeholder="e.g. 1x Oat Milk, 1x Espresso Shot"
              className="h-10"
            />
            <OptionalSection
              id="item-addons-surcharge"
              label="Surcharge"
              nested
              enabled={addonsSurchargeOn}
              onToggle={setAddonsSurchargeOn}
            >
              <CurrencyInput
                id="item-addons-surcharge"
                value={draft.addonsSurcharge}
                onChange={(value) => update('addonsSurcharge', value)}
              />
            </OptionalSection>
          </OptionalSection>
        </DialogBody>

        <DialogFooter className="flex-row">
          <Button
            variant="outline"
            className="h-10 flex-1 px-3"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 flex-1 px-3"
            onClick={handleSave}
            disabled={!canSave}
          >
            {saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// What the order comes to, and — while an edit has it worth something other
// than what it was placed for — what it was placed for, over the difference
// that leaves to settle. Shown in the Summary section, and again in the
// confirmation a repriced order is saved through, so the merchant sees the
// same figures in both places. The section leads each line with a receipt icon
// and indents the rest under it; the dialog goes without.
function TotalSummary({
  total,
  previousTotal,
  showsNewTotal,
  paymentAutomated,
  withIcon = false,
}: {
  total: number
  previousTotal: number
  showsNewTotal: boolean
  paymentAutomated: boolean
  withIcon?: boolean
}) {
  const isRefund = total < previousTotal
  const difference = Math.abs(Math.round((total - previousTotal) * 100) / 100)
  // Everything under the first line hangs off the label the icon precedes.
  const indent = withIcon ? 'sm:pl-10' : undefined

  return (
    <div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-3 text-base font-medium sm:gap-6">
            {withIcon ? (
              <Receipt className="size-4 shrink-0 text-muted-foreground" />
            ) : null}
            {showsNewTotal ? 'New Total' : 'Total'}
          </span>
          <span className="text-base font-medium tabular-nums">
            {formatCurrency(total)}
          </span>
        </div>
        {showsNewTotal ? (
          <div
            className={cn(
              'flex items-center justify-between gap-6 text-sm text-muted-foreground',
              indent,
            )}
          >
            <span>
              {paymentAutomated
                ? 'Payment collected by Cococart'
                : 'Previous total'}
            </span>
            <span className="tabular-nums">
              {formatCurrency(previousTotal)}
            </span>
          </div>
        ) : null}
      </div>
      {/* The difference the edit leaves behind: money still owed by the
          customer, or owed back to them. Neither moves through Cococart, so the
          line says how it has to be settled. */}
      {showsNewTotal ? (
        <div className={indent}>
          <div className="mt-4 border-t border-border/50" />
          <div
            className={cn(
              'mt-4 flex items-center justify-between gap-6 text-base font-medium',
              isRefund ? 'text-destructive' : 'text-green-600',
            )}
          >
            <span>
              {isRefund
                ? 'Refund separately to customer'
                : 'Collect separately from customer'}
            </span>
            <span className="tabular-nums">{formatCurrency(difference)}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function AdminOrderEditPage({
  title = 'Edit Order',
  // Adding starts from an empty order; editing opens on the order it was called
  // for and measures every change against what that order came to.
  mode = 'edit',
  // Automated payments have already been taken by Cococart, so the summary says
  // so where a manual order just names its previous total.
  paymentAutomated = false,
}: {
  title?: string
  mode?: 'add' | 'edit'
  paymentAutomated?: boolean
}) {
  const isEditing = mode === 'edit'
  const initialForm = isEditing ? EDIT_FORM : INITIAL_FORM
  const [form, setForm] = React.useState<OrderEditForm>(initialForm)
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>(() =>
    enabledFieldsFor(initialForm),
  )
  const [dateOpen, setDateOpen] = React.useState(false)
  // The item dialog: 'add' for a new item, or the item being edited. null when
  // closed.
  const [itemDialog, setItemDialog] = React.useState<
    { mode: 'add' } | { mode: 'edit'; item: OrderItem } | null
  >(null)
  const [pendingDeleteItem, setPendingDeleteItem] =
    React.useState<OrderItem | null>(null)

  function update<K extends keyof OrderEditForm>(key: K, value: OrderEditForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function toggleField(key: string, value: boolean) {
    setEnabled((current) => ({ ...current, [key]: value }))
  }

  function saveItem(draft: OrderItemDraft) {
    const editingId = itemDialog?.mode === 'edit' ? itemDialog.item.id : null
    const saveable = { ...draft, id: editingId ?? nextId('item') }
    setForm((current) => ({
      ...current,
      items: editingId
        ? current.items.map((item) => (item.id === editingId ? saveable : item))
        : [...current.items, saveable],
    }))
    setItemDialog(null)
    toast.success(editingId ? 'Item updated' : 'Item added')
  }

  function confirmDeleteItem() {
    if (!pendingDeleteItem) return
    const { id } = pendingDeleteItem
    setForm((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== id),
    }))
    setPendingDeleteItem(null)
    toast.success('Item removed')
  }

  // Client-side navigation to the All Orders page (matches the app's router).
  function goToAllOrders() {
    window.history.pushState(null, '', '/admin/orders/all')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  // The form has unsaved changes whenever its values differ from the order it
  // opened on — the empty one when adding.
  const isDirty = React.useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm),
    [form, initialForm],
  )

  // What the order is worth now, and what it was worth when the page opened.
  // The two only differ once an edit moves the money, which is when the summary
  // starts calling the figure a new total.
  const total = orderTotal(form, enabled)
  const previousTotal = React.useMemo(
    () => orderTotal(initialForm, enabledFieldsFor(initialForm)),
    [initialForm],
  )
  const showsNewTotal = isEditing && total !== previousTotal
  // An edit that lowers the order owes the customer money back; one that raises
  // it leaves money to collect.
  const isRefund = total < previousTotal

  // Repricing an order leaves a difference to settle by hand — whether Cococart
  // took the payment or the merchant did. Saving stops on a confirmation that
  // lays out the new figures and offers the customer a fresh receipt.
  const needsSaveConfirmation = showsNewTotal
  const [saveConfirmOpen, setSaveConfirmOpen] = React.useState(false)
  const receiptEmail = form.customerEmail.trim() || 'the customer'

  function saveOrder(withReceipt: boolean) {
    setSaveConfirmOpen(false)
    toast.success(
      withReceipt
        ? `Order updated. Receipt will be sent to ${receiptEmail}`
        : 'Order updated',
    )
    goToAllOrders()
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    // An order is the items it's for, so it can't be filed empty.
    if (form.items.length === 0) {
      toast.error('Add at least one item')
      return
    }
    if (needsSaveConfirmation) {
      setSaveConfirmOpen(true)
      return
    }
    saveOrder(false)
  }

  // When dirty, navigating away is held in `pendingNav` until the user confirms
  // discarding via the alert dialog.
  const [pendingNav, setPendingNav] = React.useState<(() => void) | null>(null)

  function handleBack() {
    if (isDirty) {
      setPendingNav(() => () => window.history.back())
    } else {
      window.history.back()
    }
  }

  // Intercept clicks on links that navigate elsewhere (e.g. the sidebar) so we
  // can prompt before leaving with unsaved changes.
  React.useEffect(() => {
    if (!isDirty) return

    function handleClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }
      const anchor = (event.target as HTMLElement | null)?.closest('a')
      if (!anchor || (anchor.target && anchor.target !== '_self')) return

      const url = new URL(anchor.href, window.location.origin)
      if (url.origin !== window.location.origin) return

      const currentPath = window.location.pathname.replace(/\/+$/, '')
      const nextPath = url.pathname.replace(/\/+$/, '')
      if (nextPath === currentPath) return

      event.preventDefault()
      setPendingNav(() => () => {
        window.location.href = anchor.href
      })
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [isDirty])

  return (
    <>
    <form onSubmit={handleSubmit} className="w-full">
      <header className="relative mb-8 flex items-center justify-center">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label="Go back"
          onClick={handleBack}
          className="absolute left-0"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-normal text-neutral-900">
          {title}
        </h1>
      </header>

      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8">
        <Section>
          <FormRow id="customer-name" label="Customer" icon={User}>
            <Input
              id="customer-name"
              value={form.customerName}
              onChange={(event) => update('customerName', event.target.value)}
              placeholder="Jane Doe"
              className="h-10"
            />
          </FormRow>
          <OptionalFormRow
            fieldKey="customerPhone"
            label="Phone"
            icon={Phone}
            enabled={!!enabled.customerPhone}
            onToggle={(value) => toggleField('customerPhone', value)}
          >
            <PhoneInput
              id="customer-phone"
              country={form.customerPhoneCountry}
              onCountryChange={(code) => update('customerPhoneCountry', code)}
              number={form.customerPhone}
              onNumberChange={(value) => update('customerPhone', value)}
              placeholder="812 3456 7890"
            />
          </OptionalFormRow>
          <OptionalFormRow
            fieldKey="customerEmail"
            label="Email"
            icon={Mail}
            enabled={!!enabled.customerEmail}
            onToggle={(value) => toggleField('customerEmail', value)}
          >
            <Input
              id="customer-email"
              type="email"
              value={form.customerEmail}
              onChange={(event) => update('customerEmail', event.target.value)}
              placeholder="jane@example.com"
              className="h-10"
            />
          </OptionalFormRow>
          <FormRow id="customer-status" label="Status" icon={CircleDot}>
            <Select
              value={form.status}
              onValueChange={(value) => update('status', value)}
            >
              <SelectTrigger
                id="customer-status"
                className="w-full data-[size=default]:h-10"
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(({ label, icon: Icon }) => (
                  <SelectItem key={label} value={label}>
                    <Icon className="size-4" />
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
        </Section>

        <Section title="Fulfillment">
          <FormRow id="fulfill-date" label="Date" icon={CalendarIcon}>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="fulfill-date"
                  type="button"
                  variant="outline"
                  className="h-10 w-full justify-start px-3 font-normal"
                >
                  <CalendarIcon className="size-4 text-muted-foreground" />
                  <span className={form.fulfillDate ? '' : 'text-muted-foreground'}>
                    {form.fulfillDate ? formatDate(form.fulfillDate) : 'Select a date'}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.fulfillDate}
                  onSelect={(date) => {
                    update('fulfillDate', date)
                    setDateOpen(false)
                  }}
                />
              </PopoverContent>
            </Popover>
          </FormRow>
          <FormRow id="time-slot" label="Time slot" icon={Clock}>
            <Select
              value={form.timeSlot}
              onValueChange={(value) => update('timeSlot', value)}
            >
              <SelectTrigger
                id="time-slot"
                className="w-full data-[size=default]:h-10"
              >
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
          <FormRow id="fulfill-type" label="Type" icon={Truck}>
            <Select
              value={form.fulfillType}
              onValueChange={(value) => update('fulfillType', value)}
            >
              <SelectTrigger
                id="fulfill-type"
                className="w-full data-[size=default]:h-10"
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {FULFILLMENT_TYPES.map(({ label, icon: Icon }) => (
                  <SelectItem key={label} value={label}>
                    <Icon className="size-4" />
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
          <OptionalFormRow
            fieldKey="address"
            label="Address"
            icon={MapPin}
            enabled={!!enabled.address}
            onToggle={(value) => toggleField('address', value)}
          >
            {/* 40px tall to start; `field-sizing-content` grows it as the
                address is typed (min-h-10 overrides the component's min-h-16). */}
            <Textarea
              id="fulfill-address"
              value={form.address}
              onChange={(event) => update('address', event.target.value)}
              placeholder="Street, city, postal code"
              className="min-h-10"
            />
          </OptionalFormRow>
          <OptionalFormRow
            fieldKey="instructions"
            label="Instructions"
            icon={FileText}
            enabled={!!enabled.instructions}
            onToggle={(value) => toggleField('instructions', value)}
          >
            {/* 40px tall to start; `field-sizing-content` grows it as the
                instructions are typed. */}
            <Textarea
              id="fulfill-instructions"
              value={form.instructions}
              onChange={(event) => update('instructions', event.target.value)}
              placeholder="Unit number, landmarks, etc."
              className="min-h-10"
            />
          </OptionalFormRow>
          {/* Gift order and the recipient fields it reveals share one divider
              group, so the gift block reads as a single unit. */}
          <div>
            <div className="my-[10px] flex min-h-10 items-center justify-between gap-6 py-4">
              <Label
                htmlFor="gift-order"
                className="flex items-center gap-3 text-sm font-medium sm:gap-6"
              >
                <Gift className="size-4 shrink-0 text-muted-foreground" />
                Gift order
              </Label>
              <Switch
                id="gift-order"
                className="shrink-0"
                checked={!!enabled.giftOrder}
                onCheckedChange={(value) => toggleField('giftOrder', value)}
              />
            </div>
            {enabled.giftOrder ? (
              <>
                <FormRow
                  id="gift-recipient-name"
                  label="Gift recipient name"
                  icon={User}
                >
                  <Input
                    id="gift-recipient-name"
                    value={form.giftRecipientName}
                    onChange={(event) =>
                      update('giftRecipientName', event.target.value)
                    }
                    placeholder="Recipient name"
                    className="h-10"
                  />
                </FormRow>
                <FormRow
                  id="gift-recipient-phone"
                  label="Gift recipient phone"
                  icon={Phone}
                >
                  <PhoneInput
                    id="gift-recipient-phone"
                    country={form.giftRecipientPhoneCountry}
                    onCountryChange={(code) =>
                      update('giftRecipientPhoneCountry', code)
                    }
                    number={form.giftRecipientPhone}
                    onNumberChange={(value) =>
                      update('giftRecipientPhone', value)
                    }
                    placeholder="812 3456 7890"
                  />
                </FormRow>
                <OptionalFormRow
                  fieldKey="giftMessage"
                  label="Gift message"
                  icon={MessageSquare}
                  enabled={!!enabled.giftMessage}
                  onToggle={(value) => toggleField('giftMessage', value)}
                >
                  {/* 40px tall to start; `field-sizing-content` grows it as the
                      note is typed (min-h-10 overrides the component's min-h-16). */}
                  <Textarea
                    id="gift-message"
                    value={form.giftMessage}
                    onChange={(event) =>
                      update('giftMessage', event.target.value)
                    }
                    placeholder="Add a personal note"
                    className="min-h-10"
                  />
                </OptionalFormRow>
              </>
            ) : null}
          </div>
        </Section>

        {/* What the order is for. Shaped like the bundle's Products section on
            the product form page: rows here, fields in the dialog. */}
        <Section
          title="Items"
          divided
          action={
            <Button
              type="button"
              variant="secondary"
              className="h-10 px-3"
              onClick={() => setItemDialog({ mode: 'add' })}
            >
              <Plus className="size-4" />
              Add item
            </Button>
          }
        >
          {form.items.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No items
            </p>
          ) : (
            form.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onEdit={() => setItemDialog({ mode: 'edit', item })}
                onDelete={() => setPendingDeleteItem(item)}
              />
            ))
          )}
        </Section>

        <Section title="Other">
          <OptionalFormRow
            fieldKey="specialRequests"
            label="Do you have any special requests?"
            icon={FileText}
            enabled={!!enabled.specialRequests}
            onToggle={(value) => toggleField('specialRequests', value)}
          >
            <Textarea
              id="special-requests"
              value={form.specialRequests}
              onChange={(event) => update('specialRequests', event.target.value)}
              placeholder="Let us know if there's anything else we should know"
            />
          </OptionalFormRow>
        </Section>

        <Section title="Charges">
          <OptionalFormRow
            fieldKey="fulfillmentFee"
            label="Fulfillment fee"
            icon={Truck}
            enabled={!!enabled.fulfillmentFee}
            onToggle={(value) => toggleField('fulfillmentFee', value)}
          >
            <CurrencyInput
              id="fulfillment-fee"
              value={form.fulfillmentFee}
              onChange={(value) => update('fulfillmentFee', value)}
            />
          </OptionalFormRow>
          <OptionalFormRow
            fieldKey="promotionalDiscount"
            label="Promotional discount"
            icon={BadgePercent}
            enabled={!!enabled.promotionalDiscount}
            onToggle={(value) => toggleField('promotionalDiscount', value)}
          >
            <CurrencyInput
              id="promotional-discount"
              value={form.promotionalDiscount}
              onChange={(value) => update('promotionalDiscount', value)}
            />
          </OptionalFormRow>
          <OptionalFormRow
            fieldKey="tip"
            label="Tip"
            icon={Coins}
            enabled={!!enabled.tip}
            onToggle={(value) => toggleField('tip', value)}
          >
            <CurrencyInput
              id="tip"
              value={form.tip}
              onChange={(value) => update('tip', value)}
            />
          </OptionalFormRow>
          <FormRow id="service-charge" label="Service charge" icon={ConciergeBell}>
            <CurrencyInput
              id="service-charge"
              value={form.serviceCharge}
              onChange={(value) => update('serviceCharge', value)}
            />
          </FormRow>
          <FormRow id="gst" label="GST" icon={Landmark}>
            <CurrencyInput
              id="gst"
              value={form.gst}
              onChange={(value) => update('gst', value)}
            />
          </FormRow>
        </Section>

        {/* What the order adds up to, once every item and charge above is
            counted. While an edit has the order worth something other than what
            it was placed for, the figure is named a new total and the old one
            sits beneath it. */}
        <Section title="Summary">
          <div className="py-4">
            <TotalSummary
              total={total}
              previousTotal={previousTotal}
              showsNewTotal={showsNewTotal}
              paymentAutomated={paymentAutomated}
              withIcon
            />
          </div>
        </Section>
      </div>

      {isDirty ? (
        <div className="sticky bottom-4 z-30 mx-auto mt-8 flex w-full max-w-[640px] items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary px-4 py-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
          <span className="text-sm font-medium text-muted-foreground">Unsaved changes</span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" className="h-10" onClick={handleBack}>
              Cancel
            </Button>
            <Button type="submit" variant="outline" className="h-10">
              Save
            </Button>
          </div>
        </div>
      ) : null}
    </form>

    {/* Saving an order whose value moved: the totals it now carries, and the
        receipt the customer can be sent for them. Either button files the
        order — "Skip" just leaves the receipt unsent. */}
    <AlertDialog open={saveConfirmOpen} onOpenChange={setSaveConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Send receipt to {receiptEmail}?</AlertDialogTitle>
          <AlertDialogDescription>
            {isRefund
              ? 'The order total decreased. Refund the difference to the customer separately.'
              : 'The order total increased. Collect the difference from the customer separately.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <TotalSummary
          total={total}
          previousTotal={previousTotal}
          showsNewTotal={showsNewTotal}
          paymentAutomated={paymentAutomated}
        />
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => saveOrder(false)}>
            Skip
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => saveOrder(true)}>
            Send
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {itemDialog ? (
      <ItemDialog
        // Re-mount per open/target so the draft starts fresh.
        key={itemDialog.mode === 'edit' ? itemDialog.item.id : 'add'}
        initial={itemDialog.mode === 'edit' ? itemDialog.item : null}
        saveLabel={itemDialog.mode === 'edit' ? 'Save' : 'Add item'}
        onOpenChange={(open) => {
          if (!open) setItemDialog(null)
        }}
        onSave={saveItem}
      />
    ) : null}

    <AlertDialog
      open={pendingDeleteItem !== null}
      onOpenChange={(open) => {
        if (!open) setPendingDeleteItem(null)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove item?</AlertDialogTitle>
          <AlertDialogDescription>
            {pendingDeleteItem
              ? `"${pendingDeleteItem.product}" will be removed from this order.`
              : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={confirmDeleteItem}>
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog
      open={pendingNav !== null}
      onOpenChange={(open) => {
        if (!open) setPendingNav(null)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. If you leave this page, your changes will be
            lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              const navigate = pendingNav
              setPendingNav(null)
              navigate?.()
            }}
          >
            Discard changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
