import * as React from 'react'
import { ArrowLeft, ChevronRight, ImagePlus, Mail, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import {
  TypographyH3,
  TypographyH4,
  TypographyLarge,
} from '@/components/ui/typography'
import {
  ChooseImageDialog,
  type LibraryImage,
} from '../components/choose-image-dialog'
import {
  CreateEmailDialog,
  EmailCreatedScreen,
} from '../components/create-email-dialog'
import type { ColumnDef } from '@tanstack/react-table'

type EmailCampaign = {
  id: string
  subject: string
  sentAt: Date
  emailsSent: number
  // Share of recipients who clicked through to the store, as a percentage.
  visitRate: number
  // Attributed sales in the store's currency.
  sales: number
}

type Metric = {
  label: string
  value: string
}

// Non-interactive summary tiles for the last 30 days shown above the table.
const METRICS: Metric[] = [
  { label: 'Emails sent', value: '12,480' },
  { label: 'Visits', value: '3,240' },
  { label: 'Sales', value: '$8,920' },
]

const EMAILS: EmailCampaign[] = [
  {
    id: 'em-1024',
    subject: 'Weekend treats are back — 20% off all pastries',
    sentAt: new Date('2026-08-08T09:00:00'),
    emailsSent: 2140,
    visitRate: 26.4,
    sales: 1840,
  },
  {
    id: 'em-1023',
    subject: 'New on the menu: matcha strawberry cake 🍓',
    sentAt: new Date('2026-08-04T14:30:00'),
    emailsSent: 2088,
    visitRate: 22.1,
    sales: 1420,
  },
  {
    id: 'em-1022',
    subject: 'Your loyalty points are about to expire',
    sentAt: new Date('2026-07-30T08:15:00'),
    emailsSent: 1975,
    visitRate: 31.8,
    sales: 2260,
  },
  {
    id: 'em-1021',
    subject: 'A little thank you — free delivery this week',
    sentAt: new Date('2026-07-25T10:45:00'),
    emailsSent: 2050,
    visitRate: 19.7,
    sales: 980,
  },
  {
    id: 'em-1020',
    subject: 'Pre-order for the long weekend is now open',
    sentAt: new Date('2026-07-19T16:00:00'),
    emailsSent: 1920,
    visitRate: 24.9,
    sales: 1560,
  },
  {
    id: 'em-1019',
    subject: "We miss you — here's 15% off your next order",
    sentAt: new Date('2026-07-12T09:30:00'),
    emailsSent: 1640,
    visitRate: 17.2,
    sales: 720,
  },
  {
    id: 'em-1018',
    subject: 'Behind the counter: meet our head baker',
    sentAt: new Date('2026-07-05T11:00:00'),
    emailsSent: 1888,
    visitRate: 14.5,
    sales: 410,
  },
]

function formatDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  // Only show the year when it differs from the current year.
  if (date.getFullYear() !== new Date().getFullYear()) {
    options.year = 'numeric'
  }
  return date.toLocaleDateString('en-US', options)
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString('en-US')}`
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

// Empty placeholder standing in for the email's thumbnail image.
function EmailThumbnail({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'shrink-0 rounded-md border border-border bg-muted',
        className,
      )}
    />
  )
}

// Client-side navigation to a full-page email preview. The email id rides in the
// query string since the router matches on pathname only.
function navigateToEmailDetail(emailId: string) {
  window.history.pushState(
    null,
    '',
    `/admin/marketing/email/detail?email=${encodeURIComponent(emailId)}`,
  )
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function getEmailColumns(): ColumnDef<EmailCampaign>[] {
  return [
    {
      accessorKey: 'subject',
      header: 'Email',
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-3">
          <EmailThumbnail className="size-10" />
          <span className="truncate font-medium text-foreground">
            {row.original.subject}
          </span>
        </div>
      ),
      meta: { className: 'max-w-[360px]' },
    },
    {
      accessorKey: 'sentAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sent at" />
      ),
      cell: ({ row }) => (
        <div className="whitespace-nowrap text-muted-foreground">
          {formatDate(row.original.sentAt)}, {formatTime(row.original.sentAt)}
        </div>
      ),
      sortingFn: (a, b) =>
        a.original.sentAt.getTime() - b.original.sentAt.getTime(),
    },
    {
      accessorKey: 'emailsSent',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Emails sent"
          className="justify-end"
        />
      ),
      cell: ({ row }) => (
        <div className="text-right tabular-nums text-muted-foreground">
          {row.original.emailsSent.toLocaleString('en-US')}
        </div>
      ),
      meta: { className: 'text-right', headerClassName: 'text-right' },
    },
    {
      accessorKey: 'visitRate',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Visit rate"
          className="justify-end"
        />
      ),
      cell: ({ row }) => (
        <div className="text-right tabular-nums text-muted-foreground">
          {formatPercent(row.original.visitRate)}
        </div>
      ),
      meta: { className: 'text-right', headerClassName: 'text-right' },
    },
    {
      accessorKey: 'sales',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Sales"
          className="justify-end"
        />
      ),
      cell: ({ row }) => (
        <div className="text-right tabular-nums text-muted-foreground">
          {formatCurrency(row.original.sales)}
        </div>
      ),
      meta: { className: 'text-right', headerClassName: 'text-right' },
    },
  ]
}

// The preview shown in the right pane (desktop) or as a full page (mobile).
// The subject and metadata sit above an intentionally empty preview placeholder.
function EmailPreviewPane({
  email,
  onClose,
  onBack,
  hideClose = false,
  className,
}: {
  email: EmailCampaign
  onClose: () => void
  // When provided, a back button is shown before the title in the header.
  onBack?: () => void
  hideClose?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex max-h-[calc(100vh-96px)] w-[420px] flex-col overflow-hidden rounded-lg border border-border bg-background',
        className,
      )}
    >
      <header className="flex items-start gap-3 p-4">
        {onBack ? (
          <Button
            variant="outline"
            size="icon-lg"
            aria-label="Back to emails"
            className="shrink-0 text-foreground"
            onClick={onBack}
          >
            <ArrowLeft className="size-5" />
          </Button>
        ) : null}
        <div className="min-w-0 flex-1">
          <TypographyH4>{email.subject}</TypographyH4>
          <p className="mt-2 text-sm text-muted-foreground">
            Sent {formatDate(email.sentAt)}, {formatTime(email.sentAt)}
          </p>
        </div>
        {!hideClose ? (
          <Button
            variant="secondary"
            size="icon-lg"
            aria-label="Close"
            className="shrink-0 text-muted-foreground"
            onClick={onClose}
          >
            <X className="size-5" />
          </Button>
        ) : null}
      </header>

      {/* Preview placeholder — intentionally left empty. */}
      <div className="flex-1 overflow-auto p-4">
        <div className="min-h-[420px] rounded-md border border-dashed border-border bg-muted/30" />
      </div>
    </div>
  )
}

// Mailing list settings dialog (mirrors the Analytics email reports dialog).
function MailingListDialog({
  open,
  onOpenChange,
  allowSubscribe,
  onAllowSubscribeChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  allowSubscribe: boolean
  onAllowSubscribeChange: (value: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="[&_[data-slot=dialog-close]]:size-10">
        <DialogHeader>
          <DialogTitle asChild>
            <TypographyH4 className="text-center font-semibold">Mailing list</TypographyH4>
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <FieldGroup className="gap-6">
            <FieldLabel
              htmlFor="allow-subscribe"
              className="w-full flex-col items-start gap-1 font-normal"
            >
              <div className="flex w-full items-center justify-between gap-3">
                <FieldTitle>Allow visitors to subscribe</FieldTitle>
                <Switch
                  id="allow-subscribe"
                  checked={allowSubscribe}
                  onCheckedChange={onAllowSubscribeChange}
                />
              </div>
              <FieldDescription>
                Visitors can subscribe from your welcome page
              </FieldDescription>
            </FieldLabel>
          </FieldGroup>
        </DialogBody>
        <DialogFooter className="flex-row">
          <Button
            variant="outline"
            className="h-10 flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 flex-1"
            onClick={() => {
              onOpenChange(false)
              toast.success('Mailing list settings saved')
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AdminEmailMarketingPage() {
  const columns = React.useMemo(() => getEmailColumns(), [])

  // The open email drives the pane's open/closed state and the active row. A
  // separate id tracks which email's content to render so it stays visible while
  // the pane animates closed after `selectedEmailId` clears.
  const [selectedEmailId, setSelectedEmailId] = React.useState<string | null>(null)
  const [paneEmailId, setPaneEmailId] = React.useState<string | null>(null)
  const selectedEmail = selectedEmailId
    ? (EMAILS.find((email) => email.id === selectedEmailId) ?? null)
    : null
  const paneEmail = paneEmailId
    ? (EMAILS.find((email) => email.id === paneEmailId) ?? null)
    : null

  const [mailingListOpen, setMailingListOpen] = React.useState(false)
  const [allowSubscribe, setAllowSubscribe] = React.useState(true)

  const [createEmailOpen, setCreateEmailOpen] = React.useState(false)
  // Creating an email takes over the whole page with a confirmation until the
  // merchant heads back to the list.
  const [emailCreated, setEmailCreated] = React.useState(false)

  // The image picked for the next email, kept so the picker reopens on it.
  const [chooseImageOpen, setChooseImageOpen] = React.useState(false)
  const [chosenImage, setChosenImage] = React.useState<LibraryImage | null>(null)

  function openEmail(id: string) {
    setSelectedEmailId(id)
    setPaneEmailId(id)
  }

  if (emailCreated) {
    return <EmailCreatedScreen onBack={() => setEmailCreated(false)} />
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <header className="mb-2 flex items-center gap-2 md:mb-4">
        {/* Back button is only shown on mobile; on desktop the sidebar covers
            navigation. */}
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label="Go back"
          onClick={() => window.history.back()}
          className="shrink-0 md:hidden"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <TypographyH3 className="flex-1 text-center md:text-left">
          Email Marketing
        </TypographyH3>
        {/* Choose image and Mailing list: icon buttons on mobile, labelled
            buttons on desktop. */}
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label="Choose image"
          onClick={() => setChooseImageOpen(true)}
          className="shrink-0 text-foreground md:hidden"
        >
          <ImagePlus className="size-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setChooseImageOpen(true)}
          className="hidden h-10 shrink-0 px-3 md:inline-flex"
        >
          <ImagePlus className="size-4" />
          Choose image
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label="Mailing list"
          onClick={() => setMailingListOpen(true)}
          className="shrink-0 text-foreground md:hidden"
        >
          <Mail className="size-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setMailingListOpen(true)}
          className="hidden h-10 shrink-0 px-3 md:inline-flex"
        >
          <Mail className="size-4" />
          Mailing list
        </Button>
      </header>

      <MailingListDialog
        open={mailingListOpen}
        onOpenChange={setMailingListOpen}
        allowSubscribe={allowSubscribe}
        onAllowSubscribeChange={setAllowSubscribe}
      />

      <ChooseImageDialog
        open={chooseImageOpen}
        onOpenChange={setChooseImageOpen}
        value={chosenImage}
        onChange={setChosenImage}
      />

      <CreateEmailDialog
        open={createEmailOpen}
        onOpenChange={setCreateEmailOpen}
        onCreate={() => setEmailCreated(true)}
      />

      <TypographyLarge className="mb-1">Last 30 days</TypographyLarge>

      {/* Non-interactive summary of the last 30 days. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {METRICS.map((metric) => (
          <Card key={metric.label} className="py-4 shadow-none md:py-6">
            <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 md:grid md:items-start md:gap-1.5 md:px-6">
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-sm font-semibold tabular-nums md:text-3xl">
                {metric.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="mt-4 mb-1 flex items-center justify-between gap-4 md:mt-6">
        <TypographyLarge>Emails</TypographyLarge>
        {/* Desktop: button sits inline to the right of the section header. */}
        <Button
          type="button"
          onClick={() => setCreateEmailOpen(true)}
          className="hidden h-10 shrink-0 md:inline-flex"
        >
          <Plus className="size-4" />
          Create email
        </Button>
      </div>

      {/* Mobile: a full-width button below the section header row. */}
      <Button
        type="button"
        onClick={() => setCreateEmailOpen(true)}
        className="mb-1 h-10 w-full md:hidden"
      >
        <Plus className="size-4" />
        Create email
      </Button>

      {/* Mobile: email card list. Tapping a card opens its own detail page. */}
      <div className="-mx-4 flex flex-col divide-y divide-border sm:-mx-6 md:hidden">
        {EMAILS.map((email) => (
          <div
            key={email.id}
            role="button"
            tabIndex={0}
            onClick={() => navigateToEmailDetail(email.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                navigateToEmailDetail(email.id)
              }
            }}
            className="flex w-full items-start gap-3 px-4 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-6"
          >
            <EmailThumbnail className="size-12" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="truncate text-sm font-semibold text-foreground">{email.subject}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(email.sentAt)}, {formatTime(email.sentAt)}
              </p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-muted-foreground">
                <span>{email.emailsSent.toLocaleString('en-US')} sent</span>
                <span>{formatPercent(email.visitRate)} visits</span>
                <span>{formatCurrency(email.sales)}</span>
              </div>
            </div>
            <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          </div>
        ))}
      </div>

      {/* Desktop: emails data table + preview side pane. */}
      <div className="hidden md:flex">
        <div className="min-w-0 flex-1">
          <DataTable
            columns={columns}
            data={EMAILS}
            defaultSorting={[{ id: 'sentAt', desc: true }]}
            getRowId={(email) => email.id}
            onRowClick={(email) => openEmail(email.id)}
            isRowActive={(email) => email.id === selectedEmailId}
            tableClassName={selectedEmail ? 'min-w-[720px]' : undefined}
          />
        </div>
        {/* Pane stays mounted so its width/margin can animate in and out, which
            in turn smoothly resizes the flex table beside it. */}
        <div
          className={cn(
            'sticky top-6 shrink-0 self-start overflow-hidden transition-[width,margin] duration-300 ease-in-out',
            selectedEmail ? 'ml-6 w-[420px]' : 'ml-0 w-0',
          )}
        >
          {paneEmail ? (
            <EmailPreviewPane
              email={paneEmail}
              onClose={() => setSelectedEmailId(null)}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

// Full-page email preview, used on mobile where tapping a card opens its own
// page (instead of expanding inline). The email id comes from the `email` query
// param.
export function AdminEmailDetailPage() {
  const emailId =
    typeof window === 'undefined'
      ? null
      : new URLSearchParams(window.location.search).get('email')
  const email = EMAILS.find((e) => e.id === emailId)

  // Opening a detail page should always start at the top, regardless of how far
  // the list was scrolled when the card was tapped.
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [emailId])

  function goBack() {
    window.history.pushState(null, '', '/admin/marketing/email')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  if (!email) {
    return <p className="px-4 text-sm text-muted-foreground">Email not found.</p>
  }

  return (
    <EmailPreviewPane
      email={email}
      onClose={goBack}
      onBack={goBack}
      hideClose
      className="max-h-none w-full overflow-visible rounded-none border-0"
    />
  )
}
