<script setup lang="ts">
import { ref, computed, onBeforeMount, type Ref } from "vue";
import { useDatasetsStore } from "../store/datasets";
import { useModelsStore, type Model } from "../store/models";
import { toast } from "vue3-toastify";
import { useLoaderStore } from "../store/loader.store";
import {
  ask,
  createModel,
  deleteModel,
  updateModel,
} from "../services/api.service";
import { getTimeAgo } from "../utils/timeAgo";
import { XMarkIcon } from "@heroicons/vue/24/outline";

const datasetStore = useDatasetsStore();
const modelStore = useModelsStore();
const modelName = ref("");
const openCreateModal = ref(false);
const openUpdateModal = ref(false);
const openDeleteModal = ref(false);
const openPlaygroundModal = ref(false);
const selectedDataset = ref("");
const selectedModel: Ref<Model | null> = ref(null);
const loader = useLoaderStore();
const models = computed(() => modelStore.models);
const playground = ref({
  question: "",
  answer: "",
  placeholder: "Answer to you question will show up here",
});

onBeforeMount(() => {
  modelStore.fetchModels();
});

async function handleSubmit() {
  if (!modelName.value.trim().length) {
    return toast.error("Enter the model name to continue");
  }
  if (!selectedDataset.value) {
    return toast.error("Select a dataset to continue");
  }
  loader.show("Saving the model...");
  try {
    await createModel(selectedDataset.value, modelName.value);
    toast.success("Model saved");
    modelStore.fetchModels();
    modelName.value = "";
    selectedDataset.value = "";
    openCreateModal.value = false;
  } catch (e) {
    toast.error("Something went wrong while saving the model. Try again");
  } finally {
    loader.hide();
  }
}

async function handleUpdate() {
  if (!modelName.value.trim().length) {
    return toast.error("Enter the model name to continue");
  }
  loader.show("Updating the model...");
  try {
    await updateModel((selectedModel.value as Model).id, modelName.value);
    toast.success("Model saved");
    modelStore.fetchModels();
    modelName.value = "";
    selectedModel.value = null;
    openUpdateModal.value = false;
  } catch (e) {
    toast.error("Something went wrong while saving the model. Try again");
  } finally {
    loader.hide();
  }
}

function getDataset(datasetId: string) {
  return (
    datasetStore.datasets.find((dataset) => dataset.id === datasetId)?.name ||
    ""
  );
}

async function handleDelete() {
  loader.show("Deleting the model...");
  try {
    await deleteModel((selectedModel.value as Model).id);
    toast.success("Model deleted");
    modelStore.fetchModels();
    selectedModel.value = null;
    openDeleteModal.value = false;
  } catch (e) {
    toast.error("Something went wrong while saving the model. Try again");
  } finally {
    loader.hide();
  }
}

function openModel(model: Model) {
  selectedModel.value = model;
  modelName.value = model.name;
  openUpdateModal.value = true;
}

function handleCreateCancel() {
  modelName.value = "";
  selectedDataset.value = "";
  openCreateModal.value = false;
}

function handleUpdateCancel() {
  modelName.value = "";
  selectedModel.value = null;
  openUpdateModal.value = false;
}

function handleDeleteCancel() {
  selectedModel.value = null;
  openDeleteModal.value = false;
}

function openDelete(model: Model) {
  selectedModel.value = model;
  openDeleteModal.value = true;
}

function openPlayground(model: Model) {
  selectedModel.value = model;
  openPlaygroundModal.value = true;
}

function clearFields() {
  playground.value = {
    question: "",
    answer: "",
    placeholder: "Answer to you question will show up here",
  };
}

