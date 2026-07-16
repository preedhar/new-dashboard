import * as React from 'react'
import {
  Bell,
  Clock,
  Coins,
  Eye,
  Globe,
  MapPin,
  Phone,
  Plus,
  Store,
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TypographyLarge } from '@/components/ui/typography'
import { cn } from '@/lib/utils'

type IconComponent = React.ComponentType<{ className?: string }>

// A common set of timezones, matching the reference dropdown's style.
const TIMEZONES = [
  'Pacific/Honolulu',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
] as const

const CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'SGD',
  'INR',
  'AUD',
  'CAD',
  'JPY',
  'MYR',
  'PHP',
] as const

type StoreForm = {
  storeName: string
  addressEnabled: boolean
  addressStreet: string
  addressUnit: string
  displayAddress: boolean
  timezone: string
  currency: string
  twentyFourHour: boolean
  contactInfo: string
  browserNotifications: boolean
}

// Baseline state that represents the store's currently-saved settings. The
// working `form` diverges from `saved` per-field until each edit is committed.
const INITIAL_FORM: StoreForm = {
  storeName: '[DEMO] Coffee Brewers',
  addressEnabled: false,
  addressStreet: '',
  addressUnit: '',
  displayAddress: false,
  timezone: 'Asia/Kolkata',
  currency: 'USD',
  twentyFourHour: true,
  contactInfo: 'coffeebrewers@gmail.com',
  browserNotifications: false,
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
const SAVE_TOAST_ID = 'store2-save'

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
// fields stack as divided rows inside it. Mirrors the add-order page.
function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
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
    </section>
  )
}

