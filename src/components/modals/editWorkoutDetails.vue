<template>
  <ion-modal ref="modal" :isOpen="modalOpen">
    <!-- @willDismiss="onWillDismiss"> -->
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="cancel()">Cancel</ion-button>
        </ion-buttons>
        <ion-title>Edit Workout</ion-title>
        <ion-buttons slot="end">
          <ion-button :strong="true" @click="confirmModal()" :disabled="false">
            Confirm</ion-button
          >
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item v-if="workoutQueryResult">
        <ion-label>Start Time</ion-label>
        <ion-datetime-button datetime="time"></ion-datetime-button>

        <ion-modal :keep-contents-mounted="true">
          <ion-datetime
            presentation="time"
            id="time"
            v-model="modalStarttime"></ion-datetime>
        </ion-modal>
      </ion-item>

      <ion-item v-if="workoutQueryResult">
        <ion-label>End Time</ion-label>
        <ion-datetime-button datetime="datetime"></ion-datetime-button>

        <ion-modal :keep-contents-mounted="true">
          <ion-datetime
            presentation="date-time"
            id="datetime"
            v-model="modalEndtime"></ion-datetime>
        </ion-modal>
      </ion-item>
      <ion-item>
        <ion-textarea
          label="Notes"
          style="height: 150px"
          v-model="modalNotes"></ion-textarea>
      </ion-item>
      <h5
        v-if="exercises.length > 0"
        v-for="(exercise, index) in modalPlaceholder"
        :key="index"
        style="margin-top: 50px">
        {{ exercise.exerciseName }}, Set {{ exercise.set }}
        <ion-item>
          <div style="display: flex; flex-direction: column">
            <div style="display: flex; flex-direction: row">
              <ion-input
                label="Reps"
                type="number"
                :value="exercise.reps?.toString() || '0'"
                v-model="exercise.reps"
                @ion-blur="
                  leaveReps(
                    exercise.exerciseName,
                    exercise.set,
                    $event.target.value
                  )
                ">
              </ion-input>
              <ion-input
                label="Weight"
                type="number"
                :value="exercise.weight?.toString() || '0'"
                v-model="exercise.weight"
                @ion-blur="
                  leaveWeight(
                    exercise.exerciseName,
                    exercise.set,
                    $event.target.value
                  )
                ">
              </ion-input>
              <ion-select
                label="Unit"
                :interface-options="{
                  header: 'Units',
                }"
                interface="action-sheet"
                placeholder="Unit"
                @ion-blur="
                  leaveUnit(
                    exercise.exerciseName,
                    exercise.set,
                    $event.target.value
                  )
                ">
                <ion-select-option value="kg">kg</ion-select-option>
                <ion-select-option value="lbs">lbs</ion-select-option>
                <ion-select-option value="sec">Seconds</ion-select-option>
              </ion-select>
            </div>
          </div>
        </ion-item>
      </h5>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import Diagram from "@/components/Diagram.vue";
