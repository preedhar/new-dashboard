import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { ArrowUpRightIcon, ChevronRightIcon } from "lucide-react"

export function NavMain({
  items,
  label,
  className,
}: {
  items: {
    title: string
    url: string
    icon: React.ReactNode
    isActive?: boolean
    items?: {
      title: string
      url: string
      isActive?: boolean
      // Redirect and external links both leave this section, so they get an
      // arrow to say so; external ones also open in a new tab.
      redirect?: boolean
      external?: boolean
    }[]
  }[]
  label?: string
  className?: string
}) {
  return (
    <SidebarGroup className={cn(className)}>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={item.isActive}
                tooltip={item.title}
                className={cn(
                  !item.isActive && "text-muted-foreground",
                  item.isActive &&
                    (item.items?.length
                      ? "data-[active=true]:bg-transparent"
                      : "data-[active=true]:bg-[color-mix(in_oklch,var(--sidebar-accent),var(--sidebar-foreground)_5%)]"),
                )}
              >
                <a href={item.url}>
                  {item.icon}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="text-muted-foreground data-[state=open]:rotate-90">
                      <ChevronRightIcon />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={subItem.isActive}
                            className={cn(
                              !subItem.isActive && "text-muted-foreground",
                              subItem.isActive &&
                                "data-[active=true]:bg-[color-mix(in_oklch,var(--sidebar-accent),var(--sidebar-foreground)_5%)]",
                            )}
                          >
                            <a
                              href={subItem.url}
                              target={subItem.external ? "_blank" : undefined}
                              rel={subItem.external ? "noreferrer" : undefined}
                            >
                              <span className="truncate">{subItem.title}</span>
                              {subItem.redirect || subItem.external ? (
                                // The button's own [&>svg] rules force size and color, so override both.
                                <ArrowUpRightIcon className="size-3.5! shrink-0 text-current!" />
                              ) : null}
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
