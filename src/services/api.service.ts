import axios, { type InternalAxiosRequestConfig } from "axios";
import store from "../store";
import { useUserStore } from "../store/user.store";

const BASE_URL = "https://starknet.email";
const userStore = useUserStore(store);

const api = axios.create({
  baseURL: BASE_URL,
});

const authorizedApi = axios.create({
  baseURL: BASE_URL,
});

authorizedApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers.Authorization = `Bearer ${userStore.accessToken}`;
  return config;
});

function trackGoogleLogin(authToken: string) {
  return api.post("/social_auth/google/", {
    auth_token: authToken,
  });
}

function refreshAccessToken(refreshToken: string) {
  return api.post("/auth/token/refresh/", {
    refresh: refreshToken,
  });
}

type CreateCSVDatasetParams = {
  file: File;
  prompt: string;
  value: string;
  name: string;
  startLine?: string;
  endLine?: string;
  separator?: string;
  stopSequence?: string;
};

function createCSVDataset(
  data: CreateCSVDatasetParams,
  preview: boolean = false
) {
  const formData = new FormData();
  formData.append("file", data.file);
  formData.append("prompt", data.prompt);
  formData.append("value", data.value);
  formData.append("name", data.name);
  if (data.startLine) formData.append("start_line", data.startLine);
  if (data.endLine) formData.append("end_line", data.endLine);
  if (data.separator) formData.append("separator", data.separator);
  if (data.stopSequence) formData.append("stop_sequence", data.stopSequence);
  if (preview) {
    return authorizedApi.post("/api/preview/", formData);
  }
  return authorizedApi.post("/api/csv-data/", formData);
}

function fetchDatasets() {
  return authorizedApi.get("/api/datasets/");
}

function fetchModels() {
  authorizedApi.get("/api/train/");
  return authorizedApi.get("/api/models/");
}

function fetchModel(id: string) {
  return authorizedApi.get("/api/models/" + id + "/");
}

function updateModel(id: string, name: string) {
  return authorizedApi.put("/api/models/" + id + "/", { name });
}

function deleteModel(id: string) {
  return authorizedApi.delete("/api/models/" + id + "/");
}

function ask(openai_model_id: string, question: string) {
  return authorizedApi.post("/api/ask/", {
    ai_model: openai_model_id,
    question,
  });
}

function fetchApiKey() {
  return authorizedApi.get("/api/api_key/");
}

function saveApiKey(api_key: string) {
  return authorizedApi.post("/api/api_key/", { api_key });
}

function createModel(dataset_id: string, name: string) {
  return authorizedApi.post("/api/train/", { dataset: dataset_id, name });
}

function readCsv(file: File, startLine: number = 1) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("line", String(startLine));
  return authorizedApi.post("/api/read-csv/", formData);
}

export {
  trackGoogleLogin,
  refreshAccessToken,
  createCSVDataset,
  fetchDatasets,
  createModel,
  fetchModels,
  fetchModel,
  updateModel,
  deleteModel,
  ask,
  fetchApiKey,
  saveApiKey,
  readCsv,
  type CreateCSVDatasetParams,
};