// A single settings row: label (icon + text, with an optional description below)
// on the left, control on the right. Mirrors the add-order page's FormRow,
// extended with a description.
//
// By default the control drops below the label on mobile (good for wide inputs
// and selects). Pass `inline` for compact controls — a switch or the + button —
// which stay on the label's row at every breakpoint, aligned to the right.
function SettingRow({
  id,
  label,
  icon: Icon,
  description,
  inline,
  children,
}: {
  id?: string
  label: string
  icon: IconComponent
  description?: string
  inline?: boolean
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
      <div className="flex items-start justify-between gap-4 py-4">
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
        // center the control against the single-line label.
        description ? 'sm:items-start' : 'sm:items-center',
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
// field once its value diverges from what's saved. Keeping it out of the field's
// control column lets the label stay vertically centered against its input.
// Selects and switches save on change, so they never use it.
function SaveRow({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-end pb-4">
      <Button type="button" size="lg" onClick={onClick}>
        Save
      </Button>
    </div>
  )
}

export function AdminSettingsStorePage() {
  // `form` holds the working values; `saved` holds what's persisted. Text fields
  // diverge until their Save button commits them; selects and switches commit
  // immediately, so they stay in sync.
  const [form, setForm] = React.useState<StoreForm>(INITIAL_FORM)
  const [saved, setSaved] = React.useState<StoreForm>(INITIAL_FORM)

  // Text-field edit: update the working form only.
  function update<K extends keyof StoreForm>(key: K, value: StoreForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  // Select/switch change: persist immediately and run the save feedback.
  function updateAndSave<K extends keyof StoreForm>(key: K, value: StoreForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setSaved((current) => ({ ...current, [key]: value }))
    runSaveFeedback()
  }

  // Commit a text field from the working form into saved state, then run the
  // save feedback.
  function saveStoreName() {
    setSaved((current) => ({ ...current, storeName: form.storeName }))
    runSaveFeedback()
  }

  // The two address inputs are treated as one field, committed together.
  function saveAddress() {
    setSaved((current) => ({
      ...current,
      addressStreet: form.addressStreet,
      addressUnit: form.addressUnit,
    }))
    runSaveFeedback()
  }

  function saveContact() {
    setSaved((current) => ({ ...current, contactInfo: form.contactInfo }))
    runSaveFeedback()
  }

  // Revealing the address inputs isn't itself a saved change — mirror it into
  // saved so it doesn't count as dirty or emit a toast.
  function revealAddress() {
    setForm((current) => ({ ...current, addressEnabled: true }))
    setSaved((current) => ({ ...current, addressEnabled: true }))
  }

  const storeNameDirty = form.storeName !== saved.storeName
  const addressDirty =
    form.addressStreet !== saved.addressStreet ||
    form.addressUnit !== saved.addressUnit
  const contactDirty = form.contactInfo !== saved.contactInfo

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
        {/* The store page is the Settings section hub: on mobile it's the
            Settings tab's destination (with the section sub-menu above it) and
            on desktop the sidebar covers navigation, so there's no back button. */}
        <header className="mb-8 flex items-center justify-center">
          <h1 className="text-2xl font-semibold tracking-normal text-neutral-900">
            Store
          </h1>
        </header>

        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8">
          <Section title="Store details">
            <div>
              <SettingRow id="store-name" label="Store name" icon={Store}>
                <Input
                  id="store-name"
                  value={form.storeName}
                  onChange={(event) => update('storeName', event.target.value)}
                  placeholder="My store"
                  className="h-10"
                />
              </SettingRow>
              {storeNameDirty ? <SaveRow onClick={saveStoreName} /> : null}
            </div>

            {/* Store address + its "Display to customers" toggle share one
                divider group, so no divider sits between them. */}
            <div>
              <SettingRow
                label="Store address"
                icon={MapPin}
                description="Shared with delivery partners"
                inline={!form.addressEnabled}
              >
                {form.addressEnabled ? (
                  <div className="space-y-3">
                    <Input
                      id="address-street"
                      value={form.addressStreet}
                      onChange={(event) =>
                        update('addressStreet', event.target.value)
                      }
                      placeholder="Street, code, city"
                      className="h-10"
                    />
                    <Input
                      id="address-unit"
                      value={form.addressUnit}
                      onChange={(event) =>
                        update('addressUnit', event.target.value)
                      }
                      placeholder="(Optional) Unit number, landmarks, etc."
                      className="h-10"
                    />
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    aria-label="Add store address"
                    className="text-muted-foreground"
                    onClick={revealAddress}
                  >
                    <Plus className="size-4" />
                  </Button>
                )}
              </SettingRow>

              {/* The two address inputs are treated as one field, so they share
                  a single Save button on its own row. */}
              {form.addressEnabled && addressDirty ? (
                <SaveRow onClick={saveAddress} />
              ) : null}

              {form.addressEnabled ? (
                <SettingRow label="Display to customers" icon={Eye} inline>
                  <ToggleControl
                    label="Display to customers"
                    checked={form.displayAddress}
                    onCheckedChange={(checked) =>
                      updateAndSave('displayAddress', checked)
                    }
                  />
                </SettingRow>
              ) : null}
            </div>

            <SettingRow id="timezone" label="Timezone" icon={Globe}>
              <Select
                value={form.timezone}
                onValueChange={(value) => updateAndSave('timezone', value)}
              >
                <SelectTrigger
                  id="timezone"
                  className="w-full data-[size=default]:h-10"
                >
                  <SelectValue placeholder="Select a timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow
              label="24-hour time"
              icon={Clock}
              description="Displayed to customers and team"
              inline
            >
              <ToggleControl
                label="24-hour time"
                checked={form.twentyFourHour}
                onCheckedChange={(checked) =>
                  updateAndSave('twentyFourHour', checked)
                }
              />
            </SettingRow>

            <SettingRow id="currency" label="Currency" icon={Coins}>
              <Select
                value={form.currency}
                onValueChange={(value) => updateAndSave('currency', value)}
              >
                <SelectTrigger
                  id="currency"
                  className="w-full data-[size=default]:h-10"
                >
                  <SelectValue placeholder="Select a currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>
          </Section>

          <Section title="Contact">
            <div>
              <SettingRow
                id="contact-info"
                label="Contact info"
                icon={Phone}
                description="Shared on receipts"
              >
                <Input
                  id="contact-info"
                  value={form.contactInfo}
                  onChange={(event) => update('contactInfo', event.target.value)}
                  placeholder="Phone, Email, etc."
                  className="h-10"
                />
              </SettingRow>
              {contactDirty ? <SaveRow onClick={saveContact} /> : null}
            </div>

            <SettingRow
              label="Browser notifications"
              icon={Bell}
              description="Get notified about new orders"
              inline
            >
              <ToggleControl
                label="Browser notifications"
                checked={form.browserNotifications}
                onCheckedChange={(checked) =>
                  updateAndSave('browserNotifications', checked)
                }
              />
            </SettingRow>
          </Section>
        </div>
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
