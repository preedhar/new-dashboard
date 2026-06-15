import * as React from 'react'
import { ArrowUpRight, Check, ChevronRight, Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  TypographyH2,
  TypographyH3,
  TypographyLarge,
  TypographyMuted,
} from '@/components/ui/typography'

const STORE_URL = 'haus.cococart.co'

type SetupStep = {
  id: string
  title: string
  description: string
  locked?: boolean
}

const SETUP_STEPS: SetupStep[] = [
  {
    id: 'create-store',
    title: 'Create store',
    description: 'Your Cococart store is created',
    locked: true,
  },
  {
    id: 'logo',
    title: 'Logo',
    description: 'We automatically added it from your Instagram',
    locked: true,
  },
  {
    id: 'customize-website',
    title: 'Customize website',
    description: 'We automatically did it based on your Instagram',
    locked: true,
  },
  {
    id: 'add-products',
    title: 'Add products',
    description: 'Create your first items so customers can start ordering',
  },
  {
    id: 'set-up-fulfillment',
    title: 'Set up fulfillment methods',
    description: 'Choose pickup, delivery, or shipping options for your store',
  },
  {
    id: 'set-up-payments',
    title: 'Set up payments',
    description: 'Connect a payment method to accept customer orders',
  },
  {
    id: 'publish',
    title: 'Publish',
    description: 'Start free trial',
  },
]

export function Admin2OverviewPage() {
  const [copied, setCopied] = React.useState(false)
  const copiedTimeoutRef = React.useRef<number | null>(null)
  const lockedStepCount = SETUP_STEPS.filter((step) => step.locked).length
  const completedStepCount = lockedStepCount
  const progressValue = Math.round((completedStepCount / SETUP_STEPS.length) * 100)

  React.useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        window.clearTimeout(copiedTimeoutRef.current)
      }
    }
  }, [])

  function handleCopyClick() {
    void navigator.clipboard?.writeText(STORE_URL)
    setCopied(true)

    if (copiedTimeoutRef.current) {
      window.clearTimeout(copiedTimeoutRef.current)
    }

    copiedTimeoutRef.current = window.setTimeout(() => {
      setCopied(false)
      copiedTimeoutRef.current = null
    }, 2000)
  }

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="flex w-full flex-col items-center gap-4 text-center md:flex-row md:items-start md:justify-between md:text-left">
        <div className="space-y-2">
          <TypographyH2 className="md:text-left">Welcome!</TypographyH2>
        </div>

        <div
          data-slot="button-group"
          className="inline-flex w-fit items-center self-center rounded-md shadow-xs md:self-auto"
        >
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="rounded-r-none border-r border-secondary-foreground/10 text-base"
          >
            <a href={`https://${STORE_URL}`} target="_blank" rel="noreferrer">
              <ArrowUpRight
                data-icon="inline-start"
                aria-hidden="true"
                className="size-5 text-muted-foreground"
              />
              {STORE_URL}
            </a>
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                size="icon-lg"
                className="rounded-l-none border-l border-secondary-foreground/10"
                aria-label="Copy haus.cococart.co"
                onClick={handleCopyClick}
              >
                {copied ? (
                  <Check aria-hidden="true" className="size-5 text-muted-foreground" />
                ) : (
                  <Copy aria-hidden="true" className="size-5 text-muted-foreground" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copied ? 'Copied' : 'Copy'}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <section className="w-full max-w-xl space-y-8 text-left">
        <div className="space-y-8 text-center">
          <div className="space-y-3">
            <TypographyH3>Your online store is</TypographyH3>
            <TypographyH2 className="text-primary">{progressValue}% complete</TypographyH2>
            <TypographyMuted className="text-base">
              Need help with setup?{' '}
              <Button type="button" variant="link" className="h-auto p-0 text-base font-medium">
                Schedule a call
              </Button>
            </TypographyMuted>
          </div>
          <Progress value={progressValue} />
        </div>

        <ol className="overflow-hidden rounded-lg border border-border bg-background shadow-xs">
          {SETUP_STEPS.map((step, index) => {
            const checked = Boolean(step.locked)
            const clickable = index !== 0

            return (
              <li
                key={step.id}
                className={
                  index === 0
                    ? `flex items-start gap-4 p-4 outline-none ${
                        clickable
                          ? 'transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring'
                          : ''
                      }`
                    : `flex items-start gap-4 border-t border-border p-4 outline-none ${
                        clickable
                          ? 'transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring'
                          : ''
                      }`
                }
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
              >
                <span
                  aria-label={checked ? `${step.title} completed` : `${step.title} incomplete`}
                  className={
                    checked
                      ? 'mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-foreground'
                      : 'mt-1 size-5 shrink-0 rounded-full border border-border'
                  }
                  role="img"
                >
                  {checked ? <Check aria-hidden="true" className="size-3.5" /> : null}
                </span>
                <div className="min-w-0 flex-1">
                  <TypographyLarge
                    className={
                      checked
                        ? 'text-base font-medium text-muted-foreground line-through'
                        : 'text-base font-medium text-foreground'
                    }
                  >
                    {step.title}
                  </TypographyLarge>
                  <TypographyMuted className="mt-1 leading-6">{step.description}</TypographyMuted>
                </div>
                {clickable ? (
                  <ChevronRight
                    aria-hidden="true"
                    className="mt-1 size-5 shrink-0 text-muted-foreground"
                  />
                ) : null}
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
