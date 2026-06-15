import { AppSidebar } from './components/app-sidebar'
import { MobileBottomNav } from './components/mobile-bottom-nav'
import { MobileHeader } from './components/mobile-header'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { getAdmin2Route } from './admin2Routes'

type Admin2PageProps = {
  pathname: string
}

export function Admin2Page({ pathname }: Admin2PageProps) {
  const activeRoute = getAdmin2Route(pathname)

  if (!activeRoute) {
    return <Admin2NotFound pathname={pathname} />
  }

  const Page = activeRoute.component
  const showDesktopHeader =
    activeRoute.path !== '/admin-2' && activeRoute.path !== '/admin-2/apps'
  const showPageTitle = activeRoute.path !== '/admin-2' && activeRoute.path !== '/admin-2/apps'

  return (
    <SidebarProvider open onOpenChange={() => {}}>
      <AppSidebar pathname={activeRoute.path} />
      <SidebarInset>
        <MobileHeader pathname={activeRoute.path} />
        {showDesktopHeader ? (
          <header className="hidden h-16 shrink-0 items-center gap-2 border-b border-border px-4 md:flex">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin-2">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{activeRoute.label}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
        ) : null}

        <section className="flex flex-1 flex-col gap-6 p-4 pt-6 pb-24 sm:px-6 sm:pt-6 sm:pb-24 md:pb-6 lg:px-8 lg:pt-8 lg:pb-8">
          {showPageTitle ? (
            <header>
              <h1 className="text-2xl font-semibold tracking-normal text-neutral-900">
                {activeRoute.title}
              </h1>
            </header>
          ) : null}

          <Page />
        </section>
      </SidebarInset>
      <MobileBottomNav pathname={activeRoute.path} />
    </SidebarProvider>
  )
}

function Admin2NotFound({ pathname }: { pathname: string }) {
  return (
    <main className="min-h-svh bg-muted/30 px-6 py-10 text-foreground">
      <div className="mx-auto max-w-2xl rounded-lg border border-border bg-background p-6 shadow-xs">
        <p className="text-sm font-medium text-muted-foreground">Admin route not found</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal text-neutral-900">
          No admin page exists for this path yet
        </h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">{pathname}</p>
        <a
          className="mt-6 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-neutral-950 transition hover:bg-primary/80"
          href="/admin-2"
        >
          Go to admin home
        </a>
      </div>
    </main>
  )
}
