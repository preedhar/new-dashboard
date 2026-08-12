import * as React from "react"
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Globe,
  Monitor,
  MoreHorizontal,
  QrCode,
  ReceiptText,
  Store,
  Truck,
  type LucideIcon,
} from "lucide-react"

import bookingsIcon from "@/assets/apps/bookings.png"
import crmIcon from "@/assets/apps/crm.png"
import emailMarketingIcon from "@/assets/apps/email-marketing.png"
import kitchenDisplayIcon from "@/assets/apps/kitchen-display.png"
import loyaltyProgramIcon from "@/assets/apps/loyalty-program.png"
import onlineStoreIcon from "@/assets/apps/online-store.png"
import posIcon from "@/assets/apps/pos.png"
import qrCodeOrderingIcon from "@/assets/apps/qr-code-ordering.png"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TypographyH2, TypographyH3, TypographyLarge, TypographyMuted } from "@/components/ui/typography"
import { DownloadQrCodesDialog } from "../components/download-qr-codes-dialog"
import { STORE_DOMAIN } from "../catalog"

// Wide enough for both lucide icons and the brand marks imported through SVGR.
type AppLinkIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>

// Links that open something on the page instead of navigating away.
type AppLinkAction = "download-qr-codes"

// A link either navigates (`href`) or opens a dialog in place (`action`). It can
// carry a status badge (e.g. whether that setting is switched on), and
// `external` marks the ones that leave the dashboard rather than drill in.
type AppLink = {
  title: string
  href?: string
  action?: AppLinkAction
  icon: AppLinkIcon
  badge?: string
  external?: boolean
}

type AppListing = {
  title: string
  description: string
  // App artwork imported as a URL, matching the channel icons in catalog.ts.
  icon: string
  badge?: string
  // In-product pages and actions for the app. One link makes the card a direct
  // link to it; several put them behind a popover on the card.
  links?: AppLink[]
}

const recommendedApps: AppListing[] = [
  {
    title: "Online Store",
    description: "Sell online with a fast and beautiful website",
    icon: onlineStoreIcon,
    links: [
      { title: "Fulfillment", href: "/admin/apps/online-store/fulfillment", icon: Truck },
      { title: "Calendar", href: "/admin/apps/online-store/calendar", icon: CalendarDays },
      { title: "Checkouts", href: "/admin/apps/online-store/checkouts", icon: ReceiptText },
      { title: "Website", href: "/admin/settings/website", icon: Globe },
      { title: "View store", href: `https://${STORE_DOMAIN}`, icon: Store, external: true },
    ],
  },
  {
    title: "POS",
    description: "Take in-person orders at your physical store",
    icon: posIcon,
    links: [{ title: "View", href: "/admin/apps/pos", icon: Monitor, external: true }],
  },
  {
    title: "QR Code Ordering",
    description: "Reduce staff costs by letting customers scan to order",
    icon: qrCodeOrderingIcon,
    links: [
      {
        title: "Checkouts",
        href: "/admin/apps/qr-code/checkouts",
        icon: ReceiptText,
        badge: "Enabled",
      },
      { title: "Download QR codes", action: "download-qr-codes", icon: QrCode },
      { title: "View store", href: `https://${STORE_DOMAIN}`, icon: Store, external: true },
    ],
  },
  {
    title: "Bookings",
    description: "Accept bookings for reservations, events, etc.",
    icon: bookingsIcon,
    links: [{ title: "View", href: "/admin/bookings/all", icon: CalendarDays, external: true }],
  },
  {
    title: "Kitchen Display",
    description: "Automatically send orders to your kitchen",
    icon: kitchenDisplayIcon,
    links: [{ title: "View", href: "#", icon: ReceiptText, external: true }],
  },
]

const otherApps: AppListing[] = [
  {
    title: "Loyalty Program",
    description: "Encourage repeat purchases by rewarding points",
    icon: loyaltyProgramIcon,
    links: [{ title: "View", href: "/admin/marketing/loyalty", icon: Store, external: true }],
  },
  {
    title: "Email Marketing",
    description: "Bring customers back to your store with updates",
    icon: emailMarketingIcon,
    links: [{ title: "View", href: "/admin/marketing/email", icon: Store, external: true }],
  },
  {
    title: "CRM",
    description: "View and segment customers based on their history",
    icon: crmIcon,
    links: [{ title: "View", href: "/admin/marketing/customers", icon: Store, external: true }],
  },
]

export function AdminAppsPage() {
  // The dialogs an app link can open live at the page level so they survive the
  // popover they were opened from closing.
  const [openAction, setOpenAction] = React.useState<AppLinkAction | null>(null)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      {/* The desktop chrome for this route is suppressed in AdminPage, so the
          page supplies its own back affordance on a phone. The heading clears
          the button's column until there's room to centre it against nothing. */}
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
          Find everything your business needs
        </TypographyH2>
      </header>

      <AppSection
        title="Recommended for Haus"
        apps={recommendedApps}
        onSelectAction={setOpenAction}
      />
      <AppSection title="More Apps" apps={otherApps} onSelectAction={setOpenAction} />

      <DownloadQrCodesDialog
        open={openAction === "download-qr-codes"}
        onOpenChange={(open) => setOpenAction(open ? "download-qr-codes" : null)}
      />
    </div>
  )
}

