import * as React from 'react'
import { Check, ChevronDown, ChevronRight, EyeOff, MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TypographyLarge, TypographyMuted } from '@/components/ui/typography'
import { SETUP_APPS, getProgressValue, type SetupApp } from '../setup-apps'
import { cn } from '@/lib/utils'

type SetupChecklistCardProps = {
  // Takes the card off the page. Every card carries the menu it's hidden from,
  // so a card that is brought back on a reload — the gallery's are — still
  // hands over the same options its home page copy has.
  onHide: () => void
  // Pins the card to one app's tasks. The picker only appears on a card that is
  // free to move between apps.
  app?: SetupApp
  // What the picker offers, when there is one. Defaults to every app in the
  // state a merchant starts in; the gallery hands it a finished set to show
  // the same card once the work is done.
  apps?: SetupApp[]
}

export function SetupChecklistCard({
  onHide,
  app: pinnedApp,
  apps = SETUP_APPS,
}: SetupChecklistCardProps) {
  const [activeAppId, setActiveAppId] = React.useState(apps[0].id)
  const activeApp = pinnedApp ?? apps.find((app) => app.id === activeAppId) ?? apps[0]
  const progressValue = getProgressValue(activeApp)
  // Nothing left to finish, so the card turns into the send-off below rather
  // than a list of struck-through rows under a full ring.
  const setupComplete = progressValue === 100
  // A card pinned to a finished app has the send-off's heading and nothing left
  // to finish, so it keeps neither the title nor the picker — with only the menu
  // left, the heading row would be a band of empty space that pushed the send-off
  // off centre, so the row goes and the menu is pinned to the corner instead. The
  // picker card keeps its heading whatever state the app it points at is in.
  const headerVisible = !setupComplete || !pinnedApp

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-neutral-50">
      {/* Out of the flow the button has no padding to hang into, so it drops the
          pull that does that and sets the same 8px inset directly. */}
      {headerVisible ? null : (
        <SetupOptionsMenu
          onHide={onHide}
          className="absolute top-4 right-2 z-10 mr-0 sm:top-6 sm:right-4 xl:top-8 xl:right-6"
        />
      )}

      {/* The list sits closer to the heading than to the card's outer edges. */}
      {headerVisible ? (
        <div className="flex flex-col gap-2 p-4 pb-2 sm:p-6 sm:pb-3 xl:p-8 xl:pb-4">
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {/* Same type scale as the app names on the Apps page. */}
              <TypographyLarge className="min-w-0 text-base sm:text-lg">
                Finish setup
              </TypographyLarge>
              {/* A pinned card has no app row to carry its progress, so the ring
                  follows the title instead. */}
              {pinnedApp ? (
                <ProgressRing
                  value={progressValue}
                  label={`${activeApp.name} is ${progressValue}% complete`}
                />
              ) : null}
            </div>
            <SetupOptionsMenu onHide={onHide} />
          </div>

          {/* The app being set up sits on its own row below the card title, and
              picking another one from the menu swaps the task list below. Each
              choice carries its own ring, so the menu doubles as a progress
              summary across the apps. The trigger spans the card so the menu,
              which takes the trigger's width, lists the apps across the same
              span. A card pinned to one app has nothing to pick, so it goes
              without the row. */}
          {pinnedApp ? null : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full justify-start gap-3 text-sm font-medium md:text-base"
                >
                  <img src={activeApp.icon} alt="" className="size-6 shrink-0" />
                  {activeApp.name}
                  <ProgressRing
                    className="ml-auto"
                    value={progressValue}
                    label={`${activeApp.name} is ${progressValue}% complete`}
                  />
                  <ChevronDown aria-hidden="true" className="size-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {apps.map((app) => {
                  const appProgressValue = getProgressValue(app)

                  return (
                    <DropdownMenuItem
                      key={app.id}
                      onSelect={() => setActiveAppId(app.id)}
                      className="gap-3"
                    >
                      <img src={app.icon} alt="" className="size-6 shrink-0" />
                      {app.name}
                      <ProgressRing
                        className="ml-auto"
                        value={appProgressValue}
                        label={`${app.name} is ${appProgressValue}% complete`}
                      />
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ) : null}

      {/* Nothing left to tick off, so the list gives way to the app's mark and
          the one thing left to do with it. The send-off takes whatever height a
          heading leaves — the whole card, where there is none — and centres in
          it, since a finished card sits in a row beside cards carrying a full
          list. */}
      {setupComplete ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center sm:p-6 xl:p-8">
          {/* The artwork stands on its own here, unframed, at the size the
              Apps page draws an app's mark inside its tile. */}
          <img src={activeApp.icon} alt="" className="size-8 shrink-0 sm:size-10" />
          <div className="flex min-w-0 flex-col gap-1">
            <TypographyLarge className="text-base sm:text-lg">
              Your {activeApp.name} is all set up!
            </TypographyLarge>
            <TypographyMuted className="leading-6">
              {activeApp.completedDescription}
            </TypographyMuted>
          </div>
          {/* There's nothing left for the guide to do, so acknowledging it puts
              the card away — the same thing the menu's hide does. */}
          <Button type="button" variant="outline" size="lg" className="mt-1" onClick={onHide}>
            <Check aria-hidden="true" />
            Done
          </Button>
        </div>
      ) : (
        /* Every step is listed, and each title is the link to its task. The rows
           are pulled out to the card's padding edge so their hover fill reads as
           a full-width band rather than a floating pill. Nothing is set aside on
           the left for a mark, since a finished task carries its mark on the
           right instead. */
        <ul className="flex flex-1 flex-col px-2 pb-2 sm:px-4 sm:pb-3 xl:px-6 xl:pb-4">
          {activeApp.steps.map((step) => {
            const completed = Boolean(step.completed)

            return (
              <li key={step.id} className="border-b border-border/40 last:border-b-0">
                <a
                  href={step.action.href}
                  {...(step.action.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className="flex items-center gap-3 rounded-md px-2 py-2.5 outline-none transition-colors hover:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_6%)] focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    className={cn(
                      'min-w-0 flex-1 text-sm md:text-base',
                      completed ? 'text-success-foreground line-through' : 'text-foreground',
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="sr-only">{completed ? 'Completed' : 'Not started'}</span>
                  {/* A finished task has nowhere left to go, so its trailing
                      chevron gives way to the mark that says it's done. */}
                  {completed ? (
                    <Check aria-hidden="true" className="size-4 shrink-0 text-success-foreground" />
                  ) : (
                    <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                  )}
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

type SetupOptionsMenuProps = {
  onHide: () => void
  className?: string
}

// The card's own menu. It's one item today, but it's how a guide is put away,
// so every card carries it whether or not it still has tasks left.
function SetupOptionsMenu({ onHide, className }: SetupOptionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* The button is wider than its icon, so it hangs 8px into the card's
            padding to put that icon on the same line as the task rows' trailing
            icons. */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn('-mr-2 shrink-0', className)}
          aria-label="Setup guide options"
        >
          <MoreHorizontal aria-hidden="true" className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      {/* The menu would otherwise take the width of its trigger, which is an
          icon button, and wrap the item onto a second line. */}
      <DropdownMenuContent align="end" className="w-auto">
        <DropdownMenuItem onSelect={onHide}>
          <EyeOff />
          Hide setup guide
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type ProgressRingProps = {
  value: number
  label: string
  className?: string
}

// A compact stand-in for the linear progress bar: the arc is drawn with a dash
// gap so it starts at twelve o'clock and sweeps clockwise.
function ProgressRing({ value, label, className }: ProgressRingProps) {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const filled = (Math.min(Math.max(value, 0), 100) / 100) * circumference

  return (
    <svg
      aria-label={label}
      className={cn('size-4 shrink-0 -rotate-90', className)}
      role="img"
      viewBox="0 0 48 48"
    >
      <circle className="stroke-muted" cx="24" cy="24" fill="none" r={radius} strokeWidth="6" />
      <circle
        className="stroke-primary transition-[stroke-dasharray]"
        cx="24"
        cy="24"
        fill="none"
        r={radius}
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeLinecap="round"
        strokeWidth="6"
      />
    </svg>
  )
}
