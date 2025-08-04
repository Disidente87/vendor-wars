'use client'
import { Suspense, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useMiniApp } from '@neynar/react'
import { Crown, Flame, MapPin, Users, Zap } from 'lucide-react'
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth'
import { VotingTest } from '@/components/VotingTest'

export default function HomePage() {
  const router = useRouter()
  const { isSDKLoaded, context } = useMiniApp()
  const [isConnecting, setIsConnecting] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  
  // Use real Farcaster authentication
  const { isAuthenticated, user, isLoading, signIn, error } = useFarcasterAuth()

  const features = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Conquer Territories",
      description: "Vote for your favorite vendors to control zones"
    },
    {
      icon: <Crown className="w-6 h-6" />,
      title: "Earn Battle Tokens",
      description: "Get rewards for supporting local businesses"
    },
    {
      icon: <Flame className="w-6 h-6" />,
      title: "Join the Fight",
      description: "Defend your barrio in epic vendor wars"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Build Community",
      description: "Connect with neighbors who love local food"
    }
  ]

  useEffect(() => {
    const load = async () => {
      if (isSDKLoaded) {
        try {
          const { sdk } = await import('@farcaster/miniapp-sdk')
          await sdk.actions.ready()
          console.log('Mini App SDK ready')
        } catch (error) {
          console.error('Error initializing SDK:', error)
        }
      }
    }
    load()
  }, [isSDKLoaded, context])

  const handleConnect = async () => {
    setIsConnecting(true)
    
    try {
      // Add haptic feedback
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate(100)
      }

      // Use real Farcaster authentication
      await signIn()
      
    } catch (error) {
      console.error('Error during authentication:', error)
      alert('Error connecting. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-full bg-gradient-to-br from-[#ff6b35] via-[#ffd23f] to-[#06d6a0] p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white font-medium">Connecting to Farcaster...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="h-full bg-gradient-to-br from-[#ff6b35] via-[#ffd23f] to-[#06d6a0] p-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-white/95 backdrop-blur-sm border-2 border-red-200 shadow-2xl rounded-xl p-6">
            <h2 className="text-xl font-bold text-red-600 mb-2">Connection Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleConnect} className="w-full">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // If already authenticated, show voting test
  if (isAuthenticated && user) {
    return (
      <div className="h-full bg-gradient-to-br from-[#ff6b35] via-[#ffd23f] to-[#06d6a0] p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white/95 backdrop-blur-sm border-2 border-[#ff6b35]/20 shadow-2xl rounded-xl p-6 mb-4">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={user.pfpUrl} 
                alt={user.displayName}
                className="w-12 h-12 rounded-full border-2 border-[#ff6b35]"
              />
              <div>
                <h2 className="font-bold text-lg">{user.displayName}</h2>
                <p className="text-sm text-gray-600">@{user.username}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Welcome to Vendor Wars! You&apos;re now connected with your Farcaster account.
            </p>
          </div>
          
          <VotingTest />
        </div>
      </div>
    )
  }

  // If not authenticated, show the main page
  return (
    <main className="min-h-screen">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="skeleton w-32 h-32 rounded-full"></div>
        </div>
      }>
        {isSDKLoaded && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm z-50">
            Mini App Ready
          </div>
        )}
        
        <div className="h-full bg-gradient-to-br from-[#ff6b35] via-[#ffd23f] to-[#06d6a0] relative overflow-hidden">
          {/* Barrio-Inspired Background Art */}
          <div className="absolute inset-0 opacity-15">
            {/* Food Stand Icons */}
            <div className="absolute top-16 left-8 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-2xl">🌮</span>
            </div>
            <div className="absolute top-32 right-12 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg animate-pulse delay-300">
              <span className="text-2xl">🫓</span>
            </div>
            <div className="absolute bottom-40 left-16 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg animate-pulse delay-500">
              <span className="text-2xl">🥟</span>
            </div>
            <div className="absolute bottom-32 right-8 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg animate-pulse delay-700">
              <span className="text-2xl">🍜</span>
            </div>
          </div>

          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 py-8">
              <div className="text-center space-y-6">
                {/* Logo/Title */}
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-[#ff6b35]">
                    <span className="text-4xl">⚔️</span>
                  </div>
                  <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                    Vendor Wars
                  </h1>
                  <p className="text-xl text-white/90 font-medium">
                    Fight for Your Barrio!
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  {features.map((feature, index) => (
                    <div key={index} className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center">
                          {feature.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                          <p className="text-white/80 text-xs">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 space-y-4">
              <Button
                onClick={handleConnect}
                disabled={isConnecting || !isSDKLoaded}
                className="w-full bg-white text-[#ff6b35] hover:bg-white/90 font-bold text-lg py-4 rounded-xl shadow-2xl border-2 border-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? 'Connecting...' : 'Connect with Farcaster'}
              </Button>
              
              <Button
                onClick={() => setShowTutorial(true)}
                variant="outline"
                className="w-full bg-transparent border-2 border-white/30 text-white hover:bg-white/10 font-medium py-3 rounded-xl"
              >
                Learn How It Works
              </Button>
            </div>

            {/* Voting System Test */}
            {isAuthenticated && (
              <div className="p-6 bg-white/10 backdrop-blur-sm">
                <VotingTest />
              </div>
            )}
          </div>
        </div>
      </Suspense>
    </main>
  )
}

