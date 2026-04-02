import { plannerMeta, venueCatalog } from "./data/venues.js";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Planner request is missing.");
  }

  const { teamSize, budgetPerPerson, distanceLimitKm, members } = payload;

  if (!teamSize || teamSize < 1) {
    throw new Error("Team size must be at least 1.");
  }

  if (!budgetPerPerson || budgetPerPerson < 300) {
    throw new Error("Budget per person must be at least Rs. 300.");
  }

  if (!distanceLimitKm || distanceLimitKm < 5) {
    throw new Error("Distance limit must be at least 5 km.");
  }

  if (!Array.isArray(members) || members.length === 0) {
    throw new Error("Add at least one team member preference.");
  }
}

function countBy(items, selector) {
  return items.reduce((acc, item) => {
    const value = selector(item);
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function flattenVotes(members, key) {
  return members.flatMap((member) => member[key] || []);
}

function topTags(members, key, limit = 3) {
  const counts = countBy(flattenVotes(members, key), (value) => value);
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

function analyzeGroup(members, budgetPerPerson, distanceLimitKm) {
  const dietaryCounts = countBy(members, (member) => member.dietaryPreference || "either");
  const vegCount = (dietaryCounts.vegetarian || 0) + (dietaryCounts.either || 0);
  const nonVegCount = (dietaryCounts["non-vegetarian"] || 0) + (dietaryCounts.either || 0);

  return {
    memberCount: members.length,
    dietaryCounts,
    vegRequiredCount: dietaryCounts.vegetarian || 0,
    nonVegInterestedCount: dietaryCounts["non-vegetarian"] || 0,
    canDoVegOnly: (dietaryCounts["non-vegetarian"] || 0) === 0,
    vegCount,
    nonVegCount,
    topCuisines: topTags(members, "cuisinePreferences"),
    topVibes: topTags(members, "vibePreferences"),
    averageTravelTolerance:
      members.reduce((sum, member) => sum + Number(member.travelToleranceKm || distanceLimitKm), 0) /
      members.length,
    budgetPerPerson,
    distanceLimitKm
  };
}

function getFoodPlan(venue, profile) {
  const eitherMeals = profile.memberCount - profile.vegRequiredCount - profile.nonVegInterestedCount;
  let nonVegMeals = profile.nonVegInterestedCount + Math.round(eitherMeals * 0.5);
  let finalVegMeals = profile.memberCount - nonVegMeals;

  if (!venue.nonVegetarianFriendly && nonVegMeals > 0) {
    if (!profile.canDoVegOnly) {
      return null;
    }

    nonVegMeals = 0;
    finalVegMeals = profile.memberCount;
  }

  const totalFood =
    finalVegMeals * venue.pricing.foodVegPerPerson + nonVegMeals * venue.pricing.foodNonVegPerPerson;
  const averageFood = totalFood / profile.memberCount;

  return {
    label:
      venue.nonVegetarianFriendly && nonVegMeals > 0
        ? `Mixed buffet with ${finalVegMeals} veg and ${nonVegMeals} non-veg meals`
        : "Vegetarian buffet for the whole team",
    finalVegMeals,
    nonVegMeals,
    averageFood
  };
}

function scoreVenue(venue, profile) {
  if (venue.distanceKm > profile.distanceLimitKm) {
    return null;
  }

  if (venue.distanceKm > profile.averageTravelTolerance + 8) {
    return null;
  }

  const foodPlan = getFoodPlan(venue, profile);
  if (!foodPlan) {
    return null;
  }

  const averageCostPerPerson =
    venue.pricing.entryPerPerson + foodPlan.averageFood + venue.pricing.transportPerPerson;
  if (averageCostPerPerson > profile.budgetPerPerson) {
    return null;
  }

  let score = 100;

  score -= Math.max(0, venue.distanceKm - profile.averageTravelTolerance) * 1.5;
  score -= Math.max(0, averageCostPerPerson - profile.budgetPerPerson * 0.8) * 0.08;

  const vibeMatches = venue.idealFor.filter((tag) => profile.topVibes.includes(tag)).length;
  const cuisineMatches = venue.cuisineOptions.filter((tag) => profile.topCuisines.includes(tag)).length;
  score += vibeMatches * 9;
  score += cuisineMatches * 6;

  if (venue.vegetarianFriendly && profile.vegRequiredCount > 0) {
    score += 5;
  }
  if (venue.nonVegetarianFriendly && profile.nonVegInterestedCount > 0) {
    score += 5;
  }

  const costBuffer = profile.budgetPerPerson - averageCostPerPerson;
  score += Math.min(12, costBuffer / 25);

  return {
    venue,
    foodPlan,
    averageCostPerPerson,
    score
  };
}

function formatPlan(scoredVenue, profile, rank) {
  const { venue, foodPlan, averageCostPerPerson, score } = scoredVenue;
  const totalCost = averageCostPerPerson * profile.memberCount;
  const totalTransport = venue.pricing.transportPerPerson * profile.memberCount;
  const totalEntry = venue.pricing.entryPerPerson * profile.memberCount;
  const totalFood = Math.round(foodPlan.averageFood * profile.memberCount);

  const reasons = [
    `${venue.distanceKm} km from the office keeps travel within the requested cap`,
    `${foodPlan.label.toLowerCase()} supports the group's dietary split`,
    `Estimated at ${currency.format(Math.round(averageCostPerPerson))} per person, which stays within budget`
  ];

  if (profile.topVibes.length > 0) {
    const matchingVibes = venue.idealFor.filter((tag) => profile.topVibes.includes(tag));
    if (matchingVibes.length > 0) {
      reasons.push(`Best fit for the group's preferred vibe: ${matchingVibes.join(", ")}`);
    }
  }

  return {
    id: venue.id,
    rank,
    score: Math.round(score),
    title:
      rank === 1 ? "Best balanced plan" : rank === 2 ? "Value-first backup plan" : "Experience-led option",
    venue: {
      name: venue.name,
      area: venue.area,
      distanceKm: venue.distanceKm,
      highlights: venue.highlights
    },
    food: {
      recommendation: foodPlan.label,
      cuisinesSupported: venue.cuisineOptions
    },
    costBreakdown: {
      perPerson: Math.round(averageCostPerPerson),
      totalEstimated: Math.round(totalCost),
      entryTotal: totalEntry,
      foodTotal: totalFood,
      transportTotal: totalTransport
    },
    reasons,
    agenda: [
      "9:00 AM: Leave office by cab or tempo traveller",
      "10:00 AM: Welcome snacks and check-in for activities",
      "11:00 AM: Team games / free time based on venue style",
      "1:00 PM: Group lunch",
      "3:30 PM: Wrap-up and return"
    ]
  };
}

export function getPlannerMeta() {
  return plannerMeta;
}

export function generateOutingPlans(payload) {
  validatePayload(payload);

  const profile = analyzeGroup(payload.members, payload.budgetPerPerson, payload.distanceLimitKm);

  const scored = venueCatalog
    .map((venue) => scoreVenue(venue, profile))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (scored.length === 0) {
    throw new Error(
      "No outing plans match this combination of budget, distance, and food preferences. Try increasing the budget or distance cap slightly."
    );
  }

  return {
    summary: {
      teamSize: payload.teamSize,
      budgetPerPerson: payload.budgetPerPerson,
      distanceLimitKm: payload.distanceLimitKm,
      topCuisines: profile.topCuisines,
      topVibes: profile.topVibes,
      dietarySplit: profile.dietaryCounts
    },
    plans: scored.map((item, index) => formatPlan(item, profile, index + 1))
  };
}