function AppSection({
  title,
  apps,
  onSelectAction,
}: {
  title: string
  apps: AppListing[]
  onSelectAction: (action: AppLinkAction) => void
}) {
  return (
    <section className="space-y-8">
      <TypographyH3 className="text-center text-xl">{title}</TypographyH3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-12">
        {apps.map((app) => (
          <AppCard key={app.title} app={app} onSelectAction={onSelectAction} />
        ))}
      </div>
    </section>
  )
}

// `relative` anchors the trailing chevron/arrow to the card's top right corner
// so it stays out of the centred stack. The card's own box carries no surface —
// that lives on the layer below, which is what grows on hover. `isolate` keeps
// that layer's negative z-index scoped to the card.
const CARD_CLASS =
  "group relative isolate flex w-full flex-col items-center justify-center gap-2 rounded-xl p-3 text-center sm:gap-3 sm:p-8"

// The surface sits on its own absolutely positioned layer so hover can expand it
// past the card's bounds. Growing the card itself would reflow or rescale the
// content; this leaves every child exactly where it was.
// rounded-xl matches the shadcn Card radius used on the store settings page.
const CARD_SURFACE_CLASS =
  "absolute inset-0 -z-10 rounded-xl border border-border bg-neutral-50 transition-all duration-200 group-hover:-inset-2.5 group-hover:bg-muted"

function AppCard({
  app,
  onSelectAction,
}: {
  app: AppListing
  onSelectAction: (action: AppLinkAction) => void
}) {
  // The popover is controlled so choosing an action can dismiss it before the
  // dialog it opens takes over the screen.
  const [open, setOpen] = React.useState(false)
  const links = app.links ?? []
  // A lone link is a destination in its own right, so the card goes straight
  // there. Several links need somewhere to choose from, so the card is a
  // popover trigger instead.
  const directLink = links.length === 1 ? links[0] : null

  if (directLink) {
    const Icon = directLink.external ? ArrowUpRight : ChevronRight
    // An action has nowhere to navigate to, so the whole card becomes a button.
    if (directLink.action) {
      const action = directLink.action
      return (
        <button type="button" className={CARD_CLASS} onClick={() => onSelectAction(action)}>
          <AppCardBody app={app} Icon={Icon} />
        </button>
      )
    }
    return (
      <a href={directLink.href} {...newTabProps(directLink)} className={CARD_CLASS}>
        <AppCardBody app={app} Icon={Icon} />
      </a>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={CARD_CLASS}>
          <AppCardBody app={app} Icon={MoreHorizontal} />
        </button>
      </PopoverTrigger>
      {/* Matching the trigger width keeps the list aligned with the card it
          belongs to rather than floating at an unrelated size. */}
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-56 p-2">
        {links.map((link) => (
          <AppLinkRow
            key={link.title}
            link={link}
            onSelectAction={(action) => {
              setOpen(false)
              onSelectAction(action)
            }}
          />
        ))}
      </PopoverContent>
    </Popover>
  )
}

function AppCardBody({ app, Icon }: { app: AppListing; Icon: LucideIcon }) {
  return (
    <>
      <span aria-hidden="true" className={CARD_SURFACE_CLASS} />
      <Icon aria-hidden="true" className="absolute top-4 right-4 size-5 text-muted-foreground" />
      {/* App Store style icon tile: a rounded, bordered white container that
          frames the artwork so it reads as an app icon, not a loose image. */}
      <span className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-border bg-background sm:size-18">
        <img src={app.icon} alt="" className="size-8 sm:size-10" />
      </span>
      <div className="flex min-w-0 flex-col items-center gap-1">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <TypographyLarge className="text-base sm:text-lg">{app.title}</TypographyLarge>
          {app.badge ? <Badge variant="outline">{app.badge}</Badge> : null}
        </div>
        <TypographyMuted className="leading-6">{app.description}</TypographyMuted>
      </div>
    </>
  )
}

const LINK_ROW_CLASS =
  "flex h-10 w-full items-center justify-between gap-2 rounded-md px-2 text-sm font-normal text-foreground transition-colors hover:bg-muted"

function AppLinkRow({
  link,
  onSelectAction,
}: {
  link: AppLink
  onSelectAction: (action: AppLinkAction) => void
}) {
  const LeadingIcon = link.icon
  // Links that leave the dashboard get an outbound arrow; ones that drill into
  // it keep the chevron.
  const TrailingIcon = link.external ? ArrowUpRight : ChevronRight

  const body = (
    <>
      <span className="flex min-w-0 items-center gap-2">
        <LeadingIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{link.title}</span>
      </span>
      {/* The badge trails the row with the chevron rather than sitting against
          the title, so every row's status lines up down the right edge. */}
      <span className="flex shrink-0 items-center gap-2">
        {link.badge ? (
          <Badge variant="secondary" className="border-transparent bg-green-400/10 text-green-900">
            {link.badge}
          </Badge>
        ) : null}
        <TrailingIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      </span>
    </>
  )

  // Rows that open a dialog aren't going anywhere, so they're buttons.
  if (link.action) {
    const action = link.action
    return (
      <button type="button" className={LINK_ROW_CLASS} onClick={() => onSelectAction(action)}>
        {body}
      </button>
    )
  }

  return (
    <a href={link.href} {...newTabProps(link)} className={LINK_ROW_CLASS}>
      {body}
    </a>
  )
}

// Only a real URL can usefully open in a new tab; a "#" placeholder would just
// open a blank one.
function newTabProps(link: AppLink) {
  return link.href?.startsWith("http")
    ? { target: "_blank", rel: "noreferrer" }
    : {}
}
