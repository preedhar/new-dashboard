import * as React from 'react'
import {
  ArrowLeft,
  BadgePercent,
  Calendar as CalendarIcon,
  CircleDollarSign,
  CircleDot,
  CirclePlus,
  Clock,
  Coins,
  ConciergeBell,
  FileText,
  Gift,
  Hash,
  Landmark,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Percent,
  Phone,
  Plus,
  ShoppingBag,
  Store,
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
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TypographyLarge } from '@/components/ui/typography'
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

function createEmptyItem(id: string): OrderItem {
  return {
    id,
    product: '',
    unitPrice: '',
    quantity: '1',
    discount: '',
    instructions: '',
    instructionsSurcharge: '',
    addOns: '',
    addonsSurcharge: '',
  }
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
  items: [createEmptyItem('item-1')],
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

// A titled section: heading sits outside the card, fields stack as divided rows
// inside it.
function Section({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      {title ? <TypographyLarge>{title}</TypographyLarge> : null}
      <Card className="gap-0 py-0 shadow-none">
        <div className="divide-y-0 divide-border/50 px-4 sm:divide-y sm:px-6">{children}</div>
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
}: {
  id: string
  value: string
  onChange: (value: string) => void
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
      <ComboboxContent anchor={anchor}>
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

// One item card: the product, pricing and customization fields plus a Delete
// button (shown only when more than one item exists).
function ItemCard({
  item,
  index,
  canDelete,
  onDelete,
  onChange,
  enabled,
  onToggle,
}: {
  item: OrderItem
  index: number
  canDelete: boolean
  onDelete: () => void
  onChange: (key: keyof OrderItem, value: string) => void
  enabled: Record<string, boolean>
  onToggle: (key: string, value: boolean) => void
}) {
  const p = item.id

  return (
    <Card className="gap-0 py-0 shadow-none">
      <div className="divide-y-0 divide-border/50 px-4 sm:divide-y sm:px-6">
        <FormRow id={`${p}-product`} label={`Item ${index + 1}`} icon={Package}>
          <ProductCombobox
            id={`${p}-product`}
            value={item.product}
            onChange={(value) => onChange('product', value)}
          />
        </FormRow>
        <FormRow id={`${p}-unit-price`} label="Unit price" icon={CircleDollarSign}>
          <CurrencyInput
            id={`${p}-unit-price`}
            value={item.unitPrice}
            onChange={(value) => onChange('unitPrice', value)}
          />
        </FormRow>
        <FormRow id={`${p}-quantity`} label="Quantity" icon={Hash}>
          <Input
            id={`${p}-quantity`}
            type="number"
            min={1}
            value={item.quantity}
            onChange={(event) => onChange('quantity', event.target.value)}
            className="h-10"
          />
        </FormRow>
        <OptionalFormRow
          fieldKey={`${p}-discount`}
          label="Discount"
          icon={Percent}
          enabled={!!enabled[`${p}-discount`]}
          onToggle={(value) => onToggle(`${p}-discount`, value)}
        >
          <CurrencyInput
            id={`${p}-discount`}
            value={item.discount}
            onChange={(value) => onChange('discount', value)}
          />
        </OptionalFormRow>
        {/* Special instructions + its surcharge share one divider group. */}
        <div>
          <OptionalFormRow
            fieldKey={`${p}-instructions`}
            label="Special instructions"
            icon={FileText}
            enabled={!!enabled[`${p}-instructions`]}
            onToggle={(value) => onToggle(`${p}-instructions`, value)}
          >
            <Textarea
              id={`${p}-instructions`}
              value={item.instructions}
              onChange={(event) => onChange('instructions', event.target.value)}
              placeholder="e.g. Less sweet, no ice"
            />
          </OptionalFormRow>
          {enabled[`${p}-instructions`] ? (
            <OptionalFormRow
              fieldKey={`${p}-instructions-surcharge`}
              label="Surcharge"
              icon={CirclePlus}
              enabled={!!enabled[`${p}-instructions-surcharge`]}
              onToggle={(value) => onToggle(`${p}-instructions-surcharge`, value)}
            >
              <CurrencyInput
                id={`${p}-instructions-surcharge`}
                value={item.instructionsSurcharge}
                onChange={(value) => onChange('instructionsSurcharge', value)}
              />
            </OptionalFormRow>
          ) : null}
        </div>
        {/* Add-ons + its surcharge share one divider group. */}
        <div>
          <OptionalFormRow
            fieldKey={`${p}-addons`}
            label="Add-ons"
            icon={FileText}
            enabled={!!enabled[`${p}-addons`]}
            onToggle={(value) => onToggle(`${p}-addons`, value)}
          >
            <Input
              id={`${p}-addons`}
              value={item.addOns}
              onChange={(event) => onChange('addOns', event.target.value)}
              placeholder="e.g. 1x Oat Milk, 1x Espresso Shot"
              className="h-10"
            />
          </OptionalFormRow>
          {enabled[`${p}-addons`] ? (
            <OptionalFormRow
              fieldKey={`${p}-addons-surcharge`}
              label="Surcharge"
              icon={CirclePlus}
              enabled={!!enabled[`${p}-addons-surcharge`]}
              onToggle={(value) => onToggle(`${p}-addons-surcharge`, value)}
            >
              <CurrencyInput
                id={`${p}-addons-surcharge`}
                value={item.addonsSurcharge}
                onChange={(value) => onChange('addonsSurcharge', value)}
              />
            </OptionalFormRow>
          ) : null}
        </div>
      </div>
      {canDelete ? (
        <div className="border-t border-border/50 px-4 py-3 sm:px-6">
          <Button
            type="button"
            variant="ghost"
            className="h-10 w-full text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      ) : null}
    </Card>
  )
}

export function AdminOrderEditPage({
  title = 'Edit Order',
}: {
  title?: string
}) {
  const [form, setForm] = React.useState<OrderEditForm>(INITIAL_FORM)
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>({})
  const [dateOpen, setDateOpen] = React.useState(false)

  function update<K extends keyof OrderEditForm>(key: K, value: OrderEditForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function toggleField(key: string, value: boolean) {
    setEnabled((current) => ({ ...current, [key]: value }))
  }

  const nextItemId = React.useRef(2)

  function updateItem(id: string, key: keyof OrderItem, value: string) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    }))
  }

  function addItem() {
    const id = `item-${nextItemId.current++}`
    setForm((current) => ({ ...current, items: [...current.items, createEmptyItem(id)] }))
  }

  function deleteItem(id: string) {
    setForm((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== id),
    }))
    // Drop any optional-field toggles that belonged to the removed item.
    setEnabled((current) => {
      const next = { ...current }
      for (const key of Object.keys(next)) {
        if (key.startsWith(`${id}-`)) delete next[key]
      }
      return next
    })
  }

  // Client-side navigation to the All Orders page (matches the app's router).
  function goToAllOrders() {
    window.history.pushState(null, '', '/admin/orders/all')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  // The form has unsaved changes whenever its values differ from the initial
  // (empty) order.
  const isDirty = React.useMemo(
    () => JSON.stringify(form) !== JSON.stringify(INITIAL_FORM),
    [form],
  )

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    toast.success('Order updated')
    goToAllOrders()
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
            <Textarea
              id="fulfill-address"
              value={form.address}
              onChange={(event) => update('address', event.target.value)}
              placeholder="Street, city, postal code"
            />
          </OptionalFormRow>
          <OptionalFormRow
            fieldKey="instructions"
            label="Instructions"
            icon={FileText}
            enabled={!!enabled.instructions}
            onToggle={(value) => toggleField('instructions', value)}
          >
            <Textarea
              id="fulfill-instructions"
              value={form.instructions}
              onChange={(event) => update('instructions', event.target.value)}
              placeholder="Unit number, landmarks, etc."
            />
          </OptionalFormRow>
          <OptionalFormRow
            fieldKey="giftRecipientName"
            label="Gift recipient name"
            icon={Gift}
            enabled={!!enabled.giftRecipientName}
            onToggle={(value) => toggleField('giftRecipientName', value)}
          >
            <Input
              id="gift-recipient-name"
              value={form.giftRecipientName}
              onChange={(event) => update('giftRecipientName', event.target.value)}
              placeholder="Recipient name"
              className="h-10"
            />
          </OptionalFormRow>
          <OptionalFormRow
            fieldKey="giftRecipientPhone"
            label="Gift recipient phone"
            icon={Phone}
            enabled={!!enabled.giftRecipientPhone}
            onToggle={(value) => toggleField('giftRecipientPhone', value)}
          >
            <PhoneInput
              id="gift-recipient-phone"
              country={form.giftRecipientPhoneCountry}
              onCountryChange={(code) => update('giftRecipientPhoneCountry', code)}
              number={form.giftRecipientPhone}
              onNumberChange={(value) => update('giftRecipientPhone', value)}
              placeholder="812 3456 7890"
            />
          </OptionalFormRow>
          <OptionalFormRow
            fieldKey="giftMessage"
            label="Gift message"
            icon={MessageSquare}
            enabled={!!enabled.giftMessage}
            onToggle={(value) => toggleField('giftMessage', value)}
          >
            <Textarea
              id="gift-message"
              value={form.giftMessage}
              onChange={(event) => update('giftMessage', event.target.value)}
              placeholder="Add a personal note"
            />
          </OptionalFormRow>
        </Section>

        <section className="flex flex-col gap-3">
          <TypographyLarge>Items</TypographyLarge>
          {form.items.map((item, index) => (
            <ItemCard
              key={item.id}
              item={item}
              index={index}
              canDelete={form.items.length > 1}
              onDelete={() => deleteItem(item.id)}
              onChange={(key, value) => updateItem(item.id, key, value)}
              enabled={enabled}
              onToggle={toggleField}
            />
          ))}
          <Button
            type="button"
            variant="secondary"
            className="h-10 w-full"
            onClick={addItem}
          >
            <Plus className="size-4" />
            Add item
          </Button>
        </section>

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
      </div>

      {isDirty ? (
        <div className="sticky bottom-4 z-30 mx-auto mt-8 flex w-full max-w-[640px] items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary px-4 py-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
          <span className="text-sm font-medium text-muted-foreground">Unsaved changes</span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" className="h-10" onClick={handleBack}>
              Cancel
            </Button>
            <Button type="submit" variant="outline" className="h-10">
              Save changes
            </Button>
          </div>
        </div>
      ) : null}
    </form>

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
