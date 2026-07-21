import * as React from 'react'
import {
  ArrowLeft,
  BanknoteArrowDown,
  Check,
  ChevronRight,
  Coins,
  CreditCard,
  Info,
  Landmark,
  MoreHorizontal,
  Pencil,
  Plus,
  Receipt,
  Trash2,
  User,
  Wallet,
  WalletCards,
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
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TypographyH4, TypographyLarge } from '@/components/ui/typography'

import globeIcon from '@/assets/channels/globe.png'
import monitorIcon from '@/assets/channels/monitor.png'
import qrIcon from '@/assets/channels/qr.png'

type IconComponent = React.ComponentType<{ className?: string }>

// Monotonic id source for newly-created custom methods. A module-level counter
// keeps ids stable across dialog remounts. Mirrors the fulfillment page.
let idCounter = 0
function nextId(prefix: string) {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

// The global <Toaster/> paints every toast with the success (green) palette, so
// the in-progress "Saving changes…" toast overrides those vars to the neutral
// popover palette; the follow-up "Changes saved" restores green explicitly.
// Mirrors the store/fulfillment settings pages.
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
const SAVE_TOAST_ID = 'payments-save'

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

const PAYMENTS_PATH = '/admin/settings/payments'
const MANUAL_PATH = '/admin/settings/payments/manual'

// Client-side navigation matching the app's router (pushState + popstate).
function navigateTo(path: string) {
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

// ---------------------------------------------------------------------------
// Brand icons — rendered at the shared icon size (size-4) via className, so
// they keep their brand colors and match the size of the lucide icons.
// ---------------------------------------------------------------------------

function PayNowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#7C2279"
        d="M100.027 25H400.027C450.009 25 475.054 49.991 475.054 100.027V400.027C475.054 450.009 450.063 475.054 400.027 475.054H100.027C50.0452 475.054 25 450.063 25 400.027V100.027C25 50.0452 50.0452 25 100.027 25Z"
      />
      <path
        fill="#FFFFFF"
        d="M281.359 255.99C276.48 251.274 274.962 251.382 270.842 256.858C260.109 271.278 249.321 285.698 238.587 300.117C235.389 304.454 235.064 304.454 231.54 300.117C226.824 294.371 222.162 288.571 217.391 282.879C214.626 279.626 212.837 279.68 210.235 282.933C208.446 285.101 206.82 287.432 205.14 289.709C201.616 294.48 201.616 295.672 205.302 300.226C213.759 310.634 222.216 320.988 230.673 331.343C235.335 337.035 236.69 337.035 240.973 331.234C252.086 316.164 263.199 301.093 274.366 286.023C275.288 284.776 276.697 283.963 277.89 282.879C278.866 284.234 280.329 285.426 280.817 286.944C287.051 306.026 283.528 323.319 269.379 337.523C255.23 351.726 237.774 355.683 218.692 349.015C193.701 340.233 180.582 313.887 188.226 289.384C196.086 264.339 221.836 249.919 247.749 256.858C258.808 259.839 256.965 261.249 265.367 249.539C265.584 249.322 265.692 249.051 265.801 248.78C266.56 246.124 268.511 245.419 270.951 245.636C274.908 246.016 276.155 244.118 276.101 240.378C276.047 230.891 276.101 221.35 276.426 211.863C276.535 209.207 277.239 206.659 278.486 204.328C287.16 188.932 296.05 173.645 304.887 158.303C305.645 156.948 306.35 155.539 307.76 152.882C299.737 152.882 292.798 152.991 285.859 152.828C282.769 152.774 280.926 153.858 279.625 156.731C275.667 165.351 271.493 173.916 267.319 182.481C266.777 183.565 265.747 184.487 264.934 185.463C264.012 184.433 262.819 183.565 262.223 182.373C258.211 173.916 254.362 165.351 250.243 156.948C249.429 155.267 247.586 152.991 246.177 152.882C238.641 152.449 231.052 152.665 222.324 152.665C223.463 154.996 224.059 156.46 224.818 157.87C233.329 173.048 241.894 188.173 250.405 203.352C251.381 205.141 252.574 207.147 252.628 209.044C252.79 218.043 252.682 226.934 252.628 235.878C252.628 238.643 251.164 239.456 248.562 238.914C245.797 238.372 242.924 237.559 240.159 237.776C235.335 238.101 232.949 236.095 231.323 231.65C222.975 209.369 214.409 187.197 205.898 165.025C199.935 149.575 202.592 152.774 187.792 152.449C180.474 152.286 180.42 152.503 177.763 159.225C167.843 184.378 157.922 209.532 147.948 234.686C143.882 244.986 142.689 244.931 154.67 244.877C167.084 244.877 167.138 244.931 171.746 233.601C172.776 231.054 174.24 229.861 177.059 229.915C185.841 230.024 194.677 230.132 203.459 230.024C209.693 229.915 208.988 235.282 210.561 238.751C212.024 242.058 208.717 242.546 206.712 243.468C179.715 256.153 163.723 284.18 169.361 315.567C174.89 346.576 200.477 368.206 231.757 369.669C259.892 371.025 285.1 355.358 296.267 329.662C307.001 304.617 301.038 275.018 281.359 255.99ZM197.55 210.562C192.78 210.779 188.009 210.779 183.239 210.562C182.48 210.508 180.962 208.665 181.124 208.068C183.835 199.937 186.816 191.859 189.744 183.782C189.798 183.565 190.232 183.511 191.533 182.806C194.352 191.426 197.062 199.666 199.556 208.014C199.773 208.61 198.309 210.562 197.55 210.562Z"
      />
      <path
        fill="#FFFFFF"
        d="M426.537 260.381C421.929 260.327 417.267 260.49 412.659 260.273C409.19 260.11 407.238 261.303 406.045 264.718C400.407 280.548 394.607 296.269 388.806 312.044C388.102 313.995 387.072 315.838 385.716 318.874C384.524 316.164 383.765 314.754 383.223 313.236C381.542 308.466 379.699 303.75 378.506 298.871C377.856 296.16 377.693 292.962 378.506 290.36C381.217 281.74 384.47 273.229 387.614 264.772C388.915 261.303 387.722 260.056 384.307 260.11C378.778 260.11 373.248 260.164 367.773 260.002C364.412 259.893 362.731 261.249 361.701 264.501C356.551 281.09 351.239 297.678 345.872 314.212C345.492 315.296 344.462 316.218 343.758 317.194C343.053 316.164 342.077 315.242 341.698 314.158C336.168 297.678 330.693 281.198 325.326 264.664C324.188 261.194 322.399 259.514 318.55 259.731C313.508 259.948 308.413 259.677 303.371 259.731C299.143 259.785 298.655 260.544 300.227 264.556C309.93 290.143 319.58 315.676 329.284 341.263C334.433 354.924 332.645 352.376 345.547 352.647C353.57 352.81 353.732 352.539 356.551 345.22C358.882 339.041 361.376 332.861 363.761 326.681L365.496 326.518C367.231 330.855 368.965 335.137 370.646 339.474C377.097 356.008 372.706 352.159 390.27 353.027C394.011 353.189 396.016 351.563 397.317 348.202C401.112 338.498 405.015 328.903 408.973 319.254C416.183 301.69 423.501 284.125 430.765 266.507C432.934 261.14 432.446 260.436 426.537 260.381ZM156.027 258.863C151.69 258.972 147.354 259.08 143.071 258.809C138.951 258.538 137.596 260.219 137.596 264.23C137.596 277.458 137.379 290.685 137.216 303.912C137.216 305.539 136.783 307.111 136.512 308.737L135.319 308.954C134.452 307.707 133.476 306.46 132.663 305.159C123.881 291.01 115.044 276.915 106.316 262.712C104.582 259.839 102.522 258.484 99.1064 258.592C93.7396 258.755 88.3727 258.701 83.0059 258.538C79.8075 258.43 78.398 259.677 78.398 262.929C78.2896 290.848 78.127 318.766 77.9102 346.738C77.9102 349.991 79.3738 351.292 82.518 351.238C86.6922 351.129 90.8664 351.021 95.0406 351.346C99.4317 351.672 100.678 349.937 100.678 345.708C100.624 331.017 100.841 316.272 101.004 301.581C101.004 300.009 101.437 298.437 101.654 296.811L102.901 296.594C103.877 298.003 104.853 299.413 105.72 300.822C114.936 316.11 124.097 331.397 133.259 346.684C134.723 349.124 136.078 351.509 139.656 351.455C145.185 351.292 150.715 351.4 156.19 351.509C159.063 351.563 160.201 350.208 160.201 347.443C160.31 319.362 160.473 291.281 160.689 263.2C160.689 259.839 159.117 258.755 156.027 258.863ZM83.8733 244.552C88.4812 244.335 93.1433 244.389 97.7511 244.606C101.492 244.823 102.793 243.251 102.793 239.673C102.738 232.084 103.01 224.494 102.901 216.959C102.847 213.381 104.148 211.863 107.888 211.971C113.364 212.188 118.947 212.243 124.423 211.917C139.71 210.996 151.474 197.552 151.203 181.614C150.931 165.405 138.572 152.232 123.176 152.015C110.382 151.798 97.5343 152.015 84.7407 151.744C80.7833 151.69 79.5365 153.207 79.5907 157.002C79.7533 170.663 79.6449 184.324 79.6449 197.985H79.2112C79.2112 211.809 79.3196 225.632 79.157 239.456C78.9944 243.088 80.0786 244.715 83.8733 244.552ZM103.064 181.776C103.335 169.091 101.329 171.097 116.399 171.097C124.694 171.097 129.573 179.499 125.941 186.926C124.097 190.667 121.116 192.835 116.833 192.944C115.966 192.944 115.044 192.944 114.177 192.944C101.871 192.781 103.064 194.733 103.064 181.776Z"
      />
    </svg>
  )
}

function PayPalIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#002991"
        d="M381.58 128.5C381.58 184.24 330.14 250 252.31 250H177.34L173.66 273.22L156.17 385H63L119.05 25H270C320.83 25 360.82 53.33 375.55 92.7C379.798 104.147 381.844 116.293 381.58 128.5Z"
      />
      <path
        fill="#60CDFF"
        d="M435.28 232C425.009 294.408 370.987 340.153 307.74 340H255.68L234.01 475H141.34L156.17 385L173.67 273.22L177.34 250H252.31C330.04 250 381.58 184.24 381.58 128.5C419.83 148.24 442.13 188.13 435.28 232Z"
      />
      <path
        fill="#008CFF"
        d="M381.58 128.5C365.54 120.11 346.09 115 324.92 115H198.52L177.34 250H252.31C330.04 250 381.58 184.24 381.58 128.5Z"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Shared layout helpers (mirror the fulfillment settings page)
// ---------------------------------------------------------------------------

// A card wrapping a stack of divided settings rows.
function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="gap-0 py-0 shadow-none">
      <div className="divide-y divide-border/50 px-4 sm:px-6">{children}</div>
    </Card>
  )
}

// A titled section: heading sits above one or more cards.
function PaymentSection({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <TypographyLarge>{title}</TypographyLarge>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  )
}

// A single settings row: label (icon + text, with an optional description below)
// on the left, control on the right.
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
  description?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col py-4">
      <div className="flex items-center justify-between gap-4">
        <Label
          htmlFor={id}
          className="flex items-center gap-4 text-sm font-medium md:gap-6"
        >
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          {label}
        </Label>
        <div className="shrink-0">{children}</div>
      </div>
      {description ? (
        <div className="mt-1.5 text-sm text-muted-foreground md:pl-10">
          {description}
        </div>
      ) : null}
    </div>
  )
}

// A settings row that acts as a button, opening a dialog or navigating when
// clicked. Trails a chevron instead of an inline control.
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
      className="-mx-4 flex w-[calc(100%+2rem)] flex-col rounded-lg px-4 py-4 text-left transition-colors hover:bg-muted/50 sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-6"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-4 text-sm font-medium md:gap-6">
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          {label}
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </div>
      {description ? (
        <p className="mt-1.5 text-sm text-muted-foreground md:pl-10">
          {description}
        </p>
      ) : null}
    </button>
  )
}

