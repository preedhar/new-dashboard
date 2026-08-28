import { FieldDescription } from '@/components/ui/field'
import { cn } from '@/lib/utils'

// The centred, card-less frame every auth screen shares, following the shadcn
// login-05 block.
export function AuthShell({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 text-foreground md:p-10">
      <div className={cn('w-full max-w-sm', className)} {...props} />
    </main>
  )
}

// Logomark, title and supporting copy, stacked and centred above the form.
// `children` sits below the description, for a link that belongs with the copy
// rather than with the form's controls.
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
      <img src="/cococart-logomark.svg" alt="Cococart" className="mb-1 size-12" />
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
