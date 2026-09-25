import * as React from 'react'
import {
  ArrowLeft,
  BadgePercent,
  Banknote,
  Copy,
  Handshake,
  Info,
  Mail,
  Share,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import yellowPaperImage from '@/assets/admin/yellow-paper.png'
import FacebookIcon from '@/assets/links/facebook.svg?react'
import InstagramIcon from '@/assets/links/instagram.svg?react'
import MessengerIcon from '@/assets/links/messenger.svg?react'
import WhatsappIcon from '@/assets/links/whatsapp.svg?react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TypographyH2, TypographyLarge } from '@/components/ui/typography'
import { cn } from '@/lib/utils'

// The referral programme's page, reached from the sidebar's "Refer & Earn $200"
// card. It walks through how the programme works in three points.
// A \n sets where a point's text breaks onto a second line on desktop. On a
// phone, where each point is a single row, it reads as a space.
const INFO_POINTS: { icon: LucideIcon; text: string }[] = [
  { icon: Handshake, text: 'Refer someone\nyou know' },
  { icon: BadgePercent, text: 'They get 20% off\nfor first month' },
  { icon: Banknote, text: 'You get paid\nup to $200' },
]

// The general terms of use, until the programme has terms of its own.
const REFERRAL_TERMS_URL = 'https://www.cococart.co/terms-of-use'

// A stand-in until codes come from the backend.
const REFERRAL_CODE = 'HAU7ZW'

type ReferralEventKind = 'payout' | 'canceled'

type ReferralEvent = {
  id: string
  shopName: string
  kind: ReferralEventKind
  // The day it happened, ISO so the list can sort on it as a string.
  date: string
  // Only a payout carries one. A share of the shop's plan, so it varies by
  // shop rather than being a flat fee.
  amount?: number
}

// What each kind of event reads as. A payout is written from the shop owner's
// side and carries the amount after it, so it stands on its own; a cancellation
// still follows the name of the shop it happened to.
const EVENT_TEXT: Record<ReferralEventKind, string> = {
  payout: 'You earned',
  canceled: 'has cancelled',
}

// How far the shop is towards its next payout, until it comes from the
// backend. Whole dollars, unlike the per-event amounts, which are a share of a
// plan and so land on cents.
const NEXT_PAYOUT = { earned: 12, target: 20 }

// Sample activity until it comes from the backend. Order doesn't matter here:
// the list sorts newest first. Each shop pays out monthly from the day it
// subscribed, so the staggered sign-ups interleave the shops down the list.
const REFERRAL_EVENTS: ReferralEvent[] = [
  // Kopi Corner, the oldest: subscribed in June, paid out every month since.
  { id: 'e1', shopName: 'Kopi Corner', kind: 'payout', date: '2026-07-20', amount: 11.8 },
  { id: 'e2', shopName: 'Kopi Corner', kind: 'payout', date: '2026-08-20', amount: 11.8 },
  { id: 'e3', shopName: 'Kopi Corner', kind: 'payout', date: '2026-09-20', amount: 11.8 },
  // Sunny Bakes, subscribed a few weeks later.
  { id: 'e4', shopName: 'Sunny Bakes', kind: 'payout', date: '2026-08-14', amount: 3.8 },
  { id: 'e5', shopName: 'Sunny Bakes', kind: 'payout', date: '2026-09-14', amount: 3.8 },
  // Petal & Stem, one payout in before it left.
  { id: 'e6', shopName: 'Petal & Stem', kind: 'payout', date: '2026-09-02', amount: 11.8 },
  { id: 'e7', shopName: 'Petal & Stem', kind: 'canceled', date: '2026-09-21' },
]

// Every referral shows the Haus logo until shops' own logos come through.
const REFERRAL_LOGO_PLACEHOLDER = '/haus-logo.png'

// Cuts a semicircular notch into the middle of each short side, so the card
// reads as a ticket stub. Each gradient masks one half of the card, and the
// notch radius comes from --notch so it can grow with the card.
const TICKET_MASK =
  'radial-gradient(circle var(--notch) at 0 50%, transparent 98%, #000) left / 51% 100% no-repeat, ' +
  'radial-gradient(circle var(--notch) at 100% 50%, transparent 98%, #000) right / 51% 100% no-repeat'

// A placeholder until referral links come from the backend: the signup page,
// tagged with the code.
function getReferralLink(code: string) {
  return `https://get.cococart.co/?ref=${code}`
}

function getReferralMessage(code: string) {
  return `I use Cococart to run my shop. Sign up with my code ${code} and get 20% off your first month: ${getReferralLink(code)}`
}

function openInNewTab(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function AdminReferralsPage() {
  const code = REFERRAL_CODE

  return (
    <div className="flex flex-col gap-10">
      {/* The shared title and breadcrumb bar are suppressed for this route in
          AdminPage, so like the All Apps page it supplies its own header, with
          a back button on a phone. The heading clears the button's column until
          there's room to centre it against nothing. */}
      <header className="relative flex items-center justify-center">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label="Go back"
          onClick={() => window.history.back()}
          className="absolute top-0 left-0 md:hidden"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <TypographyH2 className="px-12 text-center md:px-0">
          Earn up to $200 for every referral
        </TypographyH2>
      </header>

      {/* A single column at every width: the info points, then the code and
          share options. */}
      <div className="flex flex-col gap-6 md:gap-10">
        {/* On a phone the points stack as rows, each icon beside its text and
            each row centred. On desktop they sit side by side within at most
            600px, the icon above the text, split by dashed dividers. */}
        <ul className="mx-auto grid w-full max-w-[600px] grid-cols-1 gap-4 divide-dashed divide-border md:grid-cols-3 md:gap-0 md:divide-x">
          {INFO_POINTS.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center justify-center gap-3 md:flex-col md:justify-start md:px-4 md:text-center"
            >
              <Icon aria-hidden="true" className="size-5 shrink-0 text-foreground" />
              <p className="text-sm font-medium text-foreground md:whitespace-pre-line">
                {text}
              </p>
            </li>
          ))}
        </ul>

        {/* The code and share options sit in a bordered, light grey container
            (the All Apps cards' fill), at most 600px wide on desktop. The terms
            hang off the rewards heading's info icon rather than a link here. */}
        <div className="mx-auto flex w-full flex-col gap-10 rounded-xl border border-border bg-neutral-50 p-5 md:max-w-[600px] md:p-8">
          <ReferralCodeTicket code={code} />
          <ReferralShareOptions code={code} />
        </div>

        <ReferralEvents events={REFERRAL_EVENTS} />
      </div>
    </div>
  )
}

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter((word) => /^[a-z0-9]/i.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

// Everything the code has led to, newest first, in a divided list at most
// 600px wide. Each row shows the shop's logo, then what happened: a payout
// reads as "You earned $11.80", the amount in green since it only ever adds
// up, and a cancellation as a sentence about the shop. The day it happened
// closes the row.
function ReferralEvents({ events }: { events: ReferralEvent[] }) {
  // Sorted here rather than in the data so the list stays newest-first
  // whatever order the backend eventually sends. ISO dates sort as strings.
  const sorted = React.useMemo(
    () => [...events].sort((a, b) => b.date.localeCompare(a.date)),
    [events],
  )

  return (
    <section aria-labelledby="referrals-heading" className="mx-auto w-full max-w-[600px]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <TypographyLarge id="referrals-heading">Your rewards</TypographyLarge>
        {/* The only route to the terms now, so the icon opens them. It sits
            at the far end of the row, over the list's right-hand columns. */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              variant="ghost"
              size="icon-sm"
              className="-mr-2 text-muted-foreground"
              aria-label="Terms and conditions apply"
            >
              <a href={REFERRAL_TERMS_URL} target="_blank" rel="noreferrer">
                <Info />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>T&amp;C apply</TooltipContent>
        </Tooltip>
      </div>
      {/* How far along the next payout is, above the list it will join. The
          label and the running total share a line, with the bar under both. */}
      <div className="mb-4 flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-muted-foreground">Next payout</span>
          <span className="text-sm tabular-nums text-muted-foreground">
            <span className="font-medium text-foreground">${NEXT_PAYOUT.earned}</span> / $
            {NEXT_PAYOUT.target}
          </span>
        </div>
        <Progress
          value={(NEXT_PAYOUT.earned / NEXT_PAYOUT.target) * 100}
          aria-label={`Next payout: $${NEXT_PAYOUT.earned} of $${NEXT_PAYOUT.target}`}
        />
      </div>
      <ul className="divide-y divide-border/50">
        {sorted.map((event) => (
          <li key={event.id} className="flex flex-wrap items-center gap-x-3 py-3">
            {/* A payout no longer names the shop in its text, so the logo
                carries the name for it. */}
            <Avatar className="shrink-0">
              <AvatarImage
                src={REFERRAL_LOGO_PLACEHOLDER}
                alt={event.kind === 'payout' ? event.shopName : ''}
              />
              <AvatarFallback>{initialsFor(event.shopName)}</AvatarFallback>
            </Avatar>
            <p className="min-w-0 flex-1 text-sm text-muted-foreground">
              {event.kind === 'payout' ? (
                <>
                  {EVENT_TEXT.payout}{' '}
                  <span className="font-medium text-success-foreground">
                    ${event.amount?.toFixed(2)}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-medium text-foreground">{event.shopName}</span>{' '}
                  {EVENT_TEXT[event.kind]}
                </>
              )}
            </p>
            {/* On a phone there's no room for a second column, so the date
                wraps onto its own line, indented past the logo to line up
                under the event. On desktop it returns to a fixed column. */}
            <span className="mt-1 basis-full pl-11 text-xs text-muted-foreground md:mt-0 md:w-16 md:shrink-0 md:basis-auto md:pl-0 md:text-right md:text-sm">
              {formatEventDate(event.date)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

// The referral code, printed on a yellow paper ticket under its label. The
// ticket is only as wide as the code plus room for the notches. Clicking it
// copies the code; its tooltip says "Copy" on hover and "Copied" for 3 seconds
// after a click.
function ReferralCodeTicket({ code, className }: { code: string; className?: string }) {
  // The tooltip is controlled because Radix closes it on pointer down and on
  // click, and the "Copied" confirmation needs to stay up after the click.
  const [tooltipOpen, setTooltipOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const copiedTimeoutRef = React.useRef<number | undefined>(undefined)

  React.useEffect(() => () => window.clearTimeout(copiedTimeoutRef.current), [])

  const copyCode = (event: React.MouseEvent) => {
    // Skips the trigger's own click handler, which would close the tooltip.
    event.preventDefault()
    void navigator.clipboard?.writeText(code)
    setCopied(true)
    setTooltipOpen(true)
    window.clearTimeout(copiedTimeoutRef.current)
    copiedTimeoutRef.current = window.setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Share your referral code</p>
      <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild>
          {/* The button carries the ticket's hard, darker-yellow edge along the
              bottom. It sits here rather than on the ticket because
              the mask that cuts the notches would clip a box-shadow;
              drop-shadow follows the notched outline instead. On a phone,
              pressing it slides the ticket down onto that edge. On desktop,
              hovering or pressing floats it up instead, with a soft shadow
              opening beneath it; a press dips it 2px back down from the
              float. */}
          <button
            type="button"
            aria-label={`Copy referral code ${code}`}
            onClick={copyCode}
            className="cursor-pointer rounded-[4px] outline-hidden transition-[translate,filter] duration-150 ease-out [filter:drop-shadow(0_2px_0_#e4cb5b)_drop-shadow(0_0_0_rgb(0_0_0/0))] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-0.5 active:[filter:drop-shadow(0_0_0_#e4cb5b)_drop-shadow(0_0_0_rgb(0_0_0/0))] md:hover:-translate-y-1 md:hover:[filter:drop-shadow(0_2px_0_#e4cb5b)_drop-shadow(0_8px_8px_rgb(0_0_0/0.08))] md:active:-translate-y-0.5 md:active:[filter:drop-shadow(0_2px_0_#e4cb5b)_drop-shadow(0_8px_8px_rgb(0_0_0/0.08))] motion-reduce:transition-none"
          >
            <span
              className="block rounded-[4px] bg-[#f1e2a2] px-8 py-4 [--notch:10px] sm:px-12 sm:py-6 sm:[--notch:14px]"
              style={{
                backgroundImage: `url(${yellowPaperImage})`,
                mask: TICKET_MASK,
                WebkitMask: TICKET_MASK,
              }}
            >
              {/* The negative right margin takes back the letter spacing trailing
                  the last character, so the code centres on the ticket. */}
              <span className="-mr-[0.3em] block font-mono text-2xl font-semibold tracking-[0.3em] text-[#5f500a] sm:text-4xl">
                {code}
              </span>
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent sideOffset={6}>{copied ? 'Copied' : 'Copy'}</TooltipContent>
      </Tooltip>
    </div>
  )
}

type ShareOption = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  // The brand colour the icon is drawn in, and for the Lucide line icons a
  // smaller size, since they fill more of their box than the brand marks.
  iconClassName: string
  onSelect: () => void
}

// Ways to pass the code on. A phone gets the OS share sheet, which reaches every
// installed app; desktop, with no share sheet to lean on, lists the channels one
// by one. Instagram and Messenger have no web
// endpoint that takes a message, so for those the message goes to the clipboard
// and the app opens for it to be pasted into a chat.
function ReferralShareOptions({ code }: { code: string }) {
  const link = getReferralLink(code)
  const message = getReferralMessage(code)

  const copyCode = () => {
    void navigator.clipboard?.writeText(code)
    toast.success('Code copied')
  }

  const copyMessageAndOpen = (appName: string, url: string) => {
    void navigator.clipboard?.writeText(message)
    toast.success(`Message copied — paste it into ${appName}`)
    openInNewTab(url)
  }

  const shareWithWhatsapp = () =>
    openInNewTab(`https://wa.me/?text=${encodeURIComponent(message)}`)

  // Falls back to copying the code where the browser has no share sheet. A
  // dismissed sheet rejects, which needs no message.
  const shareWithSheet = () => {
    if (!navigator.share) {
      copyCode()
      return
    }
    navigator.share({ title: 'Cococart referral', text: message }).catch(() => {})
  }

  const desktopOptions: ShareOption[] = [
    {
      label: 'WhatsApp',
      icon: WhatsappIcon,
      iconClassName: 'text-[#25d366]',
      onSelect: shareWithWhatsapp,
    },
    {
      label: 'Instagram',
      icon: InstagramIcon,
      iconClassName: 'text-[#e4405f]',
      onSelect: () => copyMessageAndOpen('Instagram', 'https://www.instagram.com/direct/inbox/'),
    },
    {
      label: 'Messenger',
      icon: MessengerIcon,
      iconClassName: 'text-[#0084ff]',
      onSelect: () => copyMessageAndOpen('Messenger', 'https://www.messenger.com/'),
    },
    {
      label: 'Facebook',
      icon: FacebookIcon,
      iconClassName: 'text-[#1877f2]',
      onSelect: () =>
        openInNewTab(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`),
    },
    {
      label: 'Email',
      icon: Mail,
      iconClassName: 'size-5.5 text-foreground',
      onSelect: () =>
        window.location.assign(
          `mailto:?subject=${encodeURIComponent(
            'Get 20% off your first month of Cococart',
          )}&body=${encodeURIComponent(message)}`,
        ),
    },
    {
      label: 'Copy code',
      icon: Copy,
      iconClassName: 'size-5.5 text-foreground',
      onSelect: copyCode,
    },
  ]

  return (
    // The buttons name themselves, so the section has no visible heading. On a
    // phone it pulls up 16px into the page's 40px gap to sit nearer the code.
    <section aria-label="Share your code" className="-mt-4 flex flex-col items-center md:mt-0">
      {/* Phone: a single button that opens the share sheet. */}
      <Button
        type="button"
        size="lg"
        onClick={shareWithSheet}
        className="w-full max-w-sm md:hidden"
      >
        <Share data-icon="inline-start" aria-hidden="true" />
        Share code
      </Button>

      {/* Desktop: one bare icon per channel, with its name underneath. */}
      <ul className="hidden flex-wrap justify-center gap-2 md:flex">
        {desktopOptions.map(({ label, icon: Icon, iconClassName, onSelect }) => (
          <li key={label}>
            <button
              type="button"
              onClick={onSelect}
              className="group flex w-20 cursor-pointer flex-col items-center gap-2 rounded-md outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {/* A fixed 28px box keeps the names in line when an icon is
                  drawn smaller. */}
              <span className="flex size-7 items-center justify-center">
                <Icon
                  aria-hidden="true"
                  className={cn('size-7 transition-opacity group-hover:opacity-70', iconClassName)}
                />
              </span>
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

// Formats an event's day as "Oct 10". Pinned to en-US for that month-first
// order, and because en-GB abbreviates September to "Sept".
function formatEventDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
