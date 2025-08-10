'use client'

import { useVoteStreak } from '@/hooks/useVoteStreak'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Flame, RefreshCw, Trophy, Calendar } from 'lucide-react'
import { useState } from 'react'

interface StreakDisplayProps {
  variant?: 'default' | 'compact' | 'detailed'
  showRefreshButton?: boolean
  className?: string
}

export function StreakDisplay({ 
  variant = 'default', 
  showRefreshButton = true,
  className = '' 
}: StreakDisplayProps) {
  const { streak, loading, error, lastUpdated, refreshStreak } = useVoteStreak()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshStreak()
    setIsRefreshing(false)
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return 'bg-orange-500 hover:bg-orange-600'
    if (streak >= 3) return 'bg-yellow-500 hover:bg-yellow-600'
    return 'bg-gray-500 hover:bg-gray-600'
  }

  const getStreakIcon = (streak: number) => {
    if (streak >= 7) return <Trophy className="h-4 w-4" />
    if (streak >= 3) return <Flame className="h-4 w-4" />
    return <Calendar className="h-4 w-4" />
  }

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="secondary" 
              className={`flex items-center gap-1 cursor-help ${className}`}
            >
              {getStreakIcon(streak || 0)}
              {streak || 0}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <div className="font-medium">Vote Streak</div>
              <div className="text-sm text-gray-500">
                {lastUpdated ? `Actualizado: ${new Date(lastUpdated).toLocaleTimeString()}` : 'Nunca actualizado'}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={`flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border ${className}`}>
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full ${getStreakColor(streak || 0)} text-white`}>
            {getStreakIcon(streak || 0)}
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{streak || 0}</div>
            <div className="text-sm text-gray-600">días consecutivos</div>
          </div>
        </div>
        
        <div className="flex-1 text-right">
          <div className="text-xs text-gray-500">
            Última actualización
          </div>
          <div className="text-sm font-medium">
            {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Nunca'}
          </div>
        </div>

        {showRefreshButton && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading || isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    )
  }

  // Variant default
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        className={`flex items-center gap-1 ${getStreakColor(streak || 0)} text-white`}
      >
        {getStreakIcon(streak || 0)}
        {streak || 0} días
      </Badge>
      
      {showRefreshButton && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRefresh}
          disabled={loading || isRefreshing}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${loading || isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      )}
      
      {error && (
        <span className="text-xs text-red-500">
          Error: {error}
        </span>
      )}
    </div>
  )
}
