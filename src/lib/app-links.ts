// Where the POS app lives on each store, and the public link that sends a
// scanned device to the right one.

// The public path a QR code encodes. Visiting it redirects to the store for the
// scanning device — see AppRedirectPage.
export const APP_LINK_PATH = '/app'

export const APP_STORE_URL =
  'https://apps.apple.com/us/app/cococart-point-of-sale-pos/id6456404292'
export const GOOGLE_PLAY_URL =
  'https://play.google.com/store/apps/details?id=co.cococart.pos'

// The store to send the current device to, or null when it isn't a phone or
// tablet (a desktop visitor is shown both links instead).
//
// One App Store listing covers iPhone and iPad, so they don't need telling
// apart. They do need telling apart from a Mac: since iPadOS 13 an iPad reports
// a Macintosh user agent by default, and its touch points are what give it away.
export function storeUrlForDevice(): string | null {
  const ua = navigator.userAgent

  if (/Android/i.test(ua)) {
    return GOOGLE_PLAY_URL
  }
  if (/iPhone|iPad|iPod/i.test(ua)) {
    return APP_STORE_URL
  }
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) {
    return APP_STORE_URL
  }
  return null
}
