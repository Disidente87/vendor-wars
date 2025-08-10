import { supabase } from '@/lib/supabase'

export interface StreakCalculation {
  currentStreak: number
  maxStreak: number
  lastVoteDate: string | null
  totalVotes: number
  consecutiveDays: string[]
}

export class StreakService {
  /**
   * Obtiene el streak de un usuario con prioridad en la base de datos
   * Esta función es la fuente de verdad para el streak
   */
  static async getUserStreak(userFid: string): Promise<number> {
    try {
      console.log(`🔍 Getting streak for user ${userFid} from database...`)
      
      // First, check if the user exists and has a vote_streak column
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('fid, vote_streak')
          .eq('fid', parseInt(userFid))
          .single()
        
        if (userError) {
          console.error('Error checking user:', userError)
          if (userError.message && userError.message.includes('column') && userError.message.includes('does not exist')) {
            console.error('❌ vote_streak column does not exist in users table!')
            console.log('🔄 Falling back to manual calculation...')
            return await this.calculateStreakManually(userFid)
          }
        } else {
          console.log(`👤 User found, current vote_streak: ${userData?.vote_streak}`)
        }
      } catch (userCheckError) {
        console.warn('⚠️ Could not check user data:', userCheckError)
      }
      
      // Llamar a la función SQL que calcula el streak en tiempo real
      const { data, error } = await supabase
        .rpc('get_user_streak_with_priority', { user_fid_param: parseInt(userFid) })

      if (error) {
        console.error('Error calling get_user_streak_with_priority:', error)
        if (error.message && error.message.includes('function') && error.message.includes('does not exist')) {
          console.error('❌ get_user_streak_with_priority function does not exist!')
        }
        console.log('🔄 Falling back to manual calculation...')
        // Fallback: calcular manualmente
        return await this.calculateStreakManually(userFid)
      }

      console.log(`✅ Database returned streak: ${data}`)
      return data || 0
    } catch (error) {
      console.error('Error getting user streak:', error)
      console.log('🔄 Falling back to manual calculation...')
      // Fallback: calcular manualmente
      return await this.calculateStreakManually(userFid)
    }
  }

  /**
   * Calcula el streak manualmente como fallback
   * Basándose en los votos reales de la base de datos
   */
  static async calculateStreakManually(userFid: string): Promise<number> {
    try {
      console.log(`🔍 Manual streak calculation for user ${userFid}...`)
      
      const { data: votes, error } = await supabase
        .from('votes')
        .select('created_at')
        .eq('voter_fid', parseInt(userFid))
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching votes for streak calculation:', error)
        return 0
      }

      if (!votes || votes.length === 0) {
        console.log(`📊 No votes found for user ${userFid}`)
        return 0
      }

      console.log(`📊 Found ${votes.length} votes for user ${userFid}`)

      // Agrupar votos por fecha
      const votesByDate = new Map<string, boolean>()
      votes.forEach(vote => {
        const date = new Date(vote.created_at).toISOString().split('T')[0]
        votesByDate.set(date, true)
      })

      // Calcular streak consecutivo desde hoy hacia atrás
      let currentStreak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset to start of day
      
      console.log(`📅 Calculating streak from ${today.toISOString().split('T')[0]} backwards...`)
      
      // Check up to 30 days back
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000))
        const dateStr = checkDate.toISOString().split('T')[0]
        
        if (votesByDate.has(dateStr)) {
          currentStreak++
          console.log(`✅ Day ${dateStr}: Voted (streak: ${currentStreak})`)
        } else {
          console.log(`❌ Day ${dateStr}: No vote (breaking streak at ${currentStreak})`)
          break // Romper el streak si no hay voto en este día
        }
      }

      console.log(`🔥 Final manual streak calculation: ${currentStreak}`)
      return currentStreak
    } catch (error) {
      console.error('Error in manual streak calculation:', error)
      return 0
    }
  }

  /**
   * Obtiene información detallada del streak de un usuario
   */
  static async getStreakDetails(userFid: string): Promise<StreakCalculation> {
    try {
      const { data: votes, error } = await supabase
        .from('votes')
        .select('created_at')
        .eq('voter_fid', parseInt(userFid))
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching votes for streak details:', error)
        return {
          currentStreak: 0,
          maxStreak: 0,
          lastVoteDate: null,
          totalVotes: 0,
          consecutiveDays: []
        }
      }

      if (!votes || votes.length === 0) {
        return {
          currentStreak: 0,
          maxStreak: 0,
          lastVoteDate: null,
          totalVotes: 0,
          consecutiveDays: []
        }
      }

      // Agrupar votos por fecha
      const votesByDate = new Map<string, boolean>()
      votes.forEach(vote => {
        const date = new Date(vote.created_at).toISOString().split('T')[0]
        votesByDate.set(date, true)
      })

      // Calcular streak actual y máximo
      let currentStreak = 0
      let maxStreak = 0
      let tempStreak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset to start of day
      const consecutiveDays: string[] = []

      // Check current streak (from today backwards)
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000))
        const dateStr = checkDate.toISOString().split('T')[0]
        
        if (votesByDate.has(dateStr)) {
          tempStreak++
          if (tempStreak === 1) {
            consecutiveDays.push(dateStr)
          }
        } else {
          break // Break streak if no vote on this day
        }
      }

      currentStreak = tempStreak

      // Calculate max streak by checking all dates
      const allDates = Array.from(votesByDate.keys()).sort()
      tempStreak = 0
      
      for (let i = 0; i < allDates.length; i++) {
        const currentDate = new Date(allDates[i])
        const nextDate = i < allDates.length - 1 ? new Date(allDates[i + 1]) : null
        
        if (nextDate) {
          const dayDiff = Math.floor((nextDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000))
          
          if (dayDiff === 1) {
            // Consecutive day
            tempStreak++
          } else {
            // Gap found, check if this streak is the max
            if (tempStreak > maxStreak) {
              maxStreak = tempStreak
            }
            tempStreak = 1 // Reset for new streak
          }
        } else {
          // Last date
          tempStreak++
          if (tempStreak > maxStreak) {
            maxStreak = tempStreak
          }
        }
      }

      // Check if current streak is the max
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak
      }

      return {
        currentStreak,
        maxStreak,
        lastVoteDate: votes[0]?.created_at || null,
        totalVotes: votes.length,
        consecutiveDays: consecutiveDays.reverse() // Ordenar cronológicamente
      }
    } catch (error) {
      console.error('Error getting streak details:', error)
      return {
        currentStreak: 0,
        maxStreak: 0,
        lastVoteDate: null,
        totalVotes: 0,
        consecutiveDays: []
      }
    }
  }

  /**
   * Actualiza el streak de un usuario en la base de datos
   */
  static async updateUserStreak(userFid: string): Promise<number> {
    try {
      // Llamar a la función SQL para actualizar el streak
      const { data, error } = await supabase
        .rpc('update_user_streak', { user_fid_param: parseInt(userFid) })

      if (error) {
        console.error('Error calling update_user_streak:', error)
        // Fallback: calcular y actualizar manualmente
        const calculatedStreak = await this.calculateStreakManually(userFid)
        await this.updateStreakInDatabase(userFid, calculatedStreak)
        return calculatedStreak
      }

      return data || 0
    } catch (error) {
      console.error('Error updating user streak:', error)
      // Fallback: calcular y actualizar manualmente
      const calculatedStreak = await this.calculateStreakManually(userFid)
      await this.updateStreakInDatabase(userFid, calculatedStreak)
      return calculatedStreak
    }
  }

  /**
   * Actualiza el streak en la base de datos manualmente
   */
  private static async updateStreakInDatabase(userFid: string, streak: number): Promise<void> {
    try {
      console.log(`💾 Updating streak in database for user ${userFid} to ${streak}...`)
      
      // First, check if the vote_streak column exists
      try {
        const { data: columnCheck, error: columnError } = await supabase
          .from('users')
          .select('vote_streak')
          .eq('fid', parseInt(userFid))
          .limit(1)
        
        if (columnError) {
          console.error('Error checking vote_streak column:', columnError)
          if (columnError.message && columnError.message.includes('column') && columnError.message.includes('does not exist')) {
            console.error('❌ vote_streak column does not exist in users table!')
            return
          }
        }
      } catch (checkError) {
        console.warn('⚠️ Could not check vote_streak column:', checkError)
      }
      
      const { error } = await supabase
        .from('users')
        .update({ 
          vote_streak: streak,
          updated_at: new Date().toISOString()
        })
        .eq('fid', parseInt(userFid))

      if (error) {
        console.error('Error updating streak in database:', error)
      } else {
        console.log(`✅ Successfully updated streak in database for user ${userFid} to ${streak}`)
      }
    } catch (error) {
      console.error('Error in updateStreakInDatabase:', error)
    }
  }

  /**
   * Actualiza los streaks de todos los usuarios
   */
  static async updateAllUserStreaks(): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('update_all_user_streaks')

      if (error) {
        console.error('Error calling update_all_user_streaks:', error)
      }
    } catch (error) {
      console.error('Error updating all user streaks:', error)
    }
  }

  /**
   * Verifica si un usuario votó hoy
   */
  static async hasUserVotedToday(userFid: string): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('votes')
        .select('id')
        .eq('voter_fid', parseInt(userFid))
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
        .limit(1)

      if (error) {
        console.error('Error checking if user voted today:', error)
        return false
      }

      return (data && data.length > 0)
    } catch (error) {
      console.error('Error in hasUserVotedToday:', error)
      return false
    }
  }

  /**
   * Actualiza el streak de un usuario cuando vota
   * Esta función debe ser llamada cada vez que un usuario vota
   * NOTA: Esta función se llama DESPUÉS de registrar el voto, por lo que
   * el usuario ya tiene al menos un voto hoy
   */
  static async updateStreakOnVote(userFid: string): Promise<number> {
    try {
      console.log(`🔄 Updating streak for user ${userFid} after vote...`)
      
      // Get current date in user's timezone (or use UTC if needed)
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      
      // Calculate yesterday's date more reliably
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      
      console.log(`📅 Today: ${today}, Yesterday: ${yesterdayStr}`)
      
      // Verificar si votó ayer para determinar si continuar o resetear el streak
      const { data: yesterdayVotes, error: yesterdayError } = await supabase
        .from('votes')
        .select('id')
        .eq('voter_fid', parseInt(userFid))
        .gte('created_at', `${yesterdayStr}T00:00:00`)
        .lt('created_at', `${yesterdayStr}T23:59:59`)
        .limit(1)
      
      if (yesterdayError) {
        console.error('Error checking yesterday votes:', yesterdayError)
        // Si no podemos verificar, asumir que no votó ayer y resetear streak
        const newStreak = 1
        await this.updateStreakInDatabase(userFid, newStreak)
        console.log(`🔄 Assuming no vote yesterday due to error, resetting streak to 1`)
        return newStreak
      }
      
      const votedYesterday = yesterdayVotes && yesterdayVotes.length > 0
      console.log(`📊 User ${userFid} voted yesterday (${yesterdayStr}): ${votedYesterday}`)
      
      if (votedYesterday) {
        // Si votó ayer, incrementar el streak
        const currentStreak = await this.getUserStreak(userFid)
        const newStreak = currentStreak + 1
        await this.updateStreakInDatabase(userFid, newStreak)
        console.log(`🔥 Incrementing streak for user ${userFid}: ${currentStreak} → ${newStreak}`)
        return newStreak
      } else {
        // Si no votó ayer, resetear el streak a 1
        const newStreak = 1
        await this.updateStreakInDatabase(userFid, newStreak)
        console.log(`🔄 Resetting streak for user ${userFid} to 1 (no vote yesterday)`)
        return newStreak
      }
    } catch (error) {
      console.error('Error updating streak on vote:', error)
      return 0
    }
  }

  /**
   * Obtiene el historial de votos de los últimos N días
   */
  static async getVoteHistory(userFid: string, days: number = 30): Promise<{ date: string; hasVote: boolean }[]> {
    try {
      const { data: votes, error } = await supabase
        .from('votes')
        .select('created_at')
        .eq('voter_fid', parseInt(userFid))
        .gte('created_at', new Date(Date.now() - (days * 24 * 60 * 60 * 1000)).toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching vote history:', error)
        return []
      }

      // Crear mapa de fechas con votos
      const votesByDate = new Map<string, boolean>()
      votes?.forEach(vote => {
        const date = new Date(vote.created_at).toISOString().split('T')[0]
        votesByDate.set(date, true)
      })

      // Generar array de los últimos N días
      const result: { date: string; hasVote: boolean }[] = []
      const today = new Date()
      
      for (let i = 0; i < days; i++) {
        const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000))
        const dateStr = date.toISOString().split('T')[0]
        result.push({
          date: dateStr,
          hasVote: votesByDate.has(dateStr)
        })
      }

      return result.reverse() // Ordenar cronológicamente
    } catch (error) {
      console.error('Error getting vote history:', error)
      return []
    }
  }

  /**
   * Test method to verify streak calculation is working
   * This can be used to debug streak issues
   */
  static async testStreakCalculation(userFid: string): Promise<{
    success: boolean
    databaseStreak: number
    manualStreak: number
    voteHistory: { date: string; hasVote: boolean }[]
    error?: string
  }> {
    try {
      console.log(`🧪 Testing streak calculation for user ${userFid}...`)
      
      // Test database function
      let databaseStreak: number
      try {
        const { data, error } = await supabase
          .rpc('get_user_streak_with_priority', { user_fid_param: parseInt(userFid) })
        
        if (error) {
          console.error('Database function error:', error)
          databaseStreak = -1
        } else {
          databaseStreak = data || 0
        }
      } catch (error) {
        console.error('Database function exception:', error)
        databaseStreak = -1
      }
      
      // Test manual calculation
      const manualStreak = await this.calculateStreakManually(userFid)
      
      // Get vote history
      const voteHistory = await this.getVoteHistory(userFid, 7) // Last 7 days
      
      const result = {
        success: true,
        databaseStreak,
        manualStreak,
        voteHistory
      }
      
      console.log(`🧪 Test results:`, result)
      return result
      
    } catch (error) {
      console.error('Error in testStreakCalculation:', error)
      return {
        success: false,
        databaseStreak: -1,
        manualStreak: -1,
        voteHistory: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}
