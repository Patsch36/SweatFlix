import { defineStore } from "pinia";
import { ref } from "vue";

export const useStateStore = defineStore("stateStore", () => {
  const showAddPlanModal = ref(false);
  const showAddExerciseModal = ref(false);

  const setShowAddPlanModal = (show: boolean) => {
    showAddPlanModal.value = show;
  };

  const setShowAddExerciseModal = (show: boolean) => {
    showAddExerciseModal.value = show;
  };

  return {
    setShowAddPlanModal,
    setShowAddExerciseModal,
    showAddPlanModal,
    showAddExerciseModal,
  };
});
