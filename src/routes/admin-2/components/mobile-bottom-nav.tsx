import {
  CalendarDays,
  Megaphone,
  Package,
  ReceiptText,
  Settings,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

type MobileNavItem = {
  title: string
  url: string
  icon: LucideIcon
  matchPrefix?: string
}

const items: MobileNavItem[] = [
  { title: "Orders", url: "/admin-2/orders/all", icon: ReceiptText, matchPrefix: "/admin-2/orders" },
  { title: "Products", url: "/admin-2/products", icon: Package, matchPrefix: "/admin-2/products" },
  { title: "Bookings", url: "/admin-2/bookings", icon: CalendarDays, matchPrefix: "/admin-2/bookings" },
  {
    title: "Marketing",
    url: "/admin-2/marketing/share",
    icon: Megaphone,
    matchPrefix: "/admin-2/marketing",
  },
  {
    title: "Settings",
    url: "/admin-2/settings/payments",
    icon: Settings,
    matchPrefix: "/admin-2/settings",
  },
]

function isActive(pathname: string, item: MobileNavItem) {
  if (item.matchPrefix) {
    return pathname === item.matchPrefix || pathname.startsWith(`${item.matchPrefix}/`)
  }
  return pathname === item.url
}

type MobileBottomNavProps = {
  pathname: string
}

export function MobileBottomNav({ pathname }: MobileBottomNavProps) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon
          const active = isActive(pathname, item)
          return (
            <li key={item.title}>
              <a
                href={item.url}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("size-5", active && "text-foreground")} />
                <span className="truncate">{item.title}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
