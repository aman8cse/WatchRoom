import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { RoomProvider } from './context/RoomContext.jsx'
import Landing from './pages/Landing/Landing.jsx'
import Login from './pages/Login/Login.jsx'
import Register from './pages/Register/Register.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
//import Room from './pages/Room/Room.jsx'
import './App.css'

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } />
    <Route path="/room/:code" element={
      <ProtectedRoute>
        <RoomProvider>
          <Login />
        </RoomProvider>
      </ProtectedRoute>
    } />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}