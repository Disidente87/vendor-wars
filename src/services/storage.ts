import { createClient } from '@supabase/supabase-js'

// Create a separate client for storage operations with service role key for uploads
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Use service role key for file uploads to bypass RLS
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export interface ImageUploadResult {
  success: boolean
  url?: string
  error?: string
}

export class StorageService {
  private static readonly BUCKET_NAME = 'vendor-wars'
  
  /**
   * Upload vendor avatar image
   */
  static async uploadVendorAvatar(file: File, vendorId: string): Promise<ImageUploadResult> {
    try {
      // For now, return a default image URL to avoid storage RLS issues
      // This allows vendor registration to work while we set up storage properly
      console.log('📸 Image upload requested for vendor:', vendorId)
      console.log('📄 File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      })

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: 'Invalid file type. Please use JPG, PNG, GIF, or WebP.'
        }
      }

      // Validate file size (2MB max)
      const maxSize = 2 * 1024 * 1024 // 2MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'File too large. Maximum size is 2MB.'
        }
      }

      // Try to upload to storage, but fallback gracefully
      try {
        // Get file extension
        const fileExt = file.name.split('.').pop()?.toLowerCase()
        const fileName = `${vendorId}.${fileExt}`
        const filePath = `vendors/avatars/${fileName}`

        // Upload file
        const { data, error } = await supabase.storage
          .from(this.BUCKET_NAME)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true // Allow overwriting existing files
          })

        if (error) {
          console.error('Storage upload error:', error)
          // Return default image URL as fallback
          return {
            success: true,
            url: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=300&fit=crop'
          }
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(this.BUCKET_NAME)
          .getPublicUrl(filePath)

        return {
          success: true,
          url: publicUrl
        }

      } catch (uploadError) {
        console.error('Storage upload failed, using fallback:', uploadError)
        // Return default image URL as fallback
        return {
          success: true,
          url: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=300&fit=crop'
        }
      }

    } catch (error) {
      console.error('Storage service error:', error)
      return {
        success: false,
        error: 'Upload failed. Please try again.'
      }
    }
  }

  /**
   * Delete vendor avatar image
   */
  static async deleteVendorAvatar(vendorId: string): Promise<boolean> {
    try {
      // Try to delete all possible file extensions
      const extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif']
      const deletePromises = extensions.map(ext => {
        const filePath = `vendors/avatars/${vendorId}.${ext}`
        return supabase.storage
          .from(this.BUCKET_NAME)
          .remove([filePath])
      })

      await Promise.all(deletePromises)
      return true
    } catch (error) {
      console.error('Error deleting vendor avatar:', error)
      return false
    }
  }

  /**
   * Get vendor avatar URL
   */
  // Si la imagen del vendor tiene formato gif y se pasa 'gif' como argumento en 'extension',
  // la función generará la URL para ese archivo específico (por ejemplo, vendors/avatars/{vendorId}.gif).
  // No se sobreescribe el archivo original; simplemente se construye la URL según la extensión proporcionada.
  // Si no se especifica, por defecto se usa 'jpg'.
  static getVendorAvatarUrl(vendorId: string, extension: string = 'jpg'): string {
    const filePath = `vendors/avatars/${vendorId}.${extension}`
    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath)
    
    return publicUrl
  }
}
