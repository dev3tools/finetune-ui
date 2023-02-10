<script setup lang="ts">
import { onMounted, onBeforeMount, onBeforeUnmount } from "vue";
import jwt_decode from "jwt-decode";
import { useUserStore } from "../store/user.store";
import { useRouter } from "vue-router";
import { trackGoogleLogin } from "../services/api.service";
import { startRefreshInterval } from "../utils/refreshToken";
import { useLoaderStore } from "../store/loader.store";

const user = useUserStore();
const router = useRouter();
const loader = useLoaderStore();

onBeforeMount(() => {
  document.body.classList.add("gradient-background");
});

onBeforeUnmount(() => {
  document.body.classList.remove("gradient-background");
});

onMounted(() => {
  (google as any).accounts.id.initialize({
    client_id:
      "340742341613-ep6502depv329e40u9pa1nvsb5kk2iph.apps.googleusercontent.com",
    callback: handleSignIn,
  });
  const parent = document.getElementById("google_btn");
  google.accounts.id.renderButton(parent, {
    theme: "outline",
    shape: "rectangular",
    type: "standard",
    text: "signin_with",
    size: "large",
    logo_alignment: "left",
  });
  google.accounts.id.prompt();
});

async function handleSignIn(data: any) {
  loader.show("Signing in with google...");
  let apiResponse;
  try {
    apiResponse = (await trackGoogleLogin(data.credential)).data;
  } catch (e) {
    loader.hide();
    return;
  }
  const userDetails: any = jwt_decode(data.credential);
  user.accessToken = apiResponse.tokens.access;
  sessionStorage.setItem("access_token", apiResponse.tokens.access);
  localStorage.setItem("refresh_token", apiResponse.tokens.refresh);
  startRefreshInterval(apiResponse.tokens.refresh);
  user.email = userDetails.email;
  user.profileImage = userDetails.picture;
  user.name = userDetails.name;
  const userProfile = {
    name: user.name,
    email: user.email,
    profileImage: user.profileImage,
  };
  localStorage.setItem("user_profile", JSON.stringify(userProfile));
  loader.hide();
  router.replace({ name: "Dashboard" });
}
</script>

<template>
  <main class="background">
    <section class="container">
      <img src="../assets/vue.svg" alt="Logo" />
      <div class="app-details">
        <h1>Welcome to the ChatGPT App</h1>
        <p>Description of the app</p>
      </div>
      <p>Please sign in with your Google account to continue</p>
      <div id="google_btn" class="g_id_signin"></div>
    </section>
  </main>
</template>

<style scoped>
.background {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  background-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
  justify-items: center;
  border-radius: 10px;
}

.app-details {
  display: grid;
  gap: 0.25rem;
  grid-template-columns: 1fr;
  justify-items: center;
}

.app-details p {
  font-size: 1.125rem;
}

img {
  width: 4rem;
  aspect-ratio: 1/1;
  margin-bottom: 20px;
}

h1,
p {
  margin: 0;
}
</style>
