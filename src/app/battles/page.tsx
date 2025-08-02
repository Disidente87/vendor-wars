'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatNumber, formatRelativeTime } from '@/lib/utils'
import { Sword, Users, Clock, Trophy, Target, TrendingUp } from 'lucide-react'
import type { Battle, BattleStatus } from '@/types'

export default function BattlesPage() {
  const [battles, setBattles] = useState<Battle[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active')

  useEffect(() => {
    fetchBattles()
  }, [activeTab])

  const fetchBattles = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/battles?status=${activeTab}`)
      const result = await response.json()
      
      if (result.success) {
        setBattles(result.data)
      }
    } catch (error) {
      console.error('Error fetching battles:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: BattleStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: BattleStatus) => {
    switch (status) {
      case 'active':
        return <Target className="h-4 w-4" />
      case 'completed':
        return <Trophy className="h-4 w-4" />
      case 'cancelled':
        return <Clock className="h-4 w-4" />
      default:
        return <Sword className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading battles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Battle Arena
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Watch epic battles unfold and vote for your favorites
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'active'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Active Battles</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'completed'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Trophy className="h-4 w-4" />
                <span>Completed Battles</span>
              </div>
            </button>
          </div>
        </div>

        {/* Battles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {battles.map((battle) => (
            <Card key={battle.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(battle.status)}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(battle.status)}`}>
                      {battle.status.charAt(0).toUpperCase() + battle.status.slice(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatRelativeTime(battle.startDate)}
                  </span>
                </div>
                <CardTitle className="text-lg">{battle.description}</CardTitle>
                <CardDescription>
                  {battle.category.charAt(0).toUpperCase() + battle.category.slice(1)} Category
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {/* Battle Participants */}
                <div className="flex items-center justify-between mb-6">
                  {/* Challenger */}
                  <div className="flex-1 text-center">
                    <Avatar className="h-16 w-16 mx-auto mb-2">
                      <AvatarImage src={battle.challenger.imageUrl} alt={battle.challenger.name} />
                      <AvatarFallback>{battle.challenger.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-sm">{battle.challenger.name}</h3>
                    <p className="text-xs text-gray-500">@{battle.challenger.owner.username}</p>
                    <div className="mt-1 text-xs text-gray-600">
                      {battle.challenger.stats.winRate}% win rate
                    </div>
                  </div>

                  {/* VS */}
                  <div className="flex flex-col items-center mx-4">
                    <div className="text-2xl font-bold text-purple-600">VS</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {battle.totalVotes} votes
                    </div>
                  </div>

                  {/* Opponent */}
                  <div className="flex-1 text-center">
                    <Avatar className="h-16 w-16 mx-auto mb-2">
                      <AvatarImage src={battle.opponent.imageUrl} alt={battle.opponent.name} />
                      <AvatarFallback>{battle.opponent.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-sm">{battle.opponent.name}</h3>
                    <p className="text-xs text-gray-500">@{battle.opponent.owner.username}</p>
                    <div className="mt-1 text-xs text-gray-600">
                      {battle.opponent.stats.winRate}% win rate
                    </div>
                  </div>
                </div>

                {/* Battle Stats */}
                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                  <div>
                    <div className="text-lg font-semibold text-purple-600">
                      {battle.totalVotes}
                    </div>
                    <div className="text-xs text-gray-500">Total Votes</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-blue-600">
                      {battle.challenger.stats.totalBattles + battle.opponent.stats.totalBattles}
                    </div>
                    <div className="text-xs text-gray-500">Combined Battles</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-600">
                      {formatNumber(battle.challenger.stats.totalRevenue + battle.opponent.stats.totalRevenue)}
                    </div>
                    <div className="text-xs text-gray-500">Combined Revenue</div>
                  </div>
                </div>

                {/* Winner Display */}
                {battle.status === 'completed' && battle.winner && (
                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center space-x-2">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">
                        Winner: {battle.winner.name}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    View Details
                  </Button>
                  {battle.status === 'active' && (
                    <Button size="sm" variant="outline">
                      Vote Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {battles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Sword className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} battles found
            </h3>
            <p className="text-gray-600">
              {activeTab === 'active' 
                ? 'Check back later for new battles or create one yourself!'
                : 'Completed battles will appear here once they finish.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 