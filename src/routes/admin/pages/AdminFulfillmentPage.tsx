import * as React from 'react'
import {
  ArrowLeft,
  CalendarClock,
  MoreHorizontal,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react'
import { toast } from 'sonner'

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
import { FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
  footer,
  children,
}: {
  title: string
  description?: string
  footer?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <TypographyLarge>{title}</TypographyLarge>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <Card className="gap-0 py-0 shadow-none">
        <div className="divide-y-0 divide-border/50 px-4 sm:divide-y sm:px-6">
          {children}
        </div>
      </Card>
      {footer}
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
          className="flex items-center gap-3 text-sm font-medium sm:gap-6"
        >
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          {label}
        </Label>
        {description ? (
          <p className="mt-1.5 text-sm text-muted-foreground sm:pl-10">
            {description}
          </p>
        ) : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
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

// A single method row inside the Delivery/Pickup card: name + pricing summary +
// instructions on the left, an edit/delete menu on the right.
function MethodRow({
  icon: Icon,
  name,
  summary,
  instructions,
  onEdit,
  onDelete,
}: {
  icon: IconComponent
  name: string
  summary: string
  instructions: string
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex min-w-0 flex-1 items-start gap-6">
        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="shrink-0">{summary}</span>
            {instructions ? (
              <>
                <span aria-hidden className="text-muted-foreground/40">
                  •
                </span>
                <span className="truncate">{instructions}</span>
              </>
            ) : null}
          </p>
        </div>
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

// The full-width "Add …" action that sits below a method card, mirroring the
// "Add item" button on the add-order page.
function AddMethodButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="secondary"
      className="h-10 w-full"
      onClick={onClick}
    >
      <Plus className="size-4" />
      {label}
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

// The dialog's internal working state adds the two switches that gate the
// discounted-delivery tiers and the instructions textarea.
type MethodDraftState = MethodDraft & {
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
          offerDiscount: initial.discountedFees.length > 0,
          instructionsEnabled: initial.instructions.trim() !== '',
        }
      : {
          name: '',
          feeType: 'set-price',
          price: '',
          discountedFees: [],
          instructions: '',
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

  function handleSave() {
    const name = draft.name.trim()
    if (!name) {
      toast.error(`Enter a ${noun} method name`)
      return
    }
    onSave({
      name,
      feeType: draft.feeType,
      price: draft.price,
      // Discounted tiers only apply to priced delivery methods with the switch on.
      discountedFees:
        kind === 'delivery' && draft.feeType === 'set-price' && draft.offerDiscount
          ? draft.discountedFees
          : [],
      instructions: draft.instructionsEnabled ? draft.instructions.trim() : '',
    })
  }

  const showSetPrice = draft.feeType === 'set-price'
  const showDiscounted = kind === 'delivery' && showSetPrice

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] gap-6 overflow-y-auto sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader>
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">
              {isEditing ? `Edit ${noun} method` : `Add ${noun} method`}
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-w-0 flex-col gap-6">
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
            <FieldLegend variant="label">
              {kind === 'delivery' ? 'Delivery' : 'Pickup'} fee
            </FieldLegend>
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
                      className="h-9 gap-2"
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

        <DialogFooter className="flex-row">
          <Button
            variant="outline"
            className="h-10 flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button className="h-10 flex-1" onClick={handleSave}>
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

export function AdminFulfillmentPage() {
  const [fulfillmentDates, setFulfillmentDates] = React.useState(false)
  const [deliveryMethods, setDeliveryMethods] = React.useState<DeliveryMethod[]>(
    INITIAL_DELIVERY_METHODS,
  )
  const [pickupMethods, setPickupMethods] = React.useState<PickupMethod[]>(
    INITIAL_PICKUP_METHODS,
  )
  const [dialog, setDialog] = React.useState<DialogState>(null)

  function toggleFulfillmentDates(checked: boolean) {
    setFulfillmentDates(checked)
    toast.success('Changes saved')
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
          <Section title="Scheduling">
            <SettingRow
              label="Fulfillment dates"
              icon={CalendarClock}
              description="Allow customers to choose when they want to receive their order"
            >
              <Switch
                aria-label="Fulfillment dates"
                checked={fulfillmentDates}
                onCheckedChange={toggleFulfillmentDates}
              />
            </SettingRow>
          </Section>

          <Section
            title="Delivery"
            footer={
              <AddMethodButton
                label="Add delivery method"
                onClick={() => setDialog({ kind: 'delivery', method: null })}
              />
            }
          >
            {deliveryMethods.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                No delivery methods yet.
              </p>
            ) : (
              deliveryMethods.map((method) => (
                <MethodRow
                  key={method.id}
                  icon={Truck}
                  name={method.name}
                  summary={feeSummary(method.feeType, method.price)}
                  instructions={method.instructions}
                  onEdit={() => setDialog({ kind: 'delivery', method })}
                  onDelete={() => deleteDeliveryMethod(method.id)}
                />
              ))
            )}
          </Section>

          <Section
            title="Pickup"
            footer={
              <AddMethodButton
                label="Add pickup method"
                onClick={() => setDialog({ kind: 'pickup', method: null })}
              />
            }
          >
            {pickupMethods.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                No pickup methods yet.
              </p>
            ) : (
              pickupMethods.map((method) => (
                <MethodRow
                  key={method.id}
                  icon={ShoppingBag}
                  name={method.name}
                  summary={feeSummary(method.feeType, method.price)}
                  instructions={method.instructions}
                  onEdit={() => setDialog({ kind: 'pickup', method })}
                  onDelete={() => deletePickupMethod(method.id)}
                />
              ))
            )}
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
    </>
  )
}
