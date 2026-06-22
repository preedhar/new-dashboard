"use client"

import * as React from "react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { SearchCommandDialog } from "./search-command-dialog"
import { appsAdminNav, primaryAdminNav, type AdminNavItem } from "../adminRoutes"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { SearchIcon } from "lucide-react"

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

  const primaryItems = mapNavItems(primaryAdminNav)
  const appItems = mapNavItems(appsAdminNav)

  return (
    <>
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <div className="flex w-full items-center gap-4">
            <a
              href="/admin"
              data-active={pathname === "/admin"}
              className="flex flex-1 flex-col items-center justify-center gap-1 rounded-md py-2 text-xs text-muted-foreground outline-hidden transition-colors hover:bg-[color-mix(in_oklch,var(--sidebar-accent),var(--sidebar-foreground)_5%)] hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[active=true]:bg-[color-mix(in_oklch,var(--sidebar-accent),var(--sidebar-foreground)_10%)] data-[active=true]:text-sidebar-accent-foreground"
            >
              <img src="/cococart-logomark.svg" alt="Home" className="size-6 shrink-0" />
              <span>Home</span>
            </a>
            <button
              type="button"
              className="flex flex-1 flex-col items-center justify-center gap-1 rounded-md py-2 text-xs text-muted-foreground outline-hidden transition-colors hover:bg-[color-mix(in_oklch,var(--sidebar-accent),var(--sidebar-foreground)_5%)] hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              onClick={() => setCommandOpen(true)}
            >
              <SearchIcon className="size-6 shrink-0" />
              <span>Search</span>
            </button>
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
