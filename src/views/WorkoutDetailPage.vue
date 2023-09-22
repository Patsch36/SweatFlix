<template>
  <ion-page style="height: calc(100vh - 100px)">
    <ion-header :translucent="true" color="light">
      <ion-toolbar>
        <ion-title color="primary-contrast">{{
          workoutQueryResult.workoutname
        }}</ion-title>
        <div class="icon">
          <ion-icon
            :icon="chevronBack"
            @click="router.go(-1)"
            size="large"
            color="primary"></ion-icon>
          <ion-label @click="router.go(-1)" color="primary">Back</ion-label>
        </div>
        <div class="icon" slot="end" style="margin-right: 16px">
          <ion-icon
            :icon="pencilOutline"
            @click="modalOpen = true"
            style="font-size: 24px; margin-right: 8px"
            color="primary"></ion-icon>
          <ion-label @click="modalOpen = true" color="primary">Edit</ion-label>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large" style="font-size: 28px">{{
            workoutQueryResult.workoutname
          }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-grid>
        <ion-row>
          <ion-col>
            <b>Started:</b>
            <br />
            {{ new Date(workoutQueryResult.startdate).toLocaleString() }}
          </ion-col>
          <ion-col>
            <b>Ended:</b>
            <br />
            {{ new Date(workoutQueryResult.enddate).toLocaleString() }}
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <b>Duration:</b>
            <br />
            {{
              new Date(
                new Date(workoutQueryResult.enddate).getTime() -
                  new Date(workoutQueryResult.startdate).getTime()
              ).getUTCHours()
            }}:{{
              new Date(
                new Date(workoutQueryResult.enddate).getTime() -
                  new Date(workoutQueryResult.startdate).getTime()
              ).getUTCMinutes()
            }}
            Stunden
          </ion-col>
          <ion-col
            v-if="
              allOverallWeights.some(
                (val) => val.WorkoutDatum === workoutQueryResult.startdate
              )
            ">
            <b>Overall Weight:</b>
            <div
              style="display: flex; flex-direction: row; height: 20px"
              v-if="
                allOverallWeights.length >= 1 &&
                allOverallWeights[0].OverAllSum !== 1
              ">
              <p>{{ allOverallWeights[0].OverAllSum }} kg</p>
              <p v-if="allOverallWeights.length > 1">
                (x{{
                  (
                    allOverallWeights[0].OverAllSum /
                    allOverallWeights[1].OverAllSum
                  ).toFixed(2)
                }})
              </p>
            </div>
            <div v-else>
              <p>No exercises found</p>
            </div>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <b>Notes:</b>
            <br />
            {{ workoutQueryResult.note }}
          </ion-col>
        </ion-row>
      </ion-grid>

      <Diagram :weights="queryResults" v-if="queryResults" />

      <!-- <p>{{ lastWorkoutExercises }}</p> -->
      <!-- <p>{{ workoutExercises.length }}</p> -->

      <ion-list v-show="workoutExercises.length">
        <ion-list-header>
          <ion-label>Exercises</ion-label>
          <ion-label style="text-align: end; margin-right: 24px">Set</ion-label>
        </ion-list-header>
        <ion-item-sliding
          v-for="(exercise, index) in workoutExercises"
          :key="index">
          <ion-item>
            <ion-label>{{ exercise.exercise }}</ion-label>
            <ion-label slot="end">
              {{ exercise.reps }} x {{ exercise.weight }} {{ exercise.unit }}
            </ion-label>
          </ion-item>
          <ion-item-options>
            <ion-item-option color="danger">
              <ion-button
                @click="
                  deleteWeightEntry(exercise.exercise, exercise.setNumber)
                "
                color="transparent">
                <ion-icon slot="icon-only" :icon="trash"></ion-icon>
              </ion-button>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <ion-modal ref="modal" :isOpen="modalOpen">
        <!-- @willDismiss="onWillDismiss"> -->
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button @click="cancel()">Cancel</ion-button>
            </ion-buttons>
            <ion-title>Edit Workout</ion-title>
            <ion-buttons slot="end">
              <ion-button
                :strong="true"
                @click="confirmModal()"
                :disabled="false">
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
          <p>{{ exercises }}</p>
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
                    @ion-blur="
                      leaveReps(
                        exercise.exerciseName,
                        exercise.set,
                        $event.target.value
                      )
                    "></ion-input>
                  <ion-input
                    label="Weight"
                    type="number"
                    :value="exercise.weight?.toString() || '0'"
                    @ion-blur="
                      leaveWeight(
                        exercise.exerciseName,
                        exercise.set,
                        $event.target.value
                      )
                    "></ion-input>
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
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import Diagram from "@/components/Diagram.vue";
import { useDatabaseStore } from "@/stores/databaseStore";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonListHeader,
  IonIcon,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonModal,
  IonButton,
  IonButtons,
  IonDatetime,
  IonDatetimeButton,
  IonTextarea,
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
  IonSelect,
  IonSelectOption,
  IonInput,
} from "@ionic/vue";
import { chevronBack, pencilOutline, trash } from "ionicons/icons";
import { onBeforeMount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const databaseStore = useDatabaseStore();
const route = useRoute();
const router = useRouter();

const workoutQueryResult = ref<{
  workoutname: string;
  startdate: string;
  enddate: string;
  note: string;
}>({ workoutname: "No Workout found", startdate: "", enddate: "", note: "" });
const workoutExercises = ref<any>([]);
const lastWorkoutExercises = ref<any>([]);
const allOverallWeights = ref([
  { OverAllSum: 1, WorkoutDatum: "0" },
  { OverAllSum: 1, WorkoutDatum: "0" },
]); // Init with 1, because before db is loaded, it is 0/0

const queryResults = ref<any>([]);
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
  const exercises = await databaseStore.getDatabase()?.query(`SELECT *
    FROM WorkoutExercise
    WHERE DATE(workout) = '${date.slice(0, 10)}';
    `);
  workoutExercises.value = exercises?.values || [];
};

