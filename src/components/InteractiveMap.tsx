'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Button } from '@/components/ui/button'
import { Crown, Flame, MapPin, Vote } from 'lucide-react'
import type { BattleZone } from '@/types'

interface InteractiveMapProps {
  zones: {
    id: string
    name: string
    color: string
    heatLevel: number
    totalVotes: number
    activeVendors: number
  }[]
  onZoneClick: (zoneId: string) => void
  onVoteClick: (zoneId: string) => void
  userLocation?: [number, number]
}

// Coordenadas reales de CDMX para las zonas
const CDMX_ZONES: Record<string, [number, number][]> = {
  'centro': [
    [19.4326, -99.1332], // Centro histórico
    [19.4285, -99.1276],
    [19.4367, -99.1388],
    [19.4285, -99.1388]
  ],
  'norte': [
    [19.4500, -99.1500], // Zona norte
    [19.4450, -99.1450],
    [19.4550, -99.1550],
    [19.4450, -99.1550]
  ],
  'sur': [
    [19.4000, -99.1200], // Zona sur
    [19.3950, -99.1150],
    [19.4050, -99.1250],
    [19.3950, -99.1250]
  ],
  'este': [
    [19.4200, -99.1000], // Zona este
    [19.4150, -99.0950],
    [19.4250, -99.1050],
    [19.4150, -99.1050]
  ],
  'oeste': [
    [19.4200, -99.1600], // Zona oeste
    [19.4150, -99.1550],
    [19.4250, -99.1650],
    [19.4150, -99.1650]
  ]
}

