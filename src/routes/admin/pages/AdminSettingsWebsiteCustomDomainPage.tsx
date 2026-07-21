import * as React from 'react'
import {
  ArrowLeft,
  CircleCheck,
  CircleX,
  Loader2,
  Search,
  ShoppingCart,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { TypographyLarge } from '@/components/ui/typography'

const WEBSITE_PATH = '/admin/settings/website'

// A single domain result: the name split into its label and TLD so the TLD can
// be emphasized, the yearly price, and whether it's available to buy.
type DomainResult = {
  label: string
  tld: string
  price: string
  available: boolean
}

// Client-side navigation matching the app's router (pushState + popstate).
function navigateTo(path: string) {
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

// Strip protocol, path, and a leading "www." so the searched domain is bare.
function normalizeDomain(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
}

// The base name (without any TLD) of a typed domain, e.g. "coffeebrewers" from
// "coffeebrewers.com".
function domainBase(value: string) {
  return normalizeDomain(value).replace(/\..*$/, '')
}

// A single domain result row: an availability icon, the name (TLD in bold), the
// price, and a primary Buy button. Available domains show a green check; taken
// domains show a red cross, "Unavailable", and a disabled Buy button.
function ResultRow({ result }: { result: DomainResult }) {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {result.available ? (
          <CircleCheck className="size-5 shrink-0 text-green-600" />
        ) : (
          <CircleX className="size-5 shrink-0 text-red-600" />
        )}
        <span
          className={
            result.available
              ? 'min-w-0 truncate text-sm'
              : 'min-w-0 truncate text-sm text-muted-foreground'
          }
        >
          {result.label}
          <span className="font-semibold">{result.tld}</span>
        </span>
      </div>
      <span className="shrink-0 text-sm text-muted-foreground">
        {result.available ? result.price : 'Unavailable'}
      </span>
      <Button
        type="button"
        variant={result.available ? 'default' : 'outline'}
        size="lg"
        className="shrink-0 px-3"
        disabled={!result.available}
        onClick={() =>
          toast.success(`${result.label}${result.tld} added to cart`)
        }
      >
        <ShoppingCart className="size-4" />
        Buy
      </Button>
    </div>
  )
}

// A sub-page of the Website settings, reached from the "Get domain" button or a
// suggested-domain row on the Website page. Searches for a custom domain to buy
// and lists the exact match plus alternatives.
export function AdminSettingsWebsiteCustomDomainPage() {
  // A domain passed via the `?domain=` query param prefills the search; falling
  // back to the shop's default name so the page always opens mid-search.
  const initialDomain = React.useMemo(() => {
    const fromQuery =
      typeof window === 'undefined'
        ? ''
        : new URLSearchParams(window.location.search).get('domain')
    return fromQuery ? normalizeDomain(fromQuery) : 'coffeebrewers.com'
  }, [])

  const [domain, setDomain] = React.useState(initialDomain)
  // The base name the current results are for, and whether a search is running.
  // `searching` starts true so the page opens already searching the prefill.
  const [searchedBase, setSearchedBase] = React.useState('')
  const [searching, setSearching] = React.useState(true)

  // Simulate a domain-availability lookup: after a short delay, results appear
  // for the searched base name.
  function runSearch(value?: string) {
    const base = domainBase(typeof value === 'string' ? value : domain)
    if (!base) {
      toast.error('Enter a domain name')
      setSearching(false)
      return
    }
    setSearching(true)
    window.setTimeout(() => {
      setSearchedBase(base)
      setSearching(false)
    }, 1200)
  }

  // Auto-search the prefilled domain when the page opens. `searching` already
  // starts true, so the effect only schedules the results (setting state async
  // in the timeout, not synchronously in the effect body).
  React.useEffect(() => {
    const base = domainBase(initialDomain)
    const timer = window.setTimeout(() => {
      setSearchedBase(base)
      setSearching(false)
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [initialDomain])

  // The exact match and the alternative suggestions for the searched base. Some
  // alternatives are taken to surface the unavailable (cross) state.
  const exactMatch = React.useMemo<DomainResult>(
    () => ({ label: searchedBase, tld: '.com', price: '$25/year', available: true }),
    [searchedBase],
  )
  const otherResults = React.useMemo<DomainResult[]>(
    () => [
      { label: `${searchedBase}online`, tld: '.com', price: '$25/year', available: true },
      { label: searchedBase, tld: '.net', price: '$25/year', available: false },
      { label: searchedBase, tld: '.org', price: '$25/year', available: true },
      { label: searchedBase, tld: '.info', price: '$25/year', available: false },
    ],
    [searchedBase],
  )

  const showResults = searchedBase !== '' && !searching

  return (
    <div className="w-full">
      <header className="relative mb-8 flex items-center justify-center">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label="Go back"
          onClick={() => navigateTo(WEBSITE_PATH)}
          className="absolute left-0"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-normal text-neutral-900">
          Custom domain
        </h1>
      </header>

      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8">
        <section>
          <div className="flex items-center gap-2">
            <Input
              id="custom-domain"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') runSearch()
              }}
              placeholder="Enter a domain name"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="h-10 min-w-0 flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="shrink-0 px-3"
              onClick={() => runSearch()}
              disabled={searching}
            >
              {searching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              Search
            </Button>
          </div>
        </section>

        {showResults ? (
          <>
            <section className="space-y-3">
              <TypographyLarge>Search results</TypographyLarge>
              <Card className="gap-0 py-0 shadow-none">
                <div className="px-4 sm:px-6">
                  <ResultRow result={exactMatch} />
                </div>
              </Card>
            </section>

            <section className="space-y-3">
              <TypographyLarge>Suggestions</TypographyLarge>
              <Card className="gap-0 py-0 shadow-none">
                <div className="divide-y divide-border/50 px-4 sm:px-6">
                  {otherResults.map((result) => (
                    <ResultRow
                      key={`${result.label}${result.tld}`}
                      result={result}
                    />
                  ))}
                </div>
              </Card>
            </section>
          </>
        ) : null}
      </div>
    </div>
  )
}
