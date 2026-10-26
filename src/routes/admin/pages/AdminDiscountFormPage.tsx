import * as React from 'react'
import {
  ArrowLeft,
  CalendarDays,
  Folder,
  Boxes,
  Hash,
  Package,
  Percent,
  Plus,
  ShoppingCart,
  Tag,
  Ticket,
  User,
  X,
} from 'lucide-react'
import { Combobox as ComboboxPrimitive } from '@base-ui/react'
import { toast } from 'sonner'

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
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from '@/components/ui/input-group'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { TypographyLarge } from '@/components/ui/typography'
import { cn } from '@/lib/utils'
import productImage from '@/assets/product.png'

import { CATEGORY_OPTIONS, PRODUCT_OPTIONS } from '../catalog'
import {
  DISCOUNTS_PATH,
  updateDiscounts,
  useDiscounts,
  type DateWindow,
  type Discount,
  type DiscountAppliesTo,
} from '../discounts'

type IconComponent = React.ComponentType<{ className?: string }>

// Client-side navigation matching the app's router (pushState + popstate).
function navigateTo(path: string) {
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

const APPLIES_TO_OPTIONS: { value: DiscountAppliesTo; label: string }[] = [
  { value: 'all', label: 'All products' },
  { value: 'products', label: 'Specific products' },
  { value: 'categories', label: 'Specific categories' },
  { value: 'fulfillment', label: 'Fulfillment fees' },
]

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

// Everything the form edits, held as the inputs hold it (numbers as text).
type DiscountForm = {
  code: string
  appliesTo: DiscountAppliesTo
  products: string[]
  categories: string[]
  amount: string
  type: Discount['type']
  maxDiscount: string
  active: boolean
  minPurchase: string
  minQuantity: string
  activeStart: Date | undefined
  activeEndEnabled: boolean
  activeEnd: Date | undefined
  fulfillStart: Date | undefined
  fulfillEndEnabled: boolean
  fulfillEnd: Date | undefined
  maxRedemptions: string
  oncePerCustomer: boolean
}

// The rows that start as a Plus button and only show their field once added.
type OptionalKey =
  | 'maxDiscount'
  | 'minPurchase'
  | 'minQuantity'
  | 'activeDates'
  | 'fulfillmentDates'
  | 'maxRedemptions'

type Enabled = Record<OptionalKey, boolean>

const EMPTY_FORM: DiscountForm = {
  code: '',
  appliesTo: 'all',
  products: [],
  categories: [],
  amount: '',
  type: 'percent',
  maxDiscount: '',
  active: true,
  minPurchase: '',
  minQuantity: '',
  activeStart: undefined,
  activeEndEnabled: false,
  activeEnd: undefined,
  fulfillStart: undefined,
  fulfillEndEnabled: false,
  fulfillEnd: undefined,
  maxRedemptions: '',
  oncePerCustomer: false,
}

const NOTHING_ENABLED: Enabled = {
  maxDiscount: false,
  minPurchase: false,
  minQuantity: false,
  activeDates: false,
  fulfillmentDates: false,
  maxRedemptions: false,
}

function numberText(value: number | null) {
  return value === null ? '' : String(value)
}

function formFromDiscount(discount: Discount): { form: DiscountForm; enabled: Enabled } {
  return {
    form: {
      code: discount.code,
      appliesTo: discount.appliesTo,
      products: discount.products,
      categories: discount.categories,
      amount: String(discount.value),
      type: discount.type,
      maxDiscount: numberText(discount.maxDiscount),
      active: discount.active,
      minPurchase: numberText(discount.minPurchase),
      minQuantity: numberText(discount.minQuantity),
      activeStart: discount.activeDates?.start,
      activeEndEnabled: Boolean(discount.activeDates?.end),
      activeEnd: discount.activeDates?.end ?? undefined,
      fulfillStart: discount.fulfillmentDates?.start,
      fulfillEndEnabled: Boolean(discount.fulfillmentDates?.end),
      fulfillEnd: discount.fulfillmentDates?.end ?? undefined,
      maxRedemptions: numberText(discount.maxRedemptions),
      oncePerCustomer: discount.oncePerCustomer,
    },
    enabled: {
      maxDiscount: discount.maxDiscount !== null,
      minPurchase: discount.minPurchase !== null,
      minQuantity: discount.minQuantity !== null,
      activeDates: discount.activeDates !== null,
      fulfillmentDates: discount.fulfillmentDates !== null,
      maxRedemptions: discount.maxRedemptions !== null,
    },
  }
}

// An optional number: empty (or switched off) means no limit.
function parseOptional(enabled: boolean, value: string) {
  if (!enabled || value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function dateWindow(
  enabled: boolean,
  start: Date | undefined,
  endEnabled: boolean,
  end: Date | undefined,
): DateWindow | null {
  if (!enabled || !start) return null
  return { start, end: endEnabled ? (end ?? null) : null }
}

// Keeps only what a decimal amount can hold.
function decimalText(value: string) {
  return value.replace(/[^\d.]/g, '')
}

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Layout primitives — the product form's section/row shapes.
// ---------------------------------------------------------------------------

// A titled section: heading and description sit outside the card, fields
// stack as divided rows inside it. Rows lose their dividers on mobile, where
// each row already stacks.
function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <TypographyLarge>{title}</TypographyLarge>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Card className="gap-0 py-0 shadow-none">
        <div className="divide-y-0 divide-border/50 px-4 sm:divide-y sm:px-6">
          {children}
        </div>
      </Card>
    </section>
  )
}

// The label side of a row: icon + text, with an optional explainer beneath that
// lines up under the text on desktop.
function RowLabel({
  htmlFor,
  label,
  icon: Icon,
  description,
  className,
}: {
  htmlFor?: string
  label: string
  icon: IconComponent
  description?: string
  className?: string
}) {
  return (
    <div className={cn('sm:flex-1', className)}>
      <Label htmlFor={htmlFor} className="flex items-center gap-3 text-sm font-medium sm:gap-6">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        {label}
      </Label>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground sm:pl-10">{description}</p>
      ) : null}
    </div>
  )
}

