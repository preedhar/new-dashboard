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
