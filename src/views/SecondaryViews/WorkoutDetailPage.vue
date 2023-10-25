<template>
  <ion-page style="height: calc(100vh - 100px)">
    <ion-header :translucent="true" color="light">
      <ion-toolbar>
        <ion-progress-bar
          :value="currentCount / (dates.length - 1)"></ion-progress-bar>
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
            @click="stateStore.setShowEditWorkoutModal(true)"
            style="font-size: 24px; margin-right: 8px"
            color="primary"></ion-icon>
          <ion-label
            @click="stateStore.setShowEditWorkoutModal(true)"
            color="primary"
            >Edit</ion-label
          >
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding-start ion-padding-end">
      <div class="buttons">
        <ion-button
          fill="clear"
          @click="routeLink('prev')"
          :disabled="previous === ''"
          size="small">
          <ion-icon :icon="returnUpBackOutline" slot="icon-only"></ion-icon>
        </ion-button>
        <ion-button
          fill="clear"
          @click="routeLink('next')"
          :disabled="next === ''"
          size="small">
          <ion-icon :icon="returnUpForwardOutline" slot="icon-only"></ion-icon>
        </ion-button>
      </div>

      <ion-header collapse="condense" style="display: flex">
        <ion-toolbar>
          <ion-title size="large" style="font-size: 28px"
            >{{ workoutQueryResult.workoutname }}
          </ion-title>
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
            hours
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
        <ion-row v-if="workoutQueryResult.note">
          <ion-col>
            <b>Notes:</b>
            <br />
            {{ workoutQueryResult.note }}
          </ion-col>
        </ion-row>
      </ion-grid>

      <Diagram :weights="queryResults" v-if="queryResults && showDiagram" />

      <ion-list v-show="workoutExercises.length">
        <ion-list-header>
          <ion-label>Exercises</ion-label>
          <ion-label style="text-align: end; margin-right: 24px">Set</ion-label>
        </ion-list-header>
        <ion-item-sliding
          v-for="(exercise, index) in workoutExercises"
          :key="index">
          <ion-item @click="router.push(`/exercise/${exercise.exercise}`)">
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
    </ion-content>
    <EditWorkoutDetails @reloadWorkoutData="refresh" />
  </ion-page>
</template>