// A single field row: label on the left and control on the right on desktop,
// stacked on mobile. Controls taller than a line (the radio list, the date
// fields) line up with the top of the row rather than its middle.
function FormRow({
  id,
  label,
  icon,
  description,
  align = 'center',
  labelClassName,
  children,
}: {
  id?: string
  label: string
  icon: IconComponent
  description?: string
  align?: 'center' | 'start'
  // Set by top-aligned rows whose label needs a nudge to read as part of the
  // first line of its control.
  labelClassName?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 py-4 sm:flex-row sm:justify-between sm:gap-6',
        align === 'center' ? 'sm:items-center' : 'sm:items-start',
      )}
    >
      <RowLabel
        htmlFor={id}
        label={label}
        icon={icon}
        description={description}
        className={labelClassName}
      />
      <div className="w-full sm:w-72 sm:shrink-0">{children}</div>
    </div>
  )
}

// An optional field: a ghost Plus button sits where the control would be until
// it's added, then the row becomes a regular FormRow.
function OptionalFormRow({
  enabled,
  onEnable,
  ...rowProps
}: React.ComponentProps<typeof FormRow> & {
  enabled: boolean
  onEnable: () => void
}) {
  if (enabled) return <FormRow {...rowProps} />
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <RowLabel
        label={rowProps.label}
        icon={rowProps.icon}
        description={rowProps.description}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        aria-label={`Add ${rowProps.label.toLowerCase()}`}
        className="shrink-0 text-muted-foreground"
        onClick={onEnable}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  )
}

