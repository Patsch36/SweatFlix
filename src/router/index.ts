import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import HomePage from "../views/HomePage.vue";
import CalendarPage from "../views/CalendarPage.vue";
import ProfilePage from "../views/ProfilePage.vue";
import WorkoutPage from "@/views/WorkoutPage.vue";
import WeightPage from "@/views/Weightpage.vue";
import WorkoutDetailPage from "@/views/WorkoutDetailPage.vue";
import WorkoutTemplatePage from "@/views/WorkoutTemplatePage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "Home",
    component: HomePage,
  },
  {
    path: "/calendar",
    name: "Calendar",
    component: CalendarPage,
  },
  {
    path: "/profile",
    name: "Profile",
    component: ProfilePage,
  },
  {
    path: "/workouts",
    name: "Workouts",
    component: WorkoutPage,
  },
  {
    path: "/weight",
    name: "Weight",
    component: WeightPage,
  },
  {
    path: "/workoutdetails/:id",
    name: "Workoutdetails",
    component: WorkoutDetailPage,
  },
  {
    path: "/workouttemplate/:id",
    name: "Workouttemplate",
    component: WorkoutTemplatePage,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
