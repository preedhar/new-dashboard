import badgeImage from '@/assets/admin/badge.png'
import calendarImage from '@/assets/admin/calendar.png'
import cartMoneyImage from '@/assets/admin/cart-money.png'
import domainImage from '@/assets/admin/domain.png'
import emailImage from '@/assets/admin/email.png'
import fansImage from '@/assets/admin/fans.png'
import giftImage from '@/assets/admin/gift.png'
import moneyImage from '@/assets/admin/money.png'
import postImage from '@/assets/admin/post.png'
import qrCodeImage from '@/assets/admin/qr-code.png'

export type PromoTile = {
  id: string
  title: string
  description: string
  // Falls back to the placeholder artwork, so a tile only names an image once it
  // has one of its own.
  image?: string
  // href is left off when there's no page to send the merchant to yet. external
  // marks a link that leaves the dashboard, so it opens in a new tab. paywall is
  // temporary: it puts a placeholder dialog in front of the tile, and takes
  // precedence over href, so dropping the flag hands the tile back to its link.
  action: { label: string; href?: string; external?: boolean; paywall?: boolean }
}

// Every tip / upsell card designed for the dashboard home page, in the order the
// /admin/home-cards gallery lists them. Add a card here to put it in the
// gallery; it only reaches home once its id is in HOME_TILE_IDS below.
export const ALL_PROMO_TILES: PromoTile[] = [
  {
    id: 'custom-domain',
    title: 'Get your own branded domain name',
    description:
      'Position your store as a trusted business by getting a domain name like coffeebrewers.com',
    image: domainImage,
    action: { label: 'Get custom domain', href: '/admin/settings/website/custom-domain' },
  },
  {
    id: 'abandoned-checkout-discount',
    title: 'Turn abandoned carts into orders',
    description:
      'A discount in your recovery emails gives shoppers the nudge they need to come back and checkout',
    image: cartMoneyImage,
    action: { label: 'Add a recovery discount', href: '/admin/apps/online-store/checkouts' },
  },
  {
    id: 'tip-verified-badge',
    title: 'Get a verified badge for your online store',
    description:
      'Take 10 orders with automated payments to show a verified badge that customers trust',
    image: badgeImage,
    action: { label: 'Set up payments', href: '/admin/settings/payments' },
  },
  {
    id: 'upsell-annual',
    title: 'Get 2 months free',
    description:
      'Switch to annual billing to get 2 months of your Cococart subscription completely free',
    image: giftImage,
    action: { label: 'Switch to annual billing', href: '/admin/settings/billing' },
  },
  {
    id: 'maven',
    title: 'Get Maven to do your social media marketing',
    description: 'Maven plans your strategy and makes your content around the clock',
    image: postImage,
    action: { label: 'Try Maven for Free', href: 'https://magicposts.com', external: true },
  },
  {
    id: 'online-store-pro',
    title: 'Turn more visitors into buyers',
    description:
      'A professional theme earns the first look, reviews build the trust, and checkout recovery that automatically converts abandoned carts',
    image: moneyImage,
    action: { label: 'Get Online Store Pro', paywall: true },
  },
  {
    id: 'email-marketing',
    title: 'Get more orders from past customers',
    description:
      'It is 10x easier to bring back a customer than finding a new one. Just keep informing them about new products & offers',
    image: emailImage,
    action: { label: 'Create an email', href: '/admin/marketing/email' },
  },
  {
    id: 'loyalty-program',
    title: 'Turn buyers into repeat customers',
    description:
      'Award points on every order so customers keep ordering to collect more for rewards',
    image: fansImage,
    action: { label: 'Enable Loyalty Program', href: '/admin/marketing/loyalty' },
  },
  {
    id: 'bookings',
    title: 'Take bookings',
    description:
      'Let customers reserve a table, a class, or an event straight from your website',
    image: calendarImage,
    action: { label: 'Set up bookings', href: '/admin/bookings/all' },
  },
  {
    id: 'qr-code-ordering',
    title: 'Reduce staff costs at your store',
    description: 'Let customers scan a QR code at their table to place their orders',
    image: qrCodeImage,
    action: {
      label: 'Get QR Code Ordering',
      href: '/admin/apps/qr-code/checkouts',
      paywall: true,
    },
  },
]

// The cards live on home today. The annual-billing upsell used to lead the row,
// but a second setup guide has taken its cell, so only the verified badge tip
// is left here. The upsell itself stays in the gallery above.
const HOME_TILE_IDS = ['tip-verified-badge']

// Ordered by HOME_TILE_IDS rather than by the catalogue above, so home keeps its
// own running order as cards are added to or reordered in the gallery.
export const PROMO_TILES: PromoTile[] = HOME_TILE_IDS.flatMap((id) =>
  ALL_PROMO_TILES.filter((tile) => tile.id === id),
)
