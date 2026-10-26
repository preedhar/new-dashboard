import * as React from 'react'
import {
  ChevronDown,
  CopyPlus,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SquareDashed,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table'

import { cn } from '@/lib/utils'
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
import { Checkbox } from '@/components/ui/checkbox'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Switch } from '@/components/ui/switch'
import { TypographyH3 } from '@/components/ui/typography'
import {
  NEW_DISCOUNT_PATH,
  editDiscountPath,
  updateDiscounts,
  useDiscounts,
  type Discount,
} from '../discounts'

// Client-side navigation matching the app's router (pushState + popstate).
function navigateTo(path: string) {
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function formatDiscount(discount: Discount) {
  return discount.type === 'percent' ? `${discount.value}% off` : `$${discount.value} off`
}

function formatRedemptions(count: number) {
  return `${count.toLocaleString('en-US')} ${count === 1 ? 'redemption' : 'redemptions'}`
}

function showActiveToast(active: boolean) {
  toast.success(`Discount ${active ? 'activated' : 'deactivated'}`)
}

// The first "<code> COPY", "<code> COPY 2", … not already taken.
function getDuplicateCode(code: string, taken: Set<string>) {
  let candidate = `${code} COPY`
  for (let n = 2; taken.has(candidate); n++) candidate = `${code} COPY ${n}`
  return candidate
}

type DiscountRowActions = {
  onDuplicate: (discount: Discount) => void
  onDelete: (discount: Discount) => void
}

// A row's ⋯ menu: per-discount actions that don't need a selection. Clicks
// inside it (including its portaled items, which bubble through React) stop
// here so they don't also open the row or card underneath.
function DiscountRowMenu({
  discount,
  onDuplicate,
  onDelete,
}: { discount: Discount } & DiscountRowActions) {
  return (
    <span
      className="contents"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className="shrink-0 text-muted-foreground"
          aria-label={`Manage ${discount.code}`}
        >
          <MoreHorizontal className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-0">
        <DropdownMenuItem onSelect={() => navigateTo(editDiscountPath(discount.id))}>
          <Pencil className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onDuplicate(discount)}>
          <CopyPlus className="size-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(discount)}>
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </span>
  )
}

function getDiscountColumns(
  onActiveChange: (id: string, active: boolean) => void,
  rowActions: DiscountRowActions,
): ColumnDef<Discount>[] {
  return [
    {
      id: 'select',
      enableSorting: false,
      meta: { className: 'w-10', headerClassName: 'w-10' },
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
          aria-label="Select all discounts"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
          aria-label={`Select ${row.original.code}`}
        />
      ),
    },
    {
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Discount code" />,
      cell: ({ row }) => (
        <p className="font-medium text-foreground">{row.original.code}</p>
      ),
    },
    {
      id: 'discount',
      header: 'Discount',
      enableSorting: false,
      cell: ({ row }) => (
        <p className="text-muted-foreground">{formatDiscount(row.original)}</p>
      ),
    },
    {
      accessorKey: 'redemptions',
      header: 'Redemptions',
      enableSorting: false,
      cell: ({ row }) => (
        <p className="tabular-nums text-muted-foreground">
          {row.original.redemptions.toLocaleString('en-US')}
        </p>
      ),
    },
    {
      accessorKey: 'active',
      sortingFn: 'basic',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Active" />,
      cell: ({ row }) => (
        <Switch
          checked={row.original.active}
          onCheckedChange={(checked) => onActiveChange(row.original.id, checked)}
          aria-label={`${row.original.code} active`}
        />
      ),
    },
    {
      id: 'menu',
      enableSorting: false,
      meta: { className: 'w-14 text-right', headerClassName: 'w-14' },
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => <DiscountRowMenu discount={row.original} {...rowActions} />,
    },
  ]
}

