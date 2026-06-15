import {
  BarChart3,
  CalendarDays,
  Globe,
  Home,
  LayoutGrid,
  Mail,
  Megaphone,
  Monitor,
  Package,
  Settings,
  ReceiptText,
  Tag,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { Admin2CustomersPage } from './pages/Admin2CustomersPage'
import { Admin2AppsPage } from './pages/Admin2AppsPage'
import { Admin2OverviewPage } from './pages/Admin2OverviewPage'
import { Admin2PagePlaceholder } from './pages/Admin2PagePlaceholder'

export type Admin2Route = {
  path: string
  label: string
  title: string
  icon: LucideIcon
  component: () => React.ReactNode
}

export type Admin2NavItem = {
  title: string
  url: string
  icon: LucideIcon
  items?: {
    title: string
    url: string
  }[]
}

function createAdmin2Placeholder(title: string, description: string) {
  return function Admin2PlaceholderRoute() {
    return <Admin2PagePlaceholder title={title} description={description} />
  }
}

export const primaryAdmin2Nav: Admin2NavItem[] = [
  {
    title: 'Orders',
    url: '/admin-2/orders/all',
    icon: ReceiptText,
    items: [
      { title: 'All Orders', url: '/admin-2/orders/all' },
      { title: 'Summary', url: '/admin-2/orders/summary' },
      { title: 'Deliveries', url: '/admin-2/orders/deliveries' },
      { title: 'Reviews', url: '/admin-2/orders/reviews' },
      { title: 'Analytics', url: '/admin-2/orders/analytics' },
    ],
  },
  {
    title: 'Products',
    url: '/admin-2/products',
    icon: Package,
    items: [
      { title: 'Products', url: '/admin-2/products' },
      { title: 'Categories', url: '/admin-2/products/categories' },
      { title: 'Bundles', url: '/admin-2/products/bundles' },
    ],
  },
  {
    title: 'Bookings',
    url: '/admin-2/bookings',
    icon: CalendarDays,
    items: [
      { title: 'Bookings', url: '/admin-2/bookings' },
      { title: 'Booking Forms', url: '/admin-2/bookings/forms' },
      { title: 'Timeline', url: '/admin-2/bookings/timeline' },
      { title: 'Analytics', url: '/admin-2/bookings/analytics' },
    ],
  },
  {
    title: 'Marketing',
    url: '/admin-2/marketing/share',
    icon: Megaphone,
    items: [
      { title: 'Share', url: '/admin-2/marketing/share' },
      { title: 'Discounts', url: '/admin-2/marketing/discounts' },
      { title: 'Customers', url: '/admin-2/marketing/customers' },
      { title: 'Email Marketing', url: '/admin-2/marketing/email' },
      { title: 'Loyalty', url: '/admin-2/marketing/loyalty' },
    ],
  },
  {
    title: 'Settings',
    url: '/admin-2/settings/payments',
    icon: Settings,
    items: [
      { title: 'Payments', url: '/admin-2/settings/payments' },
      { title: 'Website', url: '/admin-2/settings/website' },
      { title: 'Store', url: '/admin-2/settings/store' },
      { title: 'Team', url: '/admin-2/settings/team' },
      { title: 'Billing', url: '/admin-2/settings/billing' },
    ],
  },
]

export const appsAdmin2Nav: Admin2NavItem[] = [
  {
    title: 'Online Store',
    url: '/admin-2/apps/online-store',
    icon: Globe,
    items: [
      { title: 'Fulfillment', url: '/admin-2/apps/online-store/fulfillment' },
      { title: 'Inventory Calendar', url: '/admin-2/apps/online-store/inventory-calendar' },
      { title: 'Checkouts', url: '/admin-2/apps/online-store/checkouts' },
      { title: 'Website', url: '/admin-2/apps/online-store/website' },
    ],
  },
  {
    title: 'POS',
    url: '/admin-2/apps/pos',
    icon: Monitor,
  },
  {
    title: 'All Apps',
    url: '/admin-2/apps',
    icon: LayoutGrid,
  },
]

export const admin2Routes: Admin2Route[] = [
  {
    path: '/admin-2',
    label: 'Home',
    title: 'Dashboard',
    icon: Home,
    component: Admin2OverviewPage,
  },
  {
    path: '/admin-2/orders',
    label: 'Orders',
    title: 'Orders',
    icon: ReceiptText,
    component: createAdmin2Placeholder(
      'Orders',
      'A future workspace for reviewing incoming orders, fulfillment status, and order history.',
    ),
  },
  {
    path: '/admin-2/orders/all',
    label: 'All Orders',
    title: 'All Orders',
    icon: ReceiptText,
    component: createAdmin2Placeholder(
      'All Orders',
      'A future workspace for browsing, filtering, and managing every order.',
    ),
  },
  {
    path: '/admin-2/orders/summary',
    label: 'Summary',
    title: 'Order Summary',
    icon: ReceiptText,
    component: createAdmin2Placeholder(
      'Order Summary',
      'A future workspace for order totals, trends, and operational snapshots.',
    ),
  },
  {
    path: '/admin-2/orders/deliveries',
    label: 'Deliveries',
    title: 'Deliveries',
    icon: Truck,
    component: createAdmin2Placeholder(
      'Deliveries',
      'A future workspace for delivery queues, handoffs, and fulfillment status.',
    ),
  },
  {
    path: '/admin-2/orders/reviews',
    label: 'Reviews',
    title: 'Reviews',
    icon: ReceiptText,
    component: createAdmin2Placeholder(
      'Reviews',
      'A future workspace for customer order reviews and post-purchase feedback.',
    ),
  },
  {
    path: '/admin-2/orders/analytics',
    label: 'Analytics',
    title: 'Order Analytics',
    icon: BarChart3,
    component: createAdmin2Placeholder(
      'Order Analytics',
      'A future workspace for order conversion, revenue, and fulfillment analytics.',
    ),
  },
  {
    path: '/admin-2/products',
    label: 'Products',
    title: 'Products',
    icon: Package,
    component: createAdmin2Placeholder(
      'Products',
      'A future workspace for managing the catalog, inventory, pricing, and product availability.',
    ),
  },
  {
    path: '/admin-2/products/categories',
    label: 'Categories',
    title: 'Categories',
    icon: Package,
    component: createAdmin2Placeholder(
      'Categories',
      'A future workspace for organizing product collections and category pages.',
    ),
  },
  {
    path: '/admin-2/products/bundles',
    label: 'Bundles',
    title: 'Bundles',
    icon: Package,
    component: createAdmin2Placeholder(
      'Bundles',
      'A future workspace for grouped products, bundle pricing, and package offers.',
    ),
  },
  {
    path: '/admin-2/bookings',
    label: 'Bookings',
    title: 'Bookings',
    icon: CalendarDays,
    component: createAdmin2Placeholder(
      'Bookings',
      'A future workspace for booking requests, appointments, and availability.',
    ),
  },
  {
    path: '/admin-2/bookings/forms',
    label: 'Booking Forms',
    title: 'Booking Forms',
    icon: CalendarDays,
    component: createAdmin2Placeholder(
      'Booking Forms',
      'A future workspace for configuring intake forms and booking questions.',
    ),
  },
  {
    path: '/admin-2/bookings/timeline',
    label: 'Timeline',
    title: 'Timeline',
    icon: CalendarDays,
    component: createAdmin2Placeholder(
      'Timeline',
      'A future workspace for viewing bookings across a calendar-style schedule.',
    ),
  },
  {
    path: '/admin-2/bookings/analytics',
    label: 'Analytics',
    title: 'Booking Analytics',
    icon: BarChart3,
    component: createAdmin2Placeholder(
      'Booking Analytics',
      'A future workspace for booking volume, utilization, and service performance analytics.',
    ),
  },
  {
    path: '/admin-2/marketing/share',
    label: 'Share',
    title: 'Share',
    icon: Megaphone,
    component: createAdmin2Placeholder(
      'Share',
      'A future workspace for social links, campaign sharing, and promotional assets.',
    ),
  },
  {
    path: '/admin-2/marketing/discounts',
    label: 'Discounts',
    title: 'Discounts',
    icon: Tag,
    component: createAdmin2Placeholder(
      'Discounts',
      'A future workspace for promotions, discount codes, and campaign rules.',
    ),
  },
  {
    path: '/admin-2/marketing/email',
    label: 'Email Marketing',
    title: 'Email Marketing',
    icon: Mail,
    component: createAdmin2Placeholder(
      'Email Marketing',
      'A future workspace for newsletters, automations, and customer campaigns.',
    ),
  },
  {
    path: '/admin-2/marketing/customers',
    label: 'Customers',
    title: 'Customers',
    icon: Users,
    component: Admin2CustomersPage,
  },
  {
    path: '/admin-2/marketing/loyalty',
    label: 'Loyalty',
    title: 'Loyalty',
    icon: Megaphone,
    component: createAdmin2Placeholder(
      'Loyalty',
      'A future workspace for rewards, retention programs, and member benefits.',
    ),
  },
  {
    path: '/admin-2/analytics',
    label: 'Analytics',
    title: 'Analytics',
    icon: BarChart3,
    component: createAdmin2Placeholder(
      'Analytics',
      'A future workspace for sales trends, product performance, and customer insights.',
    ),
  },
  {
    path: '/admin-2/settings',
    label: 'Settings',
    title: 'Settings',
    icon: Settings,
    component: createAdmin2Placeholder(
      'Settings',
      'A future workspace for store preferences, payments, shipping, and account settings.',
    ),
  },
  {
    path: '/admin-2/settings/payments',
    label: 'Payments',
    title: 'Payments',
    icon: Settings,
    component: createAdmin2Placeholder(
      'Payments',
      'A future workspace for payment methods, payouts, taxes, and checkout rules.',
    ),
  },
  {
    path: '/admin-2/settings/website',
    label: 'Website',
    title: 'Website',
    icon: Settings,
    component: createAdmin2Placeholder(
      'Website',
      'A future workspace for storefront pages, domains, theme settings, and SEO.',
    ),
  },
  {
    path: '/admin-2/settings/store',
    label: 'Store',
    title: 'Store',
    icon: Settings,
    component: createAdmin2Placeholder(
      'Store',
      'A future workspace for store details, locations, policies, and operating preferences.',
    ),
  },
  {
    path: '/admin-2/settings/team',
    label: 'Team',
    title: 'Team',
    icon: Settings,
    component: createAdmin2Placeholder(
      'Team',
      'A future workspace for team members, roles, and access permissions.',
    ),
  },
  {
    path: '/admin-2/settings/billing',
    label: 'Billing',
    title: 'Billing',
    icon: Settings,
    component: createAdmin2Placeholder(
      'Billing',
      'A future workspace for plans, invoices, and subscription details.',
    ),
  },
  {
    path: '/admin-2/apps',
    label: 'All Apps',
    title: 'Apps',
    icon: LayoutGrid,
    component: Admin2AppsPage,
  },
  {
    path: '/admin-2/apps/online-store',
    label: 'Online Store',
    title: 'Online Store',
    icon: Globe,
    component: createAdmin2Placeholder(
      'Online Store',
      'A future workspace for configuring the online storefront app.',
    ),
  },
  {
    path: '/admin-2/apps/online-store/fulfillment',
    label: 'Fulfillment',
    title: 'Fulfillment',
    icon: Globe,
    component: createAdmin2Placeholder(
      'Fulfillment',
      'A future workspace for online store fulfillment rules, routing, and status.',
    ),
  },
  {
    path: '/admin-2/apps/online-store/inventory-calendar',
    label: 'Inventory Calendar',
    title: 'Inventory Calendar',
    icon: CalendarDays,
    component: createAdmin2Placeholder(
      'Inventory Calendar',
      'A future workspace for planning inventory availability across upcoming dates.',
    ),
  },
  {
    path: '/admin-2/apps/online-store/checkouts',
    label: 'Checkouts',
    title: 'Checkouts',
    icon: ReceiptText,
    component: createAdmin2Placeholder(
      'Checkouts',
      'A future workspace for configuring checkout settings, fields, and conversion flows.',
    ),
  },
  {
    path: '/admin-2/apps/online-store/website',
    label: 'Website',
    title: 'Website',
    icon: Globe,
    component: createAdmin2Placeholder(
      'Website',
      'A future workspace for online store pages, theme settings, domains, and SEO.',
    ),
  },
  {
    path: '/admin-2/apps/pos',
    label: 'POS',
    title: 'POS',
    icon: Monitor,
    component: createAdmin2Placeholder(
      'POS',
      'A future workspace for configuring point-of-sale tools and workflows.',
    ),
  },
]

export function getAdmin2Route(pathname: string) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/admin-2'
  return admin2Routes.find((route) => route.path === normalizedPath)
}
