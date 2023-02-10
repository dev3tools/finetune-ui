import { defineStore } from "pinia";
import {
  fetchDatasets,
  createCSVDataset,
  type CreateCSVDatasetParams,
} from "../services/api.service";

type Dataset = {
  id: string;
  name: string;
  file: string;
  created: string;
  status: string;
  openai_id: string;
};

interface DatasetsState {
  datasets: Dataset[];
}

export const useDatasetsStore = defineStore("datasets", {
  state: (): DatasetsState => ({
    datasets: [],
  }),
  actions: {
    async addDataset(data: CreateCSVDatasetParams) {
      const dataset = (await createCSVDataset(data)).data;
      this.datasets.unshift(dataset);
    },
    async fetchDatasets() {
      const datasets = (await fetchDatasets()).data;
      if (datasets?.length) {
        const sortedDatasets = datasets.sort(
          (a: any, b: any) =>
            new Date(b.created).getTime() - new Date(a.created).getTime()
        );
        console.log(sortedDatasets);
        this.datasets.push(...sortedDatasets);
      }
    },
  },
});

export type { Dataset };
