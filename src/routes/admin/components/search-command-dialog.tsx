import * as React from "react"
import { AppWindowMac, PackageOpen, Smile } from "lucide-react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  appsAdminNav,
  primaryAdminNav,
  type AdminNavItem,
} from "../adminRoutes"

type CommandNavItem = {
  title: string
  url: string
  parentTitle?: string
  icon: AdminNavItem["icon"]
}

const navByTitle = new Map(
  [...primaryAdminNav, ...appsAdminNav].flatMap((item) => [
    [item.title, { title: item.title, url: item.url, icon: item.icon }],
    ...(item.items?.map(
      (subItem) =>
        [
          subItem.title,
          {
            title: subItem.title,
            url: subItem.url,
            parentTitle: item.title,
            icon: item.icon,
          },
        ] as const,
    ) ?? []),
  ] as const),
)

function withIcon(item: CommandNavItem | undefined, icon: CommandNavItem["icon"]) {
  return item ? { ...item, icon } : undefined
}

const commandGroups: { heading: string; items: CommandNavItem[] }[] = [
  {
    heading: "Suggested",
    items: [
      navByTitle.get("All Orders"),
      withIcon(navByTitle.get("Inventory Calendar"), PackageOpen),
      withIcon(navByTitle.get("Website"), AppWindowMac),
      {
        title: "Get Help",
        url: "#help",
        icon: Smile,
      },
    ].filter((item): item is CommandNavItem => Boolean(item)),
  },
  {
    heading: "Apps",
    items: [
      navByTitle.get("POS"),
      {
        title: "Loyalty Program",
        url: "/admin/marketing/loyalty",
        parentTitle: "Marketing",
        icon: primaryAdminNav.find((item) => item.title === "Marketing")!.icon,
      },
      {
        title: "Kitchen Display",
        url: "/admin/apps",
        parentTitle: "Apps",
        icon: appsAdminNav.find((item) => item.title === "All Apps")!.icon,
      },
    ].filter((item): item is CommandNavItem => Boolean(item)),
  },
]

type SearchCommandDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchCommandDialog({ open, onOpenChange }: SearchCommandDialogProps) {
  function handleSelect(url: string) {
    onOpenChange(false)
    window.history.pushState(null, "", url)
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-xl"
      title="Search navigation"
      description="Search for an admin page to open."
    >
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {commandGroups.map((group, groupIndex) => (
            <React.Fragment key={group.heading}>
              {groupIndex > 0 ? <CommandSeparator /> : null}
              <CommandGroup heading={group.heading}>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const parentTitle =
                    group.heading === "Apps" ? undefined : item.parentTitle

                  return (
                    <CommandItem
                      key={`${group.heading}-${item.url}`}
                      value={`${item.parentTitle ?? group.heading} ${item.title}`}
                      className="grid h-10 grid-cols-[1rem_minmax(0,1fr)_minmax(7rem,auto)] gap-3 [&>svg:last-child]:hidden"
                      onSelect={() => handleSelect(item.url)}
                    >
                      <Icon />
                      <span className="truncate">{item.title}</span>
                      {parentTitle ? (
                        <span className="justify-self-end text-right text-xs text-muted-foreground">
                          {parentTitle}
                        </span>
                      ) : (
                        <span />
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
