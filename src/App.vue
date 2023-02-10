<script setup lang="ts">
import { onBeforeMount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { refreshAccessToken } from "./services/api.service";
import { useLoaderStore } from "./store/loader.store";
import { useUserStore } from "./store/user.store";

const loader = useLoaderStore();
const user = useUserStore();
const router = useRouter();
const route = useRoute();

const refreshToken = localStorage.getItem("refresh_token");

onBeforeMount(async () => {
  if (refreshToken) {
    loader.show("Signing in...");
    try {
      const data = (await refreshAccessToken(refreshToken)).data;
      user.accessToken = data.access;
      const userProfile = JSON.parse(
        localStorage.getItem("user_profile") as string
      );
      user.email = userProfile.email;
      user.name = userProfile.name;
      user.profileImage = userProfile.profileImage;
      sessionStorage.setItem("access_token", data.accessToken);
      if (route.query.redirectTo) {
        router.replace(String(route.query.redirectTo));
      } else router.replace({ name: "Dashboard" });
    } catch (e) {
      localStorage.clear();
      sessionStorage.clear();
    }
    loader.hide();
  }
});
</script>

<template>
  <div style="width: 100%; height: 100%">
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
    <Transition name="fade" mode="in-out">
      <div v-if="loader.loading" class="loader">
        <div class="overlay"></div>
        <div class="loader-content">
          <div class="spinner"></div>
          <div class="message">{{ loader.message }}</div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.loader {
  position: fixed;
  inset: 0;
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  z-index: 100000;
}

.loader-content {
  position: absolute;
  z-index: 2;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  justify-content: center;
  align-items: center;
}

.spinner {
  display: inline-block;
  min-width: 3rem;
  width: 6vw;
  max-width: 5rem;
  aspect-ratio: 1/1;
  border: 0.75rem solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
  -webkit-animation: spin 1s linear infinite;
}

.message {
  color: #f5f5f5;
  font-weight: 500;
  font-size: 1.125rem;
}

@keyframes spin {
  to {
    -webkit-transform: rotate(360deg);
  }
}
@-webkit-keyframes spin {
  to {
    -webkit-transform: rotate(360deg);
  }
}
</style>
