
import { ScheduleBlock, HabitDef } from './types';

export const APP_NAME = "SYSTEM OS";

export const HABITS: HabitDef[] = [
  { id: 'creatine', label: 'Creatine Infusion (7g)', icon: 'Beaker' },
  { id: 'sleep', label: 'Sleep Recovery (7h+)', icon: 'Moon' },
  { id: 'reading', label: 'Intellect Up (20m)', icon: 'BookOpen' },
];

export const DAILY_PLAN: ScheduleBlock[] = [
  {
    id: 'block-0400',
    time: '04:00 AM',
    startTime: 400,
    durationMinutes: 60,
    title: 'Initialize: Wake & Fuel',
    type: 'meal',
    items: [
      { name: 'Eggs', quantity: '6 large', protein: 36, kcal: 430 },
      { name: 'Whey Protein', quantity: '1 serving', protein: 23, kcal: 118 },
    ],
    totalProtein: 59,
    totalKcal: 548,
  },
  {
    id: 'block-0630',
    time: '06:30 AM',
    startTime: 630,
    durationMinutes: 180, // 3 hours
    title: 'Quest: Breakfast & Focus',
    type: 'activity',
    items: [
      { name: 'Milk (200ml) + SF Cornflakes (40g)', quantity: '1 bowl', protein: 10, kcal: 370 },
      { name: 'Banana', quantity: '1 medium', protein: 1, kcal: 100 },
    ],
    totalProtein: 11,
    totalKcal: 470,
  },
  {
    id: 'block-0930',
    time: '09:30 AM',
    startTime: 930,
    durationMinutes: 30,
    title: 'Consumable: Snack',
    type: 'meal',
    items: [
      { name: 'Whey Protein', quantity: '1 serving', protein: 23, kcal: 118 },
      { name: 'Flavored Yogurt', quantity: '1 cup', protein: 5, kcal: 150 },
    ],
    totalProtein: 28,
    totalKcal: 268,
  },
  {
    id: 'block-1230',
    time: '12:30 PM',
    startTime: 1230,
    durationMinutes: 60,
    title: 'Main Quest: Lunch',
    type: 'meal',
    items: [
      { name: 'Chicken Breast', quantity: '200g', protein: 62, kcal: 330 },
      { name: 'Brown Rice', quantity: '200g', protein: 5, kcal: 220 },
      { name: 'Cheese / Nuggets / Cordon Bleu', quantity: 'Small portion', protein: 15, kcal: 400 },
    ],
    totalProtein: 82,
    totalKcal: 950,
  },
  {
    id: 'block-1530',
    time: '03:30 PM',
    startTime: 1530,
    durationMinutes: 45,
    title: 'Buff: Pre-Workout',
    type: 'meal',
    items: [
      { name: 'Whey Protein', quantity: '1 serving', protein: 23, kcal: 118 },
      { name: 'Apple', quantity: '1 medium', protein: 0.5, kcal: 80 },
      { name: 'Salty Biscuits', quantity: 'Small portion', protein: 2, kcal: 150 },
    ],
    totalProtein: 25.5,
    totalKcal: 348,
  },
  {
    id: 'block-1630',
    time: '04:30 PM',
    startTime: 1630,
    durationMinutes: 120,
    title: 'DUNGEON: GYM',
    type: 'workout',
    items: [
        { name: 'Heavy Compounds', quantity: 'Limit Break', protein: 0, kcal: -400 }
    ],
    totalProtein: 0,
    totalKcal: 0,
  },
  {
    id: 'block-1830',
    time: '06:30 PM',
    startTime: 1830,
    durationMinutes: 60,
    title: 'Recovery: Dinner',
    type: 'meal',
    items: [
      { name: 'Whey Protein', quantity: '1 serving', protein: 23, kcal: 118 },
      { name: 'Extras (Cheese, Sauce, Toast)', quantity: 'Optional', protein: 5, kcal: 200 },
    ],
    totalProtein: 28,
    totalKcal: 318,
  },
  {
    id: 'block-2030',
    time: '08:30 PM',
    startTime: 2030,
    durationMinutes: 30,
    title: 'Final Consumable',
    type: 'meal',
    items: [
      { name: 'Banana', quantity: '1 medium', protein: 1, kcal: 100 },
      { name: 'Leftovers (Nuggets/Cheese)', quantity: 'Small portion', protein: 5, kcal: 150 },
    ],
    totalProtein: 6,
    totalKcal: 250,
  },
];

export const TOTAL_GOALS = {
  protein: 235,
  kcal: 3350, 
  water: 3000, // 3 Liters
};

export const SYSTEM_INSTRUCTION = `
You are THE SYSTEM. An interface designed to level up the Player (User).
The Player is on a Bulking Quest.
Tone: Cold, Gamified, Efficient, Sophisticated.
Vocabulary: "Quest", "Stats", "Buffs", "Debuffs", "Consumables", "Dungeon".
Analyze the user's data. If they miss protein, issue a warning. If they succeed, grant "Experience".
Be brief. The System does not waste words.
`;

