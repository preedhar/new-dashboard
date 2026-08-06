import * as React from "react"
import {
  CalendarDays,
  Coins,
  CreditCard,
  EyeOff,
  Globe,
  Palette,
  Percent,
  ReceiptText,
  Search,
  Store,
  Users,
  X,
  type LucideIcon,
} from "lucide-react"

import productImage from "@/assets/product.png"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

type SearchResult = {
  title: string
  url: string
  // Products and categories lead with their own image, the way they do on the
  // Products page; everything else leads with the icon of the page it sits on.
  icon?: LucideIcon
  image?: string
  // Right-aligned muted text: the page this result lives on.
  meta?: string
}

// The five things a merchant is most likely to jump to, shown before they type.
const SUGGESTIONS: SearchResult[] = [
  { title: "All orders", url: "/admin/orders/all", icon: ReceiptText, meta: "Orders" },
  {
    title: "Calendar",
    url: "/admin/apps/online-store/calendar",
    icon: CalendarDays,
    meta: "Online Store",
  },
  { title: "Website", url: "/admin/settings/website", icon: Globe, meta: "Settings" },
  { title: "Payments", url: "/admin/settings/payments", icon: CreditCard, meta: "Settings" },
  {
    title: "Appearance",
    url: "/admin/settings/website/appearance",
    icon: Palette,
    meta: "Settings",
  },
]

const SEARCH_FILTERS = ["Settings", "Orders", "Products", "Customers", "Bookings"] as const

type SearchFilter = (typeof SEARCH_FILTERS)[number]

// Sample results, one group per filter. This is a prototype, so any query that
// isn't the "empty" keyword returns the same set rather than really searching.
const SAMPLE_RESULTS: Record<SearchFilter, SearchResult[]> = {
  // Settings results are the individual fields a merchant is hunting for, so
  // the right column names the subpage each one lives on.
  Settings: [
    { title: "Store name", url: "/admin/settings/store", icon: Store, meta: "Store" },
    { title: "Currency", url: "/admin/settings/store", icon: Coins, meta: "Store" },
    {
      title: "Custom domain",
      url: "/admin/settings/website/custom-domain",
      icon: Globe,
      meta: "Website",
    },
    { title: "Private mode", url: "/admin/settings/website", icon: EyeOff, meta: "Website" },
    { title: "Tax", url: "/admin/settings/payments", icon: Percent, meta: "Payments" },
    {
      title: "Theme",
      url: "/admin/settings/website/appearance",
      icon: Palette,
      meta: "Appearance",
    },
  ],
  // Order ids follow the All Orders page: the customer's first three letters
  // in caps, then the order's number.
  Orders: [
    {
      title: "AME24 · Amelia Chan",
      url: "/admin/orders/all",
      icon: ReceiptText,
      meta: "All orders",
    },
    {
      title: "RAF19 · Rafael Ortiz",
      url: "/admin/orders/all",
      icon: ReceiptText,
      meta: "All orders",
    },
    {
      title: "PRI12 · Priya Nair",
      url: "/admin/orders/all",
      icon: ReceiptText,
      meta: "All orders",
    },
  ],
  Products: [
    {
      title: "Chocolate truffle cake",
      url: "/admin/products",
      image: productImage,
      meta: "Products",
    },
    {
      title: "Matcha basque cheesecake",
      url: "/admin/products",
      image: productImage,
      meta: "Products",
    },
    { title: "Cakes", url: "/admin/products/categories", image: productImage, meta: "Categories" },
    {
      title: "Cold brews",
      url: "/admin/products/categories",
      image: productImage,
      meta: "Categories",
    },
  ],
  Customers: [
    { title: "Amelia Chan", url: "/admin/marketing/customers", icon: Users, meta: "Customers" },
    { title: "Rafael Ortiz", url: "/admin/marketing/customers", icon: Users, meta: "Customers" },
  ],
  // Bookings read like orders, with a BKG-prefixed id standing in for the
  // order number.
  Bookings: [
    {
      title: "BKG24 · Amelia Chan",
      url: "/admin/bookings/all",
      icon: CalendarDays,
      meta: "All bookings",
    },
    {
      title: "BKG18 · Rafael Ortiz",
      url: "/admin/bookings/all",
      icon: CalendarDays,
      meta: "All bookings",
    },
    {
      title: "BKG11 · Priya Nair",
      url: "/admin/bookings/all",
      icon: CalendarDays,
      meta: "All bookings",
    },
  ],
}

