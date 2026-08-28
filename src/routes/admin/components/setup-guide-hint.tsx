/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

// Hiding a setup guide takes it off the page, so the hint points at the menu it
// can be brought back from. It stays up long enough to read, then goes away on
// its own.
const HINT_DURATION_MS = 5000
const HINT_TEXT = 'You can find the setup guide here later'

type SetupGuideHintValue = {
  hintVisible: boolean
  showHint: () => void
}

const SetupGuideHintContext = React.createContext<SetupGuideHintValue | null>(null)

export function SetupGuideHintProvider({ children }: { children: React.ReactNode }) {
  const [hintVisible, setHintVisible] = React.useState(false)
  const timeoutRef = React.useRef(0)

  const showHint = React.useCallback(() => {
    setHintVisible(true)
    // Hiding a second guide restarts the countdown rather than cutting the
    // hint short partway through.
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => setHintVisible(false), HINT_DURATION_MS)
  }, [])

  React.useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  const value = React.useMemo(() => ({ hintVisible, showHint }), [hintVisible, showHint])

  return <SetupGuideHintContext.Provider value={value}>{children}</SetupGuideHintContext.Provider>
}

// The hint is a nicety, so a card rendered outside the provider simply doesn't
// raise one.
const NO_HINT: SetupGuideHintValue = { hintVisible: false, showHint: () => {} }

export function useSetupGuideHint() {
  return React.useContext(SetupGuideHintContext) ?? NO_HINT
}

type SetupGuideHintTooltipProps = {
  children: React.ReactNode
  side?: React.ComponentProps<typeof TooltipContent>['side']
  // Both user menus are mounted at once, but only one of them is on screen, so
  // each only offers to anchor the hint on its own layout.
  enabled?: boolean
}

// Wraps whichever user menu trigger is on screen, so the hint points at it.
export function SetupGuideHintTooltip({
  children,
  side,
  enabled = true,
}: SetupGuideHintTooltipProps) {
  const { hintVisible } = useSetupGuideHint()

  if (!enabled) {
    return children
  }

  return (
    <Tooltip open={hintVisible}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      {/* Narrow enough to break the sentence over two balanced lines. The
          shared content only animates the hover-opened states, so the entry
          this one opens in — instant-open, since it isn't hover-driven — names
          its own; the side-aware slide classes it inherits then give the
          animation its direction. */}
      <TooltipContent
        side={side}
        sideOffset={8}
        className="max-w-40 text-balance data-[state=instant-open]:animate-in data-[state=instant-open]:fade-in-0 data-[state=instant-open]:zoom-in-95 data-[state=instant-open]:duration-200"
      >
        {HINT_TEXT}
      </TooltipContent>
    </Tooltip>
  )
}
