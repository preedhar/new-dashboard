import {
  BarChart3,
  Boxes,
  CalendarDays,
  CalendarRange,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  Gift,
  Globe,
  Home,
  LayoutGrid,
  LayoutList,
  Mail,
  Megaphone,
  Monitor,
  Package,
  Percent,
  Settings,
  ReceiptText,
  Star,
  Store,
  Tag,
  Tags,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { AdminCustomersPage } from './pages/AdminCustomersPage'
import { AdminOrdersAllPage, AdminOrderDetailPage } from './pages/AdminOrdersAllPage'
import { AdminOrderEditPage } from './pages/AdminOrderEditPage'
import { AdminOrdersSummaryPage } from './pages/AdminOrdersSummaryPage'
import { AdminOrdersReviewsPage } from './pages/AdminOrdersReviewsPage'
import {
  AdminOrdersDeliveriesPage,
  AdminDeliveryDetailPage,
} from './pages/AdminOrdersDeliveriesPage'
import {
  AdminOrdersEarningsPage,
  AdminPayoutDetailPage,
} from './pages/AdminOrdersEarningsPage'
import { AdminOrdersAnalyticsPage } from './pages/AdminOrdersAnalyticsPage'
import { AdminAppsPage } from './pages/AdminAppsPage'
import { AdminFulfillmentPage } from './pages/AdminFulfillmentPage'
import { AdminSettingsStorePage } from './pages/AdminSettingsStorePage'
import { AdminSettingsTeamPage } from './pages/AdminSettingsTeamPage'
import { AdminOverviewPage } from './pages/AdminOverviewPage'
import { AdminPagePlaceholder } from './pages/AdminPagePlaceholder'

export type AdminRoute = {
  path: string
  label: string
  title: string
  icon: LucideIcon
  component: () => React.ReactNode
}

export type AdminNavItem = {
  title: string
  url: string
  icon: LucideIcon
  items?: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}

function createAdminPlaceholder(title: string, description: string) {
  return function AdminPlaceholderRoute() {
    return <AdminPagePlaceholder title={title} description={description} />
  }
}

export const primaryAdminNav: AdminNavItem[] = [
  {
    title: 'Orders',
    url: '/admin/orders/all',
    icon: ReceiptText,
    items: [
      { title: 'All Orders', url: '/admin/orders/all', icon: ReceiptText },
      { title: 'Summary', url: '/admin/orders/summary', icon: LayoutList },
      { title: 'Deliveries', url: '/admin/orders/deliveries', icon: Truck },
      { title: 'Reviews', url: '/admin/orders/reviews', icon: Star },
      { title: 'Earnings', url: '/admin/orders/earnings', icon: CircleDollarSign },
      { title: 'Analytics', url: '/admin/orders/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Products',
    url: '/admin/products/all',
    icon: Package,
    items: [
      { title: 'All Products', url: '/admin/products/all', icon: Package },
      { title: 'Categories', url: '/admin/products/categories', icon: Tags },
      { title: 'Bundles', url: '/admin/products/bundles', icon: Boxes },
    ],
  },
  {
    title: 'Bookings',
    url: '/admin/bookings/all',
    icon: CalendarDays,
    items: [
      { title: 'All Bookings', url: '/admin/bookings/all', icon: CalendarDays },
      { title: 'Booking Forms', url: '/admin/bookings/forms', icon: ClipboardList },
      { title: 'Timeline', url: '/admin/bookings/timeline', icon: CalendarRange },
    ],
  },
  {
    title: 'Marketing',
    url: '/admin/marketing/share',
    icon: Megaphone,
    items: [
      { title: 'Share', url: '/admin/marketing/share', icon: Megaphone },
      { title: 'Discounts', url: '/admin/marketing/discounts', icon: Percent },
      { title: 'Customers', url: '/admin/marketing/customers', icon: Users },
      { title: 'Email Marketing', url: '/admin/marketing/email', icon: Mail },
      { title: 'Loyalty', url: '/admin/marketing/loyalty', icon: Gift },
    ],
  },
  {
    title: 'Settings',
    url: '/admin/settings/store',
    icon: Settings,
    items: [
      { title: 'Store', url: '/admin/settings/store', icon: Store },
      { title: 'Website', url: '/admin/settings/website', icon: Globe },
      { title: 'Payments', url: '/admin/settings/payments', icon: CreditCard },
      { title: 'Team', url: '/admin/settings/team', icon: Users },
      { title: 'Billing', url: '/admin/settings/billing', icon: ReceiptText },
    ],
  },
]

export const appsAdminNav: AdminNavItem[] = [
  {
    title: 'Online Store',
    url: '/admin/apps/online-store',
    icon: Globe,
    items: [
      { title: 'Fulfillment', url: '/admin/apps/online-store/fulfillment' },
      { title: 'Inventory Calendar', url: '/admin/apps/online-store/inventory-calendar' },
      { title: 'Checkouts', url: '/admin/apps/online-store/checkouts' },
      { title: 'Website', url: '/admin/apps/online-store/website' },
    ],
  },
  {
    title: 'POS',
    url: '/admin/apps/pos',
    icon: Monitor,
  },
  {
    title: 'All Apps',
    url: '/admin/apps',
    icon: LayoutGrid,
  },
]

export const adminRoutes: AdminRoute[] = [
  {
    path: '/admin',
    label: 'Home',
    title: 'Dashboard',
    icon: Home,
    component: AdminOverviewPage,
  },
  {
    path: '/admin/orders',
    label: 'Orders',
    title: 'Orders',
    icon: ReceiptText,
    component: createAdminPlaceholder(
      'Orders',
      'A future workspace for reviewing incoming orders, fulfillment status, and order history.',
    ),
  },
  {
    path: '/admin/orders/all',
    label: 'All Orders',
    title: 'All Orders',
    icon: ReceiptText,
    component: AdminOrdersAllPage,
  },
  {
    path: '/admin/orders/detail',
    label: 'Order Details',
    title: 'Order Details',
    icon: ReceiptText,
    component: AdminOrderDetailPage,
  },
  {
    path: '/admin/orders/summary',
    label: 'Summary',
    title: 'Order Summary',
    icon: ReceiptText,
    component: AdminOrdersSummaryPage,
  },
  {
    path: '/admin/orders/edit',
    label: 'Edit Order',
    title: 'Edit Order',
    icon: ReceiptText,
    component: () => <AdminOrderEditPage />,
  },
  {
    path: '/admin/orders/new',
    label: 'Add Order',
    title: 'Add Order',
    icon: ReceiptText,
    component: () => <AdminOrderEditPage title="Add order" />,
  },
  {
    path: '/admin/orders/deliveries',
    label: 'Deliveries',
    title: 'Deliveries',
    icon: Truck,
    component: AdminOrdersDeliveriesPage,
  },
  {
    path: '/admin/orders/deliveries/detail',
    label: 'Delivery Details',
    title: 'Delivery Details',
    icon: Truck,
    component: AdminDeliveryDetailPage,
  },
  {
    path: '/admin/orders/reviews',
    label: 'Reviews',
    title: 'Reviews',
    icon: Star,
    component: AdminOrdersReviewsPage,
  },
  {
    path: '/admin/orders/earnings',
    label: 'Earnings',
    title: 'Earnings',
    icon: CircleDollarSign,
    component: AdminOrdersEarningsPage,
  },
  {
    path: '/admin/orders/earnings/detail',
    label: 'Payout Details',
    title: 'Payout Details',
    icon: CircleDollarSign,
    component: AdminPayoutDetailPage,
  },
  {
    path: '/admin/orders/analytics',
    label: 'Analytics',
    title: 'Order Analytics',
    icon: BarChart3,
    component: () => <AdminOrdersAnalyticsPage />,
  },
  {
    path: '/admin/products',
    label: 'Products',
    title: 'Products',
    icon: Package,
    component: createAdminPlaceholder(
      'Products',
      'A future workspace for managing the catalog, inventory, pricing, and product availability.',
    ),
  },
  {
    path: '/admin/products/all',
    label: 'All Products',
    title: 'All Products',
    icon: Package,
    component: createAdminPlaceholder(
      'All Products',
      'A future workspace for browsing, filtering, and managing every product.',
    ),
  },
  {
    path: '/admin/products/categories',
    label: 'Categories',
    title: 'Categories',
    icon: Package,
    component: createAdminPlaceholder(
      'Categories',
      'A future workspace for organizing product collections and category pages.',
    ),
  },
  {
    path: '/admin/products/bundles',
    label: 'Bundles',
    title: 'Bundles',
    icon: Package,
    component: createAdminPlaceholder(
      'Bundles',
      'A future workspace for grouped products, bundle pricing, and package offers.',
    ),
  },
  {
    path: '/admin/bookings',
    label: 'Bookings',
    title: 'Bookings',
    icon: CalendarDays,
    component: createAdminPlaceholder(
      'Bookings',
      'A future workspace for booking requests, appointments, and availability.',
    ),
  },
  {
    path: '/admin/bookings/all',
    label: 'All Bookings',
    title: 'All Bookings',
    icon: CalendarDays,
    component: createAdminPlaceholder(
      'All Bookings',
      'A future workspace for browsing, filtering, and managing every booking.',
    ),
  },
  {
    path: '/admin/bookings/forms',
    label: 'Booking Forms',
    title: 'Booking Forms',
    icon: CalendarDays,
    component: createAdminPlaceholder(
      'Booking Forms',
      'A future workspace for configuring intake forms and booking questions.',
    ),
  },
  {
    path: '/admin/bookings/timeline',
    label: 'Timeline',
    title: 'Timeline',
    icon: CalendarDays,
    component: createAdminPlaceholder(
      'Timeline',
      'A future workspace for viewing bookings across a calendar-style schedule.',
    ),
  },
  {
    path: '/admin/bookings/analytics',
    label: 'Analytics',
    title: 'Booking Analytics',
    icon: BarChart3,
    component: createAdminPlaceholder(
      'Booking Analytics',
      'A future workspace for booking volume, utilization, and service performance analytics.',
    ),
  },
  {
    path: '/admin/marketing/share',
    label: 'Share',
    title: 'Share',
    icon: Megaphone,
    component: createAdminPlaceholder(
      'Share',
      'A future workspace for social links, campaign sharing, and promotional assets.',
    ),
  },
  {
    path: '/admin/marketing/discounts',
    label: 'Discounts',
    title: 'Discounts',
    icon: Tag,
    component: createAdminPlaceholder(
      'Discounts',
      'A future workspace for promotions, discount codes, and campaign rules.',
    ),
  },
  {
    path: '/admin/marketing/email',
    label: 'Email Marketing',
    title: 'Email Marketing',
    icon: Mail,
    component: createAdminPlaceholder(
      'Email Marketing',
      'A future workspace for newsletters, automations, and customer campaigns.',
    ),
  },
  {
    path: '/admin/marketing/customers',
    label: 'Customers',
    title: 'Customers',
    icon: Users,
    component: AdminCustomersPage,
  },
  {
    path: '/admin/marketing/loyalty',
    label: 'Loyalty',
    title: 'Loyalty',
    icon: Megaphone,
    component: createAdminPlaceholder(
      'Loyalty',
      'A future workspace for rewards, retention programs, and member benefits.',
    ),
  },
  {
    path: '/admin/analytics',
    label: 'Analytics',
    title: 'Analytics',
    icon: BarChart3,
    component: createAdminPlaceholder(
      'Analytics',
      'A future workspace for sales trends, product performance, and customer insights.',
    ),
  },
  {
    path: '/admin/settings',
    label: 'Settings',
    title: 'Settings',
    icon: Settings,
    component: createAdminPlaceholder(
      'Settings',
      'A future workspace for store preferences, payments, shipping, and account settings.',
    ),
  },
  {
    path: '/admin/settings/payments',
    label: 'Payments',
    title: 'Payments',
    icon: Settings,
    component: createAdminPlaceholder(
      'Payments',
      'A future workspace for payment methods, payouts, taxes, and checkout rules.',
    ),
  },
  {
    path: '/admin/settings/website',
    label: 'Website',
    title: 'Website',
    icon: Settings,
    component: createAdminPlaceholder(
      'Website',
      'A future workspace for storefront pages, domains, theme settings, and SEO.',
    ),
  },
  {
    path: '/admin/settings/store',
    label: 'Store',
    title: 'Store',
    icon: Settings,
    component: AdminSettingsStorePage,
  },
  {
    path: '/admin/settings/team',
    label: 'Team',
    title: 'Team',
    icon: Settings,
    component: AdminSettingsTeamPage,
  },
  {
    path: '/admin/settings/billing',
    label: 'Billing',
    title: 'Billing',
    icon: Settings,
    component: createAdminPlaceholder(
      'Billing',
      'A future workspace for plans, invoices, and subscription details.',
    ),
  },
  {
    path: '/admin/apps',
    label: 'All Apps',
    title: 'Apps',
    icon: LayoutGrid,
    component: AdminAppsPage,
  },
  {
    path: '/admin/apps/online-store',
    label: 'Online Store',
    title: 'Online Store',
    icon: Globe,
    component: createAdminPlaceholder(
      'Online Store',
      'A future workspace for configuring the online storefront app.',
    ),
  },
  {
    path: '/admin/apps/online-store/fulfillment',
    label: 'Fulfillment',
    title: 'Fulfillment',
    icon: Globe,
    component: AdminFulfillmentPage,
  },
  {
    path: '/admin/apps/online-store/inventory-calendar',
    label: 'Inventory Calendar',
    title: 'Inventory Calendar',
    icon: CalendarDays,
    component: createAdminPlaceholder(
      'Inventory Calendar',
      'A future workspace for planning inventory availability across upcoming dates.',
    ),
  },
  {
    path: '/admin/apps/online-store/checkouts',
    label: 'Checkouts',
    title: 'Checkouts',
    icon: ReceiptText,
    component: createAdminPlaceholder(
      'Checkouts',
      'A future workspace for configuring checkout settings, fields, and conversion flows.',
    ),
  },
  {
    path: '/admin/apps/online-store/website',
    label: 'Website',
    title: 'Website',
    icon: Globe,
    component: createAdminPlaceholder(
      'Website',
      'A future workspace for online store pages, theme settings, domains, and SEO.',
    ),
  },
  {
    path: '/admin/apps/pos',
    label: 'POS',
    title: 'POS',
    icon: Monitor,
    component: createAdminPlaceholder(
      'POS',
      'A future workspace for configuring point-of-sale tools and workflows.',
    ),
  },
]

export function getAdminRoute(pathname: string) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/admin'
  return adminRoutes.find((route) => route.path === normalizedPath)
}

// Maps each parent section route (e.g. /admin/orders) to its first subpage
// (e.g. /admin/orders/all). Derived from the nav config so it stays in sync:
// each nav item's `url` already points at its first subpage, so the parent is
// that url with its last segment removed.
const adminParentRedirects: Record<string, string> = primaryAdminNav.reduce(
  (redirects, item) => {
    if (item.items && item.items.length > 0) {
      const firstSubpage = item.items[0].url
      const parentPath = firstSubpage.slice(0, firstSubpage.lastIndexOf('/'))
      redirects[parentPath] = firstSubpage
    }
    return redirects
  },
  {} as Record<string, string>,
)

export function getAdminRedirect(pathname: string) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/admin'
  return adminParentRedirects[normalizedPath]
}
