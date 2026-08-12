import * as React from 'react'
import {
  ArrowLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  Pencil,
  Plus,
  ShoppingCart,
  Ticket,
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
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
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
import { cn } from '@/lib/utils'

type IconComponent = React.ComponentType<{ className?: string }>

const ORDER_FORM_PATH = '/admin/apps/qr-code/checkouts/order-form'

// Client-side navigation matching the app's router (pushState + popstate).
function navigateTo(path: string) {
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

// Monotonic id source for the time ranges added while the hours dialog is open.
// A module-level counter keeps ids stable across dialog remounts.
let idCounter = 0
function nextId(prefix: string) {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

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
// Mirrors the time slots settings page.
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

function defaultBusinessHours(): DaySchedule[] {
  return DAYS.map((day) => ({
    day,
    enabled: true,
    ranges: [{ id: nextId('hours'), from: '9:00 AM', to: '6:00 PM' }],
  }))
}

// The default instructions double as the field's placeholder, so an emptied
// field still reads as the copy it replaces.
const DEFAULT_INSTRUCTIONS = 'Order will be prepared after payment confirmation.'

type QrCheckoutForm = {
  allowOrders: boolean
  businessHours: DaySchedule[]
  openTicketOrders: boolean
  instructionsEnabled: boolean
  instructions: string
}

// Baseline state that represents the currently-saved settings. The working
// `form` diverges from `saved` per-field until each edit is committed.
function initialForm(): QrCheckoutForm {
  return {
    allowOrders: true,
    businessHours: defaultBusinessHours(),
    openTicketOrders: false,
    instructionsEnabled: false,
    instructions: DEFAULT_INSTRUCTIONS,
  }
}

// The global <Toaster/> paints every toast with the success (green) palette, so
// the in-progress "Saving changes…" toast overrides those vars to the neutral
// popover palette; the follow-up "Changes saved" restores green explicitly
// (updating a toast by id keeps its prior inline style otherwise). Mirrors the
// online store checkouts page.
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
const SAVE_TOAST_ID = 'qr-checkouts-save'

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

// A card holding settings rows, stacked as divided rows. Mirrors the online
// store checkouts page.
function Section({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <Card className="gap-0 py-0 shadow-none">
        <div className="divide-y-0 divide-border/50 px-4 sm:divide-y sm:px-6">
          {children}
        </div>
      </Card>
    </section>
  )
}

// A tappable card that navigates to another page: icon + label with an optional
// description, and a trailing chevron. Mirrors the online store checkouts page.
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

// A single settings row: label (icon + text, with an optional description below)
// on the left, control on the right. Mirrors the online store checkouts page.
//
// Pass `inline` for compact controls — a switch or the + button — which stay on
// the label's row at every breakpoint. `center` vertically centers the control
// against a taller label column.
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
        center || !description ? 'sm:items-center' : 'sm:items-start',
      )}
    >
      {labelColumn}
      <div className="w-full sm:w-72 sm:shrink-0">{children}</div>
    </div>
  )
}

// The Cancel/Save pair for a text field, shown on its own row beneath the field
// once its value diverges from what's saved. Cancel discards the edit and takes
// the row back to how it looked before. Switches save on change, so they never
// use this.
function SaveRow({
  onCancel,
  onSave,
}: {
  onCancel: () => void
  onSave: () => void
}) {
  return (
    <div className="flex justify-end gap-2 pb-4">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="px-3"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button type="button" size="lg" className="px-3" onClick={onSave}>
        Save
      </Button>
    </div>
  )
}

// A one-line summary of a day's hours for the read-only card view.
function daySummary(entry: DaySchedule) {
  if (entry.ranges.length === 0) return 'Closed'
  return entry.ranges.map((range) => `${range.from} – ${range.to}`).join(', ')
}

