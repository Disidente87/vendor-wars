import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateVendorImages() {
  console.log('🎨 Updating vendor images with real URLs...')
  
  const vendorImages = [
    {
      name: 'Café Aroma',
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop'
    },
    {
      name: 'Pizza Napoli',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop'
    },
    {
      name: 'Pupusas María',
      imageUrl: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=300&fit=crop'
    },
    {
      name: 'Sushi Express',
      imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop'
    },
    {
      name: 'Tacos El Güero',
      imageUrl: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=400&h=300&fit=crop'
    }
  ]
  
  try {
    for (const vendorImage of vendorImages) {
      console.log(`🔄 Updating ${vendorImage.name}...`)
      
      const { data, error } = await supabase
        .from('vendors')
        .update({ 
          image_url: vendorImage.imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('name', vendorImage.name)
        .select()

      if (error) {
        console.error(`❌ Error updating ${vendorImage.name}:`, error)
      } else {
        console.log(`✅ Updated ${vendorImage.name} with image: ${vendorImage.imageUrl}`)
      }
    }
    
    console.log('🎉 All vendor images updated!')
    
  } catch (error) {
    console.error('❌ Error updating vendor images:', error)
  }
}

updateVendorImages()
