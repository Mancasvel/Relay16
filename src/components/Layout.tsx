import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  User, 
  Edit3, 
  Wrench, 
  Settings, 
  Menu, 
  X,
  Zap,
  Activity
} from 'lucide-react'
import { Button } from '@heroui/react'
import { useNostr } from '@/hooks/useNostr'
import { useNostrStore } from '@/stores/nostr'

interface LayoutProps {
  children: ReactNode
}

const navItems = [
  { path: '/feed', icon: Home, label: 'Feed' },
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/compose', icon: Edit3, label: 'Compose' },
  { path: '/tools', icon: Wrench, label: 'Tools' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { isConnected } = useNostr()
  const { connectedRelays, userProfile } = useNostrStore()

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            
            <Link to="/feed" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl gradient-text">Relay16</span>
            </Link>
          </div>

          {/* Connection Status */}
          <div className="ml-auto flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="hidden sm:inline">
                {isConnected ? `${connectedRelays.size} relays` : 'Disconnected'}
              </span>
            </div>
            
            {userProfile && (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                  {userProfile.picture ? (
                    <img 
                      src={userProfile.picture} 
                      alt={userProfile.name || 'User'} 
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <span className="hidden md:inline text-sm font-medium">
                  {userProfile.name || userProfile.display_name || 'Anonymous'}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border transform transition-transform duration-200 ease-in-out
          md:relative md:inset-auto md:translate-x-0 md:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full pt-20 md:pt-6">
            <nav className="flex-1 px-4 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || 
                  (item.path === '/profile' && location.pathname.startsWith('/profile'))
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }
                    `}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* AI Services Status */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Activity size={16} />
                <span>AI Services</span>
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <div className="container mx-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 