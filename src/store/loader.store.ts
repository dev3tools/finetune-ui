import { defineStore } from "pinia";

interface LoaderState {
  loading: boolean;
  message: string;
}

export const useLoaderStore = defineStore("loader", {
  state: (): LoaderState => ({
    loading: false,
    message: "",
  }),
  actions: {
    show(message: string) {
      this.loading = true;
      this.message = message;
    },
    hide() {
      this.loading = false;
      this.message = "";
    },
  },
});
