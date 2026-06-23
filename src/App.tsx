import { useEffect, useMemo, useState } from 'react'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AdminPage } from '@/routes/admin/AdminPage'
import { getAdminRedirect } from '@/routes/admin/adminRoutes'
import { SignupPage } from '@/routes/signup/SignupPage'
import './App.css'

function getPathname() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/'

  if (pathname === '/') {
    return '/signup'
  }

  // Parent section routes (e.g. /admin/orders) always resolve to their first subpage.
  return getAdminRedirect(pathname) ?? pathname
}

function App() {
  const [pathname, setPathname] = useState(getPathname)

  useEffect(() => {
    const resolved = getPathname()
    if (window.location.pathname.replace(/\/+$/, '') !== resolved) {
      window.history.replaceState(null, '', resolved)
    }

    function handleLocationChange() {
      const next = getPathname()
      if (window.location.pathname.replace(/\/+$/, '') !== next) {
        window.history.replaceState(null, '', next)
      }
      setPathname(next)
    }

    window.addEventListener('popstate', handleLocationChange)

    return () => window.removeEventListener('popstate', handleLocationChange)
  }, [])

  const route = useMemo(() => {
    if (pathname === '/signup') {
      return <SignupPage />
    }

    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      return <AdminPage pathname={pathname} />
    }

    return <SignupPage />
  }, [pathname])

  return (
    <TooltipProvider>
      {route}
      <Toaster />
    </TooltipProvider>
  )
}

export default App
