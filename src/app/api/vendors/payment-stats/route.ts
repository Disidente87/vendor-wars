import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { baseSepolia } from 'viem/chains'
import { PAYMENT_CONFIG } from '@/config/payment'

// ABI para funciones del contrato VendorRegistration
const VENDOR_REGISTRATION_ABI = [
  'event VendorRegistered(address indexed user, string vendorData, string vendorId, uint256 timestamp)',
  'event TokensBurned(address indexed user, uint256 amount, uint256 timestamp)',
  'function getTotalVendors() external view returns (uint256)',
  'function getTotalTokensBurned() external view returns (uint256)',
  'function getDailyRegistrationCount(uint256 day) external view returns (uint256)',
  'function getWeeklyRegistrationCount(uint256 week) external view returns (uint256)'
] as const

// Cliente público para Base Sepolia
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(PAYMENT_CONFIG.VENDOR_REGISTRATION.NETWORK.RPC_URL)
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all' // all, daily, weekly, monthly
    const limit = parseInt(searchParams.get('limit') || '30')

    let stats

    switch (period) {
      case 'daily':
        stats = await getDailyStats(limit)
        break
      case 'weekly':
        stats = await getWeeklyStats(limit)
        break
      case 'monthly':
        stats = await getMonthlyStats(limit)
        break
      default:
        stats = await getAllStats()
    }

    return NextResponse.json({
      success: true,
      data: {
        period,
        timestamp: new Date().toISOString(),
        network: PAYMENT_CONFIG.VENDOR_REGISTRATION.NETWORK.NAME,
        contractAddress: PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS,
        stats
      }
    })

  } catch (error) {
    console.error('Error obteniendo estadísticas de pagos:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Obtener todas las estadísticas
async function getAllStats() {
  try {
    // Obtener estadísticas del contrato
    const [totalVendors, totalTokensBurned] = await Promise.all([
      publicClient.readContract({
        address: PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS as `0x${string}`,
        abi: VENDOR_REGISTRATION_ABI,
        functionName: 'getTotalVendors'
      }),
      publicClient.readContract({
        address: PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS as `0x${string}`,
        abi: VENDOR_REGISTRATION_ABI,
        functionName: 'getTotalTokensBurned'
      })
    ])

    // Obtener estadísticas de eventos recientes
    const recentEvents = await getRecentEventStats()

    return {
      totalVendors: Number(totalVendors),
      totalTokensBurned: Number(totalTokensBurned),
      totalValueBurned: Number(totalTokensBurned) / Math.pow(10, 18), // Convertir de wei a tokens
      recentActivity: recentEvents,
      rateLimits: PAYMENT_CONFIG.RATE_LIMITS,
      tokenInfo: {
        symbol: PAYMENT_CONFIG.BATTLE_TOKEN.SYMBOL,
        name: PAYMENT_CONFIG.BATTLE_TOKEN.NAME,
        requiredAmount: PAYMENT_CONFIG.BATTLE_TOKEN.REQUIRED_AMOUNT,
        decimals: PAYMENT_CONFIG.BATTLE_TOKEN.DECIMALS
      }
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas generales:', error)
    return {
      totalVendors: 0,
      totalTokensBurned: 0,
      totalValueBurned: 0,
      recentActivity: [],
      rateLimits: PAYMENT_CONFIG.RATE_LIMITS,
      tokenInfo: PAYMENT_CONFIG.BATTLE_TOKEN
    }
  }
}

// Obtener estadísticas diarias
async function getDailyStats(limit: number) {
  try {
    const stats = []
    const currentTime = Math.floor(Date.now() / 1000)
    const dayInSeconds = 24 * 60 * 60

    for (let i = 0; i < limit; i++) {
      const dayTimestamp = Math.floor((currentTime - (i * dayInSeconds)) / dayInSeconds) * dayInSeconds
      
      try {
        const count = await publicClient.readContract({
          address: PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS as `0x${string}`,
          abi: VENDOR_REGISTRATION_ABI,
          functionName: 'getDailyRegistrationCount',
          args: [BigInt(dayTimestamp)]
        })

        stats.push({
          date: new Date(dayTimestamp * 1000).toISOString().split('T')[0],
          timestamp: dayTimestamp,
          registrations: Number(count),
          tokensBurned: Number(count) * PAYMENT_CONFIG.BATTLE_TOKEN.REQUIRED_AMOUNT
        })
      } catch (error) {
        // Si hay error, asumir 0 registros
        stats.push({
          date: new Date(dayTimestamp * 1000).toISOString().split('T')[0],
          timestamp: dayTimestamp,
          registrations: 0,
          tokensBurned: 0
        })
      }
    }

    return stats.reverse() // Ordenar cronológicamente
  } catch (error) {
    console.error('Error obteniendo estadísticas diarias:', error)
    return []
  }
}

// Obtener estadísticas semanales
async function getWeeklyStats(limit: number) {
  try {
    const stats = []
    const currentTime = Math.floor(Date.now() / 1000)
    const weekInSeconds = 7 * 24 * 60 * 60

    for (let i = 0; i < limit; i++) {
      const weekTimestamp = Math.floor((currentTime - (i * weekInSeconds)) / weekInSeconds) * weekInSeconds
      
      try {
        const count = await publicClient.readContract({
          address: PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS as `0x${string}`,
          abi: VENDOR_REGISTRATION_ABI,
          functionName: 'getWeeklyRegistrationCount',
          args: [BigInt(weekTimestamp)]
        })

        stats.push({
          week: new Date(weekTimestamp * 1000).toISOString().split('T')[0],
          timestamp: weekTimestamp,
          registrations: Number(count),
          tokensBurned: Number(count) * PAYMENT_CONFIG.BATTLE_TOKEN.REQUIRED_AMOUNT
        })
      } catch (error) {
        // Si hay error, asumir 0 registros
        stats.push({
          week: new Date(weekTimestamp * 1000).toISOString().split('T')[0],
          timestamp: weekTimestamp,
          registrations: 0,
          tokensBurned: 0
        })
      }
    }

    return stats.reverse() // Ordenar cronológicamente
  } catch (error) {
    console.error('Error obteniendo estadísticas semanales:', error)
    return []
  }
}

// Obtener estadísticas mensuales
async function getMonthlyStats(limit: number) {
  try {
    const stats = []
    const currentDate = new Date()
    
    for (let i = 0; i < limit; i++) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthTimestamp = Math.floor(monthDate.getTime() / 1000)
      
      // Obtener eventos del mes
      const monthEvents = await getMonthEvents(monthDate)
      
      stats.push({
        month: monthDate.toISOString().slice(0, 7), // YYYY-MM
        timestamp: monthTimestamp,
        registrations: monthEvents.length,
        tokensBurned: monthEvents.length * PAYMENT_CONFIG.BATTLE_TOKEN.REQUIRED_AMOUNT,
        uniqueUsers: 0
      })
    }

    return stats.reverse() // Ordenar cronológicamente
  } catch (error) {
    console.error('Error obteniendo estadísticas mensuales:', error)
    return []
  }
}

// Obtener eventos de un mes específico
async function getMonthEvents(monthDate: Date) {
  try {
    // Por ahora, retornar array vacío para evitar errores de tipo
    // TODO: Implementar cuando decodeEventLog esté disponible
    console.log('📝 Obteniendo eventos del mes:', monthDate.toISOString().slice(0, 7))
    
    return []
  } catch (error) {
    console.error('Error obteniendo eventos del mes:', error)
    return []
  }
}

// Obtener estadísticas de eventos recientes
async function getRecentEventStats() {
  try {
    // Por ahora, retornar array vacío para evitar errores de tipo
    // TODO: Implementar cuando decodeEventLog esté disponible
    console.log('📝 Obteniendo estadísticas de eventos recientes')
    
    return []
  } catch (error) {
    console.error('Error obteniendo estadísticas de eventos recientes:', error)
    return []
  }
}
