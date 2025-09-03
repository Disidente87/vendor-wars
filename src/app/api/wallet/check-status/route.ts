import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userFid = searchParams.get('userFid')

    if (!userFid) {
      return NextResponse.json(
        { success: false, error: 'userFid parameter is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 API: Checking token distribution status for user ${userFid}`)

    // Check for pending distributions
    const { data: pendingVotes, error: pendingError } = await supabase
      .from('votes')
      .select('id, token_reward, created_at')
      .eq('voter_fid', parseInt(userFid))
      .eq('distribution_status', 'pending')
      .order('created_at', { ascending: true })

    if (pendingError) {
      console.error('❌ API: Error fetching pending votes:', pendingError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch pending distributions' },
        { status: 500 }
      )
    }

    // Check for failed distributions
    const { data: failedVotes, error: failedError } = await supabase
      .from('votes')
      .select('id, token_reward, created_at, distribution_error')
      .eq('voter_fid', parseInt(userFid))
      .eq('distribution_status', 'failed')
      .order('created_at', { ascending: true })

    if (failedError) {
      console.error('❌ API: Error fetching failed votes:', failedError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch failed distributions' },
        { status: 500 }
      )
    }

    const hasPendingTokens = pendingVotes && pendingVotes.length > 0
    const hasFailedTokens = failedVotes && failedVotes.length > 0
    const pendingCount = pendingVotes?.length || 0
    const failedCount = failedVotes?.length || 0
    const totalPendingTokens = pendingVotes?.reduce((sum, vote) => sum + vote.token_reward, 0) || 0
    const totalFailedTokens = failedVotes?.reduce((sum, vote) => sum + vote.token_reward, 0) || 0

    console.log(`📊 API: Status check results:`)
    console.log(`   Pending: ${pendingCount} votes (${totalPendingTokens} tokens)`)
    console.log(`   Failed: ${failedCount} votes (${totalFailedTokens} tokens)`)

    return NextResponse.json({
      success: true,
      data: {
        hasPendingTokens,
        hasFailedTokens,
        pendingCount,
        failedCount,
        totalPendingTokens,
        totalFailedTokens,
        pendingVotes: pendingVotes || [],
        failedVotes: failedVotes || []
      }
    })

  } catch (error) {
    console.error('❌ API: Error checking token status:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}
