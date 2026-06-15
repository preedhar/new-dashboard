type AdminPagePlaceholderProps = {
  title: string
  description: string
}

export function AdminPagePlaceholder({ title, description }: AdminPagePlaceholderProps) {
  return (
    <section className="flex min-h-[360px] flex-col justify-between rounded-lg border border-border bg-card p-6 text-card-foreground shadow-xs">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Admin dashboard</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-normal text-neutral-900">{title}</h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>
      </div>
      <div className="mt-10 border-t border-border pt-5">
        <p className="text-sm font-medium text-neutral-700">
          This route is ready for the page implementation.
        </p>
      </div>
    </section>
  )
}
