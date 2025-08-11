import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { ZoneService } from '@/services/zones'
import { VendorService } from '@/services/vendors'
import { getZoneIdFromSlug } from '@/lib/route-utils'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Trophy, Users, TrendingUp, Calendar, Star, Coins, Shield, Target, Award } from 'lucide-react'
import Link from 'next/link'

interface ZoneVendor {
  id: string
  name: string
  imageUrl: string
  position: number
  totalVotes: number
  winRate: number
  battleTokens: number
  owner: {
    username: string
    displayName: string
    pfpUrl: string
  }
}

interface BattleLogEntry {
  id: string
  date: string
  challenger: string
  opponent: string
  winner: string
  votes: number
  category: string
}

interface ZonePageProps {
  params: Promise<{
    id: string
  }>
}

async function getZoneData(zoneId: string) {
  try {
    // Try to get zone ID from slug first
    const actualZoneId = getZoneIdFromSlug(zoneId) || zoneId
    
    const zone = await ZoneService.getZone(actualZoneId)
    if (!zone) {
      return null
    }

    // Get vendors for this zone
    const vendors = await VendorService.getVendorsByZone(zone.id)
    
    // Get top 5 vendors for the map
    const topVendors = vendors
      .sort((a, b) => b.stats.currentZoneRank - a.stats.currentZoneRank)
      .slice(0, 5)
      .map((vendor, index) => ({
        id: vendor.id,
        name: vendor.name,
        imageUrl: vendor.imageUrl,
        position: index + 1,
        totalVotes: vendor.stats.totalVotes,
        winRate: vendor.stats.winRate,
        battleTokens: vendor.stats.totalRevenue,
        owner: {
          username: vendor.owner.username,
          displayName: vendor.owner.displayName,
          pfpUrl: vendor.owner.pfpUrl
        }
      }))

    // Generate dynamic battle log based on zone activity
    const battleLog: BattleLogEntry[] = generateBattleLog(zone, vendors)

    return {
      zone,
      vendors,
      topVendors,
      battleLog
    }
  } catch (error) {
    console.error('Error fetching zone data:', error)
    return null
  }
}

// Generate dynamic battle log based on zone data
function generateBattleLog(zone: any, vendors: any[]): BattleLogEntry[] {
  if (vendors.length < 2) {
    return []
  }

  const battleLog: BattleLogEntry[] = []
  const categories = ['pupusas', 'tacos', 'bebidas', 'otros']
  
  // Generate recent battles based on vendor activity
  for (let i = 0; i < Math.min(3, vendors.length - 1); i++) {
    const challenger = vendors[i]
    const opponent = vendors[i + 1]
    
    battleLog.push({
      id: `battle-${i + 1}`,
      date: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      challenger: challenger.name,
      opponent: opponent.name,
      winner: challenger.stats.totalVotes > opponent.stats.totalVotes ? challenger.name : opponent.name,
      votes: challenger.stats.totalVotes + opponent.stats.totalVotes,
      category: categories[i % categories.length]
    })
  }
  
  return battleLog
}

function getTierIcon(tier: string) {
  switch (tier) {
    case 'gold':
      return <Trophy className="w-4 h-4 text-yellow-500" />
    case 'silver':
      return <Award className="w-4 h-4 text-gray-400" />
    case 'bronze':
      return <Target className="w-4 h-4 text-orange-600" />
    default:
      return <Star className="w-4 h-4 text-gray-400" />
  }
}

function ZonePageContent({ zoneId }: { zoneId: string }) {
  return (
    <Suspense fallback={<div>Loading zone...</div>}>
      <ZonePageAsync zoneId={zoneId} />
    </Suspense>
  )
}

async function ZonePageAsync({ zoneId }: { zoneId: string }) {
  const data = await getZoneData(zoneId)
  
  if (!data) {
    notFound()
  }

  const { zone, vendors, topVendors, battleLog } = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Hero Section */}
      <div className="relative h-32 bg-gradient-to-r from-orange-500 to-yellow-500">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-1">{zone.name}</h1>
            <p className="text-lg opacity-90">{zone.description}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-4">
        {/* Back Arrow Button */}
        <div className="mb-6">
          <Link href="/map">
            <Button variant="outline" size="icon" className="w-10 h-10 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Complete Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Complete Leaderboard
                </CardTitle>
                <CardDescription>
                  All vendors in {zone.name} ranked by performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendors.length > 0 ? (
                    vendors.map((vendor, index) => (
                      <Link key={vendor.id} href={`/vendors/${vendor.id}`}>
                        <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-orange-50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="relative">
                              <span className="text-2xl font-bold text-gray-400 w-8 text-center">
                                {index + 1}
                              </span>
                              {index < 3 && (
                                <Trophy className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                            <Avatar className="w-12 h-12">
                              <img src={vendor.imageUrl} alt={vendor.name} />
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg truncate">{vendor.name}</h3>
                              <p className="text-sm text-gray-600">@{vendor.owner.username}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <div className="font-semibold">{vendor.stats.totalVotes}</div>
                              <div className="text-gray-500">Votes</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold">{vendor.stats.winRate}%</div>
                              <div className="text-gray-500">Win Rate</div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No vendors in this zone yet</p>
                      <p className="text-sm">Be the first to register a vendor!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Zone Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Zone Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Heat Level</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-red-500" />
                    <span className="font-semibold">{zone.heatLevel}/100</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Votes</span>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold">{zone.totalVotes.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Vendors</span>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="font-semibold">{zone.activeVendors}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Zone Territory Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Zone Territory Map
                </CardTitle>
                <CardDescription>
                  Top {topVendors.length} vendors currently controlling this zone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg border-2 border-dashed border-green-300">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <MapPin className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Interactive map coming soon</p>
                    </div>
                  </div>
                  
                  {/* Vendor markers */}
                  {topVendors.map((vendor, index) => (
                    <div
                      key={vendor.id}
                      className="absolute"
                      style={{
                        left: `${20 + (index * 15)}%`,
                        top: `${30 + (index * 10)}%`
                      }}
                    >
                      <div className="relative">
                        <Avatar className="w-8 h-8 border-2 border-white shadow-lg">
                          <img src={vendor.imageUrl} alt={vendor.name} />
                        </Avatar>
                        <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {vendor.position}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Battle Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Battle Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {battleLog.length > 0 ? (
                    battleLog.map((battle) => (
                      <div key={battle.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{battle.challenger}</span>
                          <span className="text-green-600 font-bold">W</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>vs {battle.opponent}</span>
                          <span>{battle.votes} votes</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(battle.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">No recent battles</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Zone Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Zone Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <MapPin className="w-4 h-4 mr-2" />
                  View on Map
                </Button>
                <Button className="w-full" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Join Zone
                </Button>
                <Button className="w-full" variant="outline">
                  <Trophy className="w-4 h-4 mr-2" />
                  Challenge Leader
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function ZonePage({ params }: ZonePageProps) {
  const resolvedParams = await params
  return <ZonePageContent zoneId={resolvedParams.id} />
} 