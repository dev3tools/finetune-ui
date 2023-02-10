import { refreshAccessToken } from "../services/api.service";
import { useUserStore } from "../store/user.store";
import store from "../store";

const refreshInterval = 5 * 60 * 1000 - 100;
const user = useUserStore(store);

export function startRefreshInterval(refreshToken: string) {
  console.log("starting refresh", refreshInterval);
  setInterval(async () => {
    try {
      console.log("Refreshing");
      const data = (await refreshAccessToken(refreshToken)).data;
      user.accessToken = data.access;
      sessionStorage.setItem("access_token", data.access);
    } catch (e) {
      console.error(e);
    }
  }, refreshInterval);
}
