<script lang="ts" setup>
import { computed, ref } from "vue";
import { useDatasetsStore } from "../store/datasets";
import { read } from "xlsx";

const datasetStore = useDatasetsStore();
const openCreateModal = ref(false);

const datasets = computed(() => datasetStore.datasets);

function handleFileChange(ev) {
  const file = ev.target.files[0];
  console.log(file);
  const reader = new FileReader();
  reader.onload = function (data) {
    const workbook = read(data, {
      type: "binary",
    });
    console.log(workbook);
  };
  reader.readAsBinaryString(file);
}
</script>

<template>
  <div>
    <header>
      <h1>My Datasets</h1>
      <button class="create-btn" @click.stop="openCreateModal = true">
        Create Dataset
      </button>
    </header>
    <main>
      <p class="empty-dataset" v-if="!datasets.length">
        You don’t have any datasets yet.
        <span class="create-dataset" @click.stop="openCreateModal = true"
          >Click here to create a new dataset</span
        >.
      </p>
      <div class="datasets" v-else>
        <div
          v-for="dataset in datasets"
          :key="JSON.stringify(dataset)"
          class="dataset-card"
        >
          <span>{{ dataset.name }}</span>
          <span><strong>OpenAI Id: </strong>{{ dataset.openai_id }}</span>
          <span><strong>File: </strong>{{ dataset.file }}</span>
          <span><strong>Status: </strong>{{ dataset.status }}</span>
        </div>
      </div>
    </main>
    <Transition name="fade" mode="in-out">
      <div v-if="openCreateModal" class="overlay-container">
        <div class="overlay"></div>
        <div class="create-dataset-modal">
          <h3>Create a new dataset</h3>
          <form class="form" @submit.prevent="void 0">
            <div class="form-group">
              <label for="file">File (.csv, .xls, .xlsx)</label>
              <input
                id="file"
                type="file"
                placeholder=".csv, .xls, .xlsx"
                accept=".csv, .xls, .xlsx, .ods, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                @change="handleFileChange"
              />
            </div>
            <div class="form-group">
              <label for="prompt">Input Prompt</label>
              <textarea id="prompt" placeholder="Prompt" rows="5"></textarea>
            </div>
            <div class="form-group">
              <label for="value">Output Value</label>
              <input id="value" placeholder="Value" />
            </div>
            <div class="numbers">
              <div class="form-group">
                <label for="start">Start from (Optional)</label>
                <input id="start" type="number" placeholder="0" />
              </div>
              <div class="form-group">
                <label for="end">End (Optional)</label>
                <input id="end" type="number" placeholder="0" />
              </div>
            </div>
            <div class="buttons">
              <button
                class="secondary-btn"
                @click.stop="openCreateModal = false"
              >
                Cancel
              </button>
              <button class="primary-btn" type="submit">Submit</button>
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

.empty-dataset {
  font-weight: 500;
}

.create-dataset {
  cursor: pointer;
}

.datasets {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dataset-card {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.create-dataset-modal {
  position: absolute;
  z-index: 2;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 2rem;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 3rem);
  max-width: 768px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

textarea {
  resize: none;
}

::placeholder {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.buttons {
  display: flex;
  gap: 2rem;
  flex: 1;
  justify-content: stretch;
  margin-top: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-group * {
  flex: 1;
}

label {
  font-size: 0.875rem;
  font-weight: 500;
}

.buttons button {
  flex: 1;
}

h3 {
  margin: 0;
  padding: 0;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.numbers {
  display: flex;
  gap: 2rem;
}

.numbers * {
  flex: 1;
}

@media screen and (max-width: 768px) {
  .numbers,
  .buttons {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
