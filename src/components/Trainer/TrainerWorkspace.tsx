import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth";
import { trainerRepository, type TrainerClientDetail, type TrainerClientSummary } from "../../repositories/TrainerRepository";
import { TrainerDashboard } from "./TrainerDashboard";
import { ClientDetail } from "./ClientDetail";

export function TrainerWorkspace() {
  const auth = useAuth();
  const repository = useMemo(() => trainerRepository, []);
  const [clients, setClients] = useState<TrainerClientSummary[]>([]);
  const [selectedClient, setSelectedClient] = useState<TrainerClientDetail | null>(null);
  const [status, setStatus] = useState(repository.getLastRepositoryStatus());

  const loadDetail = (clientId: string) => repository.getClientDetail(auth.session, clientId).then((result) => { setSelectedClient(result.data); setStatus(repository.getLastRepositoryStatus()); });

  useEffect(() => {
    let active = true;
    repository.listAssignedMembers(auth.session).then((result) => {
      if (!active) return;
      setClients(result.data);
      setStatus(repository.getLastRepositoryStatus());
      if (result.data[0]) void loadDetail(result.data[0].id);
    });
    return () => { active = false; };
  }, [auth.session]);

  return <><TrainerDashboard clients={clients} selectedClient={selectedClient} onSelectClient={(id) => void loadDetail(id)} /><ClientDetail client={selectedClient} onAddNote={(note) => selectedClient && void repository.addTrainerNote(auth.session, selectedClient.id, note).then(() => loadDetail(selectedClient.id))} onFlagRisk={(reason) => selectedClient && void repository.flagClientRisk(auth.session, selectedClient.id, reason).then(() => loadDetail(selectedClient.id))} onAssignWorkout={(workoutId) => selectedClient && void repository.assignWorkout(auth.session, selectedClient.id, workoutId).then(() => setStatus(repository.getLastRepositoryStatus()))} /><p className="trainer-status">{status}</p></>;
}
