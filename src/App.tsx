import { useEffect, useMemo, useState } from 'react'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { APP_LINK_PATH } from '@/lib/app-links'
import { AdminPage } from '@/routes/admin/AdminPage'
import { getAdminRedirect } from '@/routes/admin/adminRoutes'
import { AppRedirectPage } from '@/routes/app/AppRedirectPage'
import { LoginPage } from '@/routes/auth/LoginPage'
import { ResetPasswordPage } from '@/routes/auth/ResetPasswordPage'
import { SignupPage } from '@/routes/signup/SignupPage'
import './App.css'

function getPathname() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/'

  // Signup, the auth screens and the public app link stay reachable by visiting
  // them directly; everything else that isn't an admin route — the root and any
  // unknown path — lands on /admin.
  if (pathname === '/signup') {
    return '/signup'
  }

  if (pathname === '/login' || pathname === '/reset-password') {
    return pathname
  }

  // The card galleries live in the admin shell, but the shorter paths they were
  // asked for still get there.
  if (pathname === '/home-cards') {
    return '/admin/home-cards'
  }

  if (pathname === '/setup-cards') {
    return '/admin/setup-cards'
  }

  if (pathname === APP_LINK_PATH) {
    return APP_LINK_PATH
  }

  if (pathname !== '/admin' && !pathname.startsWith('/admin/')) {
    return '/admin'
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

    if (pathname === '/login') {
      return <LoginPage />
    }

    if (pathname === '/reset-password') {
      return <ResetPasswordPage />
    }

    if (pathname === APP_LINK_PATH) {
      return <AppRedirectPage />
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
