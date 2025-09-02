'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trophy, Users, Target, Shield, AlertCircle } from 'lucide-react'
import { VoteResultModal } from '@/components/VoteResultModal'
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { VendorStatsRefresh } from '@/components/vendor-stats-refresh'
import type { Vendor } from '@/types'
import { getVendorIdFromSlug } from '@/lib/route-utils'

interface TopVoter {
  id: string
  username: string
  displayName: string
  avatar: string
  votesGiven: number
  totalVotes: number
  isVerified: boolean
}

export default function VendorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user: authenticatedUser, isAuthenticated, isLoading } = useFarcasterAuth()
  const { refreshBalance } = useTokenBalance()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'rewards' | 'supporters'>('about')
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [voteResult, setVoteResult] = useState<{
    vendor: { name: string; imageUrl: string }
    battleTokens: number
    isVerified: boolean
  } | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [topVoters, setTopVoters] = useState<TopVoter[]>([])
  const [loadingTopVoters, setLoadingTopVoters] = useState(false)
  const [vendorStats, setVendorStats] = useState<any>(null)

  const fetchVendor = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Try to get vendor ID from slug first
      const actualVendorId = getVendorIdFromSlug(id) || id
      
      const response = await fetch(`/api/vendors/${actualVendorId}`)
      const result = await response.json()
      
      if (result.success) {
        setVendor(result.data)
      } else {
        setError(result.error || 'Vendor not found')
      }
    } catch (error) {
      console.error('Error fetching vendor:', error)
      setError('Failed to load vendor')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadTopVoters = useCallback(async () => {
    if (!vendor) return
    
    setLoadingTopVoters(true)
    try {
      const voters = await getTopVoters(vendor)
      setTopVoters(voters)
    } catch (error) {
      console.error('Error loading top voters:', error)
    } finally {
      setLoadingTopVoters(false)
    }
  }, [vendor])

  // Load vendor data
  useEffect(() => {
    const loadVendor = async () => {
      const resolvedParams = await params
      fetchVendor(resolvedParams.id)
    }
    loadVendor()
  }, [params, fetchVendor])

  // Load top voters when vendor is loaded
  useEffect(() => {
    if (vendor) {
      loadTopVoters()
    }
  }, [vendor, loadTopVoters])

  const handleVote = async (isVerified: boolean = false) => {
    if (!vendor || !authenticatedUser) return
    
    setIsVoting(true)
    setError(null) // Clear previous errors
    
    try {
      console.log('🗳️ Submitting vote for vendor:', vendor.id, vendor.name)
      
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId: vendor.id,
          userFid: authenticatedUser.fid.toString(),
          voteType: isVerified ? 'verified' : 'regular',
          // For verified votes, we'll need photo data in the future
          photoUrl: isVerified ? 'https://example.com/photo.jpg' : undefined,
          gpsLocation: isVerified ? { lat: 19.4326, lng: -99.1332 } : undefined,
          // Send Farcaster user data for user creation/update
          farcasterUser: {
            username: authenticatedUser.username,
            displayName: authenticatedUser.displayName,
            pfpUrl: authenticatedUser.pfpUrl,
            bio: authenticatedUser.bio,
            followerCount: authenticatedUser.followerCount,
            followingCount: authenticatedUser.followingCount,
            verifiedAddresses: authenticatedUser.verifiedAddresses
          }
        }),
      })

      const result = await response.json()
      console.log('🗳️ Vote response:', result)
      
      if (result.success) {
        setVoteResult({
          vendor: {
            name: vendor.name,
            imageUrl: vendor.imageUrl || 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=300&fit=crop'
          },
          battleTokens: result.data.tokensEarned,
          isVerified
        })
        setShowVoteModal(true)
        refreshBalance() // Refresh token balance
        
        // Don't refresh vendor data immediately to avoid modal re-render
        // The stats will be updated when the user closes the modal
      } else {
        console.error('❌ Vote failed:', result.error)
        setError(result.error || 'Vote failed')
      }
    } catch (error) {
      console.error('❌ Error submitting vote:', error)
      setError('Failed to submit vote. Please try again.')
    } finally {
      setIsVoting(false)
    }
  }

  const handleCloseVoteModal = () => {
    setShowVoteModal(false)
    setVoteResult(null)
    
    // Actualizar con delay para evitar re-render del modal
    setTimeout(() => {
      if (vendor) {
        fetchVendor(vendor.id)
        loadTopVoters()
      }
    }, 100)
  }

  // Generate dynamic top voters based on vendor data
  const getTopVoters = async (vendor: Vendor): Promise<TopVoter[]> => {
    try {
      console.log('🔍 Fetching top voters for vendor:', vendor.id)
      // Fetch real top voters from the database
      const response = await fetch(`/api/votes?vendorId=${vendor.id}`)
      const result = await response.json()
      
      console.log('🔍 Votes API response:', result)
      
      if (result.success && result.data && result.data.votes) {
        // Group votes by user and calculate totals
        const userVotes: { [key: string]: any[] } = {}
        
        result.data.votes.forEach((vote: any) => {
          if (!userVotes[vote.voter_fid]) {
            userVotes[vote.voter_fid] = []
          }
          userVotes[vote.voter_fid].push(vote)
        })

        // Convert to TopVoter format
        const topVoters = Object.entries(userVotes)
          .map(([fid, votes]) => {
            const user = votes[0].users
            // Use Farcaster info if this is the authenticated user
            const isAuthenticatedUser = authenticatedUser && fid === authenticatedUser.fid.toString()
            const voterData = {
              id: fid,
              username: isAuthenticatedUser ? authenticatedUser.username : (user?.username || `user_${fid}`),
              displayName: isAuthenticatedUser ? authenticatedUser.displayName : (user?.display_name || `User ${fid}`),
              avatar: isAuthenticatedUser ? authenticatedUser.pfpUrl : (user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fid}`),
              votesGiven: votes.length,
              totalVotes: votes.length,
              isVerified: votes.some((vote: any) => vote.is_verified)
            }
            console.log(`🔍 TopVoter ${fid}:`, voterData)
            return voterData
          })
          .sort((a, b) => b.votesGiven - a.votesGiven)
          .slice(0, 3)

        return topVoters
      }
    } catch (error) {
      console.error('Error fetching top voters:', error)
    }

    // Fallback to empty array if no data available
    return []
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff8f0] to-[#f4f1eb] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35] mx-auto mb-4"></div>
          <p className="text-[#2d1810] font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // Show authentication required state
  if (!isAuthenticated || !authenticatedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff8f0] to-[#f4f1eb] flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#ff6b35]/20 text-center max-w-md mx-4">
          <h2 className="text-xl font-bold text-[#2d1810] mb-2">Authentication Required</h2>
          <p className="text-[#6b5d52] text-sm mb-4">Please connect your Farcaster account to vote for vendors.</p>
          <Button
            onClick={() => router.push('/')}
            className="bg-[#ff6b35] hover:bg-[#e5562e] text-white font-medium py-3 rounded-xl shadow-lg"
          >
            Connect Farcaster
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendor profile...</p>
        </div>
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Vendor not found</h3>
          <p className="text-gray-600 mb-4">{error || "The vendor you're looking for doesn't exist"}</p>
          <Button onClick={() => router.push('/vendors')} variant="outline">
            Back to Vendors
          </Button>
        </div>
      </div>
    )
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
          <h2 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12 break-words">
            {vendor.name}
          </h2>
        </div>

        {/* Hero Image */}
        <div className="@container">
          <div className="@[480px]:px-4 @[480px]:py-3">
            <div
              className="bg-cover bg-center flex flex-col justify-end overflow-hidden bg-white @[480px]:rounded-xl min-h-[218px]"
              style={{
                backgroundImage: `url("${vendor.imageUrl || 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=300&fit=crop'}")`
              }}
            >
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between bg-[#f5f3f0] rounded-xl p-4">
            <div className="flex items-center gap-3">
              {vendor.isVerified ? (
                <>
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-700">Verified Vendor</p>
                    <p className="text-xs text-green-600">This vendor has been verified by our team</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-orange-700">Unverified Vendor</p>
                    <p className="text-xs text-orange-600">This vendor hasn&apos;t been verified yet</p>
                  </div>
                </>
              )}
            </div>
            
            {/* Show verification button only to owner */}
            {authenticatedUser && vendor.owner?.fid === authenticatedUser.fid && !vendor.isVerified && (
              <Button
                onClick={() => router.push(`/vendors/${vendor.id}/verify`)}
                className="bg-[#ee8c0b] hover:bg-[#d67d0a] text-white text-sm px-4 py-2 rounded-lg"
              >
                Verify Vendor
              </Button>
            )}
          </div>
        </div>

        {/* Action Buttons - Moved to top for better visibility */}
        <div className="px-4 py-4 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200">
          <div className="flex gap-3 justify-between max-w-md mx-auto">
            <Button
              onClick={() => handleVote(false)}
              disabled={isVoting || !authenticatedUser}
              className="flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-[#f2920c] text-[#181511] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#e0850b] shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="truncate">
                {isVoting ? 'Voting...' : authenticatedUser ? 'Vote & Support' : 'Login to Vote'}
              </span>
            </Button>
            <Button
              onClick={() => handleVote(true)}
              disabled={isVoting || !authenticatedUser}
              variant="outline"
              className="flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-[#f5f3f0] text-[#181511] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#ebe8e4] border-[#f5f3f0] shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="truncate">
                {isVoting ? 'Voting...' : authenticatedUser ? 'Verified Vote' : 'Login to Vote'}
              </span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="pb-3">
          <div className="flex border-b border-[#e6e1db] px-4 gap-8">
            <button
              onClick={() => setActiveTab('about')}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                activeTab === 'about'
                  ? 'border-b-[#181511] text-[#181511]'
                  : 'border-b-transparent text-[#8a7960]'
              }`}
            >
              <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${
                activeTab === 'about' ? 'text-[#181511]' : 'text-[#8a7960]'
              }`}>
                About
              </p>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                activeTab === 'reviews'
                  ? 'border-b-[#181511] text-[#181511]'
                  : 'border-b-transparent text-[#8a7960]'
              }`}
            >
              <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${
                activeTab === 'reviews' ? 'text-[#181511]' : 'text-[#8a7960]'
              }`}>
                Reviews
              </p>
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                activeTab === 'rewards'
                  ? 'border-b-[#181511] text-[#181511]'
                  : 'border-b-transparent text-[#8a7960]'
              }`}
            >
              <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${
                activeTab === 'rewards' ? 'text-[#181511]' : 'text-[#8a7960]'
              }`}>
                Rewards
              </p>
            </button>
            <button
              onClick={() => setActiveTab('supporters')}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                activeTab === 'supporters'
                  ? 'border-b-[#181511] text-[#181511]'
                  : 'border-b-transparent text-[#8a7960]'
              }`}
            >
              <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${
                activeTab === 'supporters' ? 'text-[#181511]' : 'text-[#8a7960]'
              }`}>
                Supporters
              </p>
            </button>
          </div>
        </div>

        {/* About Tab Content */}
        {activeTab === 'about' && (
          <div>
            <h3 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
              Zone
            </h3>
            <p className="text-[#181511] text-base font-normal leading-normal pb-3 pt-1 px-4">
              {vendor.zone || 'Zone information'}
            </p>
            
            <h3 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
              Category
            </h3>
            <p className="text-[#181511] text-base font-normal leading-normal pb-3 pt-1 px-4">
              {vendor.category}
            </p>
            
            <h3 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
              Description
            </h3>
            <p className="text-[#181511] text-base font-normal leading-normal pb-3 pt-1 px-4">
              {vendor.description}
            </p>
            
            <h3 className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
              Stats
            </h3>
            <div className="px-4 pb-3 pt-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-sm text-orange-600">Total Votes</div>
                  <div className="text-lg font-bold text-orange-800">{vendor.stats.totalVotes}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-green-600">Win Rate</div>
                  <div className="text-lg font-bold text-green-800">{vendor.stats.winRate}%</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-blue-600">Verified Votes</div>
                  <div className="text-lg font-bold text-blue-800">{vendor.stats.verifiedVotes}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-sm text-purple-600">Total Battles</div>
                  <div className="text-lg font-bold text-purple-800">{vendor.stats.totalBattles}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab Content */}
        {activeTab === 'reviews' && (
          <div className="px-4 py-6">
            <p className="text-[#181511] text-base font-normal leading-normal">
              Reviews coming soon...
            </p>
          </div>
        )}

        {/* Rewards Tab Content */}
        {activeTab === 'rewards' && (
          <div className="px-4 py-6">
            <p className="text-[#181511] text-base font-normal leading-normal">
              Rewards system coming soon...
            </p>
          </div>
        )}

        {/* Supporters Tab Content */}
        {activeTab === 'supporters' && (
          <div className="px-4 py-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200/50">
              <h3 className="font-bold text-[#2d1810] mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-[#ffd23f]" />
                Top Supporters
              </h3>
              <div className="space-y-3">
                {topVoters.map((voter, index) => (
                  <div 
                    key={voter.id}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-white/80 backdrop-blur-sm border border-orange-200/30 hover:bg-white/90 transition-colors"
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        #{index + 1}
                      </div>
                    </div>

                    {/* User Avatar */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-200">
                        <img 
                          src={voter.avatar} 
                          alt={voter.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {voter.isVerified && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-[#2d1810] text-sm truncate">{voter.displayName}</h4>
                        {voter.isVerified && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-[#6b5d52]">
                        <div className="flex items-center space-x-1">
                          <Target className="w-3 h-3" />
                          <span>{voter.votesGiven} votes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{voter.totalVotes} total</span>
                        </div>
                      </div>
                    </div>

                    {/* Vote Percentage */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-sm font-semibold text-[#2d1810]">
                        {Math.round((voter.votesGiven / voter.totalVotes) * 100)}%
                      </div>
                      <div className="text-xs text-[#6b5d52]">of votes</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vote Result Modal */}
      {voteResult && (
        <VoteResultModal
          isOpen={showVoteModal}
          onClose={handleCloseVoteModal}
          vendor={voteResult.vendor}
          battleTokens={voteResult.battleTokens}
          isVerified={voteResult.isVerified}
        />
      )}

      {/* Vendor Stats Refresh Component */}
      {vendor && (
        <VendorStatsRefresh
          vendorId={vendor.id}
          onStatsUpdate={setVendorStats}
          enabled={!!vendor}
        />
      )}
    </div>
  )
} 