// Typing this shows the empty state, so the design can be reviewed on demand.
const EMPTY_STATE_QUERY = "empty"

// Mirrors the filter buttons on the All Orders page: muted until applied, then
// outlined in the foreground colour with an X standing in for "clear".
const FILTER_BUTTON_CLASS = "h-9 shrink-0 rounded-[8px] px-3 font-normal text-muted-foreground"
const FILTER_BUTTON_ACTIVE_CLASS = "border-foreground text-foreground"

type SearchCommandDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchCommandDialog({ open, onOpenChange }: SearchCommandDialogProps) {
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<SearchFilter | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Each visit starts from the suggestions rather than the last search.
  function handleOpenChange(next: boolean) {
    if (!next) {
      setQuery("")
      setFilter(null)
    }
    onOpenChange(next)
  }

  const searching = query.trim() !== "" || filter !== null
  const isEmptyState = query.trim().toLowerCase() === EMPTY_STATE_QUERY

  // Before the merchant types or picks a filter it's the suggestions; after,
  // the sample results, narrowed to the applied filter's group.
  const groups: { heading: string; items: SearchResult[] }[] = !searching
    ? [{ heading: "Suggestions", items: SUGGESTIONS }]
    : SEARCH_FILTERS.filter((type) => filter === null || type === filter).map((type) => ({
        heading: type,
        items: SAMPLE_RESULTS[type],
      }))

  function handleSelect(url: string) {
    handleOpenChange(false)
    window.history.pushState(null, "", url)
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  // Clicking a filter takes focus out of the input; hand it back so the
  // merchant can keep typing.
  function handleFilterClick(type: SearchFilter) {
    setFilter((current) => (current === type ? null : type))
    inputRef.current?.focus()
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      className="sm:max-w-xl"
      title="Search"
      description="Search across settings, orders, products, customers and bookings."
    >
      {/* The results are chosen here, not matched against the query, so cmdk's
          own filtering stays out of the way. */}
      <Command shouldFilter={false}>
        <CommandInput ref={inputRef} placeholder="Search" value={query} onValueChange={setQuery} />

        {/* On a phone the row scrolls sideways rather than wrapping, so the
            results keep their place on screen. The scrollbar is hidden here
            rather than via a shared utility, which this project doesn't define. */}
        <div className="flex items-center gap-2 overflow-x-auto px-4 pt-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SEARCH_FILTERS.map((type) => {
            const active = filter === type

            return (
              <Button
                key={type}
                variant="outline"
                aria-pressed={active}
                className={cn(FILTER_BUTTON_CLASS, active && FILTER_BUTTON_ACTIVE_CLASS)}
                onClick={() => handleFilterClick(type)}
              >
                {type}
                {active ? (
                  <span
                    aria-hidden
                    className="-mr-1 inline-flex size-5 items-center justify-center rounded-sm text-foreground"
                  >
                    <X className="size-4" />
                  </span>
                ) : null}
              </Button>
            )
          })}
        </div>

        <CommandList>
          {isEmptyState ? (
            <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
              <Search className="size-5 text-muted-foreground" />
              <p className="text-sm font-medium">No results found</p>
              <p className="text-sm text-muted-foreground">Try a different search term</p>
            </div>
          ) : (
            groups.map((group) => (
              <CommandGroup
                key={group.heading}
                heading={group.heading}
                className="**:[[cmdk-group-heading]]:text-sm"
              >
                {group.items.map((item) => {
                  const Icon = item.icon

                  return (
                    <CommandItem
                      key={`${group.heading}-${item.title}`}
                      value={`${group.heading} ${item.title}`}
                      className="grid h-11 grid-cols-[1.5rem_minmax(0,1fr)_minmax(7rem,auto)] gap-3 [&>svg:last-child]:hidden"
                      onSelect={() => handleSelect(item.url)}
                    >
                      {/* Icons and images share a column, so both sit on the
                          same left edge whatever a row leads with. */}
                      <span className="flex size-6 items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt=""
                            className="size-6 rounded-[4px] object-cover"
                          />
                        ) : Icon ? (
                          <Icon />
                        ) : null}
                      </span>
                      <span className="truncate">{item.title}</span>
                      {item.meta ? (
                        <span className="justify-self-end text-right text-sm text-muted-foreground">
                          {item.meta}
                        </span>
                      ) : (
                        <span />
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
