<template>
  <ion-page style="height: calc(100vh - 100px)">
    <ion-header :translucent="true" color="light">
      <ion-toolbar>
        <ion-title color="primary-contrast">{{
          workoutQueryResult.workoutname
        }}</ion-title>
        <div class="back-icon">
          <ion-icon
            :icon="chevronBack"
            @click="router.go(-1)"
            size="large"
            color="primary"></ion-icon>
          <ion-label @click="router.go(-1)" color="primary">Back</ion-label>
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
          <ion-col>
            <b>Overall Weight:</b>
            <br />
            {{ allOverallWeights[0].OverAllSum }} kg (x{{
              (
                allOverallWeights[0].OverAllSum /
                allOverallWeights[1].OverAllSum
              ).toFixed(2)
            }})
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

      <ion-list v-if="workoutExercises.length">
        <ion-list-header>
          <ion-label>Exercises</ion-label>
          <ion-label style="text-align: end; margin-right: 24px">Set</ion-label>
        </ion-list-header>
        <ion-item v-for="(exercise, index) in workoutExercises" :key="index">
          <ion-label>{{ exercise.exercise }}</ion-label>
          <ion-label slot="end">
            {{ exercise.reps }} x {{ exercise.weight }} {{ exercise.unit }}
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useDatabaseStore } from "@/stores/databaseStore";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
} from "@ionic/vue";
import { chevronBack } from "ionicons/icons";
import { onBeforeMount, ref } from "vue";
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
const allOverallWeights = ref<any>([]);

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
  const date = route.params.id;
  const exercises = await databaseStore.getDatabase()?.query(
    `SELECT
        we.workout AS Workout_Datum,
        SUM(we.weight * we.reps) AS OverAllSum
    FROM
        WorkoutExercise we
    JOIN
        Workout w ON we.workout = w.startdate
    WHERE
        w.workoutname = '${workoutQueryResult.value.workoutname}'
    GROUP BY
        we.workout
    HAVING
        OverAllSum <> 0
    ORDER BY
        we.workout;
    `
  );
  allOverallWeights.value = exercises?.values || [];
  allOverallWeights.value.reverse();
};

onBeforeMount(async () => {
  await loadWorkout();
  await loadExercises();
  await getOverallWeightsOfWorkout();
});
</script>

<style scoped>
.back-icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
