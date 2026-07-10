export const muscleGroups = ["chest","upper back","lats","lower back","shoulders","front delts","side delts","rear delts","biceps","triceps","forearms","core","abs","obliques","glutes","quadriceps","hamstrings","calves","hip abductors","hip adductors","full body","conditioning","mobility"] as const;
export type MuscleGroup = typeof muscleGroups[number];
