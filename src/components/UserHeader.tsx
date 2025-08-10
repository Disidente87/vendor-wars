'use client'

import { useFarcasterAuth } from '@/hooks/useFarcasterAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Trophy, 
  Bell, 
  Settings
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { TokenBalance } from './TokenBalance'

export function UserHeader() {
  const { user } = useFarcasterAuth()
  const router = useRouter()

  if (!user) return null

  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">VW</span>
            </div>
            <span className="font-bold text-lg text-gray-900">Vendor Wars</span>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            {/* Battle Stats */}
            <div className="hidden md:flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1 text-orange-600">
                <Trophy className="w-4 h-4" />
                <span className="font-medium">{user.battleTokens || 0}</span>
              </div>
              <TokenBalance />
            </div>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={() => router.push('/notifications')}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Avatar & Menu */}
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.pfpUrl} alt={user.displayName} />
                <AvatarFallback className="bg-orange-100 text-orange-600">
                  {user.displayName?.charAt(0) || user.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user.displayName || user.username}</p>
                <p className="text-xs text-gray-500">@{user.username}</p>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/profile')}
                >
                  <User className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/settings')}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 