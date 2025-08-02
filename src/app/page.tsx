import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FARCASTER_CONFIG } from '@/config/farcaster'
import { Sword, Trophy, Users, TrendingUp, Zap, Target, MapPin, Globe } from 'lucide-react'

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-900 via-red-900 to-yellow-900 text-white">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
              <Sword className="h-6 w-6 text-yellow-400" />
              <span className="text-lg font-semibold">Vendor Wars</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Fight for Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Local Shop
            </span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-300">
            Transform your pupusa purchases into territorial battles. Support local vendors, earn $BATTLE tokens, and become a neighborhood hero in the ultimate LATAM food culture competition.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-8 py-3 text-lg">
              <Zap className="mr-2 h-5 w-5" />
              Start Battle
            </Button>
            <Button className="border-white/20 text-white hover:bg-white/10 px-8 py-3 text-lg">
              <Trophy className="mr-2 h-5 w-5" />
              View Leaderboard
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  const stats = [
    { label: 'Active Battles', value: '24', icon: Target },
    { label: 'Local Vendors', value: '1,234', icon: Users },
    { label: 'Territories Won', value: '567', icon: Trophy },
    { label: 'Daily Votes', value: '8,901', icon: TrendingUp },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BattleZonesSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Zonas de Batalla - CDMX
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Five epic battle zones where vendors compete for territorial dominance
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FARCASTER_CONFIG.BATTLE_ZONES.map((zone) => (
            <Card key={zone.id} className="text-center hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" 
                     style={{ backgroundColor: zone.color }}>
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{zone.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{zone.description}</p>
                <div className="flex items-center justify-center text-xs text-gray-500">
                  <Globe className="h-4 w-4 mr-1" />
                  {zone.coordinates[0].toFixed(4)}, {zone.coordinates[1].toFixed(4)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function CategoriesSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Traditional LATAM Cuisine
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            From pupusas to tacos, tamales to tortas - every dish has its champions
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {FARCASTER_CONFIG.CATEGORIES.map((category) => (
            <Card key={category.id} className="text-center hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{category.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      title: 'Connect with Farcaster',
      description: 'Sign in with your Farcaster account to join the battle',
      icon: '🔗',
    },
    {
      title: 'Choose Your Zone',
      description: 'Select one of the five battle zones in CDMX',
      icon: '🗺️',
    },
    {
      title: 'Vote for Vendors',
      description: 'Support your favorite local vendors with votes and earn $BATTLE tokens',
      icon: '🗳️',
    },
    {
      title: 'Verify Purchases',
      description: 'Take photos of your real purchases for 3x token rewards',
      icon: '📸',
    },
    {
      title: 'Conquer Territories',
      description: 'Help vendors dominate zones and become neighborhood champions',
      icon: '👑',
    },
  ]

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Five simple steps to become a vendor legend in your neighborhood
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-2xl">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TokenEconomicsSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-orange-900 to-red-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl mb-4">
            $BATTLE Token Economics
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Earn tokens for supporting local vendors and participate in the community economy
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">10</div>
            <h3 className="text-lg font-semibold mb-2">Base Vote Reward</h3>
            <p className="text-gray-300">Earn 10 $BATTLE tokens for every vote</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">3x</div>
            <h3 className="text-lg font-semibold mb-2">Verified Purchase Bonus</h3>
            <p className="text-gray-300">Get 3x tokens for verified real purchases</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">50</div>
            <h3 className="text-lg font-semibold mb-2">Territory Conquest</h3>
            <p className="text-gray-300">Bonus tokens for helping vendors take new zones</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function CTAFooter() {
  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl mb-4">
          Ready to Fight for Your Local Shop?
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Join thousands of users supporting local vendors and preserving LATAM food culture.
        </p>
        <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-8 py-3 text-lg">
          <Sword className="mr-2 h-5 w-5" />
          Enter the Battle Arena
        </Button>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <HeroSection />
        <StatsSection />
        <BattleZonesSection />
        <CategoriesSection />
        <HowItWorksSection />
        <TokenEconomicsSection />
        <CTAFooter />
      </Suspense>
    </main>
  )
}
