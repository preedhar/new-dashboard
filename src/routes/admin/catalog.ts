import globeIcon from '@/assets/channels/globe.png'
import monitorIcon from '@/assets/channels/monitor.png'
import qrIcon from '@/assets/channels/qr.png'

// Catalog values shared by the Products page, the product form and the
// discount form.

// The merchant's free Cococart subdomain, the base for every storefront link.
export const STORE_DOMAIN = 'haus.cococart.co'

// Turn a name into a URL-friendly slug for the storefront path.
export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// The sales channels a product can be put on.
export type Channel = 'online-store' | 'pos' | 'qr'

export const CHANNELS: { value: Channel; label: string; icon: string }[] = [
  { value: 'online-store', label: 'Online Store', icon: globeIcon },
  { value: 'pos', label: 'POS', icon: monitorIcon },
  { value: 'qr', label: 'QR Code', icon: qrIcon },
]

// There's no real catalog behind these screens yet, so the pickers offer a
// sample set. The product form's categories field also lets anything else be
// typed in and created.
export const CATEGORY_OPTIONS = ['Hot Drinks', 'Cold Drinks', 'Pastries', 'Mains']

// The stand-in products: what a bundle can be built out of and what a discount
// can be limited to. Mirrors the order page's product picker.
export const PRODUCT_OPTIONS = [
  'Americano, Iced',
  'Butter Croissant',
  'Caesar Salad',
  'Cappuccino',
  'Oat Milk Latte',
  'Pad Thai',
]
