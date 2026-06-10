import type { User } from '@/hooks/useCurrentUser'

type Role = 'admin' | 'inventory-manager' | 'barber'

function getUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function hasRole(...roles: Role[]): boolean {
  const user = getUserFromStorage()
  if (!user) return false
  return roles.includes(user.role as Role)
}