// --- NEW DATA FOR INTEL TAB ---

export const PYRAMID_LEVELS = [
  {
    name: "Level 1: Foundation",
    description: "Hydration & Micronutrients",
    items: ["Water (3L+)", "Vegetables (Greens)", "Multivitamins", "Sleep"],
    color: "from-emerald-900 to-emerald-600"
  },
  {
    name: "Level 2: Structural Integrity",
    description: "Lean Protein Sources",
    items: ["Chicken Breast", "Egg Whites", "White Fish", "Whey Isolate"],
    color: "from-purple-900 to-purple-600"
  },
  {
    name: "Level 3: Energy Matrix",
    description: "Complex Carbohydrates & Healthy Fats",
    items: ["Oats", "Rice", "Avocado", "Nuts", "Olive Oil"],
    color: "from-blue-900 to-blue-600"
  },
  {
    name: "Level 4: Optimization",
    description: "Supplements & Strategic Sugars",
    items: ["Creatine", "Pre-Workout", "Fruit (Pre/Post)", "Dark Chocolate"],
    color: "from-amber-900 to-amber-600"
  }
];

export interface NutrientItem {
  name: string;
  value: number;
  unit: string;
  serving: string;
  tag?: string;
}

export const NUTRIENT_DATABASE: Record<string, NutrientItem[]> = {
  protein: [
    { name: "Chicken Breast (Cooked)", value: 31, unit: "g", serving: "100g", tag: "Lean" },
    { name: "Whey Protein Isolate", value: 25, unit: "g", serving: "1 scoop (30g)", tag: "Fast" },
    { name: "Tuna (Canned)", value: 25, unit: "g", serving: "100g", tag: "Lean" },
    { name: "Lean Beef (95%)", value: 26, unit: "g", serving: "100g", tag: "Red Meat" },
    { name: "Greek Yogurt (0%)", value: 10, unit: "g", serving: "100g", tag: "Dairy" },
    { name: "Egg Whites", value: 11, unit: "g", serving: "100g", tag: "Pure" },
    { name: "Whole Egg", value: 6, unit: "g", serving: "1 large", tag: "Fat Source" },
    { name: "Lentils", value: 9, unit: "g", serving: "100g (cooked)", tag: "Vegan" },
    { name: "Tofu", value: 8, unit: "g", serving: "100g", tag: "Vegan" },
  ],
  calories: [
    { name: "Olive Oil", value: 884, unit: "kcal", serving: "100g", tag: "Fat" },
    { name: "Peanut Butter", value: 588, unit: "kcal", serving: "100g", tag: "Nut Butter" },
    { name: "Walnuts", value: 654, unit: "kcal", serving: "100g", tag: "Nuts" },
    { name: "Dark Chocolate (85%)", value: 600, unit: "kcal", serving: "100g", tag: "Treat" },
    { name: "Cheddar Cheese", value: 400, unit: "kcal", serving: "100g", tag: "Dairy" },
    { name: "Ground Beef (80%)", value: 254, unit: "kcal", serving: "100g", tag: "Red Meat" },
    { name: "Oats (Raw)", value: 389, unit: "kcal", serving: "100g", tag: "Carb" },
    { name: "Avocado", value: 160, unit: "kcal", serving: "100g", tag: "Healthy Fat" },
  ],
  carbs: [
    { name: "Rice (White/Raw)", value: 80, unit: "g", serving: "100g", tag: "Starch" },
    { name: "Pasta (Dry)", value: 75, unit: "g", serving: "100g", tag: "Starch" },
    { name: "Oats", value: 66, unit: "g", serving: "100g", tag: "Slow Digest" },
    { name: "Raisins", value: 79, unit: "g", serving: "100g", tag: "Sugar" },
    { name: "Potato (Baked)", value: 21, unit: "g", serving: "100g", tag: "Volume" },
    { name: "Banana", value: 23, unit: "g", serving: "100g", tag: "Fruit" },
    { name: "Sweet Potato", value: 20, unit: "g", serving: "100g", tag: "Volume" },
    { name: "Quinoa", value: 21, unit: "g", serving: "100g (cooked)", tag: "Complex" },
  ],
  fiber: [
    { name: "Chia Seeds", value: 34, unit: "g", serving: "100g", tag: "Superfood" },
    { name: "Lentils", value: 8, unit: "g", serving: "100g (cooked)", tag: "Legume" },
    { name: "Black Beans", value: 8.7, unit: "g", serving: "100g (cooked)", tag: "Legume" },
    { name: "Avocado", value: 7, unit: "g", serving: "100g", tag: "Fat" },
    { name: "Raspberries", value: 6.5, unit: "g", serving: "100g", tag: "Fruit" },
    { name: "Oats", value: 10, unit: "g", serving: "100g", tag: "Grain" },
    { name: "Broccoli", value: 2.6, unit: "g", serving: "100g", tag: "Veg" },
    { name: "Apple (w/ skin)", value: 2.4, unit: "g", serving: "100g", tag: "Fruit" },
  ]
};