// A switch row: the switch stays on the label's line at every width.
function ToggleRow({
  id,
  label,
  icon,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  icon: IconComponent
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <RowLabel htmlFor={id} label={label} icon={icon} />
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------

// A number input closed out by its unit: "$" in front, or "%" behind.
function AmountInput({
  id,
  value,
  unit,
  placeholder,
  onChange,
}: {
  id: string
  value: string
  unit: '$' | '%'
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative">
      <span
        className={cn(
          'pointer-events-none absolute top-1/2 -translate-y-1/2 text-sm text-muted-foreground',
          unit === '$' ? 'left-3' : 'right-3',
        )}
      >
        {unit}
      </span>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(decimalText(event.target.value))}
        className={cn('h-10 tabular-nums', unit === '$' ? 'pl-7' : 'pr-8')}
      />
    </div>
  )
}

// A date picked from a calendar popover, with a clear button at the end once
// one is set. The calendar lines up with the whole field, not just the date.
function DateField({
  id,
  value,
  onChange,
  disabledBefore,
}: {
  id: string
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  // Keeps an end date from landing before its start.
  disabledBefore?: Date
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor>
        <InputGroup className="h-10">
          <PopoverTrigger asChild>
            <button
              id={id}
              type="button"
              className="flex h-full min-w-0 flex-1 items-center gap-2 pl-3 text-left outline-none"
            >
              <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
              <span className={cn('truncate', !value && 'text-muted-foreground')}>
                {value ? formatDate(value) : 'Select a date'}
              </span>
            </button>
          </PopoverTrigger>
          {value ? (
            <InputGroupAddon align="inline-end" className="pr-1.5">
              <InputGroupButton
                type="button"
                size="icon-sm"
                aria-label="Clear date"
                className="text-muted-foreground"
                onClick={() => onChange(undefined)}
              >
                <X />
              </InputGroupButton>
            </InputGroupAddon>
          ) : null}
        </InputGroup>
      </PopoverAnchor>
      <PopoverContent align="end" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value ?? disabledBefore}
          disabled={disabledBefore ? { before: disabledBefore } : undefined}
          onSelect={(date) => {
            onChange(date)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

// A start date, with an optional end date behind a "Set end date" switch.
function DateWindowField({
  idPrefix,
  start,
  onStartChange,
  endEnabled,
  onEndEnabledChange,
  end,
  onEndChange,
}: {
  idPrefix: string
  start: Date | undefined
  onStartChange: (date: Date | undefined) => void
  endEnabled: boolean
  onEndEnabledChange: (enabled: boolean) => void
  end: Date | undefined
  onEndChange: (date: Date | undefined) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-start`}>Start date</Label>
        <DateField
          id={`${idPrefix}-start`}
          value={start}
          onChange={(date) => {
            onStartChange(date)
            // Moving the start past the end clears the end rather than leave
            // the window backwards.
            if (date && end && end < date) onEndChange(undefined)
          }}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={`${idPrefix}-end-enabled`}>Set end date</Label>
        <Switch
          id={`${idPrefix}-end-enabled`}
          checked={endEnabled}
          onCheckedChange={onEndEnabledChange}
        />
      </div>
      {endEnabled ? (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-end`}>End date</Label>
          <DateField
            id={`${idPrefix}-end`}
            value={end}
            onChange={onEndChange}
            disabledBefore={start}
          />
        </div>
      ) : null}
    </div>
  )
}

// Picks several of a fixed set of options as removable chips, with a trailing
// "Add" chip that opens a searchable list. Mirrors the product form's
// categories field, minus creating new options.
function ChipsPicker({
  id,
  values,
  options,
  addLabel,
  searchPlaceholder,
  emptyLabel,
  renderIcon,
  onChange,
}: {
  id: string
  values: string[]
  options: string[]
  addLabel: string
  searchPlaceholder: string
  emptyLabel: string
  renderIcon: () => React.ReactNode
  onChange: (values: string[]) => void
}) {
  // Anchors the popover to the field so it spans the full available width.
  const anchor = React.useRef<HTMLDivElement | null>(null)

  // A fixed height rather than padding, so a chip carrying an icon lines up
  // with the "Add" chip and the 40px controls on the other rows.
  const chipClass =
    'inline-flex h-10 items-center gap-1.5 rounded-md bg-secondary px-3 text-sm font-normal text-secondary-foreground'

  return (
    <Combobox
      items={options}
      value={values}
      onValueChange={(next: string[], details) => {
        // base-ui clears the whole selection on Escape — ignore that change.
        if (details.reason === 'escape-key') return
        onChange(next)
      }}
      multiple
    >
      {/* Chips start on the left on mobile, where the row stacks, and flow from
          the right once they share a line with their label. */}
      <div
        ref={anchor}
        className="flex flex-wrap items-center justify-start gap-1.5 sm:justify-end"
      >
        {values.map((value) => (
          <span key={value} className={chipClass}>
            {renderIcon()}
            {value}
            <button
              type="button"
              aria-label={`Remove ${value}`}
              onClick={() => onChange(values.filter((current) => current !== value))}
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
              id={id}
              className={cn(
                chipClass,
                'text-muted-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] hover:text-foreground',
              )}
            >
              <Plus className="size-4" />
              {addLabel}
            </button>
          }
        />
      </div>
      <ComboboxContent anchor={anchor}>
        <ComboboxInput
          placeholder={searchPlaceholder}
          showTrigger={false}
          className="m-3! h-10! bg-white! pl-2"
        />
        <ComboboxEmpty>{emptyLabel}</ComboboxEmpty>
        <ComboboxList>
          {(option: string) => (
            <ComboboxItem key={option} value={option}>
              {renderIcon()}
              {option}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

function ProductThumb() {
  return <img src={productImage} alt="" className="size-6 shrink-0 rounded-sm object-cover" />
}

function CategoryIcon() {
  return <Folder className="size-4 shrink-0 text-muted-foreground" />
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function AdminDiscountFormPage({ mode = 'add' }: { mode?: 'add' | 'edit' }) {
  const isEditing = mode === 'edit'
  const discounts = useDiscounts()
  // The discount being edited comes from the `discount` query param.
  const [discountId] = React.useState(() =>
    isEditing ? new URLSearchParams(window.location.search).get('discount') : null,
  )
  const original = discountId
    ? (discounts.find((discount) => discount.id === discountId) ?? null)
    : null

  if (isEditing && !original) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Discount not found.</p>
        <Button variant="outline" className="h-10" onClick={() => navigateTo(DISCOUNTS_PATH)}>
          Back to discounts
        </Button>
      </div>
    )
  }

  return <DiscountForm original={original} discounts={discounts} />
}

function DiscountForm({
  original,
  discounts,
}: {
  // The discount being edited, or null when adding one.
  original: Discount | null
  discounts: Discount[]
}) {
  const isEditing = original !== null
  const initial = React.useMemo(
    () => (original ? formFromDiscount(original) : { form: EMPTY_FORM, enabled: NOTHING_ENABLED }),
    [original],
  )
  const [form, setForm] = React.useState<DiscountForm>(initial.form)
  const [enabled, setEnabled] = React.useState<Enabled>(initial.enabled)

  function update<K extends keyof DiscountForm>(key: K, value: DiscountForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function enable(key: OptionalKey) {
    setEnabled((current) => ({ ...current, [key]: true }))
    // Date windows open on today, the date most discounts start from.
    if (key === 'activeDates' && !form.activeStart) update('activeStart', startOfToday())
    if (key === 'fulfillmentDates' && !form.fulfillStart) update('fulfillStart', startOfToday())
  }

  const isPercent = form.type === 'percent'

  // --- Save / navigation ---------------------------------------------------

  const isDirty = React.useMemo(
    () => JSON.stringify({ form, enabled }) !== JSON.stringify(initial),
    [form, enabled, initial],
  )

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

  // The first problem that stops the form from saving, if any.
  function validate(): string | null {
    const code = form.code.trim()
    if (code === '') return 'Enter a discount code'
    const taken = discounts.some(
      (discount) =>
        discount.id !== original?.id && discount.code.toLowerCase() === code.toLowerCase(),
    )
    if (taken) return 'A discount with this code already exists'
    if (form.appliesTo === 'products' && form.products.length === 0) {
      return 'Choose at least one product'
    }
    if (form.appliesTo === 'categories' && form.categories.length === 0) {
      return 'Choose at least one category'
    }
    const amount = Number(form.amount)
    if (form.amount.trim() === '' || !(amount > 0)) return 'Enter a discount amount'
    if (isPercent && amount > 100) return "A discount can't be more than 100% off"
    // Without a start the window has nothing to run from.
    if (enabled.activeDates && !form.activeStart) {
      return 'Choose a start date for the active dates'
    }
    if (enabled.activeDates && form.activeEndEnabled && !form.activeEnd) {
      return 'Choose an end date for the active dates'
    }
    if (enabled.fulfillmentDates && !form.fulfillStart) {
      return 'Choose a start date for the fulfillment dates'
    }
    if (enabled.fulfillmentDates && form.fulfillEndEnabled && !form.fulfillEnd) {
      return 'Choose an end date for the fulfillment dates'
    }
    return null
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const error = validate()
    if (error) {
      toast.error(error)
      return
    }
    const discount: Discount = {
      id: original?.id ?? crypto.randomUUID(),
      code: form.code.trim(),
      type: form.type,
      value: Number(form.amount),
      appliesTo: form.appliesTo,
      // Only the picks behind the chosen option are kept.
      products: form.appliesTo === 'products' ? form.products : [],
      categories: form.appliesTo === 'categories' ? form.categories : [],
      // A cap only means something on a percentage.
      maxDiscount: isPercent ? parseOptional(enabled.maxDiscount, form.maxDiscount) : null,
      active: form.active,
      minPurchase: parseOptional(enabled.minPurchase, form.minPurchase),
      minQuantity: parseOptional(enabled.minQuantity, form.minQuantity),
      activeDates: dateWindow(
        enabled.activeDates,
        form.activeStart,
        form.activeEndEnabled,
        form.activeEnd,
      ),
      fulfillmentDates: dateWindow(
        enabled.fulfillmentDates,
        form.fulfillStart,
        form.fulfillEndEnabled,
        form.fulfillEnd,
      ),
      maxRedemptions: parseOptional(enabled.maxRedemptions, form.maxRedemptions),
      oncePerCustomer: form.oncePerCustomer,
      redemptions: original?.redemptions ?? 0,
    }
    updateDiscounts((current) =>
      isEditing
        ? current.map((existing) => (existing.id === discount.id ? discount : existing))
        : [...current, discount],
    )
    toast.success(isEditing ? 'Discount saved' : 'Discount added')
    navigateTo(DISCOUNTS_PATH)
  }

  // Intercept clicks on links that navigate elsewhere (e.g. the sidebar) so we
  // can prompt before leaving with unsaved changes. Mirrors the product form.
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
            {isEditing ? 'Edit discount' : 'Add discount'}
          </h1>
        </header>

        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8">
          <Section title="Discount details" description="Give discounts with a unique code">
            <FormRow id="discount-code" label="Discount code" icon={Tag}>
              <Input
                id="discount-code"
                value={form.code}
                onChange={(event) => update('code', event.target.value)}
                placeholder="15OFF"
                autoComplete="off"
                className="h-10"
              />
            </FormRow>

            <FormRow label="Discount applies to" icon={Hash} align="start" labelClassName="sm:mt-3">
              <RadioGroup
                aria-label="Discount applies to"
                value={form.appliesTo}
                onValueChange={(value) => update('appliesTo', value as DiscountAppliesTo)}
                className="gap-0 divide-y overflow-hidden rounded-lg border"
              >
                {APPLIES_TO_OPTIONS.map((option) => (
                  <FieldLabel
                    key={option.value}
                    htmlFor={`applies-to-${option.value}`}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 font-medium transition-colors hover:bg-muted/50"
                  >
                    {option.label}
                    <RadioGroupItem value={option.value} id={`applies-to-${option.value}`} />
                  </FieldLabel>
                ))}
              </RadioGroup>
            </FormRow>

            {/* The picks behind "Specific products" / "Specific categories"
                get a row of their own beneath the choice. */}
            {form.appliesTo === 'products' ? (
              <FormRow
                id="discount-products"
                label="Products"
                icon={Package}
                align="start"
                labelClassName="sm:mt-2.5"
              >
                <ChipsPicker
                  id="discount-products"
                  values={form.products}
                  options={PRODUCT_OPTIONS}
                  addLabel="Add product"
                  searchPlaceholder="Search products…"
                  emptyLabel="No products found."
                  renderIcon={ProductThumb}
                  onChange={(products) => update('products', products)}
                />
              </FormRow>
            ) : null}
            {form.appliesTo === 'categories' ? (
              <FormRow
                id="discount-categories"
                label="Categories"
                icon={Folder}
                align="start"
                labelClassName="sm:mt-2.5"
              >
                <ChipsPicker
                  id="discount-categories"
                  values={form.categories}
                  options={CATEGORY_OPTIONS}
                  addLabel="Add category"
                  searchPlaceholder="Search categories…"
                  emptyLabel="No categories found."
                  renderIcon={CategoryIcon}
                  onChange={(categories) => update('categories', categories)}
                />
              </FormRow>
            ) : null}

            <FormRow id="discount-amount" label="Discount amount" icon={Percent}>
              <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-2">
                <AmountInput
                  id="discount-amount"
                  value={form.amount}
                  unit={isPercent ? '%' : '$'}
                  placeholder={isPercent ? '15' : '10'}
                  onChange={(value) => update('amount', value)}
                />
                <Select
                  value={form.type}
                  onValueChange={(value) => update('type', value as Discount['type'])}
                >
                  <SelectTrigger
                    aria-label="Discount type"
                    className="w-full data-[size=default]:h-10"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="percent">Percent off</SelectItem>
                    <SelectItem value="amount">Off total</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FormRow>

            {/* A cap only applies to a percentage, so an amount off goes
                without the row. */}
            {isPercent ? (
              <OptionalFormRow
                id="max-discount"
                label="Maximum discount"
                icon={Percent}
                enabled={enabled.maxDiscount}
                onEnable={() => enable('maxDiscount')}
              >
                <AmountInput
                  id="max-discount"
                  value={form.maxDiscount}
                  unit="$"
                  placeholder="20"
                  onChange={(value) => update('maxDiscount', value)}
                />
              </OptionalFormRow>
            ) : null}

            <ToggleRow
              id="discount-active"
              label="Active"
              icon={Tag}
              checked={form.active}
              onCheckedChange={(checked) => update('active', checked)}
            />
          </Section>

          <Section title="Conditions" description="Set the redemption rules for your discount">
            <OptionalFormRow
              id="min-purchase"
              label="Minimum purchase"
              icon={ShoppingCart}
              description="All items in cart"
              enabled={enabled.minPurchase}
              onEnable={() => enable('minPurchase')}
            >
              <AmountInput
                id="min-purchase"
                value={form.minPurchase}
                unit="$"
                placeholder="20"
                onChange={(value) => update('minPurchase', value)}
              />
            </OptionalFormRow>

            <OptionalFormRow
              id="min-quantity"
              label="Minimum quantity"
              icon={Boxes}
              description="Items eligible for this discount"
              enabled={enabled.minQuantity}
              onEnable={() => enable('minQuantity')}
            >
              <Input
                id="min-quantity"
                type="text"
                inputMode="numeric"
                placeholder="2"
                value={form.minQuantity}
                onChange={(event) => update('minQuantity', event.target.value.replace(/\D/g, ''))}
                className="h-10 tabular-nums"
              />
            </OptionalFormRow>

            <OptionalFormRow
              label="Active dates"
              icon={CalendarDays}
              align="start"
              labelClassName="sm:mt-0.5"
              enabled={enabled.activeDates}
              onEnable={() => enable('activeDates')}
            >
              <DateWindowField
                idPrefix="active-dates"
                start={form.activeStart}
                onStartChange={(date) => update('activeStart', date)}
                endEnabled={form.activeEndEnabled}
                onEndEnabledChange={(checked) => update('activeEndEnabled', checked)}
                end={form.activeEnd}
                onEndChange={(date) => update('activeEnd', date)}
              />
            </OptionalFormRow>

            <OptionalFormRow
              label="Fulfillment dates"
              icon={CalendarDays}
              align="start"
              labelClassName="sm:mt-0.5"
              enabled={enabled.fulfillmentDates}
              onEnable={() => enable('fulfillmentDates')}
            >
              <DateWindowField
                idPrefix="fulfillment-dates"
                start={form.fulfillStart}
                onStartChange={(date) => update('fulfillStart', date)}
                endEnabled={form.fulfillEndEnabled}
                onEndEnabledChange={(checked) => update('fulfillEndEnabled', checked)}
                end={form.fulfillEnd}
                onEndChange={(date) => update('fulfillEnd', date)}
              />
            </OptionalFormRow>
          </Section>

          <Section
            title="Redemption limits"
            description="Set redemption limits for your discount code"
          >
            <OptionalFormRow
              id="max-redemptions"
              label="Maximum redemptions"
              icon={Ticket}
              enabled={enabled.maxRedemptions}
              onEnable={() => enable('maxRedemptions')}
            >
              <Input
                id="max-redemptions"
                type="text"
                inputMode="numeric"
                placeholder="20"
                value={form.maxRedemptions}
                onChange={(event) =>
                  update('maxRedemptions', event.target.value.replace(/\D/g, ''))
                }
                className="h-10 tabular-nums"
              />
            </OptionalFormRow>

            <ToggleRow
              id="once-per-customer"
              label="One use per customer only"
              icon={User}
              checked={form.oncePerCustomer}
              onCheckedChange={(checked) => update('oncePerCustomer', checked)}
            />
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
                {isEditing ? 'Save' : 'Add discount'}
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
              You have unsaved changes. If you leave this page, your changes will be lost.
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
