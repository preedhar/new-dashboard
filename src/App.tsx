import { useEffect, useMemo, useState } from 'react'

import { TooltipProvider } from '@/components/ui/tooltip'
import { AdminPage } from '@/routes/admin/AdminPage'
import { SignupPage } from '@/routes/signup/SignupPage'
import './App.css'

function getPathname() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/'

  return pathname === '/' ? '/signup' : pathname
}

function App() {
  const [pathname, setPathname] = useState(getPathname)

  useEffect(() => {
    if (window.location.pathname === '/') {
      window.history.replaceState(null, '', '/signup')
    }

    function handleLocationChange() {
      setPathname(getPathname())
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

  return <TooltipProvider>{route}</TooltipProvider>
}

export default App
