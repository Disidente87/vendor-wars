'use client'

import { useState } from 'react'
import { useVoteStreak } from '@/hooks/useVoteStreak'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Flame, Database, Clock } from 'lucide-react'

export function StreakTest() {
  const { streak, loading, error, lastUpdated, refreshStreak, fetchStreak } = useVoteStreak()
  const [testResults, setTestResults] = useState<any[]>([])

  const runTests = async () => {
    setTestResults([])
    const results = []

    // Test 1: Verificar que se puede obtener el streak
    try {
      const response = await fetch(`/api/users/streak?userFid=123`)
      const result = await response.json()
      
      results.push({
        test: 'GET /api/users/streak',
        status: result.success ? '✅ PASS' : '❌ FAIL',
        data: result,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      results.push({
        test: 'GET /api/users/streak',
        status: '❌ ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    }

    // Test 2: Verificar que se puede recalcular el streak
    try {
      const response = await fetch('/api/users/streak/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userFid: '123' }),
      })
      const result = await response.json()
      
      results.push({
        test: 'POST /api/users/streak/check',
        status: result.success ? '✅ PASS' : '❌ FAIL',
        data: result,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      results.push({
        test: 'POST /api/users/streak/check',
        status: '❌ ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    }

    setTestResults(results)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Sistema de Streaks - Panel de Pruebas
          </CardTitle>
          <CardDescription>
            Verifica que el sistema de streaks esté funcionando correctamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estado actual del streak */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Badge variant={streak && streak > 0 ? 'default' : 'secondary'}>
                {streak || 0} días
              </Badge>
              <span className="text-sm text-gray-600">
                {loading ? 'Cargando...' : error ? `Error: ${error}` : 'Streak actual'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Database className="h-4 w-4" />
              <span>Base de datos</span>
              {lastUpdated && (
                <>
                  <Clock className="h-4 w-4" />
                  <span>{new Date(lastUpdated).toLocaleTimeString()}</span>
                </>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button 
              onClick={fetchStreak} 
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Obtener Streak
            </Button>
            
            <Button 
              onClick={refreshStreak} 
              disabled={loading}
              variant="default"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Recalcular Streak
            </Button>
            
            <Button 
              onClick={runTests} 
              variant="secondary"
            >
              🧪 Ejecutar Tests
            </Button>
          </div>

          {/* Resultados de los tests */}
          {testResults.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Resultados de Tests:</h4>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm">{result.test}</span>
                      <Badge variant={result.status.includes('PASS') ? 'default' : 'destructive'}>
                        {result.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600">
                      <div>Timestamp: {result.timestamp}</div>
                      {result.data && (
                        <div>Respuesta: {JSON.stringify(result.data, null, 2)}</div>
                      )}
                      {result.error && (
                        <div>Error: {result.error}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información del sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Estado del Hook:</span>
            <Badge variant={streak !== null ? 'default' : 'secondary'}>
              {streak !== null ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Última actualización:</span>
            <span>{lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Nunca'}</span>
          </div>
          <div className="flex justify-between">
            <span>Fuente de datos:</span>
            <Badge variant="outline">PostgreSQL (Prioridad)</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
