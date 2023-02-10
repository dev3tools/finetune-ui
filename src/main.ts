import { createApp } from "vue";
import "./style.css";
import "vue3-toastify/dist/index.css";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Vue3Toastify, { type ToastContainerOptions } from "vue3-toastify";

const app = createApp(App);

app.use(store);
app.use(router);
app.use(Vue3Toastify, {
  autoClose: 3000,
} as ToastContainerOptions);

app.mount("#app");
