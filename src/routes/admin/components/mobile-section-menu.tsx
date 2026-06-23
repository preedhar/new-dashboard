import { ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { primaryAdminNav } from "../adminRoutes"

type MobileSectionMenuProps = {
  pathname: string
}

// On mobile the sidebar is hidden, so a section's first subpage doubles as its
// hub: it shows a menu linking to the other subpages in that parent section.
export function MobileSectionMenu({ pathname }: MobileSectionMenuProps) {
  const section = primaryAdminNav.find((item) => item.url === pathname)
  const subpages = section?.items?.filter((sub) => sub.url !== section.url) ?? []

  if (!section || subpages.length === 0) {
    return null
  }

  return (
    <nav aria-label={`${section.title} pages`} className="md:hidden">
      <ul className="grid grid-cols-2 gap-3">
        {subpages.map((sub) => {
          const Icon = sub.icon
          return (
            <li key={sub.url}>
              <a
                href={sub.url}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3.5 text-sm font-medium text-foreground transition-colors",
                  "hover:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_6%)]",
                )}
              >
                {Icon ? (
                  <Icon className="size-5 shrink-0 text-muted-foreground" />
                ) : null}
                <span className="flex-1 truncate">{sub.title}</span>
                <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
