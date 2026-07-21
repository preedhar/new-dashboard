import * as React from 'react'
import {
  Activity,
  ArrowLeft,
  ChevronRight,
  Copy,
  Globe,
  Languages,
  Lock,
  Palette,
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
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { TypographyH4, TypographyLarge } from '@/components/ui/typography'
import { cn } from '@/lib/utils'

type IconComponent = React.ComponentType<{ className?: string }>

// Client-side navigation matching the app's router (pushState + popstate).
function navigateTo(path: string) {
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

// Visitor-tracking integrations, edited together in the Track visitor activity
// dialog. Each integration has an enable switch and an identifier field.
type TrackingSettings = {
  facebookPixelEnabled: boolean
  facebookPixelId: string
  instagramEnabled: boolean
  instagramMetaTag: string
  gtmEnabled: boolean
  gtmId: string
}

const DEFAULT_TRACKING: TrackingSettings = {
  facebookPixelEnabled: false,
  facebookPixelId: '',
  instagramEnabled: false,
  instagramMetaTag: '',
  gtmEnabled: false,
  gtmId: '',
}

type WebsiteForm = {
  shopLink: string
  languageSelector: boolean
  privateModeEnabled: boolean
  password: string
  tracking: TrackingSettings
}

// Baseline state representing the website's currently-saved settings. The
// working `form` diverges from `saved` per-field until each edit is committed.
const INITIAL_FORM: WebsiteForm = {
  shopLink: 'coffeebrewers',
  languageSelector: false,
  privateModeEnabled: false,
  password: '',
  tracking: DEFAULT_TRACKING,
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
const SAVE_TOAST_ID = 'website-save'

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

// A tappable card that navigates to another page: icon + label with an optional
// description, and a trailing chevron. Mirrors the Checkouts page's NavCard.
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

// A titled section: heading (and optional description) sit outside the card,
// fields stack as divided rows inside it. Mirrors the store settings page.
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
// on the left, control on the right. Mirrors the store settings page.
// By default the control drops below the label on mobile and sits in a fixed
// column on desktop (good for wide inputs). Pass `inline` for compact controls —
// a switch or the + button — which stay on the label's row at every breakpoint.
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
        // Center the control against the label column, even when a description
        // makes it taller.
        'sm:items-center',
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

// A settings row with an enable switch and a chevron, opening a dialog for the
// details. When off, only the switch is interactive (the chevron is dimmed);
// toggling it enables the feature. When on, clicking anywhere on the row opens
// the dialog, while the switch (above the click overlay) still toggles it off.
// Mirrors the Charges row on the Payments settings page.
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
  description?: React.ReactNode
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

// The private-mode dialog, opened from the Private mode row. Edits the access
// password and previews the resulting private link. Mirrors the Charges dialog
// shell: scrolling body, sticky Cancel/Save footer, 40px controls.
function PrivateModeDialog({
  shopLink,
  password,
  onOpenChange,
  onSave,
}: {
  shopLink: string
  password: string
  onOpenChange: (open: boolean) => void
  onSave: (password: string) => void
}) {
  const [draft, setDraft] = React.useState(password)
  const trimmed = draft.trim()
  const link = `${shopLink}.cococart.co?password=${trimmed}`
  const canSave = trimmed !== ''

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-6 overflow-hidden sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="shrink-0 text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">Private mode</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <div className="-mx-6 flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto px-6">
          <div className="space-y-1.5">
            <Label htmlFor="private-password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="private-password"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Password"
              className="h-10"
            />
            {trimmed ? (
              <p className="text-sm text-muted-foreground">
                Your private link:{' '}
                <a
                  href={`https://${link}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium break-all text-foreground"
                >
                  {link}
                </a>
              </p>
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
            onClick={() => onSave(trimmed)}
            disabled={!canSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// A settings row that acts as a button, opening a dialog when clicked. Trails a
// chevron with no inline control. Mirrors the Payments page's NavSettingRow.
function NavRow({
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
      className="-mx-4 flex w-[calc(100%+2rem)] flex-col rounded-lg px-4 py-4 text-left transition-colors hover:bg-muted/50 sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-6"
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
  )
}

// One integration field inside the Track visitor activity dialog: a label with
// an enable switch, a description, and an identifier input revealed only when
// the switch is on.
function TrackingField({
  id,
  label,
  description,
  placeholder,
  enabled,
  onEnabledChange,
  value,
  onValueChange,
}: {
  id: string
  label: string
  description: string
  placeholder: string
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <Switch
          aria-label={label}
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      {enabled ? (
        <Input
          id={id}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={placeholder}
          className="h-10"
        />
      ) : null}
    </div>
  )
}

// The Track visitor activity dialog, opened from its row. Edits the Facebook
// Pixel, Instagram Shopping, and Google Tag Manager integrations together.
// Mirrors the Charges dialog shell: scrolling body, sticky Cancel/Save footer.
function TrackingDialog({
  settings,
  onOpenChange,
  onSave,
}: {
  settings: TrackingSettings
  onOpenChange: (open: boolean) => void
  onSave: (settings: TrackingSettings) => void
}) {
  const [draft, setDraft] = React.useState<TrackingSettings>(settings)

  function update<K extends keyof TrackingSettings>(
    key: K,
    value: TrackingSettings[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const canSave = JSON.stringify(draft) !== JSON.stringify(settings)

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-6 overflow-hidden sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="shrink-0 text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">
              Track visitor activity
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <div className="-mx-6 flex min-w-0 flex-1 flex-col gap-8 overflow-y-auto px-6">
          <TrackingField
            id="facebook-pixel"
            label="Meta Pixel"
            description="Track visitors for Meta ads"
            placeholder="123456789012345"
            enabled={draft.facebookPixelEnabled}
            onEnabledChange={(value) => update('facebookPixelEnabled', value)}
            value={draft.facebookPixelId}
            onValueChange={(value) => update('facebookPixelId', value)}
          />
          <TrackingField
            id="instagram-shopping"
            label="Instagram Shopping"
            description="Add your meta-tag to verify your shop link"
            placeholder='<meta name="facebook-domain-verification" content="xxx" />'
            enabled={draft.instagramEnabled}
            onEnabledChange={(value) => update('instagramEnabled', value)}
            value={draft.instagramMetaTag}
            onValueChange={(value) => update('instagramMetaTag', value)}
          />
          <TrackingField
            id="google-tag-manager"
            label="Google Tag Manager"
            description="Manage your website tags for tracking, analytics, ads"
            placeholder="GTM-XXXXX"
            enabled={draft.gtmEnabled}
            onEnabledChange={(value) => update('gtmEnabled', value)}
            value={draft.gtmId}
            onValueChange={(value) => update('gtmId', value)}
          />
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

// The primary Save button for a text field, shown on its own row beneath the
// field once its value diverges from what's saved. Keeping it out of the field's
// control column lets the label stay vertically centered against its input.
function SaveRow({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-end pb-4">
      <Button type="button" size="lg" className="px-3" onClick={onClick}>
        Save
      </Button>
    </div>
  )
}

// A tappable suggested-domain row: the domain (with a "Suggested" badge beside
// it) on the left, a trailing chevron on the right. Mirrors the "Offer a
// discount" suggestion rows on the Checkouts page.
function DomainRow({
  domain,
  onClick,
}: {
  domain: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-full items-center justify-between gap-4 rounded-md text-left text-sm transition-colors hover:bg-muted/50"
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate">{domain}</span>
        <Badge
          variant="secondary"
          className="border-transparent bg-green-400/10 text-green-900"
        >
          Suggested
        </Badge>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  )
}

export function AdminSettingsWebsitePage() {
  // `form` holds the working values; `saved` holds what's persisted. The shop
  // link diverges until its Save button commits it.
  const [form, setForm] = React.useState<WebsiteForm>(INITIAL_FORM)
  const [saved, setSaved] = React.useState<WebsiteForm>(INITIAL_FORM)

  // Text-field edit: update the working form only.
  function update<K extends keyof WebsiteForm>(key: K, value: WebsiteForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  // Switch change: persist immediately and run the save feedback.
  function updateAndSave<K extends keyof WebsiteForm>(
    key: K,
    value: WebsiteForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
    setSaved((current) => ({ ...current, [key]: value }))
    runSaveFeedback()
  }

  function saveShopLink() {
    setSaved((current) => ({ ...current, shopLink: form.shopLink }))
    runSaveFeedback()
  }

  // The Private mode dialog, opened from its switch/chevron row.
  const [privateModeOpen, setPrivateModeOpen] = React.useState(false)

  // Private mode toggle: enabling with no saved password opens the dialog first
  // (the switch turns on only once a password is saved); otherwise it just
  // flips the flag and saves.
  function togglePrivateMode(checked: boolean) {
    if (checked && !saved.password) {
      setPrivateModeOpen(true)
      return
    }
    setForm((current) => ({ ...current, privateModeEnabled: checked }))
    setSaved((current) => ({ ...current, privateModeEnabled: checked }))
    runSaveFeedback()
  }

  // Saving the dialog stores the password and enables private mode.
  function savePrivateMode(password: string) {
    setForm((current) => ({ ...current, password, privateModeEnabled: true }))
    setSaved((current) => ({ ...current, password, privateModeEnabled: true }))
    setPrivateModeOpen(false)
    runSaveFeedback()
  }

  // The Track visitor activity dialog, opened from its chevron row.
  const [trackingOpen, setTrackingOpen] = React.useState(false)

  function saveTracking(tracking: TrackingSettings) {
    setForm((current) => ({ ...current, tracking }))
    setSaved((current) => ({ ...current, tracking }))
    setTrackingOpen(false)
    runSaveFeedback()
  }

  const shopLinkDirty = form.shopLink !== saved.shopLink

  // The saved private link — the shop's domain with the saved password as a
  // query param.
  const privateLink = `${saved.shopLink}.cococart.co?password=${saved.password}`

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
            Website
          </h1>
        </header>

        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8">
          <section className="space-y-3">
            <div className="space-y-1">
              <TypographyLarge>Customization</TypographyLarge>
            </div>
            <NavCard
              label="Appearance"
              icon={Palette}
              description="Customize your website with themes, colors, etc."
              onClick={() => navigateTo('/admin/settings/website/appearance')}
            />
          </section>

          <Section title="Link">
            <div>
              <SettingRow
                id="shop-link"
                label="Shop link"
                icon={Store}
                description="Your free Cococart domain"
              >
                <InputGroup className="h-10">
                  <InputGroupInput
                    id="shop-link"
                    value={form.shopLink}
                    onChange={(event) => update('shopLink', event.target.value)}
                    placeholder="your-shop"
                    className="pl-3"
                  />
                  <InputGroupAddon align="inline-end" className="pr-3">
                    .cococart.co
                  </InputGroupAddon>
                </InputGroup>
              </SettingRow>
              {shopLinkDirty ? <SaveRow onClick={saveShopLink} /> : null}
            </div>

            {/* Custom domain: the label + description with a suggested domain
                row (chevron) below, mirroring the Checkouts "Offer a discount"
                suggestion pattern. */}
            <div className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 text-sm font-medium sm:gap-6">
                    <Globe className="size-4 shrink-0 text-muted-foreground" />
                    Custom domain
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground sm:pl-10">
                    Connect your own branded domain
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="shrink-0 px-3"
                  onClick={() => navigateTo('/admin/settings/website/custom-domain')}
                >
                  Get domain
                </Button>
              </div>
              <div className="mt-3 flex flex-col divide-y divide-border/50 sm:pl-10">
                <DomainRow
                  domain="coffeebrewers.com"
                  onClick={() =>
                    navigateTo(
                      '/admin/settings/website/custom-domain?domain=coffeebrewers.com',
                    )
                  }
                />
              </div>
            </div>

            {/* Connected custom domain: the branded domain shown read-only in a
                copy-able group, sized to match the Shop link input. */}
            <SettingRow
              label="Custom domain"
              icon={Globe}
              description="Your branded domain"
            >
              <div
                data-slot="button-group"
                className="flex w-full items-center"
              >
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="min-w-0 flex-1 justify-start rounded-r-none"
                >
                  <a
                    href="https://coffeebrewers.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="truncate">coffeebrewers.com</span>
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  className="-ml-px rounded-l-none"
                  aria-label="Copy custom domain"
                  onClick={() => {
                    navigator.clipboard?.writeText('coffeebrewers.com')
                    toast.success('Copied to clipboard')
                  }}
                >
                  <Copy className="size-4 text-muted-foreground" />
                </Button>
              </div>
            </SettingRow>
          </Section>

          <Section title="More">
            <SettingRow
              label="Language selector"
              icon={Languages}
              description="Let customers view your shop in their language"
              inline
            >
              <ToggleControl
                label="Language selector"
                checked={form.languageSelector}
                onCheckedChange={(checked) =>
                  updateAndSave('languageSelector', checked)
                }
              />
            </SettingRow>

            {/* Private mode: a switch + chevron row (mirroring the Charges row
                on the Payments page) that opens a dialog to set the access
                password. Once enabled, the row description shows the private
                link. */}
            <SwitchNavRow
              label="Private mode"
              icon={Lock}
              description={
                form.privateModeEnabled && saved.password ? (
                  <>
                    Your private link is{' '}
                    <a
                      href={`https://${privateLink}`}
                      target="_blank"
                      rel="noreferrer"
                      className="pointer-events-auto font-medium break-all text-foreground"
                    >
                      {privateLink}
                    </a>
                  </>
                ) : (
                  'Restrict access using a private link'
                )
              }
              checked={form.privateModeEnabled}
              onCheckedChange={togglePrivateMode}
              onOpen={() => setPrivateModeOpen(true)}
            />

            {/* Track visitor activity: a chevron-only row (no switch) that opens
                a dialog with the tracking integrations. */}
            <NavRow
              label="Track visitor activity"
              icon={Activity}
              description="Sell on Instagram or track via Meta Pixel or GTM"
              onClick={() => setTrackingOpen(true)}
            />
          </Section>
        </div>
      </form>

      {privateModeOpen ? (
        <PrivateModeDialog
          shopLink={saved.shopLink}
          password={saved.password}
          onOpenChange={setPrivateModeOpen}
          onSave={savePrivateMode}
        />
      ) : null}

      {trackingOpen ? (
        <TrackingDialog
          settings={saved.tracking}
          onOpenChange={setTrackingOpen}
          onSave={saveTracking}
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
