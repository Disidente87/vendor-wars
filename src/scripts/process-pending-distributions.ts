import { createClient } from '@supabase/supabase-js'

// Script to process pending token distributions for existing users
async function processPendingDistributions() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('🔄 Processing pending token distributions...\n')

  try {
    // 1. Get all users with pending distributions
    const { data: pendingVotes, error: votesError } = await supabase
      .from('votes')
      .select(`
        id,
        voter_fid,
        vendor_id,
        token_reward,
        distribution_status,
        created_at,
        users!inner(fid, username, display_name, wallet_address)
      `)
      .eq('distribution_status', 'pending')
      .order('created_at', { ascending: true })

    if (votesError) {
      console.error('❌ Error fetching pending votes:', votesError)
      return
    }

    if (!pendingVotes || pendingVotes.length === 0) {
      console.log('✅ No pending distributions found')
      return
    }

    console.log(`📦 Found ${pendingVotes.length} pending distributions:`)
    console.log('='.repeat(80))

    // Group by user
    const userGroups = pendingVotes.reduce((groups: any, vote: any) => {
      const fid = vote.voter_fid
      if (!groups[fid]) {
        groups[fid] = {
          user: vote.users,
          votes: []
        }
      }
      groups[fid].votes.push(vote)
      return groups
    }, {})

    // Process each user
    for (const [fid, group] of Object.entries(userGroups)) {
      const user = (group as any).user
      const votes = (group as any).votes
      const walletAddresses = user.wallet_address || []
      const hasWallet = Array.isArray(walletAddresses) && walletAddresses.length > 0
      const primaryWallet = hasWallet ? walletAddresses[0] : null

      console.log(`👤 User ${fid}: ${user.username} (${user.display_name})`)
      console.log(`   Wallet: ${hasWallet ? `✅ ${primaryWallet}` : '❌ No wallet connected'}`)
      console.log(`   Pending votes: ${votes.length}`)
      console.log(`   Total pending tokens: ${votes.reduce((sum: number, vote: any) => sum + vote.token_reward, 0)}`)
      
      if (hasWallet) {
        console.log(`   🔄 This user can process their pending distributions by connecting their wallet`)
      } else {
        console.log(`   ⏳ This user needs to connect a wallet to receive their tokens`)
      }
      console.log('')
    }

    // Summary
    const totalPendingTokens = pendingVotes.reduce((sum: number, vote: any) => sum + vote.token_reward, 0)
    const usersWithWallets = Object.values(userGroups).filter((group: any) => {
      const walletAddresses = group.user.wallet_address || []
      return Array.isArray(walletAddresses) && walletAddresses.length > 0
    }).length

    console.log('📈 Summary:')
    console.log('='.repeat(80))
    console.log(`👥 Users with pending distributions: ${Object.keys(userGroups).length}`)
    console.log(`🔗 Users with wallets connected: ${usersWithWallets}`)
    console.log(`⏳ Users needing wallet connection: ${Object.keys(userGroups).length - usersWithWallets}`)
    console.log(`🗳️ Total pending votes: ${pendingVotes.length}`)
    console.log(`🎁 Total pending tokens: ${totalPendingTokens}`)

    console.log('\n💡 Next steps:')
    console.log('1. Users with wallets can connect to process their pending distributions')
    console.log('2. Users without wallets need to connect a wallet first')
    console.log('3. The wallet page now automatically saves wallet addresses and processes pending distributions')

  } catch (error) {
    console.error('❌ Error processing pending distributions:', error)
  }
}

// Run the script
processPendingDistributions()
  .then(() => {
    console.log('\n✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
