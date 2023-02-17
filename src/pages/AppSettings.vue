<script setup lang="ts">
import { ref, onBeforeMount } from "vue";
import { useSettingsStore } from "../store/settings";
import { toast } from "vue3-toastify";

const settings = useSettingsStore();
const apiKey = ref(settings.openAiApiKey);

onBeforeMount(() => {
  settings.fetchOpenAiApiKey();
  apiKey.value = settings.openAiApiKey;
});

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
}
</script>

<template>
  <div>
    <header>
      <h1>Settings</h1>
    </header>
    <main>
      <p style="display: flex; flex-direction: column; gap: 0.5rem">
        <strong>OpenAI API key</strong>
        <a href="https://platform.openai.com/account/api-keys" target="_blank"
          >Click here to get your API key.</a
        >
      </p>
      <form @submit.prevent="handleSave">
        <input
          placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          style="max-width: 20rem; text-overflow: ellipsis"
          v-model.trim="apiKey"
        />
        <button class="primary-btn" style="width: 6rem">Save</button>
      </form>
    </main>
  </div>
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.create-btn {
  border-radius: 10px;
  border: 2px solid var(--color-text);
  display: flex;
  align-items: center;
  height: 2.5rem;
  font-weight: 500;
  width: 7.5rem;
  justify-content: center;
  transition: color 0.3s, background-color 0.3s;
  cursor: pointer;
}

.create-btn:hover {
  background-color: var(--color-text);
  color: var(--color-bg);
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
</style>
