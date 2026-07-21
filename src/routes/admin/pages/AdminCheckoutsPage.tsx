import * as React from 'react'
import {
  ArrowLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Gift,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  ShoppingCart,
  Tag,
  Trash2,
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
import { Badge } from '@/components/ui/badge'
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
import { FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { TypographyH4, TypographyLarge } from '@/components/ui/typography'
import { cn } from '@/lib/utils'

type IconComponent = React.ComponentType<{ className?: string }>

const ORDER_FORM_PATH = '/admin/apps/online-store/checkouts/order-form'

// Client-side navigation matching the app's router (pushState + popstate).
function navigateTo(path: string) {
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

type Country = { name: string; code: string; dial: string; flag: string }

// Sorted alphabetically by country name, matching the add-order page's dropdown.
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

type CheckoutForm = {
  giftOrders: boolean
  giftMessage: boolean
  instructionsEnabled: boolean
  instructions: string
  whatsappEnabled: boolean
  whatsappCountry: string
  whatsappNumber: string
  recoverAbandoned: boolean
}

// Baseline state that represents the currently-saved checkout settings. The
// working `form` diverges from `saved` per-field until each edit is committed.
const INITIAL_FORM: CheckoutForm = {
  giftOrders: false,
  giftMessage: false,
  instructionsEnabled: false,
  instructions: '',
  whatsappEnabled: false,
  whatsappCountry: 'US',
  whatsappNumber: '',
  recoverAbandoned: false,
}

// The global <Toaster/> paints every toast with the success (green) palette via
// `--normal-bg`. The in-progress "Saving changes…" toast must NOT read as green,
// so it overrides those vars with the neutral popover palette; the follow-up
// "Changes saved" toast restores the green success palette explicitly (updating
// a toast by id keeps its prior inline style otherwise).
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
const SAVE_TOAST_ID = 'checkouts-save'

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

// A titled section: heading (and optional description) sit outside the card,
// fields stack as divided rows inside it. Mirrors the store settings page.
function Section({
  title,
  description,
  children,
}: {
  title?: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      {title || description ? (
        <div className="space-y-1">
          {title ? <TypographyLarge>{title}</TypographyLarge> : null}
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      <Card className="gap-0 py-0 shadow-none">
        <div className="divide-y-0 divide-border/50 px-4 sm:divide-y sm:px-6">
          {children}
        </div>
      </Card>
    </section>
  )
}

// A tappable card that navigates to another page: icon + label with an optional
// description, and a trailing chevron. Mirrors the "Manual payments" link on the
// payments settings page.
function NavCard({
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
    <Card className="gap-0 py-0 shadow-none">
      <button
        type="button"
        onClick={onClick}
        className="flex flex-col rounded-xl px-4 py-4 text-left transition-colors hover:bg-muted/50 sm:px-6"
      >
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-3 text-sm font-medium sm:gap-6">
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            {label}
          </span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </div>
        {description ? (
          <p className="mt-1.5 text-sm text-muted-foreground sm:pl-10">
            {description}
          </p>
        ) : null}
      </button>
    </Card>
  )
}

// The values a discount dialog edits. Suggested discounts carry a full draft so
// clicking one opens the dialog pre-filled.
type DiscountDraft = {
  appliedTo: 'all-products' | 'fulfillment-fee'
  discountType: 'off-total' | 'percent-off'
  amount: string
  maxDiscountEnabled: boolean
  maxDiscount: string
  minPurchaseEnabled: boolean
  minPurchase: string
}

const SUGGESTED_DISCOUNTS: {
  title: string
  meta: string
  draft: DiscountDraft
}[] = [
  {
    title: 'Free fulfillment',
    meta: 'Min purchase: $20',
    draft: {
      appliedTo: 'fulfillment-fee',
      discountType: 'percent-off',
      amount: '100',
      maxDiscountEnabled: false,
      maxDiscount: '',
      minPurchaseEnabled: true,
      minPurchase: '20',
    },
  },
  {
    title: '$5 off',
    meta: 'Min purchase: $20',
    draft: {
      appliedTo: 'all-products',
      discountType: 'off-total',
      amount: '5',
      maxDiscountEnabled: false,
      maxDiscount: '',
      minPurchaseEnabled: true,
      minPurchase: '20',
    },
  },
]

// A short summary of a saved discount — its value and (if set) its minimum
// purchase — shown as the "Offer a discount" description once one is added.
function formatDiscount(draft: DiscountDraft): string {
  const value =
    draft.discountType === 'percent-off'
      ? `${draft.amount}% off`
      : `$${draft.amount} off`
  if (draft.minPurchaseEnabled && draft.minPurchase) {
    return `${value} • Min purchase: $${draft.minPurchase}`
  }
  return value
}

// A tappable suggested-discount row: a title and its condition on the left, a
// trailing chevron on the right. Sits in the title column so it lines up with
// the label text and description above it.
function DiscountRow({
  title,
  meta,
  onClick,
}: {
  title: string
  meta: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-full items-center justify-between gap-4 rounded-md text-left text-sm transition-colors hover:bg-muted/50"
    >
      <span>
        {title} <span className="text-muted-foreground/40">•</span>{' '}
        <span className="text-muted-foreground">{meta}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  )
}

// A $-prefixed amount input, matching the price fields in the delivery method
// dialog.
function AmountField({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (value: string) => void
}) {
  return (
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
  )
}

// Edit dialog for a discount, opened by tapping a suggested discount and
// pre-filled with its values. Styled after the delivery method dialog. Keyed by
// the caller so its draft starts fresh from `initial` on each open.
function DiscountDialog({
  initial,
  isEditing,
  onOpenChange,
  onSave,
}: {
  initial: DiscountDraft
  isEditing: boolean
  onOpenChange: (open: boolean) => void
  onSave: (draft: DiscountDraft) => void
}) {
  const [draft, setDraft] = React.useState<DiscountDraft>(initial)

  function update<K extends keyof DiscountDraft>(key: K, value: DiscountDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const isPercent = draft.discountType === 'percent-off'

  // Saving requires a discount amount greater than zero. Number('') is 0, so
  // this also blocks an empty input.
  const canSave = Number(draft.amount) > 0

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-6 overflow-hidden sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="shrink-0">
          <DialogTitle asChild>
            <TypographyH4 className="text-center font-semibold">
              {isEditing ? 'Edit discount' : 'Add discount'}
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <div className="-mx-6 flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto px-6">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Discount</Label>
              <RadioGroup
                aria-label="Discount"
                value={draft.discountType}
                onValueChange={(value) =>
                  update('discountType', value as DiscountDraft['discountType'])
                }
                className="grid w-full grid-cols-2 gap-0 divide-x overflow-hidden rounded-lg border"
              >
                <FieldLabel
                  htmlFor="discount-off-total"
                  className="flex w-full items-center justify-between gap-1 rounded-none px-3 py-3 text-sm font-normal transition-colors hover:bg-muted/50 has-[[data-checked]]:bg-primary/5"
                >
                  Off total
                  <RadioGroupItem value="off-total" id="discount-off-total" />
                </FieldLabel>
                <FieldLabel
                  htmlFor="discount-percent-off"
                  className="flex w-full items-center justify-between gap-1 rounded-none px-3 py-3 text-sm font-normal transition-colors hover:bg-muted/50 has-[[data-checked]]:bg-primary/5"
                >
                  Percent off
                  <RadioGroupItem value="percent-off" id="discount-percent-off" />
                </FieldLabel>
              </RadioGroup>
            </div>
            <InputGroup className="h-10">
              {!isPercent ? (
                <InputGroupAddon align="inline-start" className="pl-3 text-base">
                  $
                </InputGroupAddon>
              ) : null}
              <InputGroupInput
                id="discount-amount"
                inputMode="decimal"
                placeholder="0"
                value={draft.amount}
                onChange={(event) => update('amount', event.target.value)}
                className={isPercent ? 'pl-3' : undefined}
              />
              {isPercent ? (
                <InputGroupAddon align="inline-end" className="pr-3 text-base">
                  %
                </InputGroupAddon>
              ) : null}
            </InputGroup>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Applies to</Label>
            <RadioGroup
              aria-label="Applies to"
              value={draft.appliedTo}
              onValueChange={(value) =>
                update('appliedTo', value as DiscountDraft['appliedTo'])
              }
              className="grid w-full grid-cols-2 gap-0 divide-x overflow-hidden rounded-lg border"
            >
              <FieldLabel
                htmlFor="applied-all-products"
                className="flex w-full items-center justify-between gap-1 rounded-none px-3 py-3 text-sm font-normal transition-colors hover:bg-muted/50 has-[[data-checked]]:bg-primary/5"
              >
                Products
                <RadioGroupItem value="all-products" id="applied-all-products" />
              </FieldLabel>
              <FieldLabel
                htmlFor="applied-fulfillment-fee"
                className="flex w-full items-center justify-between gap-1 rounded-none px-3 py-3 text-sm font-normal transition-colors hover:bg-muted/50 has-[[data-checked]]:bg-primary/5"
              >
                Fulfillment fee
                <RadioGroupItem
                  value="fulfillment-fee"
                  id="applied-fulfillment-fee"
                />
              </FieldLabel>
            </RadioGroup>
          </div>

          {isPercent ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <Label htmlFor="max-discount" className="text-sm font-medium">
                  Maximum discount
                </Label>
                <Switch
                  id="max-discount"
                  checked={draft.maxDiscountEnabled}
                  onCheckedChange={(checked) =>
                    update('maxDiscountEnabled', checked)
                  }
                />
              </div>
              {draft.maxDiscountEnabled ? (
                <AmountField
                  id="max-discount-amount"
                  value={draft.maxDiscount}
                  onChange={(value) => update('maxDiscount', value)}
                />
              ) : null}
            </div>
          ) : null}

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <Label htmlFor="min-purchase" className="text-sm font-medium">
                Minimum purchase
              </Label>
              <Switch
                id="min-purchase"
                checked={draft.minPurchaseEnabled}
                onCheckedChange={(checked) =>
                  update('minPurchaseEnabled', checked)
                }
              />
            </div>
            {draft.minPurchaseEnabled ? (
              <AmountField
                id="min-purchase-amount"
                value={draft.minPurchase}
                onChange={(value) => update('minPurchase', value)}
              />
            ) : null}
          </div>
        </div>

        <DialogFooter className="shrink-0 flex-row">
          <Button
            variant="outline"
            className="h-10 flex-1 px-3"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 flex-1 px-3"
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

// A single settings row: label (icon + text, with an optional description below)
// on the left, control on the right. Mirrors the store settings page's SettingRow.
//
// By default the control drops below the label on mobile (good for wide inputs).
// Pass `inline` for compact controls — a switch or the + button — which stay on
// the label's row at every breakpoint, aligned to the right.
//
// Rows with a description top-align their control by default; pass `center` to
// vertically center it against the taller label column instead (used for the
// + button and the field that replaces it).
function SettingRow({
  id,
  label,
  icon: Icon,
  description,
  inline,
  center,
  children,
}: {
  id?: string
  label: string
  icon: IconComponent
  description?: string
  inline?: boolean
  center?: boolean
  children: React.ReactNode
}) {
  const labelColumn = (
    <div className={inline ? 'min-w-0 flex-1' : 'sm:flex-1'}>
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
  )

  if (inline) {
    return (
      <div
        className={cn(
          'flex justify-between gap-4 py-4',
          center ? 'items-center' : 'items-start',
        )}
      >
        {labelColumn}
        <div className="shrink-0">{children}</div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-2 py-4 sm:flex-row sm:justify-between sm:gap-6',
        // Top-align when a description makes the label column taller; otherwise
        // center the control against the single-line label. `center` forces
        // centering even with a description.
        center || !description ? 'sm:items-center' : 'sm:items-start',
      )}
    >
      {labelColumn}
      <div className="w-full sm:w-72 sm:shrink-0">{children}</div>
    </div>
  )
}

// A toggle for an inline SettingRow; the row aligns it to its trailing edge.
function ToggleControl({
  label,
  checked,
  onCheckedChange,
}: {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <Switch
      aria-label={label}
      checked={checked}
      onCheckedChange={onCheckedChange}
    />
  )
}

// The primary Save button for a text field, shown on its own row beneath the
// field once its value diverges from what's saved. 40px tall with 12px of
// horizontal padding. Switches save on change, so they never use it.
function SaveRow({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-end pb-4">
      <Button type="button" size="lg" className="px-3" onClick={onClick}>
        Save
      </Button>
    </div>
  )
}

// Phone input with a country-code dropdown on the left (flag emoji + dial code)
// and the number field on the right. Mirrors the add-order page's PhoneInput.
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

export function AdminCheckoutsPage() {
  // `form` holds the working values; `saved` holds what's persisted. Text fields
  // diverge until their Save button commits them; switches commit immediately,
  // so they stay in sync.
  const [form, setForm] = React.useState<CheckoutForm>(INITIAL_FORM)
  const [saved, setSaved] = React.useState<CheckoutForm>(INITIAL_FORM)

  // The discount currently being edited in the dialog, or null when closed.
  const [discountDraft, setDiscountDraft] = React.useState<DiscountDraft | null>(
    null,
  )
  // The saved discount, once one has been added. While null, the suggested
  // discounts are shown; once set, it replaces them with an editable summary.
  const [addedDiscount, setAddedDiscount] = React.useState<DiscountDraft | null>(
    null,
  )
  // Whether the delete-discount confirmation dialog is open.
  const [confirmDeleteDiscount, setConfirmDeleteDiscount] =
    React.useState(false)

  // Text-field edit: update the working form only.
  function update<K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  // Switch change: persist immediately and run the save feedback.
  function updateAndSave<K extends keyof CheckoutForm>(
    key: K,
    value: CheckoutForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
    setSaved((current) => ({ ...current, [key]: value }))
    runSaveFeedback()
  }

  function saveInstructions() {
    setSaved((current) => ({ ...current, instructions: form.instructions }))
    runSaveFeedback()
  }

  // The country + number are treated as one field, committed together.
  function saveWhatsapp() {
    setSaved((current) => ({
      ...current,
      whatsappCountry: form.whatsappCountry,
      whatsappNumber: form.whatsappNumber,
    }))
    runSaveFeedback()
  }

  // Revealing an optional field isn't itself a saved change — mirror it into
  // saved so it doesn't count as dirty or emit a toast.
  function revealInstructions() {
    setForm((current) => ({ ...current, instructionsEnabled: true }))
    setSaved((current) => ({ ...current, instructionsEnabled: true }))
  }

  function revealWhatsapp() {
    setForm((current) => ({ ...current, whatsappEnabled: true }))
    setSaved((current) => ({ ...current, whatsappEnabled: true }))
  }

  const instructionsDirty = form.instructions !== saved.instructions
  const whatsappDirty =
    form.whatsappCountry !== saved.whatsappCountry ||
    form.whatsappNumber !== saved.whatsappNumber

  const isDirty = React.useMemo(
    () => JSON.stringify(form) !== JSON.stringify(saved),
    [form, saved],
  )

  // When dirty, navigating away is held in `pendingNav` until the user confirms
  // discarding via the alert dialog.
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

  return (
    <>
      <form onSubmit={(event) => event.preventDefault()} className="w-full">
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
            Checkouts
          </h1>
        </header>

        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8">
          {/* Two titled groups: "Preferences" holds the gift/instructions
              card and the order-form nav card (24px apart), and "Abandoned
              checkouts" holds the recovery card. */}
          <div className="space-y-3">
            <TypographyLarge>Preferences</TypographyLarge>
            <div className="flex flex-col gap-6">
              <Section>
            {/* Gift orders + its dependent Gift message toggle share one divider
                group, so no divider sits between them. */}
            <div>
              <SettingRow
                label="Gift orders"
                icon={Gift}
                description="Let customers order as a gift"
                inline
              >
                <ToggleControl
                  label="Gift orders"
                  checked={form.giftOrders}
                  onCheckedChange={(checked) =>
                    updateAndSave('giftOrders', checked)
                  }
                />
              </SettingRow>

              {form.giftOrders ? (
                <SettingRow
                  label="Gift message"
                  icon={MessageSquare}
                  description="Allow customers to write a message"
                  inline
                >
                  <ToggleControl
                    label="Gift message"
                    checked={form.giftMessage}
                    onCheckedChange={(checked) =>
                      updateAndSave('giftMessage', checked)
                    }
                  />
                </SettingRow>
              ) : null}
            </div>

            {/* Additional instructions: hidden behind a + button until revealed,
                then a text area that grows with its content. */}
            <div>
              <SettingRow
                id="additional-instructions"
                label="Additional instructions"
                icon={FileText}
                description="Share more info during checkout"
                inline={!form.instructionsEnabled}
                center
              >
                {form.instructionsEnabled ? (
                  <Textarea
                    id="additional-instructions"
                    value={form.instructions}
                    onChange={(event) =>
                      update('instructions', event.target.value)
                    }
                    placeholder="Location, hours, etc."
                    className="min-h-10"
                  />
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    aria-label="Add additional instructions"
                    className="text-muted-foreground"
                    onClick={revealInstructions}
                  >
                    <Plus className="size-4" />
                  </Button>
                )}
              </SettingRow>

              {form.instructionsEnabled && instructionsDirty ? (
                <SaveRow onClick={saveInstructions} />
              ) : null}
            </div>

            {/* WhatsApp ordering: hidden behind a + button until revealed, then a
                phone field with a country-code selector prefix. */}
            <div>
              <SettingRow
                id="whatsapp-number"
                label="WhatsApp ordering"
                icon={MessageCircle}
                description="Customers send order messages"
                inline={!form.whatsappEnabled}
                center
              >
                {form.whatsappEnabled ? (
                  <PhoneInput
                    id="whatsapp-number"
                    country={form.whatsappCountry}
                    onCountryChange={(code) => update('whatsappCountry', code)}
                    number={form.whatsappNumber}
                    onNumberChange={(value) => update('whatsappNumber', value)}
                    placeholder="Phone number"
                  />
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    aria-label="Add WhatsApp ordering"
                    className="text-muted-foreground"
                    onClick={revealWhatsapp}
                  >
                    <Plus className="size-4" />
                  </Button>
                )}
              </SettingRow>

              {form.whatsappEnabled && whatsappDirty ? (
                <SaveRow onClick={saveWhatsapp} />
              ) : null}
            </div>
          </Section>

              <NavCard
                label="Order form"
                icon={ClipboardList}
                description="Customize the questions in your order form"
                onClick={() => navigateTo(ORDER_FORM_PATH)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <TypographyLarge>Abandoned checkouts</TypographyLarge>
            <Section>
            {/* Recover abandoned checkouts + its dependent "Offer a discount"
                toggle share one divider group, so no divider sits between them.
                When on, the description swaps to a recovered-revenue stat. */}
            <div>
              <SettingRow
                label="Recover abandoned checkouts"
                icon={ShoppingCart}
                description={
                  form.recoverAbandoned
                    ? '$50 recovered in last 30 days'
                    : 'Send emails to customers who left items in their cart'
                }
                inline
              >
                <ToggleControl
                  label="Recover abandoned checkouts"
                  checked={form.recoverAbandoned}
                  onCheckedChange={(checked) =>
                    updateAndSave('recoverAbandoned', checked)
                  }
                />
              </SettingRow>

              {form.recoverAbandoned ? (
                <div className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 text-sm font-medium sm:gap-6">
                        <Tag className="size-4 shrink-0 text-muted-foreground" />
                        Offer a discount
                      </div>
                      <p className="mt-1.5 text-sm text-muted-foreground sm:pl-10">
                        {addedDiscount
                          ? formatDiscount(addedDiscount)
                          : 'Encourage them to checkout with a unique discount code'}
                      </p>
                    </div>
                    {addedDiscount ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-lg"
                            className="shrink-0 text-muted-foreground"
                            aria-label="Manage discount"
                          >
                            <MoreHorizontal className="size-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-40">
                          <DropdownMenuItem
                            onSelect={() => setDiscountDraft(addedDiscount)}
                          >
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setConfirmDeleteDiscount(true)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </div>

                  {!addedDiscount ? (
                    <div className="mt-3 sm:pl-10">
                      <Badge
                        variant="secondary"
                        className="border-transparent bg-green-400/10 text-green-900"
                      >
                        Suggested
                      </Badge>
                      <div className="mt-2 flex flex-col divide-y divide-border/50">
                        {SUGGESTED_DISCOUNTS.map((discount) => (
                          <DiscountRow
                            key={discount.title}
                            title={discount.title}
                            meta={discount.meta}
                            onClick={() => setDiscountDraft(discount.draft)}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
            </Section>
          </div>
        </div>
      </form>

      {discountDraft ? (
        <DiscountDialog
          initial={discountDraft}
          isEditing={addedDiscount !== null}
          onOpenChange={(open) => {
            if (!open) setDiscountDraft(null)
          }}
          onSave={(draft) => {
            setAddedDiscount(draft)
            setDiscountDraft(null)
            runSaveFeedback()
          }}
        />
      ) : null}

      <AlertDialog
        open={confirmDeleteDiscount}
        onOpenChange={setConfirmDeleteDiscount}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete discount?</AlertDialogTitle>
            <AlertDialogDescription>
              Customers who have received a discount code will still be able to
              use it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setAddedDiscount(null)
                setConfirmDeleteDiscount(false)
                runSaveFeedback()
              }}
            >
              Delete
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
