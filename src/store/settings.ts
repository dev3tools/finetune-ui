import { defineStore } from "pinia";

interface SettingsState {
  openAiApiKey: string;
}

export const useSettingsStore = defineStore("settings", {
  state: (): SettingsState => ({
    openAiApiKey: "",
  }),
});
