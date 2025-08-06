'use client'

import { useState } from 'react'
import { Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VendorAvatarProps {
  vendor: {
    id: string
    name: string
    imageUrl?: string
    isVerified?: boolean
  }
  size?: 'sm' | 'md' | 'lg'
  showVerification?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24'
}

export function VendorAvatar({ 
  vendor, 
  size = 'md', 
  showVerification = true,
  className 
}: VendorAvatarProps) {
  const [imageError, setImageError] = useState(false)
  
  // Fallback image based on vendor category or name
  const getFallbackImage = () => {
    const fallbackImages = {
      pupusas: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=300&fit=crop',
      tacos: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=400&h=300&fit=crop',
      bebidas: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
      otros: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
      default: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
    }
    
    const name = vendor.name.toLowerCase()
    if (name.includes('pupusa')) return fallbackImages.pupusas
    if (name.includes('taco')) return fallbackImages.tacos
    if (name.includes('café') || name.includes('bebida')) return fallbackImages.bebidas
    if (name.includes('pizza') || name.includes('sushi')) return fallbackImages.otros
    
    return fallbackImages.default
  }

  const imageUrl = vendor.imageUrl && !imageError ? vendor.imageUrl : getFallbackImage()

  return (
    <div className={cn('relative', className)}>
      <div className={cn(
        'rounded-full overflow-hidden border-2 border-[#ff6b35] bg-gray-100',
        sizeClasses[size]
      )}>
        <img 
          src={imageUrl}
          alt={`${vendor.name} avatar`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </div>
      
      {showVerification && vendor.isVerified && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#ffd23f] rounded-full flex items-center justify-center shadow-lg">
          <Crown className="w-3 h-3 text-[#2d1810]" />
        </div>
      )}
    </div>
  )
}
