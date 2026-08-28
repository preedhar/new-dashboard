import { useCallback, useEffect, useState } from 'react'

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim())
}

// There is no backend behind the prototype, so one fixed code stands in for a
// real one. It keeps both the success and the "wrong code" state reachable.
export const DEMO_LOGIN_CODE = '123456'

export const MIN_PASSWORD_LENGTH = 8

// The auth screens run larger than the rest of the app, and the shared Button /
// Input scales have no step at this height (they jump from 40px straight to the
// 56px signup treatment). Every control on these screens takes its height from
// here, so resizing them all is a one-line change.
const AUTH_CONTROL_HEIGHT = 'h-12'

// Buttons and input groups bring their own horizontal padding; a bare Input
// needs it spelled out to stay in proportion at this height.
export const AUTH_CONTROL_CLASS = AUTH_CONTROL_HEIGHT
export const AUTH_INPUT_CLASS = `${AUTH_CONTROL_HEIGHT} px-3`

// 8px between a field's label row and its control, tighter than Field's own
// 12px default.
export const AUTH_FIELD_CLASS = 'gap-2'

// Inline links hover to the same blue as the Button `link` variant. FieldDescription
// hovers its links to primary (yellow) from the parent, which outranks a plain
// utility on the anchor, so this has to be important to land.
export const AUTH_LINK_CLASS = 'hover:!text-[#2040B0]'

const RESEND_SECONDS = 60

// Counts down the cool-off between "send me another code/link" attempts.
export function useResendCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (secondsLeft <= 0) {
      return
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [secondsLeft])

  const start = useCallback(() => setSecondsLeft(RESEND_SECONDS), [])

  return { secondsLeft, start }
}
