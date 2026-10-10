import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  // wait for /auth/me on a fresh page load, otherwise we'd redirect before the token is checked
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}
