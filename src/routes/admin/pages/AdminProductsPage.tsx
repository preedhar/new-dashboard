import * as React from 'react'
import {
  ArrowDownUp,
  ArrowLeft,
  Boxes,
  ChevronDown,
  ChevronRight,
  Copy,
  Folder,
  GripVertical,
  Link2,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Search,
  SquareDashed,
  Trash2,
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
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
  DropdownMenuSeparator,
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { TypographyH4 } from '@/components/ui/typography'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

import { SelectFilter } from './AdminOrdersAllPage'
import { ImageUploadControl } from './AdminSettingsWebsiteAppearancePage'

import productImage from '@/assets/product.png'
import globeIcon from '@/assets/channels/globe.png'
import monitorIcon from '@/assets/channels/monitor.png'
import qrIcon from '@/assets/channels/qr.png'

// The catch-all category. It always sits last and can't be renamed, given a
// URL, duplicated, deleted, or reordered — it simply collects every product not
// filed under a category of its own.
const DEFAULT_CATEGORY_ID = 'everything-else'

// The merchant's free Cococart subdomain, the base for every storefront link.
const STORE_DOMAIN = 'haus.cococart.co'

// The buttons closing out a mobile toolbar row divide it into equal shares —
// `min-w-0` so a wider label can't claim more than its own, which is what keeps
// the row even whether it holds two buttons or three.
const MOBILE_TOOLBAR_BUTTON = 'min-w-0 flex-1'

// Id source for the categories and products the merchant creates during the
// session. A module-level counter would restart whenever this module is
// re-evaluated (a dev hot reload keeps component state but resets module
// scope) and hand out an id a row already holds — two rows sharing an id both
// light up as selected, and React warns about the duplicate key — so the
// uniqueness can't come from module state.
function nextId(prefix: string) {
  const unique =
    crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${prefix}-${unique}`
}

// Turn a category name into a URL-friendly slug for the storefront path.
function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// The storefront address a category's slug resolves to.
function categoryLink(url: string) {
  return `https://${STORE_DOMAIN}/#${url}`
}

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`
}

// Give the drag a floating copy of the row that tracks the cursor. The in-list
// row is hidden (opacity-0) once dragging starts, so without an explicit drag
// image the browser would show nothing; this clones the row, lays it out
// off-screen as an elevated card, and hands it to the drag operation.
function setRowDragImage(event: React.DragEvent<HTMLElement>) {
  const node = event.currentTarget
  const rect = node.getBoundingClientRect()
  const offsetX = event.clientX - rect.left
  const offsetY = event.clientY - rect.top
  const clone = node.cloneNode(true) as HTMLElement
  clone.classList.remove('opacity-0')
  clone.style.position = 'fixed'
  clone.style.top = '0'
  clone.style.left = '-10000px'
  clone.style.width = `${rect.width}px`
  clone.style.margin = '0'
  clone.style.opacity = '1'
  clone.style.pointerEvents = 'none'
  clone.style.borderRadius = '8px'
  clone.style.background = 'var(--card, #ffffff)'
  clone.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.06)'
  document.body.appendChild(clone)
  event.dataTransfer.setDragImage(clone, offsetX, offsetY)
  // The drag image is snapshotted synchronously, so the clone can go now.
  window.setTimeout(() => clone.remove(), 0)
}

// FLIP reorder animation: rows register their node by id, and after every
// render each row that changed vertical position is snapped back to its old
// spot with a transform, then transitioned to its new spot — so reorders slide
// instead of jumping. Returns a ref callback to attach to each row.
function useReorderTransition() {
  const nodes = React.useRef(new Map<string, HTMLElement>())
  const prevTops = React.useRef(new Map<string, number>())

  const register = React.useCallback(
    (id: string, node: HTMLElement | null) => {
      if (node) nodes.current.set(id, node)
      else nodes.current.delete(id)
    },
    [],
  )

  React.useLayoutEffect(() => {
    const nextTops = new Map<string, number>()
    nodes.current.forEach((node, id) => {
      const top = node.offsetTop
      nextTops.set(id, top)
      const prev = prevTops.current.get(id)
      if (prev !== undefined && prev !== top) {
        const delta = prev - top
        node.style.transition = 'none'
        node.style.transform = `translateY(${delta}px)`
        // A row mid-slide would otherwise pass back under the stationary
        // cursor and fire another dragover, swapping it back on a loop. Make
        // it ignore pointer/drag events until it settles.
        node.style.pointerEvents = 'none'
        // Next frame: release to the new position with a transition.
        requestAnimationFrame(() => {
          node.style.transition = 'transform 200ms ease'
          node.style.transform = ''
          const done = () => {
            node.style.pointerEvents = ''
            node.removeEventListener('transitionend', done)
          }
          node.addEventListener('transitionend', done)
        })
      }
    })
    prevTops.current = nextTops
  })

  return register
}

type Channel = 'online-store' | 'pos' | 'qr'

const CHANNELS: { value: Channel; label: string; icon: string }[] = [
  { value: 'online-store', label: 'Online Store', icon: globeIcon },
  { value: 'pos', label: 'POS', icon: monitorIcon },
  { value: 'qr', label: 'QR Code', icon: qrIcon },
]

// Options for the toolbar's channel filter (the SelectFilter shared with the
// All Orders page), each carrying its channel icon.
const CHANNEL_FILTER_OPTIONS = CHANNELS.map((channel) => ({
  label: channel.label,
  iconSrc: channel.icon,
}))

type Category = {
  id: string
  name: string
  url: string
  // Null until the merchant uploads one; rows fall back to a placeholder.
  image: string | null
}

type Product = {
  id: string
  name: string
  price: number
  // The non-default categories this product belongs to. Empty means it lives in
  // the catch-all ("No category" / "Everything else").
  categoryIds: string[]
  channels: Channel[]
  // Bundles sit in the same list as plain products and are only marked by a
  // label on the row.
  isBundle?: boolean
}

// A product is available as long as it's switched on for at least one sales
// channel — with every channel off there's nowhere left to order it.
function isAvailable(product: Product) {
  return product.channels.length > 0
}

// Seed catalog — every product starts uncategorised so the page opens on the
// default "No category" state described in the spec. Pad Thai ships with no
// channels so the unavailable state (and the availability sort) is visible.
const INITIAL_PRODUCTS: Product[] = [
  { id: 'p-americano', name: 'Americano, Iced', price: 4.5, categoryIds: [], channels: ['online-store', 'pos', 'qr'] },
  { id: 'p-cappuccino', name: 'Cappuccino', price: 5.0, categoryIds: [], channels: ['online-store', 'pos'] },
  { id: 'p-croissant', name: 'Butter Croissant', price: 3.75, categoryIds: [], channels: ['online-store', 'qr'] },
  { id: 'p-latte', name: 'Oat Milk Latte', price: 5.5, categoryIds: [], channels: ['online-store', 'pos', 'qr'] },
  { id: 'p-cheeseburger', name: 'Double Cheeseburger', price: 12.0, categoryIds: [], channels: ['online-store', 'pos'], isBundle: true },
  { id: 'p-caesar', name: 'Caesar Salad', price: 9.5, categoryIds: [], channels: ['online-store'] },
  { id: 'p-margherita', name: 'Margherita Pizza', price: 14.0, categoryIds: [], channels: ['online-store', 'pos', 'qr'], isBundle: true },
  { id: 'p-padthai', name: 'Pad Thai', price: 11.5, categoryIds: [], channels: [] },
]

// ---------------------------------------------------------------------------
// Channels button: shows the three sales-channel icons (dimmed when a channel
// is off) and opens a popover to toggle where the product is enabled.
// ---------------------------------------------------------------------------

function ChannelsButton({
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
  const enabledCount = channels.length
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 gap-1.5 px-2"
          aria-label={`Enabled on ${enabledCount} of ${CHANNELS.length} channels`}
        >
          {CHANNELS.map((channel) => (
            <img
              key={channel.value}
              src={channel.icon}
              alt=""
              className={cn(
                'size-5 rounded-sm transition-opacity',
                channels.includes(channel.value)
                  ? 'opacity-100'
                  : 'opacity-30 grayscale',
              )}
            />
          ))}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
        <div className="px-3 pt-2.5">
          <p className="text-sm font-medium">Enabled on</p>
        </div>
        <div className="divide-y divide-border/50 px-3 pb-1">
          {CHANNELS.map((channel) => (
            <label
              key={channel.value}
              className="flex cursor-pointer items-center justify-between gap-3 py-3"
            >
              <span className="flex items-center gap-2.5 text-sm font-medium">
                <img src={channel.icon} alt="" className="size-5 rounded-sm" />
                {channel.label}
              </span>
              <Switch
                checked={channels.includes(channel.value)}
                onCheckedChange={(checked) => toggle(channel.value, checked)}
                aria-label={channel.label}
              />
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Category add / edit dialog
// ---------------------------------------------------------------------------

function CategoryDialog({
  mode,
  category,
  isDefault = false,
  onOpenChange,
  onSave,
}: {
  mode: 'add' | 'edit'
  category: Category | null
  // The catch-all category can only have its image changed — its name is
  // derived and it has no link — so the name/link fields are hidden for it.
  isDefault?: boolean
  onOpenChange: (open: boolean) => void
  onSave: (values: { name: string; url: string; image: string | null }) => void
}) {
  const [name, setName] = React.useState(category?.name ?? '')
  const [url, setUrl] = React.useState(category?.url ?? '')
  const [image, setImage] = React.useState<string | null>(
    category?.image ?? null,
  )
  // While adding, keep the link slug mirroring the name until the merchant edits
  // it directly (then it stops auto-syncing).
  const [urlEdited, setUrlEdited] = React.useState(mode === 'edit')

  const canSave = isDefault || name.trim() !== ''
  const fullLink = categoryLink(url)
  const contentRef = React.useRef<HTMLDivElement>(null)

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent
        ref={contentRef}
        className="sm:max-w-lg [&_[data-slot=dialog-close]]:size-10"
        // Radix highlights the value of whatever it autofocuses — and does it
        // again when the closing dropdown hands focus back — so the name would
        // open selected and the first keystroke would wipe it. Park focus on
        // the dialog itself; Tab still steps into the fields from there.
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          contentRef.current?.focus()
        }}
      >
        <DialogHeader className="text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">
              {mode === 'add' ? 'Add category' : 'Edit category'}
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="category-name" className="text-sm font-medium">
              Name
            </Label>
            {/* The catch-all's name is derived from whether real categories
                exist, so it's shown but not editable. */}
            <Input
              id="category-name"
              value={name}
              readOnly={isDefault}
              onChange={(event) => {
                setName(event.target.value)
                if (!urlEdited) setUrl(slugify(event.target.value))
              }}
              placeholder="e.g. Hot Drinks"
              className={cn(
                'h-10',
                isDefault &&
                  'cursor-default text-muted-foreground focus-visible:border-input focus-visible:ring-0',
              )}
            />
          </div>

          {!isDefault ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="category-url" className="text-sm font-medium">
                  Link
                </Label>
                <InputGroup className="h-10">
                  <InputGroupAddon className="pl-3 text-muted-foreground">
                    /#
                  </InputGroupAddon>
                  <InputGroupInput
                    id="category-url"
                    value={url}
                    onChange={(event) => {
                      setUrlEdited(true)
                      setUrl(slugify(event.target.value))
                    }}
                    placeholder="hot-drinks"
                  />
                </InputGroup>
                {/* The storefront address the slug resolves to — open it or
                    copy it. */}
                <div className="flex items-center gap-1">
                  <a
                    href={fullLink}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 truncate text-sm"
                  >
                    {fullLink}
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Copy link"
                    onClick={() => {
                      void navigator.clipboard?.writeText(fullLink)
                      toast.success('Link copied')
                    }}
                  >
                    <Copy className="size-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="category-image" className="text-sm font-medium">
              Image
            </Label>
            <div className="flex">
              <ImageUploadControl
                id="category-image"
                noun="image"
                image={image ? { name: 'Category image', url: image } : null}
                onSelectFile={(file) => {
                  setImage(URL.createObjectURL(file))
                  toast.success('Image uploaded')
                }}
                onRemove={() => setImage(null)}
              />
            </div>
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
            disabled={!canSave}
            onClick={() =>
              onSave({
                name: name.trim(),
                url: url.trim() || slugify(name),
                image,
              })
            }
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Change categories dialog: the product's memberships as removable chips, with
// an "Add" chip opening a searchable list — the same field the order details
// pane uses for customer tags.
// ---------------------------------------------------------------------------

function ChangeCategoriesDialog({
  product,
  categories,
  onOpenChange,
  onSave,
}: {
  product: Product
  // Every real category on the store. The catch-all isn't one of them — a
  // product lands there by belonging to none of these.
  categories: Category[]
  onOpenChange: (open: boolean) => void
  // Categories typed into the field are handed back alongside the memberships
  // rather than added as they're typed, so Cancel leaves nothing behind.
  onSave: (values: { categoryIds: string[]; created: Category[] }) => void
}) {
  // Anchors the popover to the field so it spans the full available width.
  const anchor = React.useRef<HTMLDivElement | null>(null)
  // The popup mounts here rather than at <body>: a modal dialog parks
  // `pointer-events: none` on the body and only lifts it for its own content,
  // and its focus trap and outside-click dismissal both go by DOM containment.
  // Mounted inside the dialog, the popup counts as part of it on all three.
  // State rather than a ref so the portal re-resolves once the node exists —
  // handed a ref that's still empty, it would quietly fall back to <body>.
  const [content, setContent] = React.useState<HTMLDivElement | null>(null)
  const [drafts, setDrafts] = React.useState<Category[]>([])
  const [value, setValue] = React.useState<Category[]>(() =>
    categories.filter((category) => product.categoryIds.includes(category.id)),
  )
  const [query, setQuery] = React.useState('')

  const options = React.useMemo(
    () => [...categories, ...drafts],
    [categories, drafts],
  )

  const trimmed = query.trim()
  const canCreate =
    trimmed !== '' &&
    !options.some(
      (category) => category.name.toLowerCase() === trimmed.toLowerCase(),
    )

  function createCategory() {
    if (!canCreate) return
    // Only the name is asked for here; the slug follows from it and the image
    // stays empty until the category is edited from its own row.
    const created: Category = {
      id: nextId('category'),
      name: trimmed,
      url: slugify(trimmed),
      image: null,
    }
    setDrafts((current) => [...current, created])
    setValue((current) => [...current, created])
    setQuery('')
  }

  function removeCategory(id: string) {
    setValue((current) => current.filter((category) => category.id !== id))
  }

  // Shared chip styling for the selected categories and the "Add" button. A
  // fixed 36px height rather than padding, so a chip carrying an icon still
  // lines up with one that doesn't.
  const chipClass =
    'inline-flex h-9 items-center gap-1.5 rounded-md bg-secondary px-3 text-base font-normal text-secondary-foreground'

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent
        ref={setContent}
        // The popup hangs below the field and past the dialog's own box, which
        // the default `overflow-hidden` would cut off. The body keeps its own
        // scrolling either way.
        className="overflow-visible sm:max-w-lg [&_[data-slot=dialog-close]]:size-10"
      >
        <DialogHeader className="text-center">
          <DialogTitle asChild>
            {/* The title is the merchant's own text now, so it can run long:
                the padding keeps it clear of the close button and the ellipsis
                takes over from there. */}
            <TypographyH4 className="truncate px-10 font-semibold">
              {product.name}
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <Combobox
            items={options}
            value={value}
            onValueChange={(next: Category[], details) => {
              // base-ui clears the whole selection on Escape — ignore that
              // change.
              if (details.reason === 'escape-key') return
              setValue(next)
            }}
            inputValue={query}
            onInputValueChange={(next) => setQuery(next)}
            itemToStringLabel={(category: Category) => category.name}
            isItemEqualToValue={(a: Category, b: Category) => a.id === b.id}
            multiple
          >
            <div ref={anchor} className="flex flex-wrap items-center gap-1.5">
              {value.map((category) => (
                <span key={category.id} className={chipClass}>
                  <Folder className="size-4 shrink-0 text-muted-foreground" />
                  {category.name}
                  <button
                    type="button"
                    aria-label={`Remove ${category.name}`}
                    onClick={() => removeCategory(category.id)}
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
            <ComboboxContent anchor={anchor} container={content}>
              <ComboboxInput
                placeholder="Search categories…"
                showTrigger={false}
                className="m-3! h-10! bg-white! pl-2"
              />
              {!canCreate ? (
                <ComboboxEmpty>No categories found.</ComboboxEmpty>
              ) : null}
              <ComboboxList>
                {(category: Category) => (
                  <ComboboxItem key={category.id} value={category}>
                    <Folder className="text-muted-foreground" />
                    {category.name}
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
            onClick={() => {
              const categoryIds = value.map((category) => category.id)
              onSave({
                categoryIds,
                // A category typed in and then taken off again never happened.
                created: drafts.filter((draft) =>
                  categoryIds.includes(draft.id),
                ),
              })
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Sort by availability dialog
// ---------------------------------------------------------------------------

function SortByAvailabilityDialog({
  value,
  onOpenChange,
  onSave,
}: {
  value: boolean
  onOpenChange: (open: boolean) => void
  onSave: (value: boolean) => void
}) {
  const [enabled, setEnabled] = React.useState(value)

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">
              Sort by availability
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <FieldLabel
            htmlFor="sort-by-availability"
            className="w-full flex-col items-start gap-1 font-normal"
          >
            <div className="flex w-full items-center justify-between gap-3">
              <FieldTitle>Show unavailable products at the bottom</FieldTitle>
              <Switch
                id="sort-by-availability"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>
            <FieldDescription>Applies to Online Store</FieldDescription>
          </FieldLabel>
        </DialogBody>

        <DialogFooter className="flex-row">
          <Button
            variant="outline"
            className="h-10 flex-1 px-3"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button className="h-10 flex-1 px-3" onClick={() => onSave(enabled)}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Toolbar "Actions" menu: the bulk actions that operate on whatever rows are
// checked, plus whatever list-wide options the toolbar wants above them (the
// products toolbar parks its availability sort there).
// ---------------------------------------------------------------------------

function BulkActionsMenu({
  selectedCount,
  disabled,
  triggerClassName,
  leading,
  onDuplicate,
  onDelete,
}: {
  selectedCount: number
  disabled: boolean
  triggerClassName?: string
  leading?: React.ReactNode
  onDuplicate: () => void
  onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn('h-10 px-3', triggerClassName)}
          disabled={disabled}
        >
          Actions
          {selectedCount > 0 ? (
            <Badge className="ml-0.5 h-5 min-w-5 justify-center px-1 tabular-nums">
              {selectedCount}
            </Badge>
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {leading ? (
          <>
            {leading}
            <DropdownMenuSeparator />
          </>
        ) : null}
        {/* Bulk actions need something checked to act on. */}
        <DropdownMenuItem disabled={selectedCount === 0} onSelect={onDuplicate}>
          <Copy className="size-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          disabled={selectedCount === 0}
          onSelect={onDelete}
        >
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ---------------------------------------------------------------------------
// Category row (left column)
// ---------------------------------------------------------------------------

function CategoryRow({
  name,
  image,
  count,
  selected,
  isDefault,
  mobile,
  reorderable,
  listReorderable,
  selectMode,
  selectable,
  checked,
  dragging,
  className,
  rowRef,
  onSelect,
  onCheckedChange,
  onEdit,
  onCopyLink,
  onDuplicate,
  onDelete,
  dragProps,
}: {
  name: string
  image: string | null
  count: number
  selected: boolean
  isDefault: boolean
  // On a phone the row is a link into the category, so it stacks into two lines
  // with a chevron up top and the manage menu below.
  mobile: boolean
  reorderable: boolean
  // Whether any row in the list shows a drag handle. When true, every row
  // reserves the handle's width so their images stay aligned.
  listReorderable: boolean
  // Mobile only: "Select" swaps the chevron and the manage menu for a checkbox
  // and turns the row into its own toggle.
  selectMode: boolean
  // The catch-all can't be duplicated or deleted, so it sits out of selection.
  selectable: boolean
  checked: boolean
  // While this row is the one being dragged, its in-list instance is hidden
  // (leaving empty space) since the browser already shows it as a floating
  // drag image.
  dragging: boolean
  className?: string
  rowRef?: (node: HTMLDivElement | null) => void
  onSelect: () => void
  onCheckedChange: (checked: boolean) => void
  onEdit: () => void
  onCopyLink: () => void
  onDuplicate: () => void
  onDelete: () => void
  dragProps?: React.HTMLAttributes<HTMLDivElement> & { draggable?: boolean }
}) {
  const manageMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className="shrink-0 text-muted-foreground"
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
        {/* The catch-all category has no link of its own and can't be
            duplicated or deleted — only its image is editable. */}
        {!isDefault ? (
          <>
            <DropdownMenuItem onSelect={onCopyLink}>
              <Link2 className="size-4" />
              Copy link
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onDuplicate}>
              <Copy className="size-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const productCount = (
    <span className="text-sm text-muted-foreground">
      {count} {count === 1 ? 'product' : 'products'}
    </span>
  )

  if (mobile) {
    // Handles showing means the list is being reordered, so rows stop acting
    // as links and hand their trailing slot over to the drag handle.
    const inReorder = listReorderable
    // Reorder wins if both were somehow on; the row can only be one thing.
    const inSelect = selectMode && !inReorder
    // In select mode the whole row is the checkbox's target, the way the
    // product rows behave — except for the catch-all, which can't be picked.
    const activate = inSelect ? () => onCheckedChange(!checked) : onSelect
    const interactive = !inReorder && (!inSelect || selectable)
    return (
      <div
        ref={rowRef}
        {...dragProps}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={interactive ? activate : undefined}
        onKeyDown={(event) => {
          if (!interactive) return
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            activate()
          }
        }}
        className={cn(
          'flex w-full flex-col gap-1 px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-6',
          reorderable && 'cursor-grab active:cursor-grabbing',
          dragging && 'opacity-0',
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <img
            src={image ?? productImage}
            alt=""
            className="size-10 shrink-0 rounded-md object-cover"
          />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {name}
          </span>
          {/* The chevron and the manage menu keep the same 40px box, so
              swapping in the drag handle doesn't move the row. */}
          <span className="flex size-10 shrink-0 items-center justify-center">
            {inReorder || inSelect ? null : (
              <ChevronRight className="size-4 text-muted-foreground" />
            )}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          {productCount}
          {inReorder ? (
            <span className="flex size-10 shrink-0 items-center justify-center">
              {/* The catch-all can't move, so its slot just holds the space. */}
              {reorderable ? (
                <GripVertical className="size-4 text-muted-foreground" />
              ) : null}
            </span>
          ) : inSelect ? (
            <span className="flex size-10 shrink-0 items-center justify-center">
              {/* The row itself handles the toggle, so the box is just the
                  readout — and stays empty for the catch-all. */}
              {selectable ? (
                <Checkbox
                  checked={checked}
                  aria-hidden
                  tabIndex={-1}
                  className="pointer-events-none"
                />
              ) : null}
            </span>
          ) : (
            // Everything else in the row opens the category; only this corner
            // keeps its own click.
            <span onClick={(event) => event.stopPropagation()}>
              {manageMenu}
            </span>
          )}
        </div>
      </div>
    )
  }

  // Handles showing means the list is being reordered, so the rows stop acting
  // as pickers and their manage menus step aside.
  const inReorder = listReorderable
  return (
    <div
      ref={rowRef}
      {...dragProps}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-4 py-4 transition-colors',
        reorderable && 'cursor-grab active:cursor-grabbing',
        dragging
          ? 'opacity-0'
          : selected
            ? 'bg-muted'
            : !inReorder && 'hover:bg-muted/50',
        className,
      )}
    >
      {inReorder ? (
        // The catch-all can't move, so its slot just holds the space.
        reorderable ? (
          <GripVertical className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <span className="size-4 shrink-0" aria-hidden />
        )
      ) : null}
      <button
        type="button"
        onClick={onSelect}
        disabled={inReorder}
        className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
      >
        <img
          src={image ?? productImage}
          alt=""
          className="size-10 shrink-0 rounded-md object-cover"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{name}</span>
          <span className="block text-sm text-muted-foreground">
            {count} {count === 1 ? 'product' : 'products'}
          </span>
        </span>
      </button>
      {/* Editing or deleting would reshuffle the list mid-drag, so the menu
          sits reordering out — its slot stays to keep the rows the same shape. */}
      {inReorder ? <span className="size-10 shrink-0" aria-hidden /> : manageMenu}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Product row (right column)
// ---------------------------------------------------------------------------

function ProductRow({
  product,
  mobile,
  reorderMode,
  reorderable,
  selected,
  selectable,
  hasCategories,
  dragging,
  rowRef,
  onSelectedChange,
  onChannelsChange,
  onEdit,
  onChangeCategories,
  onCopyLink,
  onDuplicate,
  onDelete,
  dragProps,
}: {
  product: Product
  // On a phone the row stacks into two lines — name up top, price and channels
  // below — so nothing has to compete for the same horizontal space.
  mobile: boolean
  // In reorder mode the leading slot holds the drag handle instead of the
  // checkbox.
  reorderMode: boolean
  reorderable: boolean
  selected: boolean
  // Desktop always offers the checkbox; mobile only once "Select" is on.
  selectable: boolean
  // Whether the store has any category at all. With none, there's nothing for
  // the membership count to say and nothing to move the product between, so the
  // subtitle shows the price alone and the menu drops "Change categories".
  hasCategories: boolean
  // While this row is the one being dragged, its in-list instance is hidden
  // (leaving empty space) since the browser already shows it as a floating
  // drag image.
  dragging: boolean
  rowRef?: (node: HTMLDivElement | null) => void
  onSelectedChange: (selected: boolean) => void
  onChannelsChange: (channels: Channel[]) => void
  onEdit: () => void
  onChangeCategories: () => void
  onCopyLink: () => void
  onDuplicate: () => void
  onDelete: () => void
  dragProps?: React.HTMLAttributes<HTMLDivElement> & { draggable?: boolean }
}) {
  const categoryCount = product.categoryIds.length

  const leading = reorderMode ? (
    reorderable ? (
      <GripVertical className="size-4 shrink-0 text-muted-foreground" />
    ) : (
      <span className="size-4 shrink-0" aria-hidden />
    )
  ) : selectable ? (
    <Checkbox
      checked={selected}
      onCheckedChange={(checked) => onSelectedChange(checked === true)}
      aria-label={`Select ${product.name}`}
    />
  ) : null

  const separator = (
    <span aria-hidden className="text-muted-foreground/40">
      •
    </span>
  )
  const meta = (
    <span className="flex items-center gap-2 text-sm text-muted-foreground">
      {formatPrice(product.price)}
      {hasCategories ? (
        <>
          {separator}
          {/* The folder carries the meaning on screen; the noun is kept for
              anyone hearing the row rather than seeing it. */}
          <span className="flex items-center gap-1">
            <Folder aria-hidden className="size-4 shrink-0" />
            {categoryCount}
            <span className="sr-only">
              {categoryCount === 1 ? 'category' : 'categories'}
            </span>
          </span>
        </>
      ) : null}
    </span>
  )

  // Bundles are called out beside the name rather than in the meta line. The
  // badge never shrinks, so a name long enough to truncate gives way to it
  // instead of pushing it off the row.
  const nameLine = (
    <span className={cn('flex min-w-0 items-center gap-2', mobile && 'flex-1')}>
      <span className="truncate text-sm font-medium">{product.name}</span>
      {product.isBundle ? <Badge variant="outline">Bundle</Badge> : null}
    </span>
  )

  const channelsButton = (
    <div className="shrink-0" onClick={(event) => event.stopPropagation()}>
      <ChannelsButton channels={product.channels} onChange={onChannelsChange} />
    </div>
  )

  const manageMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className="shrink-0 text-muted-foreground"
          aria-label={`Manage ${product.name}`}
        >
          <MoreHorizontal className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      {/* `w-auto` undoes the base width, which is pinned to the trigger — a
          40px icon button — and would otherwise hold the menu at its `min-w-40`
          floor and clip anything longer. Sizing to content instead lets
          "Change categories" set the width it needs. */}
      <DropdownMenuContent align="end" className="w-auto min-w-40">
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil className="size-4" />
          Edit
        </DropdownMenuItem>
        {/* Nothing to file the product under until the store has a category, so
            the entry waits until there's one. */}
        {hasCategories ? (
          <DropdownMenuItem onSelect={onChangeCategories}>
            <Folder className="size-4" />
            Change categories
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onSelect={onCopyLink}>
          <Link2 className="size-4" />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onDuplicate}>
          <Copy className="size-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  if (mobile) {
    // Whatever sits in the bottom-right corner keeps the icon button's 40px
    // box, so switching modes swaps the control without moving the row.
    const trailing = (
      <span className="flex size-10 shrink-0 items-center justify-center">
        {reorderMode ? (
          reorderable ? (
            <GripVertical className="size-4 text-muted-foreground" />
          ) : null
        ) : (
          // The row itself handles the toggle, so the box is just the readout.
          <Checkbox
            checked={selected}
            aria-hidden
            tabIndex={-1}
            className="pointer-events-none"
          />
        )}
      </span>
    )
    return (
      <div
        ref={rowRef}
        {...dragProps}
        // In select mode the whole row is the target, the way the orders list
        // behaves.
        onClick={
          selectable && !reorderMode ? () => onSelectedChange(!selected) : undefined
        }
        className={cn(
          'flex w-full flex-col gap-1 px-4 py-3 sm:px-6',
          reorderable && 'cursor-grab active:cursor-grabbing',
          dragging && 'opacity-0',
        )}
      >
        <div className="flex items-center gap-3">
          <img
            src={productImage}
            alt=""
            className="size-10 shrink-0 rounded-md object-cover"
          />
          {nameLine}
          {channelsButton}
        </div>
        <div className="flex items-center justify-between gap-2">
          {meta}
          {selectable || reorderMode ? trailing : manageMenu}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={rowRef}
      {...dragProps}
      className={cn(
        'flex items-center gap-3 px-2 py-4',
        reorderable && 'cursor-grab active:cursor-grabbing',
        dragging && 'opacity-0',
      )}
    >
      {leading}
      <img
        src={productImage}
        alt=""
        className="size-11 shrink-0 rounded-md object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {nameLine}
        {meta}
      </div>
      {channelsButton}
      {manageMenu}
    </div>
  )
}

// ---------------------------------------------------------------------------
// List surface: a bordered card on desktop; on a phone the card is dropped and
// the rows run edge to edge, split by dividers, the way the orders list does.
// ---------------------------------------------------------------------------

function ListSurface({
  mobile,
  children,
}: {
  mobile: boolean
  children: React.ReactNode
}) {
  if (mobile) {
    return (
      <div className="-mx-4 flex flex-col divide-y divide-border sm:-mx-6">
        {children}
      </div>
    )
  }
  return (
    <Card className="gap-0 py-0 shadow-none">
      <div className="divide-y divide-border/50 px-2 py-2">{children}</div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function AdminProductsPage() {
  // Non-default categories, in display order. The catch-all is rendered after
  // these and lives outside this array.
  const [categories, setCategories] = React.useState<Category[]>([])
  const [products, setProducts] = React.useState<Product[]>(INITIAL_PRODUCTS)
  const [selectedCategoryId, setSelectedCategoryId] =
    React.useState<string>(DEFAULT_CATEGORY_ID)
  // FLIP animators that slide rows to their new spots when the lists reorder.
  const registerCategoryRow = useReorderTransition()
  const registerProductRow = useReorderTransition()
  // The catch-all's name is derived, but its image is editable.
  const [defaultImage, setDefaultImage] = React.useState<string | null>(null)
  // Product rows carry checkboxes by default; "Reorder" swaps them for drag
  // handles and puts the rest of the page on hold until "Done".
  const [reorderMode, setReorderMode] = React.useState(false)
  const [selectedProductIds, setSelectedProductIds] = React.useState<string[]>(
    [],
  )
  const [sortByAvailability, setSortByAvailability] = React.useState(false)
  const [sortDialogOpen, setSortDialogOpen] = React.useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false)
  // The two columns don't fit side by side on a phone, so they become two
  // screens: pick a category, then drill into its products.
  const isMobile = useIsMobile()
  const [mobileView, setMobileView] = React.useState<'categories' | 'products'>(
    'categories',
  )
  // Mobile keeps the search field and the checkboxes out of the way until
  // they're asked for.
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [selectMode, setSelectMode] = React.useState(false)
  // The mobile category screen has its own Reorder button, since desktop's lives
  // in a toolbar that screen doesn't have. Picking works the same way, behind
  // its own Select button.
  const [categoryReorderMode, setCategoryReorderMode] = React.useState(false)
  const [categorySelectMode, setCategorySelectMode] = React.useState(false)
  const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<string[]>(
    [],
  )

  // Toolbar filters. They narrow only what's shown; reordering is disabled while
  // a filter is active so the visible list still maps 1:1 to the category order.
  const [productSearch, setProductSearch] = React.useState('')
  // Stored as a channel label (matching SelectFilter's string values); null
  // means no channel filter.
  const [channelFilter, setChannelFilter] = React.useState<string | null>(null)
  const searchQuery = productSearch.trim().toLowerCase()
  // Search reaches across the whole catalog rather than the open category, so
  // while a query is typed the results replace whichever list was on screen —
  // including, on desktop, the category column itself.
  const isSearching = searchQuery !== ''
  const isFiltering = isSearching || channelFilter !== null

  // The catch-all's label depends on whether any real category exists.
  const hasCategories = categories.length > 0
  const defaultCategoryName = hasCategories ? 'Everything else' : 'No category'

  // Reordering is only offered once there are at least two real categories.
  const categoriesReorderable = categories.length >= 2
  // Handles are on screen only while reordering: on desktop both columns answer
  // to the toolbar's Reorder button, and on mobile the category screen has its
  // own. Search replaces the list with results, so there's nothing to drag.
  const categoriesDraggable =
    categoriesReorderable &&
    !isSearching &&
    (isMobile ? categoryReorderMode : reorderMode)

  // With nothing to choose between, the category screen would be an empty
  // detour — the products stand in as the mobile landing page.
  const mobileShowsProducts = !hasCategories || mobileView === 'products'
  // Search results are products wherever they're raised, so they take over the
  // category screen too.
  const showsProductList = isSearching || !isMobile || mobileShowsProducts
  const showCategories = !isSearching && (!isMobile || !mobileShowsProducts)
  const showProducts = showsProductList

  // Checkboxes are always on hand with a mouse; on a phone they wait for
  // "Select".
  const productsSelectable = !isMobile || selectMode
  const categoriesSelectable = isMobile && categorySelectMode && !isSearching

  function backToCategories() {
    setMobileView('categories')
    setReorderMode(false)
    setSelectMode(false)
    setSelectedProductIds([])
    closeSearch()
  }

  // Dismissing search puts a different list back on screen, so anything picked
  // out of the results goes with it.
  function closeSearch() {
    setProductSearch('')
    setSearchOpen(false)
    setSelectMode(false)
    setSelectedProductIds([])
  }

  function productCountFor(categoryId: string) {
    if (categoryId === DEFAULT_CATEGORY_ID) {
      return products.filter((product) => product.categoryIds.length === 0)
        .length
    }
    return products.filter((product) => product.categoryIds.includes(categoryId))
      .length
  }

  const selectedIsDefault = selectedCategoryId === DEFAULT_CATEGORY_ID
  const selectedCategoryName = selectedIsDefault
    ? defaultCategoryName
    : (categories.find((category) => category.id === selectedCategoryId)?.name ??
      defaultCategoryName)

  const viewProducts = React.useMemo(
    () =>
      products.filter((product) =>
        selectedIsDefault
          ? product.categoryIds.length === 0
          : product.categoryIds.includes(selectedCategoryId),
      ),
    [products, selectedIsDefault, selectedCategoryId],
  )

  const filterChannel = CHANNELS.find(
    (channel) => channel.label === channelFilter,
  )?.value
  const displayedProducts = React.useMemo(() => {
    // A search is a question about the catalog, not about the open category, so
    // it's answered from every product on the store.
    const source = isSearching ? products : viewProducts
    const matches = source.filter(
      (product) =>
        (!isSearching || product.name.toLowerCase().includes(searchQuery)) &&
        (!filterChannel || product.channels.includes(filterChannel)),
    )
    // A stable sort, so within each availability group the manual order holds.
    return sortByAvailability
      ? [...matches].sort(
          (a, b) => Number(isAvailable(b)) - Number(isAvailable(a)),
        )
      : matches
  }, [
    products,
    viewProducts,
    isSearching,
    searchQuery,
    filterChannel,
    sortByAvailability,
  ])
  // Reordering needs at least two rows and an unfiltered list, so the visible
  // order still maps 1:1 to the stored one.
  const canReorder = viewProducts.length > 1 && !isFiltering
  const productsReorderable = reorderMode && canReorder
  // On desktop the one button governs both columns, so either list having
  // something to drag is enough to offer it.
  const canReorderAnything =
    canReorder || (!isMobile && categoriesReorderable && !isSearching)

  // Only what's on screen can be acted on, so a selection made before a filter
  // was applied can't quietly duplicate or delete hidden rows.
  const selectedProducts = React.useMemo(
    () =>
      displayedProducts.filter((product) =>
        selectedProductIds.includes(product.id),
      ),
    [displayedProducts, selectedProductIds],
  )
  const selectedCount = selectedProducts.length

  function toggleProductSelected(id: string, selected: boolean) {
    setSelectedProductIds((current) =>
      selected
        ? [...current, id]
        : current.filter((productId) => productId !== id),
    )
  }

  // -- Category CRUD ---------------------------------------------------------

  const [categoryDialog, setCategoryDialog] = React.useState<
    { mode: 'add' } | { mode: 'edit'; category: Category } | null
  >(null)
  // Holds whatever is waiting on the delete confirmation — one category from a
  // row's menu, or the checked ones from the Actions menu.
  const [pendingCategoryDelete, setPendingCategoryDelete] = React.useState<
    Category[] | null
  >(null)

  // The catch-all never joins a selection, and `categories` only holds the real
  // ones, so filtering by it drops it on its own.
  const selectedCategories = React.useMemo(
    () =>
      categories.filter((category) => selectedCategoryIds.includes(category.id)),
    [categories, selectedCategoryIds],
  )

  function toggleCategorySelected(id: string, selected: boolean) {
    setSelectedCategoryIds((current) =>
      selected
        ? [...current, id]
        : current.filter((categoryId) => categoryId !== id),
    )
  }

  function saveCategory(values: {
    name: string
    url: string
    image: string | null
  }) {
    if (categoryDialog?.mode === 'edit') {
      const { category } = categoryDialog
      if (category.id === DEFAULT_CATEGORY_ID) {
        // Only the catch-all's image can change.
        setDefaultImage(values.image)
      } else {
        setCategories((current) =>
          current.map((item) =>
            item.id === category.id ? { ...item, ...values } : item,
          ),
        )
      }
      toast.success('Category updated')
    } else {
      const created: Category = { id: nextId('category'), ...values }
      setCategories((current) => [...current, created])
      setSelectedCategoryId(created.id)
      toast.success('Category added')
    }
    setCategoryDialog(null)
  }

  function copyCategoryLink(category: Category) {
    void navigator.clipboard?.writeText(categoryLink(category.url))
    toast.success('Link copied')
  }

  // Duplicating drops each copy directly after its original. Takes a list so a
  // row's menu and the bulk action share one path.
  function duplicateCategories(targets: Category[]) {
    if (targets.length === 0) return
    const copies = new Map<string, Category>(
      targets.map((category) => [
        category.id,
        {
          id: nextId('category'),
          name: `${category.name} copy`,
          url: `${category.url}-copy`,
          image: category.image,
        },
      ]),
    )
    setCategories((current) =>
      current.flatMap((item) => {
        const copy = copies.get(item.id)
        return copy ? [item, copy] : [item]
      }),
    )
    // Copy every product filed under an original into its new category,
    // preserving the rest of each product's memberships.
    setProducts((current) => [
      ...current,
      ...current.flatMap((product) =>
        product.categoryIds
          .filter((id) => copies.has(id))
          .map((id) => ({
            ...product,
            id: nextId('product'),
            categoryIds: product.categoryIds.map((categoryId) =>
              categoryId === id ? copies.get(id)!.id : categoryId,
            ),
          })),
      ),
    ])
    toast.success(
      targets.length === 1
        ? 'Category duplicated'
        : `${targets.length} categories duplicated`,
    )
  }

  function deleteCategories(targets: Category[]) {
    const ids = new Set(targets.map((category) => category.id))
    setCategories((current) => current.filter((item) => !ids.has(item.id)))
    // Strip the deleted categories from every product; those left without a
    // category fall back to the catch-all.
    setProducts((current) =>
      current.map((product) => ({
        ...product,
        categoryIds: product.categoryIds.filter((id) => !ids.has(id)),
      })),
    )
    if (ids.has(selectedCategoryId)) {
      setSelectedCategoryId(DEFAULT_CATEGORY_ID)
    }
    setSelectedCategoryIds((current) => current.filter((id) => !ids.has(id)))
    setPendingCategoryDelete(null)
    toast.success(
      targets.length === 1
        ? 'Category deleted'
        : `${targets.length} categories deleted`,
    )
  }

  // Reorder the real categories by moving the dragged one to the hovered slot.
  // `draggingCategoryId` blanks the dragged row's in-list slot while it floats.
  const categoryDragIndex = React.useRef<number | null>(null)
  const [draggingCategoryId, setDraggingCategoryId] = React.useState<
    string | null
  >(null)
  function moveCategory(from: number, to: number) {
    if (from === to) return
    setCategories((current) => {
      const next = [...current]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  // -- Product CRUD ----------------------------------------------------------

  const [pendingProductDelete, setPendingProductDelete] =
    React.useState<Product | null>(null)

  function updateProduct(id: string, patch: Partial<Product>) {
    setProducts((current) =>
      current.map((product) =>
        product.id === id ? { ...product, ...patch } : product,
      ),
    )
  }

  // Add a product filed under the current category, or uncategorised when the
  // catch-all is selected.
  function addProduct() {
    const created: Product = {
      id: nextId('product'),
      name: 'New product',
      price: 0,
      categoryIds: selectedIsDefault ? [] : [selectedCategoryId],
      channels: ['online-store', 'pos', 'qr'],
    }
    setProducts((current) => [...current, created])
    toast.success('Product added')
  }

  // Neither bundles nor the product editor are modeled yet; both entries are
  // placeholders.
  function addBundle() {
    toast('Bundles are coming soon')
  }

  function editProduct() {
    toast('Editing products is coming soon')
  }

  // Which product has the "Change categories" dialog open, if any.
  const [categoriesProduct, setCategoriesProduct] =
    React.useState<Product | null>(null)

  function saveProductCategories(
    product: Product,
    { categoryIds, created }: { categoryIds: string[]; created: Category[] },
  ) {
    // Categories invented in the dialog join the list before the product points
    // at them, so the left column and the row's count agree from the first
    // render.
    if (created.length > 0) {
      setCategories((current) => [...current, ...created])
    }
    updateProduct(product.id, { categoryIds })
    setCategoriesProduct(null)
    toast.success('Categories updated')
  }

  function duplicateProduct(product: Product) {
    const copy: Product = {
      ...product,
      id: nextId('product'),
      name: `${product.name} copy`,
    }
    setProducts((current) => {
      const index = current.findIndex((item) => item.id === product.id)
      const next = [...current]
      next.splice(index + 1, 0, copy)
      return next
    })
    toast.success('Product duplicated')
  }

  function deleteProduct(product: Product) {
    setProducts((current) => current.filter((item) => item.id !== product.id))
    setPendingProductDelete(null)
    toast.success('Product deleted')
  }

  // Bulk equivalents of the row menu's Duplicate/Delete, driven by the
  // checkboxes and the toolbar's Actions menu.
  function duplicateSelectedProducts() {
    const ids = new Set(selectedProducts.map((product) => product.id))
    setProducts((current) =>
      current.flatMap((product) =>
        ids.has(product.id)
          ? [
              product,
              {
                ...product,
                id: nextId('product'),
                name: `${product.name} copy`,
              },
            ]
          : [product],
      ),
    )
    toast.success(
      ids.size === 1 ? 'Product duplicated' : `${ids.size} products duplicated`,
    )
    setSelectedProductIds([])
  }

  function deleteSelectedProducts() {
    const ids = new Set(selectedProducts.map((product) => product.id))
    setProducts((current) =>
      current.filter((product) => !ids.has(product.id)),
    )
    toast.success(
      ids.size === 1 ? 'Product deleted' : `${ids.size} products deleted`,
    )
    setSelectedProductIds([])
    setBulkDeleteOpen(false)
  }

  function copyProductLink(product: Product) {
    const link = `https://yourstore.com/products/${slugify(product.name)}`
    void navigator.clipboard?.writeText(link)
    toast.success('Link copied')
  }

  // Reorder within the current category's view, then fold that new order back
  // into the global product list without disturbing products outside the view.
  // Indices are into the displayed list, so a move made while the availability
  // sort is on is written back in the order the merchant actually sees.
  // `draggingProductId` blanks the dragged row's in-list slot while it floats.
  const productDragIndex = React.useRef<number | null>(null)
  const [draggingProductId, setDraggingProductId] = React.useState<
    string | null
  >(null)
  function moveProductInView(from: number, to: number) {
    if (from === to) return
    const reordered = [...displayedProducts]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    const viewIds = new Set(reordered.map((product) => product.id))
    setProducts((current) => {
      let cursor = 0
      return current.map((product) =>
        viewIds.has(product.id) ? reordered[cursor++] : product,
      )
    })
  }

  // The catch-all always renders after the real categories. It's given a
  // synthetic Category (with its derived name and editable image) so its row
  // and edit dialog can be driven the same way as the real ones.
  const defaultCategory: Category = {
    id: DEFAULT_CATEGORY_ID,
    name: defaultCategoryName,
    url: '',
    image: defaultImage,
  }
  const displayedCategories: {
    id: string
    name: string
    image: string | null
    isDefault: boolean
    category: Category
  }[] = [
    ...categories.map((category) => ({
      id: category.id,
      name: category.name,
      image: category.image,
      isDefault: false,
      category,
    })),
    {
      id: DEFAULT_CATEGORY_ID,
      name: defaultCategoryName,
      image: defaultImage,
      isDefault: true,
      category: defaultCategory,
    },
  ]

  // The search field is summoned by a button on both layouts; opening it takes
  // over the space the button (and, on desktop, the channel filter) occupied.
  const searchField = (
    <InputGroup
      className={cn(
        'h-10',
        isMobile ? 'w-full' : 'w-auto max-w-[400px] flex-1',
      )}
    >
      <InputGroupAddon>
        <Search className="size-4" />
      </InputGroupAddon>
      <InputGroupInput
        placeholder="Search products &amp; bundles"
        autoFocus
        value={productSearch}
        // Filtering hides rows, which would break the 1:1 mapping the drag
        // reorder relies on — so it's off while reordering.
        disabled={reorderMode}
        onChange={(event) => setProductSearch(event.target.value)}
        // Desktop collapses back to the buttons when the field is left empty;
        // on a phone the dismiss button does that job, so blur is left alone
        // and the on-screen keyboard can't close the field out from under you.
        onBlur={
          isMobile
            ? undefined
            : () => {
                if (productSearch.trim() === '') setSearchOpen(false)
              }
        }
      />
      <InputGroupAddon align="inline-end" className="pr-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Dismiss search"
          onClick={closeSearch}
        >
          <X className="size-4 text-muted-foreground" />
        </Button>
      </InputGroupAddon>
    </InputGroup>
  )

  const searchButton = (
    <Button
      type="button"
      variant="outline"
      className="h-10 px-3 font-normal text-muted-foreground"
      disabled={reorderMode}
      onClick={() => setSearchOpen(true)}
    >
      <Search className="size-4" />
      Search
    </Button>
  )

  const channelField = (
    <SelectFilter
      label="Channel"
      options={CHANNEL_FILTER_OPTIONS}
      value={channelFilter}
      onChange={setChannelFilter}
      disabled={reorderMode}
      className={isMobile ? 'w-full justify-start' : undefined}
      contentClassName={isMobile ? 'w-[calc(100vw-2rem)]' : undefined}
    />
  )

  // "Select" acts on whichever list the screen is showing — the products, or
  // the categories on the picker screen. Leaving the mode discards its picks.
  const selectActive = showsProductList ? selectMode : categorySelectMode
  function selectToggle(
    variant: 'ghost' | 'outline',
    className?: string,
  ) {
    return (
      <Button
        type="button"
        variant={variant}
        className={cn('h-10 px-3', className)}
        disabled={showsProductList ? reorderMode : categoryReorderMode}
        onClick={() => {
          if (showsProductList) {
            setSelectedProductIds([])
            setSelectMode(!selectMode)
          } else {
            setSelectedCategoryIds([])
            setCategorySelectMode(!categorySelectMode)
          }
        }}
      >
        {selectActive ? (
          'Cancel'
        ) : (
          <>
            <SquareDashed className="size-4 text-muted-foreground" />
            Select
          </>
        )}
      </Button>
    )
  }

  // Mobile's first toolbar row: a search shortcut and a select toggle at
  // opposite ends, with the search field taking over the row once opened.
  const mobileSearchRow = searchOpen ? (
    searchField
  ) : (
    <div className="flex w-full items-center justify-between">
      <Button
        type="button"
        variant="ghost"
        className="h-10 px-3"
        disabled={reorderMode || categoryReorderMode}
        onClick={() => setSearchOpen(true)}
      >
        <Search className="size-4 text-muted-foreground" />
        Search
      </Button>
      {selectToggle('ghost')}
    </div>
  )

  const reorderButton = (
    <Button
      type="button"
      variant="outline"
      className={cn('h-10 px-3', isMobile && MOBILE_TOOLBAR_BUTTON)}
      disabled={!reorderMode && !canReorderAnything}
      onClick={() => {
        setReorderMode((current) => !current)
        // Dragging and picking are separate jobs, so entering either one drops
        // whatever the other had going.
        setSelectMode(false)
        setSelectedProductIds([])
      }}
    >
      {reorderMode ? 'Done' : 'Reorder'}
    </Button>
  )

  const actionsMenu = (
    <BulkActionsMenu
      selectedCount={selectedCount}
      // Everything in here either needs a selection or reshuffles the list, so
      // it's out of reach while reordering.
      disabled={reorderMode}
      triggerClassName={isMobile ? MOBILE_TOOLBAR_BUTTON : undefined}
      leading={
        <DropdownMenuItem onSelect={() => setSortDialogOpen(true)}>
          <ArrowDownUp className="size-4" />
          Sort by availability: {sortByAvailability ? 'On' : 'Off'}
        </DropdownMenuItem>
      }
      onDuplicate={duplicateSelectedProducts}
      onDelete={() => setBulkDeleteOpen(true)}
    />
  )

  // The category screen's own trio: reorder the list, act on what's checked,
  // and add to it.
  const categoryReorderButton = (
    <Button
      type="button"
      variant="outline"
      className={cn('h-10 px-3', MOBILE_TOOLBAR_BUTTON)}
      disabled={categorySelectMode}
      onClick={() => setCategoryReorderMode((current) => !current)}
    >
      {categoryReorderMode ? 'Done' : 'Reorder'}
    </Button>
  )

  const categoryActionsMenu = (
    <BulkActionsMenu
      selectedCount={selectedCategories.length}
      disabled={categoryReorderMode}
      triggerClassName={MOBILE_TOOLBAR_BUTTON}
      onDuplicate={() => {
        duplicateCategories(selectedCategories)
        setSelectedCategoryIds([])
      }}
      onDelete={() => setPendingCategoryDelete(selectedCategories)}
    />
  )

  // Just "Add" — the row's three buttons split the width evenly, and a third of
  // a phone doesn't hold "Add category". The screen is the category picker, so
  // there's nothing else it could be adding.
  const addCategoryButton = (
    <Button
      type="button"
      className={cn('h-10 px-3', MOBILE_TOOLBAR_BUTTON)}
      disabled={categoryReorderMode}
      onClick={() => setCategoryDialog({ mode: 'add' })}
    >
      <Plus className="size-4" />
      Add
    </Button>
  )

  // Categories get their own screen on mobile, so adding one from here would be
  // a detour — the option stays on desktop and on the category-less landing
  // page, where it's the only way in.
  const canAddCategoryFromMenu = !isMobile || !hasCategories
  const addMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          className={cn('h-10 px-3', isMobile && MOBILE_TOOLBAR_BUTTON)}
          disabled={reorderMode}
        >
          <Plus className="size-4" />
          Add
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem onSelect={addProduct}>
          <Package className="size-4" />
          Add product
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={addBundle}>
          <Boxes className="size-4" />
          Add bundle
        </DropdownMenuItem>
        {canAddCategoryFromMenu ? (
          <DropdownMenuItem onSelect={() => setCategoryDialog({ mode: 'add' })}>
            <Folder className="size-4" />
            Add category
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  // Search spans the catalog, so its results aren't a category's list any more.
  const pageTitle =
    !isMobile || isSearching
      ? 'Products & Bundles'
      : !mobileShowsProducts
        ? 'Select category'
        : hasCategories
          ? selectedCategoryName
          : 'Products & Bundles'

  return (
    <>
      <div className="w-full">
        {/* 16px of breathing room between the title, the toolbar and the cards
            on a phone; 32px once there's room for it. */}
        <header className="relative mb-4 flex items-center justify-center md:mb-8">
          {/* Only the category's products screen sits on top of something to go
              back to — the category list and the category-less products list are
              both the landing screen, which the bottom nav already covers. */}
          {isMobile && hasCategories && mobileShowsProducts ? (
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              aria-label="Go back"
              onClick={backToCategories}
              className="absolute left-0 md:hidden"
            >
              <ArrowLeft className="size-5" />
            </Button>
          ) : null}
          <h1 className="text-2xl font-semibold tracking-normal text-neutral-900">
            {pageTitle}
          </h1>
        </header>

        {isMobile ? (
          // Search/select, then the channel filter, then the actions — one row
          // each, 8px apart, like the All Orders mobile toolbar. Both screens
          // share this shape, and the search row keeps its slot across them, so
          // typing a query on the category screen doesn't drop focus when the
          // results take over.
          <div className="mb-4 flex w-full flex-col gap-2">
            {mobileSearchRow}
            {showsProductList ? channelField : null}
            <div className="flex w-full items-center gap-2">
              {/* With the field holding the row above, the select toggle drops
                  into the slot Reorder would have had — reordering is off
                  while a filter is applied anyway. */}
              {searchOpen
                ? selectToggle('outline', MOBILE_TOOLBAR_BUTTON)
                : showsProductList
                  ? reorderButton
                  : categoriesReorderable
                    ? categoryReorderButton
                    : null}
              {showsProductList ? actionsMenu : categoryActionsMenu}
              {showsProductList ? addMenu : addCategoryButton}
            </div>
          </div>
        ) : (
          /* Full-width toolbar: search + channel filter on the left, Reorder /
             Actions / Add on the right. Opening search hands it both slots. */
          <div className="mb-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3">
              {searchOpen ? (
                searchField
              ) : (
                <>
                  {searchButton}
                  {channelField}
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              {reorderButton}
              {actionsMenu}
              {addMenu}
            </div>
          </div>
        )}

        <div className="flex w-full flex-col gap-8 xl:flex-row xl:items-start">
          {/* Left column: the category list, with the catch-all pinned last. */}
          {showCategories ? (
          <div className="flex w-full flex-col gap-3 xl:sticky xl:top-8 xl:w-[350px] xl:shrink-0 xl:self-start">
            <ListSurface mobile={isMobile}>
                {categories.length === 0 ? (
                  <p className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                    <Folder className="size-4 shrink-0" />
                    No categories
                  </p>
                ) : (
                  displayedCategories.map((entry, index) => {
                  const dragProps =
                    !entry.isDefault && categoriesDraggable
                      ? {
                          draggable: true,
                          onDragStart: (event: React.DragEvent<HTMLElement>) => {
                            setRowDragImage(event)
                            categoryDragIndex.current = index
                            setDraggingCategoryId(entry.id)
                          },
                          onDragOver: (event: React.DragEvent) => {
                            if (categoryDragIndex.current === null) return
                            // Never let a real category drop past the catch-all.
                            if (index >= categories.length) return
                            event.preventDefault()
                            if (categoryDragIndex.current !== index) {
                              moveCategory(categoryDragIndex.current, index)
                              categoryDragIndex.current = index
                            }
                          },
                          onDragEnd: () => {
                            categoryDragIndex.current = null
                            setDraggingCategoryId(null)
                          },
                        }
                      : undefined
                  return (
                    <CategoryRow
                      key={entry.id}
                      name={entry.name}
                      image={entry.image}
                      count={productCountFor(entry.id)}
                      // On mobile the list is a menu you tap through, so no row
                      // stays marked as current.
                      selected={!isMobile && selectedCategoryId === entry.id}
                      isDefault={entry.isDefault}
                      mobile={isMobile}
                      className={isMobile ? 'rounded-none' : undefined}
                      reorderable={!entry.isDefault && categoriesDraggable}
                      listReorderable={categoriesDraggable}
                      selectMode={categoriesSelectable}
                      // The catch-all is nobody's to duplicate or delete, so it
                      // sits the selection out.
                      selectable={!entry.isDefault}
                      checked={selectedCategoryIds.includes(entry.id)}
                      dragging={draggingCategoryId === entry.id}
                      rowRef={(node) => registerCategoryRow(entry.id, node)}
                      onSelect={() => {
                        setSelectedCategoryId(entry.id)
                        // The selection is scoped to the list on screen.
                        setSelectedProductIds([])
                        // On mobile the row is a link into the category's own
                        // products screen.
                        setMobileView('products')
                      }}
                      onCheckedChange={(checked) =>
                        toggleCategorySelected(entry.id, checked)
                      }
                      onEdit={() =>
                        setCategoryDialog({
                          mode: 'edit',
                          category: entry.category,
                        })
                      }
                      onCopyLink={() => copyCategoryLink(entry.category)}
                      onDuplicate={() => duplicateCategories([entry.category])}
                      onDelete={() => setPendingCategoryDelete([entry.category])}
                      dragProps={dragProps}
                    />
                  )
                  })
                )}
            </ListSurface>
            {/* Only worth saying once there's more than the catch-all to pick
                from, and only where both columns are on screen at once. While
                the handles are out the rows aren't pickers, so the hint says
                what they are instead. */}
            {hasCategories && !isMobile ? (
              <p className="text-sm text-muted-foreground">
                {categoriesDraggable
                  ? 'Drag a category to reorder the list'
                  : 'Select a category to view its products'}
              </p>
            ) : null}
          </div>
          ) : null}

          {/* Right column: the products filed under the selected category. */}
          {showProducts ? (
          <div className="flex w-full flex-col gap-3 xl:flex-1">
            <ListSurface mobile={isMobile}>
                {displayedProducts.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    {isSearching
                      ? 'No products match your search.'
                      : isFiltering
                        ? 'No products match your filters.'
                        : 'No products in this category.'}
                  </p>
                ) : (
                  <>
                    {displayedProducts.map((product, index) => {
                      const dragProps = productsReorderable
                        ? {
                            draggable: true,
                            onDragStart: (
                              event: React.DragEvent<HTMLElement>,
                            ) => {
                              setRowDragImage(event)
                              productDragIndex.current = index
                              setDraggingProductId(product.id)
                            },
                            onDragOver: (event: React.DragEvent) => {
                              if (productDragIndex.current === null) return
                              event.preventDefault()
                              if (productDragIndex.current !== index) {
                                moveProductInView(
                                  productDragIndex.current,
                                  index,
                                )
                                productDragIndex.current = index
                              }
                            },
                            onDragEnd: () => {
                              productDragIndex.current = null
                              setDraggingProductId(null)
                            },
                          }
                        : undefined
                      return (
                        <ProductRow
                          key={product.id}
                          product={product}
                          mobile={isMobile}
                          reorderMode={reorderMode}
                          reorderable={productsReorderable}
                          selected={selectedProductIds.includes(product.id)}
                          selectable={productsSelectable}
                          hasCategories={hasCategories}
                          dragging={draggingProductId === product.id}
                          rowRef={(node) => registerProductRow(product.id, node)}
                          onSelectedChange={(selected) =>
                            toggleProductSelected(product.id, selected)
                          }
                          onChannelsChange={(channels) =>
                            updateProduct(product.id, { channels })
                          }
                          onEdit={editProduct}
                          onChangeCategories={() => setCategoriesProduct(product)}
                          onCopyLink={() => copyProductLink(product)}
                          onDuplicate={() => duplicateProduct(product)}
                          onDelete={() => setPendingProductDelete(product)}
                          dragProps={dragProps}
                        />
                      )
                    })}
                  </>
                )}
            </ListSurface>
          </div>
          ) : null}
        </div>
      </div>

      {categoryDialog ? (
        <CategoryDialog
          mode={categoryDialog.mode}
          category={
            categoryDialog.mode === 'edit' ? categoryDialog.category : null
          }
          isDefault={
            categoryDialog.mode === 'edit' &&
            categoryDialog.category.id === DEFAULT_CATEGORY_ID
          }
          onOpenChange={(open) => {
            if (!open) setCategoryDialog(null)
          }}
          onSave={saveCategory}
        />
      ) : null}

      {categoriesProduct ? (
        <ChangeCategoriesDialog
          product={categoriesProduct}
          categories={categories}
          onOpenChange={(open) => {
            if (!open) setCategoriesProduct(null)
          }}
          onSave={(values) => saveProductCategories(categoriesProduct, values)}
        />
      ) : null}

      {sortDialogOpen ? (
        <SortByAvailabilityDialog
          value={sortByAvailability}
          onOpenChange={(open) => {
            if (!open) setSortDialogOpen(false)
          }}
          onSave={(value) => {
            setSortByAvailability(value)
            setSortDialogOpen(false)
            toast.success(
              value
                ? 'Sorting by availability'
                : 'No longer sorting by availability',
            )
          }}
        />
      ) : null}

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedCount === 1 ? 'product' : `${selectedCount} products`}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCount === 1
                ? 'This product will be permanently deleted. Past orders containing this product will not be affected.'
                : `These ${selectedCount} products will be permanently deleted. Past orders containing them will not be affected.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={deleteSelectedProducts}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingCategoryDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingCategoryDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingCategoryDelete && pendingCategoryDelete.length > 1
                ? `Delete ${pendingCategoryDelete.length} categories?`
                : 'Delete category?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingCategoryDelete && pendingCategoryDelete.length > 1
                ? 'Any products inside these categories will not be deleted'
                : 'Any products inside this category will not be deleted'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() =>
                pendingCategoryDelete && deleteCategories(pendingCategoryDelete)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingProductDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingProductDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This product will be permanently deleted. Past orders containing
              this product will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() =>
                pendingProductDelete && deleteProduct(pendingProductDelete)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
