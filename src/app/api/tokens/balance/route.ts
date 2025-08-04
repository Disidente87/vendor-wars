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

    // Try to get from cache first
    let balance = await tokenManager.getUserTokens(userFid)

    // If not in cache, fetch from database
    if (balance === 0) {
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
        // Cache the result
        await tokenManager.updateUserTokens(userFid, balance)
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

    if (operation === 'add') {
      newBalance = await tokenManager.addTokens(userFid, amount)
    } else if (operation === 'subtract') {
      newBalance = await tokenManager.addTokens(userFid, -amount)
    } else {
      // set operation
      await tokenManager.updateUserTokens(userFid, amount)
      newBalance = amount
    }

    // Update database
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