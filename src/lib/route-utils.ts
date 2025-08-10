// Zone name to ID mapping for friendly URLs
export const ZONE_ROUTES = {
  'centro': '1',
  'norte': '2',
  'sur': '3',
  'este': '4',
  'oeste': '5'
} as const

// Vendor name to ID mapping for friendly URLs
export const VENDOR_ROUTES = {
  'pupusas-maria': '772cdbda-2cbb-4c67-a73a-3656bf02a4c1',
  'tacos-el-rey': '111f3776-b7c4-4ee0-80e1-5ca89e8ea9d0',
  'cafe-aroma': '525c09b3-dc92-409b-a11d-896bcf4d15b2',
  'pizza-napoli': '85f2a3a9-b9a7-4213-92bb-0b902d3ab4d1',
  'sushi-express': 'bf47b04b-cdd8-4dd3-bfac-5a379ce07f28'
} as const

export function getZoneIdFromSlug(slug: string): string | null {
  const normalizedSlug = slug.toLowerCase()
  return ZONE_ROUTES[normalizedSlug as keyof typeof ZONE_ROUTES] || null
}

export function getVendorIdFromSlug(slug: string): string | null {
  const normalizedSlug = slug.toLowerCase()
  return VENDOR_ROUTES[normalizedSlug as keyof typeof VENDOR_ROUTES] || null
}

export function getZoneSlugFromId(id: string): string | null {
  for (const [slug, zoneId] of Object.entries(ZONE_ROUTES)) {
    if (zoneId === id) {
      return slug
    }
  }
  return null
}

export function getVendorSlugFromId(id: string): string | null {
  for (const [slug, vendorId] of Object.entries(VENDOR_ROUTES)) {
    if (vendorId === id) {
      return slug
    }
  }
  return null
}

// Generate vendor slug from name
export function generateVendorSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

// Generate vendor route from vendor data
export function generateVendorRoute(vendor: { id: string; name: string }): string {
  const slug = generateVendorSlug(vendor.name)
  return `/vendors/${vendor.id}` // Using ID for now, can be changed to slug later
}

// Get all possible vendor routes (for static generation)
export async function getAllVendorRoutes(): Promise<string[]> {
  try {
    // This would fetch from Supabase in a real implementation
    // For now, return the known vendor routes
    return Object.values(VENDOR_ROUTES).map(id => `/vendors/${id}`)
  } catch (error) {
    console.error('Error getting vendor routes:', error)
    return []
  }
}

// Get all possible zone routes (for static generation)
export async function getAllZoneRoutes(): Promise<string[]> {
  try {
    // This would fetch from Supabase in a real implementation
    // For now, return the known zone routes
    return Object.keys(ZONE_ROUTES).map(slug => `/zones/${slug}`)
  } catch (error) {
    console.error('Error getting zone routes:', error)
    return []
  }
} 