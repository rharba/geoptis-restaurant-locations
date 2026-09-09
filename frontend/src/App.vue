<script setup>
import { ref, onMounted, watch } from 'vue'
import api from './api'

import RestaurantForm from './components/RestaurantForm.vue'
import RestaurantMap from './components/RestaurantMap.vue'
import RestaurantDistance from './components/RestaurantDistance.vue'

// =========================
// RESTAURANTS
// =========================

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

// =========================
// USER LOCATION
// =========================

const userLatitude = ref(null)
const userLongitude = ref(null)
const locationError = ref('')

const getUserLocation = () => {
  if (!navigator.geolocation) {
    locationError.value =
      'La géolocalisation n’est pas disponible sur cet appareil.'

    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLatitude.value = position.coords.latitude
      userLongitude.value = position.coords.longitude
      locationError.value = ''
    },
    (error) => {
      console.error('Geolocation error:', error)

      locationError.value =
        'Impossible d’obtenir votre position. Les distances ne seront pas affichées.'
    }
  )
}

// =========================
// GOOGLE MAPS DIRECTIONS
// =========================

const getGoogleMapsUrl = (restaurant) => {
  const latitude = Number(restaurant.latitude)
  const longitude = Number(restaurant.longitude)

  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
}

// =========================
// EDIT RESTAURANT
// =========================

const editingId = ref(null)

const editName = ref('')
const editAddress = ref('')
const editLatitude = ref('')
const editLongitude = ref('')
const editCuisine = ref('')
const editPhone = ref('')

const editLoading = ref(false)
const editError = ref('')

const startEditing = (restaurant) => {
  editingId.value = restaurant.id

  editName.value = restaurant.name
  editAddress.value = restaurant.address
  editLatitude.value = restaurant.latitude
  editLongitude.value = restaurant.longitude
  editCuisine.value = restaurant.cuisine_type
  editPhone.value = restaurant.phone_number || ''

  editError.value = ''
}

const cancelEditing = () => {
  editingId.value = null
  editError.value = ''
}

const saveRestaurant = async () => {
  editError.value = ''

  // =========================
  // VALIDATION
  // =========================

  if (editName.value.trim().length < 3) {
    editError.value =
      'Le nom doit contenir au moins 3 caractères.'

    return
  }

  if (editAddress.value.trim().length < 10) {
    editError.value =
      "L'adresse doit contenir au moins 10 caractères."

    return
  }

  if (
    editLatitude.value === '' ||
    Number.isNaN(Number(editLatitude.value)) ||
    Number(editLatitude.value) < -90 ||
    Number(editLatitude.value) > 90
  ) {
    editError.value =
      'La latitude doit être comprise entre -90 et 90.'

    return
  }

  if (
    editLongitude.value === '' ||
    Number.isNaN(Number(editLongitude.value)) ||
    Number(editLongitude.value) < -180 ||
    Number(editLongitude.value) > 180
  ) {
    editError.value =
      'La longitude doit être comprise entre -180 et 180.'

    return
  }

  if (editCuisine.value === '') {
    editError.value =
      'Veuillez sélectionner une cuisine.'

    return
  }

  // Phone is optional
  if (
    editPhone.value.trim() !== '' &&
    !/^\+?[0-9\s().-]{8,20}$/.test(
      editPhone.value.trim()
    )
  ) {
    editError.value =
      'Le numéro de téléphone n’est pas valide.'

    return
  }

  // =========================
  // UPDATE RESTAURANT
  // =========================

  editLoading.value = true

  try {
    await api.put(
      `/restaurants/${editingId.value}`,
      {
        name: editName.value.trim(),
        address: editAddress.value.trim(),
        latitude: Number(editLatitude.value),
        longitude: Number(editLongitude.value),
        cuisine_type: editCuisine.value,
        phone_number:
          editPhone.value.trim() || null,
      }
    )

    editingId.value = null
    editError.value = ''

    await fetchRestaurants()
  } catch (err) {
    console.error(
      'Error updating restaurant:',
      err
    )

    if (err.response?.data?.error) {
      editError.value =
        err.response.data.error
    } else {
      editError.value =
        'Impossible de modifier le restaurant.'
    }
  } finally {
    editLoading.value = false
  }
}

// =========================
// FETCH RESTAURANTS
// =========================

const fetchRestaurants = async () => {
  loading.value = true
  error.value = ''

  try {
    let response

    // Search by name or address
    if (searchQuery.value.trim() !== '') {
      response = await api.get(
        '/restaurants/search',
        {
          params: {
            q: searchQuery.value.trim(),
          },
        }
      )
    }

    // Filter by cuisine
    else if (selectedCuisine.value !== '') {
      response = await api.get(
        '/restaurants/filter',
        {
          params: {
            cuisine:
              selectedCuisine.value,
          },
        }
      )
    }

    // Get all restaurants
    else {
      response = await api.get(
        '/restaurants'
      )
    }

    restaurants.value = response.data
  } catch (err) {
    console.error(
      'Error loading restaurants:',
      err
    )

    error.value =
      'Impossible de charger les restaurants.'

    restaurants.value = []
  } finally {
    loading.value = false
  }
}

// =========================
// WATCH SEARCH & FILTERS
// =========================

watch(
  [searchQuery, selectedCuisine],
  () => {
    fetchRestaurants()
  }
)

// =========================
// INITIAL LOAD
// =========================

onMounted(() => {
  fetchRestaurants()
  getUserLocation()
})
</script>

