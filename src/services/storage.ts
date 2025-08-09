import { createClient } from '@supabase/supabase-js'

// Create a separate client for storage operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: 'Invalid file type. Please use JPG, PNG, GIF,or WebP.'
        }
      }

      // Validate file size (2MB max)
      const maxSize = 2 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'File too large. Maximum size is 2MB.'
        }
      }

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
        return {
          success: false,
          error: `Upload failed: ${error.message}`
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
