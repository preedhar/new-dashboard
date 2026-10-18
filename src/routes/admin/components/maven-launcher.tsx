import mavenLogo from '@/assets/admin/maven-logo.svg'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { MAVEN_UNREAD_COUNT, useMavenPanel } from './maven-panel'

type MavenLauncherProps = {
  // On a phone the launcher floats above the bottom nav where there is one,
  // and sits at the bottom edge where there isn't.
  aboveBottomNav: boolean
}

// A floating pill at the bottom centre of the content column that opens the
// Maven chat from any page: the panel on desktop, the chat page on a phone.
// It goes away while the panel is open, since the chat is already on screen.
export function MavenLauncher({ aboveBottomNav }: MavenLauncherProps) {
  const isMobile = useIsMobile()
  const { open, openPanel } = useMavenPanel()

  // Hidden rather than unmounted on desktop while the panel is open: it goes
  // at once when the panel opens, and slides up from the bottom once the
  // panel has finished closing (the delay matches the panel's slide). Only
  // the showing side transitions, so the hidden state carries no duration.
  const hidden = open && !isMobile

  return (
    // Sticky rather than fixed so it centres on the content column, which the
    // sidebar and the Maven panel both narrow, instead of on the screen.
    <div
      className={cn(
        'pointer-events-none sticky z-20 mx-auto flex w-fit shrink-0 pb-3 md:bottom-0 md:pb-6',
        // The nav is 64px plus its top border and the phone's home-indicator
        // inset, so the launcher clears all three.
        aboveBottomNav ? 'bottom-[calc(4rem+1px+env(safe-area-inset-bottom))]' : 'bottom-0',
      )}
    >
      <a
        href="/admin/maven"
        aria-hidden={hidden}
        tabIndex={hidden ? -1 : undefined}
        onClick={(event) => {
          if (!isMobile) {
            event.preventDefault()
            openPanel()
          }
        }}
        className={cn(
          'group rounded-md outline-none',
          hidden
            ? 'pointer-events-none translate-y-4 opacity-0'
            : 'pointer-events-auto transition-[opacity,translate] delay-300 duration-300 ease-out',
        )}
      >
        <span className="flex h-10 items-center gap-2.5 maven-border rounded-md border bg-background pr-2.5 pl-3 text-sm font-medium text-muted-foreground shadow-xs transition-shadow group-hover:shadow-sm group-focus-visible:ring-3 group-focus-visible:ring-ring/50">
          <img src={mavenLogo} alt="" className="size-5 shrink-0" />
          <span className="pr-1">Run Meta ads on autopilot</span>
          {MAVEN_UNREAD_COUNT > 0 ? (
            <span
              aria-label={`${MAVEN_UNREAD_COUNT} unread messages`}
              className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white"
            >
              {MAVEN_UNREAD_COUNT}
            </span>
          ) : null}
        </span>
      </a>
    </div>
  )
}
