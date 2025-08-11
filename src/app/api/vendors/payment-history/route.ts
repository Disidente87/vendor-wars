import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { baseSepolia } from 'viem/chains'
import { PAYMENT_CONFIG } from '@/config/payment'

// ABI para eventos del contrato VendorRegistration
const VENDOR_REGISTRATION_ABI = [
  'event VendorRegistered(address indexed user, string vendorData, string vendorId, uint256 timestamp)',
  'event TokensBurned(address indexed user, uint256 amount, uint256 timestamp)',
  'event TokensRefunded(address indexed user, uint256 amount, uint256 timestamp)',
  'function getUserVendorCount(address user) external view returns (uint256 dailyCount, uint256 weeklyCount, uint256 lastRegistrationTime)'
] as const

// Cliente público para Base Sepolia
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(PAYMENT_CONFIG.VENDOR_REGISTRATION.NETWORK.RPC_URL)
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('userAddress')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: 'userAddress es requerido' },
        { status: 400 }
      )
    }

    // Obtener estadísticas del usuario
    const userStats = await getUserVendorStats(userAddress)
    
    // Obtener historial de eventos
    const eventHistory = await getEventHistory(userAddress, limit, offset)

    return NextResponse.json({
      success: true,
      data: {
        userAddress,
        stats: userStats,
        history: eventHistory,
        pagination: {
          limit,
          offset,
          total: eventHistory.length
        }
      }
    })

  } catch (error) {
    console.error('Error obteniendo historial de pagos:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Obtener estadísticas del usuario
async function getUserVendorStats(userAddress: string) {
  try {
    const result = await publicClient.readContract({
      address: PAYMENT_CONFIG.VENDOR_REGISTRATION.ADDRESS as `0x${string}`,
      abi: VENDOR_REGISTRATION_ABI,
      functionName: 'getUserVendorCount',
      args: [userAddress as `0x${string}`]
    })

    const [dailyCount, weeklyCount, lastRegistrationTime] = result as [bigint, bigint, bigint]

    return {
      dailyCount: Number(dailyCount),
      weeklyCount: Number(weeklyCount),
      lastRegistrationTime: Number(lastRegistrationTime),
      canRegisterToday: Number(dailyCount) < PAYMENT_CONFIG.RATE_LIMITS.MAX_VENDORS_PER_DAY,
      canRegisterThisWeek: Number(weeklyCount) < PAYMENT_CONFIG.RATE_LIMITS.MAX_VENDORS_PER_WEEK,
      nextRegistrationTime: Number(lastRegistrationTime) + PAYMENT_CONFIG.RATE_LIMITS.COOLDOWN_PERIOD
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas del usuario:', error)
    return {
      dailyCount: 0,
      weeklyCount: 0,
      lastRegistrationTime: 0,
      canRegisterToday: true,
      canRegisterThisWeek: true,
      nextRegistrationTime: 0
    }
  }
}

// Obtener historial de eventos
async function getEventHistory(userAddress: string, limit: number, offset: number) {
  try {
    // Por ahora, retornar un array vacío para evitar errores de tipo
    // TODO: Implementar decodificación de eventos cuando esté disponible
    console.log('📝 Obteniendo historial de eventos para:', userAddress)
    
    return []
  } catch (error) {
    console.error('Error obteniendo historial de eventos:', error)
    return []
  }
}

// POST endpoint para filtrar historial
export async function POST(request: NextRequest) {
  try {
    const { userAddress, startDate, endDate, eventType, limit = 10, offset = 0 } = await request.json()

    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: 'userAddress es requerido' },
        { status: 400 }
      )
    }

    // Obtener historial filtrado
    const filteredHistory = await getFilteredEventHistory(
      userAddress,
      { startDate, endDate, eventType },
      limit,
      offset
    )

    return NextResponse.json({
      success: true,
      data: {
        userAddress,
        filters: { startDate, endDate, eventType },
        history: filteredHistory,
        pagination: {
          limit,
          offset,
          total: filteredHistory.length
        }
      }
    })

  } catch (error) {
    console.error('Error filtrando historial de pagos:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Obtener historial filtrado
async function getFilteredEventHistory(
  userAddress: string,
  filters: { startDate?: string; endDate?: string; eventType?: string },
  limit: number,
  offset: number
) {
  try {
    // Por ahora, retornar array vacío
    console.log('📝 Filtrando historial para:', userAddress, filters)
    
    return []
  } catch (error) {
    console.error('Error filtrando historial:', error)
    return []
  }
}
