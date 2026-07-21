import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

// A sub-page of the Website settings, reached from the Styling → Appearance
// card. Provides its own header with a back button to the Website page.
export function AdminSettingsWebsiteAppearancePage() {
  return (
    <div className="w-full">
      <header className="relative mb-8 flex items-center justify-center">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label="Go back"
          onClick={() => window.history.back()}
          className="absolute left-0"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-normal text-neutral-900">
          Appearance
        </h1>
      </header>

      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8">
        <p className="text-sm text-muted-foreground">
          Customize your storefront&apos;s theme, colors, and layout.
        </p>
      </div>
    </div>
  )
}