// A nav row with a quick enable switch before the chevron. The label area and
// the chevron open the dialog; the switch toggles the feature independently.
// A settings row with an enable switch and a chevron. When off, only the switch
// is interactive (the chevron is dimmed); toggling it enables the feature. When
// on, clicking anywhere on the row opens the dialog, while the switch (which
// sits above the click overlay) still toggles the feature off.
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
        <span className="flex items-center gap-4 text-sm font-medium md:gap-6">
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
        <p className="pointer-events-none relative mt-1.5 text-sm text-muted-foreground md:pl-10">
          {description}
        </p>
      ) : null}
    </div>
  )
}

// A method row: name + summary on the left, an edit/delete menu on the right.
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
    <div className="flex flex-col py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-6">
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          <p className="min-w-0 flex-1 truncate text-sm font-medium">{name}</p>
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
      <p className="mt-1 text-sm text-muted-foreground md:pl-10">{summary}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tips
// ---------------------------------------------------------------------------

type TipOption = { id: string; value: string }
type TipsSettings = { enabled: boolean; options: TipOption[] }

const MAX_TIP_OPTIONS = 3

function defaultTips(): TipsSettings {
  return { enabled: false, options: [] }
}

// Whether tips have at least one saved option.
function tipsConfigured(tips: TipsSettings) {
  return tips.options.some((option) => option.value.trim() !== '')
}

// Row description: the entered tip options when on, otherwise the default blurb.
function tipsSummary(tips: TipsSettings) {
  if (!tips.enabled || !tipsConfigured(tips)) {
    return 'Let customers select a tip during checkout'
  }
  const values = tips.options
    .map((option) => option.value.trim())
    .filter((value) => value !== '')
  return values.map((value) => `${value}%`).join(', ')
}

// Keep only numeric input: digits plus a single decimal point.
function sanitizeNumber(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, '')
  const [whole, ...rest] = cleaned.split('.')
  return rest.length > 0 ? `${whole}.${rest.join('')}` : whole
}

