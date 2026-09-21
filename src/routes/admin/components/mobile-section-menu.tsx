import { cn } from "@/lib/utils"
import { MobileMenuList } from "./mobile-menu-list"
import { primaryAdminNav } from "../adminRoutes"

type MobileSectionMenuProps = {
  pathname: string
}

// A hub page normally has no entry of its own, since it's the page you're on.
// Settings is the exception: its store form moved off the hub onto a path of
// its own, so the hub links to it like any other subpage.
const HUB_PAGE_PATHS: Record<string, string> = {
  "/admin/settings/store": "/admin/settings/store/details",
}

// The Settings hub lists its pages as a labelled vertical list, matching the
// apps list below it. Every other section keeps the icon-tile row.
const LIST_MENU_LABELS: Record<string, string> = {
  "/admin/settings/store": "General",
}

// On mobile the sidebar is hidden, so a section's first subpage doubles as its
// hub: it shows a menu linking to the other subpages in that parent section.
export function MobileSectionMenu({ pathname }: MobileSectionMenuProps) {
  const section = primaryAdminNav.find((item) => item.url === pathname)
  const subpages =
    section?.items
      ?.map((sub) =>
        sub.url === section.url && HUB_PAGE_PATHS[sub.url]
          ? { ...sub, url: HUB_PAGE_PATHS[sub.url] }
          : sub,
      )
      // Redirect links (e.g. Settings -> Calendar) open a page owned by another
      // section, which has its own list on this hub, so they're dropped here.
      .filter((sub) => sub.url !== section.url && !sub.redirect) ?? []

  if (!section || subpages.length === 0) {
    return null
  }

  const listLabel = LIST_MENU_LABELS[pathname]

  if (listLabel) {
    return (
      <MobileMenuList
        ariaLabel={`${section.title} pages`}
        label={listLabel}
        items={subpages}
      />
    )
  }

  return (
    <nav aria-label={`${section.title} pages`} className="md:hidden">
      <ul className="flex gap-2">
        {subpages.map((sub) => {
          const Icon = sub.icon
          return (
            <li key={sub.url} className="flex-1">
              <a
                href={sub.url}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-1 rounded-lg border border-border bg-background px-2 py-2 text-[10px] font-normal text-muted-foreground transition-colors",
                  "hover:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_6%)]",
                )}
              >
                {Icon ? <Icon className="size-5 shrink-0" /> : null}
                <span className="w-full truncate text-center">{sub.title}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