import { useDatabaseStore } from "@/stores/databaseStore";
import { useStateStore } from "@/stores/stateStore";
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonItem,
  IonModal,
  IonButton,
  IonButtons,
  IonDatetime,
  IonDatetimeButton,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonInput,
} from "@ionic/vue";
import { onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";

const databaseStore = useDatabaseStore();
const route = useRoute();
const stateStore = useStateStore();

const emits = defineEmits(["reloadWorkoutData"]);

const showDiagram = ref(true);

const workoutQueryResult = ref<{
  workoutname: string;
  startdate: string;
  enddate: string;
  note: string;
}>({ workoutname: "No Workout found", startdate: "", enddate: "", note: "" });
const workoutExercises = ref<any>([]);
const lastWorkoutExercises = ref<any>([]);
const exercises = ref<any>([]);
const sets = ref(0);
const SetResults = ref<
  {
    exerciseName: string;
    set: number;
    reps?: number;
    weight?: number;
    unit?: string;
  }[]
>([]);

const modalPlaceholder = ref<
  {
    exerciseName: string;
    set: number;
    reps?: number;
    weight?: number;
    unit?: string;
  }[]
>([]);

const modal = ref();
const modalOpen = ref(false);
const modalStarttime = ref("");
const modalEndtime = ref();
const modalNotes = ref("");

stateStore.$subscribe((mutation, state) => {
  modalOpen.value = state.showEditWorkoutModal;
});

// watcher triggers when modalOpen switches to true
watch(modalOpen, (value) => {
  if (value) {
    modalPlaceholder.value = [];
    if (workoutExercises.value.length) {
      // setResults to workoutExercises
      workoutExercises.value.forEach((exercise: any) => {
        modalPlaceholder.value.push({
          exerciseName: exercise.exercise,
          set: exercise.setNumber,
          reps: exercise.reps,
          weight: exercise.weight,
          unit: exercise.unit,
        });
      });
    } else if (lastWorkoutExercises.value.length) {
      lastWorkoutExercises.value.forEach((exercise: any) => {
        modalPlaceholder.value.push({
          exerciseName: exercise.exercise,
          set: exercise.setNumber,
          reps: exercise.reps,
          weight: exercise.weight,
          unit: exercise.unit,
        });
      });
    } else {
      exercises.value.forEach((exercise: any) => {
        for (let i = 1; i <= exercise.sets; i++) {
          modalPlaceholder.value.push({
            exerciseName: exercise.exerciseName,
            reps: parseInt(exercise.reps.split("-")),
            weight: 0,
            set: i,
            unit: "kg",
          });
        }
      });
    }
  }
});

const loadWorkout = async () => {
  const date = route.params.id;
  const workout = await databaseStore.getDatabase()?.query(`SELECT *
    FROM Workout
    WHERE DATE(startdate) = '${date.slice(0, 10)}';
    `);
  workoutQueryResult.value = workout?.values
    ? workout?.values[0]
    : { workoutname: "No Workout found" };
};

const loadExercises = async () => {
  const date = route.params.id;
  const query = `SELECT we.exercise, we.setnumber, we.reps, we.weight, we.unit, wl.OrderIndex from WorkoutExercise we  JOIN WorkoutList wl ON we.exercise = wl.exerciseName AND wl.WorkoutPlan = '${
    workoutQueryResult.value.workoutname
  }' WHERE DATE(we.workout) = '${date.slice(0, 10)}';`;
  const exercises = await databaseStore.getDatabase()?.query(query);
  workoutExercises.value = exercises?.values || [];
  workoutExercises.value
    .sort((a: any, b: any) => a.setNumber - b.setNumber)
    .sort((a: any, b: any) => a.OrderIndex - b.OrderIndex);
};

const loadListExercises = async () => {
  const result = await databaseStore
    .getDatabase()
    ?.query(
      `SELECT * FROM WorkoutList WHERE WorkoutPlan = '${workoutQueryResult.value.workoutname}'`
    );

  exercises.value = result?.values || [];

  sets.value = 0;
  exercises.value.forEach((exercise: any) => {
    sets.value += exercise.sets;
  });
};

const loadLastExercises = async () => {
  const resp = await databaseStore.getDatabase()?.query(
    `
    SELECT exercise, reps, setnumber, weight, unit
    FROM WorkoutExercise AS we1
    INNER JOIN Workout AS w ON we1.workout = w.startdate
    WHERE w.workoutname = '${workoutQueryResult.value.workoutname}'
    AND w.startdate < '${workoutQueryResult.value.startdate}'
    AND w.startdate = (
        SELECT MAX(we2.workout)
        FROM WorkoutExercise AS we2
        INNER JOIN Workout AS w2 ON we2.workout = w2.startdate
        WHERE w2.workoutname = '${workoutQueryResult.value.workoutname}'
        AND w2.startdate < '${workoutQueryResult.value.startdate}'
    );

    `
  );
  lastWorkoutExercises.value = resp?.values || [];
};

onBeforeMount(async () => {
  console.log(route.fullPath);
  await loadWorkout();
  await loadExercises();
  await loadListExercises();
  await loadLastExercises();
  const date = route.params.id as string;

  modalStarttime.value = workoutQueryResult.value.startdate;
  modalEndtime.value = workoutQueryResult.value.enddate;
  modalNotes.value = workoutQueryResult.value.note;
});

const cancel = () => {
  modal.value.$el.dismiss(null, "cancel");
  stateStore.setShowEditWorkoutModal(false);
};

const confirmModal = async () => {
  modal.value.$el.dismiss(name, "confirm");
  stateStore.setShowEditWorkoutModal(false);

  // Test if stardate is in Workout Table
  const resp = await databaseStore.getDatabase()?.query(`SELECT *
    FROM Workout
    WHERE startdate = '${modalStarttime.value}';
    `);
  const workout = resp?.values ? resp.values[0] : null;
  console.log(workout?.values);

  if (workout.startdate) {
    const updateQuery = `UPDATE Workout SET workoutname = '${workoutQueryResult.value.workoutname}', startdate = '${modalStarttime.value}', enddate = '${modalEndtime.value}', note = '${modalNotes.value}' WHERE startdate = '${modalStarttime.value}';`;
    console.log(updateQuery);
    await databaseStore.getDatabase()?.execute(updateQuery);
  } else {
    const query = `INSERT INTO Workout (workoutname, startdate, enddate, note) VALUES ('${workoutQueryResult.value.workoutname}', '${modalStarttime.value}', '${modalEndtime.value}', '${modalNotes.value}');`;
    console.log(query);
    await databaseStore.getDatabase()?.execute(query);

    // update WorkoutExercise Table where workout = workoutQueryResult.value.startdate to modalStarttime.value
    const updateWEQuery = `UPDATE WorkoutExercise SET workout = '${modalStarttime.value}' WHERE workout = '${workoutQueryResult.value.startdate}';`;
    console.log(updateWEQuery);
    await databaseStore.getDatabase()?.execute(updateWEQuery);

    const deleteQuery = `DELETE FROM Workout WHERE startdate = '${workoutQueryResult.value.startdate}';`;
    console.log(deleteQuery);
    await databaseStore.getDatabase()?.execute(deleteQuery);

    // if (workoutExercises.value.length === 0) {
    // await SetResults.value.map(async (exercise: any) => {
    //   console.log(exercise);
    //   console.log("modalPlaceholder", modalPlaceholder.value);
    //   const index = modalPlaceholder.value.findIndex(
    //     (obj: any) =>
    //       obj.exerciseName === exercise.exerciseName && obj.set === exercise.set
    //   );

    //   console.log("Index", index);
    //   exercise.reps
    //     ? exercise.reps
    //     : (exercise.reps = modalPlaceholder.value[index].reps);
    //   exercise.weight
    //     ? exercise.weight
    //     : (exercise.weight = modalPlaceholder.value[index].weight);
    //   exercise.unit ? exercise.unit : (exercise.unit = "kg");

    // const insertQuery = `INSERT INTO WorkoutExercise (workout, exercise, setNumber,  reps, weight, unit)
    //       VALUES ('${modalStarttime.value}', '${exercise.exerciseName}', ${exercise.set} ,
    //       ${exercise.reps}, ${exercise.weight}, '${exercise.unit}');`;

    // console.log(insertQuery);
    // await databaseStore.getDatabase()?.execute(insertQuery);
    // });
    // } else if (SetResults.value.length !== 0) {
    // await SetResults.value.map(async (exercise: any) => {
    //   const index = workoutExercises.value.findIndex(
    //     (obj: any) =>
    //       obj.exercise === exercise.exerciseName &&
    //       obj.setNumber === exercise.set
    //   );
    //   exercise.reps
    //     ? exercise.reps
    //     : (exercise.reps = workoutExercises.value[index].reps);
    //   exercise.weight
    //     ? exercise.weight
    //     : (exercise.weight = workoutExercises.value[index].weight);
    //   exercise.unit ? exercise.unit : (exercise.unit = "kg");

    // console.log("update");
    // const query = `UPDATE WorkoutExercise
    //       SET reps = ${exercise.reps},
    //           weight = ${exercise.weight},
    //           unit = '${exercise.unit}'
    //       WHERE workout = '${modalStarttime.value}'
    //         AND exercise = '${exercise.exerciseName}' AND setNumber = ${exercise.set};`;
    // console.log(query);
    // await databaseStore.getDatabase()?.execute(query);
    // });
  }

  for (let i = 0; i < modalPlaceholder.value.length; i++) {
    console.log("ModalPlaceholer: ", modalPlaceholder.value[i]);
    console.log("WorkoutExercises: ", workoutExercises.value);
    const index = workoutExercises.value.findIndex(
      (obj: any) =>
        obj.exercise == modalPlaceholder.value[i].exerciseName &&
        obj.setNumber == modalPlaceholder.value[i].set
    );

    console.log("Index", index);
    if (index !== -1) {
      console.log("update");
      const query = `UPDATE WorkoutExercise
              SET reps = ${modalPlaceholder.value[i].reps},
                  weight = ${modalPlaceholder.value[i].weight},
                  unit = '${modalPlaceholder.value[i].unit}'
              WHERE workout = '${modalStarttime.value}'
                AND exercise = '${modalPlaceholder.value[i].exerciseName}' AND setNumber = ${modalPlaceholder.value[i].set};`;
      console.log(query);
      await databaseStore.getDatabase()?.run(query);
    } else {
      console.log("insert");
      const insertQuery = `INSERT INTO WorkoutExercise (workout, exercise, setNumber,  reps, weight, unit)
              VALUES ('${modalStarttime.value}', '${modalPlaceholder.value[i].exerciseName}', ${modalPlaceholder.value[i].set} ,
              ${modalPlaceholder.value[i].reps}, ${modalPlaceholder.value[i].weight}, '${modalPlaceholder.value[i].unit}');`;

      console.log(insertQuery);
      await databaseStore.getDatabase()?.run(insertQuery);
    }

    emits("reloadWorkoutData");
  }

  showDiagram.value = false;
  await loadWorkout();
  await loadExercises();
  showDiagram.value = true;
};

const leaveReps = (
  exerciseName: string,
  set: number,
  value: string | number | null | undefined
) => {
  console.log(exerciseName, set, value, SetResults);
  // Look if theres an object in SetResultsReps where exerciseName and set are the same, then update otherwise add as new element
  const index = SetResults.value.findIndex(
    (obj) => obj.exerciseName === exerciseName && obj.set === set
  );
  console.log(index);
  if (index !== -1) {
    value === "" || value === null || value === undefined
      ? SetResults.value[index].weight
        ? (SetResults.value[index].reps = 0)
        : SetResults.value.splice(index, 1)
      : (SetResults.value[index].reps = Number(value));
  } else {
    SetResults.value.push({
      exerciseName,
      set,
      reps: Number(value),
    });
  }
};

const leaveWeight = (
  exerciseName: string,
  set: number,
  value: string | number | null | undefined
) => {
  console.log(exerciseName, set, value, SetResults);
  // Look if theres an object in SetResultsReps where exerciseName and set are the same, then update otherwise add as new element
  const index = SetResults.value.findIndex(
    (obj) => obj.exerciseName === exerciseName && obj.set === set
  );
  if (index !== -1) {
    value === "" || value === null || value === undefined
      ? SetResults.value[index].reps
        ? (SetResults.value[index].weight = 0)
        : SetResults.value.splice(index, 1)
      : (SetResults.value[index].weight = Number(value));
  } else {
    SetResults.value.push({
      exerciseName,
      set,
      weight: Number(value),
    });
  }
};

const leaveUnit = (
  exerciseName: string,
  set: number,
  value: string | number | null | undefined
) => {
  // Look if theres an object in SetResultsReps where exerciseName and set are the same, then update otherwise add as new element
  const index = SetResults.value.findIndex(
    (obj) => obj.exerciseName === exerciseName && obj.set === set
  );
  if (index !== -1) {
    SetResults.value[index].unit = value?.toString();
  } else {
    SetResults.value.push({
      exerciseName: exerciseName,
      set,
      unit: value?.toString(),
    });
  }
};
</script>
