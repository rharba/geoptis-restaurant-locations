# Geoptis - Restaurant Locations

Application web de gestion de restaurants et de leurs coordonnées géographiques.

## Technologies

- Vue.js 3
- Node.js
- Express.js
- PostgreSQL
- Axios

## Installation

### Backend

```bash
cd backend
npm install
node src/server.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```
## API

### Create a restaurant

```http
POST /api/restaurants
```

### Get all restaurants

```http
GET /api/restaurants
```

### Search restaurants

```http
GET /api/restaurants/search?q=Paris
```

### Filter by cuisine

```http
GET /api/restaurants/filter?cuisine=Italienne
```