import { NextRequest, NextResponse } from 'next/server'
import { tokenManager } from '@/lib/redis'
import { supabase } from '@/lib/supabase'

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

    let balance = 0

    // Try to get from cache first
    try {
      balance = await tokenManager.getUserTokens(userFid)
    } catch (error) {
      console.warn('⚠️ Redis not available, fetching from database only')
    }

    // If not in cache or Redis failed, fetch from database
    if (balance === 0) {
      try {
        const { data: user, error } = await supabase
          .from('users')
          .select('battle_tokens')
          .eq('fid', userFid)
          .single()

        if (error) {
          console.error('Error fetching user tokens:', error)
          balance = 0
        } else {
          balance = user?.battle_tokens || 0
          // Try to cache the result if Redis is available
          try {
            await tokenManager.updateUserTokens(userFid, balance)
          } catch (cacheError) {
            console.warn('⚠️ Could not cache balance in Redis')
          }
        }
      } catch (dbError) {
        console.error('Error accessing database:', dbError)
        balance = 0
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        userFid,
        balance,
        currency: 'BATTLE'
      }
    })

  } catch (error) {
    console.error('Error fetching token balance:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userFid, amount, operation = 'add' } = body

    if (!userFid || amount === undefined) {
      return NextResponse.json(
        { success: false, error: 'userFid and amount are required' },
        { status: 400 }
      )
    }

    if (!['add', 'subtract', 'set'].includes(operation)) {
      return NextResponse.json(
        { success: false, error: 'Invalid operation. Must be "add", "subtract", or "set"' },
        { status: 400 }
      )
    }

    let newBalance: number

    // Try Redis operations first
    try {
      if (operation === 'add') {
        newBalance = await tokenManager.addTokens(userFid, amount)
      } else if (operation === 'subtract') {
        newBalance = await tokenManager.addTokens(userFid, -amount)
      } else {
        // set operation
        await tokenManager.updateUserTokens(userFid, amount)
        newBalance = amount
      }
    } catch (redisError) {
      console.warn('⚠️ Redis not available, using database only')
      
      // Get current balance from database
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('battle_tokens')
        .eq('fid', userFid)
        .single()

      const currentBalance = user?.battle_tokens || 0

      if (operation === 'add') {
        newBalance = currentBalance + amount
      } else if (operation === 'subtract') {
        newBalance = Math.max(0, currentBalance - amount)
      } else {
        newBalance = amount
      }
    }

    // Update database
    try {
      const { error } = await supabase
        .from('users')
        .update({ battle_tokens: newBalance })
        .eq('fid', userFid)

      if (error) {
        console.error('Error updating user tokens in database:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to update database' },
          { status: 500 }
        )
      }
    } catch (dbError) {
      console.error('Error accessing database:', dbError)
      return NextResponse.json(
        { success: false, error: 'Failed to update database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        userFid,
        newBalance,
        operation,
        amount
      },
      message: 'Token balance updated successfully'
    })

  } catch (error) {
    console.error('Error updating token balance:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 