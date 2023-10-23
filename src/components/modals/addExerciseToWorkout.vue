<template>
  <ion-modal ref="modal" :isOpen="showAddExerciseModal">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="cancel()">Cancel</ion-button>
        </ion-buttons>
        <ion-title>Add Exercise</ion-title>
        <ion-buttons slot="end">
          <ion-button :strong="true" @click="confirmModal()" :disabled="false">
            Confirm</ion-button
          >
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-searchbar
        @ionInput="handleInput($event)"
        placeholder="Search"></ion-searchbar>
      <ion-list>
        <ion-list-header>
          <ion-label>Exercises</ion-label>
          <ion-label style="text-align: end; margin-right: 24px">
            Sets
          </ion-label>
        </ion-list-header>
        <ion-item v-for="exercise in modalExercises" :key="exercise.name">
          <ion-label @click="openPopover(exercise.name, $event)">
            <span style="color: white">{{ exercise.name }}</span>
            <ion-label color="medium">{{ exercise.SubMuscle }}</ion-label>
          </ion-label>
          <ion-popover
            :is-open="popoverOpen[exercise.name]"
            :keep-contents-mounted="true"
            @didDismiss="popoverOpen[exercise.name] = false">
            <ion-content class="ion-padding">
              {{ exercise.description }}
            </ion-content>
          </ion-popover>
          <ion-label
            v-if="allExercises"
            style="
              display: flex;
              align-items: center;
              justify-content: flex-end;
              margin-left: auto;
            ">
            <ion-input
              label=""
              v-model="exercise.sets"
              placeholder="2"
              style="
                border: 1px solid #fff;
                border-radius: 5px;
                max-width: 50px;
                text-align: center;
              "></ion-input>
            <span style="margin: 0 5px">x</span>
            <ion-input
              label=""
              v-model="exercise.reps"
              placeholder="8-12"
              style="
                border: 1px solid #fff;
                border-radius: 5px;
                max-width: 80px;
                text-align: center;
              "></ion-input>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import {
  IonLabel,
  IonContent,
  IonTitle,
  IonToolbar,
  IonHeader,
  IonItem,
  IonInput,
  IonList,
  IonModal,
  IonSearchbar,
  IonListHeader,
  IonButton,
  IonButtons,
  IonPopover,
} from "@ionic/vue";
import { onBeforeMount, ref } from "vue";
import { useDatabaseStore } from "@/stores/databaseStore";
import {
  getPossibleSplits,
  getAllMusclesFromSplit,
} from "@/datatypes/splitCalculator";
import { Exercise } from "@/datatypes/Exercise";
import { useStateStore } from "@/stores/stateStore";

const databaseStore = useDatabaseStore();
const stateStore = useStateStore();

const emit = defineEmits(["refreshExercises"]);

stateStore.$subscribe((mutation, state) => {
  showAddExerciseModal.value = state.showAddExerciseToWorkoutModal;
});

const route = useRoute();

const workout = ref<string>("");

const exercises = ref();
const allExercises = ref<Exercise[]>([]);
const modalExercises = ref<Exercise[]>([]);

const muscles = ref<number[]>([]);
const currentSplits = ref<string[]>([]);
const allMusclesOfSplit = ref<number[]>([]);
const missingMuscles = ref<number[]>([]);
const showAddExerciseModal = ref<boolean>(false);
const modal = ref<any>(null);
const missingMusclesFlag = ref<boolean>(true);

const name = ref<string>("");

const popoverOpen = ref<{ [key: string]: any }>({});

const loadAllExercises = async () => {
  const query = `SELECT Exercise.name, Exercise.description, MuscleGroup.Muscle, MuscleGroup.SubMuscle FROM Exercise INNER JOIN MuscleGroup on Exercise.muscleGroup = MuscleGroup.ID`;

  const resp = await databaseStore.getDatabase()?.query(query);
  allExercises.value = resp?.values ? resp.values : [];

  modalExercises.value = allExercises.value;
};

