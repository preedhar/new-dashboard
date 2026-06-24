import * as React from 'react'
import { ArrowLeft, Calendar as CalendarIcon, Download, ShoppingBag, SquareDashed, Truck, type LucideIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'

import productImage from '@/assets/product.png'
import { cn } from '@/lib/utils'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import { TypographyH3 } from '@/components/ui/typography'

// Fulfillment types shown as columns, mirroring the All Orders fulfillment
// options so the summary lines up with how orders are actually fulfilled.
const FULFILLMENT_TYPES: { label: string; icon: LucideIcon }[] = [
  { label: 'Delivery Zone 1 (0-3km)', icon: Truck },
  { label: 'Delivery Zone 2 (3-5Km)', icon: Truck },
  { label: 'Delivery Zone 3 (5+ KM)', icon: Truck },
  { label: 'Pickup method 1', icon: ShoppingBag },
  { label: 'Pickup method 2', icon: ShoppingBag },
]

const PRODUCTS = [
  'BBQ Baby Back Ribs',
  'Caesar Salad',
  'Iced Coffee',
  'Croissant',
  'Latte, Oat Milk',
  'Latte, Full Cream',
  'Americano, Iced',
  'Americano, Hot',
  'Green Tea',
  'Margherita Pizza',
  'Cheeseburger, Single',
  'Cheeseburger, Double',
  'Pad Thai',
  'Cappuccino',
  'Ramen, Tonkotsu',
  'Ramen, Shoyu',
]

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return Math.floor((x - Math.floor(x)) * 1000)
}

type SummaryRow = {
  item: string
  counts: number[]
  none: number
  total: number
}

const SUMMARY_ROWS: SummaryRow[] = PRODUCTS.map((item, i) => {
  // ~55% of cells are empty; non-zero values range 1–30.
  const counts = FULFILLMENT_TYPES.map((_ft, j) => {
    const isEmpty = pseudoRandom(i * 17 + j * 3 + 50) % 10 < 5
    return isEmpty ? 0 : (pseudoRandom(i * 17 + j * 3) % 30) + 1
  })
  const none = pseudoRandom(i + 911) % 3 === 0 ? (pseudoRandom(i + 912) % 15) + 1 : 0
  const total = counts.reduce((sum, n) => sum + n, 0) + none
  return { item, counts, none, total }
})

function OrderCount({ value }: { value: number }) {
  if (value === 0) {
    return <span className="text-muted-foreground/40">–</span>
  }
  return <span>{value}</span>
}

const columns: ColumnDef<SummaryRow>[] = [
  {
    accessorKey: 'item',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Item" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <img src={productImage} alt="" className="size-10 shrink-0 rounded-md object-cover" />
        <span className="font-medium text-foreground">{row.original.item}</span>
      </div>
    ),
    meta: { className: 'min-w-[200px]', headerClassName: 'min-w-[200px]' },
  },
  ...FULFILLMENT_TYPES.map(
    ({ label, icon: Icon }, idx): ColumnDef<SummaryRow> => ({
      id: `fulfillment-${idx}`,
      header: () => (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="size-4 shrink-0" />
          <span>{label}</span>
        </div>
      ),
      enableSorting: false,
      cell: ({ row }) => <OrderCount value={row.original.counts[idx]} />,
    }),
  ),
  {
    id: 'none',
    header: () => (
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <SquareDashed className="size-4 shrink-0" />
        <span>No Fulfillment method</span>
      </div>
    ),
    enableSorting: false,
    cell: ({ row }) => <OrderCount value={row.original.none} />,
  },
  {
    accessorKey: 'total',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
    cell: ({ row }) => (
      <span className="font-semibold text-foreground">{row.original.total}</span>
    ),
  },
]

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function rangesEqual(a?: DateRange, b?: DateRange) {
  return (
    a?.from?.getTime() === b?.from?.getTime() &&
    a?.to?.getTime() === b?.to?.getTime()
  )
}

