import { defineStore } from "pinia";
import { ref } from "vue";

export const useStateStore = defineStore("stateStore", () => {
  const showAddPlanModal = ref(false);
  const showAddExerciseModal = ref(false);
  const openedProfileAccordion = ref("");
  const profileSearchQuery = ref("");
  const showEditExerciseModal = ref(false);
  const showAddWorkoutModal = ref(false);
  const showAddWorkoutToPlanModal = ref(false);
  const showEditPlanModal = ref(false);
  const showEditWorkoutModal = ref(false);
  const showAddExerciseToWorkoutModal = ref(false);
  const showFinishWorkoutModal = ref(false);

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

  const setShowAddWorkoutToPlanModal = (show: boolean) => {
    showAddWorkoutToPlanModal.value = show;
  };

  const setShowEditPlanModal = (show: boolean) => {
    showEditPlanModal.value = show;
  };

  const setShowEditWorkoutModal = (show: boolean) => {
    showEditWorkoutModal.value = show;
  };

  const setShowAddExerciseToWorkoutModal = (show: boolean) => {
    showAddExerciseToWorkoutModal.value = show;
  };

  const setShowFinishWorkoutModal = (show: boolean) => {
    showFinishWorkoutModal.value = show;
  };

  return {
    setShowAddPlanModal,
    setShowAddExerciseModal,
    setOpenedProfileAccordion,
    setProfileSearchQuery,
    setShowEditExerciseModal,
    setShowAddWorkoutModal,
    setShowAddWorkoutToPlanModal,
    setShowEditPlanModal,
    setShowEditWorkoutModal,
    setShowAddExerciseToWorkoutModal,
    setShowFinishWorkoutModal,
    showAddPlanModal,
    showAddExerciseModal,
    openedProfileAccordion,
    profileSearchQuery,
    showEditExerciseModal,
    showAddWorkoutModal,
    showAddWorkoutToPlanModal,
    showEditPlanModal,
    showEditWorkoutModal,
    showAddExerciseToWorkoutModal,
    showFinishWorkoutModal,
  };
});
