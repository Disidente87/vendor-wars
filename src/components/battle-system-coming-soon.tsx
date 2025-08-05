'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Swords, Trophy } from 'lucide-react'

export function BattleSystemComingSoon() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full">
            <Swords className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-xl font-bold">Battle System</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Territorial battles are coming soon!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Badge variant="secondary" className="text-xs">
            Coming Soon
          </Badge>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Get ready for epic territorial battles between vendors!
          </p>
          
          <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-center space-x-2">
              <Trophy className="h-3 w-3" />
              <span>Zone-based competitions</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Swords className="h-3 w-3" />
              <span>Territory conquest rewards</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-3 w-3" />
              <span>Real-time battle updates</span>
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <p className="text-xs text-center text-muted-foreground">
            For now, keep voting for your favorite vendors to earn BATTLE tokens!
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 