<script setup lang="ts">
import Diagram from "@/components/Diagram.vue";
import EditWorkoutDetails from "@/components/modals/editWorkoutDetails.vue";
import { useDatabaseStore } from "@/stores/databaseStore";
import { useStateStore } from "@/stores/stateStore";
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
  IonButton,
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
  IonProgressBar,
} from "@ionic/vue";
import {
  chevronBack,
  pencilOutline,
  trash,
  returnUpBackOutline,
  returnUpForwardOutline,
} from "ionicons/icons";
import { onBeforeMount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const databaseStore = useDatabaseStore();
const route = useRoute();
const router = useRouter();
const stateStore = useStateStore();

const showDiagram = ref(true);

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
const dates = ref<any>([]);
const previous = ref<any>("");
const next = ref<any>("");
const currentCount = ref(0);

const queryResults = ref<any>([]);
const exercises = ref<any>([]);
const sets = ref(0);

const modalPlaceholder = ref<
  {
    exerciseName: string;
    set: number;
    reps?: number;
    weight?: number;
    unit?: string;
  }[]
>([]);

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
  const query = `SELECT we.exercise, we.setnumber, we.reps, we.weight, we.unit, wl.OrderIndex from WorkoutExercise we  JOIN WorkoutList wl ON we.exercise = wl.exerciseName AND wl.WorkoutPlan = '${
    workoutQueryResult.value.workoutname
  }' WHERE DATE(we.workout) = '${date.slice(0, 10)}';`;
  const exercises = await databaseStore.getDatabase()?.query(query);
  workoutExercises.value = exercises?.values || [];
  workoutExercises.value
    .sort((a: any, b: any) => a.setNumber - b.setNumber)
    .sort((a: any, b: any) => a.OrderIndex - b.OrderIndex);
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

const loadDatesOfWorkouts = async () => {
  const resp = await databaseStore.getDatabase()?.query(
    `
    SELECT *
    FROM Workout
    WHERE workoutname = '${workoutQueryResult.value.workoutname}'
    ORDER BY startdate DESC;
    `
  );
  dates.value = resp?.values || [];
  console.log(dates.value);
  dates.value = dates.value.map((date: any) => date.startdate.slice(0, 10));
  dates.value.sort(
    (a: any, b: any) => new Date(a).getTime() - new Date(b).getTime()
  );
  console.log(dates.value);
};

const setPreviousNext = (targetDate: string) => {
  console.log("Target Date:", targetDate);
  const targetDateObject = new Date(targetDate).toDateString();

  // Erstelle Date-Objekte aus den Daten in dates.value
  const dateObjects = dates.value.map(
    (dateString: string | number | Date) => new Date(dateString)
  );

  // Sortiere die Date-Objekte aufsteigend
  dateObjects.sort(
    (a: { getTime: () => number }, b: { getTime: () => number }) =>
      a.getTime() - b.getTime()
  );

  let previousIndex = -1;
  let nextIndex = -1;

  // Finde das vorherige und das nächste Datum mit Date-Objekten
  console.log("Date Objects:", dateObjects);
  for (let i = 0; i < dateObjects.length; i++) {
    if (dateObjects[i].toDateString() === targetDateObject) {
      if (i > 0) {
        previousIndex = i - 1;
      }
      if (i < dateObjects.length - 1) {
        nextIndex = i + 1;
      }
      currentCount.value = i;
      break;
    }
  }

  // Die Variablen previous.value und next.value basierend auf den gefundenen Indizes aktualisieren
  previous.value = previousIndex !== -1 ? dates.value[previousIndex] : "";
  next.value = nextIndex !== -1 ? dates.value[nextIndex] : "";

  console.log("Vorheriges Datum:", previous.value);
  console.log("Nächstes Datum:", next.value);
};

onBeforeMount(async () => {
  console.log(route.fullPath);
  await loadWorkout();
  await loadExercises();
  await getOverallWeightsOfWorkout();
  await loadListExercises();
  await loadLastExercises();
  await loadDatesOfWorkouts();
  const date = route.params.id as string;
  setPreviousNext(date);

  modalStarttime.value = workoutQueryResult.value.startdate;
  modalEndtime.value = workoutQueryResult.value.enddate;
  modalNotes.value = workoutQueryResult.value.note;
});

const deleteWeightEntry = async (exercise: string, set: number) => {
  console.log(
    `UPDATE WorkoutExercise SET reps = 0, weight = 0 WHERE workout = "${workoutQueryResult.value.startdate}" AND exercise = '${exercise}' AND setNumber = ${set};`
  );
  await databaseStore
    .getDatabase()
    ?.execute(
      `UPDATE WorkoutExercise SET reps = 0, weight = 0 WHERE workout = "${workoutQueryResult.value.startdate}" AND exercise = '${exercise}' AND setNumber = ${set};`
    );
  await loadExercises();
};

const routeLink = (direction: string) => {
  if (direction === "prev") {
    router.go(-1);

    setTimeout(() => {
      router.push(`/workoutdetails/${previous.value}`);
    }, 0.01);
  } else if (direction === "next") {
    router.go(-1);

    setTimeout(() => {
      router.push(`/workoutdetails/${next.value}`);
    }, 0.01);
  }
};

const refresh = async (_date: string) => {
  showDiagram.value = false;
  const date = _date as string;
  // alert(date);
  await loadWorkout();
  await loadExercises();
  await getOverallWeightsOfWorkout();
  await loadListExercises();
  await loadLastExercises();
  await loadDatesOfWorkouts();
  setPreviousNext(date);
  showDiagram.value = true;

  setPreviousNext(date);

  modalStarttime.value = workoutQueryResult.value.startdate;
  modalEndtime.value = workoutQueryResult.value.enddate;
  modalNotes.value = workoutQueryResult.value.note;
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

.buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.buttons ion-icon {
  font-size: 32px;
}
</style>
