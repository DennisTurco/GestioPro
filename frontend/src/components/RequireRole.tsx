import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserRole } from '../types'

interface Props {
  role: UserRole
  children: React.ReactNode
}

export default function RequireRole({ role, children }: Props) {
  const { user } = useAuth()

  if (!user || user.userRole !== role) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