const getOverallWeightsOfWorkout = async () => {
  const query = `SELECT
    we.workout AS WorkoutDatum,
    SUM(we.weight * we.reps) AS OverAllSum
      FROM
          WorkoutExercise we
      JOIN
          Workout w ON we.workout = w.startdate
      WHERE
          w.workoutname = '${workoutQueryResult.value.workoutname}'
          AND DATE(w.startdate)  <= '${workoutQueryResult.value.startdate}'
      GROUP BY
          we.workout
      ORDER BY
          we.workout;
    `;
  const exercises = await databaseStore.getDatabase()?.query(query);
  allOverallWeights.value = exercises?.values || [
    { OverAllSum: 1, WorkoutDatum: "0" },
    { OverAllSum: 1, WorkoutDatum: "0" },
  ];
  allOverallWeights.value.reverse();

  if (allOverallWeights.value.length > 1) {
    allOverallWeights.value.forEach((element: any) => {
      queryResults.value.push({
        timestamp: element.WorkoutDatum,
        weight: element.OverAllSum,
      });
    });
  }
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
  await loadWorkout();
  await loadExercises();
  await getOverallWeightsOfWorkout();
  await loadListExercises();
  await loadLastExercises();

  modalStarttime.value = workoutQueryResult.value.startdate;
  modalEndtime.value = workoutQueryResult.value.enddate;
  modalNotes.value = workoutQueryResult.value.note;
});

const cancel = () => {
  modal.value.$el.dismiss(null, "cancel");
  modalOpen.value = false;
};

