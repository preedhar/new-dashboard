import { type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type MobileMenuListItem = {
  title: string
  url: string
  icon?: LucideIcon
}

// The mobile hubs list their pages as bordered buttons in two columns, each one
// laying its icon and title out side by side.
export function MobileMenuList({
  ariaLabel,
  label,
  items,
}: {
  ariaLabel: string
  label?: string
  items: MobileMenuListItem[]
}) {
  return (
    <nav aria-label={ariaLabel} className="md:hidden">
      {label ? (
        <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
      ) : null}
      <ul className="grid grid-cols-2 gap-4">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.url}>
              <a
                href={item.url}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-3 text-sm font-normal text-muted-foreground transition-colors",
                  "hover:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_6%)]",
                )}
              >
                {Icon ? <Icon className="size-5 shrink-0" /> : null}
                <span className="truncate">{item.title}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
