import { defineStore } from "pinia";
import { fetchApiKey, saveApiKey } from "../services/api.service";

interface SettingsState {
  openAiApiKey: string;
}

export const useSettingsStore = defineStore("settings", {
  state: (): SettingsState => ({
    openAiApiKey: "",
  }),
  actions: {
    async fetchOpenAiApiKey() {
      const apiKey = (await fetchApiKey()).data.api_key;
      this.openAiApiKey = apiKey;
    },
    async saveOpenAiApiKey(apiKey: string) {
      await saveApiKey(apiKey);
      this.openAiApiKey = apiKey;
      return;
    },
  },
});
