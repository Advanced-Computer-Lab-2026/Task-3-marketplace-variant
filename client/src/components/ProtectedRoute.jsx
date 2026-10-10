import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  // On a full page load the session is still being restored via /auth/me —
  // wait for it instead of treating the user as logged out.
  if (loading) return <div className="text-sm text-zinc-600">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}
