'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, TrendingUp, Users, Coins, Clock, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react'
import { PAYMENT_CONFIG } from '@/config/payment'

interface PaymentStats {
  totalVendors: number
  totalTokensBurned: number
  totalValueBurned: number
  recentActivity: Array<{
    date: string
    registrations: number
    uniqueUsers: number
    tokensBurned: number
  }>
  rateLimits: {
    MAX_VENDORS_PER_DAY: number
    MAX_VENDORS_PER_WEEK: number
    COOLDOWN_PERIOD: number
  }
  tokenInfo: {
    symbol: string
    name: string
    requiredAmount: number
    decimals: number
  }
}

interface UserStats {
  dailyCount: number
  weeklyCount: number
  lastRegistrationTime: number
  canRegisterToday: boolean
  canRegisterThisWeek: boolean
  nextRegistrationTime: number
}

interface PaymentDashboardProps {
  userAddress?: string
  className?: string
}

export function PaymentDashboard({ userAddress, className = '' }: PaymentDashboardProps) {
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'limits'>('overview')

  useEffect(() => {
    loadPaymentStats()
    if (userAddress) {
      loadUserStats()
    }
  }, [userAddress])

  const loadPaymentStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/vendors/payment-stats')
      const result = await response.json()

      if (result.success) {
        setStats(result.data.stats)
      } else {
        setError(result.error || 'Error cargando estadísticas')
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserStats = async () => {
    if (!userAddress) return

    try {
      const response = await fetch(`/api/vendors/payment-history?userAddress=${userAddress}`)
      const result = await response.json()

      if (result.success) {
        setUserStats(result.data.stats)
      }
    } catch (error) {
      console.error('Error cargando estadísticas del usuario:', error)
    }
  }

  const formatTimeRemaining = (timestamp: number): string => {
    const now = Math.floor(Date.now() / 1000)
    const remaining = timestamp - now
    
    if (remaining <= 0) return 'Disponible ahora'
    
    const minutes = Math.ceil(remaining / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m restantes`
    }
    return `${minutes}m restantes`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#ff6b35]" />
          <span>Cargando estadísticas...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className={`${className}`}>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!stats) {
    return (
      <Alert className={`${className}`}>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>No se pudieron cargar las estadísticas</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2d1810]">Dashboard de Pagos</h2>
          <p className="text-[#6b5d52]">Estadísticas del sistema de registro de vendors</p>
        </div>
        <Badge variant="outline" className="border-[#ff6b35] text-[#ff6b35]">
          {PAYMENT_CONFIG.VENDOR_REGISTRATION.NETWORK.NAME}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('overview')}
          className={activeTab === 'overview' ? 'bg-[#ff6b35] text-white' : ''}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Resumen
        </Button>
        <Button
          variant={activeTab === 'activity' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('activity')}
          className={activeTab === 'activity' ? 'bg-[#ff6b35] text-white' : ''}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Actividad
        </Button>
        <Button
          variant={activeTab === 'limits' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('limits')}
          className={activeTab === 'limits' ? 'bg-[#ff6b35] text-white' : ''}
        >
          <Clock className="w-4 h-4 mr-2" />
          Límites
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Vendors */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
              <Users className="h-4 w-4 text-[#ff6b35]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2d1810]">{stats.totalVendors}</div>
              <p className="text-xs text-[#6b5d52]">Registrados en blockchain</p>
            </CardContent>
          </Card>

          {/* Total Tokens Burned */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tokens Quemados</CardTitle>
              <Coins className="h-4 w-4 text-[#ff6b35]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2d1810]">
                {stats.totalValueBurned.toFixed(0)} {stats.tokenInfo.symbol}
              </div>
              <p className="text-xs text-[#6b5d52]">
                Valor total: ${(stats.totalValueBurned * 0.01).toFixed(2)} USD
              </p>
            </CardContent>
          </Card>

          {/* Rate Limits */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Límites por Usuario</CardTitle>
              <Clock className="h-4 w-4 text-[#ff6b35]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2d1810]">
                {stats.rateLimits.MAX_VENDORS_PER_DAY}/día
              </div>
              <p className="text-xs text-[#6b5d52]">
                {stats.rateLimits.MAX_VENDORS_PER_WEEK}/semana
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#2d1810]">Actividad Reciente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.recentActivity.map((day, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {formatDate(day.date)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6b5d52]">Registros:</span>
                    <span className="font-medium">{day.registrations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6b5d52]">Usuarios únicos:</span>
                    <span className="font-medium">{day.uniqueUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6b5d52]">Tokens:</span>
                    <span className="font-medium text-[#ff6b35]">
                      {day.tokensBurned} {stats.tokenInfo.symbol}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'limits' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-[#2d1810]">Límites del Sistema</h3>
          
          {/* Rate Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Límites de Registro</CardTitle>
              <CardDescription>
                Restricciones para prevenir spam y abuso del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Límite Diario</span>
                  <Badge variant="outline">
                    {stats.rateLimits.MAX_VENDORS_PER_DAY} vendors
                  </Badge>
                </div>
                <Progress 
                  value={(stats.totalVendors / (stats.rateLimits.MAX_VENDORS_PER_DAY * 100)) * 100} 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Límite Semanal</span>
                  <Badge variant="outline">
                    {stats.rateLimits.MAX_VENDORS_PER_WEEK} vendors
                  </Badge>
                </div>
                <Progress 
                  value={(stats.totalVendors / (stats.rateLimits.MAX_VENDORS_PER_WEEK * 100)) * 100} 
                  className="h-2"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Período de Cooldown</span>
                <Badge variant="outline">
                  {Math.floor(stats.rateLimits.COOLDOWN_PERIOD / 60000)} minutos
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* User Stats */}
          {userStats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tu Estado</CardTitle>
                <CardDescription>
                  Estadísticas de registro para tu dirección
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#2d1810]">
                      {userStats.dailyCount}
                    </div>
                    <div className="text-sm text-[#6b5d52]">Hoy</div>
                    <Badge 
                      variant={userStats.canRegisterToday ? 'default' : 'destructive'}
                      className="mt-1"
                    >
                      {userStats.canRegisterToday ? 'Puedes registrar' : 'Límite alcanzado'}
                    </Badge>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#2d1810]">
                      {userStats.weeklyCount}
                    </div>
                    <div className="text-sm text-[#6b5d52]">Esta semana</div>
                    <Badge 
                      variant={userStats.canRegisterThisWeek ? 'default' : 'destructive'}
                      className="mt-1"
                    >
                      {userStats.canRegisterThisWeek ? 'Puedes registrar' : 'Límite alcanzado'}
                    </Badge>
                  </div>
                </div>

                {userStats.lastRegistrationTime > 0 && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-[#6b5d52]">Próximo registro disponible</div>
                    <div className="text-lg font-medium text-[#2d1810]">
                      {formatTimeRemaining(userStats.nextRegistrationTime)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Token Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Token</CardTitle>
              <CardDescription>
                Detalles del token $BATTLE utilizado para pagos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#6b5d52]">Token:</span>
                <span className="font-medium">{stats.tokenInfo.name} ({stats.tokenInfo.symbol})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#6b5d52]">Cantidad requerida:</span>
                <span className="font-medium text-[#ff6b35]">
                  {stats.tokenInfo.requiredAmount} {stats.tokenInfo.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#6b5d52]">Decimales:</span>
                <span className="font-medium">{stats.tokenInfo.decimals}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button 
          onClick={loadPaymentStats}
          variant="outline"
          className="border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white"
        >
          <Loader2 className="w-4 h-4 mr-2" />
          Actualizar Estadísticas
        </Button>
      </div>
    </div>
  )
}
