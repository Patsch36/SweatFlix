<template>
  <ion-page style="height: calc(100vh - 100px)">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Home</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Home</ion-title>
        </ion-toolbar>
      </ion-header>

      <div style="padding-inline: 0.75rem">
        <h1>Dashboard</h1>
        <p>{{ showNextLastWorkout }}</p>
        <ion-segment
          ref="NextLastWorkoutSlider"
          :value="showNextLastWorkout"
          @ionChange="storeNewValue()">
          <ion-segment-button value="plan">
            <ion-label>After Plan</ion-label>
          </ion-segment-button>
          <ion-segment-button value="calendar">
            <ion-label>After Calender</ion-label>
          </ion-segment-button>
        </ion-segment>
        <ion-grid>
          <ion-row>
            <ion-col size="6" size-md="3">
              <ion-card
                color="primary"
                v-if="lastWorkout"
                class="adaptive-card"
                @click="
                  router.push(
                    `/workoutdetails/${lastWorkout.startdate.slice(0, 10)}`
                  )
                ">
                <ion-card-header>
                  <ion-card-subtitle>Last Workout</ion-card-subtitle>
                  <ion-card-title
                    style="font-size: 22px"
                    class="adaptive-title"
                    :class="{
                      biggerFont: lastWorkout.workoutname.length < 12,
                    }">
                    {{
                      lastWorkout.workoutname.length > 12
                        ? lastWorkout.workoutname.slice(0, 12) + "..."
                        : lastWorkout.workoutname
                    }}
                  </ion-card-title>
                </ion-card-header>
              </ion-card>
            </ion-col>
            <ion-col size="6" size-md="3">
              <ion-card
                color="primary"
                class="adaptive-card"
                @click="
                  router.push(
                    `/workoutdetails/${lastWorkout.startdate.slice(0, 10)}`
                  )
                "
                v-if="nextWorkout">
                <ion-card-header>
                  <ion-card-subtitle>Next Workout</ion-card-subtitle>
                  <ion-card-title
                    style="font-size: 22px"
                    class="adaptive-title"
                    :class="{
                      biggerFont: nextWorkout.workoutname.length < 12,
                    }">
                    {{
                      nextWorkout.workoutname.length > 12
                        ? nextWorkout.workoutname.slice(0, 12) + "..."
                        : nextWorkout.workoutname
                    }}
                  </ion-card-title>
                </ion-card-header>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <h2 @click="router.push('/weight')">Gewicht</h2>
        <ion-grid @click="router.push('/weight')">
          <ion-row>
            <ion-col size="6" size-md="3">
              <ion-card color="primary">
                <ion-card-header>
                  <ion-card-subtitle>Current</ion-card-subtitle>
                  <ion-card-title v-if="queryCurrentWeightResults.length > 0"
                    >{{
                      queryCurrentWeightResults[0].weight
                    }}
                    kg</ion-card-title
                  >
                </ion-card-header>
              </ion-card>
            </ion-col>
            <ion-col size="6" size-md="3">
              <ion-card color="primary">
                <ion-card-header>
                  <ion-card-subtitle>Goal</ion-card-subtitle>
                  <ion-card-title>85 kg</ion-card-title>
                </ion-card-header>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
  </ion-page>

  <!-- <BaseLayout pageTitle="Home">
    <ion-button color="primary" router-link="/calendar">Home</ion-button>
    test
    </BaseLayout>  -->
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonGrid,
  IonRow,
  IonCol,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonSegment,
} from "@ionic/vue";
import { useRouter } from "vue-router";
import { onBeforeMount, onMounted, ref } from "vue";
import { store } from "@/stores/IonicStorage";
const router = useRouter();

import { useDatabaseStore } from "../stores/databaseStore";
import { newspaper } from "ionicons/icons";

const NextLastWorkoutSlider = ref();

const databaseStore = useDatabaseStore();
const queryCurrentWeightResults = ref<any>([]);
const lastWorkout = ref<any>();
const nextWorkout = ref<any>();

const showNextLastWorkout = ref();

const getLastWorkout = async () => {
  try {
    const resp = await databaseStore.getDatabase()
      ?.query(`SELECT WorkoutName, startdate FROM workout
    ORDER BY startdate DESC
    LIMIT 1;`);

    lastWorkout.value = resp?.values
      ? resp.values[0]
      : { workoutname: "No Workout", startdate: "" };
  } catch (e) {
    alert("ERROR initializing DB " + JSON.stringify(e));
  }
};

const getNextWorkout = async () => {
  const query = `
    SELECT *
    FROM Workout w
    JOIN WorkoutTemplate wt ON w.WorkoutName = wt.name
    WHERE wt.active = 1
    AND w.startdate = (
      SELECT MAX(startdate)
      FROM Workout w2
      WHERE w2.WorkoutName = w.WorkoutName
    )
    ORDER BY w.startdate ASC
    LIMIT 1;
  `;

  const resp = await databaseStore.getDatabase()?.query(query);
  nextWorkout.value = resp?.values
    ? resp.values[0]
    : { workoutname: "No Workout", startdate: "" };
};

const getCurrentWeight = async () => {
  try {
    const resp = await databaseStore.getDatabase()?.query(`SELECT * FROM weight
    ORDER BY timestamp DESC
    LIMIT 1;`);

    queryCurrentWeightResults.value = resp?.values || [];
  } catch (e) {
    alert("ERROR initializing DB " + JSON.stringify(e));
  }
};
onMounted(async () => {
  getCurrentWeight();
  getLastWorkout();
  getNextWorkout();

  showNextLastWorkout.value =
    (await store.get("showNextLastWorkout")) || "calendar";
});

const storeNewValue = async () => {
  console.log(NextLastWorkoutSlider.value.$el.value);
  await store.set("showNextLastWorkout", NextLastWorkoutSlider.value.$el.value);
};
</script>

<style scoped>
.adaptive-card {
  height: 100px;
}

.adaptive-subtitle {
  font-size: 10px;
}

.adaptive-title {
  height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center; /* Text am unteren Rand ausrichten */
}

.biggerFont {
  font-size: 28px !important;
}
</style>
