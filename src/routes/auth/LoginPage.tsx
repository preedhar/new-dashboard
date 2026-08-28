import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { cn } from '@/lib/utils'
import { AuthHeader, AuthShell } from './components/auth-shell'
import { PasswordInput } from './components/password-input'
import {
  AUTH_CONTROL_CLASS,
  AUTH_FIELD_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_LINK_CLASS,
  DEMO_LOGIN_CODE,
  isValidEmail,
  useResendCountdown,
} from './auth'
import { navigate } from './navigate'

// The page has two states: the default email + password form, and the one-time
// code form reached from "Send me a code".
type LoginStep = 'password' | 'code'

export function LoginPage() {
  const [step, setStep] = useState<LoginStep>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [codeError, setCodeError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const { secondsLeft, start: startResendCountdown } = useResendCountdown()

  // Any in-flight "request" is abandoned if the screen unmounts mid-way.
  const timerRef = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  function signIn() {
    setIsSubmitting(true)
    timerRef.current = window.setTimeout(() => navigate('/admin'), 500)
  }

  function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault()

    const nextEmailError = isValidEmail(email) ? '' : 'Enter a valid email address'
    const nextPasswordError = password ? '' : 'Enter your password'
    setEmailError(nextEmailError)
    setPasswordError(nextPasswordError)

    if (nextEmailError || nextPasswordError) {
      return
    }

    signIn()
  }

  // The code is sent to the address in the email field, so it has to be valid
  // before we can switch screens.
  function handleUseCode() {
    if (!isValidEmail(email)) {
      setEmailError('Enter a valid email address')
      emailRef.current?.focus()
      return
    }

    setEmailError('')
    setPasswordError('')
    setCode('')
    setCodeError('')
    setStep('code')
    startResendCountdown()
    toast.success(`We sent a 6-digit code to ${email.trim()}`)
  }

  function verifyCode(value: string) {
    if (value.length < 6) {
      setCodeError('Enter all 6 digits')
      return
    }

    if (value !== DEMO_LOGIN_CODE) {
      setCodeError('That code is incorrect or has expired')
      return
    }

    setCodeError('')
    signIn()
  }

  function handleResend() {
    if (secondsLeft > 0) {
      return
    }

    setCode('')
    setCodeError('')
    startResendCountdown()
    toast.success(`We sent a new code to ${email.trim()}`)
  }

  function handleChangeEmail() {
    setStep('password')
    setCode('')
    setCodeError('')
    // Focus lands back on the field the user came here to correct.
    window.setTimeout(() => emailRef.current?.focus(), 0)
  }

  return (
    <AuthShell>
      {step === 'password' ? (
        <form onSubmit={handlePasswordSubmit} noValidate>
          <FieldGroup>
            <AuthHeader
              title="Login to your account"
              description={
                <>
                  Don&apos;t have an account?{' '}
                  <a
                    href="/signup"
                    className={AUTH_LINK_CLASS}
                    onClick={(event) => {
                      event.preventDefault()
                      navigate('/signup')
                    }}
                  >
                    Sign up
                  </a>
                </>
              }
            />

            <Field
              className={AUTH_FIELD_CLASS}
              data-invalid={Boolean(emailError) || undefined}
            >
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                ref={emailRef}
                id="email"
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

            <Field
              className={AUTH_FIELD_CLASS}
              data-invalid={Boolean(passwordError) || undefined}
            >
              <div className="flex items-center justify-between gap-2">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto px-0 py-0 text-sm"
                  onClick={handleUseCode}
                >
                  Send me a code
                </Button>
              </div>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                aria-invalid={Boolean(passwordError) || undefined}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setPasswordError('')
                }}
              />
              <FieldError>{passwordError}</FieldError>
            </Field>

            <Field>
              <Button
                type="submit"
                size="lg"
                className={AUTH_CONTROL_CLASS}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : null}
                Login
              </Button>
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="link"
                  className="h-auto px-0 py-0 text-sm"
                  onClick={() => navigate('/reset-password')}
                >
                  Forgot password?
                </Button>
              </div>
            </Field>
          </FieldGroup>
        </form>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            verifyCode(code)
          }}
          noValidate
        >
          <FieldGroup>
            <AuthHeader
              title="Check your email"
              description={
                <>
                  If an account matches{' '}
                  <span className="font-medium text-foreground">{email.trim()}</span>,
                  you&apos;ll receive an email with a 6-digit login code.
                </>
              }
            >
              <Button
                type="button"
                variant="link"
                className="h-auto px-0 py-0 text-sm"
                onClick={handleChangeEmail}
              >
                Change email address
              </Button>
            </AuthHeader>

            <Field
              className={AUTH_FIELD_CLASS}
              data-invalid={Boolean(codeError) || undefined}
            >
              <FieldLabel htmlFor="login-code" className="sr-only">
                Login code
              </FieldLabel>
              <InputOTP
                autoFocus
                id="login-code"
                maxLength={6}
                value={code}
                placeholder="******"
                containerClassName="w-full"
                onChange={(value) => {
                  setCode(value)
                  setCodeError('')
                }}
                onComplete={verifyCode}
              >
                {/* Separated slots, so each digit carries its own border and
                    rounding rather than the joined default. They share the row
                    evenly, so it lines up with the full-width Login button. */}
                <InputOTPGroup className="w-full gap-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className={cn(
                        AUTH_CONTROL_CLASS,
                        'w-auto flex-1 rounded-md border text-xl font-semibold tabular-nums'
                      )}
                      aria-invalid={Boolean(codeError) || undefined}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <FieldError className="text-center">{codeError}</FieldError>
            </Field>

            <Field>
              <Button
                type="submit"
                size="lg"
                className={AUTH_CONTROL_CLASS}
                disabled={code.length < 6 || isSubmitting}
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : null}
                Login
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
        </form>
      )}
    </AuthShell>
  )
}
