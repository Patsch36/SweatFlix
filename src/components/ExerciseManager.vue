<template>
  <div
    class="list-header"
    @click="stateStore.setShowAddExerciseToWorkoutModal(true)"
    v-if="showList">
    <ion-icon :icon="addOutline" color="light"></ion-icon>
  </div>
  <ion-list v-if="showList">
    <ion-list-header>
      <ion-label class="mt-0">Exercises</ion-label>
      <ion-label class="mt-0" style="text-align: end; margin-right: 24px"
        >Sets</ion-label
      >
    </ion-list-header>
    <ion-reorder-group
      :disabled="false"
      @ionItemReorder="handleReorder($event)">
      <ion-item v-for="exercise in exercises" key="exercise.ID">
        <ion-label @click="router.push(`/exercise/${exercise.exerciseName}`)">
          {{ exercise.exerciseName || exercise.name }}
        </ion-label>
        <ion-label
          style="
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin-left: auto;
          ">
          <ion-input
            v-model="exercise.sets"
            label=""
            placeholder="2"
            @ionBlur="changeExerciseValues(exercise)"
            style="
              border: 1px solid #fff;
              border-radius: 5px;
              max-width: 50px;
              text-align: center;
            ">
          </ion-input>
          <span style="margin: 0 5px">x</span>
          <ion-input
            v-model="exercise.reps"
            label=""
            placeholder="8-12"
            @ionBlur="changeExerciseValues(exercise)"
            style="
              border: 1px solid #fff;
              border-radius: 5px;
              max-width: 80px;
              text-align: center;
            ">
          </ion-input>
        </ion-label>

        <ion-reorder slot="end"></ion-reorder>
      </ion-item>
    </ion-reorder-group>
  </ion-list>
  <AddExerciseToWorkout @refreshExercises="refresh" />
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { addOutline } from "ionicons/icons";
import {
  IonIcon,
  IonLabel,
  IonItem,
  IonInput,
  IonList,
  IonListHeader,
  IonReorderGroup,
  IonReorder,
} from "@ionic/vue";
import { onBeforeMount, ref } from "vue";
import { useDatabaseStore } from "@/stores/databaseStore";
import { useStateStore } from "@/stores/stateStore";
import { Exercise } from "@/datatypes/Exercise";
import AddExerciseToWorkout from "./modals/addExerciseToWorkout.vue";

const databaseStore = useDatabaseStore();
const stateStore = useStateStore();

const route = useRoute();
const router = useRouter();

const workout = ref<string>("");

const exercises = ref();
const allExercises = ref<Exercise[]>([]);
const modalExercises = ref<Exercise[]>([]);

const muscles = ref<number[]>([]);
const showList = ref<boolean>(true);

const name = ref<string>("");
const popoverOpen = ref<{ [key: string]: any }>({});

const loadWorkoutExcercises = async () => {
  const query = `SELECT WorkoutList.exerciseName, WorkoutList.sets, WorkoutList.reps, MuscleGroup.ID, WorkoutList.OrderIndex
  FROM WorkoutList INNER JOIN MuscleGroup INNER JOIN Exercise on WorkoutList.exerciseName == Exercise.name
  AND Exercise.MuscleGroup = MuscleGroup.ID WHERE workoutPlan = '${workout.value}'`;

  const resp = await databaseStore.getDatabase()?.query(query);
  exercises.value = resp?.values ? resp.values : [];

  exercises.value.sort((a: any, b: any) => a.OrderIndex - b.OrderIndex);
};

const loadAllExercises = async () => {
  const query = `SELECT Exercise.name, Exercise.description, MuscleGroup.Muscle, MuscleGroup.SubMuscle FROM Exercise INNER JOIN MuscleGroup on Exercise.muscleGroup = MuscleGroup.ID`;

  const resp = await databaseStore.getDatabase()?.query(query);
  allExercises.value = resp?.values ? resp.values : [];
};

