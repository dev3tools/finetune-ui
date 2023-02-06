import { useUserStore } from "../store/user.store";
import { useDatasetsStore } from "../store/datasets";
import { useModelsStore } from "../store/models";
import { useSettingsStore } from "../store/settings";

export function resetStore() {
  const user = useUserStore();
  const datasets = useDatasetsStore();
  const models = useModelsStore();
  const settings = useSettingsStore();

  user.$reset();
  datasets.$reset();
  models.$reset();
  settings.$reset();
}
