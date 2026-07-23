import * as React from 'react'
import {
  ArrowLeft,
  Box,
  Calendar as CalendarIcon,
  CalendarCheck,
  CalendarClock,
  ChevronRight,
  Search,
  ShoppingBag,
  ShoppingCart,
  Truck,
  X,
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
import { FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { TypographyH4, TypographyLarge } from '@/components/ui/typography'

import productImage from '@/assets/product.png'

type IconComponent = React.ComponentType<{ className?: string }>

// Midnight today, used as the earliest selectable date across the calendar and
// the date fields (customers only pick current or future dates).
function startOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Render a 24h "HH:MM" value (from the native time input) as a 12h label.
function formatTime(value: string) {
  if (!value) return ''
  const [hours, minutes] = value.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour = hours % 12 === 0 ? 12 : hours % 12
  return `${hour}:${String(minutes).padStart(2, '0')} ${period}`
}

// Keep only digits (used by the whole-number "advance days" input).
function sanitizeDigits(value: string) {
  return value.replace(/[^0-9]/g, '')
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// Every selectable day (>= minDate) in the month `month` falls within.
function selectableDatesInMonth(month: Date, minDate: Date) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const lastDay = new Date(year, monthIndex + 1, 0).getDate()
  const dates: Date[] = []
  for (let day = 1; day <= lastDay; day += 1) {
    const date = new Date(year, monthIndex, day)
    date.setHours(0, 0, 0, 0)
    if (date >= minDate) dates.push(date)
  }
  return dates
}

// Twenty products (drawn from the Order summary page), each with a starting
// stock, sorted alphabetically for the availability Products tab.
const PRODUCTS: { name: string; stock: number }[] = [
  { name: 'Americano, Hot', stock: 24 },
  { name: 'Americano, Iced', stock: 18 },
  { name: 'BBQ Baby Back Ribs', stock: 12 },
  { name: 'Caesar Salad', stock: 30 },
  { name: 'Cappuccino', stock: 20 },
  { name: 'Chai Latte', stock: 16 },
  { name: 'Cheeseburger, Double', stock: 15 },
  { name: 'Cheeseburger, Single', stock: 19 },
  { name: 'Croissant', stock: 40 },
  { name: 'Espresso', stock: 28 },
  { name: 'Flat White', stock: 21 },
  { name: 'Green Tea', stock: 25 },
  { name: 'Iced Coffee', stock: 22 },
  { name: 'Latte, Full Cream', stock: 17 },
  { name: 'Latte, Oat Milk', stock: 14 },
  { name: 'Margherita Pizza', stock: 10 },
  { name: 'Mocha', stock: 23 },
  { name: 'Pad Thai', stock: 13 },
  { name: 'Ramen, Shoyu', stock: 11 },
  { name: 'Ramen, Tonkotsu', stock: 9 },
].sort((a, b) => a.name.localeCompare(b.name))

function defaultQuantities(): Record<string, string> {
  // Most products start empty; only every fifth one carries a saved stock
  // count, so the majority of inputs read as blank.
  return Object.fromEntries(
    PRODUCTS.map((p, i) => [p.name, i % 5 === 0 ? String(p.stock) : '']),
  )
}

function emptyQuantities(): Record<string, string> {
  return Object.fromEntries(PRODUCTS.map((p) => [p.name, '']))
}

// Fulfillment types (from the All orders page, minus In-store), each with a
// starting stock. Delivery zones use the truck icon, pickup methods the bag.
const FULFILLMENT_TYPES: { name: string; icon: IconComponent; stock: number }[] =
  [
    { name: 'Delivery Zone 1 (0-3km)', icon: Truck, stock: 20 },
    { name: 'Delivery Zone 2 (3-5Km)', icon: Truck, stock: 15 },
    { name: 'Delivery Zone 3 (5+ KM)', icon: Truck, stock: 10 },
    { name: 'Pickup method 1', icon: ShoppingBag, stock: 25 },
    { name: 'Pickup method 2', icon: ShoppingBag, stock: 12 },
  ]

function defaultFulfillment(): Record<string, string> {
  // Most start empty; every third one carries a saved stock count.
  return Object.fromEntries(
    FULFILLMENT_TYPES.map((f, i) => [f.name, i % 3 === 0 ? String(f.stock) : '']),
  )
}

function emptyFulfillment(): Record<string, string> {
  return Object.fromEntries(FULFILLMENT_TYPES.map((f) => [f.name, '']))
}

// ---------------------------------------------------------------------------
// Shared row: switch + chevron that opens a dialog
// ---------------------------------------------------------------------------

// A settings row with an enable switch and a chevron. When off, only the switch
// is interactive (the chevron is dimmed); toggling it enables the feature. When
// on, clicking anywhere on the row opens the dialog, while the switch (which
// sits above the click overlay) still toggles the feature off. Mirrors the
// Payments page's Charges row.
function SwitchNavRow({
  label,
  icon: Icon,
  description,
  checked,
  onCheckedChange,
  onOpen,
}: {
  label: string
  icon: IconComponent
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  onOpen: () => void
}) {
  return (
    <div className="relative py-4">
      {checked ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Open ${label}`}
          className="absolute inset-y-0 -left-4 -right-4 rounded-lg transition-colors hover:bg-muted/50 sm:-left-6 sm:-right-6"
        />
      ) : null}
      <div className="pointer-events-none relative flex items-center justify-between gap-4">
        <span className="flex items-center gap-3 text-sm font-medium sm:gap-6">
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          {label}
        </span>
        <div className="flex shrink-0 items-center gap-3">
          <span className="pointer-events-auto">
            <Switch
              aria-label={label}
              checked={checked}
              onCheckedChange={onCheckedChange}
              className="translate-y-[2px]"
            />
          </span>
          <ChevronRight
            className={
              checked
                ? 'size-4 text-muted-foreground'
                : 'size-4 text-muted-foreground/40'
            }
          />
        </div>
      </div>
      {description ? (
        <p className="pointer-events-none relative mt-1.5 text-sm text-muted-foreground sm:pl-10">
          {description}
        </p>
      ) : null}
    </div>
  )
}

// A single-date picker: a trigger button showing the value, opening a calendar
// popover. `minDate` blocks (and hides earlier months than) that date.
function DateField({
  value,
  onChange,
  minDate,
}: {
  value: Date
  onChange: (date: Date) => void
  minDate?: Date
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full justify-start px-3 font-normal"
        >
          <CalendarIcon className="size-4 text-muted-foreground" />
          {formatDate(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            if (date) {
              onChange(date)
              setOpen(false)
            }
          }}
          disabled={minDate ? { before: minDate } : undefined}
          startMonth={minDate}
        />
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Available dates
// ---------------------------------------------------------------------------

type AvailableSettings = {
  enabled: boolean
  // Whether the dialog has been saved at least once. Until then the row shows
  // the default 6-month blurb rather than the entered values.
  configured: boolean
  startDate: Date
  endEnabled: boolean
  endDate: Date
}

function defaultAvailable(): AvailableSettings {
  const today = startOfToday()
  return {
    enabled: false,
    configured: false,
    startDate: today,
    endEnabled: false,
    endDate: today,
  }
}

// Row description: the default blurb when off, the saved dates when on.
function availableSummary(settings: AvailableSettings) {
  if (settings.enabled && settings.configured) {
    return settings.endEnabled
      ? `${formatDate(settings.startDate)} – ${formatDate(settings.endDate)}`
      : `From ${formatDate(settings.startDate)}`
  }
  return 'Customers see 6 months of dates starting from current date'
}

function AvailableDatesDialog({
  settings,
  onOpenChange,
  onSave,
}: {
  settings: AvailableSettings
  onOpenChange: (open: boolean) => void
  onSave: (settings: AvailableSettings) => void
}) {
  const [draft, setDraft] = React.useState<AvailableSettings>(settings)

  function update<K extends keyof AvailableSettings>(
    key: K,
    value: AvailableSettings[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const today = React.useMemo(() => startOfToday(), [])
  // The end date can't fall before the start date.
  const canSave = !draft.endEnabled || draft.endDate >= draft.startDate

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">Available dates</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Start date</Label>
            <DateField
              value={draft.startDate}
              onChange={(date) => {
                update('startDate', date)
                // Keep the end date at or after the new start date.
                if (draft.endEnabled && draft.endDate < date) {
                  update('endDate', date)
                }
              }}
              minDate={today}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <Label htmlFor="available-end-date" className="text-sm font-medium">
                End date
              </Label>
              <Switch
                id="available-end-date"
                checked={draft.endEnabled}
                onCheckedChange={(checked) => update('endEnabled', checked)}
              />
            </div>
            {draft.endEnabled ? (
              <DateField
                value={draft.endDate}
                onChange={(date) => update('endDate', date)}
                minDate={draft.startDate}
              />
            ) : null}
          </div>
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

// ---------------------------------------------------------------------------
// Cutoff date & time
// ---------------------------------------------------------------------------

type CutoffSettings = {
  enabled: boolean
  configured: boolean
  minAdvanceDays: string
  cutoffTimeEnabled: boolean
  cutoffTime: string
  applyTo: 'delivery' | 'delivery-pickup'
}

function defaultCutoff(): CutoffSettings {
  return {
    enabled: false,
    configured: false,
    minAdvanceDays: '1',
    cutoffTimeEnabled: false,
    cutoffTime: '12:00',
    applyTo: 'delivery',
  }
}

function cutoffSummary(settings: CutoffSettings) {
  if (!settings.enabled || !settings.configured) {
    return 'Set how far in advance customers must order'
  }
  const days = Number(settings.minAdvanceDays) || 0
  const parts = [`${days} day${days === 1 ? '' : 's'} in advance`]
  if (settings.cutoffTimeEnabled) {
    parts.push(`By ${formatTime(settings.cutoffTime)}`)
  }
  return parts.join(' · ')
}

function CutoffDialog({
  settings,
  onOpenChange,
  onSave,
}: {
  settings: CutoffSettings
  onOpenChange: (open: boolean) => void
  onSave: (settings: CutoffSettings) => void
}) {
  const [draft, setDraft] = React.useState<CutoffSettings>(settings)

  function update<K extends keyof CutoffSettings>(
    key: K,
    value: CutoffSettings[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const canSave = draft.minAdvanceDays.trim() !== ''

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">
              Cutoff date &amp; time
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="min-advance-days" className="text-sm font-medium">
              Minimum advance days
            </Label>
            <InputGroup className="h-10">
              <InputGroupInput
                id="min-advance-days"
                inputMode="numeric"
                value={draft.minAdvanceDays}
                onChange={(event) =>
                  update('minAdvanceDays', sanitizeDigits(event.target.value))
                }
                placeholder="0"
                className="pl-3"
              />
              <InputGroupAddon align="inline-end" className="pr-3">
                days
              </InputGroupAddon>
            </InputGroup>
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <Label htmlFor="cutoff-time" className="text-sm font-medium">
                Cutoff time
              </Label>
              <Switch
                id="cutoff-time"
                checked={draft.cutoffTimeEnabled}
                onCheckedChange={(checked) =>
                  update('cutoffTimeEnabled', checked)
                }
              />
            </div>
            {draft.cutoffTimeEnabled ? (
              <Input
                type="time"
                aria-label="Cutoff time"
                value={draft.cutoffTime}
                onChange={(event) => update('cutoffTime', event.target.value)}
                className="h-10"
              />
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Apply to</Label>
            <RadioGroup
              aria-label="Apply to"
              value={draft.applyTo}
              onValueChange={(value) =>
                update('applyTo', value as CutoffSettings['applyTo'])
              }
              className="grid w-full grid-cols-2 gap-0 divide-x overflow-hidden rounded-lg border"
            >
              <FieldLabel
                htmlFor="apply-delivery"
                className="flex w-full items-center justify-between gap-1 rounded-none px-3 py-3 text-sm font-normal transition-colors hover:bg-muted/50 has-[[data-checked]]:bg-primary/5"
              >
                Delivery only
                <RadioGroupItem value="delivery" id="apply-delivery" />
              </FieldLabel>
              <FieldLabel
                htmlFor="apply-delivery-pickup"
                className="flex w-full items-center justify-between gap-1 rounded-none px-3 py-3 text-sm font-normal transition-colors hover:bg-muted/50 has-[[data-checked]]:bg-primary/5"
              >
                Delivery and Pickup
                <RadioGroupItem
                  value="delivery-pickup"
                  id="apply-delivery-pickup"
                />
              </FieldLabel>
            </RadioGroup>
          </div>
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function AdminCalendarPage() {
  const today = React.useMemo(() => startOfToday(), [])

  // Dates the merchant has hand-picked on the left calendar (across months).
  const [selectedDates, setSelectedDates] = React.useState<Date[]>([])
  // The month currently shown in the calendar, driving the "Select month" box.
  const [displayMonth, setDisplayMonth] = React.useState(today)
  // Dates closed for orders — shown struck through in red on the calendar.
  const [closedDates, setClosedDates] = React.useState<Date[]>([])

  // A sparse, deterministic set of upcoming dates that have saved inventory
  // values. Only some dates carry values, so most show no dot.
  const datesWithValues = React.useMemo(() => {
    const dates: Date[] = []
    for (let offset = 0; offset < 120; offset += 1) {
      if (offset % 9 !== 3) continue
      const date = new Date(today)
      date.setDate(date.getDate() + offset)
      date.setHours(0, 0, 0, 0)
      dates.push(date)
    }
    return dates
  }, [today])
  // The gray dot only shows on open (not closed) dates that have a saved value.
  const valueDots = React.useMemo(
    () =>
      datesWithValues.filter(
        (date) => !closedDates.some((closed) => isSameDay(closed, date)),
      ),
    [datesWithValues, closedDates],
  )

  // Selectable days in the visible month, and whether they're all selected.
  const monthDates = React.useMemo(
    () => selectableDatesInMonth(displayMonth, today),
    [displayMonth, today],
  )
  const monthSelected =
    monthDates.length > 0 &&
    monthDates.every((date) =>
      selectedDates.some((selected) => isSameDay(selected, date)),
    )

  // Add every selectable day in the visible month, or clear them all.
  function toggleMonth(checked: boolean) {
    if (checked) {
      setSelectedDates((current) => [
        ...current,
        ...monthDates.filter(
          (date) => !current.some((selected) => isSameDay(selected, date)),
        ),
      ])
    } else {
      setSelectedDates((current) =>
        current.filter(
          (selected) => !monthDates.some((date) => isSameDay(date, selected)),
        ),
      )
    }
  }

  // When dates are picked, the availability card is replaced by a card scoped to
  // the selection. Its title names the earliest date (plus a count of the rest).
  const sortedSelection = React.useMemo(
    () => [...selectedDates].sort((a, b) => a.getTime() - b.getTime()),
    [selectedDates],
  )
  const hasSelection = sortedSelection.length > 0
  const selectionTitle = hasSelection
    ? sortedSelection.length === 1
      ? formatDate(sortedSelection[0])
      : `${formatDate(sortedSelection[0])} + ${sortedSelection.length - 1} more`
    : ''
  // Availability radio: 'open' when every selected date is open, 'closed' when
  // every one is closed, and '' (no selection) when the selection is mixed.
  const selectedClosedCount = sortedSelection.filter((date) =>
    closedDates.some((closed) => isSameDay(closed, date)),
  ).length
  const availabilityValue =
    !hasSelection || selectedClosedCount === 0
      ? 'open'
      : selectedClosedCount === sortedSelection.length
        ? 'closed'
        : ''

  // Toggling off closes every selected date; toggling on reopens them.
  function toggleOpenForOrders(checked: boolean) {
    if (checked) {
      setClosedDates((current) =>
        current.filter(
          (closed) => !selectedDates.some((date) => isSameDay(date, closed)),
        ),
      )
    } else {
      setClosedDates((current) => [
        ...current,
        ...selectedDates.filter(
          (date) => !current.some((closed) => isSameDay(closed, date)),
        ),
      ])
    }
    toast.success('Changes saved')
  }

  // Per-product "left" quantities. `quantities` holds the working value; a field
  // diverges from `savedQuantities` until its Save button commits it. The
  // "held" count only shows for a single selected date.
  const [quantities, setQuantities] =
    React.useState<Record<string, string>>(defaultQuantities)
  const [savedQuantities, setSavedQuantities] =
    React.useState<Record<string, string>>(defaultQuantities)
  const quantitySuffix = sortedSelection.length > 1 ? 'left' : 'left • 0 held'

  // Per-fulfillment-type "left" quantities, mirroring the product fields.
  const [fulfillment, setFulfillment] =
    React.useState<Record<string, string>>(defaultFulfillment)
  const [savedFulfillment, setSavedFulfillment] =
    React.useState<Record<string, string>>(defaultFulfillment)

  // A date only has product values when it carries a dot (open + has a saved
  // value). If any selected date lacks a dot, all fields read as empty. When the
  // selection changes, reset the fields to match (adjusting state during render,
  // per React's "you might not need an effect" guidance).
  const selectionKey = sortedSelection.map((date) => date.getTime()).join(',')
  const selectionHasValue =
    hasSelection &&
    sortedSelection.every((date) =>
      valueDots.some((dotted) => isSameDay(dotted, date)),
    )
  const resetKey = `${selectionKey}:${selectionHasValue}`
  const [prevResetKey, setPrevResetKey] = React.useState(resetKey)
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey)
    const nextProducts = selectionHasValue
      ? defaultQuantities()
      : emptyQuantities()
    setQuantities(nextProducts)
    setSavedQuantities(nextProducts)
    const nextFulfillment = selectionHasValue
      ? defaultFulfillment()
      : emptyFulfillment()
    setFulfillment(nextFulfillment)
    setSavedFulfillment(nextFulfillment)
  }

  function saveQuantity(name: string) {
    setSavedQuantities((current) => ({ ...current, [name]: quantities[name] }))
    toast.success('Changes saved')
  }

  function saveFulfillment(name: string) {
    setSavedFulfillment((current) => ({ ...current, [name]: fulfillment[name] }))
    toast.success('Changes saved')
  }

  // Product/fulfillment fields stay dirty until their Save button commits them;
  // everything else saves immediately, so those are the only unsaved changes.
  const isDirty = React.useMemo(
    () =>
      JSON.stringify(quantities) !== JSON.stringify(savedQuantities) ||
      JSON.stringify(fulfillment) !== JSON.stringify(savedFulfillment),
    [quantities, savedQuantities, fulfillment, savedFulfillment],
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

  // Filters the Products tab as the merchant types.
  const [productSearch, setProductSearch] = React.useState('')
  const filteredProducts = React.useMemo(() => {
    const query = productSearch.trim().toLowerCase()
    if (!query) return PRODUCTS
    return PRODUCTS.filter((product) =>
      product.name.toLowerCase().includes(query),
    )
  }, [productSearch])

  const [available, setAvailable] =
    React.useState<AvailableSettings>(defaultAvailable)
  const [availableOpen, setAvailableOpen] = React.useState(false)

  const [cutoff, setCutoff] = React.useState<CutoffSettings>(defaultCutoff)
  const [cutoffOpen, setCutoffOpen] = React.useState(false)

  // Enabling a feature that hasn't been configured opens its dialog first; the
  // switch turns on only once the dialog is saved. Disabling flips immediately.
  function toggleAvailable(checked: boolean) {
    if (checked && !available.configured) {
      setAvailableOpen(true)
      return
    }
    setAvailable((current) => ({ ...current, enabled: checked }))
    toast.success('Changes saved')
  }

  function saveAvailable(settings: AvailableSettings) {
    setAvailable({ ...settings, enabled: true, configured: true })
    setAvailableOpen(false)
    toast.success('Changes saved')
  }

  function toggleCutoff(checked: boolean) {
    if (checked && !cutoff.configured) {
      setCutoffOpen(true)
      return
    }
    setCutoff((current) => ({ ...current, enabled: checked }))
    toast.success('Changes saved')
  }

  function saveCutoff(settings: CutoffSettings) {
    setCutoff({ ...settings, enabled: true, configured: true })
    setCutoffOpen(false)
    toast.success('Changes saved')
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
            Calendar
          </h1>
        </header>

        <div className="mx-auto flex w-full max-w-[1086px] flex-col justify-center gap-8 xl:flex-row xl:items-start xl:justify-between">
          {/* Left column: a month-by-month calendar for hand-picking one or more
              available dates. 350px on desktop, full-width when stacked below xl. */}
          <div className="flex w-full flex-col gap-3 xl:sticky xl:top-8 xl:w-[350px] xl:shrink-0 xl:self-start">
            <TypographyLarge>Select dates</TypographyLarge>
            <Card className="items-center gap-4 py-4 shadow-none">
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => setSelectedDates(dates ?? [])}
                month={displayMonth}
                onMonthChange={setDisplayMonth}
                disabled={{ before: today }}
                startMonth={today}
                classNames={{ today: '' }}
                modifiers={{ closed: closedDates, hasValue: valueDots }}
                modifiersClassNames={{
                  // Closed dates read as red + struck through. Only the text is
                  // overridden, so a closed date that's also selected keeps the
                  // primary (amber) selection background.
                  closed:
                    '[&>button]:!text-destructive [&>button]:line-through',
                  // A small gray dot below the number marks a saved value.
                  hasValue:
                    '[&>button]:relative [&>button]:after:absolute [&>button]:after:bottom-1 [&>button]:after:left-1/2 [&>button]:after:size-1 [&>button]:after:-translate-x-1/2 [&>button]:after:rounded-full [&>button]:after:bg-muted-foreground [&>button]:after:content-[""]',
                }}
              />
              <div className="flex w-full items-center justify-center gap-1 px-2">
                {/* "Select month" fills the visible month and hides once the
                    whole month is selected. "Unselect all" clears every date. */}
                {!monthSelected ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => toggleMonth(true)}
                  >
                    Select month
                  </Button>
                ) : null}
                {selectedDates.length > 0 ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedDates([])}
                  >
                    Unselect all
                  </Button>
                ) : null}
              </div>
            </Card>
          </div>

          {/* Right column: the availability card, or — once dates are picked —
              a card scoped to the current selection. */}
          <div className="flex w-full flex-col gap-3 xl:max-w-[640px] xl:flex-1">
            {hasSelection ? (
              <>
                <TypographyLarge>{selectionTitle}</TypographyLarge>
                {/* 24px between the availability card and the details card. */}
                <div className="flex flex-col gap-6">
                  <Card className="gap-0 py-0 shadow-none">
                    <div className="px-4 sm:px-6">
                      <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                        <span className="flex items-center gap-3 text-sm font-medium sm:gap-6">
                          <ShoppingCart className="size-4 shrink-0 text-muted-foreground" />
                          Availability for orders
                        </span>
                        <RadioGroup
                          aria-label="Availability"
                          value={availabilityValue}
                          onValueChange={(value) =>
                            toggleOpenForOrders(value === 'open')
                          }
                          className="grid w-full grid-cols-2 gap-0 divide-x overflow-hidden rounded-lg border sm:w-72"
                        >
                          <FieldLabel
                            htmlFor="availability-open"
                            className="flex w-full items-center justify-between gap-1 rounded-none px-3 py-3 text-sm font-normal transition-colors hover:bg-muted/50 has-[[data-checked]]:bg-primary/5"
                          >
                            Open
                            <RadioGroupItem value="open" id="availability-open" />
                          </FieldLabel>
                          <FieldLabel
                            htmlFor="availability-closed"
                            className="flex w-full items-center justify-between gap-1 rounded-none px-3 py-3 text-sm font-normal transition-colors hover:bg-muted/50 has-[[data-checked]]:bg-primary/5"
                          >
                            Closed
                            <RadioGroupItem
                              value="closed"
                              id="availability-closed"
                            />
                          </FieldLabel>
                        </RadioGroup>
                      </div>
                    </div>
                  </Card>
  
                  {/* Open (or mixed) selections expose per-product inventory and
                      fulfillment settings in a separate card. */}
                  {availabilityValue !== 'closed' ? (
                    <Card className="gap-0 py-0 shadow-none">
                      <div className="px-4 pb-4 sm:px-6">
                        <Tabs defaultValue="products" className="gap-0">
                          {/* Sticky tab bar (top-0); the search below sticks
                              directly beneath it. Stays within the card padding
                              so the card's rounded border isn't covered. */}
                          <div className="sticky top-0 z-20 bg-card pt-4">
                            <TabsList className="w-full">
                              <TabsTrigger value="products">Products</TabsTrigger>
                              <TabsTrigger value="fulfillment">
                                Fulfillment
                              </TabsTrigger>
                            </TabsList>
                          </div>
                          <TabsContent value="products">
                            {/* Sticky search bar, pinned just below the tab bar.
                                top-14 = tab bar height (pt-4 + h-10); its own
                                pt-4 restores the gap to the tabs when stuck. */}
                            <div className="sticky top-14 z-10 bg-card pb-4 pt-4">
                              <InputGroup className="h-10">
                                <InputGroupAddon>
                                  <Search className="size-4" />
                                </InputGroupAddon>
                                <InputGroupInput
                                  placeholder="Search products"
                                  value={productSearch}
                                  onChange={(event) =>
                                    setProductSearch(event.target.value)
                                  }
                                />
                                {productSearch ? (
                                  <InputGroupAddon
                                    align="inline-end"
                                    className="pr-1"
                                  >
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      aria-label="Clear search"
                                      onClick={() => setProductSearch('')}
                                    >
                                      <X className="size-4 text-muted-foreground" />
                                    </Button>
                                  </InputGroupAddon>
                                ) : null}
                              </InputGroup>
                            </div>
                            <div className="space-y-1 pb-4 pt-4">
                              <TypographyLarge>Inventory</TypographyLarge>
                              <p className="text-sm text-muted-foreground">
                                Leave blank for no limit
                              </p>
                            </div>
                            {filteredProducts.length === 0 ? (
                              <p className="py-4 text-sm text-muted-foreground">
                                No products found.
                              </p>
                            ) : (
                              <div className="divide-y-0 sm:divide-y sm:divide-border/50">
                                {filteredProducts.map((product) => {
                                  const dirty =
                                    quantities[product.name] !==
                                    savedQuantities[product.name]
                                  return (
                                    <div
                                      key={product.name}
                                      className="py-4 first:pt-0"
                                    >
                                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                        <span className="flex min-w-0 flex-1 items-center gap-3 text-sm font-medium">
                                          <Box className="size-4 shrink-0 text-muted-foreground sm:hidden" />
                                          <img
                                            src={productImage}
                                            alt=""
                                            className="hidden size-10 shrink-0 rounded-md object-cover sm:block"
                                          />
                                          <span className="min-w-0 truncate">
                                            {product.name}
                                          </span>
                                        </span>
                                        <div className="w-full sm:w-72 sm:shrink-0">
                                          <InputGroup className="h-10">
                                            <InputGroupInput
                                              inputMode="numeric"
                                              aria-label={`${product.name} quantity`}
                                              value={quantities[product.name]}
                                              onChange={(event) =>
                                                setQuantities((current) => ({
                                                  ...current,
                                                  [product.name]: sanitizeDigits(
                                                    event.target.value,
                                                  ),
                                                }))
                                              }
                                              className="pl-3"
                                            />
                                            <InputGroupAddon
                                              align="inline-end"
                                              className="pr-3 text-muted-foreground"
                                            >
                                              {quantitySuffix}
                                            </InputGroupAddon>
                                          </InputGroup>
                                        </div>
                                      </div>
                                      {dirty ? (
                                        <div className="mt-2 flex justify-end">
                                          <Button
                                            type="button"
                                            className="h-10 px-3"
                                            onClick={() =>
                                              saveQuantity(product.name)
                                            }
                                          >
                                            Save
                                          </Button>
                                        </div>
                                      ) : null}
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </TabsContent>
                          <TabsContent value="fulfillment">
                            <div className="space-y-1 pb-4 pt-8">
                              <TypographyLarge>
                                Limit fulfillment slots
                              </TypographyLarge>
                              <p className="text-sm text-muted-foreground">
                                Leave blank for no limit
                              </p>
                            </div>
                            <div className="divide-y-0 sm:divide-y sm:divide-border/50">
                              {FULFILLMENT_TYPES.map((type) => {
                                const dirty =
                                  fulfillment[type.name] !==
                                  savedFulfillment[type.name]
                                const Icon = type.icon
                                return (
                                  <div
                                    key={type.name}
                                    className="py-4 first:pt-0"
                                  >
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                      <span className="flex min-w-0 flex-1 items-center gap-3 text-sm font-medium">
                                        <Icon className="size-4 shrink-0 text-muted-foreground" />
                                        <span className="min-w-0 truncate">
                                          {type.name}
                                        </span>
                                      </span>
                                      <div className="w-full sm:w-72 sm:shrink-0">
                                        <InputGroup className="h-10">
                                          <InputGroupInput
                                            inputMode="numeric"
                                            aria-label={`${type.name} quantity`}
                                            value={fulfillment[type.name]}
                                            onChange={(event) =>
                                              setFulfillment((current) => ({
                                                ...current,
                                                [type.name]: sanitizeDigits(
                                                  event.target.value,
                                                ),
                                              }))
                                            }
                                            className="pl-3"
                                          />
                                          <InputGroupAddon
                                            align="inline-end"
                                            className="pr-3 text-muted-foreground"
                                          >
                                            left
                                          </InputGroupAddon>
                                        </InputGroup>
                                      </div>
                                    </div>
                                    {dirty ? (
                                      <div className="mt-2 flex justify-end">
                                        <Button
                                          type="button"
                                          className="h-10 px-3"
                                          onClick={() =>
                                            saveFulfillment(type.name)
                                          }
                                        >
                                          Save
                                        </Button>
                                      </div>
                                    ) : null}
                                  </div>
                                )
                              })}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </Card>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <TypographyLarge>Availability</TypographyLarge>
                <Card className="gap-0 py-0 shadow-none">
                  <div className="divide-y-0 divide-border/50 px-4 sm:divide-y sm:px-6">
                    <SwitchNavRow
                      label="Available dates"
                      icon={CalendarCheck}
                      description={availableSummary(available)}
                      checked={available.enabled}
                      onCheckedChange={toggleAvailable}
                      onOpen={() => setAvailableOpen(true)}
                    />
                    <SwitchNavRow
                      label="Cutoff date & time"
                      icon={CalendarClock}
                      description={cutoffSummary(cutoff)}
                      checked={cutoff.enabled}
                      onCheckedChange={toggleCutoff}
                      onOpen={() => setCutoffOpen(true)}
                    />
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      {availableOpen ? (
        <AvailableDatesDialog
          settings={available}
          onOpenChange={(open) => {
            if (!open) setAvailableOpen(false)
          }}
          onSave={saveAvailable}
        />
      ) : null}

      {cutoffOpen ? (
        <CutoffDialog
          settings={cutoff}
          onOpenChange={(open) => {
            if (!open) setCutoffOpen(false)
          }}
          onSave={saveCutoff}
        />
      ) : null}

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
