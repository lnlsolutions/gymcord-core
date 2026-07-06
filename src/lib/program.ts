import type { WorkoutDay } from "../types/gymcord";

export const workouts: WorkoutDay[] = [
  {
    day: "Day 1",
    title: "Heavy Glute Strength",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
    focus: "Strength + progressive overload",
    exercises: [
      {
        name: "DB Hip Thrust",
        prescription: "5 sets × 8 reps",
        description: "Sit with upper back against a bench, dumbbell across hips, feet planted. Drive hips upward until your torso is flat.",
        cues: ["Chin tucked", "Ribs down", "Push through heels", "Pause and squeeze"],
      },
      {
        name: "Bulgarian Split Squat",
        prescription: "4 sets × 10 each leg",
        description: "Place rear foot on bench and step the front foot forward. Lower slowly, then drive up through the front heel.",
        cues: ["Slight forward lean", "Long stride", "Heel pressure", "Control the bottom"],
      },
      {
        name: "Romanian Deadlift",
        prescription: "4 sets × 10 reps",
        description: "Hold dumbbells in front of thighs. Push hips back, keep knees soft, lower until hamstrings stretch, then stand tall.",
        cues: ["Hips back", "Flat back", "Dumbbells close", "Squeeze glutes"],
      },
      {
        name: "Bench Step-Ups",
        prescription: "3 sets × 12 each leg",
        description: "Place full foot on bench. Step up by driving through the working heel, then lower with control.",
        cues: ["Full foot on bench", "No bouncing", "Control down", "Use glute to lift"],
      },
      {
        name: "Glute Bridge Hold",
        prescription: "3 sets × 60 sec",
        description: "Lie on back with knees bent. Lift hips and hold the top position while squeezing glutes hard.",
        cues: ["Pelvis tucked", "Ribs down", "Knees stable", "Max squeeze"],
      },
    ],
  },
  {
    day: "Day 2",
    title: "Glutes & Hamstrings",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
    focus: "Hinge strength + hamstring stretch",
    exercises: [
      {
        name: "Single-Leg RDL",
        prescription: "4 sets × 10 each leg",
        description: "Hold dumbbell in one or both hands. Hinge forward while one leg reaches back, then return to standing.",
        cues: ["Square hips", "Slow lower", "Soft knee", "Glute stretch"],
      },
      {
        name: "DB Sumo Squat",
        prescription: "4 sets × 12 reps",
        description: "Take a wide stance with toes slightly out. Hold dumbbell low, squat down, then drive up through heels.",
        cues: ["Knees out", "Chest tall", "Deep range", "Squeeze top"],
      },
      {
        name: "Single-Leg Hip Thrust",
        prescription: "3 sets × 12 each leg",
        description: "Upper back on bench, one foot planted, one leg lifted. Drive hips up using the planted leg.",
        cues: ["Hips level", "Heel drive", "Pause top", "No back arch"],
      },
      {
        name: "Frog Pumps",
        prescription: "3 sets × 30 reps",
        description: "Lie on back with soles together and knees open. Lift hips in short, strong reps.",
        cues: ["Soles together", "Knees open", "Short range", "Constant squeeze"],
      },
      {
        name: "Wall Sit",
        prescription: "3 sets × 60 sec",
        description: "Sit against wall with knees bent. Press through heels and squeeze glutes while holding.",
        cues: ["Back flat", "Heels down", "Knees steady", "Breathe"],
      },
    ],
  },
  {
    day: "Day 3",
    title: "Glute Pump",
    image: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=900&q=80",
    focus: "Volume + constant tension",
    exercises: [
      {
        name: "DB Hip Thrust",
        prescription: "4 sets × 15 reps",
        description: "Use hip thrust setup, but perform higher reps with constant tension and a strong lockout.",
        cues: ["Smooth reps", "No resting bottom", "Hard squeeze", "Controlled tempo"],
      },
      {
        name: "Walking Lunges",
        prescription: "3 sets × 20 steps",
        description: "Step forward into a long lunge, lower with control, and push through the front heel into the next step.",
        cues: ["Long stride", "Forward lean", "Heel drive", "Control knee"],
      },
      {
        name: "Goblet Squat",
        prescription: "3 sets × 15 reps",
        description: "Hold dumbbell at chest. Squat deep while keeping knees tracking out and torso strong.",
        cues: ["Deep stretch", "Knees out", "Core tight", "Drive up"],
      },
      {
        name: "Glute Bridge",
        prescription: "3 sets × 20 reps",
        description: "Lie on back, feet planted. Lift hips, squeeze glutes, and lower under control.",
        cues: ["Tuck pelvis", "Heel pressure", "Pause top", "Do not overarch"],
      },
      {
        name: "Bridge Pulses",
        prescription: "3 sets × 40 reps",
        description: "Hold bridge position and perform small pulses at the top without losing glute tension.",
        cues: ["Stay high", "Tiny pulses", "Knees out", "Keep squeeze"],
      },
    ],
  },
  {
    day: "Day 4",
    title: "Isolation Burnout",
    image: "https://images.unsplash.com/photo-1571019613914-85f342c6a11e?auto=format&fit=crop&w=900&q=80",
    focus: "Shape + high-rep burn",
    exercises: [
      {
        name: "B-Stance Hip Thrust",
        prescription: "4 sets × 12 each leg",
        description: "Set up like a hip thrust with one foot slightly forward and the other lightly assisting.",
        cues: ["Front leg works", "Back foot light", "Hips square", "Pause top"],
      },
      {
        name: "Curtsy Lunge",
        prescription: "3 sets × 15 each leg",
        description: "Step one leg diagonally behind the other, lower slowly, then drive up through the front glute.",
        cues: ["Control hips", "Slow lower", "Outer glute focus", "Stay balanced"],
      },
      {
        name: "Donkey Kicks",
        prescription: "3 sets × 20 each leg",
        description: "On hands and knees, drive one heel upward while keeping core tight and hips controlled.",
        cues: ["Heel to ceiling", "No back arch", "Pause top", "Slow reps"],
      },
      {
        name: "Fire Hydrants",
        prescription: "3 sets × 20 each leg",
        description: "On hands and knees, lift one knee out to the side using the outer glute.",
        cues: ["Open from hip", "Core tight", "Pause briefly", "No twisting"],
      },
      {
        name: "Frog Pumps",
        prescription: "100 total reps",
        description: "Finish with high-rep frog pumps. Break into sets as needed while keeping tension.",
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
];