onBeforeMount(async () => {
  workout.value = route.params.id as string;
  await loadWorkoutExcercises();
  await loadAllExercises();
  muscles.value = exercises.value.map((exercise: any) => exercise.ID);

  modalExercises.value = allExercises.value;
  initPopoverOpenRef();

  if (workout.value !== "New Workout" && workout.value !== "NotFound")
    showList.value = true;
});

const initPopoverOpenRef = () => {
  allExercises.value.map((exercise) => {
    popoverOpen.value[exercise.name] = false;
  });
  console.log(popoverOpen.value);
};

const handleReorder = async (event: CustomEvent) => {
  // The `from` and `to` properties contain the index of the item
  // when the drag started and ended, respectively
  await console.log(
    "Dragged from index",
    event.detail.from,
    "to",
    event.detail.to
  );

  const to = event.detail.to;
  const from = event.detail.from;

  const ind = exercises.value.findIndex(
    (w: { OrderIndex: any }) => w.OrderIndex === from
  );
  const draggedItem = exercises.value[ind].WorkoutTemplateName;
  console.log(draggedItem);

  if (from < to) {
    for (let i = from; i < to; i++) {
      const index = exercises.value.findIndex(
        (w: { OrderIndex: any }) => w.OrderIndex === i + 1
      );
      console.log(i, exercises.value[index]);
      exercises.value[index].OrderIndex = i;
    }
    exercises.value[ind].OrderIndex = to;
  } else if (from > to) {
    for (let i = from - 1; i >= to; i--) {
      const index = exercises.value.findIndex(
        (w: { OrderIndex: any }) => w.OrderIndex === i
      );
      console.log(i + 1, exercises.value[index]);
      exercises.value[index].OrderIndex = i + 1;
    }
    exercises.value[ind].OrderIndex = to;
  }

  let dbOrderIndex = 0;
  // Delete all workouts in WorkoutTemplatePlan from Plan.value.ID
  const query2 = `DELETE FROM WorkoutList WHERE workoutPlan = '${name.value}'`;
  await databaseStore.getDatabase()?.run(query2);

  for (let i = 0; i < exercises.value.length; i++) {
    const itemIndex = exercises.value.findIndex(
      (w: { OrderIndex: any }) => w.OrderIndex === i
    );

    // Insert workout in WorkoutTemplatePlan with new OrderIndex = dbOrderIndex, pan.value.ID and workoutTemplatename
    const query = `INSERT INTO WorkoutList (workoutPlan, exerciseName, sets, reps, OrderIndex) VALUES ('${name.value}', '${exercises.value[itemIndex].exerciseName}', ${exercises.value[itemIndex].sets}, '${exercises.value[itemIndex].reps}', ${dbOrderIndex})`;
    console.log(query);
    await databaseStore.getDatabase()?.run(query);
    dbOrderIndex += 1;
  }

  // await loadWorkoutExcercises();

  await event.detail.complete();
};

const changeExerciseValues = (exercise: any) => {
  console.log("Exercise ", exercise);
  const query = `UPDATE WorkoutList SET exerciseName = '${exercise.exerciseName}', sets = ${exercise.sets}, reps = '${exercise.reps}' WHERE workoutPlan = '${workout.value}' AND OrderIndex = ${exercise.OrderIndex}`;
  console.log(query);
  databaseStore.getDatabase()?.run(query);
};

const refresh = async () => {
  await loadWorkoutExcercises();
  await loadAllExercises();
  muscles.value = exercises.value.map((exercise: any) => exercise.ID);

  modalExercises.value = allExercises.value;
  initPopoverOpenRef();
};
</script>

<style scoped>
.icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}

ion-button {
  height: 32px;
  --border-width: 3px;
  font-size: 16px;
}

.list-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: end;
  margin-top: 16px;
  margin-right: 16px;
}

.list-header ion-icon {
  font-size: 30px;
}

.mt-0 {
  margin-top: 0 !important;
}

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
