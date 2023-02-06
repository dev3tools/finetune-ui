<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../store/user.store";
import { resetStore } from "../utils/resetStore";

const route = useRoute();
const user = useUserStore();
const router = useRouter();

function handleLogout() {
  resetStore();
  localStorage.clear();
  sessionStorage.clear();
  router.push({ name: "Login" });
}
</script>

<template>
  <main class="dashboard">
    <aside class="sidebar gradient-background">
      <div class="sidebar-content">
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
              <RouterLink :to="{ name: 'Datasets' }" class="router-link"
                >Datasets</RouterLink
              >
            </li>
            <li :class="{ selected: route.name === 'Models' }">
              <RouterLink :to="{ name: 'Models' }" class="router-link"
                >Models</RouterLink
              >
            </li>
            <li :class="{ selected: route.name === 'Settings' }">
              <RouterLink :to="{ name: 'Settings' }" class="router-link"
                >Settings</RouterLink
              >
            </li>
          </ul>
        </div>
        <div>
          <p class="user-identity" :title="user.email">
            <img :src="user.profileImage" />
            {{ user.name }}
          </p>
          <button class="logout-btn" @click.stop="handleLogout">LOGOUT</button>
        </div>
      </div>
    </aside>
    <section class="content">
      <RouterView />
    </section>
  </main>
</template>

<style scoped>
.dashboard {
  display: flex;
  height: 100vh;
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

.sidebar ul {
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
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
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: currentColor;
  display: block;
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
}

.logout-btn {
  border-radius: 10px;
  box-shadow: none;
  background: none;
  border: 2px solid #f5f5f5;
  display: flex;
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

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  .content {
    width: 100%;
  }
}
</style>
