import * as React from 'react'
import {
  ArrowLeft,
  Bookmark,
  CircleDollarSign,
  CircleHelp,
  Copy,
  FileText,
  Folder,
  GripVertical,
  ImagePlus,
  Images,
  Layers,
  Link2,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  ShoppingCart,
  Store,
  Tag,
  Trash2,
  Warehouse,
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
import { Card } from '@/components/ui/card'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/combobox'
import {
  Dialog,
  DialogBody,
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
import { cn } from '@/lib/utils'
import productImage from '@/assets/product.png'

import { CHANNELS, STORE_DOMAIN, slugify, type Channel } from '../catalog'
import { setRowDragImage, useReorderTransition } from '../reorder'
import { CustomQuestionDialog } from '../components/custom-question-dialog'
import {
  customCaption,
  type CustomQuestion,
  type CustomQuestionDraft,
} from '../custom-questions'

type IconComponent = React.ComponentType<{ className?: string }>

// Id source for the images, tiers and variants created during the session. A
// module-level counter would restart on a hot reload (component state survives
// it, module scope doesn't) and hand out an id a row already holds, so the
// uniqueness can't come from module state. Mirrors the Products page.
function nextId(prefix: string) {
  const unique =
    crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${prefix}-${unique}`
}

// The storefront address a product's slug resolves to.
function productLink(url: string) {
  return `https://${STORE_DOMAIN}/#${url}`
}

const PRODUCTS_PATH = '/admin/products'

// Client-side navigation matching the app's history-based router.
function navigateTo(path: string) {
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

// A product carries at most this many images, as the About Us section does.
const MAX_IMAGES = 4

// The color a label starts out in.
const DEFAULT_LABEL_COLOR = '#555555'

// The labels a merchant can put on a product, plus whatever they type in.
const LABEL_OPTIONS = [
  'Popular',
  'Few stocks left',
  'Limited time',
  'Sale',
  'New',
]

// There's no shared catalog behind these screens yet, so the categories field
// offers a sample set to pick from — anything else is typed in and created.
const CATEGORY_OPTIONS = ['Hot Drinks', 'Cold Drinks', 'Pastries', 'Mains']

type ProductImage = { id: string; name: string; url: string }

// A percentage off, a flat amount off each unit, or a flat amount off the order.
type DiscountType = 'percent' | 'off-each' | 'off-total'

type BulkDiscount = {
  id: string
  minQuantity: string
  discount: string
  discountType: DiscountType
}

// Which orders a multi-tier discount looks at: every variant's quantity added
// up, or only the quantity of the variant being bought.
type BulkDiscountScope = 'all-variants' | 'same-variant'

type BulkDiscountSettings = {
  tiers: BulkDiscount[]
  scope: BulkDiscountScope
}

type Variant = {
  id: string
  name: string
  price: string
  images: ProductImage[]
  description: string
  label: string
  labelColor: string
  // Only asked for while the product counts its stock by variant.
  inventory: string
}

// Whether stock is counted once for the product or separately per variant. Only
// offered once the product has a variant to count.
type InventoryScope = 'product' | 'variant'

const INVENTORY_SCOPES: { value: InventoryScope; label: string }[] = [
  { value: 'product', label: 'By product' },
  { value: 'variant', label: 'By variant' },
]

type ProductForm = {
  name: string
  url: string
  price: string
  images: ProductImage[]
  channels: Channel[]
  description: string
  categories: string[]
  label: string
  labelColor: string
  inventoryScope: InventoryScope
  inventory: string
  presetQuantities: string
  bulkDiscounts: BulkDiscountSettings
  variants: Variant[]
  // Questions asked when the product is added to an order — the same shape the
  // order form page uses for its custom questions.
  customizations: CustomQuestion[]
}

function emptyBulkDiscounts(): BulkDiscountSettings {
  return { tiers: [], scope: 'all-variants' }
}

const INITIAL_FORM: ProductForm = {
  name: '',
  url: '',
  price: '',
  images: [],
  // A new product is on sale everywhere until the merchant says otherwise,
  // matching the row the Products page creates.
  channels: ['online-store', 'pos', 'qr'],
  description: '',
  categories: [],
  label: '',
  labelColor: DEFAULT_LABEL_COLOR,
  inventoryScope: 'product',
  inventory: '',
  presetQuantities: '',
  bulkDiscounts: emptyBulkDiscounts(),
  variants: [],
  customizations: [],
}

// The product the edit page opens on. There's no catalog behind these screens
// yet, so it stands in for a fetch: the Products page hands over the row it was
// opened from (see `productFromHistory`) and the rest fills in from here.
const EDIT_FORM: ProductForm = {
  ...INITIAL_FORM,
  name: 'Iced Latte',
  url: 'iced-latte',
  price: '6.50',
  images: [{ id: 'seed-image', name: 'iced-latte.png', url: productImage }],
  description: 'Double shot of espresso poured over ice and fresh milk.',
  categories: ['Cold Drinks'],
  label: 'Popular',
  inventory: '24',
  variants: [
    {
      id: 'seed-variant-regular',
      name: 'Regular',
      price: '',
      images: [],
      description: '',
      label: '',
      labelColor: DEFAULT_LABEL_COLOR,
      inventory: '',
    },
    {
      id: 'seed-variant-large',
      name: 'Large',
      price: '8.00',
      images: [],
      description: '',
      label: '',
      labelColor: DEFAULT_LABEL_COLOR,
      inventory: '',
    },
  ],
}

// Which optional rows the edit page opens with: every one the product already
// has something to show in.
function enabledFieldsFor(form: ProductForm): Record<string, boolean> {
  return {
    description: form.description.trim() !== '',
    categories: form.categories.length > 0,
    label: form.label.trim() !== '',
    inventory: form.inventory.trim() !== '' || form.inventoryScope === 'variant',
    presetQuantities: form.presetQuantities.trim() !== '',
  }
}

// The Products page pushes the row being edited into history state, so the form
// opens on the product the merchant actually clicked.
function productFromHistory(): Partial<ProductForm> {
  const product = (window.history.state as { product?: unknown } | null)?.product
  if (!product || typeof product !== 'object') return {}
  const { name, price, channels } = product as {
    name?: string
    price?: number
    channels?: Channel[]
  }
  return {
    ...(name ? { name, url: slugify(name) } : {}),
    ...(typeof price === 'number' ? { price: price.toFixed(2) } : {}),
    ...(channels ? { channels } : {}),
  }
}

// The global <Toaster/> paints every toast with the success (green) palette, so
// the in-progress "Saving changes…" toast overrides those vars to the neutral
// popover palette; the follow-up "Changes saved" restores green explicitly
// (updating a toast by id keeps its prior inline style otherwise). Mirrors the
// store settings page, which saves field by field the same way.
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
const SAVE_TOAST_ID = 'product-form-save'

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
// Layout primitives — the add-order page's section/row shapes.
// ---------------------------------------------------------------------------

// A titled section: heading (with an optional right-aligned action) sits outside
// the card, fields stack as divided rows inside it. Form rows lose their
// dividers on mobile, where each row already stacks; list rows (variants) keep
// them at every width.
function Section({
  title,
  action,
  divided = false,
  children,
}: {
  title?: string
  action?: React.ReactNode
  divided?: boolean
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      {title || action ? (
        <div className="flex items-center justify-between gap-4">
          {title ? <TypographyLarge>{title}</TypographyLarge> : <span />}
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <Card className="gap-0 py-0 shadow-none">
        <div
          className={cn(
            'px-4 sm:px-6',
            divided
              ? 'divide-y divide-border/50'
              : 'divide-y-0 divide-border/50 sm:divide-y',
          )}
        >
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
      <Label
        htmlFor={htmlFor}
        className="flex items-center gap-3 text-sm font-medium sm:gap-6"
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        {label}
      </Label>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground sm:pl-10">
          {description}
        </p>
      ) : null}
    </div>
  )
}

// A single field row: label on the left and control on the right on desktop,
// stacked on mobile. Controls taller than their label (the image thumbnails)
// line up with the top of the row rather than its middle.
function FormRow({
  id,
  label,
  icon,
  description,
  align = 'center',
  // Set by rows whose top-aligned label needs a nudge to read as part of the
  // first line of its control.
  labelClassName,
  controlClassName = 'w-full sm:w-72 sm:shrink-0',
  children,
}: {
  // Omitted by rows whose control is a group rather than a single input, so the
  // label has nothing of its own to point at.
  id?: string
  label: string
  icon: IconComponent
  description?: string
  align?: 'center' | 'start'
  labelClassName?: string
  controlClassName?: string
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
      <div className={controlClassName}>{children}</div>
    </div>
  )
}

// An optional field: a ghost Plus button (off by default) sits where the
// control would be; clicking it reveals the input in that same spot/row.
function OptionalField({
  fieldKey,
  label,
  icon,
  description,
  align = 'center',
  enabled,
  onToggle,
  controlClassName = 'w-full sm:w-72 sm:shrink-0',
  children,
}: {
  fieldKey: string
  label: string
  icon: IconComponent
  description?: string
  // How the revealed control lines up with its label. Controls that outgrow a
  // single line (a textarea, a wrapping chip field) sit against the top of the
  // row instead of its middle.
  align?: 'center' | 'start'
  enabled: boolean
  onToggle: (value: boolean) => void
  controlClassName?: string
  // Left off by fields that have nothing to show until they're switched on.
  children?: React.ReactNode
}) {
  // Off: label on the left, Plus button on the right (where the control goes).
  if (!enabled) {
    return (
      <div className="flex items-center justify-between gap-6">
        <RowLabel label={label} icon={icon} description={description} />
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

  // On: label and control share one row, matching the always-on FormRow layout.
  return (
    <div
      className={cn(
        'flex flex-col gap-2 sm:flex-row sm:justify-between sm:gap-6',
        align === 'center' ? 'sm:items-center' : 'sm:items-start',
      )}
    >
      <RowLabel
        htmlFor={fieldKey}
        label={label}
        icon={icon}
        description={description}
        // Nudged down so a top-aligned label reads as part of the first line of
        // its control rather than sitting on its edge.
        className={align === 'start' ? 'sm:mt-2.5' : undefined}
      />
      <div className={controlClassName}>{children}</div>
    </div>
  )
}

// The Save button for a text field on the edit page, on its own row beneath the
// field once its value diverges from what's saved. Keeping it out of the field's
// control column lets the label stay vertically centered against its input.
// Selects, switches and dialogs save on change, so they never use it. Mirrors
// the store settings page.
function SaveRow({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-end pb-4">
      <Button type="button" size="lg" onClick={onClick}>
        Save
      </Button>
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

// The amount a price field suggests when it's empty.
const PRICE_PLACEHOLDER = '20'

// Currency input with a leading "$" affix.
function CurrencyInput({
  id,
  value,
  placeholder = PRICE_PLACEHOLDER,
  suffix,
  onChange,
}: {
  id: string
  value: string
  placeholder?: string
  suffix?: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
        $
      </span>
      {suffix ? (
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
          {suffix}
        </span>
      ) : null}
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn('h-10 pl-7 tabular-nums', suffix && 'pr-16')}
      />
    </div>
  )
}

// A stock count, closed out by the unit it's counting — "12 left".
function InventoryInput({
  id,
  value,
  // Set where the visible label drives a switch rather than this field.
  ariaLabel,
  onChange,
}: {
  id: string
  value: string
  ariaLabel?: string
  onChange: (value: string) => void
}) {
  return (
    <InputGroup className="h-10">
      <InputGroupInput
        id={id}
        aria-label={ariaLabel}
        inputMode="numeric"
        placeholder="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pl-3"
      />
      <InputGroupAddon align="inline-end" className="pr-3">
        left
      </InputGroupAddon>
    </InputGroup>
  )
}

// ---------------------------------------------------------------------------
// Fields
// ---------------------------------------------------------------------------

// The storefront slug, prefixed with the path it hangs off and closed out by a
// button that copies the address it resolves to. Mirrors the Link field in the
// Products page's category dialog.
function ProductLinkField({
  id,
  url,
  onChange,
}: {
  id: string
  url: string
  onChange: (url: string) => void
}) {
  return (
    <InputGroup className="h-10">
      <InputGroupAddon className="pl-3 text-muted-foreground">/#</InputGroupAddon>
      <InputGroupInput
        id={id}
        value={url}
        onChange={(event) => onChange(slugify(event.target.value))}
        placeholder="iced-latte"
      />
      <InputGroupAddon align="inline-end">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Copy link"
          onClick={() => {
            void navigator.clipboard?.writeText(productLink(url))
            toast.success('Link copied')
          }}
        >
          <Copy className="size-4 text-muted-foreground" />
        </Button>
      </InputGroupAddon>
    </InputGroup>
  )
}

// The sales channels the product is on, each row a switch. Mirrors the channels
// field in the payment method dialogs.
function ChannelsField({
  channels,
  onChange,
}: {
  channels: Channel[]
  onChange: (channels: Channel[]) => void
}) {
  function toggle(channel: Channel, on: boolean) {
    onChange(
      on
        ? [...channels, channel]
        : channels.filter((current) => current !== channel),
    )
  }

  return (
    <div className="w-full divide-y rounded-md border">
      {/* The whole row is the switch's label, so the channel name toggles it
          too. Mirrors the channels popover on the Products page. */}
      {CHANNELS.map((channel) => (
        <label
          key={channel.value}
          className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2.5"
        >
          <span className="flex items-center gap-2">
            <img src={channel.icon} alt="" className="size-5 shrink-0 rounded-sm" />
            <span className="text-sm">{channel.label}</span>
          </span>
          <Switch
            checked={channels.includes(channel.value)}
            onCheckedChange={(on) => toggle(channel.value, on)}
            aria-label={channel.label}
          />
        </label>
      ))}
    </div>
  )
}

// The hint shown under an images field's title, once there's an order to change.
function imagesHint(images: ProductImage[]) {
  return images.length > 1 ? 'Drag to reorder images' : undefined
}

// A row of 80x80 thumbnails (each removable) followed by an upload button. With
// more than one image the thumbnails become draggable to reorder them — the
// field's title carries the hint that says so. Mirrors the About Us images
// field.
function ImagesField({
  id,
  images,
  align = 'start',
  onChange,
}: {
  id: string
  images: ProductImage[]
  // Thumbnails sit against the right edge of a form row's control column, and
  // against the left inside a dialog where the field spans the full width.
  align?: 'start' | 'end'
  onChange: (images: ProductImage[]) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const dragIndex = React.useRef<number | null>(null)
  const reorderable = images.length > 1

  function addFiles(files: File[]) {
    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) return
    // Only accept what fits under the cap; flag the overflow.
    const accepted = files.slice(0, remaining)
    const added = accepted.map((file) => ({
      id: nextId('product-image'),
      name: file.name,
      url: URL.createObjectURL(file),
    }))
    onChange([...images, ...added])
    if (files.length > remaining) {
      toast.error(`You can add up to ${MAX_IMAGES} images`)
    } else {
      toast.success(added.length > 1 ? 'Images added' : 'Image added')
    }
  }

  function removeImage(imageId: string) {
    onChange(images.filter((image) => image.id !== imageId))
  }

  // Move the dragged thumbnail to the hovered position, keeping the rest in
  // order.
  function moveImage(from: number, to: number) {
    if (from === to) return
    const next = [...images]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next)
  }

  return (
    <>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(event) => {
          // Snapshot the files to an array before resetting the input: clearing
          // `value` empties the live FileList, so reading it afterwards is empty.
          const files = event.target.files ? Array.from(event.target.files) : []
          // Reset so selecting the same file again still fires onChange.
          event.target.value = ''
          if (files.length > 0) addFiles(files)
        }}
      />
      {/* Thumbnails start on the left on mobile, where the row stacks, and move
          to the right once they share a line with their label. */}
      <div
        className={cn(
          'flex flex-wrap gap-3',
          align === 'end' && 'justify-start sm:justify-end',
        )}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable={reorderable}
            onDragStart={() => {
              dragIndex.current = index
            }}
            onDragOver={(event) => {
              if (!reorderable || dragIndex.current === null) return
              event.preventDefault()
              if (dragIndex.current !== index) {
                moveImage(dragIndex.current, index)
                dragIndex.current = index
              }
            }}
            onDragEnd={() => {
              dragIndex.current = null
            }}
            className={cn(
              'relative size-20 overflow-hidden rounded-lg border border-border bg-muted',
              reorderable && 'cursor-grab active:cursor-grabbing',
            )}
          >
            <img
              src={image.url}
              alt={image.name}
              className="pointer-events-none size-full object-cover"
            />
            {reorderable ? (
              <span className="pointer-events-none absolute top-1 left-1 rounded bg-black/50 p-0.5 text-white">
                <GripVertical className="size-3.5" />
              </span>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label={`Remove ${image.name}`}
              onClick={() => removeImage(image.id)}
              className="absolute top-1 right-1 z-10 size-6"
            >
              <X className="text-neutral-700" />
            </Button>
          </div>
        ))}
        {images.length < MAX_IMAGES ? (
          <Button
            type="button"
            variant="outline"
            aria-label="Add images"
            onClick={() => inputRef.current?.click()}
            className="size-20 rounded-lg"
          >
            <ImagePlus className="size-5" />
          </Button>
        ) : null}
      </div>
    </>
  )
}

// The product's categories as removable chips, with an "Add" chip opening a
// searchable list that also creates whatever isn't on it. Mirrors the Change
// categories dialog on the Products page.
function CategoriesField({
  id,
  categories,
  options,
  onChange,
  onCreate,
  // Set when the field lives inside a dialog, so the popup mounts within it.
  container,
}: {
  id: string
  categories: string[]
  options: string[]
  onChange: (categories: string[]) => void
  onCreate: (category: string) => void
  container?: HTMLElement | null
}) {
  // Anchors the popover to the field so it spans the full available width.
  const anchor = React.useRef<HTMLDivElement | null>(null)
  const [query, setQuery] = React.useState('')

  const trimmed = query.trim()
  const canCreate =
    trimmed !== '' &&
    !options.some((option) => option.toLowerCase() === trimmed.toLowerCase())

  function createCategory() {
    if (!canCreate) return
    onCreate(trimmed)
    onChange([...categories, trimmed])
    setQuery('')
  }

  // Shared chip styling for the selected categories and the "Add" button. A
  // fixed height rather than padding, so a chip carrying an icon still lines up
  // with one that doesn't — and matches the 40px controls on the other rows.
  const chipClass =
    'inline-flex h-10 items-center gap-1.5 rounded-md bg-secondary px-3 text-sm font-normal text-secondary-foreground'

  return (
    <Combobox
      items={options}
      value={categories}
      onValueChange={(next: string[], details) => {
        // base-ui clears the whole selection on Escape — ignore that change.
        if (details.reason === 'escape-key') return
        onChange(next)
      }}
      inputValue={query}
      onInputValueChange={(next: string) => setQuery(next)}
      multiple
    >
      {/* Chips start on the left on mobile, where the row stacks, and flow from
          the right once they share a line with their label — lining the "Add"
          button up with the controls on the rows above. */}
      <div
        ref={anchor}
        className="flex flex-wrap items-center justify-start gap-1.5 sm:justify-end"
      >
        {categories.map((category) => (
          <span key={category} className={chipClass}>
            <Folder className="size-4 shrink-0 text-muted-foreground" />
            {category}
            <button
              type="button"
              aria-label={`Remove ${category}`}
              onClick={() =>
                onChange(categories.filter((current) => current !== category))
              }
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
              Add category
            </button>
          }
        />
      </div>
      <ComboboxContent anchor={anchor} container={container}>
        <ComboboxInput
          placeholder="Search categories…"
          showTrigger={false}
          className="m-3! h-10! bg-white! pl-2"
        />
        {!canCreate ? <ComboboxEmpty>No categories found.</ComboboxEmpty> : null}
        <ComboboxList>
          {(category: string) => (
            <ComboboxItem key={category} value={category}>
              <Folder className="text-muted-foreground" />
              {category}
            </ComboboxItem>
          )}
        </ComboboxList>
        {canCreate ? (
          <button
            type="button"
            // Keep input focus (and the popover open) when clicking.
            onMouseDown={(event) => event.preventDefault()}
            onClick={createCategory}
            className="flex w-full cursor-default items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden hover:bg-accent hover:text-accent-foreground"
          >
            <span>
              Create "<span className="font-medium">{trimmed}</span>"
            </span>
            <Plus className="size-4 shrink-0 text-muted-foreground" />
          </button>
        ) : null}
      </ComboboxContent>
    </Combobox>
  )
}

// A single label picked from the preset list, or typed in from the top of the
// dropdown, in the color set by the swatch on the left.
function LabelField({
  id,
  value,
  color,
  options,
  onChange,
  onColorChange,
  onCreate,
  container,
}: {
  id: string
  value: string
  color: string
  options: string[]
  onChange: (label: string) => void
  onColorChange: (color: string) => void
  onCreate: (label: string) => void
  container?: HTMLElement | null
}) {
  const anchor = React.useRef<HTMLDivElement | null>(null)
  const [query, setQuery] = React.useState(value)

  const trimmed = query.trim()
  const canCreate =
    trimmed !== '' &&
    !options.some((option) => option.toLowerCase() === trimmed.toLowerCase())

  function createLabel() {
    if (!canCreate) return
    onCreate(trimmed)
    onChange(trimmed)
  }

  return (
    <Combobox
      items={options}
      value={value || null}
      onValueChange={(next: string | null, details) => {
        // base-ui clears the selection on Escape — ignore that change.
        if (details.reason === 'escape-key') return
        onChange(next ?? '')
      }}
      inputValue={query}
      onInputValueChange={(next: string) => setQuery(next)}
    >
      <InputGroup ref={anchor} className="h-10">
        {/* The color the label is shown in on the storefront. Same native
            swatch the custom theme colors use on the Appearance page. */}
        <InputGroupAddon align="inline-start" className="pl-1.5">
          <input
            type="color"
            aria-label="Label color"
            value={color}
            onChange={(event) => onColorChange(event.target.value)}
            className="size-6 shrink-0 cursor-pointer appearance-none rounded-sm border border-input bg-transparent p-0 [&::-moz-color-swatch]:rounded-[3px] [&::-moz-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-[3px] [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
          />
        </InputGroupAddon>
        <ComboboxPrimitive.Input
          render={
            <InputGroupInput
              id={id}
              aria-label="Labels"
              placeholder="Select or add label"
            />
          }
        />
        <InputGroupAddon align="inline-end">
          <ComboboxTrigger />
        </InputGroupAddon>
      </InputGroup>
      <ComboboxContent anchor={anchor} container={container}>
        {/* Typing a name that isn't on the list turns the first row into the
            button that adds it. */}
        {canCreate ? (
          <button
            type="button"
            // Keep input focus (and the popover open) when clicking.
            onMouseDown={(event) => event.preventDefault()}
            onClick={createLabel}
            className="flex w-full cursor-default items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden hover:bg-accent hover:text-accent-foreground"
          >
            <span>
              Add "<span className="font-medium">{trimmed}</span>"
            </span>
            <Plus className="size-4 shrink-0 text-muted-foreground" />
          </button>
        ) : null}
        <ComboboxList>
          {(label: string) => (
            <ComboboxItem key={label} value={label}>
              {label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

// ---------------------------------------------------------------------------
// Bulk discounts
// ---------------------------------------------------------------------------

const DISCOUNT_TYPES: { value: DiscountType; label: string }[] = [
  { value: 'percent', label: 'Percent' },
  { value: 'off-each', label: 'Off each' },
  { value: 'off-total', label: 'Off total' },
]

const BULK_DISCOUNT_SCOPES: {
  value: BulkDiscountScope
  label: string
  description: string
}[] = [
  {
    value: 'all-variants',
    label: 'Any variant',
    description: 'Combined quantity of all variants is considered',
  },
  {
    value: 'same-variant',
    label: 'Same variant',
    description: 'Quantities of each variant are separately considered',
  },
]

function formatDiscount(tier: BulkDiscount) {
  const amount = tier.discount.trim() || '0'
  if (tier.discountType === 'percent') return `${amount}% off`
  return `$${amount} ${tier.discountType === 'off-each' ? 'off each' : 'off total'}`
}

// One saved discount, listed under the Bulk discounts row the way the time
// slots page lists its opening hours.
function tierSummary(tier: BulkDiscount) {
  return `${tier.minQuantity.trim() || '0'}+: ${formatDiscount(tier)}`
}

// Editing the discount tiers, opened from the Bulk discounts row. Mirrors the
// hours dialog on the time slots page: a stack of removable rows with an add
// button, and a sticky Cancel/Save footer.
function BulkDiscountsDialog({
  settings,
  saveLabel,
  onOpenChange,
  onSave,
}: {
  settings: BulkDiscountSettings
  saveLabel: string
  onOpenChange: (open: boolean) => void
  onSave: (settings: BulkDiscountSettings) => void
}) {
  const [draft, setDraft] = React.useState<BulkDiscountSettings>(() =>
    // Open on an empty row rather than nothing to act on.
    settings.tiers.length > 0
      ? settings
      : { ...settings, tiers: [newTier()] },
  )

  function newTier(): BulkDiscount {
    return {
      id: nextId('tier'),
      minQuantity: '',
      discount: '',
      discountType: 'percent',
    }
  }

  function updateTier<K extends keyof BulkDiscount>(
    id: string,
    key: K,
    value: BulkDiscount[K],
  ) {
    setDraft((current) => ({
      ...current,
      tiers: current.tiers.map((tier) =>
        tier.id === id ? { ...tier, [key]: value } : tier,
      ),
    }))
  }

  function addTier() {
    setDraft((current) => ({ ...current, tiers: [...current.tiers, newTier()] }))
  }

  function removeTier(id: string) {
    setDraft((current) => ({
      ...current,
      tiers: current.tiers.filter((tier) => tier.id !== id),
    }))
  }

  // Both numbers are needed for a tier to mean anything; blank rows are dropped
  // on save rather than blocking it.
  const filledTiers = draft.tiers.filter(
    (tier) => tier.minQuantity.trim() !== '' && tier.discount.trim() !== '',
  )
  const partialTiers = draft.tiers.some(
    (tier) =>
      (tier.minQuantity.trim() === '') !== (tier.discount.trim() === ''),
  )
  const payload: BulkDiscountSettings = { ...draft, tiers: filledTiers }
  // Leaving without a single discount is a legitimate outcome, so the only
  // thing that blocks saving is a row filled in halfway.
  const canSave = !partialTiers

  function handleSave() {
    if (partialTiers) {
      toast.error('Enter both a minimum quantity and a discount')
      return
    }
    onSave(payload)
  }

  // Shown as soon as there's a discount row to scope, filled in or not.
  const showScope = draft.tiers.length > 0

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">Bulk discounts</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <div className="space-y-3">
            {/* On a phone each discount is two stacked rows of its own, so they
                need more air between them to read as separate discounts. */}
            <div className="space-y-6 sm:space-y-3">
              {draft.tiers.map((tier, index) => (
                // On a phone the two fields stack, with the delete button
                // sharing the first row — so the discount field keeps the exact
                // width of the quantity above it. They line up side by side
                // from sm up.
                <div
                  key={tier.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-2 gap-y-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:gap-3"
                >
                  <div className="col-start-1 row-start-1 min-w-0 space-y-1.5">
                    <Label
                      htmlFor={`${tier.id}-quantity`}
                      className="text-sm font-normal text-muted-foreground"
                    >
                      Min. quantity
                    </Label>
                    <Input
                      id={`${tier.id}-quantity`}
                      inputMode="numeric"
                      placeholder="0"
                      value={tier.minQuantity}
                      onChange={(event) =>
                        updateTier(tier.id, 'minQuantity', event.target.value)
                      }
                      className="h-10"
                    />
                  </div>
                  <div className="col-start-1 row-start-2 min-w-0 space-y-1.5 sm:col-start-2 sm:row-start-1">
                    <Label
                      htmlFor={`${tier.id}-discount`}
                      className="text-sm font-normal text-muted-foreground"
                    >
                      Discount
                    </Label>
                    <InputGroup className="h-10">
                      {/* A flat discount is an amount of money; a percentage
                          isn't, so it goes without the currency. */}
                      {tier.discountType === 'percent' ? null : (
                        <InputGroupAddon align="inline-start" className="pl-3">
                          $
                        </InputGroupAddon>
                      )}
                      <InputGroupInput
                        id={`${tier.id}-discount`}
                        inputMode="decimal"
                        placeholder="0"
                        value={tier.discount}
                        onChange={(event) =>
                          updateTier(tier.id, 'discount', event.target.value)
                        }
                        className={
                          tier.discountType === 'percent' ? 'pl-3' : undefined
                        }
                      />
                      <InputGroupAddon align="inline-end">
                        <Select
                          value={tier.discountType}
                          onValueChange={(value) =>
                            updateTier(
                              tier.id,
                              'discountType',
                              value as DiscountType,
                            )
                          }
                        >
                          <SelectTrigger
                            aria-label="Discount type"
                            className="h-full gap-1 border-0 bg-transparent px-0 text-foreground shadow-none focus-visible:ring-0 dark:bg-transparent"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent align="end">
                            {DISCOUNT_TYPES.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="col-start-2 row-start-1 size-10 shrink-0 text-muted-foreground sm:col-start-3"
                    aria-label={`Remove discount ${index + 1}`}
                    onClick={() => removeTier(tier.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2 px-3"
              onClick={addTier}
            >
              <Plus className="size-4" />
              Add discount
            </Button>
          </div>

          {showScope ? (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Apply when ordering</Label>
              <RadioGroup
                aria-label="Apply when ordering"
                value={draft.scope}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    scope: value as BulkDiscountScope,
                  }))
                }
                className="flex w-full flex-col gap-0 divide-y overflow-hidden rounded-lg border"
              >
                {BULK_DISCOUNT_SCOPES.map((option) => (
                  <FieldLabel
                    key={option.value}
                    htmlFor={`bulk-scope-${option.value}`}
                    className="w-full flex-col items-start gap-1 rounded-none px-3 py-3 font-normal transition-colors hover:bg-muted/50 has-[[data-checked]]:bg-primary/5"
                  >
                    <div className="flex w-full items-center justify-between gap-3">
                      <FieldTitle>{option.label}</FieldTitle>
                      <RadioGroupItem
                        value={option.value}
                        id={`bulk-scope-${option.value}`}
                      />
                    </div>
                    <FieldDescription>{option.description}</FieldDescription>
                  </FieldLabel>
                ))}
              </RadioGroup>
            </div>
          ) : null}
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
            onClick={handleSave}
            disabled={!canSave}
          >
            {saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

// Everything the dialog edits; the page assigns the id on save.
type VariantDraft = Omit<Variant, 'id'>

function defaultVariantDraft(): VariantDraft {
  return {
    name: '',
    price: '',
    images: [],
    description: '',
    label: '',
    labelColor: DEFAULT_LABEL_COLOR,
    inventory: '',
  }
}

// The muted line under a variant's name: what it costs, and nothing else — the
// rest of its details live in the dialog.
function variantSummary(variant: Variant) {
  const price = variant.price.trim()
  return price === '' || Number(price) === 0 ? 'No extra charge' : `$${price}`
}

// A single row in the Variants and Customizations lists: name + summary with an
// edit/delete menu, which "Reorder" swaps for a drag handle. Mirrors the
// delivery method rows on the fulfillment page, and the product rows' reorder
// mode on the Products page.
function ListRow({
  icon: Icon,
  name,
  summary,
  reorderMode,
  dragging,
  rowRef,
  onDragStart,
  onDragOver,
  onDragEnd,
  onEdit,
  onDelete,
}: {
  icon: IconComponent
  name: string
  summary: string
  reorderMode: boolean
  // While this row is the one being dragged, its in-list instance is hidden
  // and the cursor carries the floating copy `setRowDragImage` made of it.
  dragging: boolean
  // Registers the row with the list's FLIP transition, so the rows it displaces
  // slide into their new spots.
  rowRef: (node: HTMLElement | null) => void
  onDragStart: () => void
  onDragOver: (event: React.DragEvent<HTMLElement>) => void
  onDragEnd: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div
      ref={rowRef}
      draggable={reorderMode}
      onDragStart={(event) => {
        setRowDragImage(event)
        onDragStart()
      }}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={cn(
        'flex items-start justify-between gap-4 py-4',
        reorderMode && 'cursor-grab active:cursor-grabbing',
        dragging && 'opacity-0',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-4 md:gap-6">
          {reorderMode ? (
            <GripVertical className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <Icon className="size-4 shrink-0 text-muted-foreground" />
          )}
          <p className="min-w-0 flex-1 truncate text-sm font-medium">{name}</p>
        </div>
        {/* Summary aligns with the icon on mobile and under the name on desktop. */}
        <p className="mt-1 truncate text-sm text-muted-foreground md:pl-10">
          {summary}
        </p>
      </div>
      {/* Editing and deleting are out of reach while dragging; the spacer keeps
          the rows the same width either way. */}
      {reorderMode ? (
        <span className="size-10 shrink-0" aria-hidden />
      ) : (
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
      )}
    </div>
  )
}

// Every optional field in the variant dialog is a label + switch, with the
// control revealed beneath it. Declared out here so typing in a revealed field
// doesn't remount it (and drop focus) on every render.
function OptionalSection({
  id,
  label,
  description,
  enabled,
  onToggle,
  children,
}: {
  id: string
  label: string
  description?: string
  enabled: boolean
  onToggle: (value: boolean) => void
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          {/* The label drives the switch, not the control it reveals — clicking
              the field's name is how you turn it on. */}
          <Label htmlFor={`${id}-enabled`} className="text-sm font-medium">
            {label}
          </Label>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <Switch
          id={`${id}-enabled`}
          aria-label={label}
          checked={enabled}
          onCheckedChange={onToggle}
        />
      </div>
      {enabled ? children : null}
    </div>
  )
}

// The add/edit dialog for a variant. Only the name is required; the rest sit
// behind switches, as the optional fields in the other dialogs do.
function VariantDialog({
  initial,
  showInventory,
  pricePlaceholder,
  labelOptions,
  saveLabel,
  onCreateLabel,
  onOpenChange,
  onSave,
}: {
  initial: Variant | null
  // Set while the product counts its stock by variant, so each variant carries
  // its own count.
  showInventory: boolean
  // The product's own price, suggested for a variant that doesn't set one.
  pricePlaceholder: string
  labelOptions: string[]
  saveLabel: string
  onCreateLabel: (label: string) => void
  onOpenChange: (open: boolean) => void
  onSave: (draft: VariantDraft) => void
}) {
  const isEditing = initial !== null
  // The popup of a field inside the dialog mounts here rather than at <body>: a
  // modal dialog parks `pointer-events: none` on the body and only lifts it for
  // its own content, and its focus trap and outside-click dismissal both go by
  // DOM containment. State rather than a ref so the portal re-resolves once the
  // node exists.
  const [content, setContent] = React.useState<HTMLDivElement | null>(null)

  // The saved draft to diff against, so editing requires an actual change.
  const initialDraft = React.useMemo<VariantDraft | null>(() => {
    if (!initial) return null
    const rest: Partial<Variant> = { ...initial }
    delete rest.id
    return rest as VariantDraft
  }, [initial])

  const [draft, setDraft] = React.useState<VariantDraft>(
    () => initialDraft ?? defaultVariantDraft(),
  )
  // Optional fields default on when the variant already carries them.
  const [inventoryEnabled, setInventoryEnabled] = React.useState(
    (initial?.inventory.trim() ?? '') !== '',
  )
  const [descriptionEnabled, setDescriptionEnabled] = React.useState(
    (initial?.description.trim() ?? '') !== '',
  )
  const [labelEnabled, setLabelEnabled] = React.useState(
    (initial?.label ?? '') !== '',
  )

  function update<K extends keyof VariantDraft>(key: K, value: VariantDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  // A switch turned off drops the value it was holding.
  const payload: VariantDraft = {
    name: draft.name.trim(),
    // Price and images have no switch — left empty, the variant just falls back
    // on the product's own.
    price: draft.price.trim(),
    images: draft.images,
    description: descriptionEnabled ? draft.description.trim() : '',
    label: labelEnabled ? draft.label : '',
    labelColor: labelEnabled ? draft.labelColor : DEFAULT_LABEL_COLOR,
    // A count only means something while the product tracks stock by variant.
    inventory: showInventory && inventoryEnabled ? draft.inventory.trim() : '',
  }
  const changed = JSON.stringify(payload) !== JSON.stringify(initialDraft)
  const canSave = payload.name !== '' && (!isEditing || changed)

  function handleSave() {
    if (payload.name === '') {
      toast.error('Enter a variant name')
      return
    }
    onSave(payload)
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent
        ref={setContent}
        className="sm:max-w-lg [&_[data-slot=dialog-close]]:size-10"
      >
        <DialogHeader className="text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">
              {isEditing ? 'Edit variant' : 'Add variant'}
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="variant-name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="variant-name"
              value={draft.name}
              onChange={(event) => update('name', event.target.value)}
              placeholder="Regular"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="variant-price" className="text-sm font-medium">
              Price
            </Label>
            <CurrencyInput
              id="variant-price"
              value={draft.price}
              placeholder={pricePlaceholder}
              onChange={(value) => update('price', value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="variant-images" className="text-sm font-medium">
              Images
            </Label>
            {imagesHint(draft.images) ? (
              <p className="text-sm text-muted-foreground">
                {imagesHint(draft.images)}
              </p>
            ) : null}
            <ImagesField
              id="variant-images"
              images={draft.images}
              onChange={(images) => update('images', images)}
            />
          </div>

          <OptionalSection
            id="variant-description"
            label="Description"
            enabled={descriptionEnabled}
            onToggle={setDescriptionEnabled}
          >
            <Textarea
              id="variant-description"
              aria-label="Description"
              // One row tall to start with; `field-sizing-content` grows it from
              // there as the merchant types.
              rows={1}
              value={draft.description}
              onChange={(event) => update('description', event.target.value)}
              placeholder="Describe this variant"
              className="min-h-10"
            />
          </OptionalSection>

          <OptionalSection
            id="variant-label"
            label="Labels"
            enabled={labelEnabled}
            onToggle={setLabelEnabled}
          >
            <LabelField
              id="variant-label"
              value={draft.label}
              color={draft.labelColor}
              options={labelOptions}
              onChange={(label) => update('label', label)}
              onColorChange={(color) => update('labelColor', color)}
              onCreate={onCreateLabel}
              container={content}
            />
          </OptionalSection>

          {showInventory ? (
            <OptionalSection
              id="variant-inventory"
              label="Inventory"
              enabled={inventoryEnabled}
              onToggle={setInventoryEnabled}
            >
              <InventoryInput
                id="variant-inventory"
                ariaLabel="Inventory"
                value={draft.inventory}
                onChange={(value) => update('inventory', value)}
              />
            </OptionalSection>
          ) : null}
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
            onClick={handleSave}
            disabled={!canSave}
          >
            {saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function AdminProductFormPage({
  title = 'Add product',
  // Adding collects the whole product and saves it in one go from the footer.
  // Editing saves as it goes: selects, switches and dialogs commit on change,
  // while text fields wait for the Save button under them.
  mode = 'add',
}: {
  title?: string
  mode?: 'add' | 'edit'
}) {
  const isEditing = mode === 'edit'
  // Editing commits a dialog's changes on the spot, so its button saves. Adding
  // only folds them into the draft the footer submits later — nothing is saved
  // yet, so it closes the dialog with "Done" instead.
  const dialogSaveLabel = isEditing ? 'Save' : 'Done'
  const initialForm = React.useMemo<ProductForm>(
    () => (isEditing ? { ...EDIT_FORM, ...productFromHistory() } : INITIAL_FORM),
    [isEditing],
  )

  const [form, setForm] = React.useState<ProductForm>(initialForm)
  // What's been saved. Text fields diverge from it until their Save button
  // commits them; everything else commits as it changes. Adding never writes to
  // it, so the whole form reads as unsaved until the footer submits.
  const [saved, setSaved] = React.useState<ProductForm>(initialForm)
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>(() =>
    isEditing ? enabledFieldsFor(initialForm) : {},
  )
  // The link slug mirrors the name until the merchant edits it directly — an
  // existing product already has the link it was published under.
  const [urlEdited, setUrlEdited] = React.useState(isEditing)
  // Categories and labels typed into their fields join the options for the rest
  // of the session.
  const [categoryOptions, setCategoryOptions] = React.useState(CATEGORY_OPTIONS)
  const [labelOptions, setLabelOptions] = React.useState(LABEL_OPTIONS)
  const [bulkDiscountsOpen, setBulkDiscountsOpen] = React.useState(false)
  const [variantDialog, setVariantDialog] = React.useState<
    { mode: 'add' } | { mode: 'edit'; variant: Variant } | null
  >(null)
  const [pendingDeleteVariant, setPendingDeleteVariant] =
    React.useState<Variant | null>(null)
  // "Reorder" swaps each variant's manage menu for a drag handle, as the
  // Products page does for its rows.
  const [variantReorderMode, setVariantReorderMode] = React.useState(false)
  // The row the cursor is carrying, hidden in place while its floating copy
  // moves. Both lists drag the way the Products page's rows do.
  const [draggingVariantId, setDraggingVariantId] = React.useState<string | null>(
    null,
  )
  const registerVariantRow = useReorderTransition()
  const [customizationDialog, setCustomizationDialog] = React.useState<
    { mode: 'add' } | { mode: 'edit'; customization: CustomQuestion } | null
  >(null)
  const [pendingDeleteCustomization, setPendingDeleteCustomization] =
    React.useState<CustomQuestion | null>(null)
  const [customizationReorderMode, setCustomizationReorderMode] =
    React.useState(false)
  const [draggingCustomizationId, setDraggingCustomizationId] = React.useState<
    string | null
  >(null)
  const registerCustomizationRow = useReorderTransition()

  // A typed value: only the working form moves, so a Save button (edit) or the
  // footer (add) still has something to commit.
  function update<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  // The same change applied to the working form and, while editing, to the
  // saved copy — for changes that commit the moment they're made. Silent, so
  // callers that report the save themselves (the dialogs) can use it too.
  function commit(apply: (current: ProductForm) => ProductForm) {
    setForm(apply)
    if (isEditing) setSaved(apply)
  }

  // A select, switch or chip: committed on change and reported as saved.
  function updateAndSave<K extends keyof ProductForm>(
    key: K,
    value: ProductForm[K],
  ) {
    commit((current) => ({ ...current, [key]: value }))
    if (isEditing) runSaveFeedback()
  }

  // A text field's Save button: copy the named fields over from the working
  // form and report it.
  function saveFields(keys: (keyof ProductForm)[]) {
    setSaved((current) => {
      const next = { ...current }
      for (const key of keys) Object.assign(next, { [key]: form[key] })
      return next
    })
    runSaveFeedback()
  }

  // Whether a text field still holds an edit its Save button hasn't committed.
  function isFieldDirty(keys: (keyof ProductForm)[]) {
    return isEditing && keys.some((key) => form[key] !== saved[key])
  }

  function toggleField(key: string, value: boolean) {
    setEnabled((current) => ({ ...current, [key]: value }))
  }

  function updateInventoryScope(scope: InventoryScope) {
    if (scope === 'variant') {
      // Counting by variant leaves the row with nothing to press Save on, so
      // the choice commits itself — and drops the product-wide count on the way
      // out, so a stale number can't linger behind it.
      commit((current) => ({ ...current, inventoryScope: scope, inventory: '' }))
      if (isEditing) runSaveFeedback()
      return
    }
    // Counting by product hands the row a count and the Save button under it,
    // so the choice waits and is committed by that button along with the count.
    update('inventoryScope', scope)
  }

  function updateName(name: string) {
    setForm((current) => ({
      ...current,
      name,
      url: urlEdited ? current.url : slugify(name),
    }))
  }

  // --- Variants ------------------------------------------------------------

  const dragIndex = React.useRef<number | null>(null)

  function moveVariant(from: number, to: number) {
    if (from === to) return
    commit((current) => {
      const next = [...current.variants]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return { ...current, variants: next }
    })
  }

  function saveVariant(draft: VariantDraft) {
    const editingId =
      variantDialog?.mode === 'edit' ? variantDialog.variant.id : null
    // Minted out here: `commit` runs its change against both copies of the
    // form, and a new variant has to land in each under the same id.
    const saveable = { ...draft, id: editingId ?? nextId('variant') }
    commit((current) => ({
      ...current,
      variants: editingId
        ? current.variants.map((variant) =>
            variant.id === editingId ? saveable : variant,
          )
        : [...current.variants, saveable],
    }))
    setVariantDialog(null)
    toast.success(editingId ? 'Variant updated' : 'Variant added')
  }

  function confirmDeleteVariant() {
    if (!pendingDeleteVariant) return
    const { id } = pendingDeleteVariant
    commit((current) => {
      const variants = current.variants.filter((variant) => variant.id !== id)
      return {
        ...current,
        variants,
        // The last variant leaving takes the by-variant count with it.
        inventoryScope: variants.length === 0 ? 'product' : current.inventoryScope,
      }
    })
    // Nothing left to drag against once a single variant remains.
    if (form.variants.length <= 2) setVariantReorderMode(false)
    setPendingDeleteVariant(null)
    toast.success('Variant deleted')
  }

  // --- Customizations ------------------------------------------------------

  const customizationDragIndex = React.useRef<number | null>(null)

  function moveCustomization(from: number, to: number) {
    if (from === to) return
    commit((current) => {
      const next = [...current.customizations]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return { ...current, customizations: next }
    })
  }

  function saveCustomization(draft: CustomQuestionDraft) {
    const editingId =
      customizationDialog?.mode === 'edit'
        ? customizationDialog.customization.id
        : null
    // Minted out here so both copies of the form get the same id — see
    // `saveVariant`.
    const saveable = { ...draft, id: editingId ?? nextId('customization') }
    commit((current) => ({
      ...current,
      customizations: editingId
        ? current.customizations.map((customization) =>
            customization.id === editingId ? saveable : customization,
          )
        : [...current.customizations, saveable],
    }))
    setCustomizationDialog(null)
    toast.success(editingId ? 'Customization updated' : 'Customization added')
  }

  function confirmDeleteCustomization() {
    if (!pendingDeleteCustomization) return
    const { id } = pendingDeleteCustomization
    commit((current) => ({
      ...current,
      customizations: current.customizations.filter(
        (customization) => customization.id !== id,
      ),
    }))
    // Nothing left to drag against once a single customization remains.
    if (form.customizations.length <= 2) setCustomizationReorderMode(false)
    setPendingDeleteCustomization(null)
    toast.success('Customization deleted')
  }

  // --- Save / navigation ---------------------------------------------------

  // Unsaved changes are whatever the working form holds that the saved copy
  // doesn't: everything, while adding a product that hasn't been submitted; the
  // uncommitted text fields while editing one.
  const isDirty = React.useMemo(
    () => JSON.stringify(form) !== JSON.stringify(saved),
    [form, saved],
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

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    // An existing product has no submit of its own — each field is saved where
    // it sits, so Enter in a text field shouldn't file the whole form.
    if (isEditing) return
    if (form.name.trim() === '') {
      toast.error('Enter a product name')
      return
    }
    toast.success('Product added')
    navigateTo(PRODUCTS_PATH)
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

  const hasVariants = form.variants.length > 0
  // Only a product with variants can hand the count off to them.
  const countsByVariant = hasVariants && form.inventoryScope === 'variant'

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
            {/* Each text field keeps its Save button in the same divider group
                as the field it commits. */}
            <div>
              <FormRow id="product-name" label="Product name" icon={Package}>
                <Input
                  id="product-name"
                  value={form.name}
                  onChange={(event) => updateName(event.target.value)}
                  placeholder="e.g. Iced Latte"
                  className="h-10"
                />
              </FormRow>
              {isFieldDirty(['name']) ? (
                <SaveRow onClick={() => saveFields(['name'])} />
              ) : null}
            </div>
            <div>
              <FormRow id="product-price" label="Price" icon={CircleDollarSign}>
                <CurrencyInput
                  id="product-price"
                  value={form.price}
                  // With variants of their own prices, the product's price is
                  // the one it starts from.
                  suffix={hasVariants ? 'and up' : undefined}
                  onChange={(value) => update('price', value)}
                />
              </FormRow>
              {isFieldDirty(['price']) ? (
                <SaveRow onClick={() => saveFields(['price'])} />
              ) : null}
            </div>
            <FormRow
              id="product-images"
              label="Images"
              icon={Images}
              description={imagesHint(form.images)}
              align="start"
              labelClassName="sm:mt-2.5"
            >
              <ImagesField
                id="product-images"
                images={form.images}
                align="end"
                onChange={(images) => updateAndSave('images', images)}
              />
            </FormRow>
            <FormRow
              label="Enabled"
              icon={Store}
              align="start"
              labelClassName="sm:mt-2.5"
            >
              <ChannelsField
                channels={form.channels}
                onChange={(channels) => updateAndSave('channels', channels)}
              />
            </FormRow>
          </Section>

          <Section title="Appearance">
            <div>
              <OptionalFormRow
                fieldKey="product-description"
                label="Description"
                icon={FileText}
                align="start"
                enabled={!!enabled.description}
                onToggle={(value) => toggleField('description', value)}
              >
                <Textarea
                  id="product-description"
                  // One row tall to start with; `field-sizing-content` grows it
                  // from there as the merchant types.
                  rows={1}
                  value={form.description}
                  onChange={(event) => update('description', event.target.value)}
                  placeholder="Describe the product details"
                  className="min-h-10"
                />
              </OptionalFormRow>
              {isFieldDirty(['description']) ? (
                <SaveRow onClick={() => saveFields(['description'])} />
              ) : null}
            </div>
            <OptionalFormRow
              fieldKey="product-categories"
              label="Categories"
              icon={Folder}
              align="start"
              enabled={!!enabled.categories}
              onToggle={(value) => toggleField('categories', value)}
            >
              <CategoriesField
                id="product-categories"
                categories={form.categories}
                options={categoryOptions}
                onChange={(categories) =>
                  updateAndSave('categories', categories)
                }
                onCreate={(category) =>
                  setCategoryOptions((current) => [...current, category])
                }
              />
            </OptionalFormRow>
            <OptionalFormRow
              fieldKey="product-label"
              label="Labels"
              icon={Bookmark}
              enabled={!!enabled.label}
              onToggle={(value) => toggleField('label', value)}
            >
              <LabelField
                id="product-label"
                value={form.label}
                color={form.labelColor}
                options={labelOptions}
                onChange={(label) => updateAndSave('label', label)}
                onColorChange={(color) => updateAndSave('labelColor', color)}
                onCreate={(label) =>
                  setLabelOptions((current) => [...current, label])
                }
              />
            </OptionalFormRow>
          </Section>

          <Section title="Advanced">
            <div>
              <FormRow
                id="product-url"
                label="Product link"
                icon={Link2}
                description="For online store"
              >
                <ProductLinkField
                  id="product-url"
                  url={form.url}
                  onChange={(url) => {
                    setUrlEdited(true)
                    update('url', url)
                  }}
                />
              </FormRow>
              {isFieldDirty(['url']) ? (
                <SaveRow onClick={() => saveFields(['url'])} />
              ) : null}
            </div>
            <div>
              <OptionalFormRow
                fieldKey="product-inventory"
                label="Inventory"
                icon={Warehouse}
                description="Set units available in stock"
                // With variants in play the control grows a choice above the
                // count, so the label moves to the top of the row.
                align={hasVariants ? 'start' : 'center'}
                enabled={!!enabled.inventory}
                onToggle={(value) => toggleField('inventory', value)}
              >
                <div className="space-y-3">
                  {hasVariants ? (
                    <RadioGroup
                      aria-label="Track inventory"
                      value={form.inventoryScope}
                      onValueChange={(value) =>
                        updateInventoryScope(value as InventoryScope)
                      }
                      className="flex w-full flex-col gap-0 divide-y overflow-hidden rounded-lg border"
                    >
                      {INVENTORY_SCOPES.map((option) => (
                        <FieldLabel
                          key={option.value}
                          htmlFor={`inventory-scope-${option.value}`}
                          className="flex w-full items-center justify-between gap-1 rounded-none px-3 py-3 text-sm font-normal transition-colors hover:bg-muted/50 has-[[data-checked]]:bg-primary/5"
                        >
                          {option.label}
                          <RadioGroupItem
                            value={option.value}
                            id={`inventory-scope-${option.value}`}
                          />
                        </FieldLabel>
                      ))}
                    </RadioGroup>
                  ) : null}
                  {/* Counting by variant moves the count into each variant's own
                      dialog, so this row says where to find it instead. */}
                  {countsByVariant ? (
                    <p className="text-sm text-muted-foreground sm:text-right">
                      Set in the Variants section below
                    </p>
                  ) : (
                    <InventoryInput
                      id="product-inventory"
                      value={form.inventory}
                      onChange={(value) => update('inventory', value)}
                    />
                  )}
                </div>
              </OptionalFormRow>
              {/* Counting by product keeps the button on screen the whole time
                  the row is showing a count, and that one button commits both
                  the count and the choice above it — neither saves on its own.
                  (Counting by variant has nothing left here to save, so that
                  choice commits itself.) */}
              {isEditing && !!enabled.inventory && !countsByVariant ? (
                <SaveRow
                  onClick={() => saveFields(['inventory', 'inventoryScope'])}
                />
              ) : null}
            </div>
            <div>
              <OptionalFormRow
                fieldKey="product-preset-quantities"
                label="Preset quantities"
                icon={ShoppingCart}
                description="Set quantities to choose from"
                enabled={!!enabled.presetQuantities}
                onToggle={(value) => toggleField('presetQuantities', value)}
              >
                <Input
                  id="product-preset-quantities"
                  value={form.presetQuantities}
                  onChange={(event) =>
                    update('presetQuantities', event.target.value)
                  }
                  placeholder="5,10,15"
                  className="h-10"
                />
              </OptionalFormRow>
              {isFieldDirty(['presetQuantities']) ? (
                <SaveRow
                  onClick={() => saveFields(['presetQuantities'])}
                />
              ) : null}
            </div>
            {/* Once set up, the discounts are listed under the row with a pencil
                to reopen the dialog — the shape the time slots page uses for its
                opening hours. The scope stays in the dialog. With no discounts
                to list there's nothing to edit, so the row falls back to the
                Plus button every other optional field starts with. */}
            {form.bulkDiscounts.tiers.length > 0 ? (
              <div className="space-y-2 py-4">
                <div className="flex items-start justify-between gap-4">
                  <RowLabel
                    label="Bulk discounts"
                    icon={Tag}
                    description="Set sale prices on bulk orders"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10 shrink-0 text-muted-foreground"
                    aria-label="Edit bulk discounts"
                    onClick={() => setBulkDiscountsOpen(true)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </div>
                <div className="space-y-1 text-right text-sm text-muted-foreground">
                  {form.bulkDiscounts.tiers.map((tier) => (
                    <div key={tier.id}>{tierSummary(tier)}</div>
                  ))}
                </div>
              </div>
            ) : (
              <OptionalFormRow
                fieldKey="product-bulk-discounts"
                label="Bulk discounts"
                icon={Tag}
                description="Set sale prices on bulk orders"
                enabled={false}
                // There's nothing to reveal in the row itself, so the Plus goes
                // straight to the dialog that fills the discounts in.
                onToggle={() => setBulkDiscountsOpen(true)}
              />
            )}
          </Section>

          <Section
            title="Variants"
            divided
            action={
              <div className="flex items-center gap-2">
                {/* Two rows are the least that can trade places, so below that
                    the button isn't offered at all. */}
                {variantReorderMode || form.variants.length > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 px-3"
                    onClick={() => setVariantReorderMode((current) => !current)}
                  >
                    {variantReorderMode ? 'Done' : 'Reorder'}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="secondary"
                  className="h-10 px-3"
                  // Adding mid-drag would drop a row into a list being sorted.
                  disabled={variantReorderMode}
                  onClick={() => setVariantDialog({ mode: 'add' })}
                >
                  <Plus className="size-4" />
                  Add variant
                </Button>
              </div>
            }
          >
            {form.variants.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No variants
              </p>
            ) : (
              form.variants.map((variant, index) => (
                <ListRow
                  key={variant.id}
                  icon={Layers}
                  name={variant.name}
                  summary={variantSummary(variant)}
                  reorderMode={variantReorderMode}
                  dragging={draggingVariantId === variant.id}
                  rowRef={(node) => registerVariantRow(variant.id, node)}
                  onDragStart={() => {
                    dragIndex.current = index
                    setDraggingVariantId(variant.id)
                  }}
                  onDragOver={(event) => {
                    if (!variantReorderMode || dragIndex.current === null) return
                    event.preventDefault()
                    if (dragIndex.current !== index) {
                      moveVariant(dragIndex.current, index)
                      dragIndex.current = index
                    }
                  }}
                  onDragEnd={() => {
                    dragIndex.current = null
                    setDraggingVariantId(null)
                  }}
                  onEdit={() => setVariantDialog({ mode: 'edit', variant })}
                  onDelete={() => setPendingDeleteVariant(variant)}
                />
              ))
            )}
          </Section>

          {/* Customizations are the order form's custom questions, asked about
              this product rather than the order — so the section is shaped like
              Variants and opens the same question dialog. */}
          <Section
            title="Customizations"
            divided
            action={
              <div className="flex items-center gap-2">
                {customizationReorderMode || form.customizations.length > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 px-3"
                    onClick={() =>
                      setCustomizationReorderMode((current) => !current)
                    }
                  >
                    {customizationReorderMode ? 'Done' : 'Reorder'}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="secondary"
                  className="h-10 px-3"
                  disabled={customizationReorderMode}
                  onClick={() => setCustomizationDialog({ mode: 'add' })}
                >
                  <Plus className="size-4" />
                  Add customization
                </Button>
              </div>
            }
          >
            {form.customizations.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No customizations
              </p>
            ) : (
              form.customizations.map((customization, index) => (
                <ListRow
                  key={customization.id}
                  icon={CircleHelp}
                  name={customization.title}
                  summary={customCaption(customization)}
                  reorderMode={customizationReorderMode}
                  dragging={draggingCustomizationId === customization.id}
                  rowRef={(node) =>
                    registerCustomizationRow(customization.id, node)
                  }
                  onDragStart={() => {
                    customizationDragIndex.current = index
                    setDraggingCustomizationId(customization.id)
                  }}
                  onDragOver={(event) => {
                    if (
                      !customizationReorderMode ||
                      customizationDragIndex.current === null
                    ) {
                      return
                    }
                    event.preventDefault()
                    if (customizationDragIndex.current !== index) {
                      moveCustomization(customizationDragIndex.current, index)
                      customizationDragIndex.current = index
                    }
                  }}
                  onDragEnd={() => {
                    customizationDragIndex.current = null
                    setDraggingCustomizationId(null)
                  }}
                  onEdit={() =>
                    setCustomizationDialog({ mode: 'edit', customization })
                  }
                  onDelete={() => setPendingDeleteCustomization(customization)}
                />
              ))
            )}
          </Section>
        </div>

        {/* Editing saves field by field, so it has nothing left for a footer
            to submit. */}
        {!isEditing && isDirty ? (
          <div className="sticky bottom-4 z-30 mx-auto mt-8 flex w-full max-w-[640px] items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary px-4 py-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <span className="text-sm font-medium text-muted-foreground">
              Unsaved changes
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                className="h-10"
                onClick={handleBack}
              >
                Cancel
              </Button>
              <Button type="submit" variant="outline" className="h-10">
                Save
              </Button>
            </div>
          </div>
        ) : null}
      </form>

      {bulkDiscountsOpen ? (
        <BulkDiscountsDialog
          settings={form.bulkDiscounts}
          saveLabel={dialogSaveLabel}
          onOpenChange={(open) => {
            // Backing out without saving leaves no tiers, so the row goes back
            // to its Plus button on its own.
            if (!open) setBulkDiscountsOpen(false)
          }}
          onSave={(settings) => {
            commit((current) => ({ ...current, bulkDiscounts: settings }))
            setBulkDiscountsOpen(false)
            toast.success('Bulk discounts saved')
          }}
        />
      ) : null}

      {variantDialog ? (
        <VariantDialog
          // Re-mount per open/target so the draft starts fresh.
          key={
            variantDialog.mode === 'edit' ? variantDialog.variant.id : 'add'
          }
          initial={variantDialog.mode === 'edit' ? variantDialog.variant : null}
          showInventory={!!enabled.inventory && countsByVariant}
          pricePlaceholder={form.price.trim() || PRICE_PLACEHOLDER}
          labelOptions={labelOptions}
          saveLabel={dialogSaveLabel}
          onCreateLabel={(label) =>
            setLabelOptions((current) => [...current, label])
          }
          onOpenChange={(open) => {
            if (!open) setVariantDialog(null)
          }}
          onSave={saveVariant}
        />
      ) : null}

      {customizationDialog ? (
        <CustomQuestionDialog
          // Re-mount per open/target so the draft starts fresh.
          key={
            customizationDialog.mode === 'edit'
              ? customizationDialog.customization.id
              : 'add'
          }
          initial={
            customizationDialog.mode === 'edit'
              ? customizationDialog.customization
              : null
          }
          noun="customization"
          showChoiceSurcharge
          saveLabel={dialogSaveLabel}
          onOpenChange={(open) => {
            if (!open) setCustomizationDialog(null)
          }}
          onSave={saveCustomization}
        />
      ) : null}

      <AlertDialog
        open={pendingDeleteVariant !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteVariant(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete variant?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDeleteVariant
                ? `"${pendingDeleteVariant.name}" will be removed from this product.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDeleteVariant}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingDeleteCustomization !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteCustomization(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete customization?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDeleteCustomization
                ? `"${pendingDeleteCustomization.title}" will be removed from this product.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDeleteCustomization}
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
