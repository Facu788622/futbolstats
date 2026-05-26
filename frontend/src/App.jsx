import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar       from './components/Navbar'
import Home         from './pages/Home'
import Fixtures     from './pages/Fixtures'
import FixtureDetail from './pages/FixtureDetail'
import Standings    from './pages/Standings'
import Players      from './pages/Players'
import PlayerPage   from './pages/PlayerPage'
import TeamPage     from './pages/TeamPage'
import Login        from './pages/Login'
import Register     from './pages/Register'
import AdminPanel   from './pages/AdminPanel'

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth()
  if (!user)    return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <main className="pt-14">
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/fixtures"   element={<Fixtures />} />
          <Route path="/fixtures/:id" element={<FixtureDetail />} />
          <Route path="/standings"  element={<Standings />} />
          <Route path="/players"    element={<Players />} />
          <Route path="/players/:id" element={<PlayerPage />} />
          <Route path="/teams/:id"  element={<TeamPage />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/register"   element={<Register />} />
          <Route path="/admin"      element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
