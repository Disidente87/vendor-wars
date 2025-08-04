'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Flame, 
  Map, 
  Users,
  ArrowLeft,
  Bell,
  Check,
  X,
  Star,
  Trophy,
  Coins,
  Target,
  Zap,
  Clock,
  Settings
} from 'lucide-react'

interface Notification {
  id: string
  type: 'vote' | 'territory' | 'achievement' | 'battle' | 'reward' | 'system'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  action?: {
    type: 'navigate' | 'dismiss' | 'claim'
    target?: string
    tokens?: number
  }
  icon: string
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'vote',
      title: 'Vote Successful!',
      message: 'Your vote for Pupusas María helped them gain control of Zona Centro',
      timestamp: '2 minutes ago',
      isRead: false,
      action: {
        type: 'navigate',
        target: '/zones/centro',
        tokens: 25
      },
      icon: '🎯'
    },
    {
      id: '2',
      type: 'territory',
      title: 'Territory Battle Update',
      message: 'Tacos El Rey is challenging for control of Zona Norte. Vote now to defend!',
      timestamp: '15 minutes ago',
      isRead: false,
      action: {
        type: 'navigate',
        target: '/zones/norte'
      },
      icon: '⚔️'
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: 'First Vote - Cast your first vote for a vendor',
      timestamp: '1 hour ago',
      isRead: true,
      action: {
        type: 'claim',
        tokens: 50
      },
      icon: '🏆'
    },
    {
      id: '4',
      type: 'reward',
      title: 'Daily Reward Available',
      message: 'Claim your daily battle tokens for voting yesterday',
      timestamp: '3 hours ago',
      isRead: false,
      action: {
        type: 'claim',
        tokens: 100
      },
      icon: '💰'
    },
    {
      id: '5',
      type: 'battle',
      title: 'Battle Won!',
      message: 'Your team successfully defended Zona Sur from invaders',
      timestamp: '1 day ago',
      isRead: true,
      action: {
        type: 'navigate',
        target: '/zones/sur',
        tokens: 75
      },
      icon: '🔥'
    },
    {
      id: '6',
      type: 'system',
      title: 'Welcome to Vendor Wars!',
      message: 'Start your journey by exploring the battle map and voting for your favorite vendors',
      timestamp: '2 days ago',
      isRead: true,
      action: {
        type: 'navigate',
        target: '/map'
      },
      icon: '🎉'
    }
  ])

  const handleNotificationAction = (notification: Notification) => {
    // Add haptic feedback
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }

    if (notification.action?.type === 'navigate' && notification.action.target) {
      router.push(notification.action.target)
    } else if (notification.action?.type === 'claim') {
      // Handle token claim
      console.log(`Claimed ${notification.action.tokens} tokens`)
      markAsRead(notification.id)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'vote': return '#ff6b35'
      case 'territory': return '#06d6a0'
      case 'achievement': return '#ffd23f'
      case 'battle': return '#e63946'
      case 'reward': return '#f72585'
      case 'system': return '#8d99ae'
      default: return '#8d99ae'
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'vote': return <Target className="w-5 h-5" />
      case 'territory': return <Map className="w-5 h-5" />
      case 'achievement': return <Trophy className="w-5 h-5" />
      case 'battle': return <Flame className="w-5 h-5" />
      case 'reward': return <Coins className="w-5 h-5" />
      case 'system': return <Bell className="w-5 h-5" />
      default: return <Star className="w-5 h-5" />
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8f0] to-[#f4f1eb]">
      {/* Header */}
      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-[#ff6b35]/20">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-[#ff6b35] rounded-xl flex items-center justify-center shadow-lg hover:bg-[#e5562e] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#2d1810]">Notifications</h1>
              <p className="text-[#6b5d52] text-sm">{unreadCount} unread</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                className="bg-[#06d6a0] hover:bg-[#05c090] text-white font-medium px-3 py-2 rounded-lg shadow-lg text-sm"
              >
                <Check className="w-4 h-4 mr-1" />
                Mark All Read
              </Button>
            )}
            <button className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center shadow-lg hover:bg-white/80 transition-colors">
              <Settings className="w-5 h-5 text-[#6b5d52]" />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="relative z-10 px-4 pb-20">
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-[#ff6b35]/20 transition-all duration-300 ${
                !notification.isRead ? 'ring-2 ring-[#ff6b35]/30' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
                  style={{ backgroundColor: getNotificationColor(notification.type) }}
                >
                  {notification.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-[#2d1810] text-lg">{notification.title}</h3>
                    <div className="flex items-center space-x-2">
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-[#ff6b35] rounded-full"></div>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="w-6 h-6 bg-[#f4f1eb] rounded-full flex items-center justify-center hover:bg-[#e63946]/10 transition-colors"
                      >
                        <X className="w-3 h-3 text-[#6b5d52]" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-[#6b5d52] text-sm mb-3">{notification.message}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-[#6b5d52]" />
                      <span className="text-xs text-[#6b5d52]">{notification.timestamp}</span>
                    </div>
                    
                    {notification.action && (
                      <div className="flex items-center space-x-2">
                        {notification.action.tokens && (
                          <div className="flex items-center space-x-1 bg-[#ffd23f]/20 px-2 py-1 rounded-lg">
                            <Coins className="w-3 h-3 text-[#ffd23f]" />
                            <span className="text-xs font-semibold text-[#2d1810]">+{notification.action.tokens}</span>
                          </div>
                        )}
                        
                        <Button
                          onClick={() => handleNotificationAction(notification)}
                          className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${
                            notification.action.type === 'claim'
                              ? 'bg-[#ffd23f] hover:bg-[#e6c235] text-[#2d1810]'
                              : 'bg-[#ff6b35] hover:bg-[#e5562e] text-white'
                          }`}
                        >
                          {notification.action.type === 'claim' ? (
                            <>
                              <Zap className="w-3 h-3 mr-1" />
                              Claim
                            </>
                          ) : (
                            'View'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {notifications.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#f4f1eb] rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-[#6b5d52]" />
            </div>
            <h3 className="text-lg font-semibold text-[#2d1810] mb-2">No notifications</h3>
            <p className="text-[#6b5d52] text-sm">You're all caught up! Check back later for updates.</p>
          </div>
        )}
      </div>


    </div>
  )
} 