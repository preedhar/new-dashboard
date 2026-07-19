import * as React from 'react'
import {
  ArrowLeft,
  CalendarClock,
  ChevronRight,
  Clock,
  Gauge,
  Hourglass,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  ShoppingBag,
  Timer,
  Trash2,
  Truck,
} from 'lucide-react'
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
import { Card } from '@/components/ui/card'
import {
  Dialog,
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
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { TypographyH4, TypographyLarge } from '@/components/ui/typography'

type IconComponent = React.ComponentType<{ className?: string }>

// Delivery methods can price three ways; pickup drops "calculated at checkout".
type DeliveryFeeType = 'set-price' | 'calculated' | 'quoted'
type PickupFeeType = 'set-price' | 'quoted'

const DELIVERY_FEE_OPTIONS: { value: DeliveryFeeType; label: string }[] = [
  { value: 'set-price', label: 'Set price' },
  { value: 'calculated', label: 'Calculated at checkout' },
  { value: 'quoted', label: 'Quoted after order' },
]

const PICKUP_FEE_OPTIONS: { value: PickupFeeType; label: string }[] = [
  { value: 'set-price', label: 'Set price' },
  { value: 'quoted', label: 'Quoted after order' },
]

// Helper copy shown under each fee option in the add/edit dialog.
const FEE_DESCRIPTIONS: Record<string, React.ReactNode> = {
  'set-price': 'Charge a fixed fee at checkout',
  calculated: (
    <>
      Supported with{' '}
      <a
        href="/admin/orders/deliveries"
        className="underline underline-offset-2 hover:text-foreground"
        onClick={(event) => event.stopPropagation()}
      >
        Lalamove
      </a>
    </>
  ),
  quoted: 'Collect the fee separately from the customer',
}

// A min-spend → delivery-fee tier offered when a delivery method sets a price.
// Up to 4 are allowed per method.
type DiscountedFee = {
  id: string
  minSpend: string
  deliveryFee: string
}

const MAX_DISCOUNTED_FEES = 4

type DeliveryMethod = {
  id: string
  name: string
  feeType: DeliveryFeeType
  price: string
  discountedFees: DiscountedFee[]
  instructions: string
}

type PickupMethod = {
  id: string
  name: string
  feeType: PickupFeeType
  price: string
  instructions: string
}

// Monotonic id source for newly-created methods and discounted-fee tiers. A
// module-level counter keeps ids stable across dialog remounts.
let idCounter = 0
function nextId(prefix: string) {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

// The global <Toaster/> paints every toast with the success (green) palette, so
// the in-progress "Saving changes…" toast overrides those vars to the neutral
// popover palette; the follow-up "Changes saved" restores green explicitly
// (updating a toast by id keeps its prior inline style otherwise). Mirrors the
// store settings page.
const SAVING_TOAST_STYLE = {
  '--normal-bg': 'var(--popover)',
  '--normal-text': 'var(--popover-foreground)',
  '--normal-border': 'var(--border)',
} as React.CSSProperties

const SAVED_TOAST_STYLE = {
  '--normal-bg': 'var(--success)',
  '--normal-text': 'var(--success-foreground)',
  '--normal-border': 'var(--success-border)',
} as React.CSSProperties

// A single shared id keeps the save feedback to one toast that transitions
// in-place from "Saving changes…" to "Changes saved" a second later.
const SAVE_TOAST_ID = 'time-slots-save'

function runSaveFeedback() {
  toast.loading('Saving changes...', {
    id: SAVE_TOAST_ID,
    style: SAVING_TOAST_STYLE,
  })
  window.setTimeout(() => {
    toast.success('Changes saved', {
      id: SAVE_TOAST_ID,
      style: SAVED_TOAST_STYLE,
    })
  }, 1000)
}

// ---------------------------------------------------------------------------
// Time slots
// ---------------------------------------------------------------------------

type SlotLength = '15' | '30' | '60'
const SLOT_LENGTHS: SlotLength[] = ['15', '30', '60']

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

// Half-hourly labels ("12:00 AM" … "11:30 PM") used by the from/to selects.
// The 12-hour clock already carries AM/PM, so the hour is not zero-padded.
const TIME_OPTIONS: string[] = Array.from({ length: 48 }, (_, index) => {
  const totalMinutes = index * 30
  const hour24 = Math.floor(totalMinutes / 60)
  const minute = totalMinutes % 60
  const period = hour24 < 12 ? 'AM' : 'PM'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`
})

type TimeRange = { id: string; from: string; to: string }
type DaySchedule = { day: string; enabled: boolean; ranges: TimeRange[] }
type TimeSlotsSettings = {
  enabled: boolean
  length: SlotLength
  limitOrders: boolean
  limitCount: string
  days: DaySchedule[]
  leadTime: boolean
  leadHours: string
  leadMinutes: string
}

function defaultTimeSlots(): TimeSlotsSettings {
  return {
    enabled: true,
    length: '15',
    limitOrders: false,
    limitCount: '',
    days: DAYS.map((day) => ({
      day,
      enabled: true,
      ranges: [{ id: nextId('slot'), from: '9:00 AM', to: '6:00 PM' }],
    })),
    leadTime: false,
    leadHours: '',
    leadMinutes: '',
  }
}

// ---------------------------------------------------------------------------
// Email reminder
// ---------------------------------------------------------------------------

type EmailReminderSettings = {
  enabled: boolean
  daysBefore: string
  subject: string
  message: string
}

function defaultEmailReminder(): EmailReminderSettings {
  return {
    enabled: false,
    daysBefore: '0',
    subject: 'A reminder about your upcoming order',
    message:
      "Hi there! This is a friendly reminder about your upcoming order. We're getting it ready and look forward to fulfilling it. Please reach out if you have any questions.",
  }
}

const INITIAL_DELIVERY_METHODS: DeliveryMethod[] = [
  {
    id: 'delivery-standard',
    name: 'Standard delivery',
    feeType: 'set-price',
    price: '5',
    discountedFees: [{ id: 'fee-seed', minSpend: '50', deliveryFee: '0' }],
    instructions: 'Delivered within 3–5 business days.',
  },
  {
    id: 'delivery-express',
    name: 'Express delivery',
    feeType: 'calculated',
    price: '',
    discountedFees: [],
    instructions: '',
  },
]

const INITIAL_PICKUP_METHODS: PickupMethod[] = [
  {
    id: 'pickup-store',
    name: 'In-store pickup',
    feeType: 'set-price',
    price: '0',
    instructions: 'Pick up from our counter during opening hours.',
  },
]

// A titled section: heading sits outside the card, rows stack as divided rows
// inside it. Mirrors the store settings page. An optional `footer` renders
// below the card (e.g. an add button that sits outside the card).
function Section({
  title,
  description,
  action,
  footer,
  children,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <TypographyLarge>{title}</TypographyLarge>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
        <Card className="gap-0 py-0 shadow-none">
          <div className="divide-y divide-border/50 px-4 sm:px-6">
            {children}
          </div>
        </Card>
      </div>
      {footer ? <div className="mt-6">{footer}</div> : null}
    </section>
  )
}

// A single settings row: label (icon + text, with an optional description below)
// on the left, control on the right. Mirrors the store settings page.
function SettingRow({
  id,
  label,
  icon: Icon,
  description,
  children,
}: {
  id?: string
  label: string
  icon: IconComponent
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0 flex-1">
        <Label
          htmlFor={id}
          className="flex items-center gap-4 text-sm font-medium md:gap-6"
        >
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          {label}
        </Label>
        {description ? (
          <p className="mt-1.5 text-sm text-muted-foreground md:pl-10">
            {description}
          </p>
        ) : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

// A settings row that acts as a button, opening a dialog when clicked. Mirrors
// SettingRow's layout but trails a chevron instead of an inline control.
function NavSettingRow({
  label,
  icon: Icon,
  description,
  onClick,
}: {
  label: string
  icon: IconComponent
  description?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-mx-4 flex w-[calc(100%+2rem)] items-start justify-between gap-4 rounded-lg px-4 py-4 text-left transition-colors hover:bg-muted/50 sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-6"
    >
      <div className="min-w-0 flex-1">
        <span className="flex items-center gap-4 text-sm font-medium md:gap-6">
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          {label}
        </span>
        {description ? (
          <p className="mt-1.5 text-sm text-muted-foreground md:pl-10">
            {description}
          </p>
        ) : null}
      </div>
      <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
    </button>
  )
}

// Human-readable summary of a method's pricing, shown under its name.
function feeSummary(feeType: DeliveryFeeType | PickupFeeType, price: string) {
  if (feeType === 'calculated') return 'Calculated at checkout'
  if (feeType === 'quoted') return 'Quoted after order'
  const trimmed = price.trim()
  if (trimmed === '' || Number(trimmed) === 0) return 'Free'
  return `$${trimmed}`
}

// A single method row inside the Delivery/Pickup card: name + pricing summary
// on the left, an edit/delete menu on the right.
function MethodRow({
  icon: Icon,
  name,
  summary,
  onEdit,
  onDelete,
}: {
  icon: IconComponent
  name: string
  summary: string
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-4 md:gap-6">
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          <p className="min-w-0 flex-1 truncate text-sm font-medium">{name}</p>
        </div>
        {/* Summary aligns with the icon on mobile and under the name on desktop. */}
        <p className="mt-1 text-sm text-muted-foreground md:pl-10">{summary}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 text-muted-foreground"
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

// The "Add method" action shown to the right of a section title.
function AddMethodButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="outline" className="h-10" onClick={onClick}>
      <Plus className="size-4" />
      Add method
    </Button>
  )
}

// A single labelled $-prefixed price input, reused for method price and the
// discounted-delivery tiers.
function PriceField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="min-w-0 flex-1 space-y-1.5">
      <Label htmlFor={id} className="text-sm font-normal text-muted-foreground">
        {label}
      </Label>
      <InputGroup className="h-10">
        <InputGroupAddon align="inline-start" className="pl-3 text-base">
          $
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          inputMode="decimal"
          placeholder="0"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </InputGroup>
    </div>
  )
}

// The saved shape passed into the dialog when editing, and returned via onSave.
// `discountedFees` is ignored for pickup.
type MethodDraft = {
  name: string
  feeType: DeliveryFeeType | PickupFeeType
  price: string
  discountedFees: DiscountedFee[]
  instructions: string
}

// The dialog's internal working state adds the switches that gate the fee
// options, the discounted-delivery tiers, and the instructions textarea.
type MethodDraftState = MethodDraft & {
  feeEnabled: boolean
  offerDiscount: boolean
  instructionsEnabled: boolean
}

// The add/edit dialog. `kind` decides which fee options show and whether the
// discounted-delivery block is available. Re-mounted per open (keyed by the
// caller) so its draft always starts fresh from `initial`.
function MethodDialog({
  kind,
  initial,
  onOpenChange,
  onSave,
}: {
  kind: 'delivery' | 'pickup'
  initial: MethodDraft | null
  onOpenChange: (open: boolean) => void
  onSave: (method: MethodDraft) => void
}) {
  const isEditing = initial !== null
  const feeOptions = kind === 'delivery' ? DELIVERY_FEE_OPTIONS : PICKUP_FEE_OPTIONS
  const noun = kind === 'delivery' ? 'delivery' : 'pickup'

  const [draft, setDraft] = React.useState<MethodDraftState>(() =>
    initial
      ? {
          ...initial,
          feeEnabled: true,
          offerDiscount: initial.discountedFees.length > 0,
          instructionsEnabled: initial.instructions.trim() !== '',
        }
      : {
          name: '',
          feeType: 'set-price',
          price: '',
          discountedFees: [],
          instructions: '',
          feeEnabled: false,
          offerDiscount: false,
          instructionsEnabled: false,
        },
  )

  function update<K extends keyof MethodDraftState>(
    key: K,
    value: MethodDraftState[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  // Enabling the discount switch reveals the tiers; seed one empty tier so the
  // min-spend/delivery-fee fields appear immediately.
  function toggleOfferDiscount(checked: boolean) {
    setDraft((current) => {
      if (!checked) return { ...current, offerDiscount: false }
      const discountedFees =
        current.discountedFees.length > 0
          ? current.discountedFees
          : [{ id: nextId('fee'), minSpend: '', deliveryFee: '' }]
      return { ...current, offerDiscount: true, discountedFees }
    })
  }

  function addDiscountedFee() {
    setDraft((current) => {
      if (current.discountedFees.length >= MAX_DISCOUNTED_FEES) return current
      return {
        ...current,
        discountedFees: [
          ...current.discountedFees,
          { id: nextId('fee'), minSpend: '', deliveryFee: '' },
        ],
      }
    })
  }

  function updateDiscountedFee(
    id: string,
    key: 'minSpend' | 'deliveryFee',
    value: string,
  ) {
    setDraft((current) => ({
      ...current,
      discountedFees: current.discountedFees.map((fee) =>
        fee.id === id ? { ...fee, [key]: value } : fee,
      ),
    }))
  }

  function removeDiscountedFee(id: string) {
    setDraft((current) => ({
      ...current,
      discountedFees: current.discountedFees.filter((fee) => fee.id !== id),
    }))
  }

  // The normalized method that would be saved from the current draft.
  const payload: MethodDraft = {
    name: draft.name.trim(),
    // With the fee switch off the method is free: reset to an empty set price.
    feeType: draft.feeEnabled ? draft.feeType : 'set-price',
    price: draft.feeEnabled ? draft.price : '',
    // Discounted tiers only apply to priced delivery methods with the switch on.
    discountedFees:
      draft.feeEnabled &&
      kind === 'delivery' &&
      draft.feeType === 'set-price' &&
      draft.offerDiscount
        ? draft.discountedFees
        : [],
    instructions: draft.instructionsEnabled ? draft.instructions.trim() : '',
  }

  function handleSave() {
    if (!payload.name) {
      toast.error(`Enter a ${noun} method name`)
      return
    }
    onSave(payload)
  }

  // Require a name, and when editing require at least one unsaved change.
  const hasChanges =
    !isEditing || JSON.stringify(payload) !== JSON.stringify(initial)
  const canSave = payload.name !== '' && hasChanges

  const showSetPrice = draft.feeEnabled && draft.feeType === 'set-price'
  const showDiscounted = kind === 'delivery' && showSetPrice

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-6 overflow-hidden sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="shrink-0">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">
              {isEditing ? `Edit ${noun} method` : `Add ${noun} method`}
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <div className="-mx-6 flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto px-6">
          <div className="space-y-1.5">
            <Label htmlFor="method-name" className="text-sm font-medium">
              Method name
            </Label>
            <Input
              id="method-name"
              value={draft.name}
              onChange={(event) => update('name', event.target.value)}
              placeholder={
                kind === 'delivery' ? 'e.g. Standard delivery' : 'e.g. Store pickup'
              }
              className="h-10"
            />
          </div>

          <FieldSet>
            <div className="flex items-center justify-between gap-4">
              <FieldLegend variant="label" className="mb-0">
                {kind === 'delivery' ? 'Delivery' : 'Pickup'} fee
              </FieldLegend>
              <Switch
                aria-label={`${kind === 'delivery' ? 'Delivery' : 'Pickup'} fee`}
                checked={draft.feeEnabled}
                onCheckedChange={(checked) => update('feeEnabled', checked)}
              />
            </div>
            {draft.feeEnabled ? (
              <RadioGroup
                value={draft.feeType}
                onValueChange={(value) =>
                  update('feeType', value as DeliveryFeeType | PickupFeeType)
                }
                className="gap-0 divide-y overflow-hidden rounded-lg border"
              >
                {feeOptions.map((option) => (
                  <FieldLabel
                    key={option.value}
                    htmlFor={`fee-${option.value}`}
                    className="flex w-full items-start justify-between gap-3 px-4 py-3 font-normal transition-colors hover:bg-muted/50"
                  >
                    <span className="space-y-1">
                      <span className="block font-medium">{option.label}</span>
                      <span className="block text-sm font-normal text-muted-foreground">
                        {FEE_DESCRIPTIONS[option.value]}
                      </span>
                    </span>
                    <RadioGroupItem
                      value={option.value}
                      id={`fee-${option.value}`}
                      className="mt-0.5"
                    />
                  </FieldLabel>
                ))}
              </RadioGroup>
            ) : null}
          </FieldSet>

          {showSetPrice ? (
            <div className="flex gap-4">
              <PriceField
                id="method-price"
                label={kind === 'delivery' ? 'Delivery fee' : 'Pickup fee'}
                value={draft.price}
                onChange={(value) => update('price', value)}
              />
            </div>
          ) : null}

          {showDiscounted ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="offer-discount" className="text-sm font-medium">
                    Offer discounted/free delivery
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reward larger orders with a lower delivery fee
                  </p>
                </div>
                <Switch
                  id="offer-discount"
                  checked={draft.offerDiscount}
                  onCheckedChange={toggleOfferDiscount}
                />
              </div>

              {draft.offerDiscount ? (
                <div className="space-y-4">
                  {draft.discountedFees.map((fee, index) => (
                    <div key={fee.id} className="flex items-end gap-2 sm:gap-3">
                      <PriceField
                        id={`min-spend-${fee.id}`}
                        label="Minimum spend"
                        value={fee.minSpend}
                        onChange={(value) =>
                          updateDiscountedFee(fee.id, 'minSpend', value)
                        }
                      />
                      <PriceField
                        id={`delivery-fee-${fee.id}`}
                        label="Delivery fee"
                        value={fee.deliveryFee}
                        onChange={(value) =>
                          updateDiscountedFee(fee.id, 'deliveryFee', value)
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-10 shrink-0 text-muted-foreground"
                        aria-label={`Remove tier ${index + 1}`}
                        onClick={() => removeDiscountedFee(fee.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}

                  {draft.discountedFees.length < MAX_DISCOUNTED_FEES ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 gap-2"
                      onClick={addDiscountedFee}
                    >
                      <Plus className="size-4" />
                      Add option
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <Label htmlFor="method-instructions" className="text-sm font-medium">
                Instructions to customer
              </Label>
              <Switch
                id="instructions-enabled"
                checked={draft.instructionsEnabled}
                onCheckedChange={(checked) =>
                  update('instructionsEnabled', checked)
                }
              />
            </div>
            {draft.instructionsEnabled ? (
              <Textarea
                id="method-instructions"
                value={draft.instructions}
                onChange={(event) => update('instructions', event.target.value)}
                placeholder="Shared with customers at checkout"
                className="min-h-10"
              />
            ) : null}
          </div>
        </div>

        <DialogFooter className="shrink-0 flex-row">
          <Button
            variant="outline"
            className="h-10 flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button className="h-10 flex-1" onClick={handleSave} disabled={!canSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// A right-aligned Save button shown below an input once its value diverges from
// what's saved. Mirrors the store settings page.
function SaveRow({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-end pt-3">
      <Button type="button" size="lg" onClick={onClick}>
        Save
      </Button>
    </div>
  )
}

// A single time-slots card rendered on the Time slots sub-page. The switch and
// length radio save immediately (with toast feedback); the limit-orders and
// lead-time inputs commit via a Save button, and the hours via a dialog.
function TimeSlotsCard({
  kind,
  settings,
  onChange,
  onDirtyChange,
}: {
  kind: 'delivery' | 'pickup'
  settings: TimeSlotsSettings
  onChange: (settings: TimeSlotsSettings) => void
  onDirtyChange?: (dirty: boolean) => void
}) {
  const noun = kind === 'delivery' ? 'Delivery' : 'Pickup'
  const CardIcon = kind === 'delivery' ? Truck : ShoppingBag
  const [hoursOpen, setHoursOpen] = React.useState(false)

  // `form` holds the working values; `saved` holds what's persisted. The switch
  // and the length radio commit immediately; the limit-orders and lead-time
  // inputs diverge until their Save button commits them.
  const [form, setForm] = React.useState<TimeSlotsSettings>(settings)
  const [saved, setSaved] = React.useState<TimeSlotsSettings>(settings)
  const draft = form

  // Text-field edit: update the working form only.
  function update<K extends keyof TimeSlotsSettings>(
    key: K,
    value: TimeSlotsSettings[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  // Switch/radio change: persist immediately and show the save feedback.
  function updateAndSave<K extends keyof TimeSlotsSettings>(
    key: K,
    value: TimeSlotsSettings[K],
  ) {
    const next = { ...saved, [key]: value }
    setForm((current) => ({ ...current, [key]: value }))
    setSaved(next)
    onChange(next)
    runSaveFeedback()
  }

  // Revealing an input (limit orders / lead time) isn't a saved change: commit
  // the flag to both form and saved without any toast.
  function reveal<K extends keyof TimeSlotsSettings>(
    key: K,
    value: TimeSlotsSettings[K],
  ) {
    const next = { ...saved, [key]: value }
    setForm((current) => ({ ...current, [key]: value }))
    setSaved(next)
    onChange(next)
  }

  // Commit draft field(s) into `saved` and show the save feedback.
  function commit(fields: Partial<TimeSlotsSettings>) {
    const next = { ...saved, ...fields }
    setForm((current) => ({ ...current, ...fields }))
    setSaved(next)
    onChange(next)
    runSaveFeedback()
  }

  const limitCountDirty = form.limitCount !== saved.limitCount
  const leadTimeDirty =
    form.leadHours !== saved.leadHours || form.leadMinutes !== saved.leadMinutes

  // Report unsaved-input state up so the page can guard navigation away.
  const cardDirty = limitCountDirty || leadTimeDirty
  React.useEffect(() => {
    onDirtyChange?.(cardDirty)
  }, [cardDirty, onDirtyChange])

  return (
    <Card className="gap-0 py-0 shadow-none">
      <div className="flex flex-col gap-6 px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm font-medium md:gap-6">
            <CardIcon className="size-4 shrink-0 text-muted-foreground" />
            {noun} time slots
          </div>
          <Switch
            aria-label={`${noun} time slots`}
            checked={draft.enabled}
            onCheckedChange={(checked) => updateAndSave('enabled', checked)}
          />
        </div>

        {draft.enabled ? (
          <div className="flex min-w-0 flex-col divide-y divide-border/50 border-t border-border/50">
            <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="flex items-center gap-4 text-sm font-medium sm:flex-1 md:gap-6">
                <Timer className="size-4 shrink-0 text-muted-foreground" />
                Length
              </div>
              <RadioGroup
                aria-label="Length"
                value={draft.length}
                onValueChange={(value) =>
                  updateAndSave('length', value as SlotLength)
                }
                className="grid w-full grid-cols-3 gap-0 divide-x overflow-hidden rounded-lg border sm:w-72 sm:shrink-0"
              >
                {SLOT_LENGTHS.map((length) => (
                  <FieldLabel
                    key={length}
                    htmlFor={`length-${length}`}
                    className="flex w-full items-center justify-between gap-1 rounded-none px-3 py-3 text-sm font-medium transition-colors hover:bg-muted/50 has-[[data-checked]]:bg-primary/5"
                  >
                    {length} min
                    <RadioGroupItem value={length} id={`length-${length}`} />
                  </FieldLabel>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-sm font-medium md:gap-6">
                  <Clock className="size-4 shrink-0 text-muted-foreground" />
                  {noun} hours
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-10 shrink-0 text-muted-foreground"
                  aria-label={`Edit ${noun.toLowerCase()} hours`}
                  onClick={() => setHoursOpen(true)}
                >
                  <Pencil className="size-4" />
                </Button>
              </div>
              <div className="space-y-1 text-right text-sm text-muted-foreground">
                {draft.days.map((entry) => (
                  <div key={entry.day}>
                    {entry.day.slice(0, 3)}: {daySummary(entry)}
                  </div>
                ))}
              </div>
            </div>

            <div className="py-4">
              {draft.limitOrders ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                  <Label
                    htmlFor="limit-orders"
                    className="flex items-center gap-4 text-sm font-medium sm:flex-1 md:gap-6"
                  >
                    <Gauge className="size-4 shrink-0 text-muted-foreground" />
                    Limit orders
                  </Label>
                  <InputGroup className="h-10 w-full sm:w-72 sm:shrink-0">
                    <InputGroupInput
                      id="limit-orders"
                      aria-label="Order limit"
                      inputMode="numeric"
                      value={draft.limitCount}
                      onChange={(event) => update('limitCount', event.target.value)}
                      placeholder="5"
                      className="pl-3"
                    />
                    <InputGroupAddon align="inline-end" className="pr-3">
                      every {draft.length} min
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <Label className="flex items-center gap-4 text-sm font-medium md:gap-6">
                    <Gauge className="size-4 shrink-0 text-muted-foreground" />
                    Limit orders
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Add order limit"
                    className="size-10 shrink-0 text-muted-foreground"
                    onClick={() => reveal('limitOrders', true)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              )}
              {draft.limitOrders && limitCountDirty ? (
                <SaveRow onClick={() => commit({ limitCount: form.limitCount })} />
              ) : null}
            </div>

            <div className="pt-4">
              {draft.leadTime ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div className="space-y-1 sm:flex-1">
                    <Label
                      htmlFor="lead-hours"
                      className="flex items-center gap-4 text-sm font-medium md:gap-6"
                    >
                      <Hourglass className="size-4 shrink-0 text-muted-foreground" />
                      Lead time
                    </Label>
                    <p className="text-sm text-muted-foreground md:pl-10">
                      Set extra time to prepare orders
                    </p>
                  </div>
                  <div className="flex w-full items-center gap-2 sm:w-72 sm:shrink-0">
                    <InputGroup className="h-10 flex-1">
                      <InputGroupInput
                        id="lead-hours"
                        aria-label="Lead time hours"
                        inputMode="numeric"
                        value={draft.leadHours}
                        onChange={(event) => update('leadHours', event.target.value)}
                        placeholder="1"
                        className="pl-3"
                      />
                      <InputGroupAddon align="inline-end" className="pr-3">
                        h
                      </InputGroupAddon>
                    </InputGroup>
                    <InputGroup className="h-10 flex-1">
                      <InputGroupInput
                        aria-label="Lead time minutes"
                        inputMode="numeric"
                        value={draft.leadMinutes}
                        onChange={(event) =>
                          update('leadMinutes', event.target.value)
                        }
                        placeholder="0"
                        className="pl-3"
                      />
                      <InputGroupAddon align="inline-end" className="pr-3">
                        min
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-4 text-sm font-medium md:gap-6">
                      <Hourglass className="size-4 shrink-0 text-muted-foreground" />
                      Lead time
                    </Label>
                    <p className="text-sm text-muted-foreground md:pl-10">
                      Set extra time to prepare orders
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Add lead time"
                    className="size-10 shrink-0 text-muted-foreground"
                    onClick={() => reveal('leadTime', true)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              )}
              {draft.leadTime && leadTimeDirty ? (
                <SaveRow
                  onClick={() =>
                    commit({
                      leadHours: form.leadHours,
                      leadMinutes: form.leadMinutes,
                    })
                  }
                />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
      {hoursOpen ? (
        <HoursDialog
          noun={noun}
          days={draft.days}
          onOpenChange={setHoursOpen}
          onSave={(days) => {
            commit({ days })
            setHoursOpen(false)
          }}
        />
      ) : null}
    </Card>
  )
}

// A one-line summary of a day's hours for the read-only card view.
function daySummary(entry: DaySchedule) {
  if (entry.ranges.length === 0) return 'Closed'
  return entry.ranges.map((range) => `${range.from} – ${range.to}`).join(', ')
}

// Editing the weekly hours, opened from the pencil on the time-slots card.
// Mirrors the add/edit method dialog: scrolling body, sticky Cancel/Save footer.
function HoursDialog({
  noun,
  days,
  onOpenChange,
  onSave,
}: {
  noun: string
  days: DaySchedule[]
  onOpenChange: (open: boolean) => void
  onSave: (days: DaySchedule[]) => void
}) {
  const [draft, setDraft] = React.useState<DaySchedule[]>(days)

  function mapDays(fn: (day: DaySchedule) => DaySchedule) {
    setDraft((current) => current.map(fn))
  }

  function updateRange(
    day: string,
    id: string,
    key: 'from' | 'to',
    value: string,
  ) {
    mapDays((entry) =>
      entry.day === day
        ? {
            ...entry,
            ranges: entry.ranges.map((range) =>
              range.id === id ? { ...range, [key]: value } : range,
            ),
          }
        : entry,
    )
  }

  function addRange(day: string) {
    mapDays((entry) =>
      entry.day === day
        ? {
            ...entry,
            ranges: [
              ...entry.ranges,
              { id: nextId('slot'), from: '9:00 AM', to: '6:00 PM' },
            ],
          }
        : entry,
    )
  }

  function removeRange(day: string, id: string) {
    mapDays((entry) =>
      entry.day === day
        ? { ...entry, ranges: entry.ranges.filter((range) => range.id !== id) }
        : entry,
    )
  }

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(days)
  // At least one day must have hours; otherwise there's nothing to save.
  const hasAnyHours = draft.some((entry) => entry.ranges.length > 0)
  const canSave = hasChanges && hasAnyHours

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-6 overflow-hidden sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="shrink-0">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">{noun} hours</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <div className="-mx-6 flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto px-6">
          {draft.map((entry) => (
            <div key={entry.day} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-medium">{entry.day}</div>
                <div className="flex items-center gap-2">
                  {entry.ranges.length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      No hours
                    </span>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10 shrink-0 text-muted-foreground"
                    aria-label={`Add ${entry.day} time range`}
                    onClick={() => addRange(entry.day)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>
              {entry.ranges.map((range) => (
                <div key={range.id} className="flex w-full items-center gap-1.5">
                  <Select
                    value={range.from}
                    onValueChange={(value) =>
                      updateRange(entry.day, range.id, 'from', value)
                    }
                  >
                    <SelectTrigger className="h-10 min-w-0 flex-1 data-[size=default]:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">to</span>
                  <Select
                    value={range.to}
                    onValueChange={(value) =>
                      updateRange(entry.day, range.id, 'to', value)
                    }
                  >
                    <SelectTrigger className="h-10 min-w-0 flex-1 data-[size=default]:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10 shrink-0 text-muted-foreground"
                    aria-label={`Remove ${entry.day} time range`}
                    onClick={() => removeRange(entry.day, range.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          ))}
        </div>

        <DialogFooter className="shrink-0 flex-row">
          <Button
            variant="outline"
            className="h-10 flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 flex-1"
            onClick={() => onSave(draft)}
            disabled={!canSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// The email-reminder dialog, opened from the Schedule section card. Mirrors the
// method dialog's layout (scrolling body, sticky footer).
function EmailReminderDialog({
  settings,
  onOpenChange,
  onSave,
}: {
  settings: EmailReminderSettings
  onOpenChange: (open: boolean) => void
  onSave: (settings: EmailReminderSettings) => void
}) {
  const [draft, setDraft] = React.useState<EmailReminderSettings>(settings)

  function update<K extends keyof EmailReminderSettings>(
    key: K,
    value: EmailReminderSettings[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function sendTest() {
    toast.success('Test email sent')
  }

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(settings)

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-6 overflow-hidden sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="shrink-0">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">Email reminder</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <div className="-mx-6 flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto px-6">
          <FieldLabel
            htmlFor="send-email-reminder"
            className="transition-colors hover:bg-muted/50"
          >
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Send email at 8 AM</FieldTitle>
              </FieldContent>
              <Switch
                id="send-email-reminder"
                checked={draft.enabled}
                onCheckedChange={(checked) => update('enabled', checked)}
              />
            </Field>
          </FieldLabel>

          {draft.enabled ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="days-before" className="text-sm font-medium">
                  Schedule
                </Label>
                <InputGroup className="h-10">
                  <InputGroupInput
                    id="days-before"
                    inputMode="numeric"
                    placeholder="0"
                    value={draft.daysBefore}
                    onChange={(event) =>
                      update('daysBefore', event.target.value)
                    }
                    className="pl-3"
                  />
                  <InputGroupAddon align="inline-end" className="pr-3">
                    days before fulfillment
                  </InputGroupAddon>
                </InputGroup>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reminder-subject" className="text-sm font-medium">
                  Subject
                </Label>
                <Textarea
                  id="reminder-subject"
                  value={draft.subject}
                  onChange={(event) => update('subject', event.target.value)}
                  placeholder="Your order is coming up"
                  className="min-h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reminder-message" className="text-sm font-medium">
                  Message
                </Label>
                <Textarea
                  id="reminder-message"
                  value={draft.message}
                  onChange={(event) => update('message', event.target.value)}
                  placeholder="Shared with customers in the reminder email"
                  className="min-h-10"
                />
              </div>

              <Button
                variant="outline"
                className="h-10 w-full"
                onClick={sendTest}
              >
                Send test email
              </Button>
            </>
          ) : null}
        </div>

        <DialogFooter className="shrink-0 flex-row">
          <Button
            variant="outline"
            className="h-10 flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 flex-1"
            onClick={() => onSave(draft)}
            disabled={!hasChanges}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Tracks which dialog is open and, when editing, which method it targets.
type DialogState =
  | { kind: 'delivery'; method: DeliveryMethod | null }
  | { kind: 'pickup'; method: PickupMethod | null }
  | null

const FULFILLMENT_PATH = '/admin/apps/online-store/fulfillment'
const TIME_SLOTS_PATH = '/admin/apps/online-store/fulfillment/time-slots'

// Client-side navigation matching the app's router (pushState + popstate).
function navigateTo(path: string) {
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

// The time-slots settings screen, mounted at TIME_SLOTS_PATH. Reached from the
// "Time slots" row on the Fulfillment page's Schedule section.
export function AdminTimeSlotsPage() {
  const [deliveryTimeSlots, setDeliveryTimeSlots] =
    React.useState<TimeSlotsSettings>(defaultTimeSlots)
  const [pickupTimeSlots, setPickupTimeSlots] =
    React.useState<TimeSlotsSettings>(defaultTimeSlots)

  // Either card reports when its inputs have uncommitted edits; while any are
  // dirty, leaving the page is held in `pendingNav` until the user confirms.
  const [deliveryDirty, setDeliveryDirty] = React.useState(false)
  const [pickupDirty, setPickupDirty] = React.useState(false)
  const isDirty = deliveryDirty || pickupDirty
  const [pendingNav, setPendingNav] = React.useState<(() => void) | null>(null)

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

  // The back button navigates via pushState (not an anchor), so guard it here.
  function goBack() {
    if (isDirty) {
      setPendingNav(() => () => navigateTo(FULFILLMENT_PATH))
      return
    }
    navigateTo(FULFILLMENT_PATH)
  }

  return (
    <>
      <div className="w-full">
        <header className="relative mb-8 flex items-center justify-center">
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label="Go back"
            onClick={goBack}
            className="absolute left-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-normal text-neutral-900">
            Time slots
          </h1>
        </header>

        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8">
          <TimeSlotsCard
            kind="delivery"
            settings={deliveryTimeSlots}
            onChange={setDeliveryTimeSlots}
            onDirtyChange={setDeliveryDirty}
          />
          <TimeSlotsCard
            kind="pickup"
            settings={pickupTimeSlots}
            onChange={setPickupTimeSlots}
            onDirtyChange={setPickupDirty}
          />
        </div>
      </div>

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
              You have unsaved changes. If you leave this page, your changes will
              be lost.
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

export function AdminFulfillmentPage() {
  const [fulfillmentDates, setFulfillmentDates] = React.useState(false)
  const [verifiedAddresses, setVerifiedAddresses] = React.useState(true)
  const [deliveryMethods, setDeliveryMethods] = React.useState<DeliveryMethod[]>(
    INITIAL_DELIVERY_METHODS,
  )
  const [pickupMethods, setPickupMethods] = React.useState<PickupMethod[]>(
    INITIAL_PICKUP_METHODS,
  )
  const [dialog, setDialog] = React.useState<DialogState>(null)
  const [emailReminder, setEmailReminder] =
    React.useState<EmailReminderSettings>(defaultEmailReminder)
  const [emailReminderOpen, setEmailReminderOpen] = React.useState(false)
  const [pendingDatesToggle, setPendingDatesToggle] = React.useState<
    boolean | null
  >(null)
  const [pendingDelete, setPendingDelete] = React.useState<
    | { kind: 'delivery'; method: DeliveryMethod }
    | { kind: 'pickup'; method: PickupMethod }
    | null
  >(null)

  function toggleVerifiedAddresses(checked: boolean) {
    setVerifiedAddresses(checked)
    toast.success('Changes saved')
  }

  function saveEmailReminder(settings: EmailReminderSettings) {
    setEmailReminder(settings)
    setEmailReminderOpen(false)
    toast.success('Changes saved')
  }

  function confirmDatesToggle() {
    if (pendingDatesToggle === null) return
    setFulfillmentDates(pendingDatesToggle)
    setPendingDatesToggle(null)
    toast.success('Changes saved')
  }

  function confirmDelete() {
    if (pendingDelete === null) return
    if (pendingDelete.kind === 'delivery') {
      deleteDeliveryMethod(pendingDelete.method.id)
    } else {
      deletePickupMethod(pendingDelete.method.id)
    }
    setPendingDelete(null)
  }

  function saveDeliveryMethod(draft: MethodDraft) {
    const editing = dialog?.kind === 'delivery' ? dialog.method : null
    const next: DeliveryMethod = {
      id: editing?.id ?? nextId('delivery'),
      name: draft.name,
      feeType: draft.feeType as DeliveryFeeType,
      price: draft.price,
      discountedFees: draft.discountedFees,
      instructions: draft.instructions,
    }
    setDeliveryMethods((current) =>
      editing
        ? current.map((method) => (method.id === editing.id ? next : method))
        : [...current, next],
    )
    setDialog(null)
    toast.success(editing ? 'Delivery method updated' : 'Delivery method added')
  }

  function savePickupMethod(draft: MethodDraft) {
    const editing = dialog?.kind === 'pickup' ? dialog.method : null
    const next: PickupMethod = {
      id: editing?.id ?? nextId('pickup'),
      name: draft.name,
      feeType: draft.feeType as PickupFeeType,
      price: draft.price,
      instructions: draft.instructions,
    }
    setPickupMethods((current) =>
      editing
        ? current.map((method) => (method.id === editing.id ? next : method))
        : [...current, next],
    )
    setDialog(null)
    toast.success(editing ? 'Pickup method updated' : 'Pickup method added')
  }

  function deleteDeliveryMethod(id: string) {
    setDeliveryMethods((current) => current.filter((method) => method.id !== id))
    toast.success('Delivery method deleted')
  }

  function deletePickupMethod(id: string) {
    setPickupMethods((current) => current.filter((method) => method.id !== id))
    toast.success('Pickup method deleted')
  }

  return (
    <>
      <div className="w-full">
        <header className="relative mb-8 flex items-center justify-center">
          {/* Back button is only shown on mobile; on desktop the sidebar covers
              navigation. */}
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label="Go back"
            onClick={() => window.history.back()}
            className="absolute left-0 md:hidden"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-normal text-neutral-900">
            Fulfillment
          </h1>
        </header>

        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8">
          <Section
            title="Delivery"
            action={
              <AddMethodButton
                onClick={() => setDialog({ kind: 'delivery', method: null })}
              />
            }
            footer={
              <Card className="gap-0 py-0 shadow-none">
                <div className="px-4 sm:px-6">
                  <SettingRow
                    id="verified-addresses"
                    label="Verify address"
                    icon={MapPin}
                    description="Customers select addresses verified by Google Maps"
                  >
                    <Switch
                      id="verified-addresses"
                      aria-label="Verify address"
                      checked={verifiedAddresses}
                      onCheckedChange={toggleVerifiedAddresses}
                    />
                  </SettingRow>
                </div>
              </Card>
            }
          >
            {deliveryMethods.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No delivery methods
              </p>
            ) : (
              deliveryMethods.map((method) => (
                <MethodRow
                  key={method.id}
                  icon={Truck}
                  name={method.name}
                  summary={feeSummary(method.feeType, method.price)}
                  onEdit={() => setDialog({ kind: 'delivery', method })}
                  onDelete={() =>
                    setPendingDelete({ kind: 'delivery', method })
                  }
                />
              ))
            )}
          </Section>

          <Section
            title="Pickup"
            action={
              <AddMethodButton
                onClick={() => setDialog({ kind: 'pickup', method: null })}
              />
            }
          >
            {pickupMethods.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No pickup methods
              </p>
            ) : (
              pickupMethods.map((method) => (
                <MethodRow
                  key={method.id}
                  icon={ShoppingBag}
                  name={method.name}
                  summary={feeSummary(method.feeType, method.price)}
                  onEdit={() => setDialog({ kind: 'pickup', method })}
                  onDelete={() => setPendingDelete({ kind: 'pickup', method })}
                />
              ))
            )}
          </Section>

          <Section
            title="Schedule"
            footer={
              fulfillmentDates ? (
                <div className="space-y-6">
                  <Card className="gap-0 py-0 shadow-none">
                    <div className="px-4 sm:px-6">
                      <NavSettingRow
                        label="Time slots"
                        icon={Clock}
                        description="Set available delivery and pickup times"
                        onClick={() => navigateTo(TIME_SLOTS_PATH)}
                      />
                    </div>
                  </Card>
                  <Card className="gap-0 py-0 shadow-none">
                    <div className="px-4 sm:px-6">
                      <NavSettingRow
                        label="Email reminder"
                        icon={Mail}
                        description="Remind customers about their order"
                        onClick={() => setEmailReminderOpen(true)}
                      />
                    </div>
                  </Card>
                </div>
              ) : null
            }
          >
            <SettingRow
              label="Fulfillment dates"
              icon={CalendarClock}
              description="Allow customers to choose when they want their order"
            >
              <Switch
                aria-label="Fulfillment dates"
                checked={fulfillmentDates}
                onCheckedChange={(checked) => setPendingDatesToggle(checked)}
              />
            </SettingRow>
          </Section>
        </div>
      </div>

      {dialog !== null ? (
        <MethodDialog
          // Re-mount per open/target so the draft resets from `initial`.
          key={`${dialog.kind}-${dialog.method?.id ?? 'new'}`}
          kind={dialog.kind}
          initial={
            dialog.method
              ? {
                  name: dialog.method.name,
                  feeType: dialog.method.feeType,
                  price: dialog.method.price,
                  discountedFees:
                    dialog.kind === 'delivery'
                      ? (dialog.method as DeliveryMethod).discountedFees
                      : [],
                  instructions: dialog.method.instructions,
                }
              : null
          }
          onOpenChange={(open) => {
            if (!open) setDialog(null)
          }}
          onSave={
            dialog.kind === 'delivery' ? saveDeliveryMethod : savePickupMethod
          }
        />
      ) : null}

      {emailReminderOpen ? (
        <EmailReminderDialog
          settings={emailReminder}
          onOpenChange={(open) => {
            if (!open) setEmailReminderOpen(false)
          }}
          onSave={saveEmailReminder}
        />
      ) : null}

      <AlertDialog
        open={pendingDatesToggle !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDatesToggle(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDatesToggle
                ? 'Enable fulfillment dates?'
                : 'Disable fulfillment dates?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDatesToggle
                ? 'Customers will be able to choose when they want their order.'
                : 'Customers will no longer be able to choose when they want their order.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDatesToggle}>
              {pendingDatesToggle ? 'Enable' : 'Disable'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDelete?.kind === 'pickup'
                ? 'Delete pickup method?'
                : 'Delete delivery method?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `${pendingDelete.method.name} will be removed and no longer offered at checkout.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
