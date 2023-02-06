import { defineStore } from "pinia";

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
  actions: {},
});
