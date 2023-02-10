<script lang="ts" setup>
import { computed, ref, reactive, onBeforeMount, type Ref } from "vue";
import { useDatasetsStore } from "../store/datasets";
import {
  readCsv,
  createCSVDataset,
  type CreateCSVDatasetParams,
} from "../services/api.service";
import { toast } from "vue3-toastify";
import { useLoaderStore } from "../store/loader.store";

const datasetStore = useDatasetsStore();
const loader = useLoaderStore();
const openCreateModal = ref(false);
const csvHeadings: Ref<string[]> = ref([]);
const inputs = reactive({
  prompt: "",
  value: "",
  startLine: "",
  endLine: "",
  name: "",
});
const csvFile: Ref<File | null> = ref(null);

const datasets = computed(() => datasetStore.datasets);

onBeforeMount(() => {
  datasetStore.fetchDatasets();
});

async function handleFileChange(ev: any) {
  const file = ev.target.files[0];
  try {
    const csvData = (await readCsv(file)).data;
    csvFile.value = file;
    csvHeadings.value = csvData[0];
  } catch (e) {
    toast.error("Something went wrong while uploading csv");
  }
}

function appendToPrompt(value: string) {
  if (
    inputs.prompt.length &&
    (!inputs.prompt.endsWith(" ") ||
      !inputs.prompt.endsWith("\t") ||
      !inputs.prompt.endsWith("\n"))
  ) {
    inputs.prompt += " ";
  }
  inputs.prompt += value;
}

async function handleSubmit() {
  console.log(csvFile.value);
  if (!csvFile.value) {
    return toast.error("Upload a valid CSV file to continue");
  }
  if (!inputs.name.trim().length) {
    return toast.error("Enter the name to continue");
  }
  if (!inputs.prompt.trim().length) {
    return toast.error("Enter the prompt to continue");
  }
  if (!inputs.value.trim().length) {
    return toast.error("Enter the value to continue");
  }
  const data: CreateCSVDatasetParams = {
    file: csvFile.value,
    prompt: inputs.prompt,
    value: inputs.value,
    name: inputs.name,
  };
  if (inputs.startLine.trim().length) {
    data.startLine = inputs.startLine;
  }
  if (inputs.endLine.trim().length) {
    data.endLine = inputs.endLine;
  }
  loader.show("Creating the dataset...");
  try {
    await createCSVDataset(data);
    toast.success("Dataset created");
    datasetStore.fetchDatasets();
    inputs.prompt = "";
    inputs.value = "";
    inputs.startLine = "";
    inputs.endLine = "";
    inputs.name = "";
    csvFile.value = null;
    csvHeadings.value = [];
    openCreateModal.value = false;
  } catch (e) {
    toast.error("Something went wrong while creation of dataset. Try again");
  } finally {
    loader.hide();
  }
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
          <h4>{{ dataset.name }}</h4>
          <div>
            <span class="strong">OpenAI Id: </span>{{ dataset.openai_id }}
          </div>
          <div><span class="strong">File: </span>{{ dataset.file }}</div>
          <div><span class="strong">Status: </span>{{ dataset.status }}</div>
        </div>
      </div>
    </main>
    <Transition name="fade" mode="in-out">
      <div v-if="openCreateModal" class="overlay-container">
        <div class="overlay"></div>
        <div class="create-dataset-modal">
          <h3>Create a new dataset</h3>
          <form class="form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="file">File (.csv, .xls, .xlsx)</label>
              <input
                id="file"
                type="file"
                placeholder=".csv, .xls, .xlsx"
                accept=".csv, .xls, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                @change="handleFileChange"
              />
            </div>
            <div class="form-group">
              <label for="value">Dataset Name</label>
              <input
                id="name"
                placeholder="Eg: My First Dataset."
                v-model="inputs.name"
              />
            </div>
            <div class="form-group">
              <label>Column Mapping</label>
              <div v-if="csvHeadings.length" class="heading-options">
                <div
                  class="mapping"
                  v-for="(heading, index) in csvHeadings"
                  :key="heading"
                  @click.stop="appendToPrompt(`##${index}##`)"
                >
                  <span class="column-name">{{ heading }}</span
                  >:
                  <span class="mapping-id">##{{ index }}##</span>
                </div>
              </div>
              <div v-else class="no-mapping">
                Upload a CSV to get column mapping
              </div>
            </div>
            <div class="form-group">
              <label for="prompt">Input Prompt</label>
              <textarea
                id="prompt"
                placeholder="Eg: If a prompt has ##0## and ##1##..."
                rows="5"
                v-model="inputs.prompt"
              ></textarea>
            </div>
            <div class="form-group">
              <label for="value">Output Value</label>
              <input
                id="value"
                placeholder="Eg: The Value is ##2##."
                v-model="inputs.value"
              />
            </div>
            <div class="numbers">
              <div class="form-group">
                <label for="start">Start from (Optional)</label>
                <input
                  id="start"
                  type="number"
                  placeholder="Line number from where data should be read"
                  v-model="inputs.startLine"
                />
              </div>
              <div class="form-group">
                <label for="end">End (Optional)</label>
                <input
                  id="end"
                  type="number"
                  placeholder="Line number till where data should be read"
                  v-model="inputs.endLine"
                />
              </div>
            </div>
            <div class="buttons">
              <button
                class="secondary-btn"
                type="button"
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

.dataset-card > div,
.dataset-card > h4 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

h4 {
  margin: 0;
  padding: 0;
  font-size: 1.125rem;
}

.numbers {
  display: flex;
  gap: 2rem;
}

.numbers * {
  flex: 1;
}

.heading-options {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.mapping {
  border: 1px solid currentColor;
  padding: 0.25rem 0.75rem;
  border-radius: 100vh;
  flex: unset;
  cursor: pointer;
}

.column-name {
  font-weight: 500;
}

.mapping-id {
  font-size: 0.875rem;
  margin-left: 0.5rem;
}

.no-mapping {
  font-size: 0.875rem;
}

@media screen and (max-width: 768px) {
  .numbers,
  .buttons {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
