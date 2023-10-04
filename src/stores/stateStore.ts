import { defineStore } from "pinia";
import { ref } from "vue";

export const useStateStore = defineStore("stateStore", () => {
  const showAddPlanModal = ref(false);
  const showAddExerciseModal = ref(false);
  const openedProfileAccordion = ref("");
  const profileSearchQuery = ref("");
  const showEditExerciseModal = ref(false);

  const setShowAddPlanModal = (show: boolean) => {
    showAddPlanModal.value = show;
  };

  const setShowAddExerciseModal = (show: boolean) => {
    showAddExerciseModal.value = show;
  };

  const setOpenedProfileAccordion = (value: string) => {
    openedProfileAccordion.value = value;
  };

  const setProfileSearchQuery = (value: string) => {
    profileSearchQuery.value = value;
  };

  const setShowEditExerciseModal = (show: boolean) => {
    console.log("setShowEditExerciseModal", show);
    showEditExerciseModal.value = show;
  };

  return {
    setShowAddPlanModal,
    setShowAddExerciseModal,
    setOpenedProfileAccordion,
    setProfileSearchQuery,
    setShowEditExerciseModal,
    showAddPlanModal,
    showAddExerciseModal,
    openedProfileAccordion,
    profileSearchQuery,
    showEditExerciseModal,
  };
});
