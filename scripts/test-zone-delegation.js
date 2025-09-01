import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno faltantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testZoneDelegation() {
  console.log('🧪 Probando función get_zone_by_delegation...\n')

  try {
    // 1. Verificar que las tablas existen
    console.log('1️⃣ Verificando tablas...')
    
    const { data: zonesTable, error: zonesError } = await supabase
      .from('zones')
      .select('id, name, color')
      .limit(5)
    
    if (zonesError) {
      console.error('❌ Error al acceder a tabla zones:', zonesError)
      return
    }
    
    console.log('✅ Tabla zones:', zonesTable?.length || 0, 'zonas encontradas')
    
    const { data: delegationsTable, error: delegationsError } = await supabase
      .from('zone_delegations')
      .select('zone_id, delegation_name')
      .limit(5)
    
    if (delegationsError) {
      console.error('❌ Error al acceder a tabla zone_delegations:', delegationsError)
      return
    }
    
    console.log('✅ Tabla zone_delegations:', delegationsTable?.length || 0, 'delegaciones encontradas')

    // 2. Probar la función RPC
    console.log('\n2️⃣ Probando función RPC get_zone_by_delegation...')
    
    const testDelegations = ['Coyoacán', 'Álvaro Obregón', 'Cuauhtémoc', 'Miguel Hidalgo']
    
    for (const delegation of testDelegations) {
      console.log(`\n🔍 Probando delegación: "${delegation}"`)
      
      const { data: zoneResult, error: zoneError } = await supabase
        .rpc('get_zone_by_delegation', { input_delegation_name: delegation })
      
      if (zoneError) {
        console.error(`❌ Error para "${delegation}":`, zoneError)
      } else {
        console.log(`✅ Resultado para "${delegation}":`, zoneResult)
        
        // Verificar si la zona existe
        if (zoneResult) {
          const { data: zoneData, error: zoneDataError } = await supabase
            .from('zones')
            .select('id, name')
            .eq('id', zoneResult)
            .single()
          
          if (zoneDataError) {
            console.error(`⚠️ Zona ${zoneResult} no encontrada en tabla zones:`, zoneDataError)
          } else {
            console.log(`✅ Zona encontrada: ${zoneData.name} (${zoneData.id})`)
          }
        }
      }
    }

    // 3. Verificar datos en zone_delegations
    console.log('\n3️⃣ Verificando datos en zone_delegations...')
    
    const { data: allDelegations, error: allDelegationsError } = await supabase
      .from('zone_delegations')
      .select(`
        delegation_name,
        zone_id,
        zones!inner(name, color)
      `)
      .order('delegation_name')
    
    if (allDelegationsError) {
      console.error('❌ Error al obtener delegaciones:', allDelegationsError)
    } else {
      console.log('📋 Delegaciones disponibles:')
      allDelegations?.forEach(d => {
        console.log(`  • ${d.delegation_name} → ${d.zones.name} (${d.zone_id})`)
      })
    }

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

testZoneDelegation()