// Editing the weekly business hours, opened from the pencil on the card.
// Mirrors the time slots page's hours dialog: scrolling body, sticky footer.
function HoursDialog({
  days,
  onOpenChange,
  onSave,
}: {
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
              { id: nextId('hours'), from: '9:00 AM', to: '6:00 PM' },
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
      <DialogContent className="sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">Business hours</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
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

export function AdminQrCheckoutsPage() {
  // `form` holds the working values; `saved` holds what's persisted. The
  // instructions field diverges until its Save button commits it; switches and
  // the hours dialog commit immediately, so they stay in sync.
  const [form, setForm] = React.useState<QrCheckoutForm>(initialForm)
  const [saved, setSaved] = React.useState<QrCheckoutForm>(form)
  const [hoursOpen, setHoursOpen] = React.useState(false)

  // Text-field edit: update the working form only.
  function update<K extends keyof QrCheckoutForm>(
    key: K,
    value: QrCheckoutForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  // Switch change (and the hours dialog): persist immediately with feedback.
  function updateAndSave<K extends keyof QrCheckoutForm>(
    key: K,
    value: QrCheckoutForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
    setSaved((current) => ({ ...current, [key]: value }))
    runSaveFeedback()
  }

  // Saving nothing is the same as never having added instructions, so a blank
  // field collapses back to the + button instead of staying open and empty.
  function saveInstructions() {
    const value = form.instructions.trim() === '' ? '' : form.instructions
    const stillVisible = value !== ''
    setForm((current) => ({
      ...current,
      instructions: value,
      instructionsEnabled: stillVisible,
    }))
    setSaved((current) => ({
      ...current,
      instructions: value,
      instructionsEnabled: stillVisible,
    }))
    runSaveFeedback()
  }

  // Revealing the optional field isn't itself a saved change — mirror it into
  // saved so it doesn't count as dirty or emit a toast.
  function revealInstructions() {
    setForm((current) => ({ ...current, instructionsEnabled: true }))
    setSaved((current) => ({ ...current, instructionsEnabled: true }))
  }

  // Discard the edit and restore the saved value. Nothing was saved there in
  // the first place when that value is empty, so the field collapses back to
  // the + button rather than sitting open and blank.
  function cancelInstructions() {
    const previous = saved.instructions
    const stillVisible = previous.trim() !== ''
    setForm((current) => ({
      ...current,
      instructions: previous,
      instructionsEnabled: stillVisible,
    }))
    setSaved((current) => ({ ...current, instructionsEnabled: stillVisible }))
  }

  const instructionsDirty = form.instructions !== saved.instructions

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
          {/* QR Code Ordering has no sidebar section of its own, so the back
              button stays at every breakpoint. */}
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label="Go back"
            onClick={() => window.history.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-normal text-neutral-900">
            Checkouts
          </h1>
        </header>

        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8">
          <Section>
            <SettingRow label="Allow orders" icon={ShoppingCart} inline>
              <Switch
                aria-label="Allow orders"
                checked={form.allowOrders}
                onCheckedChange={(checked) =>
                  updateAndSave('allowOrders', checked)
                }
              />
            </SettingRow>

            {/* Business hours are edited in a dialog; the card shows the saved
                week as a read-only summary. Mirrors the time slots page. */}
            <div className="space-y-2 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-sm font-medium sm:gap-6">
                  <Clock className="size-4 shrink-0 text-muted-foreground" />
                  Business hours
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  className="shrink-0 text-muted-foreground"
                  aria-label="Edit business hours"
                  onClick={() => setHoursOpen(true)}
                >
                  <Pencil className="size-4" />
                </Button>
              </div>
              <div className="space-y-1 text-right text-sm text-muted-foreground">
                {form.businessHours.map((entry) => (
                  <div key={entry.day}>
                    {entry.day.slice(0, 3)}: {daySummary(entry)}
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* "Preferences" groups the ordering options with the order-form nav
              card, 24px apart. Mirrors the online store checkouts page. */}
          <div className="space-y-3">
            <TypographyLarge>Preferences</TypographyLarge>
            <div className="flex flex-col gap-6">
              <Section>
            <SettingRow
              label="Open ticket orders"
              icon={Ticket}
              description="Customers can keep adding more items to the same order"
              inline
            >
              <Switch
                aria-label="Open ticket orders"
                checked={form.openTicketOrders}
                onCheckedChange={(checked) =>
                  updateAndSave('openTicketOrders', checked)
                }
              />
            </SettingRow>

            {/* Additional instructions: optional, so it's hidden behind a +
                button until revealed, then a text area that grows with its
                content. */}
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
                    placeholder={DEFAULT_INSTRUCTIONS}
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
                <SaveRow
                  onCancel={cancelInstructions}
                  onSave={saveInstructions}
                />
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
        </div>
      </form>

      {hoursOpen ? (
        <HoursDialog
          days={form.businessHours}
          onOpenChange={setHoursOpen}
          onSave={(businessHours) => {
            updateAndSave('businessHours', businessHours)
            setHoursOpen(false)
          }}
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