async function handlePlaygroundSubmit() {
  if (!playground.value.question?.trim().length) {
    return toast.error("Please enter the question to continue");
  }
  playground.value.placeholder = "Loading";
  const loadingInterval = setInterval(() => {
    if (playground.value.placeholder.endsWith("....")) {
      playground.value.placeholder = "Loading";
    }
    playground.value.placeholder += ".";
  }, 1000);
  try {
    playground.value.answer = (
      await ask(
        (selectedModel.value as Model).openai_id,
        playground.value.question
      )
    ).data;
  } catch (e) {
    toast.error(
      "Error occured while processing your request. Check your model's status and try again"
    );
  } finally {
    clearInterval(loadingInterval);
    playground.value.placeholder = "Answer to you question will show up here";
  }
}

function closePlayground() {
  clearFields();
  selectedModel.value = null;
  openPlaygroundModal.value = false;
}
</script>

<template>
  <div>
    <header>
      <h1>My Models</h1>
      <button class="create-btn" @click.stop="openCreateModal = true">
        Create Model
      </button>
    </header>
    <main>
      <p class="empty-model" v-if="!models.length">
        You don’t have any models yet.
        <span class="create-model" @click.stop="openCreateModal = true"
          >Click here to create a new model</span
        >.
      </p>
      <div class="models" v-else>
        <div
          v-for="model in models"
          :key="JSON.stringify(model)"
          class="model-card"
        >
          <h4>{{ model.name }}</h4>
          <div>
            <span class="strong">OpenAI Id: </span>{{ model.openai_id }}
          </div>
          <div>
            <span class="strong">Dataset: </span>{{ getDataset(model.dataset) }}
          </div>
          <div>
            <span class="strong">Created: </span
            ><span style="text-transform: capitalize">{{
              getTimeAgo(new Date(model.created))
            }}</span>
          </div>
          <div>
            <span class="strong">Status: </span
            ><span style="text-transform: capitalize">{{ model.status }}</span>
          </div>
          <div class="card-buttons">
            <button class="primary-btn" @click.stop="openPlayground(model)">
              Open playground
            </button>
            <button class="secondary-btn" @click.stop="openModel(model)">
              Update
            </button>
            <button class="secondary-btn" @click.stop="openDelete(model)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </main>
    <Transition name="fade" mode="in-out">
      <div v-if="openCreateModal" class="overlay-container">
        <div class="overlay"></div>
        <div class="overlay-content">
          <div class="create-model-modal">
            <h3>Create a new model</h3>
            <form class="form" @submit.prevent="handleSubmit">
              <div class="form-group">
                <label for="value">Model Name</label>
                <input
                  id="name"
                  placeholder="Eg: My First Dataset."
                  v-model="modelName"
                />
              </div>
              <div class="form-group">
                <label>Dataset</label>
                <select v-model="selectedDataset">
                  <option value="" disabled selected>Select a dataset</option>
                  <option
                    v-for="dataset in datasetStore.datasets"
                    :key="dataset.openai_id"
                    :value="dataset.id"
                  >
                    {{ dataset.name }}
                  </option>
                </select>
              </div>
              <div class="buttons">
                <button
                  class="secondary-btn"
                  type="button"
                  @click.stop="handleCreateCancel"
                >
                  Cancel
                </button>
                <button class="primary-btn" type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
    <Transition name="fade" mode="in-out">
      <div v-if="openUpdateModal" class="overlay-container">
        <div class="overlay"></div>
        <div class="overlay-content">
          <div class="create-model-modal">
            <h3>Model details</h3>
            <form class="form" @submit.prevent="handleUpdate">
              <div class="form-group">
                <label for="value">Model Name</label>
                <input
                  id="name"
                  placeholder="Eg: My First Dataset."
                  v-model="modelName"
                />
              </div>
              <div class="form-group">
                <label>Selected Dataset</label>
                <input
                  id="dataset"
                  disabled
                  :value="getDataset((selectedModel as Model).dataset)"
                />
              </div>
              <div class="buttons">
                <button
                  class="secondary-btn"
                  type="button"
                  @click.stop="handleUpdateCancel"
                >
                  Cancel
                </button>
                <button class="primary-btn" type="submit">Update</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
    <Transition name="fade" mode="in-out">
      <div v-if="openDeleteModal" class="overlay-container">
        <div class="overlay"></div>
        <div class="overlay-content">
          <div class="create-model-modal">
            <h3>Are you sure?</h3>
            <p>This action will delete your existing model</p>
            <p>Model Name: {{ selectedModel?.name }}</p>
            <form class="form" @submit.prevent="handleDelete">
              <div class="buttons">
                <button
                  class="secondary-btn"
                  type="button"
                  @click.stop="handleDeleteCancel"
                >
                  Cancel
                </button>
                <button class="primary-btn" type="submit">Delete</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
    <Transition name="fade" mode="in-out">
      <div v-if="openPlaygroundModal" class="overlay-container">
        <div class="overlay"></div>
        <div class="overlay-content">
          <div class="playground-modal">
            <button
              class="close-icon"
              title="Close"
              @click.stop="closePlayground"
            >
              <XMarkIcon style="width: 2rem" />
            </button>
            <h3>{{ selectedModel?.name }} Playground</h3>
            <form class="chat-form" @submit.prevent="handlePlaygroundSubmit">
              <div class="form-group" style="flex: 1">
                <label for="prompt">Enter the question</label>
                <textarea
                  id="prompt"
                  rows="5"
                  placeholder="Enter the prompt to get answer"
                  v-model="playground.question"
                ></textarea>
              </div>
              <button
                title="Send"
                class="primary-btn"
                style="align-self: end; width: 7.5rem"
              >
                Send
              </button>
            </form>
            <div class="form-group" style="margin-top: 1rem">
              <label for="value">Answer</label>
              <textarea
                disabled
                id="value"
                rows="5"
                :placeholder="playground.placeholder"
                v-model="playground.answer"
              ></textarea>
            </div>
            <div style="margin-top: 1rem; display: flex; justify-content: end">
              <button
                class="secondary-btn"
                type="reset"
                style="width: 7.5rem"
                @click.stop="clearFields"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

