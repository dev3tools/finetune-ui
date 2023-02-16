<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../store/user.store";
import { resetStore } from "../utils/resetStore";
import { Square3Stack3DIcon, CircleStackIcon } from "@heroicons/vue/24/solid";
import {
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/vue/24/outline";
import { onBeforeMount, ref, watch } from "vue";
import { useSettingsStore } from "../store/settings";
import { useDatasetsStore } from "../store/datasets";
import { useModelsStore } from "../store/models";
import { toast } from "vue3-toastify";

const route = useRoute();
const user = useUserStore();
const router = useRouter();
const settings = useSettingsStore();
const datasetStore = useDatasetsStore();
const modelStore = useModelsStore();
const openApiKeyModal = ref(false);
const mobileNav = ref("Datasets");
const apiKey = ref("");

onBeforeMount(async () => {
  await Promise.all([
    settings.fetchOpenAiApiKey(),
    datasetStore.fetchDatasets(),
    modelStore.fetchModels(),
  ]);
  if (!settings.openAiApiKey) {
    openApiKeyModal.value = true;
  }
});

function handleLogout() {
  resetStore();
  localStorage.clear();
  sessionStorage.clear();
  router.push({ name: "Login" });
}

async function handleSave() {
  if (!apiKey.value?.trim().length) {
    return toast.error("Api Key should not be empty");
  }
  if (!apiKey.value.startsWith("sk-") || apiKey.value.length !== 51) {
    return toast.error(
      "Incorrect api key format. Please enter a valid Open AI API key"
    );
  }
  await settings.saveOpenAiApiKey(apiKey.value);
  toast.success("Api Key saved");
  openApiKeyModal.value = false;
  router.push({ name: "Dashboard" });
}

watch(
  () => route.name,
  () => {
    mobileNav.value = String(route.name);
  }
);

watch(
  () => mobileNav.value,
  () => {
    router.push({ name: mobileNav.value });
  }
);
</script>

<template>
  <main class="dashboard">
    <aside class="sidebar gradient-background">
      <nav class="sidebar-content">
        <div>
          <header>
            <h1>
              <RouterLink :to="{ name: 'Dashboard' }" class="heading"
                >Starknet.email</RouterLink
              >
            </h1>
          </header>
          <ul>
            <li :class="{ selected: route.name === 'Datasets' }">
              <RouterLink :to="{ name: 'Datasets' }" class="router-link">
                <CircleStackIcon class="icon" /> Datasets
              </RouterLink>
            </li>
            <li :class="{ selected: route.name === 'Models' }">
              <RouterLink :to="{ name: 'Models' }" class="router-link">
                <Square3Stack3DIcon class="icon" /> Models</RouterLink
              >
            </li>
            <li :class="{ selected: route.name === 'Settings' }">
              <RouterLink :to="{ name: 'Settings' }" class="router-link">
                <Cog6ToothIcon class="icon" /> Settings</RouterLink
              >
            </li>
          </ul>
        </div>
        <div>
          <p class="user-identity" :title="user.email">
            <img :src="user.profileImage" />
            <span style="overflow: hidden; text-overflow: ellipsis">{{
              user.name
            }}</span>
          </p>
          <button class="logout-btn" @click.stop="handleLogout">
            <ArrowRightOnRectangleIcon class="icon" /> LOGOUT
          </button>
        </div>
      </nav>
    </aside>
    <section class="content">
      <header class="sidebar-replacement">
        <h1>
          <RouterLink :to="{ name: 'Dashboard' }" class="heading"
            >Starknet.email</RouterLink
          >
        </h1>
        <nav class="nav">
          <select v-model="mobileNav" style="font-size: 1rem; font-weight: 500">
            <option value="Datasets">Datasets</option>
            <option value="Models">Models</option>
            <option value="Settings">Settings</option>
          </select>
          <img :src="user.profileImage" class="profile" :title="user.email" />
          <button class="primary-btn" @click.stop="handleLogout" title="Logout">
            <ArrowRightOnRectangleIcon class="icon" />
          </button>
        </nav>
      </header>
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </section>
    <Transition name="fade" mode="in-out">
      <div v-if="openApiKeyModal" class="overlay-container">
        <div class="overlay"></div>
        <div class="overlay-content">
          <div class="api-key-modal">
            <div style="display: flex; flex-direction: column; gap: 0.5rem">
              <h3>Enter OpenAI API key to continue</h3>
              <a
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                >Click here to get your API key.
              </a>
            </div>
            <form @submit.prevent="handleSave">
              <input
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                style="max-width: 20rem; text-overflow: ellipsis"
                v-model.trim="apiKey"
              />
              <button
                class="primary-btn"
                style="width: 6rem; align-self: center"
              >
                Save
              </button>
            </form>
            <div class="skip">
              Want to add later?
              <a @click.stop="openApiKeyModal = false">Skip for now.</a>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.dashboard {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.icon {
  width: 1.25rem;
}

.heading {
  display: block;
  text-decoration: none;
  color: currentColor;
  padding-inline: 0.5rem;
  margin-bottom: 2rem;
}

.sidebar {
  background-color: #8bc6ec;
  width: 240px;
}

.user-identity {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-weight: 500;
}

.user-identity img {
  border-radius: 50%;
  width: 2rem;
  aspect-ratio: 1/1;
}

.sidebar-content {
  backdrop-filter: blur(4px);
  background-color: #f5f5f540;
  width: calc(100% - 2.5rem);
  height: calc(100% - 4rem);
  padding: 2rem 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: rgba(0, 0, 0, 0.4) 2px 0 4px;
}

.sidebar-replacement {
  display: none;
}

.sidebar ul {
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

.api-key-modal {
  background: #f5f5f5;
  border-radius: 10px;
  padding: 2rem;
  width: calc(100% - 3rem);
  max-width: 360px;
  overflow-y: auto;
  max-height: calc(100% - 4rem);
}

.sidebar ul li {
  margin: 0;
  padding: 0;
  list-style: none;
  font-weight: 500;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.sidebar ul li .router-link {
  width: 100%;
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: currentColor;
}

.sidebar ul li.selected {
  background-color: #f5f5f5;
}

.content {
  flex: 1;
  height: calc(100% - 4rem);
  background-color: #f5f5f5;
  padding: 2rem;
  margin: auto;
  overflow-y: auto;
}

.logout-btn {
  border-radius: 10px;
  box-shadow: none;
  background: none;
  border: 2px solid #f5f5f5;
  display: flex;
  gap: 0.5rem;
  width: 100%;
  height: 2.5rem;
  font-weight: 600;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background 0.3s;
}

.logout-btn:hover {
  background-color: #f5f5f5;
}

h3 {
  margin: 0;
  padding: 0;
  font-size: 1.25rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

a {
  color: currentColor;
  text-underline-offset: 4px;
}

.skip {
  font-size: 0.75rem;
  margin-top: 1rem;
  text-align: center;
}

.skip a {
  text-decoration: underline;
  margin-left: 0.25rem;
  cursor: pointer;
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  header {
    margin-bottom: 1.25rem;
    margin-top: -1rem;
  }

  .content {
    width: 100%;
  }

  .sidebar-replacement {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .sidebar-replacement h1 {
    margin: 0;
  }

  .heading {
    margin-bottom: 0;
    padding: 0;
  }

  .profile {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
  }
  .nav {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .icon {
    aspect-ratio: 1/1;
  }
}
</style>
