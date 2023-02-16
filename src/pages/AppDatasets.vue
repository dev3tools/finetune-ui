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
import { getTimeAgo } from "../utils/timeAgo";
import { ChevronDownIcon } from "@heroicons/vue/24/solid";
import { useSettingsStore } from "../store/settings";

type PreviewData = {
  preview: {
    completion: string;
    prompt: string;
  }[];
  rows: number;
  tokens: number;
};

const datasetStore = useDatasetsStore();
const loader = useLoaderStore();
const openCreateModal = ref(false);
const openPreviewModal = ref(false);
const openApiKeyModal = ref(false);
const isExpanded = ref(false);
const csvHeadings: Ref<string[]> = ref([]);
const inputs = reactive({
  prompt: "",
  value: "",
  startLine: "",
  endLine: "",
  name: "",
  separator: "",
  stopSequence: "",
});
const csvFile: Ref<File | null> = ref(null);
const previewData: Ref<PreviewData | null> = ref(null);
const apiKey = ref("");
const settings = useSettingsStore();

const datasets = computed(() => datasetStore.datasets);

onBeforeMount(() => {
  datasetStore.fetchDatasets();
});

async function handleFileChange(ev: any) {
  const file = ev.target.files[0];
  try {
    const csvData = (await readCsv(file)).data;
    csvFile.value = file;
    csvHeadings.value = csvData;
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
  if (!csvFile.value) {
    return toast.error("Upload a valid CSV file to continue");
  }
  if (!inputs.name.trim().length) {
    return toast.error("Enter the dataset name to continue");
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
    separator: inputs.separator,
    stopSequence: inputs.stopSequence,
  };
  if (inputs.startLine) {
    data.startLine = inputs.startLine;
  }
  if (inputs.endLine) {
    data.endLine = inputs.endLine;
  }
  loader.show("Creating the preview...");
  try {
    previewData.value = (await createCSVDataset(data, true)).data;
    datasetStore.fetchDatasets();
    openPreviewModal.value = true;
    openCreateModal.value = false;
  } catch (e) {
    toast.error("Something went wrong. Try again");
  } finally {
    loader.hide();
  }
}

async function handleCreate() {
  if (!settings.openAiApiKey) {
    openPreviewModal.value = false;
    return (openApiKeyModal.value = true);
  }
  const data: CreateCSVDatasetParams = {
    file: csvFile.value as File,
    prompt: inputs.prompt,
    value: inputs.value,
    name: inputs.name,
    separator: inputs.separator,
    stopSequence: inputs.stopSequence,
  };
  if (inputs.startLine) {
    data.startLine = inputs.startLine;
  }
  if (inputs.endLine) {
    data.endLine = inputs.endLine;
  }
  loader.show("Creating the dataset...");
  try {
    await createCSVDataset(data);
    datasetStore.fetchDatasets();
    toast.error("Dataset created. Now create a model to train the AI");
    handleCancel();
  } catch (e) {
    toast.error("Something went wrong when creating the dataset. Try again");
  } finally {
    loader.hide();
  }
}

function handleBack() {
  openPreviewModal.value = false;
  openCreateModal.value = true;
}

function handleCancel() {
  inputs.prompt = "";
  inputs.value = "";
  inputs.startLine = "";
  inputs.endLine = "";
  inputs.name = "";
  inputs.separator = "";
  inputs.stopSequence = "";
  csvFile.value = null;
  csvHeadings.value = [];
  openCreateModal.value = false;
  openPreviewModal.value = false;
  previewData.value = null;
}

async function handleApiKeySave() {
  loader.show("Saving api key...");
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
  openPreviewModal.value = true;
  await handleCreate();
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
          <div>
            <span class="strong">File: </span
            ><a :href="dataset.file" target="_blank" download>{{
              dataset.file
            }}</a>
          </div>
          <div>
            <span class="strong">Created: </span
            ><span style="text-transform: capitalize">{{
              getTimeAgo(new Date(dataset.created))
            }}</span>
          </div>
          <div>
            <span class="strong">Status: </span
            ><span style="text-transform: capitalize">{{
              dataset.status
            }}</span>
          </div>
          <div v-if="dataset.separator">
            <span class="strong">Separator: </span>
            <span>{{ dataset.separator }}</span>
          </div>
          <div v-if="dataset.stop_sequence">
            <span class="strong">Stop sequence: </span
            ><span>{{ dataset.stop_sequence }}</span>
          </div>
        </div>
      </div>
    </main>
    <Transition name="fade" mode="in-out">
      <div v-if="openCreateModal" class="overlay-container">
        <div class="overlay"></div>
        <div class="overlay-content">
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
                <label>CSV Columns</label>
                <div v-if="csvHeadings.length" class="heading-options">
                  <div
                    class="mapping"
                    v-for="(heading, index) in csvHeadings"
                    :key="heading"
                    @click.stop="appendToPrompt(`##${index}##`)"
                  >
                    <span class="column-name">{{ heading }} :</span>
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
                  rows="3"
                  v-model="inputs.prompt"
                ></textarea>
              </div>
              <div class="form-group">
                <label for="value">Output Value</label>
                <textarea
                  id="prompt"
                  placeholder="Eg: The Value is ##2##."
                  rows="3"
                  v-model="inputs.value"
                ></textarea>
              </div>
              <div
                class="collapsible"
                :class="{ 'collapsible-active': isExpanded }"
              >
                <div
                  class="collapsible-text"
                  @click.stop="isExpanded = !isExpanded"
                >
                  <span>Advanced options</span>
                  <ChevronDownIcon class="down-icon" />
                </div>
                <div class="advanced-options-container">
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
                  <div class="numbers">
                    <div class="form-group">
                      <label for="separator">Separator (Optional)</label>
                      <input
                        id="separator"
                        placeholder="Default ###"
                        v-model="inputs.separator"
                      />
                    </div>
                    <div class="form-group">
                      <label for="stop-sequence"
                        >Stop sequence (Optional)</label
                      >
                      <input
                        id="end"
                        placeholder="Default ###"
                        v-model="inputs.stopSequence"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="buttons">
                <button
                  class="secondary-btn"
                  type="button"
                  @click.stop="handleCancel"
                >
                  Cancel
                </button>
                <button class="primary-btn" type="submit">Preview</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
    <Transition>
      <div v-if="openPreviewModal" class="overlay-container">
        <div class="overlay"></div>
        <div class="overlay-content">
          <div class="create-dataset-modal">
            <h3>Dataset Preview</h3>
            <div
              style="
                margin-bottom: 1.5rem;
                display: flex;
                gap: 1.5rem;
                margin-top: -1rem;
              "
            >
              <div class="tokens">
                <span style="font-size: 0.875rem">Rows: </span>
                <span style="font-size: 0.875rem; font-weight: 300">{{
                  previewData?.rows
                }}</span>
              </div>
              <div class="tokens">
                <span style="font-size: 0.875rem">Tokens: </span>
                <span style="font-size: 0.875rem; font-weight: 300">{{
                  previewData?.tokens
                }}</span>
              </div>
            </div>
            <div class="preview-container">
              <div
                class="preview-content"
                v-for="preview in previewData?.preview"
                :key="JSON.stringify(preview)"
              >
                <label class="preview-input-label">Prompt</label>
                <label class="preview-input-label">Completion</label>
                <span class="preview-input">
                  {{ preview.prompt }}
                </span>
                <span class="preview-output">
                  {{ preview.completion.replace("/n", "\/n") }}
                </span>
              </div>
            </div>
            <div class="buttons" style="margin-top: 2rem">
              <button
                class="secondary-btn"
                type="button"
                @click.stop="handleBack"
              >
                Back
              </button>
              <button
                class="primary-btn"
                type="submit"
                @click.stop="handleCreate"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
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
            <form @submit.prevent="handleApiKeySave">
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

.empty-dataset {
  font-weight: 500;
}

.create-dataset {
  cursor: pointer;
}

.datasets {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dataset-card {
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-radius: 10px;
  border: 1px solid currentColor;
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

.api-key-modal h3 {
  margin: 0;
  padding: 0;
  font-size: 1.25rem;
}

.api-key-modal form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.api-key-modal a {
  color: currentColor;
  text-underline-offset: 4px;
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
  background: #f5f5f5;
  border-radius: 10px;
  padding: 2rem;
  width: calc(100% - 3rem);
  max-width: 600px;
  overflow-y: auto;
  max-height: calc(100% - 4rem);
}

textarea {
  resize: none;
}

::placeholder {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.buttons {
  display: flex;
  gap: 1rem;
  flex: 1;
  justify-content: stretch;
  margin-top: 1rem;
}

.collapsible {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.collapsible-active {
  gap: 0.5rem;
}

.collapsible-text {
  display: flex;
  gap: 2px;
  align-items: center;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 400;
}

label {
  font-size: 0.875rem;
  font-weight: 500;
}

.advanced-options-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 0;
}

.preview-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.preview-content {
  display: grid;
  grid-template-columns: calc(50% - 0.6rem) calc(50% - 0.6rem);
  gap: 0.25rem 1.2rem;
}

.preview-input,
.preview-output {
  outline: 1px solid currentColor;
  border-radius: 10px;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  word-break: break-all;
}

.collapsible-active .advanced-options-container {
  height: 100%;
}

.down-icon {
  width: 1rem;
  transition: transform 0.3s;
}

.collapsible-active .down-icon {
  transform: rotate(-180deg);
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
  gap: 1rem;
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
  padding: 0 1rem 0.25rem;
  border-radius: 100vh;
  flex: unset;
  cursor: pointer;
  transition: all 0.3s;
}

.mapping:hover {
  background-color: #213547;
  color: #f5f5f5;
}

.column-name {
  font-size: 0.625rem;
  font-weight: 500;
}

.mapping-id {
  font-size: 0.625rem;
  margin-left: 0.25rem;
}

.no-mapping {
  font-size: 0.875rem;
}

.icon {
  width: 1rem;
}

a {
  color: currentColor;
  text-underline-offset: 4px;
}

@media screen and (max-width: 768px) {
  .numbers,
  .buttons {
    flex-direction: column;
    gap: 1rem;
  }

  .buttons button {
    flex: unset;
  }
}
</style>
