export const venueCatalog = [
  {
    id: "hidden-castle",
    name: "Hidden Castle Resort",
    area: "Shamirpet",
    distanceKm: 27,
    idealFor: ["resort", "team-games", "relaxed"],
    vegetarianFriendly: true,
    nonVegetarianFriendly: true,
    cuisineOptions: ["north-indian", "south-indian", "barbecue"],
    pricing: {
      entryPerPerson: 350,
      foodVegPerPerson: 260,
      foodNonVegPerPerson: 340,
      transportPerPerson: 140
    },
    highlights: [
      "Poolside day outing package",
      "Indoor and outdoor team activities",
      "Large buffet options for mixed food preferences"
    ]
  },
  {
    id: "alankrita",
    name: "Leonia - Alankrita Day Out",
    area: "Shamirpet",
    distanceKm: 32,
    idealFor: ["resort", "premium", "team-games"],
    vegetarianFriendly: true,
    nonVegetarianFriendly: true,
    cuisineOptions: ["north-indian", "continental", "south-indian"],
    pricing: {
      entryPerPerson: 420,
      foodVegPerPerson: 250,
      foodNonVegPerPerson: 320,
      transportPerPerson: 160
    },
    highlights: [
      "Well-known corporate day outing venue",
      "Lawns and activity areas for group sessions",
      "Buffet service supports veg and non-veg split"
    ]
  },
  {
    id: "dream-valley",
    name: "Dream Valley Resort",
    area: "Moinabad",
    distanceKm: 34,
    idealFor: ["resort", "nature", "relaxed"],
    vegetarianFriendly: true,
    nonVegetarianFriendly: true,
    cuisineOptions: ["south-indian", "north-indian", "chinese"],
    pricing: {
      entryPerPerson: 300,
      foodVegPerPerson: 230,
      foodNonVegPerPerson: 310,
      transportPerPerson: 170
    },
    highlights: [
      "Green spaces and open seating",
      "Good fit for calm teams that want time together",
      "Comfortable all-day budget profile"
    ]
  },
  {
    id: "treasure-island",
    name: "Treasure Island",
    area: "Gandipet",
    distanceKm: 24,
    idealFor: ["adventure", "team-games", "outdoor"],
    vegetarianFriendly: true,
    nonVegetarianFriendly: true,
    cuisineOptions: ["south-indian", "north-indian", "fast-food"],
    pricing: {
      entryPerPerson: 280,
      foodVegPerPerson: 220,
      foodNonVegPerPerson: 290,
      transportPerPerson: 110
    },
    highlights: [
      "Adventure-focused activities and lawn games",
      "Shorter travel time for west Hyderabad offices",
      "Flexible meal packages for mixed teams"
    ]
  },
  {
    id: "district-gravity",
    name: "District Gravity",
    area: "Kokapet",
    distanceKm: 18,
    idealFor: ["adventure", "indoor", "team-games"],
    vegetarianFriendly: true,
    nonVegetarianFriendly: true,
    cuisineOptions: ["continental", "fast-food", "north-indian"],
    pricing: {
      entryPerPerson: 390,
      foodVegPerPerson: 210,
      foodNonVegPerPerson: 270,
      transportPerPerson: 90
    },
    highlights: [
      "Modern activity center with indoor games",
      "Easy reach for shorter travel cap teams",
      "Works well for half-day activity plus meal plan"
    ]
  },
  {
    id: "mrugavani-retreat",
    name: "Mrugavani Nature Retreat",
    area: "Chilkur",
    distanceKm: 25,
    idealFor: ["nature", "outdoor", "relaxed"],
    vegetarianFriendly: true,
    nonVegetarianFriendly: false,
    cuisineOptions: ["south-indian", "north-indian"],
    pricing: {
      entryPerPerson: 180,
      foodVegPerPerson: 240,
      foodNonVegPerPerson: 0,
      transportPerPerson: 120
    },
    highlights: [
      "Nature-first outing with low overall cost",
      "Great for teams that prefer quieter settings",
      "Best suited when the group can accept vegetarian catering"
    ]
  }
];

export const plannerMeta = {
  officeDefaults: {
    city: "Hyderabad",
    maxDistanceKm: 40,
    budgetPerPerson: 800
  },
  dietaryOptions: ["vegetarian", "non-vegetarian", "either"],
  cuisineOptions: [
    "north-indian",
    "south-indian",
    "continental",
    "chinese",
    "barbecue",
    "fast-food"
  ],
  vibeOptions: ["relaxed", "adventure", "nature", "team-games", "indoor", "premium", "outdoor"]
};
