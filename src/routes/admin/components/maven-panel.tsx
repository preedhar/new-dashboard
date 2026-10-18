/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'

import { cn } from '@/lib/utils'
import { MavenChat } from './maven-chat'

// On desktop the Maven chat opens beside the main content, as a second card the
// same shape as the content card. The state lives up in the admin shell so the
// home tile can open it and the shell can render it next to the content.
//
// Every link in the dashboard is a plain anchor, so moving between pages
// reloads the app. Session storage carries the open panel across that gap, so
// it stays beside the content wherever the merchant goes until they close it;
// a new tab starts with it closed.
const STORAGE_KEY = 'cococart.maven-panel-open'

function readStoredOpen() {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    // Unreadable or unavailable storage just means the panel starts closed.
    return false
  }
}

type MavenPanelValue = {
  open: boolean
  openPanel: () => void
  closePanel: () => void
}

const MavenPanelContext = React.createContext<MavenPanelValue | null>(null)

export function MavenPanelProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(readStoredOpen)

  React.useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, String(open))
    } catch {
      // Storage being unavailable costs the panel its memory on the next
      // page, which is a better outcome than the dashboard not loading.
    }
  }, [open])

  const value = React.useMemo(
    () => ({
      open,
      openPanel: () => setOpen(true),
      closePanel: () => setOpen(false),
    }),
    [open],
  )

  return <MavenPanelContext.Provider value={value}>{children}</MavenPanelContext.Provider>
}

// Outside the provider (the card galleries render the tile too, but inside the
// shell) opening is a no-op, so a tile never throws for want of a panel.
const NO_PANEL: MavenPanelValue = {
  open: false,
  openPanel: () => {},
  closePanel: () => {},
}

export function useMavenPanel() {
  return React.useContext(MavenPanelContext) ?? NO_PANEL
}

export const MAVEN_PANEL_WIDTH_PX = 400

// Messages waiting in the chat. A fixed number for the prototype, shared by
// the home card and the floating launcher so the two always agree.
export const MAVEN_UNREAD_COUNT = 2

// Desktop only: on a phone the chat is its own page at /admin/maven. The panel
// sticks to the viewport at its full height and scrolls inside, so it stays
// put while the content beside it scrolls. Its margins match the content card's
// (which keeps its own right margin as the gap between the two).
//
// It stays mounted while closed, at zero width, so opening and closing slide it
// in and out and the content column reflows with it. The chat keeps its own
// fixed width inside, so the text doesn't reflow mid-slide, and the chat state
// (draft and all) survives a close. A page that loads with the panel open
// renders it open outright, since nothing changes for the transition to run.
export function MavenPanel() {
  const { open, closePanel } = useMavenPanel()

  return (
    <aside
      aria-label="Maven chat"
      aria-hidden={!open}
      style={{ width: open ? MAVEN_PANEL_WIDTH_PX : 0 }}
      className={cn(
        'sticky top-2 my-2 hidden h-[calc(100svh-1rem)] shrink-0 flex-col overflow-hidden rounded-xl bg-background shadow-sm transition-[width,margin,visibility] duration-300 ease-in-out md:flex',
        // Hidden, not just empty, once closed: a zero-width box would still
        // cast its shadow as a hairline, and its controls would still take
        // focus. Visibility switches at the end of the close and the start of
        // the open, so it never cuts the slide short.
        open ? 'mr-2' : 'invisible mr-0',
      )}
    >
      <div style={{ width: MAVEN_PANEL_WIDTH_PX }} className="flex h-full shrink-0 flex-col">
        <MavenChat onClose={closePanel} />
      </div>
    </aside>
  )
}
