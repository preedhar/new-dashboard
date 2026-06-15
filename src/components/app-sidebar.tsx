"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { SearchCommandDialog } from "@/components/search-command-dialog"
import { appsAdminNav, primaryAdminNav, type AdminNavItem } from "@/routes/admin/adminRoutes"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { HomeIcon, SearchIcon } from "lucide-react"

const data = {
  user: {
    name: "Derek Low",
    shopName: "Haus",
    avatar: "/haus-logo.png",
  },
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  pathname: string
}

export function AppSidebar({ pathname, ...props }: AppSidebarProps) {
  const [commandOpen, setCommandOpen] = React.useState(false)

  function mapNavItems(items: AdminNavItem[]) {
    return items.map((item) => {
      const Icon = item.icon
      const subItems = item.items?.map((subItem) => ({
        ...subItem,
        isActive: subItem.url === pathname,
      }))

      return {
        title: item.title,
        url: item.url,
        icon: <Icon />,
        isActive:
          item.url === pathname ||
          Boolean(subItems?.some((subItem) => subItem.isActive)) ||
          Boolean(subItems?.length && pathname.startsWith(`${item.url}/`)),
        items: subItems,
      }
    })
  }

  const primaryItems = mapNavItems(primaryAdminNav.filter((item) => item.url !== '/admin'))
  const appItems = mapNavItems(appsAdminNav)

  return (
    <>
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <div className="flex items-center justify-between gap-2">
            <a href="/admin" className="flex shrink-0 items-center" aria-label="Cococart home">
              <img src="/cococart-logomark.svg" alt="Cococart" className="h-8 w-8" />
            </a>
            <div className="flex items-center gap-2">
              <a
                href="/admin"
                aria-label="Home"
                data-active={pathname === "/admin"}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-[color-mix(in_oklch,var(--sidebar-accent),var(--sidebar-foreground)_4%)] text-muted-foreground outline-hidden transition-colors hover:bg-[color-mix(in_oklch,var(--sidebar-accent),var(--sidebar-foreground)_9%)] hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[active=true]:bg-[color-mix(in_oklch,var(--sidebar-accent),var(--sidebar-foreground)_10%)] data-[active=true]:text-sidebar-accent-foreground"
              >
                <HomeIcon className="size-5 shrink-0" />
              </a>
              <button
                type="button"
                aria-label="Search"
                className="flex h-8 w-8 items-center justify-center rounded-md bg-[color-mix(in_oklch,var(--sidebar-accent),var(--sidebar-foreground)_4%)] text-muted-foreground outline-hidden transition-colors hover:bg-[color-mix(in_oklch,var(--sidebar-accent),var(--sidebar-foreground)_9%)] hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                onClick={() => setCommandOpen(true)}
              >
                <SearchIcon className="size-5 shrink-0" />
              </button>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={primaryItems} />
          <NavMain items={appItems} label="Apps" />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>
      <SearchCommandDialog open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  )
}
