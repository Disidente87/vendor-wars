'use client'

import { useRouter, usePathname } from 'next/navigation'
import { MapPin, Store, User, Trophy } from 'lucide-react'

interface NavigationItem {
  name: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Map',
    path: '/map',
    icon: MapPin
  },
  {
    name: 'Vendors',
    path: '/vendors',
    icon: Store
  },
  {
    name: 'Profile',
    path: '/profile',
    icon: User
  },
  {
    name: 'Leaderboard',
    path: '/leaderboard',
    icon: Trophy
  }
]

export function BottomNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigation = (path: string) => {
    // Add haptic feedback for mobile
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }
    router.push(path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#f5f3f0] safe-area-inset-bottom">
      <div className="flex gap-2 px-4 pb-3 pt-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.path
          const Icon = item.icon
          
          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-1 flex-col items-center justify-end gap-1 transition-all duration-200 ease-in-out touch-manipulation ${
                isActive 
                  ? 'text-[#181511] scale-105' 
                  : 'text-[#8a7860] hover:text-[#181511] active:scale-95'
              }`}
              style={{ minHeight: '44px' }} // iOS touch target minimum
            >
              <Icon className={`h-8 w-8 transition-colors duration-200 ${
                isActive ? 'text-[#ee8c0b]' : ''
              }`} />
              <p className={`text-xs font-medium leading-normal tracking-[0.015em] transition-colors duration-200 ${
                isActive ? 'text-[#ee8c0b]' : ''
              }`}>
                {item.name}
              </p>
            </button>
          )
        })}
      </div>
      {/* Safe area for devices with home indicator */}
      <div className="h-5 bg-white" />
    </div>
  )
} 