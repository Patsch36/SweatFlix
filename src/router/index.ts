import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import HomePage from "../views/MainViews/HomePage.vue";
import CalendarPage from "../views/MainViews/CalendarPage.vue";
import ProfilePage from "../views/MainViews/ProfilePage.vue";
import WorkoutPage from "@/views/MainViews/WorkoutPage.vue";
import WeightPage from "@/views/SecondaryViews/Weightpage.vue";
import WorkoutDetailPage from "@/views/SecondaryViews/WorkoutDetailPage.vue";
import WorkoutTemplatePage from "@/views/SecondaryViews/WorkoutTemplatePage.vue";
import WorkoutTemplateEditPage from "@/views/SecondaryViews/WorkouTemplateEditPage.vue";
import PlansView from "@/views/SecondaryViews/PlansView.vue";
import PlanView from "@/views/SecondaryViews/PlanView.vue";
import ExerciseView from "@/views/SecondaryViews/ExerciseView.vue";

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
    component: () => import("../views/SecondaryViews/HealthSheet.vue"),
  },
  {
    path: "/RM-Calculator",
    name: "RM-Calculator",
    component: () => import("../views/FAB-Views/RMCalculator.vue"),
  },
  {
    path: "/archivatedWorkouts",
    name: "archivatedWorkouts",
    component: () => import("../views/SecondaryViews/ArchivatedWorkouts.vue"),
  },
  {
    path: "/absolveWorkout/:id",
    name: "absolveWorkout",
    component: () => import("../views/FAB-Views/AbsolveWorkoutPage.vue"),
  },
  {
    path: "/timer",
    name: "timer",
    component: () => import("../views/FAB-Views/TimerView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