<template>
  <div class="app">

    <!-- =========================
         HEADER
         ========================= -->

    <header class="header">

      <div class="header-decoration">
        DÉCOUVRIR&nbsp;&nbsp;•&nbsp;&nbsp;AJOUTER&nbsp;&nbsp;•&nbsp;&nbsp;EXPLORER
      </div>

      <h1>Restaurants</h1>

      <div class="header-subtitle">
        <span>
          Gestion des restaurants
        </span>

        <span>
          et de leurs coordonnées géographiques
        </span>
      </div>

      <div class="header-tagline">
        GOOD FOOD&nbsp;&nbsp;•&nbsp;&nbsp;GOOD MOOD
      </div>

    </header>

    <main class="main">

      <!-- =========================
           ADD RESTAURANT
           ========================= -->

      <RestaurantForm
        @restaurant-created="fetchRestaurants"
      />

      <!-- =========================
           MAP
           ========================= -->

      <RestaurantMap
        :restaurants="restaurants"
      />

      <!-- =========================
           SEARCH & FILTERS
           ========================= -->

      <section class="filters">

        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher par nom ou adresse..."
        />

        <select
          v-model="selectedCuisine"
        >
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

      <!-- =========================
           LOCATION MESSAGE
           ========================= -->

      <p
        v-if="locationError"
        class="location-message"
      >
        {{ locationError }}
      </p>

      <!-- =========================
           LOADING
           ========================= -->

      <p v-if="loading">
        Chargement...
      </p>

      <!-- =========================
           ERROR
           ========================= -->

      <p
        v-if="error"
        class="error"
      >
        {{ error }}
      </p>

      <!-- =========================
           RESTAURANT LIST
           ========================= -->

      <section
        v-if="!loading && !error"
        class="restaurant-list"
      >

        <article
          v-for="restaurant in restaurants"
          :key="restaurant.id"
          class="restaurant-card"
        >

          <!-- =========================
               NORMAL VIEW
               ========================= -->

          <div
            v-if="editingId !== restaurant.id"
          >

            <h2>
              {{ restaurant.name }}
            </h2>

            <!-- GOOGLE MAPS DIRECTIONS -->

            <p class="restaurant-address">
              📍

              <a
                :href="getGoogleMapsUrl(restaurant)"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="`Obtenir l'itinéraire vers ${restaurant.name}`"
              >
                {{ restaurant.address }}
              </a>

              <span class="maps-link-icon">
                ↗
              </span>
            </p>

            <!-- CUISINE -->

            <span class="cuisine">
              🍽️ {{ restaurant.cuisine_type }}
            </span>

            <!-- COORDINATES -->

            <p class="coordinates">
              📍
              {{ Number(restaurant.latitude).toFixed(8) }},
              {{ Number(restaurant.longitude).toFixed(8) }}
            </p>

            <!-- PHONE -->

            <p
              v-if="restaurant.phone_number"
            >
              📞
              {{ restaurant.phone_number }}
            </p>

            <!-- DISTANCE -->

            <RestaurantDistance
              v-if="
                userLatitude !== null &&
                userLongitude !== null
              "
              :restaurant="restaurant"
              :userLatitude="userLatitude"
              :userLongitude="userLongitude"
            />

            <!-- EDIT BUTTON -->

            <button
              class="edit-button"
              type="button"
              @click="startEditing(restaurant)"
            >
              Modifier
            </button>

          </div>

          <!-- =========================
               EDIT VIEW
               ========================= -->

          <div
            v-else
            class="edit-form"
          >

            <h2>
              Modifier le restaurant
            </h2>

            <!-- NAME -->

            <div class="form-group">

              <label for="edit-name">
                Nom
              </label>

              <input
                id="edit-name"
                v-model="editName"
                type="text"
              />

            </div>

            <!-- ADDRESS -->

            <div class="form-group">

              <label for="edit-address">
                Adresse
              </label>

              <input
                id="edit-address"
                v-model="editAddress"
                type="text"
              />

            </div>

            <!-- COORDINATES -->

            <div class="form-row">

              <div class="form-group">

                <label for="edit-latitude">
                  Latitude
                </label>

                <input
                  id="edit-latitude"
                  v-model="editLatitude"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                />

              </div>

              <div class="form-group">

                <label for="edit-longitude">
                  Longitude
                </label>

                <input
                  id="edit-longitude"
                  v-model="editLongitude"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                />

              </div>

            </div>

            <!-- CUISINE -->

            <div class="form-group">

              <label for="edit-cuisine">
                Cuisine
              </label>

              <select
                id="edit-cuisine"
                v-model="editCuisine"
              >

                <option value="">
                  Sélectionner une cuisine
                </option>

                <option
                  v-for="cuisine in cuisines"
                  :key="cuisine"
                  :value="cuisine"
                >
                  {{ cuisine }}
                </option>

              </select>

            </div>

            <!-- PHONE -->

            <div class="form-group">

              <label for="edit-phone">
                Téléphone
              </label>

              <input
                id="edit-phone"
                v-model="editPhone"
                type="tel"
                placeholder="+33 1 23 45 67 89"
              />

            </div>

            <!-- EDIT ERROR -->

            <p
              v-if="editError"
              class="error"
            >
              {{ editError }}
            </p>

            <!-- ACTIONS -->

            <div class="edit-actions">

              <button
                class="save-button"
                type="button"
                :disabled="editLoading"
                @click="saveRestaurant"
              >
                {{
                  editLoading
                    ? 'Enregistrement...'
                    : 'Enregistrer'
                }}
              </button>

              <button
                class="cancel-button"
                type="button"
                :disabled="editLoading"
                @click="cancelEditing"
              >
                Annuler
              </button>

            </div>

          </div>

        </article>

      </section>

      <!-- =========================
           NO RESULTS
           ========================= -->

      <p
        v-if="
          !loading &&
          !error &&
          restaurants.length === 0
        "
      >
        Aucun restaurant trouvé.
      </p>

    </main>

  </div>
</template>