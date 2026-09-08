<script setup>
import { ref } from 'vue'
import api from '../api'

const emit = defineEmits(['restaurant-created'])

const name = ref('')
const address = ref('')
const latitude = ref('')
const longitude = ref('')
const cuisineType = ref('')
const phoneNumber = ref('')

const loading = ref(false)
const error = ref('')
const success = ref('')

const cuisines = [
  'Française',
  'Italienne',
  'Asiatique',
  'Américaine',
  'Méditerranéenne',
  'Autre',
]

const submitForm = async () => {
  error.value = ''
  success.value = ''

  // Client-side validation

  if (name.value.trim().length < 3) {
    error.value = 'Le nom doit contenir au moins 3 caractères.'
    return
  }

  if (address.value.trim().length < 10) {
    error.value = "L'adresse doit contenir au moins 10 caractères."
    return
  }

  if (
    latitude.value === '' ||
    Number(latitude.value) < -90 ||
    Number(latitude.value) > 90
  ) {
    error.value = 'La latitude doit être comprise entre -90 et 90.'
    return
  }

  if (
    longitude.value === '' ||
    Number(longitude.value) < -180 ||
    Number(longitude.value) > 180
  ) {
    error.value = 'La longitude doit être comprise entre -180 et 180.'
    return
  }

  if (cuisineType.value === '') {
    error.value = 'Veuillez sélectionner une cuisine.'
    return
  }

  // Phone validation - optional field
  if (
    phoneNumber.value.trim() !== '' &&
    !/^\+?[0-9\s().-]{8,20}$/.test(phoneNumber.value.trim())
  ) {
    error.value = 'Le numéro de téléphone n’est pas valide.'
    return
  }

  loading.value = true

  try {
    await api.post('/restaurants', {
      name: name.value.trim(),
      address: address.value.trim(),
      latitude: Number(latitude.value),
      longitude: Number(longitude.value),
      cuisine_type: cuisineType.value,
      phone_number: phoneNumber.value.trim() || null,
    })

    success.value = 'Restaurant ajouté avec succès !'

    // Clear form
    name.value = ''
    address.value = ''
    latitude.value = ''
    longitude.value = ''
    cuisineType.value = ''
    phoneNumber.value = ''

    // Tell App.vue to reload the restaurant list
    emit('restaurant-created')
  } catch (err) {
    console.error(err)

    if (err.response?.data?.error) {
      error.value = err.response.data.error
    } else {
      error.value = "Impossible d'ajouter le restaurant."
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="restaurant-form">
    <h2>Ajouter un restaurant</h2>

    <form @submit.prevent="submitForm" novalidate>

      <div class="form-group">
        <label for="name">Nom *</label>

        <input
          id="name"
          v-model="name"
          type="text"
          placeholder="Nom du restaurant"
        />
      </div>

      <div class="form-group">
        <label for="address">Adresse *</label>

        <input
          id="address"
          v-model="address"
          type="text"
          placeholder="Adresse du restaurant"
        />
      </div>

      <div class="form-row">

        <div class="form-group">
          <label for="latitude">Latitude *</label>

          <input
            id="latitude"
            v-model="latitude"
            type="number"
            step="any"
            min="-90"
            max="90"
            placeholder="Ex : 48.8566"
          />
        </div>

        <div class="form-group">
          <label for="longitude">Longitude *</label>

          <input
            id="longitude"
            v-model="longitude"
            type="number"
            step="any"
            min="-180"
            max="180"
            placeholder="Ex : 2.3522"
          />
        </div>

      </div>

      <div class="form-group">
        <label for="cuisine">Cuisine *</label>

        <select id="cuisine" v-model="cuisineType">
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

      <div class="form-group">
        <label for="phone">Téléphone</label>

        <input
          id="phone"
          v-model="phoneNumber"
          type="tel"
          placeholder="Ex : +33 1 23 45 67 89"
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Ajout en cours...' : 'Ajouter le restaurant' }}
      </button>

    </form>

    <p v-if="error" class="error">
      {{ error }}
    </p>

    <p v-if="success" class="success">
      {{ success }}
    </p>

  </section>
</template>