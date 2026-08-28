import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { AuthHeader, AuthShell } from './components/auth-shell'
import { PasswordInput } from './components/password-input'
import {
  AUTH_CONTROL_CLASS,
  AUTH_FIELD_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_LINK_CLASS,
  MIN_PASSWORD_LENGTH,
  isValidEmail,
  useResendCountdown,
} from './auth'
import { navigate } from './navigate'

// request → sent → password → done. Arriving with a `token` query parameter —
// what the emailed link would carry — drops straight into the password step.
type ResetStep = 'request' | 'sent' | 'password' | 'done'

const DEMO_TOKEN = 'demo-reset-token'

function initialStep(): ResetStep {
  return new URLSearchParams(window.location.search).get('token')
    ? 'password'
    : 'request'
}

export function ResetPasswordPage() {
  const [step, setStep] = useState<ResetStep>(initialStep)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { secondsLeft, start: startResendCountdown } = useResendCountdown()

  const timerRef = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  function handleRequestSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!isValidEmail(email)) {
      setEmailError('Enter a valid email address')
      return
    }

    setEmailError('')
    setStep('sent')
    startResendCountdown()
  }

  function handleResend() {
    if (secondsLeft > 0) {
      return
    }

    startResendCountdown()
    toast.success(`We sent another link to ${email.trim()}`)
  }

  // Stands in for clicking the link in the email: the same URL the real message
  // would point at, so the address bar matches what people would land on.
  function openResetLink() {
    window.history.pushState(null, '', `/reset-password?token=${DEMO_TOKEN}`)
    setStep('password')
  }

  function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault()

    const nextPasswordError =
      password.length >= MIN_PASSWORD_LENGTH
        ? ''
        : `Use at least ${MIN_PASSWORD_LENGTH} characters`
    const nextConfirmError =
      confirmPassword === password ? '' : 'Both passwords must match'
    setPasswordError(nextPasswordError)
    setConfirmError(nextConfirmError)

    if (nextPasswordError || nextConfirmError) {
      return
    }

    setIsSubmitting(true)
    timerRef.current = window.setTimeout(() => {
      setIsSubmitting(false)
      window.history.replaceState(null, '', '/reset-password')
      setStep('done')
    }, 500)
  }

  return (
    <AuthShell>
      {step === 'request' ? (
        <form onSubmit={handleRequestSubmit} noValidate>
          <FieldGroup>
            <AuthHeader
              title="Reset your password"
              description="Enter the email you login with and we'll send you a link to set a new password."
            />

            <Field
              className={AUTH_FIELD_CLASS}
              data-invalid={Boolean(emailError) || undefined}
            >
              <FieldLabel htmlFor="reset-email">Email</FieldLabel>
              <Input
                autoFocus
                id="reset-email"
                type="email"
                className={AUTH_INPUT_CLASS}
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                aria-invalid={Boolean(emailError) || undefined}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setEmailError('')
                }}
              />
              <FieldError>{emailError}</FieldError>
            </Field>

            <Field>
              <Button type="submit" size="lg" className={AUTH_CONTROL_CLASS}>
                Send reset link
              </Button>
            </Field>

            <BackToLogin />
          </FieldGroup>
        </form>
      ) : null}

      {step === 'sent' ? (
        <FieldGroup>
          <AuthHeader
            title="Check your email"
            description={
              <>
                If an account matches{' '}
                <span className="font-medium text-foreground">{email.trim()}</span>,
                you&apos;ll receive an email with a password reset link.
              </>
            }
          >
            <Button
              type="button"
              variant="link"
              className="h-auto px-0 py-0 text-sm"
              onClick={() => {
                setStep('request')
                setEmailError('')
              }}
            >
              Change email address
            </Button>
          </AuthHeader>

          <Field>
            {/* Prototype only — there is no mail to open. */}
            <Button
              type="button"
              size="lg"
              className={AUTH_CONTROL_CLASS}
              onClick={openResetLink}
            >
              Open the reset link (for prototype only)
            </Button>
            <FieldDescription className="text-center">
              Didn&apos;t receive the email?{' '}
              {secondsLeft > 0 ? (
                <span>Resend in {secondsLeft}s</span>
              ) : (
                <a
                  href="#resend"
                  className={AUTH_LINK_CLASS}
                  onClick={(event) => {
                    event.preventDefault()
                    handleResend()
                  }}
                >
                  Resend it
                </a>
              )}
            </FieldDescription>
          </Field>
        </FieldGroup>
      ) : null}

      {step === 'password' ? (
        <form onSubmit={handlePasswordSubmit} noValidate>
          <FieldGroup>
            <AuthHeader title="Set a new password" />

            <Field
              className={AUTH_FIELD_CLASS}
              data-invalid={Boolean(passwordError) || undefined}
            >
              <FieldLabel htmlFor="new-password">New password</FieldLabel>
              <PasswordInput
                autoFocus
                id="new-password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                aria-invalid={Boolean(passwordError) || undefined}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setPasswordError('')
                  setConfirmError('')
                }}
              />
              <FieldError>{passwordError}</FieldError>
            </Field>

            <Field
              className={AUTH_FIELD_CLASS}
              data-invalid={Boolean(confirmError) || undefined}
            >
              <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
              <PasswordInput
                id="confirm-password"
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                aria-invalid={Boolean(confirmError) || undefined}
                onChange={(event) => {
                  setConfirmPassword(event.target.value)
                  setConfirmError('')
                }}
              />
              <FieldError>{confirmError}</FieldError>
            </Field>

            <Field>
              <Button
                type="submit"
                size="lg"
                className={AUTH_CONTROL_CLASS}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : null}
                Reset password
              </Button>
            </Field>

            <BackToLogin />
          </FieldGroup>
        </form>
      ) : null}

      {step === 'done' ? (
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <CheckCircle2 className="mb-1 size-12 text-success-foreground" />
            <h1 className="text-xl font-bold">Password reset</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Your password has been updated. Login with it to continue.
            </p>
          </div>

          <Field>
            <Button
              type="button"
              size="lg"
              className={AUTH_CONTROL_CLASS}
              onClick={() => navigate('/login')}
            >
              Continue to login
            </Button>
          </Field>
        </FieldGroup>
      ) : null}
    </AuthShell>
  )
}

function BackToLogin() {
  return (
    <FieldDescription className="text-center">
      <a
        href="/login"
        className={AUTH_LINK_CLASS}
        onClick={(event) => {
          event.preventDefault()
          navigate('/login')
        }}
      >
        Back to login
      </a>
    </FieldDescription>
  )
}
