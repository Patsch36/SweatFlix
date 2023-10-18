import { defineStore } from "pinia";
import { ref } from "vue";

export const useStateStore = defineStore("stateStore", () => {
  const showAddPlanModal = ref(false);
  const showAddExerciseModal = ref(false);
  const openedProfileAccordion = ref("");
  const profileSearchQuery = ref("");
  const showEditExerciseModal = ref(false);
  const showAddWorkoutModal = ref(false);

  const setShowAddPlanModal = (show: boolean) => {
    showAddPlanModal.value = show;
  };

  const setShowAddExerciseModal = (show: boolean) => {
    showAddExerciseModal.value = show;
  };

  const setOpenedProfileAccordion = (value: string) => {
    const possibleAccordionTabs = [
      "exercises",
      "achievements",
      "personalData",
      "settings",
    ];
    if (possibleAccordionTabs.includes(value)) {
      openedProfileAccordion.value = value;
    } else {
      throw new Error(
        `setOpenedProfileAccordion: value ${value} is not a possible accordion tab`
      );
    }
  };

  const setProfileSearchQuery = (value: string) => {
    profileSearchQuery.value = value;
  };

  const setShowEditExerciseModal = (show: boolean) => {
    console.log("setShowEditExerciseModal", show);
    showEditExerciseModal.value = show;
  };

  const setShowAddWorkoutModal = (show: boolean) => {
    showAddWorkoutModal.value = show;
  };

  return {
    setShowAddPlanModal,
    setShowAddExerciseModal,
    setOpenedProfileAccordion,
    setProfileSearchQuery,
    setShowEditExerciseModal,
    setShowAddWorkoutModal,
    showAddPlanModal,
    showAddExerciseModal,
    openedProfileAccordion,
    profileSearchQuery,
    showEditExerciseModal,
    showAddWorkoutModal,
  };
});
