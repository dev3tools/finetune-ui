import { defineStore } from "pinia";

interface UserState {
  name: string;
  email: string;
  accessToken: string;
  profileImage: string;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    name: "",
    email: "",
    accessToken: "",
    profileImage: "",
  }),
});
