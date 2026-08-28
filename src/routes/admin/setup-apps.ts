import bookingsIcon from '@/assets/apps/bookings.png'
import onlineStoreIcon from '@/assets/apps/online-store.png'
import qrCodeOrderingIcon from '@/assets/apps/qr-code-ordering.png'

export type SetupStep = {
  id: string
  title: string
  description: string
  completed?: boolean
  // The task's own call to action, shown beside the previous/next arrows.
  action: { label: string; href: string; external?: boolean }
}

// Tasks that show up in more than one app's guide. They're the same task with
// the same state wherever they appear, so every guide points at this one copy.
const SHARED_STEPS = {
  logo: {
    id: 'logo',
    title: 'Add logo',
    description: 'We automatically added it from your Instagram',
    completed: true,
    action: { label: 'Change logo', href: '/admin/settings/website/appearance' },
  },
  customizeWebsite: {
    id: 'customize-website',
    title: 'Customize website',
    description: 'Tell customers what you sell in a line or two',
    action: { label: 'Customize', href: '/admin/settings/website/appearance' },
  },
  addProducts: {
    id: 'add-products',
    title: 'Add products',
    description: 'Create your first items so customers can start ordering',
    action: { label: 'Add products', href: '/admin/products/new' },
  },
  setUpPayments: {
    id: 'set-up-payments',
    title: 'Set up payments',
    description: 'Connect a payment method to accept customer orders',
    action: { label: 'Set up payments', href: '/admin/settings/payments' },
  },
} satisfies Record<string, SetupStep>

export type SetupApp = {
  id: string
  // The app this guide sets up, picked from the card's dropdown.
  name: string
  // The app's mark, the same artwork the Apps page uses.
  icon: string
  // What to do once every task is done, shown on the finished card in place of
  // the list. Each app is launched a different way, so the line is its own.
  completedDescription: string
  steps: SetupStep[]
}

// Both of these apps go live on the store's website, so getting the word out is
// the same next step for either one.
const SHARE_WEBSITE_DESCRIPTION =
  'Share your website URL on Instagram, Facebook, and Whatsapp'

export const SETUP_APPS: SetupApp[] = [
  {
    id: 'online-store',
    name: 'Online Store',
    icon: onlineStoreIcon,
    completedDescription: SHARE_WEBSITE_DESCRIPTION,
    steps: [
      SHARED_STEPS.logo,
      SHARED_STEPS.customizeWebsite,
      SHARED_STEPS.addProducts,
      {
        id: 'set-up-fulfillment',
        title: 'Set up fulfillment methods',
        description: 'Choose pickup, delivery, or shipping options for your store',
        action: { label: 'Set up fulfillment', href: '/admin/apps/online-store/fulfillment' },
      },
      SHARED_STEPS.setUpPayments,
      {
        id: 'test-order',
        title: 'Place a test order',
        description: 'Place an order yourself to check the whole flow works',
        action: { label: 'Make a test order', href: '/admin/orders/new' },
      },
    ],
  },
  {
    id: 'qr-code-ordering',
    name: 'QR Code Ordering',
    icon: qrCodeOrderingIcon,
    completedDescription:
      'Download and print the QR codes to place them in your physical store',
    steps: [
      SHARED_STEPS.logo,
      SHARED_STEPS.addProducts,
      SHARED_STEPS.setUpPayments,
      {
        id: 'download-qr-codes',
        title: 'Download QR codes',
        description: 'Print them for your tables so customers can scan to order',
        action: { label: 'Download QR codes', href: '/admin/apps' },
      },
      {
        id: 'enable-qr-orders',
        title: 'Enable orders',
        description: 'Turn on scan-to-order checkouts for your store',
        action: { label: 'Enable orders', href: '/admin/apps/qr-code/checkouts' },
      },
      {
        id: 'qr-test-order',
        title: 'Place a test order',
        description: 'Scan a code yourself to check the whole flow works',
        action: { label: 'Make a test order', href: '/admin/orders/new' },
      },
    ],
  },
  {
    id: 'bookings',
    name: 'Bookings',
    icon: bookingsIcon,
    completedDescription: SHARE_WEBSITE_DESCRIPTION,
    steps: [
      SHARED_STEPS.logo,
      SHARED_STEPS.customizeWebsite,
      {
        id: 'add-booking-forms',
        title: 'Add booking forms',
        description: 'Set up the forms customers fill in to book with you',
        action: { label: 'Add booking forms', href: '/admin/bookings/forms' },
      },
      SHARED_STEPS.setUpPayments,
      {
        id: 'test-booking',
        title: 'Take a test booking',
        description: 'Book yourself in to check the whole flow works',
        action: { label: 'Make a test booking', href: '/admin/bookings/all' },
      },
    ],
  },
]

// The same guide with every task ticked off, for showing what a finished setup
// looks like. The card has no separate done design — it's the same list, fully
// struck through, with the ring closed.
export function completeSetupApp(app: SetupApp): SetupApp {
  return { ...app, steps: app.steps.map((step) => ({ ...step, completed: true })) }
}

// The share of an app's tasks that are done, as a whole percentage.
export function getProgressValue(app: SetupApp) {
  const completedStepCount = app.steps.filter((step) => step.completed).length
  return Math.round((completedStepCount / app.steps.length) * 100)
}
