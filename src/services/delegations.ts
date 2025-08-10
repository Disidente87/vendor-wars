import { createClient } from '@supabase/supabase-js'

export interface Delegation {
  id: string
  zone_id: string
  delegation_name: string
  created_at: string
  updated_at: string
}

export interface ZoneWithDelegations {
  id: string
  name: string
  description: string
  color: string
  delegations: Delegation[]
}

// Function to get Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

export class DelegationService {
  static async getAllDelegations(): Promise<Delegation[]> {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('zone_delegations')
        .select('*')
        .order('delegation_name')
      
      if (error) {
        console.error('Error fetching delegations:', error)
        throw new Error('Failed to fetch delegations')
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getAllDelegations:', error)
      throw error
    }
  }

  static async getDelegationsByZone(zoneId: string): Promise<Delegation[]> {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('zone_delegations')
        .select('*')
        .eq('zone_id', zoneId)
        .order('delegation_name')
      
      if (error) {
        console.error('Error fetching delegations by zone:', error)
        throw new Error('Failed to fetch delegations by zone')
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getDelegationsByZone:', error)
      throw error
    }
  }

  static async getZoneByDelegation(delegationName: string): Promise<string | null> {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('zone_delegations')
        .select('zone_id')
        .eq('delegation_name', delegationName)
        .single()
      
      if (error) {
        console.error('Error fetching zone by delegation:', error)
        return null
      }
      
      return data?.zone_id || null
    } catch (error) {
      console.error('Error in getZoneByDelegation:', error)
      return null
    }
  }

  static async getZonesWithDelegations(): Promise<ZoneWithDelegations[]> {
    try {
      const supabase = getSupabaseClient()
      
      // First get all zones
      const { data: zones, error: zonesError } = await supabase
        .from('zones')
        .select('id, name, description, color')
        .order('name')
      
      if (zonesError) {
        console.error('Error fetching zones:', zonesError)
        throw new Error('Failed to fetch zones')
      }
      
      // Then get all delegations
      const { data: delegations, error: delegationsError } = await supabase
        .from('zone_delegations')
        .select('*')
        .order('delegation_name')
      
      if (delegationsError) {
        console.error('Error fetching delegations:', delegationsError)
        throw new Error('Failed to fetch delegations')
      }
      
      // Map delegations to zones
      const zonesWithDelegations = zones.map(zone => ({
        ...zone,
        delegations: delegations.filter(d => d.zone_id === zone.id)
      }))
      
      return zonesWithDelegations
    } catch (error) {
      console.error('Error in getZonesWithDelegations:', error)
      throw error
    }
  }
}
