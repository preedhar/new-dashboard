import { MobileMenuList } from "./mobile-menu-list"
import { appsAdminNav } from "../adminRoutes"

// The Store settings page doubles as a mobile hub. Beneath the Settings section
// menu we surface the Online Store app's pages, then the remaining apps under
// "More", so the storefront apps are reachable without opening the
// (hidden-on-mobile) sidebar.
export function MobileAppsMenu() {
  const onlineStore = appsAdminNav.find(
    (item) => item.url === "/admin/apps/online-store",
  )
  // Links that leave the dashboard (View store) are dropped; they still live in
  // the desktop sidebar.
  const pages = (onlineStore?.items ?? []).filter((page) => !page.external)
  // Everything in the sidebar's Apps group other than Online Store itself,
  // which has its own list above: POS first, then the "All Apps" shortcut.
  const more = appsAdminNav.filter(
    (item) => item.url !== "/admin/apps/online-store",
  )

  return (
    <>
      {pages.length > 0 ? (
        <MobileMenuList
          ariaLabel="Online Store pages"
          label="Online Store"
          items={pages}
        />
      ) : null}
      {more.length > 0 ? (
        <MobileMenuList ariaLabel="More apps" label="More" items={more} />
      ) : null}
    </>
  )
}
