<template>
  <ion-modal :isOpen="modalOpen">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="stateStore.setShowAddExerciseModal(false)">
            Cancel<ion-icon slot="start" :icon="chevronBack"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Edit Exercise</ion-title>
        <ion-buttons slot="end">
          <ion-button
            :disabled="checkIfModalIsFilled()"
            :strong="true"
            @click="confirmModal()">
            Add<ion-icon slot="end" :icon="addOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-label>Name</ion-label>
        <ion-input v-model="exercise.name"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label>Description</ion-label>
        <ion-textarea v-model="exercise.description"></ion-textarea>
      </ion-item>
      <ion-item>
        <ion-label>SubMuscle</ion-label>
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

<script setup lang="ts">
import { onBeforeMount, ref, defineEmits } from "vue";
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
  IonActionSheet,
  IonIcon,
} from "@ionic/vue";
import { chevronBack, addOutline } from "ionicons/icons";
import { useStateStore } from "@/stores/stateStore";
import { useDatabaseStore } from "@/stores/databaseStore";

const stateStore = useStateStore();
const databaseStore = useDatabaseStore();

const exercise = ref({
  name: "",
  description: "",
  Muscle: "",
  SubMuscle: "",
});
const subMuscles = ref();
const exercisenames = ref();

const modalOpen = ref(false);

const emits = defineEmits(["exerciseAdded"]);

onBeforeMount(async () => {
  await loadSubMuscles();
  await loadExerciseNames();
  modalOpen.value = stateStore.showAddPlanModal;
});

const loadSubMuscles = async () => {
  const query = `SELECT Muscle, SubMuscle FROM MuscleGroup`;
  const resp = await databaseStore.getDatabase()?.query(query);
  subMuscles.value = resp?.values ? resp.values : [];
};

const loadExerciseNames = async () => {
  const query = `SELECT name FROM Exercise`;
  const resp = await databaseStore.getDatabase()?.query(query);
  exercisenames.value = resp?.values ? resp.values.map((res) => res.name) : [];
};

stateStore.$subscribe((mutation, state) => {
  modalOpen.value = state.showAddExerciseModal;
});

const confirmModal = async () => {
  // check if exercise.value.names is in exercisenames.value
  // if not, add it to the database
  stateStore.setShowAddExerciseModal(false);
  if (!exercisenames.value.includes(exercise.value.name)) {
    const query = `INSERT INTO Exercise (name, description, muscleGroup) VALUES ('${exercise.value.name}', '${exercise.value.description}', (SELECT ID FROM MuscleGroup WHERE SubMuscle = '${exercise.value.SubMuscle}'))`;
    await databaseStore.getDatabase()?.run(query);
    emits("exerciseAdded");
  } else {
    alert("Exercise already exists");
  }
};

const checkIfModalIsFilled = (): boolean => {
  if (
    exercise.value.name === "" ||
    exercise.value.description === "" ||
    exercise.value.SubMuscle === ""
  ) {
    return true;
  }
  return false;
};
</script>

<style scoped></style>
