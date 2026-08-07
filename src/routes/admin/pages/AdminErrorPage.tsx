import { Home, RotateCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import errorCat from '@/assets/admin/error-cat.png'

export function AdminErrorPage() {
  return (
    <section className="flex min-h-[70vh] flex-1 flex-col items-center justify-center px-4 text-center">
      <img
        src={errorCat}
        alt=""
        className="mb-6 h-auto w-40 select-none"
        draggable={false}
      />
      <h1 className="text-2xl font-semibold tracking-normal text-neutral-900">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-base leading-7 text-muted-foreground">
        This page ran into an unexpected problem. Reloading usually fixes it.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button size="lg" className="px-3" onClick={() => window.location.reload()}>
          <RotateCw />
          Reload page
        </Button>
        <Button size="lg" variant="outline" className="px-3" asChild>
          <a href="/admin">
            <Home />
            Go to home
          </a>
        </Button>
      </div>
    </section>
  )
}
