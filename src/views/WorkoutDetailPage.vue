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
            <div style="display: flex; flex-direction: row; height: 20px">
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
import Diagram from "@/components/Diagram.vue";
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
const allOverallWeights = ref<any>([1, 1]); // Init with 1, because before db is loaded, it is 0/0

const queryResults = ref<any>([]);

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
  allOverallWeights.value = exercises?.values || [];
  allOverallWeights.value.reverse();
};

onBeforeMount(async () => {
  await loadWorkout();
  await loadExercises();
  await getOverallWeightsOfWorkout();

  if (allOverallWeights.value.length > 1) {
    allOverallWeights.value.forEach((element: any) => {
      queryResults.value.push({
        timestamp: element.WorkoutDatum,
        weight: element.OverAllSum,
      });
    });
  }
});
</script>

<style scoped>
.back-icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}

p {
  height: inherit !important;
  margin: 0;
}
</style>
