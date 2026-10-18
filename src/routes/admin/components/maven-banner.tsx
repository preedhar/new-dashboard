import mavenLogo from '@/assets/admin/maven-logo.svg'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { useMavenPanel } from './maven-panel'

type MavenBannerProps = {
  className?: string
}

// A one-line pitch for Maven that a page can slot in under its header: the
// logo, a sentence on what it does, and a Try button that opens the chat
// (the panel on desktop, the chat page on a phone).
export function MavenBanner({ className }: MavenBannerProps) {
  const isMobile = useIsMobile()
  const { openPanel } = useMavenPanel()

  return (
    <aside
      aria-label="Maven"
      className={cn(
        'flex items-start gap-3 rounded-xl border border-border bg-neutral-50 px-4 py-3 sm:items-center sm:gap-4 sm:px-5',
        className,
      )}
    >
      <img src={mavenLogo} alt="" className="size-9 shrink-0 sm:size-10" />
      {/* Text and button stack on a phone and sit on one line from sm up. */}
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Run your Meta ads on autopilot with Maven</p>
          <p className="text-sm text-muted-foreground">
            Facebook and Instagram ads, built and tuned for you. You approve every step.
          </p>
        </div>
        <Button asChild variant="outline" size="lg" className="maven-border w-fit shrink-0 border-transparent">
          <a
            href="/admin/maven"
            onClick={(event) => {
              if (!isMobile) {
                event.preventDefault()
                openPanel()
              }
            }}
          >
            Try for free
          </a>
        </Button>
      </div>
    </aside>
  )
}
