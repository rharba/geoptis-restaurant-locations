<script setup>
import {
  onMounted,
  onBeforeUnmount,
  ref,
  watch,
} from 'vue'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const props = defineProps({
  restaurants: {
    type: Array,
    default: () => [],
  },
})

const mapContainer = ref(null)

let map = null
let markersLayer = null

// Fix Leaflet default marker icons when using Vite
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = defaultIcon

// =========================
// GOOGLE MAPS DIRECTIONS
// =========================

const getGoogleMapsUrl = (restaurant) => {
  const latitude = Number(restaurant.latitude)
  const longitude = Number(restaurant.longitude)

  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
}

// =========================
// UPDATE MARKERS
// =========================

const updateMarkers = () => {
  if (!markersLayer) return

  markersLayer.clearLayers()

  const bounds = []

  props.restaurants.forEach((restaurant) => {
    const latitude = Number(restaurant.latitude)
    const longitude = Number(restaurant.longitude)

    if (
      Number.isNaN(latitude) ||
      Number.isNaN(longitude)
    ) {
      return
    }

    const marker = L.marker([
      latitude,
      longitude,
    ])

    const googleMapsUrl =
      getGoogleMapsUrl(restaurant)

    marker.bindPopup(`
      <strong>${restaurant.name}</strong><br>

      <a
        href="${googleMapsUrl}"
        target="_blank"
        rel="noopener noreferrer"
        style="
          color: #6b421e;
          text-decoration: none;
          font-weight: 600;
        "
      >
        ${restaurant.address} ↗
      </a>

      <br>

      ${restaurant.cuisine_type}
    `)

    marker.addTo(markersLayer)

    bounds.push([
      latitude,
      longitude,
    ])
  })

  // Automatically adjust the map to show all restaurants
  if (bounds.length > 0) {
    map.fitBounds(bounds, {
      padding: [30, 30],
    })
  }
}

// =========================
// INITIALIZE MAP
// =========================

onMounted(() => {
  map = L.map(mapContainer.value).setView(
    [48.8566, 2.3522],
    13
  )

  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution:
        '&copy; OpenStreetMap contributors',
    }
  ).addTo(map)

  markersLayer = L.layerGroup().addTo(map)

  updateMarkers()
})

// =========================
// WATCH RESTAURANTS
// =========================

watch(
  () => props.restaurants,
  () => {
    updateMarkers()
  },
  {
    deep: true,
  }
)

// =========================
// CLEANUP
// =========================

onBeforeUnmount(() => {
  if (map) {
    map.remove()
  }
})
</script>

<template>
  <section class="map-section">

    <h2>
      Carte des restaurants
    </h2>

    <div
      ref="mapContainer"
      class="restaurant-map"
    ></div>

  </section>
</template>

<style scoped>
.map-section {
  margin-bottom: 35px;
}

.map-section h2 {
  margin-bottom: 18px;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 30px;
  color: #2f1b0c;
}

.restaurant-map {
  width: 100%;
  height: 450px;
  border-radius: 14px;
  border: 1.5px solid #9a7651;
  box-shadow: 6px 6px 0 #6b421e;
  overflow: hidden;
}
</style>