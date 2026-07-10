export interface MealPhoto { id:string; mealId:string; url:string; caption:string; order:number; storageProvider:"local-mock"|"supabase-ready"; analysisStatus:"manual entry"|"AI analysis pending"|"trainer reviewed"|"unreviewed"; archived:boolean; }
const KEY="gymcord.mealPhotos";
export class MealPhotoRepository { list():MealPhoto[]{return JSON.parse(localStorage.getItem(KEY)||"[]");} saveAll(photos:MealPhoto[]){localStorage.setItem(KEY,JSON.stringify(photos));} archive(photoId:string){this.saveAll(this.list().map(p=>p.id===photoId?{...p,archived:true}:p));} }
export const mealPhotoRepository = new MealPhotoRepository();
