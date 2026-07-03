import { usePage } from '@inertiajs/react'

/**
 * UI-only permission check for conditionally showing/hiding buttons and nav
 * items. Never a substitute for the server-side `permission:` middleware.
 */
export default function usePermissions() {
  const { auth } = usePage().props
  const permissions = auth?.permissions ?? []
  const hasAll = permissions.includes('*')

  return {
    can: (key) => hasAll || permissions.includes(key),
  }
}
