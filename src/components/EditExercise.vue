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
      <ion-item v-if="name">
        <ion-label position="floating">Name</ion-label>
        <ion-input type="text" v-model="name"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="floating" v-if="description"
          >Description</ion-label
        >
        <ion-textarea v-model="description" :rows="15"></ion-textarea>
      </ion-item>
      <ion-item v-if="subMuscle">
        <ion-select v-model="subMuscle" interface="action-sheet">
          <ion-select-option
            v-for="subMuscle in subMuscles"
            :key="subMuscle.SubMuscle"
            :value="subMuscle.SubMuscle">
            {{ subMuscle.SubMuscle }}, {{ subMuscle.Muscle }}
          </ion-select-option>
        </ion-select>
      </ion-item>
    </ion-content>
    <p>{{ exercise }}</p>
  </ion-modal>
</template>

<script lang="ts" setup>
import { onBeforeMount, reactive, ref } from "vue";
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

const name = ref();
const description = ref();
const subMuscle = ref();
const muscle = ref();

const subMuscles = ref();

stateStore.$subscribe((mutation, state) => {
  console.log("TRIGGERED");
  modalOpen.value = state.showEditExerciseModal;
  console.log("Exercise", exercise);
  name.value = exercise.name;
  description.value = exercise.ExDesc;
  subMuscle.value = exercise.SubMuscle;
  muscle.value = exercise.Muscle;
});

// define emit
const emit = defineEmits(["reloadExercises"]);

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
  // Get muscleGroup ID from db
  const selectQuery = `SELECT id FROM MuscleGroup WHERE SubMuscle = '${subMuscle.value}' AND Muscle = '${muscle.value}' `;
  console.log(selectQuery);
  const resp = await databaseStore.getDatabase()?.query(selectQuery);
  const muscleGroupID = resp?.values ? resp.values[0].ID : null;
  // Save everything to database
  const query = `UPDATE Exercise SET name = '${name.value}', description = '${description.value}', muscleGroup = '${muscleGroupID}' WHERE name = '${exercise.name}'`;
  console.log(query);
  await databaseStore.getDatabase()?.run(query);
  emit("reloadExercises", name.value);
  stateStore.setShowEditExerciseModal(false);
};
</script>

<style scoped>
.icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
