import moneyImage from '@/assets/admin/money.png'

import { cn } from '@/lib/utils'

// The referral card is kept around but hidden for now. Flip this to true to
// bring it back in both places it appears: the desktop sidebar footer, above the
// user menu, and the top of the mobile Settings page.
export const SHOW_REFERRAL_CARD: boolean = false

// The referral promo. It reuses the artwork from the "Turn more visitors into
// buyers" home card, laid out as a row — art on the left, title beside it — so
// it stays short wherever it appears. It sits at the bottom of the desktop
// sidebar, just above the user menu; on mobile, where there is no sidebar, the
// Settings hub carries it instead.
export function ReferralCard({ className }: { className?: string }) {
  return (
    <a
      href="/admin/referrals"
      className={cn(
        'group flex items-center gap-3 rounded-lg border border-border bg-background px-2 py-1 text-sm font-medium text-foreground outline-hidden transition-colors md:h-12 md:gap-2',
        'hover:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_6%)] focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      {/* The file is @2x, so it draws at half its pixel size: 40px on the
          mobile card, 32px in the narrower sidebar. */}
      <img src={moneyImage} alt="" aria-hidden="true" className="w-10 shrink-0 md:w-8" />
      {/* The mobile card runs the full width of the page, so the title centres
          in it rather than trailing off the art. It sits beside the art in the
          sidebar, where the card is only as wide as the nav. */}
      <span className="flex-1 text-center leading-5 md:flex-none md:text-left">
        Refer &amp; Earn $500
      </span>
      {/* Balances the art so the title centres on the card itself, not on the
          space left over beside it. */}
      <span aria-hidden="true" className="w-10 shrink-0 md:hidden" />
    </a>
  )
}
