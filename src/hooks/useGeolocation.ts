import { useState, useEffect } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  error: string | null
  isLoading: boolean
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    isLoading: true
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        isLoading: false
      }))
      return
    }

    const successHandler = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        error: null,
        isLoading: false
      })
    }

    const errorHandler = (error: GeolocationPositionError) => {
      let errorMessage = 'Unknown error occurred'
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'User denied the request for Geolocation'
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable'
          break
        case error.TIMEOUT:
          errorMessage = 'The request to get user location timed out'
          break
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    }

    navigator.geolocation.getCurrentPosition(successHandler, errorHandler, options)
  }, [])

  const getCurrentPosition = () => {
    if (!navigator.geolocation) return

    setState(prev => ({ ...prev, isLoading: true }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          isLoading: false
        })
      },
      (error) => {
        let errorMessage = 'Unknown error occurred'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'User denied the request for Geolocation'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out'
            break
        }

        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false
        }))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  return {
    ...state,
    getCurrentPosition,
    coordinates: state.latitude && state.longitude 
      ? [state.longitude, state.latitude] as [number, number] 
      : undefined
  }
}
