# Hyderabad Team Outing Planner

A fullstack AI-style planner for one-day team outings in Hyderabad. Team members submit their food, cuisine, vibe, and travel preferences, and the app returns 2-3 outing plans that fit the budget and distance cap with a clear cost breakdown.

## What this project does

- Collects preferences for up to 20 team members
- Balances vegetarian and non-vegetarian food needs
- Filters venues within a configurable distance limit
- Scores outing options based on budget, travel tolerance, cuisine matches, and vibe matches
- Returns 2-3 ranked outing recommendations with:
  - venue
  - food recommendation
  - estimated per-person and total cost
  - reason summary
  - sample day agenda

## Stack

- Frontend: React + Vite
- Backend: Express
- Database: SQLite
- Recommendation engine: rule-based planner with weighted scoring

## Run locally

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- Draft session data persists in a local SQLite database and reloads automatically

## Production build

```bash
npm run build
npm run start
```

After `npm run build`, the Express server serves the compiled frontend from `dist/`.

## API

### `GET /api/meta`

Returns dropdown and chip options used by the UI.

### `POST /api/plans`

Example request:

```json
{
  "teamName": "Friday Escape Squad",
  "teamSize": 10,
  "budgetPerPerson": 800,
  "distanceLimitKm": 40,
  "members": [
    {
      "name": "Anita",
      "dietaryPreference": "vegetarian",
      "cuisinePreferences": ["south-indian", "north-indian"],
      "vibePreferences": ["relaxed", "nature"],
      "travelToleranceKm": 25
    }
  ]
}
```

## Notes

- The venue catalog is seeded with nearby Hyderabad outing locations and package-style price estimates.
- The current recommendation engine is deterministic and explainable, which makes it easy to demo and judge.
- You can extend the backend later with live venue APIs or an LLM summary layer if you want a stronger "AI" story.