const confirmModal = async () => {
  modal.value.$el.dismiss(name, "confirm");
  modalOpen.value = false;

  databaseStore.getDatabase()?.execute(
    `UPDATE Workout
      SET startdate = '${modalStarttime.value}',
          enddate = '${modalEndtime.value}',
          note = '${modalNotes.value}'
      WHERE startdate = '${workoutQueryResult.value.startdate}';`
  );

  console.log(SetResults.value, typeof SetResults.value);
  console.log(
    workoutExercises.value,
    typeof workoutExercises.value,
    workoutExercises.value.length
  );

  if (workoutExercises.value.length === 0) {
    await SetResults.value.map(async (exercise: any) => {
      const index = workoutExercises.value.findIndex(
        (obj: any) =>
          obj.exercise === exercise.exerciseName && obj.set === exercise.set
      );
      exercise.reps
        ? exercise.reps
        : (exercise.reps = workoutExercises.value[index].reps);
      exercise.weight
        ? exercise.weight
        : (exercise.weight = workoutExercises.value[index].weight);
      exercise.unit ? exercise.unit : (exercise.unit = "kg");

      console.log("insert");
      await databaseStore.getDatabase()?.execute(
        `INSERT INTO WorkoutExercise (workout, exercise, setNumber,  reps, weight, unit)
          VALUES ('${modalStarttime.value}', '${exercise.exerciseName}', ${exercise.set} ,
          ${exercise.reps}, ${exercise.weight}, '${exercise.unit}');`
      );
    });
  } else if (SetResults.value.length !== 0) {
    await SetResults.value.map(async (exercise: any) => {
      const index = workoutExercises.value.findIndex(
        (obj: any) =>
          obj.exercise === exercise.exerciseName && obj.set === exercise.set
      );
      exercise.reps
        ? exercise.reps
        : (exercise.reps = workoutExercises.value[index].reps);
      exercise.weight
        ? exercise.weight
        : (exercise.weight = workoutExercises.value[index].weight);
      exercise.unit ? exercise.unit : (exercise.unit = "kg");

      console.log("update");
      await databaseStore.getDatabase()?.execute(
        `UPDATE WorkoutExercise
          SET reps = ${exercise.reps},
              weight = ${exercise.weight},
              unit = '${exercise.unit}'
          WHERE workout = '${modalStarttime.value}'
            AND exercise = '${exercise.exerciseName}' AND setNumber = ${exercise.set};`
      );
    });
  }

  await loadWorkout();
  await loadExercises();
  await getOverallWeightsOfWorkout();
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

const deleteWeightEntry = async (exercise: string, set: number) => {
  // const date = route.params.id;
  // const exercises = await databaseStore.getDatabase()?.query(`SELECT *
  //   FROM WorkoutExercise
  //   WHERE DATE(workout) = '${date.slice(0, 10)}';
  //   `);
  // console.log(
  //   exercises?.values?.find(
  //     (val) =>
  //       val.exercise === exercise &&
  //       val.workout === workoutQueryResult.value.startdate &&
  //       val.setNumber === set
  //   ).ID
  // );
  // console.log(
  //   `DELETE FROM WorkoutExercise WHERE workout = "${workoutQueryResult.value.startdate}" AND exercise = '${exercise}' AND setNumber = ${set};`
  // );
  // await databaseStore
  //   .getDatabase()
  //   ?.execute(
  //     `DELETE FROM WorkoutExercise WHERE workout = "${workoutQueryResult.value.startdate}" AND exercise = '${exercise}' AND setNumber = ${set};`
  //   );

  console.log(
    `UPDATE WorkoutExercise SET reps = 0, weight = 0 WHERE workout = "${workoutQueryResult.value.startdate}" AND exercise = '${exercise}' AND setNumber = ${set};`
  );
  await databaseStore
    .getDatabase()
    ?.execute(
      `UPDATE WorkoutExercise SET reps = 0, weight = 0 WHERE workout = "${workoutQueryResult.value.startdate}" AND exercise = '${exercise}' AND setNumber = ${set};`
    );

  // await databaseStore
  //   .getDatabase()
  //   ?.execute(
  //     `DELETE FROM WorkoutExercise WHERE ID = ${
  //       exercises?.values?.find(
  //         (val) =>
  //           val.exercise === exercise &&
  //           val.workout === workoutQueryResult.value.startdate &&
  //           val.setNumber === set
  //       ).ID
  //     };`
  //   );
  await loadExercises();
};
</script>

<style scoped>
.icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}

p {
  height: inherit !important;
  margin: 0;
}
</style>
