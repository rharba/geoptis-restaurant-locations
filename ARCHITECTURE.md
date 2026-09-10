# Architecture — Geoptis Restaurant Locations

## 1. Vue d'ensemble

L'application est une application web full-stack permettant de gérer des restaurants et leurs coordonnées géographiques.

L'architecture est séparée en trois parties principales :

```text
┌─────────────────────────────┐
│        Frontend             │
│        Vue.js 3             │
│                             │
│  Interface utilisateur      │
│  Formulaires                │
│  Recherche / filtres        │
│  Carte interactive          │
└──────────────┬──────────────┘
               │
               │ HTTP / REST
               ▼
┌─────────────────────────────┐
│        Backend              │
│     Node.js + Express       │
│                             │
│  Routes API                 │
│  Validation serveur         │
│  Accès aux données          │
└──────────────┬──────────────┘
               │
               │ SQL
               ▼
┌─────────────────────────────┐
│        PostgreSQL           │
│                             │
│       restaurants           │
└─────────────────────────────┘