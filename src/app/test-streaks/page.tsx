import { StreakTest } from '@/components/streak-test'
import { StreakDisplay } from '@/components/streak-display'

export default function TestStreaksPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🧪 Prueba del Sistema de Streaks</h1>
        <p className="text-gray-600">
          Verifica que el sistema de streaks esté funcionando correctamente
        </p>
      </div>

      {/* Componentes de visualización del streak */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Variante Default</h3>
          <StreakDisplay variant="default" />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Variante Compact</h3>
          <StreakDisplay variant="compact" />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Variante Detailed</h3>
          <StreakDisplay variant="detailed" />
        </div>
      </div>

      {/* Panel de pruebas */}
      <StreakTest />

      {/* Información del sistema */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          📋 Estado de la Implementación
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">✅ Completado:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Funciones SQL en PostgreSQL</li>
              <li>• API Routes (/api/users/streak)</li>
              <li>• Hook useVoteStreak</li>
              <li>• Componentes de visualización</li>
              <li>• Trigger automático en base de datos</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">🔧 Para Implementar:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Integrar en componentes existentes</li>
              <li>• Actualizar en tiempo real al votar</li>
              <li>• Notificaciones de streak roto</li>
              <li>• Estadísticas de streaks</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Instrucciones de uso */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-4">
          🚀 Cómo Usar el Sistema
        </h3>
        <div className="space-y-3 text-sm text-green-800">
          <div>
            <strong>1. En cualquier componente:</strong>
            <pre className="bg-white p-2 rounded mt-1 text-xs overflow-x-auto">
{`import { StreakDisplay } from '@/components/streak-display'

// Uso básico
<StreakDisplay />

// Variante compacta
<StreakDisplay variant="compact" />

// Sin botón de refresh
<StreakDisplay showRefreshButton={false}`}
            </pre>
          </div>
          
          <div>
            <strong>2. Con el hook directamente:</strong>
            <pre className="bg-white p-2 rounded mt-1 text-xs overflow-x-auto">
{`import { useVoteStreak } from '@/hooks/useVoteStreak'

const { streak, loading, error, refreshStreak } = useVoteStreak()`}
            </pre>
          </div>
          
          <div>
            <strong>3. Para forzar recálculo:</strong>
            <pre className="bg-white p-2 rounded mt-1 text-xs overflow-x-auto">
{`// Desde cualquier lugar
await fetch('/api/users/streak/check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userFid: '123' })
})`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
