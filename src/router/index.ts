import {
  createWebHistory,
  createRouter,
  type Router,
  type RouteRecordRaw,
} from "vue-router";
import store from "../store";
import { useUserStore } from "../store/user.store";

const userStore = useUserStore(store);

const AppLogin = () => import("../pages/AppLogin.vue");
const AppDashboard = () => import("../pages/AppDashboard.vue");

const AppDatasets = () => import("../pages/AppDatasets.vue");
const AppModels = () => import("../pages/AppModels.vue");
const AppSettings = () => import("../pages/AppSettings.vue");

const routes: RouteRecordRaw[] = [
  {
    name: "Home",
    path: "/",
    redirect: { name: "Dashboard" },
  },
  {
    name: "Signin",
    path: "/signin",
    redirect: { name: "Login" },
  },
  {
    name: "Signup",
    path: "/signup",
    redirect: { name: "Login" },
  },
  {
    name: "Login",
    path: "/login",
    component: AppLogin,
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    meta: {
      requiresAuth: true,
    },
    component: AppDashboard,
    redirect: { name: "Datasets" },
    children: [
      {
        name: "Datasets",
        path: "datasets",
        component: AppDatasets,
      },
      {
        name: "Models",
        path: "models",
        component: AppModels,
      },
      {
        name: "Settings",
        path: "settings",
        component: AppSettings,
      },
    ],
  },
];

const router: Router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  if (
    to.matched.some((record) => record.meta.requiresAuth) &&
    !userStore.accessToken
  ) {
    return router.replace({ name: "Login" });
  } else if (to.name === "Login" && userStore.accessToken) {
    return router.replace({ name: "Dashboard" });
  }
});

export default router;
