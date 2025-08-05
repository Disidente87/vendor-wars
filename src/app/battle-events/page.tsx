'use client'


import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuthSimulation } from '@/hooks/useAuthSimulation'
import { UserHeader } from '@/components/UserHeader'
import { 
  ArrowLeft, 
  Swords, 
  Clock, 
  Trophy, 
  Users, 
  Flame,
  Calendar,
  MapPin,
  Bell
} from 'lucide-react'

export default function BattleEventsPage() {
  const router = useRouter()
  const { isAuthenticated, user: _user, isLoading } = useAuthSimulation()

  // Show loading while checking auth
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35] mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to Farcaster...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8f0] to-[#f4f1eb] relative overflow-hidden">
      {/* User Header */}
      <UserHeader />
      
      {/* Battle Events Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b35]/10 via-[#ffd23f]/10 to-[#06d6a0]/10"></div>
      
      {/* Header */}
      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-[#ff6b35]/20">
          <button
            onClick={() => router.back()}
            className="text-[#181511] flex size-12 shrink-0 items-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            Battle Events
          </h2>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="relative z-10 px-4 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-[#ff6b35]/20 text-center">
          {/* Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-[#ff6b35] to-[#ffd23f] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Swords className="w-12 h-12 text-white" />
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold text-[#2d1810] mb-4">
            Battle Events
          </h1>
          
          {/* Coming Soon Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#ff6b35] to-[#ffd23f] text-white px-4 py-2 rounded-full mb-6">
            <Clock className="w-4 h-4" />
            <span className="font-semibold">Coming Soon</span>
          </div>
          
          {/* Description */}
          <p className="text-[#6b5d52] text-lg mb-8 max-w-md mx-auto">
            Epic vendor battles, special events, and exclusive rewards are on their way! 
            Get ready to participate in the most exciting food truck competitions.
          </p>
          
          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
            <div className="bg-[#f4f1eb] rounded-xl p-4 text-center">
              <Trophy className="w-8 h-8 text-[#ffd23f] mx-auto mb-2" />
              <h3 className="font-semibold text-[#2d1810] mb-1">Tournaments</h3>
              <p className="text-sm text-[#6b5d52]">Compete in epic vendor tournaments</p>
            </div>
            
            <div className="bg-[#f4f1eb] rounded-xl p-4 text-center">
              <Users className="w-8 h-8 text-[#06d6a0] mx-auto mb-2" />
              <h3 className="font-semibold text-[#2d1810] mb-1">Team Battles</h3>
              <p className="text-sm text-[#6b5d52]">Form alliances and battle together</p>
            </div>
            
            <div className="bg-[#f4f1eb] rounded-xl p-4 text-center">
              <Flame className="w-8 h-8 text-[#ff6b35] mx-auto mb-2" />
              <h3 className="font-semibold text-[#2d1810] mb-1">Special Rewards</h3>
              <p className="text-sm text-[#6b5d52]">Earn exclusive battle tokens</p>
            </div>
            
            <div className="bg-[#f4f1eb] rounded-xl p-4 text-center">
              <Calendar className="w-8 h-8 text-[#e63946] mx-auto mb-2" />
              <h3 className="font-semibold text-[#2d1810] mb-1">Weekly Events</h3>
              <p className="text-sm text-[#6b5d52]">Regular competitions and challenges</p>
            </div>
          </div>
          
          {/* Notification Signup */}
          <div className="bg-gradient-to-r from-[#ff6b35]/10 to-[#ffd23f]/10 rounded-xl p-6 border border-[#ff6b35]/20">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Bell className="w-5 h-5 text-[#ff6b35]" />
              <h3 className="font-semibold text-[#2d1810]">Get Notified</h3>
            </div>
            <p className="text-[#6b5d52] text-sm mb-4">
              Be the first to know when Battle Events launch!
            </p>
            <Button
              className="w-full bg-[#ff6b35] hover:bg-[#e5562e] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notify Me
            </Button>
          </div>
        </div>
      </div>

      {/* Back to Map Button */}
      <div className="relative z-10 px-4 pb-6">
        <Button
          onClick={() => router.push('/map')}
          className="w-full bg-[#06d6a0] hover:bg-[#05c090] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Back to Map
        </Button>
      </div>
    </div>
  )
} 