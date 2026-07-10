export const equipmentTypes = ["bodyweight","dumbbells","barbells","cables","resistance bands","machines","kettlebells","bench","pull-up bar","cardio equipment","no equipment"] as const;
export type EquipmentType = typeof equipmentTypes[number];
