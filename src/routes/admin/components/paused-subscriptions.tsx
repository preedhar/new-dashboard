/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'

// Which app subscriptions are pausing, by plan title. It's held above the
// pages because two of them care: billing, where a plan is paused and its row
// says so, and the shell, which carries the banner on every other page.
//
// Every link in the dashboard is a plain anchor, so moving between pages
// reloads the app and takes React's state with it. Session storage is what
// carries the pause across that gap — and only for the tab it was made in, so
// a new one opens on a shop that isn't paused.
const STORAGE_KEY = 'cococart.paused-plans'

// The pause offer is built but switched off: no reason to pause is listed in
// the cancel survey, so nothing can reach it. Flip this to true to put the
// reason back and let the banner, the paused rows and the Resume button
// follow. Off, it also ignores anything a session left in storage.
export const PAUSE_ENABLED: boolean = false

function readStoredPlans() {
  try {
    const stored: unknown = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? 'null')
    return Array.isArray(stored) ? stored.filter((plan) => typeof plan === 'string') : []
  } catch {
    // Unreadable or unavailable storage (private browsing, a stale value)
    // just means nothing is paused.
    return []
  }
}

type PausedSubscriptionsValue = {
  pausedPlans: string[]
  pausePlan: (title: string) => void
  resumePlan: (title: string) => void
}

const PausedSubscriptionsContext =
  React.createContext<PausedSubscriptionsValue | null>(null)

export function PausedSubscriptionsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [pausedPlans, setPausedPlans] = React.useState(() =>
    PAUSE_ENABLED ? readStoredPlans() : [],
  )

  React.useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pausedPlans))
    } catch {
      // Storage being unavailable costs the pause its memory on the next
      // page, which is a better outcome than the dashboard not loading.
    }
  }, [pausedPlans])

  const pausePlan = React.useCallback((title: string) => {
    // Pausing the same plan twice would otherwise list it twice.
    setPausedPlans((paused) =>
      paused.includes(title) ? paused : [...paused, title],
    )
  }, [])

  const resumePlan = React.useCallback((title: string) => {
    setPausedPlans((paused) => paused.filter((plan) => plan !== title))
  }, [])

  const value = React.useMemo(
    () => ({ pausedPlans, pausePlan, resumePlan }),
    [pausedPlans, pausePlan, resumePlan],
  )

  return (
    <PausedSubscriptionsContext.Provider value={value}>
      {children}
    </PausedSubscriptionsContext.Provider>
  )
}

// Nothing is paused outside the provider, and nothing can be — a page rendered
// on its own simply has no banner to show.
const NONE_PAUSED: PausedSubscriptionsValue = {
  pausedPlans: [],
  pausePlan: () => {},
  resumePlan: () => {},
}

export function usePausedSubscriptions() {
  return React.useContext(PausedSubscriptionsContext) ?? NONE_PAUSED
}
