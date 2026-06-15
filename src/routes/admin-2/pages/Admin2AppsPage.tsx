import {
  CalendarDays,
  ChefHat,
  Mail,
  Monitor,
  QrCode,
  Settings,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TypographyH2, TypographyH3, TypographyLarge, TypographyMuted } from "@/components/ui/typography"

type AppListing = {
  title: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  badge?: string
  installed?: boolean
}

const recommendedApps: AppListing[] = [
  {
    title: "Online Store",
    description: "Sell products through a polished storefront built for orders, checkout, and pickup.",
    icon: ShoppingBag,
    badge: "Basic",
    installed: true,
  },
  {
    title: "POS",
    description: "Take in-person orders, track payments, and keep sales synced with your store.",
    icon: Store,
  },
  {
    title: "QR Code Ordering",
    description: "Let customers scan, browse, and order from their table or pickup location.",
    icon: QrCode,
  },
  {
    title: "Bookings",
    description: "Accept appointments, classes, and reservations with simple scheduling tools.",
    icon: CalendarDays,
  },
  {
    title: "Kitchen Display",
    description: "Send incoming orders to a clear kitchen queue so preparation stays organized.",
    icon: ChefHat,
  },
]

const otherApps: AppListing[] = [
  {
    title: "Loyalty Program",
    description: "Reward repeat customers with points, perks, and simple retention campaigns.",
    icon: Users,
  },
  {
    title: "Email Marketing",
    description: "Send product launches, promos, and customer updates from your store dashboard.",
    icon: Mail,
  },
  {
    title: "CRM",
    description: "Track customer details, order history, and follow-ups in one place.",
    icon: Monitor,
  },
]

const onlineStoreSettingsItems = [
  { title: "Fulfillment", href: "/admin-2/apps/online-store/fulfillment" },
  { title: "Inventory Calendar", href: "/admin-2/apps/online-store/inventory-calendar" },
  { title: "Checkouts", href: "/admin-2/apps/online-store/checkouts" },
  { title: "Website", href: "/admin-2/apps/online-store/website" },
]

export function Admin2AppsPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 pt-8">
      <TypographyH2 className="text-center">Find everything your business needs</TypographyH2>

      <AppSection title="Recommended for Haus" apps={recommendedApps} />
      <AppSection title="Other Apps" apps={otherApps} />
    </div>
  )
}

function AppSection({ title, apps }: { title: string; apps: AppListing[] }) {
  return (
    <section className="space-y-8">
      <TypographyH3 className="text-center">{title}</TypographyH3>
      <div className="grid gap-8 md:grid-cols-2">
        {apps.map((app) => (
          <AppCard key={app.title} app={app} />
        ))}
      </div>
    </section>
  )
}

function AppCard({ app }: { app: AppListing }) {
  const Icon = app.icon

  return (
    <article className="flex min-h-40 items-start gap-4 rounded-md border border-border bg-background p-5 shadow-xs">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon aria-hidden="true" className="size-7 text-foreground" strokeWidth={1.8} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <TypographyLarge>{app.title}</TypographyLarge>
          </div>
          {app.installed ? (
            <div className="flex shrink-0 items-center gap-2">
              <Button type="button" variant="secondary" size="sm">
                UPGRADE
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    aria-label="Online Store settings"
                  >
                    <Settings aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-lg p-1">
                  {onlineStoreSettingsItems.map((item, index) => (
                    <DropdownMenuItem
                      key={item.title}
                      asChild
                      className={index === 0 ? "bg-muted" : undefined}
                    >
                      <a href={item.href}>{item.title}</a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button type="button" size="sm">
              GET
            </Button>
          )}
        </div>
        <TypographyMuted className="max-w-prose leading-6">{app.description}</TypographyMuted>
        {app.badge ? <Badge variant="secondary">{app.badge}</Badge> : null}
      </div>
    </article>
  )
}