textarea {
  resize: none;
}

.form-group * {
  flex: unset;
}

.create-model-modal {
  background: #f5f5f5;
  border-radius: 20px;
  padding: 2rem;
  width: calc(100% - 3rem);
  max-width: 360px;
  overflow-y: auto;
  max-height: calc(100% - 4rem);
}

.close-icon {
  position: absolute;
  right: 1.5rem;
  top: 1.5rem;
  box-shadow: none;
  border: none;
  background: none;
  padding: 0.5rem;
  cursor: pointer;
}

.playground-modal {
  position: relative;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 2rem;
  width: calc(100% - 3rem);
  max-width: 600px;
  overflow-y: auto;
  max-height: calc(100% - 4rem);
}

.chats {
  height: 50vh;
  background: #e1ebee;
  border-radius: 10px;
}

.buttons {
  display: flex;
  gap: 1rem;
  flex: 1;
  justify-content: stretch;
  margin-top: 1rem;
}

.buttons button {
  flex: 1;
}

.card-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  flex: 1;
  margin-top: 1rem;
}

.card-buttons button {
  width: 8rem;
}

option {
  padding: 2rem;
}

.empty-model {
  font-weight: 500;
}

.create-model {
  cursor: pointer;
}

.models {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.model-card {
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-radius: 20px;
  border: 1px solid currentColor;
}

.strong {
  font-weight: 500;
}

.model-card > div,
.model-card > h4 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

h3 {
  margin: 0;
  padding: 0;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

h4 {
  margin: 0;
  padding: 0;
  font-size: 1.125rem;
}

.chat-form {
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
  gap: 1rem;
}

.chat-form textarea {
  flex: 1;
}

@media screen and (max-width: 768px) {
  .buttons {
    flex-direction: column;
    gap: 1rem;
  }

  .buttons button {
    flex: unset;
  }
}
</style>
