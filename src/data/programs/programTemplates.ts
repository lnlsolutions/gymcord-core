import { trainingSplits } from "./trainingSplits";
export const programTemplates = trainingSplits.map((split) => ({ id:`program-${split.id}`, title:split.title, splitId:split.id, durationWeeks:4, ownership:"member-owned-template", archiveInsteadOfDelete:true }));