// Bulk actions for the selected discounts. Every action needs a selection.
function DiscountsActionsMenu({
  selectedCount,
  onDuplicate,
  onDelete,
  triggerClassName,
}: {
  selectedCount: number
  onDuplicate: () => void
  onDelete: () => void
  triggerClassName?: string
}) {
  const disabled = selectedCount === 0
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn('h-10 px-3', triggerClassName)}>
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
      <DropdownMenuContent align="end" className="w-auto min-w-0">
        <DropdownMenuItem disabled={disabled} onSelect={onDuplicate}>
          <CopyPlus className="size-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={disabled} onSelect={onDelete}>
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AdminDiscountsPage() {
  const discounts = useDiscounts()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [searching, setSearching] = React.useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false)
  const [selectMode, setSelectMode] = React.useState(false)
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const selectedCount = Object.keys(rowSelection).length

  // The discounts awaiting delete confirmation: one from a row menu, or the
  // whole selection from Actions.
  const [pendingDelete, setPendingDelete] = React.useState<Discount[] | null>(null)

  const handleActiveChange = React.useCallback((id: string, active: boolean) => {
    updateDiscounts((prev) =>
      prev.map((discount) => (discount.id === id ? { ...discount, active } : discount)),
    )
    showActiveToast(active)
  }, [])
  // Each copy lands right after its original with a fresh code, no redemptions,
  // and switched off so it doesn't go live before it's been edited.
  const duplicateDiscounts = React.useCallback((ids: Set<string>) => {
    updateDiscounts((prev) => {
      const taken = new Set(prev.map((discount) => discount.code))
      return prev.flatMap((discount) => {
        if (!ids.has(discount.id)) return [discount]
        const code = getDuplicateCode(discount.code, taken)
        taken.add(code)
        return [
          discount,
          { ...discount, id: crypto.randomUUID(), code, redemptions: 0, active: false },
        ]
      })
    })
    toast.success(ids.size > 1 ? `${ids.size} discounts duplicated` : 'Discount duplicated')
  }, [])
  const rowActions = React.useMemo<DiscountRowActions>(
    () => ({
      onDuplicate: (discount) => duplicateDiscounts(new Set([discount.id])),
      onDelete: (discount) => setPendingDelete([discount]),
    }),
    [duplicateDiscounts],
  )
  const columns = React.useMemo(
    () => getDiscountColumns(handleActiveChange, rowActions),
    [handleActiveChange, rowActions],
  )

  const filteredDiscounts = React.useMemo(() => {
    const search = searchQuery.trim().toLowerCase()
    if (!search) return discounts
    return discounts.filter((discount) => discount.code.toLowerCase().includes(search))
  }, [discounts, searchQuery])

  // The mobile list has no sortable headers, so it mirrors the table's default
  // order: active discounts first.
  const mobileDiscounts = React.useMemo(
    () => [...filteredDiscounts].sort((a, b) => Number(b.active) - Number(a.active)),
    [filteredDiscounts],
  )

  function confirmDelete() {
    if (!pendingDelete) return
    const ids = new Set(pendingDelete.map((discount) => discount.id))
    updateDiscounts((prev) => prev.filter((discount) => !ids.has(discount.id)))
    setRowSelection((prev) =>
      Object.fromEntries(Object.entries(prev).filter(([id]) => !ids.has(id))),
    )
    toast.success(pendingDelete.length > 1 ? 'Discounts deleted' : 'Discount deleted')
    setPendingDelete(null)
  }

  const actionsMenuProps = {
    selectedCount,
    onDuplicate: () => duplicateDiscounts(new Set(Object.keys(rowSelection))),
    onDelete: () => setPendingDelete(discounts.filter((discount) => rowSelection[discount.id])),
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <TypographyH3 className="text-center">Discounts</TypographyH3>

      {/* Mobile toolbar: a search / select row, then equal-width Actions and
          Add discount. Sticks to the top so it stays reachable while the list
          scrolls, spanning the full viewport width (-mx + matching px) so the
          full-bleed card list can't peek through behind it. */}
      <div className="sticky top-0 z-20 -mx-4 flex flex-col gap-2 bg-background px-4 pb-2 pt-2 sm:-mx-6 sm:px-6 md:hidden">
        {mobileSearchOpen ? (
          <InputGroup className="h-10 w-full">
            <InputGroupAddon>
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by code"
              autoFocus
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <InputGroupAddon className="pr-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Dismiss search"
                onClick={() => {
                  setSearchQuery('')
                  setMobileSearchOpen(false)
                }}
              >
                <X className="size-4 text-muted-foreground" />
              </Button>
            </InputGroupAddon>
          </InputGroup>
        ) : (
          <div className="flex w-full items-center justify-between">
            <Button
              variant="ghost"
              className="h-10 px-3"
              disabled={selectMode}
              onClick={() => setMobileSearchOpen(true)}
            >
              <Search className="size-4 text-muted-foreground" />
              Discount
            </Button>
            <Button
              variant="ghost"
              className="h-10 px-3"
              onClick={() => {
                // Leaving select mode discards the current selection.
                if (selectMode) setRowSelection({})
                setSelectMode(!selectMode)
              }}
            >
              {selectMode ? (
                'Cancel'
              ) : (
                <>
                  <SquareDashed className="size-4 text-muted-foreground" />
                  Select
                </>
              )}
            </Button>
          </div>
        )}

        <div className="flex w-full items-center gap-2">
          <DiscountsActionsMenu {...actionsMenuProps} triggerClassName="flex-1" />
          <Button className="h-10 flex-1 px-3" onClick={() => navigateTo(NEW_DISCOUNT_PATH)}>
            <Plus className="size-4" />
            Add discount
          </Button>
        </div>
      </div>

      {/* Desktop toolbar: a toggleable search on the left, Actions and Add
          discount on the right. Sticks to the top while the table scrolls
          beneath it. */}
      <div className="sticky top-0 z-20 hidden items-center gap-2 bg-background py-4 md:flex">
        {searching ? (
          <InputGroup className="h-10 w-auto max-w-[400px] flex-1">
            <InputGroupAddon>
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by code"
              autoFocus
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              // Collapse back to the button when the field is left empty.
              onBlur={() => {
                if (searchQuery.trim() === '') setSearching(false)
              }}
            />
            <InputGroupAddon className="pr-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Dismiss search"
                onClick={() => {
                  setSearchQuery('')
                  setSearching(false)
                }}
              >
                <X className="size-4 text-muted-foreground" />
              </Button>
            </InputGroupAddon>
          </InputGroup>
        ) : (
          <Button
            variant="outline"
            className="h-10 px-3 font-normal text-muted-foreground"
            aria-label="Search discounts"
            onClick={() => setSearching(true)}
          >
            <Search className="size-4" />
            Discount
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <DiscountsActionsMenu {...actionsMenuProps} />
          <Button className="h-10 px-3" onClick={() => navigateTo(NEW_DISCOUNT_PATH)}>
            <Plus className="size-4" />
            Add discount
          </Button>
        </div>
      </div>

      {/* Mobile: discounts as a full-bleed card list. Tapping a card opens it
          for editing (its switch and menu work in place); in select mode a tap
          selects the card instead. */}
      <div className="-mx-4 flex flex-col divide-y divide-border sm:-mx-6 md:hidden">
        {mobileDiscounts.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground sm:px-6">
            No results.
          </p>
        ) : null}
        {mobileDiscounts.map((discount) => {
          const isSelected = Boolean(rowSelection[discount.id])
          const toggleSelected = () =>
            setRowSelection((prev) => {
              const next = { ...prev }
              if (next[discount.id]) {
                delete next[discount.id]
              } else {
                next[discount.id] = true
              }
              return next
            })
          const handleActivate = () => {
            if (selectMode) {
              toggleSelected()
            } else {
              navigateTo(editDiscountPath(discount.id))
            }
          }
          return (
            <div
              key={discount.id}
              role="button"
              tabIndex={0}
              aria-pressed={selectMode ? isSelected : undefined}
              onClick={handleActivate}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  handleActivate()
                }
              }}
              className="flex w-full items-center gap-3 px-4 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-6"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="truncate text-sm font-semibold text-foreground">{discount.code}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDiscount(discount)} · {formatRedemptions(discount.redemptions)}
                </p>
              </div>
              {selectMode ? (
                <Checkbox
                  checked={isSelected}
                  aria-hidden
                  tabIndex={-1}
                  className="pointer-events-none size-4 shrink-0"
                />
              ) : (
                // Stop propagation so the switch doesn't also open the card.
                <div
                  className="flex shrink-0 items-center gap-1"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <Switch
                    checked={discount.active}
                    onCheckedChange={(checked) => handleActiveChange(discount.id, checked)}
                    aria-label={`${discount.code} active`}
                  />
                  <DiscountRowMenu discount={discount} {...rowActions} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Desktop: discounts data table. */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={filteredDiscounts}
          defaultSorting={[{ id: 'active', desc: true }]}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          getRowId={(discount) => discount.id}
          onRowClick={(discount) => navigateTo(editDiscountPath(discount.id))}
        />
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
      >
        {pendingDelete ? (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {pendingDelete.length > 1
                  ? `Delete ${pendingDelete.length} discounts?`
                  : `Delete ${pendingDelete[0].code}?`}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {pendingDelete.length > 1 ? 'These codes' : 'This code'} will stop working at
                checkout. Past orders that used {pendingDelete.length > 1 ? 'them' : 'it'} keep
                their discount.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={confirmDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        ) : null}
      </AlertDialog>
    </div>
  )
}