// The tips dialog, opened from the Tips row. Mirrors the add/edit method
// dialog: scrolling body, sticky Cancel/Save footer. Each option is a
// tip-percentage input with a delete button, and an "Add option" button
// appends a new row. Saving with no options is allowed.
function TipsDialog({
  settings,
  onOpenChange,
  onSave,
}: {
  settings: TipsSettings
  onOpenChange: (open: boolean) => void
  onSave: (settings: TipsSettings) => void
}) {
  // Seed one empty row when there are none so a field is shown immediately.
  const [draft, setDraft] = React.useState<TipsSettings>(() =>
    settings.options.length > 0
      ? settings
      : { ...settings, options: [{ id: nextId('tip'), value: '' }] },
  )

  function addOption() {
    setDraft((current) => {
      if (current.options.length >= MAX_TIP_OPTIONS) return current
      return {
        ...current,
        options: [...current.options, { id: nextId('tip'), value: '' }],
      }
    })
  }

  function updateOption(id: string, value: string) {
    setDraft((current) => ({
      ...current,
      options: current.options.map((option) =>
        option.id === id ? { ...option, value: sanitizeNumber(value) } : option,
      ),
    }))
  }

  function removeOption(id: string) {
    setDraft((current) => ({
      ...current,
      options: current.options.filter((option) => option.id !== id),
    }))
  }

  // Normalize before saving/comparing: trim values and drop empty rows. The
  // comparison against `settings` drives the dirty check.
  const trimmedOptions = draft.options
    .map((option) => ({ ...option, value: option.value.trim() }))
    .filter((option) => option.value !== '')
  const payload: TipsSettings = { enabled: draft.enabled, options: trimmedOptions }
  // Require at least one option; an empty tips list has nothing to save.
  const canSave =
    trimmedOptions.length > 0 &&
    JSON.stringify(payload) !== JSON.stringify(settings)

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-6 overflow-hidden sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="shrink-0 text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">Tips</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <div className="-mx-6 flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto px-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Options</Label>
            {draft.options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2">
                <InputGroup className="h-10 flex-1">
                  <InputGroupInput
                    aria-label={`Tip option ${index + 1}`}
                    inputMode="decimal"
                    value={option.value}
                    onChange={(event) =>
                      updateOption(option.id, event.target.value)
                    }
                    placeholder="10"
                    className="pl-3"
                  />
                  <InputGroupAddon align="inline-end" className="pr-3">
                    %
                  </InputGroupAddon>
                </InputGroup>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-10 shrink-0 text-muted-foreground"
                  aria-label={`Remove tip option ${index + 1}`}
                  onClick={() => removeOption(option.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            {draft.options.length < MAX_TIP_OPTIONS ? (
              <Button
                type="button"
                variant="outline"
                className="h-10 px-3 gap-2"
                onClick={addOption}
              >
                <Plus className="size-4" />
                Add option
              </Button>
            ) : null}
          </div>
        </div>

        <DialogFooter className="shrink-0 flex-row">
          <Button
            variant="outline"
            className="h-10 px-3 flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 px-3 flex-1"
            onClick={() => onSave(payload)}
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
// Charges
// ---------------------------------------------------------------------------

type ChargeChannel = 'online-store' | 'pos' | 'qr'

// Sales channels a charge can apply to, with the icons used on the Orders page.
const CHARGE_CHANNELS: { value: ChargeChannel; label: string; icon: string }[] = [
  { value: 'online-store', label: 'Online Store', icon: globeIcon },
  { value: 'pos', label: 'POS', icon: monitorIcon },
  { value: 'qr', label: 'QR Code', icon: qrIcon },
]

// Every channel selected — the default for a newly configured item.
const ALL_CHANNELS: ChargeChannel[] = ['online-store', 'pos', 'qr']

// The Channels multi-select, shared by every dialog that scopes to sales
// channels. Unselected options read as muted; selected ones show a check.
function ChannelsField({
  value,
  onValueChange,
}: {
  value: ChargeChannel[]
  onValueChange: (value: ChargeChannel[]) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">Channels</Label>
      <ToggleGroup
        type="multiple"
        variant="outline"
        size="lg"
        value={value}
        onValueChange={(next) => onValueChange(next as ChargeChannel[])}
        className="w-full"
      >
        {CHARGE_CHANNELS.map((channel) => (
          <ToggleGroupItem
            key={channel.value}
            value={channel.value}
            aria-label={channel.label}
            className="group/channel gap-2 px-2 font-normal data-[state=on]:bg-background data-[state=on]:hover:bg-muted/40 data-[state=off]:border-border/50 data-[state=off]:bg-muted data-[state=off]:text-muted-foreground data-[state=off]:hover:bg-muted/50 data-[state=off]:hover:text-foreground"
          >
            <img
              src={channel.icon}
              alt=""
              className="size-5 shrink-0 grayscale group-data-[state=on]/channel:hidden"
            />
            <Check className="hidden size-5 shrink-0 text-primary group-data-[state=on]/channel:block" />
            <span className="truncate">{channel.label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

type ChargesSettings = {
  enabled: boolean
  name: string
  percentage: string
  channels: ChargeChannel[]
}

function defaultCharges(): ChargesSettings {
  return {
    enabled: false,
    name: '',
    percentage: '',
    channels: ALL_CHANNELS,
  }
}

// Whether a charge has saved details (a name and a positive percentage).
function chargesConfigured(charges: ChargesSettings) {
  return charges.name.trim() !== '' && Number(charges.percentage) > 0
}

// Row description: the entered details when on, otherwise the default blurb.
function chargesSummary(charges: ChargesSettings) {
  if (charges.enabled && chargesConfigured(charges)) {
    return `${charges.name} · ${charges.percentage}%`
  }
  return 'Add service charges to orders'
}

// The charges dialog, opened from the Charges row. Mirrors the Tips dialog
// shell: scrolling body, sticky Cancel/Save footer, 40px controls.
function ChargesDialog({
  settings,
  onOpenChange,
  onSave,
}: {
  settings: ChargesSettings
  onOpenChange: (open: boolean) => void
  onSave: (settings: ChargesSettings) => void
}) {
  const [draft, setDraft] = React.useState<ChargesSettings>(settings)

  function update<K extends keyof ChargesSettings>(
    key: K,
    value: ChargesSettings[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const payload: ChargesSettings = {
    enabled: draft.enabled,
    name: draft.name.trim(),
    percentage: draft.percentage.trim(),
    channels: draft.channels,
  }
  const hasChanges = JSON.stringify(payload) !== JSON.stringify(settings)
  const canSave =
    hasChanges &&
    payload.name !== '' &&
    Number(payload.percentage) > 0 &&
    payload.channels.length > 0

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-6 overflow-hidden sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="shrink-0 text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">Charges</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <div className="-mx-6 flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto px-6">
          <div className="space-y-1.5">
            <Label htmlFor="charge-name" className="text-sm font-medium">
              Charge name
            </Label>
            <Input
              id="charge-name"
              value={draft.name}
              onChange={(event) => update('name', event.target.value)}
              placeholder="Service charge"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="charge-percentage" className="text-sm font-medium">
              Percentage
            </Label>
            <InputGroup className="h-10">
              <InputGroupInput
                id="charge-percentage"
                inputMode="decimal"
                value={draft.percentage}
                onChange={(event) =>
                  update('percentage', sanitizeNumber(event.target.value))
                }
                placeholder="10"
                className="pl-3"
              />
              <InputGroupAddon align="inline-end" className="pr-3">
                %
              </InputGroupAddon>
            </InputGroup>
          </div>

          <ChannelsField
            value={draft.channels}
            onValueChange={(value) => update('channels', value)}
          />
        </div>

        <DialogFooter className="shrink-0 flex-row">
          <Button
            variant="outline"
            className="h-10 px-3 flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 px-3 flex-1"
            onClick={() => onSave(payload)}
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
// Tax
// ---------------------------------------------------------------------------

type TaxSettings = {
  enabled: boolean
  name: string
  percentage: string
  registrationEnabled: boolean
  registrationNumber: string
  includedInPrices: boolean
}

function defaultTax(): TaxSettings {
  return {
    enabled: false,
    name: '',
    percentage: '',
    registrationEnabled: false,
    registrationNumber: '',
    includedInPrices: false,
  }
}

// Whether a tax has saved details (a name and a positive percentage).
function taxConfigured(tax: TaxSettings) {
  return tax.name.trim() !== '' && Number(tax.percentage) > 0
}

// Row description: the entered details when on, otherwise the default blurb.
function taxSummary(tax: TaxSettings) {
  if (tax.enabled && taxConfigured(tax)) {
    return `${tax.name} · ${tax.percentage}%`
  }
  return 'Collect tax on your orders'
}

// The tax dialog, opened from the Tax row. Mirrors the Tips dialog shell, with
// the registration/inclusion toggles shown in cards like the Tips switch.
function TaxDialog({
  settings,
  onOpenChange,
  onSave,
}: {
  settings: TaxSettings
  onOpenChange: (open: boolean) => void
  onSave: (settings: TaxSettings) => void
}) {
  const [draft, setDraft] = React.useState<TaxSettings>(settings)

  function update<K extends keyof TaxSettings>(key: K, value: TaxSettings[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  // Drop the registration number when its switch is off before saving/comparing.
  const payload: TaxSettings = {
    enabled: draft.enabled,
    name: draft.name.trim(),
    percentage: draft.percentage.trim(),
    registrationEnabled: draft.registrationEnabled,
    registrationNumber: draft.registrationEnabled
      ? draft.registrationNumber.trim()
      : '',
    includedInPrices: draft.includedInPrices,
  }
  const hasChanges = JSON.stringify(payload) !== JSON.stringify(settings)
  // Require a name, a positive percentage, and — when registration is on — a
  // registration number.
  const canSave =
    hasChanges &&
    payload.name !== '' &&
    Number(payload.percentage) > 0 &&
    (!payload.registrationEnabled || payload.registrationNumber !== '')

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-6 overflow-hidden sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="shrink-0 text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">Tax</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <div className="-mx-6 flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto px-6">
          <div className="space-y-1.5">
            <Label htmlFor="tax-name" className="text-sm font-medium">
              Tax name
            </Label>
            <Input
              id="tax-name"
              value={draft.name}
              onChange={(event) => update('name', event.target.value)}
              placeholder="Goods & Services Tax"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tax-percentage" className="text-sm font-medium">
              Percentage
            </Label>
            <InputGroup className="h-10">
              <InputGroupInput
                id="tax-percentage"
                inputMode="decimal"
                value={draft.percentage}
                onChange={(event) =>
                  update('percentage', sanitizeNumber(event.target.value))
                }
                placeholder="10"
                className="pl-3"
              />
              <InputGroupAddon align="inline-end" className="pr-3">
                %
              </InputGroupAddon>
            </InputGroup>
          </div>

          <div className="flex flex-col gap-3 rounded-md border p-3">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Tax registration number</FieldTitle>
                <FieldDescription>Shown on your receipts</FieldDescription>
              </FieldContent>
              <Switch
                aria-label="Tax registration number"
                checked={draft.registrationEnabled}
                onCheckedChange={(checked) =>
                  update('registrationEnabled', checked)
                }
              />
            </Field>
            {draft.registrationEnabled ? (
              <Input
                aria-label="Tax registration number"
                value={draft.registrationNumber}
                onChange={(event) =>
                  update('registrationNumber', event.target.value)
                }
                placeholder="1234567890"
                className="h-10 bg-background"
              />
            ) : null}
          </div>

          <FieldLabel
            htmlFor="tax-included"
            className="transition-colors hover:bg-muted/50"
          >
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Taxes are included in prices</FieldTitle>
                <FieldDescription>
                  Tax will be deducted from product prices
                </FieldDescription>
              </FieldContent>
              <Switch
                id="tax-included"
                checked={draft.includedInPrices}
                onCheckedChange={(checked) => update('includedInPrices', checked)}
              />
            </Field>
          </FieldLabel>
        </div>

        <DialogFooter className="shrink-0 flex-row">
          <Button
            variant="outline"
            className="h-10 px-3 flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 px-3 flex-1"
            onClick={() => onSave(payload)}
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
// Payment methods (Credit / Debit card, PayNow, PayPal)
// ---------------------------------------------------------------------------

type PaymentMethodKey = 'card' | 'payNow' | 'payPal'

type PaymentMethodSettings = {
  enabled: boolean
  channels: ChargeChannel[]
  minimumSpendEnabled: boolean
  minimumSpend: string
}

// The three automatically-verified methods, shown as rows in a single card.
const PAYMENT_METHODS: {
  key: PaymentMethodKey
  label: string
  icon: IconComponent
  description: string
}[] = [
  {
    key: 'card',
    label: 'Credit / Debit card',
    icon: CreditCard,
    description: 'Increase sales by accepting card payments',
  },
  {
    key: 'payNow',
    label: 'PayNow',
    icon: PayNowIcon,
    description: 'Accept payments via PayNow',
  },
  {
    key: 'payPal',
    label: 'PayPal',
    icon: PayPalIcon,
    description: 'Receive payments to your PayPal account',
  },
]

// The payment method dialog, opened from a method row. Mirrors the Charges
// dialog shell, but exposes only the Channels field; it can't be saved with no
// channel selected.
function PaymentMethodDialog({
  title,
  settings,
  showMinimumSpend = false,
  onOpenChange,
  onSave,
}: {
  title: string
  settings: PaymentMethodSettings
  showMinimumSpend?: boolean
  onOpenChange: (open: boolean) => void
  onSave: (settings: PaymentMethodSettings) => void
}) {
  const [draft, setDraft] = React.useState<PaymentMethodSettings>(settings)

  function update<K extends keyof PaymentMethodSettings>(
    key: K,
    value: PaymentMethodSettings[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const payload: PaymentMethodSettings = {
    enabled: draft.enabled,
    channels: draft.channels,
    minimumSpendEnabled: draft.minimumSpendEnabled,
    minimumSpend: draft.minimumSpend,
  }
  const hasChanges = JSON.stringify(payload) !== JSON.stringify(settings)
  const canSave =
    hasChanges &&
    payload.channels.length > 0 &&
    (!payload.minimumSpendEnabled || payload.minimumSpend.trim() !== '')

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-6 overflow-hidden sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="shrink-0 text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">{title}</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <div className="-mx-6 flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto px-6">
          {showMinimumSpend ? (
            <div className="space-y-3">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Minimum spend required</FieldTitle>
                  <FieldDescription>
                    Only allow card payments over this amount
                  </FieldDescription>
                </FieldContent>
                <Switch
                  aria-label="Minimum spend required"
                  checked={draft.minimumSpendEnabled}
                  onCheckedChange={(checked) =>
                    update('minimumSpendEnabled', checked)
                  }
                />
              </Field>
              {draft.minimumSpendEnabled ? (
                <InputGroup className="h-10">
                  <InputGroupAddon align="inline-start" className="pl-3">
                    $
                  </InputGroupAddon>
                  <InputGroupInput
                    aria-label="Minimum spend amount"
                    inputMode="decimal"
                    value={draft.minimumSpend}
                    onChange={(event) =>
                      update('minimumSpend', sanitizeNumber(event.target.value))
                    }
                    placeholder="0"
                  />
                </InputGroup>
              ) : null}
            </div>
          ) : null}

          <ChannelsField
            value={draft.channels}
            onValueChange={(value) => update('channels', value)}
          />
        </div>

        <DialogFooter className="shrink-0 flex-row">
          <Button
            variant="outline"
            className="h-10 px-3 flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 px-3 flex-1"
            onClick={() => onSave(payload)}
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
// Automated payments page
// ---------------------------------------------------------------------------

type AutomatedPayments = {
  customerPaysFees: boolean
}

export function AdminSettingsPaymentsPage() {
  const [automated, setAutomated] = React.useState<AutomatedPayments>({
    customerPaysFees: false,
  })
  const [methods, setMethods] = React.useState<
    Record<PaymentMethodKey, PaymentMethodSettings>
  >({
    card: {
      enabled: true,
      channels: ALL_CHANNELS,
      minimumSpendEnabled: false,
      minimumSpend: '',
    },
    payNow: {
      enabled: true,
      channels: ALL_CHANNELS,
      minimumSpendEnabled: false,
      minimumSpend: '',
    },
    payPal: {
      enabled: false,
      channels: ALL_CHANNELS,
      minimumSpendEnabled: false,
      minimumSpend: '',
    },
  })
  const [methodDialog, setMethodDialog] = React.useState<PaymentMethodKey | null>(
    null,
  )
  const [tips, setTips] = React.useState<TipsSettings>(defaultTips)
  const [tipsOpen, setTipsOpen] = React.useState(false)
  const [charges, setCharges] = React.useState<ChargesSettings>(defaultCharges)
  const [chargesOpen, setChargesOpen] = React.useState(false)
  const [tax, setTax] = React.useState<TaxSettings>(defaultTax)
  const [taxOpen, setTaxOpen] = React.useState(false)

  function toggle<K extends keyof AutomatedPayments>(key: K, value: boolean) {
    setAutomated((current) => ({ ...current, [key]: value }))
    runSaveFeedback()
  }

  function togglePaymentMethod(key: PaymentMethodKey, checked: boolean) {
    setMethods((current) => ({
      ...current,
      [key]: { ...current[key], enabled: checked },
    }))
    runSaveFeedback()
  }

  function saveMethod(key: PaymentMethodKey, settings: PaymentMethodSettings) {
    // Saving the dialog also keeps the method enabled.
    setMethods((current) => ({
      ...current,
      [key]: { ...settings, enabled: true },
    }))
    setMethodDialog(null)
    toast.success('Changes saved')
  }

  function saveTips(settings: TipsSettings) {
    // Saving the dialog also enables the card.
    setTips({ ...settings, enabled: true })
    setTipsOpen(false)
    toast.success('Changes saved')
  }

  function saveCharges(settings: ChargesSettings) {
    // Saving the dialog also enables the card.
    setCharges({ ...settings, enabled: true })
    setChargesOpen(false)
    toast.success('Changes saved')
  }

  function saveTax(settings: TaxSettings) {
    // Saving the dialog also enables the card.
    setTax({ ...settings, enabled: true })
    setTaxOpen(false)
    toast.success('Changes saved')
  }

  function toggleTips(checked: boolean) {
    // Enabling with no saved details opens the dialog first; the switch turns
    // on only once the dialog is saved.
    if (checked && !tipsConfigured(tips)) {
      setTipsOpen(true)
      return
    }
    setTips((current) => ({ ...current, enabled: checked }))
    runSaveFeedback()
  }

  function toggleCharges(checked: boolean) {
    // Enabling with no saved details opens the dialog first; the switch turns
    // on only once the dialog is saved.
    if (checked && !chargesConfigured(charges)) {
      setChargesOpen(true)
      return
    }
    setCharges((current) => ({ ...current, enabled: checked }))
    runSaveFeedback()
  }

  function toggleTax(checked: boolean) {
    if (checked && !taxConfigured(tax)) {
      setTaxOpen(true)
      return
    }
    setTax((current) => ({ ...current, enabled: checked }))
    runSaveFeedback()
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
            Payments
          </h1>
        </header>

        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8">
          <PaymentSection
            title="Payment methods"
            description={
              <>
                Orders get approved after payments are auto-verified.{' '}
                <a
                  href="https://support.cococart.co/en/articles/15529632-what-payment-methods-are-available-in-my-country-and-what-fees-apply"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Fees apply
                </a>
              </>
            }
            action={
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10 text-muted-foreground"
                    aria-label="Payment methods options"
                  >
                    <MoreHorizontal className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-40">
                  <DropdownMenuItem>
                    <BanknoteArrowDown className="size-4" />
                    Payout details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
          >
            <SettingsCard>
              {PAYMENT_METHODS.map((method) => (
                <SwitchNavRow
                  key={method.key}
                  label={method.label}
                  icon={method.icon}
                  description={method.description}
                  checked={methods[method.key].enabled}
                  onCheckedChange={(checked) =>
                    togglePaymentMethod(method.key, checked)
                  }
                  onOpen={() => setMethodDialog(method.key)}
                />
              ))}
            </SettingsCard>

            <SettingsCard>
              <SettingRow
                id="pay-fees"
                label="Customer pays transaction fees"
                icon={User}
                description={
                  <span className="inline-flex items-center gap-1.5">
                    Add processing fees to the order total
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label="More information"
                            className="inline-flex text-muted-foreground transition-colors hover:text-foreground"
                          >
                            <Info className="size-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Not applicable for PayNow transactions
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                }
              >
                <Switch
                  id="pay-fees"
                  aria-label="Customer pays transaction fees"
                  checked={automated.customerPaysFees}
                  onCheckedChange={(checked) =>
                    toggle('customerPaysFees', checked)
                  }
                />
              </SettingRow>
            </SettingsCard>
          </PaymentSection>

          <PaymentSection title="More">
            <SettingsCard>
              <NavSettingRow
                label="Manual payments"
                icon={WalletCards}
                description="Manually verify payments and approve orders"
                onClick={() => navigateTo(MANUAL_PATH)}
              />
            </SettingsCard>
            <SettingsCard>
              <SwitchNavRow
                label="Tips"
                icon={Coins}
                description={tipsSummary(tips)}
                checked={tips.enabled}
                onCheckedChange={toggleTips}
                onOpen={() => setTipsOpen(true)}
              />
            </SettingsCard>
            <SettingsCard>
              <SwitchNavRow
                label="Charges"
                icon={Receipt}
                description={chargesSummary(charges)}
                checked={charges.enabled}
                onCheckedChange={toggleCharges}
                onOpen={() => setChargesOpen(true)}
              />
            </SettingsCard>
            <SettingsCard>
              <SwitchNavRow
                label="Tax"
                icon={Landmark}
                description={taxSummary(tax)}
                checked={tax.enabled}
                onCheckedChange={toggleTax}
                onOpen={() => setTaxOpen(true)}
              />
            </SettingsCard>
          </PaymentSection>
        </div>
      </div>

      {tipsOpen ? (
        <TipsDialog
          settings={tips}
          onOpenChange={(open) => {
            if (!open) setTipsOpen(false)
          }}
          onSave={saveTips}
        />
      ) : null}

      {chargesOpen ? (
        <ChargesDialog
          settings={charges}
          onOpenChange={(open) => {
            if (!open) setChargesOpen(false)
          }}
          onSave={saveCharges}
        />
      ) : null}

      {taxOpen ? (
        <TaxDialog
          settings={tax}
          onOpenChange={(open) => {
            if (!open) setTaxOpen(false)
          }}
          onSave={saveTax}
        />
      ) : null}

      {methodDialog ? (
        <PaymentMethodDialog
          title={
            PAYMENT_METHODS.find((method) => method.key === methodDialog)!.label
          }
          settings={methods[methodDialog]}
          showMinimumSpend={methodDialog === 'card'}
          onOpenChange={(open) => {
            if (!open) setMethodDialog(null)
          }}
          onSave={(settings) => saveMethod(methodDialog, settings)}
        />
      ) : null}
    </>
  )
}

// ---------------------------------------------------------------------------
// Manual payments — default methods
// ---------------------------------------------------------------------------

type DefaultMethodId = 'paynow' | 'paypal' | 'bank-transfer' | 'cash'

type DefaultFieldKey =
  | 'account'
  | 'paypalLink'
  | 'bankName'
  | 'accountNumber'
  | 'instructions'

type DefaultFieldConfig = {
  key: DefaultFieldKey
  label: string
  placeholder: string
  multiline?: boolean
}

type DefaultMethodConfig = {
  id: DefaultMethodId
  name: string
  description: string
  icon: IconComponent
  fields: DefaultFieldConfig[]
}

const INSTRUCTIONS_FIELD: DefaultFieldConfig = {
  key: 'instructions',
  label: 'Instructions',
  placeholder: 'Shown to customers at checkout',
  multiline: true,
}

// The default methods, in the order they appear in the card.
const DEFAULT_METHODS: DefaultMethodConfig[] = [
  {
    id: 'paynow',
    name: 'PayNow',
    description: 'Accept payments via PayNow',
    icon: Wallet,
    fields: [
      {
        key: 'account',
        label: 'Account',
        placeholder: 'Enter account details',
      },
      INSTRUCTIONS_FIELD,
    ],
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Accept payments to your PayPal.me link',
    icon: Wallet,
    fields: [
      {
        key: 'paypalLink',
        label: 'PayPal.me link',
        placeholder: 'paypal.me/yourname',
      },
      INSTRUCTIONS_FIELD,
    ],
  },
  {
    id: 'bank-transfer',
    name: 'Bank transfer',
    description: 'Accept manual transfers to your bank account',
    icon: Wallet,
    fields: [
      { key: 'bankName', label: 'Bank name', placeholder: 'e.g. DBS' },
      {
        key: 'accountNumber',
        label: 'Account number',
        placeholder: 'Account number',
      },
      INSTRUCTIONS_FIELD,
    ],
  },
  {
    id: 'cash',
    name: 'Cash',
    description: 'Accept cash upon delivery or pickup',
    icon: Wallet,
    fields: [
      {
        key: 'instructions',
        label: 'Payment instructions',
        placeholder: 'e.g. Pay in cash on delivery',
        multiline: true,
      },
    ],
  },
]

type DefaultMethodValues = Partial<Record<DefaultFieldKey, string>>

type DefaultMethodState = {
  enabled: boolean
  values: DefaultMethodValues
  channels: ChargeChannel[]
}

const DEFAULT_INSTRUCTIONS =
  'Please include your order ID in the reference. Payment must be completed within 30 minutes.'
const CASH_INSTRUCTIONS = 'We will collect cash on delivery or pickup.'

function defaultMethodState(): Record<DefaultMethodId, DefaultMethodState> {
  return {
    paynow: {
      enabled: false,
      values: { instructions: DEFAULT_INSTRUCTIONS },
      channels: ALL_CHANNELS,
    },
    paypal: {
      enabled: false,
      values: { instructions: DEFAULT_INSTRUCTIONS },
      channels: ALL_CHANNELS,
    },
    'bank-transfer': {
      enabled: false,
      values: { instructions: DEFAULT_INSTRUCTIONS },
      channels: ALL_CHANNELS,
    },
    cash: {
      enabled: false,
      values: { instructions: CASH_INSTRUCTIONS },
      channels: ALL_CHANNELS,
    },
  }
}

// Row description: the static blurb when off, the entered detail once on.
function defaultMethodSummary(
  config: DefaultMethodConfig,
  state: DefaultMethodState,
) {
  if (!state.enabled) return config.description
  const primary = config.fields[0]
  return state.values[primary.key]?.trim() || config.description
}

// Whether a default method has its primary detail filled in.
function defaultMethodConfigured(
  config: DefaultMethodConfig,
  state: DefaultMethodState,
) {
  const primary = config.fields[0]
  return (state.values[primary.key]?.trim() ?? '') !== ''
}

// The add/edit dialog for a default method: an enable switch plus the method's
// fields. Re-mounted per open so its draft always starts fresh.
function DefaultMethodDialog({
  config,
  state,
  onOpenChange,
  onSave,
}: {
  config: DefaultMethodConfig
  state: DefaultMethodState
  onOpenChange: (open: boolean) => void
  onSave: (state: DefaultMethodState) => void
}) {
  const [draft, setDraft] = React.useState<DefaultMethodState>(state)

  function updateValue(key: DefaultFieldKey, value: string) {
    setDraft((current) => ({
      ...current,
      values: { ...current.values, [key]: value },
    }))
  }

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(state)
  const allFieldsFilled = config.fields.every(
    (field) => (draft.values[field.key]?.trim() ?? '') !== '',
  )
  const canSave = hasChanges && draft.channels.length > 0 && allFieldsFilled

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-6 overflow-hidden sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="shrink-0 text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">{config.name}</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <div className="-mx-6 flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto px-6">
          {config.fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label
                htmlFor={`default-${field.key}`}
                className="text-sm font-medium"
              >
                {field.label}
              </Label>
              {field.multiline ? (
                <Textarea
                  id={`default-${field.key}`}
                  value={draft.values[field.key] ?? ''}
                  onChange={(event) => updateValue(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  className="min-h-10"
                />
              ) : (
                <Input
                  id={`default-${field.key}`}
                  value={draft.values[field.key] ?? ''}
                  onChange={(event) => updateValue(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  className="h-10"
                />
              )}
            </div>
          ))}

          <ChannelsField
            value={draft.channels}
            onValueChange={(channels) =>
              setDraft((current) => ({ ...current, channels }))
            }
          />
        </div>

        <DialogFooter className="shrink-0 flex-row">
          <Button
            variant="outline"
            className="h-10 px-3 flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 px-3 flex-1"
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
// Manual payments — custom methods
// ---------------------------------------------------------------------------

type CustomMethod = {
  id: string
  name: string
  details: string
  channels: ChargeChannel[]
}

// The add/edit dialog for a custom method: a name, free-form details, and the
// sales channels it applies to. Re-mounted per open so its draft always starts
// fresh from `initial`.
function CustomMethodDialog({
  initial,
  onOpenChange,
  onSave,
}: {
  initial: CustomMethod | null
  onOpenChange: (open: boolean) => void
  onSave: (method: {
    name: string
    details: string
    channels: ChargeChannel[]
  }) => void
}) {
  const isEditing = initial !== null
  const [name, setName] = React.useState(initial?.name ?? '')
  const [details, setDetails] = React.useState(initial?.details ?? '')
  const [channels, setChannels] = React.useState<ChargeChannel[]>(
    initial?.channels ?? ALL_CHANNELS,
  )

  const payload = { name: name.trim(), details: details.trim(), channels }
  const hasChanges =
    !isEditing ||
    payload.name !== initial.name ||
    payload.details !== initial.details ||
    JSON.stringify(payload.channels) !== JSON.stringify(initial.channels)
  const canSave =
    payload.name !== '' &&
    payload.details !== '' &&
    payload.channels.length > 0 &&
    hasChanges

  function handleSave() {
    if (!payload.name) {
      toast.error('Enter a method name')
      return
    }
    onSave(payload)
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-6 overflow-hidden sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="shrink-0 text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">
              {isEditing ? 'Edit payment method' : 'Add payment method'}
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <div className="-mx-6 flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto px-6">
          <div className="space-y-1.5">
            <Label htmlFor="custom-method-name" className="text-sm font-medium">
              Method name
            </Label>
            <Input
              id="custom-method-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. GrabPay"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="custom-method-details" className="text-sm font-medium">
              Details
            </Label>
            <Textarea
              id="custom-method-details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="Account name, number, instructions, etc."
              className="min-h-10"
            />
          </div>

          <ChannelsField value={channels} onValueChange={setChannels} />
        </div>

        <DialogFooter className="shrink-0 flex-row">
          <Button
            variant="outline"
            className="h-10 px-3 flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button className="h-10 px-3 flex-1" onClick={handleSave} disabled={!canSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Manual payments page
// ---------------------------------------------------------------------------

export function AdminManualPaymentsPage() {
  const [defaults, setDefaults] = React.useState(defaultMethodState)
  const [openDefault, setOpenDefault] = React.useState<DefaultMethodId | null>(
    null,
  )

  const [customMethods, setCustomMethods] = React.useState<CustomMethod[]>([])
  const [customDialog, setCustomDialog] = React.useState<
    { method: CustomMethod | null } | null
  >(null)
  const [pendingDelete, setPendingDelete] = React.useState<CustomMethod | null>(
    null,
  )

  function saveDefault(id: DefaultMethodId, state: DefaultMethodState) {
    // Saving the dialog also enables the method.
    setDefaults((current) => ({
      ...current,
      [id]: { ...state, enabled: true },
    }))
    setOpenDefault(null)
    toast.success('Changes saved')
  }

  function toggleDefault(id: DefaultMethodId, checked: boolean) {
    const config = DEFAULT_METHODS.find((method) => method.id === id)!
    // Enabling an unconfigured method opens its dialog first; the switch turns
    // on only once the dialog is saved.
    if (checked && !defaultMethodConfigured(config, defaults[id])) {
      setOpenDefault(id)
      return
    }
    setDefaults((current) => ({
      ...current,
      [id]: { ...current[id], enabled: checked },
    }))
    toast.success('Changes saved')
  }

  function saveCustomMethod(draft: {
    name: string
    details: string
    channels: ChargeChannel[]
  }) {
    const editing = customDialog?.method ?? null
    setCustomMethods((current) =>
      editing
        ? current.map((method) =>
            method.id === editing.id ? { ...method, ...draft } : method,
          )
        : [...current, { id: nextId('custom'), ...draft }],
    )
    setCustomDialog(null)
    toast.success(editing ? 'Payment method updated' : 'Payment method added')
  }

  function confirmDelete() {
    if (pendingDelete === null) return
    setCustomMethods((current) =>
      current.filter((method) => method.id !== pendingDelete.id),
    )
    setPendingDelete(null)
    toast.success('Payment method deleted')
  }

  const openConfig = openDefault
    ? DEFAULT_METHODS.find((method) => method.id === openDefault)
    : null

  return (
    <>
      <div className="w-full">
        <header className="relative mb-8 flex items-center justify-center">
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label="Go back"
            onClick={() => navigateTo(PAYMENTS_PATH)}
            className="absolute left-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-normal text-neutral-900">
            Manual payments
          </h1>
        </header>

        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8">
          <p className="-mt-4 text-center text-sm text-muted-foreground">
            Manually verify payments and approve orders
          </p>
          <SettingsCard>
            {DEFAULT_METHODS.map((config) => (
              <SwitchNavRow
                key={config.id}
                label={config.name}
                icon={config.icon}
                description={defaultMethodSummary(config, defaults[config.id])}
                checked={defaults[config.id].enabled}
                onCheckedChange={(checked) => toggleDefault(config.id, checked)}
                onOpen={() => setOpenDefault(config.id)}
              />
            ))}
          </SettingsCard>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <TypographyLarge>Custom</TypographyLarge>
              <Button
                type="button"
                variant="outline"
                className="h-10 px-3 shrink-0"
                onClick={() => setCustomDialog({ method: null })}
              >
                <Plus className="size-4" />
                Add method
              </Button>
            </div>
            <SettingsCard>
              {customMethods.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No custom payment methods
                </p>
              ) : (
                customMethods.map((method) => (
                  <MethodRow
                    key={method.id}
                    icon={Wallet}
                    name={method.name}
                    summary={method.details || 'No details added'}
                    onEdit={() => setCustomDialog({ method })}
                    onDelete={() => setPendingDelete(method)}
                  />
                ))
              )}
            </SettingsCard>
          </div>
        </div>
      </div>

      {openConfig ? (
        <DefaultMethodDialog
          key={openConfig.id}
          config={openConfig}
          state={defaults[openConfig.id]}
          onOpenChange={(open) => {
            if (!open) setOpenDefault(null)
          }}
          onSave={(state) => saveDefault(openConfig.id, state)}
        />
      ) : null}

      {customDialog !== null ? (
        <CustomMethodDialog
          key={customDialog.method?.id ?? 'new'}
          initial={customDialog.method}
          onOpenChange={(open) => {
            if (!open) setCustomDialog(null)
          }}
          onSave={saveCustomMethod}
        />
      ) : null}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete payment method?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `${pendingDelete.name} will be removed and no longer offered at checkout.`
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
