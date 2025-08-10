'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings, Bell, Shield, Palette, User, Wallet } from 'lucide-react'
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth'

export default function SettingsPage() {
  const router = useRouter()
  const { user, isLoading } = useFarcasterAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff8f0] to-[#f4f1eb] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff8f0] to-[#f4f1eb] flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#ff6b35]/20 text-center">
          <h2 className="text-xl font-bold text-[#2d1810] mb-2">Not Authenticated</h2>
          <p className="text-[#6b5d52] text-sm mb-4">Please connect your Farcaster account to access settings.</p>
          <Button
            onClick={() => router.push('/')}
            className="bg-[#ff6b35] hover:bg-[#e5562e] text-white font-medium py-3 rounded-xl shadow-lg"
          >
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  const settingsSections = [
    {
      title: 'Account',
      icon: User,
      items: [
        { name: 'Profile Settings', description: 'Edit your profile information', href: '/profile' },
        { name: 'Account Security', description: 'Manage your account security', href: '#' },
        { name: 'Privacy', description: 'Control your privacy settings', href: '#' }
      ]
    },
    {
      title: 'Preferences',
      icon: Palette,
      items: [
        { name: 'Notifications', description: 'Manage notification preferences', href: '/notifications' },
        { name: 'Display', description: 'Customize your display settings', href: '#' },
        { name: 'Language', description: 'Choose your preferred language', href: '#' }
      ]
    },
    {
      title: 'Wallet & Tokens',
      icon: Wallet,
      items: [
        { name: 'Wallet Settings', description: 'Manage your wallet connection', href: '/wallet' },
        { name: 'Token Preferences', description: 'Configure token settings', href: '#' },
        { name: 'Transaction History', description: 'View your transaction history', href: '#' }
      ]
    },
    {
      title: 'System',
      icon: Settings,
      items: [
        { name: 'About', description: 'App version and information', href: '#' },
        { name: 'Help & Support', description: 'Get help and contact support', href: '#' },
        { name: 'Terms & Privacy', description: 'Read our terms and privacy policy', href: '#' }
      ]
    }
  ]

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
              <h1 className="text-xl font-bold text-[#2d1810]">Settings</h1>
              <p className="text-[#6b5d52] text-sm">Customize your experience</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="relative z-10 px-4 pb-20">
        <div className="space-y-6">
          {settingsSections.map((section) => (
            <div key={section.title} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-[#ff6b35]/20">
              <div className="flex items-center space-x-3 mb-4">
                <section.icon className="w-5 h-5 text-[#ff6b35]" />
                <h2 className="text-lg font-semibold text-[#2d1810]">{section.title}</h2>
              </div>
              
              <div className="space-y-3">
                {section.items.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      if (item.href !== '#') {
                        router.push(item.href)
                      }
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      item.href !== '#' 
                        ? 'hover:bg-[#ff6b35]/10 cursor-pointer' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    disabled={item.href === '#'}
                  >
                    <div className="font-medium text-[#2d1810]">{item.name}</div>
                    <div className="text-sm text-[#6b5d52]">{item.description}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
