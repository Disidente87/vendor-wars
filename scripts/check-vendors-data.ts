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

async function checkVendorData(vendorId: string) {
  console.log(`🔍 Checking data for vendor ${vendorId}...`)
  
  try {
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single()

    if (error) {
      console.error('❌ Error fetching vendor:', error)
      return
    }

    if (!vendor) {
      console.log('❌ Vendor not found')
      return
    }

    console.log('📊 Vendor data:')
    console.log('')
    console.log(`ID: ${vendor.id}`)
    console.log(`Name: ${vendor.name}`)
    console.log(`Description: ${vendor.description}`)
    console.log(`Category: ${vendor.category}`)
    console.log(`Zone ID: ${vendor.zone_id}`)
    console.log(`Image URL: ${vendor.image_url}`)
    console.log(`Total Votes: ${vendor.total_votes}`)
    console.log(`Verified Votes: ${vendor.verified_votes}`)
    console.log(`Created At: ${vendor.created_at}`)
    console.log(`Updated At: ${vendor.updated_at}`)
    
    // Check if image_url is a JSON object
    if (vendor.image_url && typeof vendor.image_url === 'object') {
      console.log('')
      console.log('🔍 Image URL is a JSON object:')
      console.log(JSON.stringify(vendor.image_url, null, 2))
      
      if (vendor.image_url.url) {
        console.log('')
        console.log('✅ Image URL found in JSON object:')
        console.log(`URL: ${vendor.image_url.url}`)
      }
    } else if (vendor.image_url && typeof vendor.image_url === 'string') {
      console.log('')
      console.log('✅ Image URL is a string:')
      console.log(`URL: ${vendor.image_url}`)
    } else {
      console.log('')
      console.log('❌ No image URL found')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

async function listAllVendorsWithImages() {
  console.log('🏪 Listing all vendors with image data...')
  
  try {
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('id, name, category, zone_id, image_url, total_votes')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('❌ Error fetching vendors:', error)
      return
    }
    
    if (!vendors || vendors.length === 0) {
      console.log('📭 No vendors found')
      return
    }
    
    console.log(`📊 Found ${vendors.length} vendors:`)
    console.log('')
    console.log('ID\t\tName\t\tCategory\tZone\tVotes\tImage URL')
    console.log('--\t\t----\t\t--------\t----\t-----\t----------')
    
    vendors.forEach(vendor => {
      let imageInfo = 'No image'
      if (vendor.image_url) {
        if (typeof vendor.image_url === 'object' && vendor.image_url.url) {
          imageInfo = vendor.image_url.url
        } else if (typeof vendor.image_url === 'string') {
          imageInfo = vendor.image_url
        } else {
          imageInfo = 'Invalid format'
        }
      }
      
      console.log(`${vendor.id.slice(0, 8)}...\t${vendor.name}\t${vendor.category}\t${vendor.zone_id.slice(0, 8)}...\t${vendor.total_votes}\t${imageInfo}`)
    })
    
  } catch (error) {
    console.error('❌ Error listing vendors:', error)
  }
}

async function updateVendorImage(vendorId: string, imageUrl: string) {
  console.log(`🔄 Updating image for vendor ${vendorId}...`)
  
  try {
    const { data, error } = await supabase
      .from('vendors')
      .update({ 
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', vendorId)
      .select()

    if (error) {
      console.error('❌ Error updating vendor image:', error)
      return false
    }

    console.log(`✅ Vendor image updated successfully!`)
    console.log(`New image URL: ${imageUrl}`)
    return true
    
  } catch (error) {
    console.error('❌ Error updating vendor:', error)
    return false
  }
}

async function addSampleImagesToVendors() {
  console.log('🎨 Adding sample images to vendors...')
  
  const sampleImages = [
    'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
  ]
  
  try {
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('id, name, image_url')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('❌ Error fetching vendors:', error)
      return
    }
    
    if (!vendors || vendors.length === 0) {
      console.log('📭 No vendors found')
      return
    }
    
    let updatedCount = 0
    
    for (let i = 0; i < vendors.length; i++) {
      const vendor = vendors[i]
      const imageUrl = sampleImages[i % sampleImages.length]
      
      // Only update if vendor doesn't have an image
      if (!vendor.image_url) {
        const success = await updateVendorImage(vendor.id, imageUrl)
        if (success) {
          updatedCount++
        }
      }
    }
    
    console.log(`✅ Updated ${updatedCount} vendors with sample images`)
    
  } catch (error) {
    console.error('❌ Error adding sample images:', error)
  }
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('🚀 Vendor Data Check Tool')
    console.log('')
    console.log('Usage:')
    console.log('  npm run check:vendors <vendorId>     - Check specific vendor data')
    console.log('  npm run check:vendors --list         - List all vendors with images')
    console.log('  npm run check:vendors --add-images   - Add sample images to vendors')
    console.log('')
    console.log('Examples:')
    console.log('  npm run check:vendors da84f637-28be-4d52-902b-a5df6bd949db')
    console.log('  npm run check:vendors --list')
    console.log('  npm run check:vendors --add-images')
    return
  }
  
  if (args[0] === '--list') {
    await listAllVendorsWithImages()
    return
  }
  
  if (args[0] === '--add-images') {
    await addSampleImagesToVendors()
    return
  }
  
  const vendorId = args[0]
  
  if (!vendorId) {
    console.error('❌ Invalid vendor ID. Please provide a valid UUID.')
    return
  }
  
  await checkVendorData(vendorId)
}

main()
