import { Button } from '@/components/ui/button'
import { FieldDescription } from '@/components/ui/field'
import { cn } from '@/lib/utils'

const FOOTER_LINKS = [
  { label: 'Help center', href: 'https://support.cococart.co/' },
  { label: 'Terms', href: 'https://www.cococart.co/terms-of-use' },
  { label: 'Privacy', href: 'https://www.cococart.co/privacy-policy' },
]

// The frame every auth screen shares: marketing header, centred card-less form
// following the shadcn login-05 block, then the footer. The form sits in the
// space left over, so it stays optically centred at any viewport height.
export function AuthShell({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <AuthTopBar />
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10 md:px-10">
        <div className={cn('w-full max-w-sm', className)} {...props} />
      </main>
      <AuthFooter />
    </div>
  )
}

// Wordmark on the left, the one marketing call to action on the right. Both
// stay on one row down to the narrowest phone; only the scale changes.
function AuthTopBar() {
  return (
    <header className="flex items-center justify-between gap-3 px-4 py-4 md:px-10 md:py-6">
      <a href="https://cococart.co/" aria-label="Cococart">
        <img
          src="/cococart-logo.svg"
          alt="Cococart"
          className="h-6 w-auto md:h-8"
        />
      </a>
      <Button asChild variant="secondary" className="md:h-10 md:px-4">
        <a href="https://get.cococart.co/">Start free trial</a>
      </Button>
    </header>
  )
}

// Tagline and links sit on opposite ends once there is room for them; below
// that they stack, centred, so neither ends up hugging an edge on its own.
function AuthFooter() {
  return (
    <footer className="flex flex-col items-center gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:gap-6 md:px-10">
      <p>Everything you need to sell anything</p>
      <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {FOOTER_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  )
}

// Title and supporting copy, stacked and centred above the form. The brand
// lives in the top bar, so nothing repeats it here. `children` sits below the
// description, for a link that belongs with the copy rather than with the
// form's controls.
export function AuthHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <h1 className="text-xl font-bold">{title}</h1>
      {/* FieldDescription rather than a plain <p> so inline links pick up the
          same underline treatment they have elsewhere in the form. */}
      {description ? (
        <FieldDescription className="text-center text-balance">
          {description}
        </FieldDescription>
      ) : null}
      {children}
    </div>
  )
}
