<script setup lang="ts">
import { ref, computed, onBeforeMount, type Ref } from "vue";
import { useDatasetsStore } from "../store/datasets";
import { useModelsStore, type Model } from "../store/models";
import { toast } from "vue3-toastify";
import { useLoaderStore } from "../store/loader.store";
import { createModel, deleteModel, updateModel } from "../services/api.service";
import { getTimeAgo } from "../utils/timeAgo";

const datasetStore = useDatasetsStore();
const modelStore = useModelsStore();
const modelName = ref("");
const openCreateModal = ref(false);
const openUpdateModal = ref(false);
const openDeleteModal = ref(false);
const selectedDataset = ref("");
const selectedModel: Ref<Model | null> = ref(null);
const loader = useLoaderStore();

const models = computed(() => modelStore.models);

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
            >{{ getTimeAgo(new Date(model.created)) }}
          </div>
          <div>
            <span class="strong">Status: </span
            ><span style="text-transform: capitalize">{{ model.status }}</span>
          </div>
          <div class="card-buttons">
            <button class="primary-btn">Open playground</button>
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
    </Transition>
    <Transition name="fade" mode="in-out">
      <div v-if="openUpdateModal" class="overlay-container">
        <div class="overlay"></div>
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
    </Transition>
    <Transition name="fade" mode="in-out">
      <div v-if="openDeleteModal" class="overlay-container">
        <div class="overlay"></div>
        <div class="delete-model-modal">
          <h3>Are you sure?</h3>
          <p>This action will delete your existing modal</p>
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
    </Transition>
  </div>
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.create-model-modal {
  position: absolute;
  z-index: 2;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 2rem;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 3rem);
  max-width: 360px;
}

.delete-model-modal {
  position: absolute;
  z-index: 2;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 2rem;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 3rem);
  max-width: 360px;
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

@media screen and (max-width: 768px) {
  .buttons {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
