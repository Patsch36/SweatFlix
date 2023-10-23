<template>
  <div style="display: flex; justify-content: space-between">
    <ion-button
      fill="outline"
      @click="stateStore.setShowAddExerciseModal(true)"
      color="light"
      style="width: 47.5%">
      Add new Exercise
    </ion-button>
    <ion-button
      v-if="!showDoneExercises"
      @click="
        modalExercises = allExercises.filter((item) => item.isWorkedOut);
        showDoneExercises = true;
      "
      fill="outline"
      color="light"
      style="width: 47.5%">
      Show done exercises
    </ion-button>
    <ion-button
      v-else
      @click="
        modalExercises = allExercises;
        showDoneExercises = false;
      "
      fill="outline"
      color="light"
      style="width: 47.5%">
      Show all exercises
    </ion-button>
  </div>
  <div class="searchbar-container">
    <ion-searchbar
      @ionInput="handleInput($event)"
      placeholder="Search"
      v-model="searchQuery"
      @keydown.enter="hideKeyboard"></ion-searchbar>
    <ion-button @click="hideKeyboard" color="light">
      <ion-icon slot="icon-only" :icon="searchOutline"></ion-icon>
    </ion-button>
  </div>
  <ion-list>
    <ion-list-header>
      <ion-label>Exercises</ion-label>
    </ion-list-header>
    <ion-item-sliding v-for="exercise in modalExercises" :key="exercise.name">
      <ion-item @click="router.push(`/exercise/${exercise.name}`)">
        <ion-label style="color: white; min-width: max-content">
          <span>{{ exercise.name }}</span>
          <ion-label color="medium">
            {{ exercise.SubMuscle }}
          </ion-label>
        </ion-label>
        <ion-label
          v-if="allExercises"
          style="
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin-left: auto;
          ">
        </ion-label>
      </ion-item>
      <ion-item-options side="end">
        <ion-item-option color="danger" expandable>
          <ion-button
            color="transparent"
            @click="deleteExercise(exercise.name)">
            <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
          </ion-button>
        </ion-item-option>
      </ion-item-options>
    </ion-item-sliding>
  </ion-list>
  <add-exercise @exerciseAdded="loadAllExercises()"></add-exercise>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonListHeader,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
} from "@ionic/vue";
import { onBeforeMount, ref } from "vue";
import { useDatabaseStore } from "@/stores/databaseStore";
import { Exercise } from "@/datatypes/Exercise";
import { useRouter } from "vue-router";
import { useStateStore } from "@/stores/stateStore";
import { trashOutline, searchOutline } from "ionicons/icons";
import { Keyboard } from "@capacitor/keyboard";
import AddExercise from "@/components/modals/addExercise.vue";

const stateStore = useStateStore();
const databaseStore = useDatabaseStore();
const router = useRouter();

const searchQuery = ref();

const allExercises = ref<Exercise[]>([]);
const modalExercises = ref<Exercise[]>([]);
const showDoneExercises = ref(false);

const hideKeyboard = async () => {
  await Keyboard.hide();
};

onBeforeMount(async () => {
  await loadAllExercises();
  modalExercises.value = allExercises.value;
  searchQuery.value = stateStore.profileSearchQuery;
  handleInput({ target: { value: searchQuery.value } });
});

const handleInput = async (event: any) => {
  const query = event.target.value.toLowerCase(); // To ignore case sensitivity
  stateStore.setProfileSearchQuery(query);
  console.log(query);

  if (query === "" || !allExercises.value) {
    modalExercises.value = allExercises.value;
  } else {
    modalExercises.value = allExercises.value.filter((exercise) => {
      const exerciseName = exercise.name.toLowerCase(); // To ignore case sensitivity
      const subMuscle = exercise.SubMuscle.toLowerCase(); // To ignore case sensitivity
      const muscle = exercise.Muscle.toLowerCase(); // To ignore case sensitivity

      return (
        exerciseName.indexOf(query) !== -1 || // Check if the query string is found in the name
        subMuscle.indexOf(query) !== -1 || // Check if the query string is found in the SubMuscle
        muscle.indexOf(query) !== -1 // Check if the query string is found in the Muscle
      );
    });

    if (showDoneExercises.value)
      modalExercises.value = modalExercises.value.filter(
        (exercise) => exercise.isWorkedOut
      );
    console.log(modalExercises.value);
  }
};

const loadAllExercises = async () => {
  const query = `SELECT DISTINCT
  Exercise.name,
  Exercise.description,
  MuscleGroup.Muscle,
  MuscleGroup.SubMuscle,
  CASE WHEN WorkoutExercise.ID IS NOT NULL THEN 1 ELSE 0 END AS isWorkedOut
FROM
  Exercise
INNER JOIN
  MuscleGroup
ON
  Exercise.muscleGroup = MuscleGroup.ID
LEFT JOIN
  WorkoutExercise
ON
  Exercise.Name = WorkoutExercise.exercise
  ORDER BY Exercise.Name ASC
`;

  const resp = await databaseStore.getDatabase()?.query(query);
  allExercises.value = resp?.values ? resp.values : [];
};

const deleteExercise = async (name: string) => {
  const query = `DELETE FROM Exercise WHERE name = '${name}'`;
  await databaseStore.getDatabase()?.run(query);
  await loadAllExercises();
  modalExercises.value = allExercises.value;
};
</script>

<style scoped>
.searchbar-container {
  display: flex;
  flex-direction: row;
}
</style>
