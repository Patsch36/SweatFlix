import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'
import CalendarPage from '../views/CalendarPage.vue'
import ProfilePage from '../views/ProfilePage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: CalendarPage
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage
  },
  {
    path: '/weight',
    name: 'Weight',
    component: () => import('../views/WeightPage.vue')
  },
  {
    path: '/workouts',
    name: 'Workouts',
    component: () => import('../views/WorkoutPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
