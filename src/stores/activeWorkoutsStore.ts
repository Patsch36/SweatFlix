// store.ts
import { defineStore } from "pinia";

export const useActiveWorkoutsStore = defineStore("activeWorkouts", {
  state: () => ({
    activeWorkouts: 0,
  }),
  actions: {
    setActiveWorkouts(activeWorkouts: any) {
      this.activeWorkouts = activeWorkouts;
    },
    getActiveWorkouts() {
      return this.activeWorkouts;
    },
  },
});
