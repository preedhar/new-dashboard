import * as React from "react"
import { HomeIcon, SearchIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchCommandDialog } from "@/components/search-command-dialog"
import { UserMenuContent } from "@/components/user-menu-content"

const HIDE_THRESHOLD = 64

type MobileHeaderProps = {
  pathname: string
}

export function MobileHeader({ pathname }: MobileHeaderProps) {
  const [hidden, setHidden] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const lastScrollY = React.useRef(0)

  React.useEffect(() => {
    lastScrollY.current = window.scrollY

    function onScroll() {
      const currentY = window.scrollY
      const previousY = lastScrollY.current
      const delta = currentY - previousY

      if (currentY <= 0) {
        setHidden(false)
      } else if (delta > 4 && currentY > HIDE_THRESHOLD) {
        setHidden(true)
      } else if (delta < -4) {
        setHidden(false)
      }

      lastScrollY.current = currentY
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <header
        data-hidden={hidden}
        className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background px-4 transition-transform duration-200 ease-out data-[hidden=true]:-translate-y-full md:hidden"
      >
        <a
          href="/admin"
          className="flex shrink-0 items-center"
          aria-label="Cococart home"
        >
          <img src="/cococart-logomark.svg" alt="Cococart" className="h-8 w-8" />
        </a>
        <div className="flex flex-1 items-center gap-2">
          <a
            href="/admin"
            aria-label="Cococart home"
            data-active={pathname === "/admin"}
            className="flex h-8 flex-1 items-center justify-center gap-2 rounded-md bg-muted px-2 text-sm text-muted-foreground outline-hidden transition-colors hover:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_6%)] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_10%)] data-[active=true]:text-foreground"
          >
            <HomeIcon className="size-4 shrink-0" />
            <span className="truncate">Home</span>
          </a>
          <button
            type="button"
            className="flex h-8 flex-1 items-center justify-center gap-2 rounded-md bg-muted px-2 text-sm text-muted-foreground outline-hidden transition-colors hover:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_6%)] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon className="size-4 shrink-0" />
            <span className="truncate">Search</span>
          </button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Account"
              className="flex shrink-0 items-center justify-center rounded-full outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar className="size-8">
                <AvatarImage src="/haus-logo.png" alt="Account" />
                <AvatarFallback>DL</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <UserMenuContent side="bottom" align="end" className="min-w-56 rounded-lg" />
        </DropdownMenu>
      </header>
      <SearchCommandDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
