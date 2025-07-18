import Cookies from 'js-cookie'
import { createFileRoute, redirect } from '@tanstack/react-router'
import Dashboard from '@/features/dashboard'

// fungsi cek token
function isAuthenticated(): boolean {
  const token = Cookies.get('token')
  return Boolean(token)
}

export const Route = createFileRoute('/_authenticated/')({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({
        to: '/401',
      })
    }
  },
  component: Dashboard,
})