onBeforeMount(async () => {
  workout.value = route.params.id as string;
  await loadAllExercises();
  muscles.value = exercises.value.map((exercise: any) => exercise.ID);
  initPopoverOpenRef();
});

const musclesWithSubgroup = async (musclesOfSplit: number[]) => {
  const result: number[] = [];
  for (let i = 0; i < musclesOfSplit.length; i++) {
    const query = `SELECT SubMuscle FROM MuscleGroup WHERE ID = ${musclesOfSplit[i]}`;
    const resp = await databaseStore.getDatabase()?.query(query);
    const answer = resp?.values ? resp.values : [];
    if (answer && !muscles.value.includes(musclesOfSplit[i])) {
      result.push(answer[0].SubMuscle);
    }
  }
  return result;
};

const initPopoverOpenRef = () => {
  allExercises.value.map((exercise) => {
    popoverOpen.value[exercise.name] = false;
  });
  console.log(popoverOpen.value);
};

const openPopover = (name: string, event: any) => {
  popoverOpen.value[name] = true;
  event.value = event;
};

const cancel = () => {
  modal.value.$el.dismiss(null, "cancel");
  stateStore.setShowAddExerciseToWorkoutModal(false);
};

const handleInput = (event: any) => {
  const query = event.target.value.toLowerCase(); // To ignore case sensitivity
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
    console.log(modalExercises.value);
  }
};

// Add Exercise
const confirmModal = async () => {
  handleInput({ target: { value: "" } });
  let ids: any[] = [];
  const query = `SELECT MAX(OrderIndex) as max FROM WorkoutList WHERE workoutPlan = '${name.value}'`;
  const resp = await databaseStore.getDatabase()?.query(query);
  console.log(resp);
  let id =
    resp?.values && resp.values[0].max !== undefined
      ? resp.values[0].max + 1
      : 0;
  modalExercises.value = modalExercises.value.map((exercise) => {
    if (exercise.sets || exercise.reps) {
      console.log(exercise);
      const query = `INSERT INTO WorkoutList (OrderIndex, workoutPlan, exerciseName, sets, reps) VALUES (${id}, '${name.value}', '${exercise.name}', ${exercise.sets}, '${exercise.reps}')`;
      databaseStore.getDatabase()?.run(query);

      id += 1;

      if (exercise.SubMuscle) ids.push(exercise.SubMuscle);
      exercise.sets = undefined;
      exercise.reps = "";
    }
    return exercise;
  });
  workout.value = name.value;
  cancel();

  for (let i = 0; i < ids.length; i++) {
    // get id from MuscleGroup of exercise.SubMuscle
    const query = `SELECT ID FROM MuscleGroup WHERE SubMuscle = '${ids[i]}'`;
    const resp = await databaseStore.getDatabase()?.query(query);
    const answer = resp?.values ? resp.values : [];

    muscles.value.push(answer[0].ID);
  }
  muscles.value = exercises.value.map((exercise: any) => exercise.ID);
  currentSplits.value = getPossibleSplits(muscles.value);
  allMusclesOfSplit.value = getAllMusclesFromSplit(currentSplits.value[0]);
  missingMuscles.value = await musclesWithSubgroup(allMusclesOfSplit.value);
  missingMusclesFlag.value = false;
  stateStore.setShowAddExerciseToWorkoutModal(false);
  emit("refreshExercises");

  setTimeout(() => {
    missingMusclesFlag.value = true;
  }, 1);
};
</script>

<style scoped>
ion-popover {
  --background: rgba(40, 173, 218, 0.6);
  --backdrop-opacity: 0.75;
  --border-color: rgba(40, 173, 218, 0.6);
  --color: white;
  --width: 300px;
}
ion-popover ion-content {
  /* --background: rgba(40, 173, 218, 0.6); */
  border: 5px solid var(--ion-color-primary);
}
</style>
