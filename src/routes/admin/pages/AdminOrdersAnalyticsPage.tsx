import * as React from 'react'
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  HelpCircle,
  Mail,
} from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TypographyH3, TypographyH4 } from '@/components/ui/typography'
import { CHANNEL_OPTIONS, SelectFilter } from './AdminOrdersAllPage'

// ---------------------------------------------------------------------------
// Date filter (mirrors the Popover + Calendar pattern used on the other pages)
// ---------------------------------------------------------------------------

function formatDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  if (date.getFullYear() !== new Date().getFullYear()) {
    options.year = 'numeric'
  }
  return date.toLocaleDateString('en-US', options)
}

function rangesEqual(a?: DateRange, b?: DateRange) {
  return (
    a?.from?.getTime() === b?.from?.getTime() && a?.to?.getTime() === b?.to?.getTime()
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
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className={cn('min-w-0 truncate', !appliedRange?.from && 'text-muted-foreground')}>
            {label}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[300px] p-3">
        <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={1} />
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

// ---------------------------------------------------------------------------
// Mock data — warm palette mapped to the theme's --chart-1..5 tokens.
// ---------------------------------------------------------------------------

const AMBER = 'var(--primary)'
const ORANGE = '#F97316'

// ~5-day buckets across the range; with XAxis interval={2} every third tick is
// shown, surfacing 20 Apr / 5 May / 20 May / 4 Jun / 19 Jun.
const TREND_LABELS = [
  '20 Apr',
  '25 Apr',
  '30 Apr',
  '5 May',
  '10 May',
  '15 May',
  '20 May',
  '25 May',
  '30 May',
  '4 Jun',
  '9 Jun',
  '14 Jun',
  '19 Jun',
]

function buildTrend(values: number[]) {
  return TREND_LABELS.map((label, i) => ({ label, value: values[i] }))
}

const VISITOR_TREND = buildTrend([6, 9, 12, 14, 11, 8, 10, 13, 15, 12, 9, 11, 14])
const SALES_TREND = buildTrend([2, 4, 3, 6, 8, 7, 10, 14, 18, 24, 31, 22, 16])
const ORDERS_TREND = buildTrend([0, 1, 1, 2, 1, 2, 3, 2, 3, 4, 3, 2, 3])
const AVG_ORDER_TREND = buildTrend([8, 10, 9, 12, 15, 13, 16, 20, 24, 28, 32, 26, 22])

// Vibrant warm palette: primary, orange, pink, then similar tones for extras.
const BAR_COLORS = ['var(--primary)', '#F97316', '#EF4444', '#F43F5E', '#FB7185', '#FBBF24']

function withBarColors(items: { name: string; value: number }[]) {
  return items.map((item, i) => ({ ...item, fill: BAR_COLORS[i % BAR_COLORS.length] }))
}

const formatMoney = (value: number | string) =>
  `$${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const VISITOR_SOURCES = withBarColors([
  { name: 'Cococart', value: 78 },
  { name: 'Google', value: 46 },
  { name: 'Instagram', value: 33 },
  { name: 'Facebook', value: 19 },
  { name: 'Others', value: 8 },
])

const TOP_PRODUCTS = withBarColors([
  { name: 'Iced Coffee', value: 128 },
  { name: 'Brunch Bowl', value: 96 },
  { name: 'Chocolate Chunk Cookie', value: 74 },
  { name: 'Avocado Toast', value: 52 },
  { name: 'Matcha Latte', value: 38 },
])

const PAYMENT_METHODS = withBarColors([
  { name: 'Cash', value: 1284.5 },
  { name: 'Bank Transfer', value: 226.75 },
])

const FULFILLMENT_METHODS = withBarColors([
  { name: 'Pickup method 2', value: 40 },
  { name: 'Delivery Zone 2 (3-5km)', value: 33 },
  { name: 'Pickup method 1', value: 27 },
])

// ---------------------------------------------------------------------------
// Reusable card pieces
// ---------------------------------------------------------------------------

// 16px padding on mobile, 24px on desktop (header/content are padded, not Card).
const CARD_CLASS =
  'py-4 shadow-none md:py-6 [&_[data-slot=card-header]]:px-4 [&_[data-slot=card-content]]:px-4 md:[&_[data-slot=card-header]]:px-6 md:[&_[data-slot=card-content]]:px-6'

function CardQuestion({
  children,
  help,
}: {
  children: React.ReactNode
  help?: string
}) {
  return (
    <CardDescription className="flex items-center gap-1.5 text-sm font-medium text-foreground">
      {children}
      {help ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" aria-label="More info" className="inline-flex text-muted-foreground">
              <HelpCircle className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-56 text-center">{help}</TooltipContent>
        </Tooltip>
      ) : null}
    </CardDescription>
  )
}

function AreaMetricCard({
  title,
  seriesLabel,
  help,
  value,
  data,
  color,
  yDomain,
  yTicks,
  valueFormatter,
}: {
  title: string
  seriesLabel: string
  help?: string
  value: string
  data: { label: string; value: number }[]
  color: string
  yDomain: [number, number]
  yTicks: number[]
  valueFormatter?: (value: number | string) => React.ReactNode
}) {
  const gradientId = `fill-${React.useId().replace(/:/g, '')}`
  const config = { value: { label: seriesLabel, color } } satisfies ChartConfig
  return (
    <Card className={CARD_CLASS}>
      <CardHeader className="gap-1">
        <CardQuestion help={help}>{title}</CardQuestion>
        <CardTitle className="text-sm font-semibold tabular-nums md:text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[180px] w-full">
          <AreaChart data={data} margin={{ left: -16, right: 12, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={2}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              width={40}
              domain={yDomain}
              ticks={yTicks}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent valueFormatter={valueFormatter} />}
            />
            <Area
              dataKey="value"
              type="monotone"
              stroke="var(--color-value)"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function BarRankCard({
  title,
  data,
  categoryWidth,
  tooltipLabel,
}: {
  title: string
  data: { name: string; value: number; fill: string }[]
  categoryWidth: number
  tooltipLabel: string
}) {
  const config = { value: { label: tooltipLabel } } satisfies ChartConfig
  return (
    <Card className={CARD_CLASS}>
      <CardHeader>
        <CardQuestion>{title}</CardQuestion>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[220px] w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
          >
            <XAxis type="number" dataKey="value" hide />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={categoryWidth}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="value" radius={5}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function PieBreakdownCard({
  title,
  data,
  valueFormatter,
}: {
  title: string
  data: { name: string; value: number; fill: string }[]
  valueFormatter?: (value: number | string) => React.ReactNode
}) {
  const config = Object.fromEntries(
    data.map((entry) => [entry.name, { label: entry.name, color: entry.fill }]),
  ) satisfies ChartConfig
  return (
    <Card className={CARD_CLASS}>
      <CardHeader>
        <CardQuestion>{title}</CardQuestion>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="mx-auto h-[280px] w-full">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent nameKey="name" hideLabel valueFormatter={valueFormatter} />
              }
            />
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} strokeWidth={2}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              verticalAlign="bottom"
              content={
                <ChartLegendContent nameKey="name" className="flex-wrap gap-x-4 gap-y-2" />
              }
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Email reports settings dialog (mirrors the Review settings dialog)
// ---------------------------------------------------------------------------

// Half-hour slots from 12:00AM through 11:30PM for the report schedule.
const SCHEDULE_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour24 = Math.floor(i / 2)
  const minutes = i % 2 === 0 ? '00' : '30'
  const period = hour24 < 12 ? 'AM' : 'PM'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return `${hour12}:${minutes}${period}`
})

function EmailReportsDialog({
  open,
  onOpenChange,
  daily,
  onDailyChange,
  additionalRecipients,
  onAdditionalRecipientsChange,
  recipients,
  onRecipientsChange,
  schedule,
  onScheduleChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  daily: boolean
  onDailyChange: (value: boolean) => void
  additionalRecipients: boolean
  onAdditionalRecipientsChange: (value: boolean) => void
  recipients: string
  onRecipientsChange: (value: string) => void
  schedule: string
  onScheduleChange: (value: string) => void
}) {
  // Snapshot the values when the dialog opens so Save can stay disabled until
  // one of the fields actually changes.
  const [initial, setInitial] = React.useState({
    daily,
    additionalRecipients,
    recipients,
    schedule,
  })
  React.useEffect(() => {
    if (open) {
      setInitial({ daily, additionalRecipients, recipients, schedule })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const isDirty =
    daily !== initial.daily ||
    additionalRecipients !== initial.additionalRecipients ||
    recipients !== initial.recipients ||
    schedule !== initial.schedule

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="[&_[data-slot=dialog-close]]:size-10">
        <DialogHeader>
          <DialogTitle asChild>
            <TypographyH4 className="text-center font-semibold">Email reports</TypographyH4>
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
        <FieldGroup className="gap-6">
          <FieldLabel
            htmlFor="daily-report"
            className="w-full flex-col items-start gap-1 font-normal"
          >
            <div className="flex w-full items-center justify-between gap-3">
              <FieldTitle>Receive daily email reports</FieldTitle>
              <Switch id="daily-report" checked={daily} onCheckedChange={onDailyChange} />
            </div>
            <FieldDescription>Admins will receive the email</FieldDescription>
          </FieldLabel>

          {daily ? (
            <>
              {/* Additional recipients — the textarea shows only when toggled on */}
              <div className="flex flex-col gap-3">
                <FieldLabel
                  htmlFor="additional-recipients"
                  className="w-full flex-col items-start gap-1 font-normal"
                >
                  <div className="flex w-full items-center justify-between gap-3">
                    <FieldTitle>Additional recipients</FieldTitle>
                    <Switch
                      id="additional-recipients"
                      aria-label="Additional recipients"
                      checked={additionalRecipients}
                      onCheckedChange={onAdditionalRecipientsChange}
                    />
                  </div>
                  <FieldDescription>Separate multiple emails by commas</FieldDescription>
                </FieldLabel>
                {additionalRecipients ? (
                  <Textarea
                    value={recipients}
                    onChange={(event) => onRecipientsChange(event.target.value)}
                    placeholder="jane@example.com, john@example.com"
                    className="min-h-10 bg-background text-sm"
                  />
                ) : null}
              </div>

              {/* Schedule — the time select sits on its own row below */}
              <div className="flex flex-col gap-3">
                <FieldContent>
                  <FieldTitle>Schedule</FieldTitle>
                  <FieldDescription>Includes past 24hr sales</FieldDescription>
                </FieldContent>
                <Select value={schedule} onValueChange={onScheduleChange}>
                  <SelectTrigger className="h-10! w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {SCHEDULE_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : null}
        </FieldGroup>
        </DialogBody>
        <DialogFooter className="flex-row">
          <Button variant="outline" className="h-10 flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="h-10 flex-1"
            disabled={!isDirty}
            onClick={() => {
              onOpenChange(false)
              toast.success('Email report settings saved')
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
// Page
// ---------------------------------------------------------------------------

export function AdminOrdersAnalyticsPage() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(2026, 3, 20),
    to: new Date(2026, 5, 25),
  })
  const [period, setPeriod] = React.useState('week')
  const [channel, setChannel] = React.useState<string | null>(null)
  const [excludePending, setExcludePending] = React.useState(false)
  const [emailReportsOpen, setEmailReportsOpen] = React.useState(false)
  const [dailyReports, setDailyReports] = React.useState(true)
  const [additionalRecipients, setAdditionalRecipients] = React.useState(false)
  const [recipients, setRecipients] = React.useState('')
  const [schedule, setSchedule] = React.useState('9:00AM')

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center md:block">
          <Button
            variant="outline"
            className="h-10 w-10 shrink-0 px-0 md:hidden"
            aria-label="Go back"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <TypographyH3 className="flex-1 text-center md:flex-none md:text-left">
            Analytics
          </TypographyH3>
          {/* Mobile: email reports as an icon button, right-aligned in the title row */}
          <Button
            variant="outline"
            className="h-10 w-10 shrink-0 px-0 text-foreground md:hidden"
            aria-label="Email reports"
            onClick={() => setEmailReportsOpen(true)}
          >
            <Mail className="size-5" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:gap-2">
        {/* Date + period share one equal-width row on mobile; md:contents lets
            them flow back into the toolbar's own flex layout on desktop. */}
        <div className="flex items-center gap-2 md:contents">
          <InlineDateFilter
            appliedRange={dateRange}
            onApply={setDateRange}
            className="min-w-0 flex-1 justify-start md:w-auto md:flex-none"
          />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-10! min-w-0 flex-1 md:w-[130px] md:flex-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <SelectFilter
          label="Channel"
          options={CHANNEL_OPTIONS}
          value={channel}
          onChange={setChannel}
          className="w-full justify-start md:w-auto"
          contentClassName="w-(--radix-dropdown-menu-trigger-width) md:w-auto"
        />
        <label
          htmlFor="analytics-exclude-pending"
          className="flex h-10 w-full cursor-pointer flex-row-reverse items-center justify-between gap-3 rounded-md border border-border bg-background px-3 shadow-xs transition-colors hover:bg-muted/50 md:w-auto md:flex-row md:justify-start"
        >
          <Switch
            id="analytics-exclude-pending"
            checked={excludePending}
            onCheckedChange={setExcludePending}
          />
          <span
            className={cn(
              'text-sm font-normal',
              !excludePending && 'text-muted-foreground',
            )}
          >
            Exclude pending orders
          </span>
        </label>
        <Button
          variant="outline"
          className="hidden h-10 px-3 md:ml-auto md:inline-flex"
          onClick={() => setEmailReportsOpen(true)}
        >
          <Mail className="size-4" />
          Email reports
        </Button>
      </div>

      <EmailReportsDialog
        open={emailReportsOpen}
        onOpenChange={setEmailReportsOpen}
        daily={dailyReports}
        onDailyChange={setDailyReports}
        additionalRecipients={additionalRecipients}
        onAdditionalRecipientsChange={setAdditionalRecipients}
        recipients={recipients}
        onRecipientsChange={setRecipients}
        schedule={schedule}
        onScheduleChange={setSchedule}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        <AreaMetricCard
          title="How many unique visitors?"
          seriesLabel="Visitors"
          value="88"
          data={VISITOR_TREND}
          color={ORANGE}
          yDomain={[0, 16]}
          yTicks={[0, 4, 8, 12, 16]}
        />
        <BarRankCard
          title="Where are my visitors coming from?"
          data={VISITOR_SOURCES}
          categoryWidth={72}
          tooltipLabel="Visitors"
        />
        <AreaMetricCard
          title="How are my sales?"
          seriesLabel="Sales"
          value="$38.78"
          data={SALES_TREND}
          color={ORANGE}
          yDomain={[0, 32]}
          yTicks={[0, 8, 16, 24, 32]}
        />
        <AreaMetricCard
          title="How many orders?"
          seriesLabel="Orders"
          value="3"
          data={ORDERS_TREND}
          color={AMBER}
          yDomain={[0, 4]}
          yTicks={[0, 1, 2, 3, 4]}
        />
        <AreaMetricCard
          title="What is the average order size?"
          seriesLabel="Avg order size"
          value="$12.93"
          data={AVG_ORDER_TREND}
          color={AMBER}
          yDomain={[0, 32]}
          yTicks={[0, 8, 16, 24, 32]}
          valueFormatter={formatMoney}
        />
        <BarRankCard
          title="What are my top products?"
          data={TOP_PRODUCTS}
          categoryWidth={140}
          tooltipLabel="Quantity"
        />
        <PieBreakdownCard
          title="How do customers pay?"
          data={PAYMENT_METHODS}
          valueFormatter={formatMoney}
        />
        <PieBreakdownCard
          title="How do customers get their orders?"
          data={FULFILLMENT_METHODS}
        />
      </div>
    </div>
  )
}
