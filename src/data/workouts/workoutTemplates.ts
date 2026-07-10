import { exerciseCatalog, type CatalogExercise, type Difficulty } from "../exercises/exerciseCatalog";
import type { EquipmentType } from "./equipmentTypes";
import type { MuscleGroup } from "./muscleGroups";
export interface WorkoutTemplate { id:string; title:string; trainingDay:string; level:Difficulty; equipment:EquipmentType[]; muscleGroups:MuscleGroup[]; durationMinutes:number; exercises:CatalogExercise[]; tags:string[]; }
const by = (...ids:string[]) => ids.map((id) => exerciseCatalog.find((exercise) => exercise.id === id)).filter(Boolean) as CatalogExercise[];
const t=(id:string,title:string,trainingDay:string,level:Difficulty,equipment:EquipmentType[],muscleGroups:MuscleGroup[],ids:string[]):WorkoutTemplate=>({id,title,trainingDay,level,equipment,muscleGroups,durationMinutes:45,exercises:by(...ids),tags:[trainingDay,level,...muscleGroups]});
export const workoutTemplates: WorkoutTemplate[] = [
t("push-day","Push Day","Push Day","intermediate",["dumbbells","barbells","cables"],["chest","shoulders","triceps"],["db-bench","ohp","lateral-raise","triceps-pressdown"]),
t("pull-day","Pull Day","Pull Day","intermediate",["pull-up bar","dumbbells","cables"],["upper back","lats","biceps"],["pull-up","row","lat-pulldown","curl"]),
t("leg-day","Leg Day","Leg Day","intermediate",["barbells","machines"],["quadriceps","hamstrings","glutes","calves"],["squat","rdl","leg-curl","calf-raise"]),
t("core-day","Core Day","Core Day","beginner",["bodyweight","no equipment"],["core","abs","obliques"],["plank","dead-bug","side-plank"]),
t("upper-body","Upper Body Day","Upper Body Day","intermediate",["dumbbells","bench","pull-up bar"],["chest","upper back","shoulders","biceps","triceps"],["db-bench","row","ohp","curl","triceps-pressdown"]),
t("lower-body","Lower Body Day","Lower Body Day","intermediate",["barbells","machines","resistance bands"],["glutes","quadriceps","hamstrings","calves"],["squat","hip-thrust","leg-curl","band-walk","calf-raise"]),
t("full-body","Full Body Day","Full Body Day","beginner",["dumbbells","bodyweight"],["full body"],["push-up","row","squat","plank"]),
t("chest-triceps","Chest + Triceps","Chest + Triceps","intermediate",["dumbbells","cables","bench"],["chest","triceps"],["db-bench","cable-fly","triceps-pressdown","push-up"]),
t("back-biceps","Back + Biceps","Back + Biceps","intermediate",["pull-up bar","cables","dumbbells"],["upper back","lats","biceps"],["pull-up","lat-pulldown","row","curl"]),
t("shoulders-core","Shoulders + Core","Shoulders + Core","beginner",["dumbbells","bodyweight"],["shoulders","side delts","rear delts","core"],["ohp","lateral-raise","rear-delt-fly","plank"]),
t("glutes-hams","Glutes + Hamstrings","Glutes + Hamstrings","intermediate",["barbells","machines","bench"],["glutes","hamstrings"],["hip-thrust","rdl","leg-curl","band-walk"]),
t("quads-calves","Quads + Calves","Quads + Calves","intermediate",["barbells","machines"],["quadriceps","calves"],["squat","calf-raise","leg-curl"]),
t("strength-day","Strength Day","Strength Day","advanced",["barbells"],["full body"],["squat","db-bench","rdl","ohp"]),
t("hypertrophy-day","Hypertrophy Day","Hypertrophy Day","intermediate",["dumbbells","machines","cables"],["full body"],["db-bench","lat-pulldown","leg-curl","lateral-raise","curl"]),
t("conditioning-day","Conditioning Day","Conditioning Day","beginner",["cardio equipment","bodyweight"],["conditioning"],["treadmill","burpee","farmers-carry"]),
t("mobility-recovery","Mobility + Recovery Day","Mobility + Recovery Day","beginner",["bodyweight","no equipment"],["mobility"],["world-greatest","dead-bug","side-plank"]),
t("beginner-full-body","Beginner Full Body","Beginner Full Body","beginner",["bodyweight","dumbbells","no equipment"],["full body"],["push-up","row","squat","dead-bug"]),
t("intermediate-full-body","Intermediate Full Body","Intermediate Full Body","intermediate",["dumbbells","barbells"],["full body"],["db-bench","pull-up","squat","rdl"]),
t("advanced-full-body","Advanced Full Body","Advanced Full Body","advanced",["barbells","pull-up bar","kettlebells"],["full body"],["pull-up","squat","rdl","kb-swing","copenhagen"]),
t("home-dumbbell","At-Home Dumbbell Workout","At-Home Dumbbell Workout","beginner",["dumbbells","bodyweight"],["full body"],["push-up","row","curl","plank"]),
t("cable-machine","Cable Machine Workout","Cable Machine Workout","beginner",["cables","machines"],["chest","lats","triceps"],["cable-fly","lat-pulldown","triceps-pressdown"]),
t("barbell","Barbell Workout","Barbell Workout","intermediate",["barbells"],["full body"],["squat","rdl","ohp"]),
t("bodyweight","Bodyweight Workout","Bodyweight Workout","beginner",["bodyweight","no equipment"],["full body"],["push-up","plank","burpee","world-greatest"])
];
export const findWorkoutTemplate=(id:string)=>workoutTemplates.find((workout)=>workout.id===id);
