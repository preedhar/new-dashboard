import { AppSidebar } from './components/app-sidebar'
import { MobileBottomNav } from './components/mobile-bottom-nav'
import { MobileHeader } from './components/mobile-header'
import { MobileSectionMenu } from './components/mobile-section-menu'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { getAdminRoute } from './adminRoutes'

type AdminPageProps = {
  pathname: string
}

export function AdminPage({ pathname }: AdminPageProps) {
  const activeRoute = getAdminRoute(pathname)

  if (!activeRoute) {
    return <AdminNotFound pathname={pathname} />
  }

  const Page = activeRoute.component
  // The order create/edit form provides its own header (back button + title) and
  // a wider top padding, so the shared chrome is suppressed for it.
  const isOrderFormPage =
    activeRoute.path === '/admin/orders/edit' ||
    activeRoute.path === '/admin/orders/new'
  // The order and delivery detail pages provide their own back button and
  // render a full-bleed card, so the shared title/header and the section's
  // horizontal padding are suppressed for them.
  const isOrderDetailPage =
    activeRoute.path === '/admin/orders/detail' ||
    activeRoute.path === '/admin/orders/deliveries/detail'
  const showDesktopHeader =
    activeRoute.path !== '/admin' &&
    activeRoute.path !== '/admin/apps' &&
    activeRoute.path !== '/admin/orders/all' &&
    activeRoute.path !== '/admin/orders/summary' &&
    activeRoute.path !== '/admin/orders/deliveries' &&
    activeRoute.path !== '/admin/orders/reviews' &&
    activeRoute.path !== '/admin/orders/analytics' &&
    !isOrderDetailPage &&
    !isOrderFormPage
  const showPageTitle =
    activeRoute.path !== '/admin' &&
    activeRoute.path !== '/admin/apps' &&
    activeRoute.path !== '/admin/orders/all' &&
    activeRoute.path !== '/admin/orders/summary' &&
    activeRoute.path !== '/admin/orders/deliveries' &&
    activeRoute.path !== '/admin/orders/reviews' &&
    activeRoute.path !== '/admin/orders/analytics' &&
    !isOrderDetailPage &&
    !isOrderFormPage

  return (
    <SidebarProvider open onOpenChange={() => {}}>
      <AppSidebar pathname={activeRoute.path} />
      <SidebarInset className="min-w-0">
        <MobileHeader pathname={activeRoute.path} />
        {showDesktopHeader ? (
          <header className="hidden h-16 shrink-0 items-center gap-2 border-b border-border px-4 md:flex">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{activeRoute.label}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
        ) : null}

        <section
          className={cn(
            'flex min-w-0 flex-1 flex-col gap-6',
            // The order detail page is full-bleed (no horizontal padding) so its
            // card sits flush to the screen edges, and it has no bottom padding
            // since its action bar is pinned to the bottom edge.
            isOrderDetailPage
              ? 'pb-0 pt-0'
              : 'px-4 pb-24 pt-5 sm:px-6 sm:pb-24 md:pb-6 lg:px-8 lg:pb-8',
            isOrderFormPage && 'pt-4 sm:pt-8 lg:pt-8',
          )}
        >
          {showPageTitle ? (
            <header>
              <h1 className="text-2xl font-semibold tracking-normal text-neutral-900">
                {activeRoute.title}
              </h1>
            </header>
          ) : null}

          <MobileSectionMenu pathname={activeRoute.path} />

          <Page />
        </section>
      </SidebarInset>
      {isOrderFormPage || isOrderDetailPage ? null : (
        <MobileBottomNav pathname={activeRoute.path} />
      )}
    </SidebarProvider>
  )
}

function AdminNotFound({ pathname }: { pathname: string }) {
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
          href="/admin"
        >
          Go to admin home
        </a>
      </div>
    </main>
  )
}
