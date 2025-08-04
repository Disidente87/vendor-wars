import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { supabase } from '../src/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

interface NewZone {
  name: string
  description: string
  color: string
  coordinates: [number, number]
}

async function addNewZone() {
  console.log('🌍 Adding new zone to database...')
  
  // Example new zones - you can modify these or add more
  const newZones: NewZone[] = [
    {
      name: 'Zona Polanco',
      description: 'Upscale neighborhood with gourmet restaurants',
      color: '#FF6B9D',
      coordinates: [19.4300, -99.2000]
    },
    {
      name: 'Zona Roma',
      description: 'Trendy district with hip cafes and restaurants',
      color: '#4ECDC4',
      coordinates: [19.4100, -99.1600]
    },
    {
      name: 'Zona Coyoacán',
      description: 'Historic neighborhood with traditional markets',
      color: '#45B7D1',
      coordinates: [19.3500, -99.1600]
    }
  ]
  
  try {
    for (const zoneData of newZones) {
      console.log(`\n📍 Adding zone: ${zoneData.name}`)
      
      const newZone = {
        id: uuidv4(),
        name: zoneData.name,
        description: zoneData.description,
        color: zoneData.color,
        coordinates: zoneData.coordinates,
        heat_level: Math.floor(Math.random() * 30) + 50, // Random heat level 50-80
        total_votes: Math.floor(Math.random() * 500) + 100, // Random votes 100-600
        active_vendors: Math.floor(Math.random() * 5) + 2 // Random vendors 2-7
      }
      
      const { error } = await supabase
        .from('zones')
        .insert(newZone)
      
      if (error) {
        console.error(`❌ Error adding zone ${zoneData.name}:`, error)
      } else {
        console.log(`✅ Zone "${zoneData.name}" added successfully!`)
        console.log(`   ID: ${newZone.id}`)
        console.log(`   Route: /zones/${newZone.id}`)
        console.log(`   Slug: ${zoneData.name.toLowerCase().replace(/\s+/g, '-')}`)
      }
    }
    
    console.log('\n🎉 New zones added successfully!')
    console.log('\n💡 To add more zones, modify the newZones array in this script.')
    
  } catch (error) {
    console.error('❌ Error adding zones:', error)
  }
}

// Run the function
addNewZone() 