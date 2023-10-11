import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import HomePage from "../views/HomePage.vue";
import CalendarPage from "../views/CalendarPage.vue";
import ProfilePage from "../views/ProfilePage.vue";
import WorkoutPage from "@/views/WorkoutPage.vue";
import WeightPage from "@/views/Weightpage.vue";
import WorkoutDetailPage from "@/views/WorkoutDetailPage.vue";
import WorkoutTemplatePage from "@/views/WorkoutTemplatePage.vue";
import WorkoutTemplateEditPage from "@/views/WorkouTemplateEditPage.vue";
import PlansView from "@/views/PlansView.vue";
import PlanView from "@/views/PlanView.vue";
import ExerciseView from "@/views/ExerciseView.vue";

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
  {
    path: "/workouttemplateEdit/:id",
    name: "Workouttemplateedit",
    component: WorkoutTemplateEditPage,
  },
  {
    path: "/plans",
    name: "plans",
    component: PlansView,
  },
  {
    path: "/plan/:id",
    name: "plan",
    component: PlanView,
  },
  {
    path: "/exercise/:id",
    name: "exercise",
    component: ExerciseView,
  },
  {
    path: "/HealthSheet",
    name: "HealthSheet",
    component: () => import("../views/HealthSheet.vue"),
  },
  {
    path: "/RM-Calculator",
    name: "RM-Calculator",
    component: () => import("../views/RMCalculator.vue"),
  },
  {
    path: "/archivatedWorkouts",
    name: "archivatedWorkouts",
    component: () => import("../views/ArchivatedWorkouts.vue"),
  },
  {
    path: "/absolveWorkout/:id",
    name: "absolveWorkout",
    component: () => import("../views/AbsolveWorkoutPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
