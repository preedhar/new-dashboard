import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

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
} from './auth'
import { navigate } from './navigate'

// Where an invited user lands from their activation email: one form that names
// the account and sets its password, then a confirmation. Distinct from
// /signup, which asks about the business and never takes a password, and from
// /reset-password, which changes a password on an account that already exists.
type ActivateStep = 'form' | 'done'

export function ActivateAccountPage() {
  const [step, setStep] = useState<ActivateStep>('form')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nameError, setNameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const timerRef = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const nextNameError = name.trim() ? '' : 'Enter your name'
    const nextPasswordError =
      password.length >= MIN_PASSWORD_LENGTH
        ? ''
        : `Use at least ${MIN_PASSWORD_LENGTH} characters`
    const nextConfirmError =
      confirmPassword === password ? '' : 'Both passwords must match'
    setNameError(nextNameError)
    setPasswordError(nextPasswordError)
    setConfirmError(nextConfirmError)

    if (nextNameError || nextPasswordError || nextConfirmError) {
      return
    }

    setIsSubmitting(true)
    timerRef.current = window.setTimeout(() => {
      setIsSubmitting(false)
      setStep('done')
    }, 500)
  }

  return (
    <AuthShell>
      {step === 'form' ? (
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <AuthHeader
              title="Activate account"
              description="Tell us your name and choose a password to finish setting up your account."
            />

            <Field
              className={AUTH_FIELD_CLASS}
              data-invalid={Boolean(nameError) || undefined}
            >
              <FieldLabel htmlFor="activate-name">Name</FieldLabel>
              <Input
                autoFocus
                id="activate-name"
                className={AUTH_INPUT_CLASS}
                autoComplete="name"
                placeholder="Your name"
                value={name}
                aria-invalid={Boolean(nameError) || undefined}
                onChange={(event) => {
                  setName(event.target.value)
                  setNameError('')
                }}
              />
              <FieldError>{nameError}</FieldError>
            </Field>

            <Field
              className={AUTH_FIELD_CLASS}
              data-invalid={Boolean(passwordError) || undefined}
            >
              <FieldLabel htmlFor="activate-password">Password</FieldLabel>
              <PasswordInput
                id="activate-password"
                autoComplete="new-password"
                placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
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
              <FieldLabel htmlFor="activate-confirm-password">
                Confirm password
              </FieldLabel>
              <PasswordInput
                id="activate-confirm-password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
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
                Activate account
              </Button>
            </Field>

            <FieldDescription className="text-center">
              Already activated?{' '}
              <a
                href="/login"
                className={AUTH_LINK_CLASS}
                onClick={(event) => {
                  event.preventDefault()
                  navigate('/login')
                }}
              >
                Login
              </a>
            </FieldDescription>
          </FieldGroup>
        </form>
      ) : null}

      {step === 'done' ? (
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <CheckCircle2 className="mb-1 size-12 text-success-foreground" />
            <h1 className="text-xl font-bold">Account activated</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Welcome, {name.trim()}. Login with your new password to continue.
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
