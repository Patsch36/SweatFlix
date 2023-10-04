<template>
  <ion-modal :isOpen="modalOpen">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="stateStore.setShowEditExerciseModal(false)">
            Cancel
            <ion-icon slot="start" :icon="chevronBack"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Edit Workout</ion-title>
        <ion-buttons slot="end">
          <ion-button
            :disabled="checkIfPlanIsFilled()"
            :strong="true"
            @click="confirmModal()">
            save
            <ion-icon slot="end" :icon="saveOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="floating">Name</ion-label>
        <ion-input type="text" v-model="exercise.name"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="floating">Description</ion-label>
        <ion-textarea v-model="exercise.ExDesc" :rows="15"></ion-textarea>
      </ion-item>
      <ion-item>
        <ion-select v-model="exercise.SubMuscle" interface="action-sheet">
          <ion-select-option
            v-for="subMuscle in subMuscles"
            :key="subMuscle.SubMuscle"
            :value="subMuscle.SubMuscle">
            {{ subMuscle.SubMuscle }}, {{ subMuscle.Muscle }}
          </ion-select-option>
        </ion-select>
      </ion-item>
    </ion-content>
  </ion-modal>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref } from "vue";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
} from "@ionic/vue";
import { chevronBack, saveOutline } from "ionicons/icons";
import { useStateStore } from "@/stores/stateStore";
import { useDatabaseStore } from "@/stores/databaseStore";

const stateStore = useStateStore();
const databaseStore = useDatabaseStore();

const modalOpen = ref(false);

const { exercise } = defineProps(["exercise"]);

const subMuscles = ref();

stateStore.$subscribe((mutation, state) => {
  console.log("TRIGGERED");
  modalOpen.value = state.showEditExerciseModal;
});

onBeforeMount(async () => {
  await loadSubMuscles();
});

const loadSubMuscles = async () => {
  const query = `SELECT Muscle, SubMuscle FROM MuscleGroup`;
  const resp = await databaseStore.getDatabase()?.query(query);
  subMuscles.value = resp?.values ? resp.values : [];
};

const checkIfPlanIsFilled = () => {
  return false;
};

const confirmModal = async () => {
  stateStore.setShowEditExerciseModal(false);
  // Get muscleGroup ID from db
  const selectQuery = `SELECT id FROM MuscleGroup WHERE SubMuscle = '${exercise.SubMuscle}'`;
  const resp = await databaseStore.getDatabase()?.query(selectQuery);
  const muscleGroupID = resp?.values ? resp.values[0][0] : null;
  // Save everything to database
  const query = `UPDATE Exercise SET name = '${exercise.name}', description = '${exercise.ExDesc}', muscleGroup = '${muscleGroupID}' WHERE name = '${exercise.name}'`;
  databaseStore.getDatabase()?.query(query);
};
</script>

<style scoped>
.icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
