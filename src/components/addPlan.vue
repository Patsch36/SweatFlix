<template>
  <ion-modal :isOpen="modalOpen">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="stateStore.setShowAddPlanModal(false)">
            Cancel
          </ion-button>
        </ion-buttons>
        <ion-title>Edit Workout</ion-title>
        <ion-buttons slot="end">
          <ion-button
            :disabled="checkIfPlanIsFilled()"
            :strong="true"
            @click="confirmModal()"
            v-if="!addWorkouts">
            Add Plan Data
          </ion-button>
          <ion-button
            :disabled="checkIfPlanIsFilled()"
            :strong="true"
            @click="addWorkoutsFunction()"
            v-else>
            Add Workouts
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-label>Name</ion-label>
        <ion-input
          type="text"
          v-model="plan.name"
          :value="plan.name"
          required></ion-input>
      </ion-item>
      <ion-item>
        <ion-textarea
          label="Description"
          :auto-grow="true"
          v-model="plan.description"
          :rows="1">
        </ion-textarea>
      </ion-item>
      <ion-item>
        <ion-select
          label="Choose your Plan Type"
          interface="action-sheet"
          :value="plan.type"
          @ionChange="plan.type = $event.target.value">
          <ion-select-option value="Strength training">
            Strength Training
          </ion-select-option>
          <ion-select-option value="Mass training">
            Mass Training
          </ion-select-option>
          <ion-select-option value="Cut training">
            Cut Training
          </ion-select-option>
          <ion-select-option value="Cardio">Cardio</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item>
        <ion-select
          label="Choose your Place"
          interface="action-sheet"
          :value="plan.place"
          @ionChange="plan.place = $event.target.value">
          <ion-select-option value="Gym"> Gym </ion-select-option>
          <ion-select-option value="Calisthenic Park">
            Calisthenic Park
          </ion-select-option>
          <ion-select-option value="Home"> Home </ion-select-option>
          <ion-select-option value="Outdoor">Outdoor</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item>
        <ion-select
          label="Choose your Split"
          interface="action-sheet"
          :value="plan.split"
          @ionChange="plan.split = $event.target.value">
          <ion-select-option value="1-way split">
            1-way split
          </ion-select-option>
          <ion-select-option value="2-way split">
            2-way split
          </ion-select-option>
          <ion-select-option value="3-way split">
            3-way split
          </ion-select-option>
          <ion-select-option value="4-way split">
            4-way split
          </ion-select-option>
          <ion-select-option value="5-way split">
            5-way split
          </ion-select-option>
          <ion-select-option value="6-way-split">
            6-way-split
          </ion-select-option>
          <ion-select-option value="7-waysplit"> 7-waysplit </ion-select-option>
          <ion-select-option value="8-way split">
            8-way split
          </ion-select-option>
        </ion-select>
      </ion-item>

      <WorkoutOrganizer v-if="addWorkouts"></WorkoutOrganizer>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
} from "@ionic/vue";
import { useStateStore } from "@/stores/stateStore";
import { useDatabaseStore } from "@/stores/databaseStore";
import WorkoutOrganizer from "./WorkoutOrganizer.vue";
import { add } from "cypress/types/lodash";

const stateStore = useStateStore();
const databaseStore = useDatabaseStore();

const modalOpen = ref(false);

const plan = ref({
  name: "",
  description: "",
  type: "",
  place: "",
  split: "",
});

const addWorkouts = ref(false);

onBeforeMount(() => {
  modalOpen.value = stateStore.showAddPlanModal;
});

stateStore.$subscribe((mutation, state) => {
  modalOpen.value = state.showAddPlanModal;
});

const checkIfPlanIsFilled = () => {
  if (
    plan.value.name === "" ||
    plan.value.description === "" ||
    plan.value.type === "" ||
    plan.value.place === "" ||
    plan.value.split === ""
  ) {
    return true;
  } else {
    return false;
  }
};

const confirmModal = async () => {
  const newPlan = {
    name: plan.value.name,
    description: plan.value.description,
    type: plan.value.type,
    place: plan.value.place,
    split: plan.value.split,
  };
  const query = `INSERT INTO Plan (name, description, type, place, split) VALUES ("${newPlan.name}", "${newPlan.description}", "${newPlan.type}", "${newPlan.place}", "${newPlan.split}")`;
  await databaseStore.getDatabase()?.run(query);

  addWorkouts.value = true;
};

const addWorkoutsFunction = () => {
  addWorkouts.value = false;
  plan.value = {
    name: "",
    description: "",
    type: "",
    place: "",
    split: "",
  };
  stateStore.setShowAddPlanModal(false);
};
</script>
