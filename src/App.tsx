import { Routes, Route, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useNostrStore } from '@/stores/nostr'
import Layout from '@/components/Layout'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Feed from '@/pages/Feed'
import Profile from '@/pages/Profile'
import Compose from '@/pages/Compose'
import Tools from '@/pages/Tools'
import Settings from '@/pages/Settings'

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useNostrStore()
  
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  
  return <Layout>{children}</Layout>
}

// Public Route Component (redirects authenticated users)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useNostrStore()
  
  if (currentUser) {
    return <Navigate to="/feed" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background"
    >
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes - Each page has its own direct route */}
        <Route 
          path="/feed" 
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile/:pubkey?" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/compose" 
          element={
            <ProtectedRoute>
              <Compose />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tools" 
          element={
            <ProtectedRoute>
              <Tools />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback Routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </motion.div>
  )
}

export default App 