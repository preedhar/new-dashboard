import { useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  CalendarCheck,
  Check,
  Globe2,
  MapPin,
  Monitor,
  QrCode,
  ShoppingBag,
  Store,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const TOTAL_STEPS = 5

type Option = {
  id: string
  label: string
  icon?: typeof Store
}

const sellingOptions: Option[] = [
  { id: 'physical-store', label: 'Physical store', icon: Store },
  { id: 'ecommerce', label: 'Ecommerce platforms', icon: Globe2 },
  { id: 'social-media', label: 'Social media', icon: Users },
  { id: 'popups', label: 'Pop-up events', icon: MapPin },
  { id: 'not-selling-yet', label: "I don't sell yet" },
]

const setupOptions: Option[] = [
  { id: 'online-store', label: 'Online Store', icon: ShoppingBag },
  { id: 'pos', label: 'POS', icon: Monitor },
  { id: 'qr-code-ordering', label: 'QR Code Ordering', icon: QrCode },
  { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
]

function normalizeInstagramHandle(value: string) {
  return value
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^instagram\.com\//i, '')
    .replace(/^@/, '')
}

export function SignupPage() {
  const [step, setStep] = useState(0)
  const [businessName, setBusinessName] = useState('')
  const [sellingChannels, setSellingChannels] = useState<string[]>([])
  const [setupChoice, setSetupChoice] = useState('')
  const [instagram, setInstagram] = useState('')
  const [email, setEmail] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  const progressStep = Math.min(step + 1, TOTAL_STEPS)
  const progressValue = (progressStep / TOTAL_STEPS) * 100

  const canContinue = useMemo(() => {
    if (isComplete) {
      return false
    }

    switch (step) {
      case 0:
        return businessName.trim().length >= 2
      case 1:
        return sellingChannels.length > 0
      case 2:
        return Boolean(setupChoice)
      case 3:
        return Boolean(instagram.trim())
      case 4:
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      default:
        return false
    }
  }, [businessName, email, instagram, isComplete, sellingChannels, setupChoice, step])

  function toggleSellingChannel(id: string) {
    setSellingChannels((current) => {
      if (id === 'not-selling-yet') {
        return current.includes(id) ? [] : [id]
      }

      const next = current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]

      return next.filter((value) => value !== 'not-selling-yet')
    })
  }

  function handleNext() {
    if (!canContinue) {
      return
    }

    if (step === TOTAL_STEPS - 1) {
      window.history.pushState(null, '', '/admin')
      window.dispatchEvent(new PopStateEvent('popstate'))
      return
    }

    setStep((current) => Math.min(current + 1, TOTAL_STEPS - 1))
  }

  function handleBack() {
    if (isComplete) {
      setIsComplete(false)
      setStep(TOTAL_STEPS - 1)
      return
    }

    setStep((current) => Math.max(current - 1, 0))
  }

  function handleSkipInstagram() {
    setInstagram('')
    setStep((current) => Math.min(current + 1, TOTAL_STEPS - 1))
  }

  function restart() {
    setStep(0)
    setBusinessName('')
    setSellingChannels([])
    setSetupChoice('')
    setInstagram('')
    setEmail('')
    setIsComplete(false)
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="flex min-h-svh flex-col px-6 py-7 sm:px-10 lg:px-14">
        <header className="shrink-0 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <p className="text-base font-semibold text-primary">
              {progressStep} of {TOTAL_STEPS}
            </p>
            <button
              className="flag-button"
              type="button"
              aria-label="Language: English United States"
            >
              <span className="flag-canton" />
            </button>
          </div>
          <Progress className="h-1 rounded-none bg-muted" value={progressValue} />
        </header>

        <section className="mx-auto flex w-full max-w-[600px] flex-1 flex-col items-center py-10 sm:py-14">
          {isComplete ? (
            <CompleteScreen restart={restart} />
          ) : (
            <form
              className="my-auto flex w-full flex-col items-start"
              onSubmit={(event) => {
                event.preventDefault()
                handleNext()
              }}
            >
              {step === 0 && (
                <TextStep
                  title="What is the name of your business?"
                  subtitle="You can edit all these details later"
                  label="Business name"
                  value={businessName}
                  onChange={setBusinessName}
                  placeholder="Coco's Shop"
                  autoComplete="organization"
                />
              )}

              {step === 1 && (
                <OptionStep
                  title="Where do you currently sell?"
                  subtitle="Select all that apply"
                  options={sellingOptions}
                  selected={sellingChannels}
                  onSelect={toggleSellingChannel}
                />
              )}

              {step === 2 && (
                <OptionStep
                  title="What do you want to set up first?"
                  subtitle="You can set up others later"
                  options={setupOptions}
                  selected={setupChoice ? [setupChoice] : []}
                  onSelect={setSetupChoice}
                  showCheckbox={false}
                />
              )}

              {step === 3 && <SocialStep instagram={instagram} setInstagram={setInstagram} />}

              {step === 4 && (
                <TextStep
                  title="And lastly, what is your email?"
                  subtitle=""
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                />
              )}

              <div className="mt-8 flex w-full flex-wrap items-center justify-start gap-4">
                {step > 0 && (
                  <Button
                    aria-label="Go back"
                    className="w-14 px-0"
                    onClick={handleBack}
                    size="xl"
                    type="button"
                    variant="outline"
                  >
                    <ArrowUp />
                  </Button>
                )}
                {!(step === 3 && !instagram.trim()) && (
                  <Button disabled={!canContinue} size="xl" type="submit">
                    {step === TOTAL_STEPS - 1 ? 'Finish' : 'Next'}
                    <ArrowDown />
                  </Button>
                )}
                {step === 3 && !instagram.trim() && (
                  <Button
                    className="h-auto bg-transparent px-0 py-0 text-sm font-medium text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground"
                    onClick={handleSkipInstagram}
                    type="button"
                    variant="ghost"
                  >
                    I don't have a handle yet
                  </Button>
                )}
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  )
}

type TextStepProps = {
  title: string
  subtitle: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
  autoComplete?: string
}

function TextStep({
  title,
  subtitle,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
}: TextStepProps) {
  return (
    <div className="w-full text-left">
      <StepHeading title={title} subtitle={subtitle} />
      <Label className="sr-only" htmlFor={label}>
        {label}
      </Label>
      <Input
        autoComplete={autoComplete}
        autoFocus
        className="mt-6 w-full"
        id={label}
        inputSize="xl"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </div>
  )
}

type OptionStepProps = {
  title: string
  subtitle: string
  options: Option[]
  selected: string[]
  onSelect: (id: string) => void
  showCheckbox?: boolean
}

function OptionStep({
  title,
  subtitle,
  options,
  selected,
  onSelect,
  showCheckbox = true,
}: OptionStepProps) {
  return (
    <div className="w-full text-left">
      <StepHeading title={title} subtitle={subtitle} />
      <div className="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {options.map((option) => {
          const Icon = option.icon
          const isSelected = selected.includes(option.id)
          const isShortFullWidth = option.id === 'not-selling-yet'

          return (
            <button
              aria-pressed={isSelected}
              className={cn(
                'relative flex min-h-16 flex-row items-center justify-start gap-3 rounded-lg border bg-card px-4 py-3 pr-12 text-left text-card-foreground shadow-md transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35 sm:min-h-32 sm:flex-col sm:justify-center sm:gap-4 sm:px-5 sm:py-4 sm:pr-5 sm:text-center',
                isSelected
                  ? 'border-[3px] border-primary bg-primary/5 shadow-none'
                  : 'border-border',
                isShortFullWidth && 'h-16 min-h-0 py-0 sm:col-span-2 sm:min-h-0',
              )}
              key={option.id}
              onClick={() => onSelect(option.id)}
              type="button"
            >
              {showCheckbox && !isShortFullWidth && (
                <span
                  className={cn(
                    'absolute right-4 top-4 flex size-5 items-center justify-center rounded-[4px] border-2',
                    isSelected ? 'border-primary bg-primary text-neutral-950' : 'border-neutral-300',
                  )}
                >
                  {isSelected && <Check className="size-4" strokeWidth={3.2} />}
                </span>
              )}
              {Icon && <Icon className="size-7 text-neutral-900 sm:size-10" strokeWidth={2} />}
              <span className="min-w-0 flex-1 text-balance text-xl font-medium leading-tight tracking-normal text-neutral-900 sm:w-full sm:flex-none">
                {option.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SocialStep({
  instagram,
  setInstagram,
}: {
  instagram: string
  setInstagram: (value: string) => void
}) {
  return (
    <div className="w-full text-left">
      <StepHeading
        title="What is the Instagram handle of your business?"
        subtitle="We'll fetch your business details to set up your account"
      />
      <Label className="sr-only" htmlFor="instagram">
        Instagram handle
      </Label>
      <InputGroup className="mt-6" inputGroupSize="xl">
        <InputGroupAddon className="gap-3" inputGroupSize="xl">
          <img alt="" className="size-6" src="/instagram-logo.svg" />
          @
        </InputGroupAddon>
        <InputGroupInput
          autoFocus
          id="instagram"
          onChange={(event) => setInstagram(normalizeInstagramHandle(event.target.value))}
          placeholder="handle"
          value={instagram}
        />
      </InputGroup>
    </div>
  )
}

function CompleteScreen({ restart }: { restart: () => void }) {
  return (
    <div className="my-auto flex w-full flex-col items-start text-left">
      <div className="mb-8 flex size-20 items-center justify-center rounded-full bg-primary text-neutral-950">
        <Check className="size-11" strokeWidth={3} />
      </div>
      <StepHeading
        title="Your shop setup is ready"
        subtitle="This prototype ends here so the onboarding flow is easy to review."
      />
      <div className="mt-10 flex gap-4">
        <Button onClick={restart} size="xl" type="button">
          Start over
        </Button>
      </div>
    </div>
  )
}

function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-left">
      <h1 className="text-2xl font-semibold leading-tight tracking-normal text-neutral-900">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 text-xl font-normal leading-tight tracking-normal text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  )
}
