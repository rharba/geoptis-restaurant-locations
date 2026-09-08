<script setup>
import { ref, onMounted, watch } from 'vue'
import api from './api'
import RestaurantForm from './components/RestaurantForm.vue'

const restaurants = ref([])
const searchQuery = ref('')
const selectedCuisine = ref('')

const cuisines = [
  'Française',
  'Italienne',
  'Asiatique',
  'Américaine',
  'Méditerranéenne',
  'Autre',
]

const loading = ref(false)
const error = ref('')

const fetchRestaurants = async () => {
  loading.value = true
  error.value = ''

  try {
    let response

    // Search by name or address
    if (searchQuery.value.trim() !== '') {
      response = await api.get('/restaurants/search', {
        params: {
          q: searchQuery.value.trim(),
        },
      })
    }

    // Filter by cuisine
    else if (selectedCuisine.value !== '') {
      response = await api.get('/restaurants/filter', {
        params: {
          cuisine: selectedCuisine.value,
        },
      })
    }

    // Get all restaurants
    else {
      response = await api.get('/restaurants')
    }

    restaurants.value = response.data
  } catch (err) {
    console.error('Error loading restaurants:', err)

    error.value = 'Impossible de charger les restaurants.'
    restaurants.value = []
  } finally {
    loading.value = false
  }
}

// Watch search and cuisine filters
watch([searchQuery, selectedCuisine], () => {
  fetchRestaurants()
})

// Load restaurants when the page opens
onMounted(() => {
  fetchRestaurants()
})
</script>

<template>
  <div class="app">

    <!-- Header -->
    <header class="header">

      <div class="header-decoration">
        DÉCOUVRIR&nbsp;&nbsp;•&nbsp;&nbsp;AJOUTER&nbsp;&nbsp;•&nbsp;&nbsp;EXPLORER
      </div>

      <h1>Restaurants</h1>

      <div class="header-subtitle">
        <span>Gestion des restaurants</span>
        <span>et de leurs coordonnées géographiques</span>
      </div>

      <div class="header-tagline">
        GOOD FOOD&nbsp;&nbsp;•&nbsp;&nbsp;GOOD MOOD
      </div>

    </header>

    <main class="main">

      <!-- Add restaurant form -->
      <RestaurantForm @restaurant-created="fetchRestaurants" />

      <!-- Search and filters -->
      <section class="filters">

        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher par nom ou adresse..."
        />

        <select v-model="selectedCuisine">
          <option value="">
            Toutes les cuisines
          </option>

          <option
            v-for="cuisine in cuisines"
            :key="cuisine"
            :value="cuisine"
          >
            {{ cuisine }}
          </option>
        </select>

      </section>

      <!-- Loading -->
      <p v-if="loading">
        Chargement...
      </p>

      <!-- Error -->
      <p v-if="error" class="error">
        {{ error }}
      </p>

      <!-- Restaurant list -->
      <section
        v-if="!loading && !error"
        class="restaurant-list"
      >

        <article
          v-for="restaurant in restaurants"
          :key="restaurant.id"
          class="restaurant-card"
        >

          <h2>{{ restaurant.name }}</h2>

          <p>
            {{ restaurant.address }}
          </p>

          <span class="cuisine">
            🍽️ {{ restaurant.cuisine_type }}
          </span>

          <p class="coordinates">
            📍 {{ Number(restaurant.latitude).toFixed(8) }},
            {{ Number(restaurant.longitude).toFixed(8) }}
          </p>

          <p v-if="restaurant.phone_number">
            📞 {{ restaurant.phone_number }}
          </p>

        </article>

      </section>

      <!-- No results -->
      <p
        v-if="!loading && !error && restaurants.length === 0"
      >
        Aucun restaurant trouvé.
      </p>

    </main>

  </div>
</template>