export function InteractiveMap({ zones, onZoneClick, onVoteClick, userLocation }: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Inicializar mapa
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      },
      center: [-99.1332, 19.4326], // CDMX centro
      zoom: 11,
      maxZoom: 18,
      minZoom: 9
    })

    // Evento cuando el mapa se carga
    map.current.on('load', () => {
      setMapLoaded(true)
      addZoneLayers()
      addUserLocation()
    })

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Añadir capas de zonas cuando el mapa esté listo
  useEffect(() => {
    if (mapLoaded && map.current) {
      addZoneLayers()
    }
  }, [mapLoaded, zones])

  const addZoneLayers = () => {
    if (!map.current || !mapLoaded) return

    // Limpiar capas existentes
    const existingLayers = map.current.getStyle().layers?.map(l => l.id) || []
    existingLayers.forEach(layerId => {
      if (layerId.startsWith('zone-') || layerId.startsWith('zone-label-')) {
        if (map.current?.getLayer(layerId)) {
          map.current.removeLayer(layerId)
        }
      }
    })

    // Añadir fuentes de datos para cada zona
    zones.forEach((zone, index) => {
      const zoneKey = zone.id.toLowerCase()
      const coordinates = CDMX_ZONES[zoneKey]
      
      if (!coordinates) return

      // Añadir fuente de datos para la zona
      const sourceId = `zone-${zone.id}`
      if (map.current?.getSource(sourceId)) {
        map.current.removeSource(sourceId)
      }

      map.current?.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {
            zoneId: zone.id,
            zoneName: zone.name,
            heatLevel: zone.heatLevel,
            totalVotes: zone.totalVotes,
            activeVendors: zone.activeVendors,
            color: zone.color
          },
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates]
          }
        }
      })

      // Añadir capa de relleno de zona
      map.current?.addLayer({
        id: `zone-${zone.id}`,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': zone.color,
          'fill-opacity': 0.3
        }
      })

      // Añadir borde de zona
      map.current?.addLayer({
        id: `zone-border-${zone.id}`,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': zone.color,
          'line-width': 3,
          'line-opacity': 0.8
        }
      })

      // Añadir etiqueta de zona
      map.current?.addLayer({
        id: `zone-label-${zone.id}`,
        type: 'symbol',
        source: sourceId,
        layout: {
          'text-field': zone.name,
          'text-size': 14,
          'text-font': ['Open Sans Bold'],
          'text-allow-overlap': true
        },
        paint: {
          'text-color': '#2d1810',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2
        }
      })

      // Añadir interactividad
      map.current?.on('click', `zone-${zone.id}`, () => {
        setSelectedZone(zone.id)
        onZoneClick(zone.id)
      })

      // Hover effects
      map.current?.on('mouseenter', `zone-${zone.id}`, () => {
        map.current?.setPaintProperty(`zone-${zone.id}`, 'fill-opacity', 0.6)
        if (map.current?.getCanvas()) {
          map.current.getCanvas().style.cursor = 'pointer'
        }
      })

      map.current?.on('mouseleave', `zone-${zone.id}`, () => {
        map.current?.setPaintProperty(`zone-${zone.id}`, 'fill-opacity', 0.3)
        if (map.current?.getCanvas()) {
          map.current.getCanvas().style.cursor = ''
        }
      })
    })
  }

  const addUserLocation = () => {
    if (!map.current || !userLocation) return

    // Añadir marcador de ubicación del usuario
    const el = document.createElement('div')
    el.className = 'user-location-marker'
    el.style.width = '20px'
    el.style.height = '20px'
    el.style.borderRadius = '50%'
    el.style.backgroundColor = '#ff6b35'
    el.style.border = '3px solid white'
    el.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)'

    new maplibregl.Marker(el)
      .setLngLat(userLocation)
      .addTo(map.current)
  }

  const handleVoteClick = (zoneId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onVoteClick(zoneId)
  }

  const getZoneStats = (zoneId: string) => {
    return zones.find(z => z.id === zoneId)
  }

  return (
    <div className="relative w-full h-full">
      {/* Contenedor del mapa */}
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      />
      
      {/* Controles del mapa */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <Button
          onClick={() => map.current?.zoomIn()}
          className="w-10 h-10 p-0 bg-white/90 hover:bg-white text-gray-800"
        >
          +
        </Button>
        <Button
          onClick={() => map.current?.zoomOut()}
          className="w-10 h-10 p-0 bg-white/90 hover:bg-white text-gray-800"
        >
          −
        </Button>
        <Button
          onClick={() => map.current?.flyTo({ center: [-99.1332, 19.4326], zoom: 11 })}
          className="w-10 h-10 p-0 bg-white/90 hover:bg-white text-gray-800"
        >
          <MapPin className="w-4 h-4" />
        </Button>
      </div>

      {/* Panel de zona seleccionada */}
      {selectedZone && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-[#ff6b35]/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[#2d1810] text-lg">
              {getZoneStats(selectedZone)?.name}
            </h3>
            <Button
              onClick={() => setSelectedZone(null)}
              className="w-8 h-8 p-0 bg-gray-200 hover:bg-gray-300 text-gray-600"
            >
              ×
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Flame className="w-4 h-4 text-[#ff6b35]" />
                <span className="text-sm font-semibold text-[#2d1810]">
                  {getZoneStats(selectedZone)?.totalVotes || 0}
                </span>
              </div>
              <p className="text-xs text-[#6b5d52]">Total Votes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Crown className="w-4 h-4 text-[#ffd23f]" />
                <span className="text-sm font-semibold text-[#2d1810]">
                  {getZoneStats(selectedZone)?.activeVendors || 0}
                </span>
              </div>
              <p className="text-xs text-[#6b5d52]">Active Vendors</p>
            </div>
          </div>
          
          <Button
            onClick={(e) => handleVoteClick(selectedZone, e)}
            className="w-full bg-[#ff6b35] hover:bg-[#e5562e] text-white font-bold py-2 rounded-lg flex items-center justify-center space-x-2"
          >
            <Vote className="w-4 h-4" />
            <span>Vote for this Zone</span>
          </Button>
        </div>
      )}

      {/* Leyenda del mapa */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-[#ff6b35]/20">
        <h4 className="text-xs font-semibold text-[#2d1810] mb-2">Battle Zones</h4>
        <div className="space-y-1">
          {zones.map((zone) => (
            <div key={zone.id} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: zone.color }}
              />
              <span className="text-xs text-[#6b5d52]">{zone.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
