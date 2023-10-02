import { defineStore } from "pinia";
import { ref } from "vue";

export const useStateStore = defineStore("stateStore", () => {
  const showAddPlanModal = ref(false);

  const setShowAddPlanModal = (show: boolean) => {
    showAddPlanModal.value = show;
  };

  return { setShowAddPlanModal, showAddPlanModal };
});
