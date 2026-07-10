import { useEffect, type ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import Loading from '@/components/base/loading'

type AdminRole = 'super-admin' | 'editor' | 'user'

interface Props {
  roles: AdminRole[]
  children: ReactNode
}

export function RequireRole({ roles, children }: Props) {
  const { data: user, isLoading, isFetching } = useCurrentUser()
  const navigate = useNavigate()

  const userHasRole = !!user && roles.includes(user.role as AdminRole)

  useEffect(() => {
    if (isLoading || isFetching) return
    if (!user) {
      navigate({ to: '/login', replace: true })
      return
    }
    if (!userHasRole) {
      navigate({ to: '/forbidden', replace: true })
    }
  }, [user, isLoading, isFetching, userHasRole, navigate])

  if (isLoading || (isFetching && !user)) {
    return (
      <div className="flex h-svh w-full items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!user || !userHasRole) return null

  return <>{children}</>
}