function InlineDateFilter({
  appliedRange,
  onApply,
  className,
}: {
  appliedRange: DateRange | undefined
  onApply: (range: DateRange | undefined) => void
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [range, setRange] = React.useState<DateRange | undefined>(appliedRange)

  const canClear = Boolean(range?.from || appliedRange?.from)
  const canApply = !rangesEqual(range, appliedRange)

  const label =
    appliedRange?.from && appliedRange?.to
      ? `${formatDate(appliedRange.from)} – ${formatDate(appliedRange.to)}`
      : appliedRange?.from
        ? formatDate(appliedRange.from)
        : 'Select dates'

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) setRange(appliedRange)
  }

  function clearAll() {
    setRange(undefined)
    onApply(undefined)
    setOpen(false)
  }

  function apply() {
    onApply(range)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('h-10 px-3 font-normal', className)}>
          <CalendarIcon className="size-4 text-muted-foreground" />
          <span className={appliedRange?.from ? '' : 'text-muted-foreground'}>{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[300px] p-3">
        <div>
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={1}
          />
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <Button variant="ghost" className="h-10 px-3" onClick={clearAll} disabled={!canClear}>
            Clear
          </Button>
          <Button className="h-10 px-3" onClick={apply} disabled={!canApply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function AdminOrdersSummaryPage() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => {
    const today = startOfDay(new Date())
    return { from: today, to: today }
  })
  const [bundleSeparately, setBundleSeparately] = React.useState(false)

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb className="md:hidden">
          <BreadcrumbList className="justify-start">
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/orders/all">Orders</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Summary</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center md:block">
          <Button
            variant="outline"
            className="h-10 w-10 shrink-0 px-0 md:hidden"
            aria-label="Go back"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <TypographyH3 className="flex-1 text-center md:flex-none md:text-left">Summary</TypographyH3>
          {/* Balances the back button so the title is truly centered */}
          <div className="size-10 shrink-0 md:hidden" />
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:gap-2">
        <InlineDateFilter
          appliedRange={dateRange}
          onApply={setDateRange}
          className="w-full justify-center md:w-auto"
        />

        <label
          htmlFor="summary-bundle-separately"
          className="flex h-10 w-full cursor-pointer items-center justify-between gap-3 rounded-md border border-border px-3 transition-colors hover:bg-muted/50 md:w-auto"
        >
          <span className="text-sm font-normal">Show bundle products separately</span>
          <Switch
            id="summary-bundle-separately"
            checked={bundleSeparately}
            onCheckedChange={setBundleSeparately}
          />
        </label>

        <div className="flex gap-2 md:ml-auto">
          <Button
            variant="outline"
            className="h-10 flex-1 px-3 md:flex-none"
            onClick={() => toast.success('Order summary exported')}
          >
            <Download className="size-4" />
            Export
          </Button>
          <Button asChild className="h-10 flex-1 px-3 md:flex-none">
            <a href="/admin/orders/all">View orders</a>
          </Button>
        </div>
      </div>

      {/* Mobile: product cards */}
      <div className="-mx-4 flex flex-col divide-y divide-border sm:-mx-6 md:hidden">
        {[...SUMMARY_ROWS].sort((a, b) => a.item.localeCompare(b.item)).map((row) => {
          return (
            <div key={row.item} className="flex flex-col gap-3 px-4 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <img src={productImage} alt="" className="size-10 shrink-0 rounded-md object-cover" />
                <p className="text-sm font-semibold text-foreground">{row.item}</p>
              </div>
              <div className="flex flex-col gap-2">
                {FULFILLMENT_TYPES.map(({ label, icon: Icon }, i) =>
                  row.counts[i] === 0 ? null : (
                    <div key={label} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Icon className="size-4 shrink-0" />
                        <span>{label}</span>
                      </div>
                      <span className="text-sm text-foreground">{row.counts[i]}</span>
                    </div>
                  )
                )}
                {row.none > 0 ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <SquareDashed className="size-4 shrink-0" />
                      <span>No fulfillment method</span>
                    </div>
                    <span className="text-sm text-foreground">{row.none}</span>
                  </div>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">Total</span>
                <span className="text-sm font-semibold text-foreground">{row.total}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop: data table */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={SUMMARY_ROWS}
          defaultSorting={[{ id: 'item', desc: false }]}
        />
      </div>
    </div>
  )
}
