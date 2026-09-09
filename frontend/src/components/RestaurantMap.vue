<script setup>
import {
  onMounted,
  onBeforeUnmount,
  ref,
  watch,
} from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  restaurants: {
    type: Array,
    default: () => [],
  },
})

const mapContainer = ref(null)

let map = null
let markersLayer = null

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

    marker.bindPopup(`
      <strong>${restaurant.name}</strong><br>
      ${restaurant.address}<br>
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

watch(
  () => props.restaurants,
  () => {
    updateMarkers()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  if (map) {
    map.remove()
  }
})
</script>

<template>
  <section class="map-section">
    <h2>Carte des restaurants</h2>

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