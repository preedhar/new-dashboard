import { cn } from "@/lib/utils"
import { appsAdminNav } from "../adminRoutes"

// The Store settings page doubles as a mobile hub. Beneath the Settings section
// menu we surface the Online Store app's pages plus an "All Apps" shortcut, all
// as icon tiles in one row (matching the section menu), so the storefront apps
// are reachable without opening the (hidden-on-mobile) sidebar.
export function MobileAppsMenu() {
  const onlineStore = appsAdminNav.find(
    (item) => item.url === "/admin/apps/online-store",
  )
  const allApps = appsAdminNav.find((item) => item.url === "/admin/apps")
  // On mobile the Website page is dropped; the "All Apps" tile stands in for it.
  // Website still lives in the desktop sidebar.
  const pages = (onlineStore?.items ?? []).filter(
    (page) => page.url !== "/admin/apps/online-store/website",
  )

  // "All Apps" shares the row as a final tile, styled like the app pages.
  const tiles = [...pages, ...(allApps ? [allApps] : [])]

  if (tiles.length === 0) {
    return null
  }

  return (
    <nav aria-label="Apps pages" className="md:hidden">
      <p className="mb-2 text-xs font-medium text-muted-foreground">Apps</p>
      <ul className="flex gap-2">
        {tiles.map((tile) => {
          const Icon = tile.icon
          return (
            <li key={tile.url} className="flex-1">
              <a
                href={tile.url}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-1 rounded-lg border border-border bg-background px-2 py-2 text-[10px] font-normal text-muted-foreground transition-colors",
                  "hover:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_6%)]",
                )}
              >
                {Icon ? <Icon className="size-5 shrink-0" /> : null}
                <span className="w-full truncate text-center">{tile.title}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
