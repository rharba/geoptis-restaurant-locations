<script setup>
import { computed } from 'vue'

const props = defineProps({
  restaurant: {
    type: Object,
    required: true,
  },
  userLatitude: {
    type: Number,
    required: true,
  },
  userLongitude: {
    type: Number,
    required: true,
  },
})

const calculateDistance = (
  lat1,
  lon1,
  lat2,
  lon2
) => {
  const earthRadius = 6371

  const latDifference =
    ((lat2 - lat1) * Math.PI) / 180

  const lonDifference =
    ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(latDifference / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(lonDifference / 2) ** 2

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )

  return earthRadius * c
}

const distance = computed(() => {
  return calculateDistance(
    props.userLatitude,
    props.userLongitude,
    Number(props.restaurant.latitude),
    Number(props.restaurant.longitude)
  )
})
</script>

<template>
  <p class="distance">
    📏 {{ distance.toFixed(2) }} km
  </p>
</template>

<style scoped>
.distance {
  margin-top: 8px;
  color: #6b421e;
  font-size: 14px;
  font-weight: 700;
}
</style>