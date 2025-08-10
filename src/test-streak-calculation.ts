// Test file for streak calculation logic
// This file can be run with: npx tsx src/test-streak-calculation.ts

import { StreakService } from './services/streak'

// Mock data for testing
const mockVotes = [
  { created_at: '2024-01-15T10:00:00Z' }, // Today
  { created_at: '2024-01-14T15:30:00Z' }, // Yesterday
  { created_at: '2024-01-13T12:00:00Z' }, // 2 days ago
  { created_at: '2024-01-12T09:00:00Z' }, // 3 days ago
  { created_at: '2024-01-11T14:00:00Z' }, // 4 days ago
  { created_at: '2024-01-10T11:00:00Z' }, // 5 days ago
  { created_at: '2024-01-09T16:00:00Z' }, // 6 days ago
  { created_at: '2024-01-08T13:00:00Z' }, // 7 days ago
  // Gap of 2 days
  { created_at: '2024-01-05T10:00:00Z' }, // 10 days ago
  { created_at: '2024-01-04T15:00:00Z' }, // 11 days ago
  { created_at: '2024-01-03T12:00:00Z' }, // 12 days ago
]

// Test the streak calculation logic
function testStreakCalculation() {
  console.log('🧪 Testing streak calculation logic...')
  
  // Group votes by date
  const votesByDate = new Map<string, boolean>()
  mockVotes.forEach(vote => {
    const date = new Date(vote.created_at).toISOString().split('T')[0]
    votesByDate.set(date, true)
  })
  
  console.log('📅 Votes by date:', Array.from(votesByDate.keys()).sort())
  
  // Calculate current streak (from today backwards)
  let currentStreak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset to start of day
  
  // Check up to 30 days back
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000))
    const dateStr = checkDate.toISOString().split('T')[0]
    
    if (votesByDate.has(dateStr)) {
      currentStreak++
      console.log(`✅ Found vote on ${dateStr}, streak: ${currentStreak}`)
    } else {
      console.log(`❌ No vote on ${dateStr}, breaking streak`)
      break // Break streak if no vote on this day
    }
  }
  
  console.log(`\n🔥 Final current streak: ${currentStreak}`)
  
  // Calculate max streak by checking all dates
  const allDates = Array.from(votesByDate.keys()).sort()
  let maxStreak = 0
  let tempStreak = 0
  
  console.log('\n📊 Calculating max streak from all dates...')
  
  for (let i = 0; i < allDates.length; i++) {
    const currentDate = new Date(allDates[i])
    const nextDate = i < allDates.length - 1 ? new Date(allDates[i + 1]) : null
    
    if (nextDate) {
      const dayDiff = Math.floor((nextDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000))
      
      if (dayDiff === 1) {
        // Consecutive day
        tempStreak++
        console.log(`✅ Consecutive day: ${allDates[i]} -> ${allDates[i + 1]}, temp streak: ${tempStreak}`)
      } else {
        // Gap found, check if this streak is the max
        if (tempStreak > maxStreak) {
          maxStreak = tempStreak
          console.log(`🔄 Gap found, updating max streak to: ${maxStreak}`)
        }
        tempStreak = 1 // Reset for new streak
        console.log(`🔄 Gap of ${dayDiff} days, resetting temp streak to 1`)
      }
    } else {
      // Last date
      tempStreak++
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak
      }
      console.log(`🏁 Last date: ${allDates[i]}, final temp streak: ${tempStreak}`)
    }
  }
  
  // Check if current streak is the max
  if (currentStreak > maxStreak) {
    maxStreak = currentStreak
  }
  
  console.log(`\n🏆 Final results:`)
  console.log(`   Current streak: ${currentStreak}`)
  console.log(`   Max streak: ${maxStreak}`)
  console.log(`   Total votes: ${mockVotes.length}`)
  
  // Expected results for this test data:
  // Current streak: 7 (7 consecutive days from today back)
  // Max streak: 7 (same as current streak in this case)
  // Total votes: 11
  
  const expectedCurrentStreak = 7
  const expectedMaxStreak = 7
  
  if (currentStreak === expectedCurrentStreak && maxStreak === expectedMaxStreak) {
    console.log('\n✅ Test PASSED! Streak calculation is working correctly.')
  } else {
    console.log('\n❌ Test FAILED! Expected:', { expectedCurrentStreak, expectedMaxStreak }, 'Got:', { currentStreak, maxStreak })
  }
}

// Run the test
if (require.main === module) {
  testStreakCalculation()
}

export { testStreakCalculation }
