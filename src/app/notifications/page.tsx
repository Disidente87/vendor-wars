'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  MapPin, 
  Flame, 
  Star, 
  Map, 
  Users, 
  User
} from 'lucide-react'

interface Notification {
  id: string
  type: 'territory' | 'streak' | 'vendor'
  title: string
  subtitle: string
  icon: 'MapPin' | 'Flame' | 'Star'
}

interface NotificationSettings {
  territoryAlerts: boolean
  streakReminders: boolean
  vendorHighlights: boolean
}

export default function NotificationsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<NotificationSettings>({
    territoryAlerts: true,
    streakReminders: true,
    vendorHighlights: true
  })

  // Mock notifications data
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'territory',
      title: '@Tacos_Lupita needs 5 more votes to win Zona Norte!',
      subtitle: 'Zona Norte',
      icon: 'MapPin'
    },
    {
      id: '2',
      type: 'territory',
      title: '@Empanadas_DoñaMaria is leading in Zona Sur!',
      subtitle: 'Zona Sur',
      icon: 'MapPin'
    },
    {
      id: '3',
      type: 'territory',
      title: '@Churros_El_Rey is under attack in Zona Centro!',
      subtitle: 'Zona Centro',
      icon: 'MapPin'
    },
    {
      id: '4',
      type: 'streak',
      title: 'Your streak is at 4 days – vote today to earn +2x!',
      subtitle: '4 days',
      icon: 'Flame'
    },
    {
      id: '5',
      type: 'vendor',
      title: 'Welcome @Tamales_AbuelaRosa to Vendor Wars!',
      subtitle: 'New Vendor',
      icon: 'Star'
    }
  ]

  const handleToggleSetting = (setting: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'MapPin':
        return <MapPin className="h-6 w-6" />
      case 'Flame':
        return <Flame className="h-6 w-6" />
      case 'Star':
        return <Star className="h-6 w-6" />
      default:
        return <MapPin className="h-6 w-6" />
    }
  }

  const getNotificationsByType = (type: string) => {
    return notifications.filter(notification => notification.type === type)
  }

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-white justify-between group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center bg-white p-4 pb-2 justify-between">
          <button
            onClick={() => router.back()}
            className="text-[#181511] flex size-12 shrink-0 items-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            Notifications
          </h2>
        </div>

        {/* Territory Alerts */}
        <h3 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Territory Alerts
        </h3>
        {getNotificationsByType('territory').map((notification) => (
          <div key={notification.id} className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2">
            <div className="text-[#181511] flex items-center justify-center rounded-lg bg-[#f5f3f0] shrink-0 size-12">
              {getIconComponent(notification.icon)}
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[#181511] text-base font-medium leading-normal line-clamp-1">
                {notification.title}
              </p>
              <p className="text-[#8a7860] text-sm font-normal leading-normal line-clamp-2">
                {notification.subtitle}
              </p>
            </div>
          </div>
        ))}

        {/* Streak Reminders */}
        <h3 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Streak Reminders
        </h3>
        {getNotificationsByType('streak').map((notification) => (
          <div key={notification.id} className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2">
            <div className="text-[#181511] flex items-center justify-center rounded-lg bg-[#f5f3f0] shrink-0 size-12">
              {getIconComponent(notification.icon)}
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[#181511] text-base font-medium leading-normal line-clamp-1">
                {notification.title}
              </p>
              <p className="text-[#8a7860] text-sm font-normal leading-normal line-clamp-2">
                {notification.subtitle}
              </p>
            </div>
          </div>
        ))}

        {/* Vendor Highlights */}
        <h3 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Vendor Highlights
        </h3>
        {getNotificationsByType('vendor').map((notification) => (
          <div key={notification.id} className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2">
            <div className="text-[#181511] flex items-center justify-center rounded-lg bg-[#f5f3f0] shrink-0 size-12">
              {getIconComponent(notification.icon)}
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[#181511] text-base font-medium leading-normal line-clamp-1">
                {notification.title}
              </p>
              <p className="text-[#8a7860] text-sm font-normal leading-normal line-clamp-2">
                {notification.subtitle}
              </p>
            </div>
          </div>
        ))}

        {/* Notification Settings */}
        <h3 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Notification Settings
        </h3>
        
        {/* Territory Alerts Toggle */}
        <div className="flex items-center gap-4 bg-white px-4 min-h-14 justify-between">
          <p className="text-[#181511] text-base font-normal leading-normal flex-1 truncate">
            Territory Alerts
          </p>
          <div className="shrink-0">
            <label
              className={`relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none p-0.5 transition-colors ${
                settings.territoryAlerts ? 'bg-[#ee8c0b] justify-end' : 'bg-[#f5f3f0] justify-start'
              }`}
            >
              <div 
                className="h-full w-[27px] rounded-full bg-white transition-transform duration-200 ease-in-out"
                style={{ 
                  boxShadow: 'rgba(0, 0, 0, 0.15) 0px 3px 8px, rgba(0, 0, 0, 0.06) 0px 3px 1px',
                  transform: settings.territoryAlerts ? 'translateX(20px)' : 'translateX(0)'
                }}
              />
              <input 
                type="checkbox" 
                className="invisible absolute"
                checked={settings.territoryAlerts}
                onChange={() => handleToggleSetting('territoryAlerts')}
              />
            </label>
          </div>
        </div>

        {/* Streak Reminders Toggle */}
        <div className="flex items-center gap-4 bg-white px-4 min-h-14 justify-between">
          <p className="text-[#181511] text-base font-normal leading-normal flex-1 truncate">
            Streak Reminders
          </p>
          <div className="shrink-0">
            <label
              className={`relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none p-0.5 transition-colors ${
                settings.streakReminders ? 'bg-[#ee8c0b] justify-end' : 'bg-[#f5f3f0] justify-start'
              }`}
            >
              <div 
                className="h-full w-[27px] rounded-full bg-white transition-transform duration-200 ease-in-out"
                style={{ 
                  boxShadow: 'rgba(0, 0, 0, 0.15) 0px 3px 8px, rgba(0, 0, 0, 0.06) 0px 3px 1px',
                  transform: settings.streakReminders ? 'translateX(20px)' : 'translateX(0)'
                }}
              />
              <input 
                type="checkbox" 
                className="invisible absolute"
                checked={settings.streakReminders}
                onChange={() => handleToggleSetting('streakReminders')}
              />
            </label>
          </div>
        </div>

        {/* Vendor Highlights Toggle */}
        <div className="flex items-center gap-4 bg-white px-4 min-h-14 justify-between">
          <p className="text-[#181511] text-base font-normal leading-normal flex-1 truncate">
            Vendor Highlights
          </p>
          <div className="shrink-0">
            <label
              className={`relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none p-0.5 transition-colors ${
                settings.vendorHighlights ? 'bg-[#ee8c0b] justify-end' : 'bg-[#f5f3f0] justify-start'
              }`}
            >
              <div 
                className="h-full w-[27px] rounded-full bg-white transition-transform duration-200 ease-in-out"
                style={{ 
                  boxShadow: 'rgba(0, 0, 0, 0.15) 0px 3px 8px, rgba(0, 0, 0, 0.06) 0px 3px 1px',
                  transform: settings.vendorHighlights ? 'translateX(20px)' : 'translateX(0)'
                }}
              />
              <input 
                type="checkbox" 
                className="invisible absolute"
                checked={settings.vendorHighlights}
                onChange={() => handleToggleSetting('vendorHighlights')}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div>
        <div className="flex gap-2 border-t border-[#f5f3f0] bg-white px-4 pb-3 pt-2">
          <button
            onClick={() => router.push('/map')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#8a7860] hover:text-[#181511] transition-colors"
          >
            <Map className="h-8 w-8" />
            <p className="text-xs font-medium leading-normal tracking-[0.015em]">Map</p>
          </button>
          
          <button
            onClick={() => router.push('/vendors')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#8a7860] hover:text-[#181511] transition-colors"
          >
            <Users className="h-8 w-8" />
            <p className="text-xs font-medium leading-normal tracking-[0.015em]">Vendors</p>
          </button>
          
          <button
            onClick={() => router.push('/profile')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#8a7860] hover:text-[#181511] transition-colors"
          >
            <User className="h-8 w-8" />
            <p className="text-xs font-medium leading-normal tracking-[0.015em]">Profile</p>
          </button>
          
          <button
            onClick={() => router.push('/leaderboard')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#8a7860] hover:text-[#181511] transition-colors"
          >
            <Users className="h-8 w-8" />
            <p className="text-xs font-medium leading-normal tracking-[0.015em]">Social</p>
          </button>
        </div>
        <div className="h-5 bg-white" />
      </div>
    </div>
  )
} 