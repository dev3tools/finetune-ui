import { defineStore } from "pinia";
import { fetchModel, fetchModels } from "../services/api.service";

type Model = {
  id: string;
  name: string;
  status: string;
  openai_id: string;
  created: string;
  trained_model: string;
  dataset: string;
};

interface ModelsState {
  models: Model[];
}

export const useModelsStore = defineStore("models", {
  state: (): ModelsState => ({
    models: [],
  }),
  actions: {
    async fetchModels() {
      const models = (await fetchModels()).data;
      if (models?.length) {
        const sortedModels = models.sort(
          (a: any, b: any) =>
            new Date(b.created).getTime() - new Date(a.created).getTime()
        );
        console.log(sortedModels);
        this.models = [...sortedModels];
      }
    },
  },
});

export type { Model };
