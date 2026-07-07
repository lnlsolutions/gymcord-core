import type { WorkoutDay } from "../types/gymcord";

export const workouts: WorkoutDay[] = [
  {
    id: "day-1-heavy-glutes",
    day: "Day 1",
    title: "Heavy Glute Strength",
    focus: "Heavy strength, progressive overload, maximum glute activation",
    duration: 55,
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
    exercises: [
      {
        id: "db-hip-thrust",
        name: "DB Hip Thrust",
        prescription: "5 sets × 8 reps",
        equipment: "Dumbbell + bench",
        difficulty: "Intermediate",
        image:
          "https://images.unsplash.com/photo-1517963628607-235ccdd5476c?auto=format&fit=crop&w=900&q=80",
        muscles: ["Glutes", "Hamstrings", "Core"],
        description:
          "Sit with upper back against a bench, dumbbell across hips, feet planted. Drive hips upward until your torso is flat.",
        cues: ["Chin tucked", "Ribs down", "Push through heels", "Pause and squeeze"],
      },
      {
        id: "bulgarian-split-squat",
        name: "Bulgarian Split Squat",
        prescription: "4 sets × 10 each leg",
        equipment: "Dumbbells + bench",
        difficulty: "Intermediate",
        image:
          "https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=900&q=80",
        muscles: ["Glutes", "Quads", "Hamstrings"],
        description:
          "Place rear foot on a bench and step the front foot forward. Lower slowly, then drive up through the front heel.",
        cues: ["Slight forward lean", "Long stride", "Heel pressure", "Control the bottom"],
      },
      {
        id: "romanian-deadlift",
        name: "Romanian Deadlift",
        prescription: "4 sets × 10 reps",
        equipment: "Dumbbells",
        difficulty: "Intermediate",
        image:
          "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80",
        muscles: ["Hamstrings", "Glutes", "Back"],
        description:
          "Hold dumbbells in front of thighs. Push hips back, keep knees soft, lower until hamstrings stretch, then stand tall.",
        cues: ["Hips back", "Flat back", "Dumbbells close", "Squeeze glutes"],
      },
      {
        id: "bench-step-ups",
        name: "Bench Step-Ups",
        prescription: "3 sets × 12 each leg",
        equipment: "Dumbbells + bench",
        difficulty: "Beginner",
        image:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80",
        muscles: ["Glutes", "Quads", "Core"],
        description:
          "Place full foot on bench. Step up by driving through the working heel, then lower with control.",
        cues: ["Full foot on bench", "No bouncing", "Control down", "Use glute to lift"],
      },
      {
        id: "glute-bridge-hold",
        name: "Glute Bridge Hold",
        prescription: "3 sets × 60 sec",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        image:
          "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80",
        muscles: ["Glutes", "Core"],
        description:
          "Lie on back with knees bent. Lift hips and hold the top position while squeezing glutes hard.",
        cues: ["Pelvis tucked", "Ribs down", "Knees stable", "Max squeeze"],
      },
    ],
  },
  {
    id: "day-2-glutes-hamstrings",
    day: "Day 2",
    title: "Glutes & Hamstrings",
    focus: "Hinge strength, posterior chain control, hamstring stretch",
    duration: 50,
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
    exercises: [
      {
        id: "single-leg-rdl",
        name: "Single-Leg RDL",
        prescription: "4 sets × 10 each leg",
        equipment: "Dumbbells",
        difficulty: "Intermediate",
        image:
          "https://images.unsplash.com/photo-1517344368193-41552b6ad3f5?auto=format&fit=crop&w=900&q=80",
        muscles: ["Glutes", "Hamstrings", "Core"],
        description:
          "Hold dumbbell in one or both hands. Hinge forward while one leg reaches back, then return to standing.",
        cues: ["Square hips", "Slow lower", "Soft knee", "Glute stretch"],
      },
      {
        id: "db-sumo-squat",
        name: "DB Sumo Squat",
        prescription: "4 sets × 12 reps",
        equipment: "Dumbbell",
        difficulty: "Beginner",
        image:
          "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
        muscles: ["Glutes", "Quads", "Adductors"],
        description:
          "Take a wide stance with toes slightly out. Hold dumbbell low, squat down, then drive up through heels.",
        cues: ["Knees out", "Chest tall", "Deep range", "Squeeze top"],
      },
      {
        id: "single-leg-hip-thrust",
        name: "Single-Leg Hip Thrust",
        prescription: "3 sets × 12 each leg",
        equipment: "Bench",
        difficulty: "Intermediate",
        image:
          "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=900&q=80",
        muscles: ["Glutes", "Hamstrings"],
        description:
          "Upper back on bench, one foot planted, one leg lifted. Drive hips up using the planted leg.",
        cues: ["Hips level", "Heel drive", "Pause top", "No back arch"],
      },
      {
        id: "frog-pumps",
        name: "Frog Pumps",
        prescription: "3 sets × 30 reps",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        image:
          "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?auto=format&fit=crop&w=900&q=80",
        muscles: ["Glutes"],
        description:
          "Lie on back with soles together and knees open. Lift hips in short, strong reps.",
        cues: ["Soles together", "Knees open", "Short range", "Constant squeeze"],
      },
      {
        id: "wall-sit",
        name: "Wall Sit",
        prescription: "3 sets × 60 sec",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        image:
          "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=900&q=80",
        muscles: ["Quads", "Glutes", "Core"],
        description:
          "Sit against wall with knees bent. Press through heels and squeeze glutes while holding.",
        cues: ["Back flat", "Heels down", "Knees steady", "Breathe"],
      },
    ],
  },
  {
    id: "day-3-glute-pump",
    day: "Day 3",
    title: "Glute Pump",
    focus: "Volume, blood flow, constant tension, muscle connection",
    duration: 45,
    image:
      "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=900&q=80",
    exercises: [
      {
        id: "db-hip-thrust-high-rep",
        name: "DB Hip Thrust",
        prescription: "4 sets × 15 reps",
        equipment: "Dumbbell + bench",
        difficulty: "Intermediate",
        image:
          "https://images.unsplash.com/photo-1517963628607-235ccdd5476c?auto=format&fit=crop&w=900&q=80",
        muscles: ["Glutes", "Hamstrings"],
        description:
          "Use hip thrust setup, but perform higher reps with constant tension and a strong lockout.",
        cues: ["Smooth reps", "No resting bottom", "Hard squeeze", "Controlled tempo"],
      },
      {
        id: "walking-lunges",
        name: "Walking Lunges",
        prescription: "3 sets × 20 steps",
        equipment: "Bodyweight or dumbbells",
        difficulty: "Intermediate",
        image:
          "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=900&q=80",
        muscles: ["Glutes", "Quads", "Core"],
        description:
          "Step forward into a long lunge, lower with control, and push through the front heel into the next step.",
        cues: ["Long stride", "Forward lean", "Heel drive", "Control knee"],
      },
      {
        id: "goblet-squat",
        name: "Goblet Squat",
        prescription: "3 sets × 15 reps",
        equipment: "Dumbbell",
        difficulty: "Beginner",
        image:
          "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=80",
        muscles: ["Glutes", "Quads", "Core"],
        description:
          "Hold dumbbell at chest. Squat deep while keeping knees tracking out and torso strong.",
        cues: ["Deep stretch", "Knees out", "Core tight", "Drive up"],
      },
      {
        id: "glute-bridge",
        name: "Glute Bridge",
        prescription: "3 sets × 20 reps",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        image:
          "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80",
        muscles: ["Glutes", "Core"],
        description:
          "Lie on back, feet planted. Lift hips, squeeze glutes, and lower under control.",
        cues: ["Tuck pelvis", "Heel pressure", "Pause top", "Do not overarch"],
      },
      {
        id: "bridge-pulses",
        name: "Bridge Pulses",
        prescription: "3 sets × 40 reps",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        image:
          "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=900&q=80",
        muscles: ["Glutes"],
        description:
          "Hold bridge position and perform small pulses at the top without losing glute tension.",
        cues: ["Stay high", "Tiny pulses", "Knees out", "Keep squeeze"],
      },
    ],
  },
  {
    id: "day-4-isolation-burnout",
    day: "Day 4",
    title: "Isolation Burnout",
    focus: "Glute shape, symmetry, high-rep activation, burnout finish",
    duration: 40,
    image:
      "https://images.unsplash.com/photo-1571019613914-85f342c6a11e?auto=format&fit=crop&w=900&q=80",
    exercises: [
      {
        id: "b-stance-hip-thrust",
        name: "B-Stance Hip Thrust",
        prescription: "4 sets × 12 each leg",
        equipment: "Bench",
        difficulty: "Intermediate",
        image:
          "https://images.unsplash.com/photo-1517963628607-235ccdd5476c?auto=format&fit=crop&w=900&q=80",
        muscles: ["Glutes", "Hamstrings"],
        description:
          "Set up like a hip thrust with one foot slightly forward and the other lightly assisting.",
        cues: ["Front leg works", "Back foot light", "Hips square", "Pause top"],
      },
      {
        id: "curtsy-lunge",
        name: "Curtsy Lunge",
        prescription: "3 sets × 15 each leg",
        equipment: "Bodyweight or dumbbells",
        difficulty: "Beginner",
        image:
          "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=900&q=80",
        muscles: ["Glutes", "Outer glutes", "Quads"],
        description:
          "Step one leg diagonally behind the other, lower slowly, then drive up through the front glute.",
        cues: ["Control hips", "Slow lower", "Outer glute focus", "Stay balanced"],
      },
      {
        id: "donkey-kicks",
        name: "Donkey Kicks",
        prescription: "3 sets × 20 each leg",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        image:
          "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?auto=format&fit=crop&w=900&q=80",
        muscles: ["Glutes"],
        description:
          "On hands and knees, drive one heel upward while keeping core tight and hips controlled.",
        cues: ["Heel to ceiling", "No back arch", "Pause top", "Slow reps"],
      },
      {
        id: "fire-hydrants",
        name: "Fire Hydrants",
        prescription: "3 sets × 20 each leg",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        image:
          "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=900&q=80",
        muscles: ["Outer glutes", "Hip stabilizers"],
        description:
          "On hands and knees, lift one knee out to the side using the outer glute.",
        cues: ["Open from hip", "Core tight", "Pause briefly", "No twisting"],
      },
      {
        id: "frog-pumps-burnout",
        name: "Frog Pumps",
        prescription: "100 total reps",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        image:
          "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?auto=format&fit=crop&w=900&q=80",
        muscles: ["Glutes"],
        description:
          "Finish with high-rep frog pumps. Break into sets as needed while keeping tension.",
        cues: ["Soles together", "Fast squeeze", "Keep hips active", "Burnout finish"],
      },
    ],
  },
];

export const mealSuggestions = [
  {
    title: "High Protein Breakfast",
    meal: "Eggs, turkey bacon, oats, berries",
    protein: "35–45g",
    calories: "450–600",
  },
  {
    title: "Glute Growth Bowl",
    meal: "Chicken, rice, avocado, veggies",
    protein: "40–55g",
    calories: "550–750",
  },
  {
    title: "Quick Snack",
    meal: "Greek yogurt, granola, honey",
    protein: "20–30g",
    calories: "250–400",
  },
  {
    title: "Dinner Builder",
    meal: "Salmon, potatoes, asparagus",
    protein: "35–50g",
    calories: "500–700",
  },
  {
    title: "Budget Protein Bowl",
    meal: "Ground turkey, rice, black beans, salsa",
    protein: "45–60g",
    calories: "600–800",
  },
  {
    title: "Fast Smoothie",
    meal: "Protein powder, banana, peanut butter, almond milk",
    protein: "30–45g",
    calories: "350–550",
  },
];
