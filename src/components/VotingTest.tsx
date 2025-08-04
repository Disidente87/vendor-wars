'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDevAuth } from '@/hooks/useDevAuth'
import { useTokenBalance } from '@/hooks/useTokenBalance'

export function VotingTest() {
  const { user: authenticatedUser } = useDevAuth()
  const { balance, refreshBalance } = useTokenBalance()
  const [isVoting, setIsVoting] = useState(false)
  const [lastVoteResult, setLastVoteResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testVendor = {
    id: '772cdbda-2cbb-4c67-a73a-3656bf02a4c1',
    name: 'Pupusas María'
  }

  const handleVote = async (voteType: 'regular' | 'verified') => {
    if (!authenticatedUser) {
      setError('Please login to vote')
      return
    }

    setIsVoting(true)
    setError(null)
    setLastVoteResult(null)

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId: testVendor.id,
          userFid: authenticatedUser.fid.toString(),
          voteType,
          photoUrl: voteType === 'verified' ? 'https://example.com/photo.jpg' : undefined,
          gpsLocation: voteType === 'verified' ? { lat: 19.4326, lng: -99.1332 } : undefined
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setLastVoteResult(result.data)
        refreshBalance() // Refresh token balance
      } else {
        setError(result.error || 'Vote failed')
      }
    } catch (error) {
      console.error('Error submitting vote:', error)
      setError('Failed to submit vote. Please try again.')
    } finally {
      setIsVoting(false)
    }
  }

  if (!authenticatedUser) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Voting System Test</CardTitle>
          <CardDescription>Please login to test the voting system</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Voting System Test</CardTitle>
        <CardDescription>
          Test the voting system with {testVendor.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">{authenticatedUser.displayName}</p>
            <p className="text-sm text-gray-600">@{authenticatedUser.username}</p>
          </div>
          <Badge variant="secondary">
            {balance?.toLocaleString() || 0} $BATTLE
          </Badge>
        </div>

        {/* Voting Buttons */}
        <div className="space-y-2">
          <Button
            onClick={() => handleVote('regular')}
            disabled={isVoting}
            className="w-full"
          >
            {isVoting ? 'Voting...' : 'Vote Regular (5 tokens)'}
          </Button>
          
          <Button
            onClick={() => handleVote('verified')}
            disabled={isVoting}
            variant="outline"
            className="w-full"
          >
            {isVoting ? 'Voting...' : 'Vote Verified (15 tokens)'}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {lastVoteResult && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">Vote Successful!</p>
            <p className="text-green-600 text-sm">
              Tokens earned: {lastVoteResult.tokensEarned}
            </p>
            <p className="text-green-600 text-sm">
              New balance: {lastVoteResult.newBalance}
            </p>
            {lastVoteResult.streakBonus > 0 && (
              <p className="text-green-600 text-sm">
                Streak bonus: +{lastVoteResult.streakBonus}
              </p>
            )}
          </div>
        )}

        {/* Refresh Button */}
        <Button
          onClick={refreshBalance}
          variant="ghost"
          size="sm"
          className="w-full"
        >
          Refresh Balance
        </Button>
      </CardContent>
    </Card>
  )
} 