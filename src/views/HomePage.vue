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
          <ion-row v-if="showNextLastWorkout === 'plan'">
            <ion-col size="4">
              <ion-button
                @click="next"
                class="grid-button"
                fill="outline"
                size="small">
                Next
              </ion-button>
            </ion-col>
            <ion-col size="4">
              <ion-button class="grid-button" fill="outline" size="small">
                Skip
              </ion-button>
            </ion-col>
            <ion-col size="4">
              <ion-button class="grid-button" fill="outline" size="small">
                Rest
              </ion-button>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col size="6" size-md="3">
              <ion-card
                color="primary"
                v-if="lastWorkout"
                class="adaptive-card"
                @click="
                  handleCardClick(
                    lastWorkout.startdate,
                    lastWorkout.workoutname
                  )
                ">
                <ion-card-header>
                  <ion-card-subtitle>Last Workout</ion-card-subtitle>
                  <ion-card-title
                    v-if="lastWorkout.workoutname"
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
                  handleCardClick(
                    nextWorkout.startdate,
                    nextWorkout.workoutname
                  )
                "
                v-if="nextWorkout">
                <ion-card-header>
                  <ion-card-subtitle>Next Workout</ion-card-subtitle>
                  <ion-card-title
                    v-if="nextWorkout.workoutname"
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

        <h2 @click="router.push('/weight')">Weight</h2>
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
  IonSegmentButton,
  IonLabel,
  IonIcon,
  IonButton,
} from "@ionic/vue";
import { useRouter } from "vue-router";
import { onBeforeMount, onMounted, ref } from "vue";
import { store } from "@/stores/IonicStorage";
const router = useRouter();

import { useDatabaseStore } from "../stores/databaseStore";
import { newspaper, today } from "ionicons/icons";

const NextLastWorkoutSlider = ref();

const databaseStore = useDatabaseStore();
const queryCurrentWeightResults = ref<any>([]);
const lastWorkout = ref<any>();
const nextWorkout = ref<any>();

const showNextLastWorkout = ref();

const getLastWorkout = async () => {
  if (NextLastWorkoutSlider.value.$el.value === "calendar") {
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
  } else {
    const activePlan = await store.get("Active Plan");
    const query = `SELECT scheme from Plan WHERE name = '${activePlan}'`;
    const resp = await databaseStore.getDatabase()?.query(query);
    const scheme = resp?.values ? resp.values[0].scheme : "";
    const wi = await store.get("Current Workout Index");
    const workoutIndex =
      wi === 0 ? scheme.length + ((wi - 1) % scheme.length) : wi - 1;
    const todaysSchemeValue = scheme[workoutIndex];

    if (todaysSchemeValue === "r") {
      lastWorkout.value = { workoutname: "Restday", startdate: "" };
    } else {
      // count how many 't' are in scheme before todaysSchemeValue + 1
      const count = scheme.slice(0, workoutIndex).split("t").length - 1;
      const query = `Select WorkoutTemplateName from WorkoutTemplatePlan WHERE PlanID = (SELECT ID FROM Plan WHERE name = '${activePlan}') AND OrderIndex = ${count}`;
      const resp = await databaseStore.getDatabase()?.query(query);
      lastWorkout.value = resp?.values
        ? { workoutname: resp.values[0].WorkoutTemplateName, startdate: "" }
        : { workoutname: "No Workout", startdate: "" };
    }
  }
};

const getNextWorkout = async () => {
  if (NextLastWorkoutSlider.value.$el.value === "calendar") {
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
      ? { workoutname: resp.values[0].workoutname, startdate: "" }
      : { workoutname: "No Workout", startdate: "" };
  } else {
    const workoutIndex = await store.get("Current Workout Index");
    const activePlan = await store.get("Active Plan");
    const query = `SELECT scheme from Plan WHERE name = '${activePlan}'`;
    const resp = await databaseStore.getDatabase()?.query(query);
    const scheme = resp?.values ? resp.values[0].scheme : "";
    const todaysSchemeValue = scheme[workoutIndex];

    if (todaysSchemeValue === "r") {
      nextWorkout.value = { workoutname: "Restday", startdate: "" };
    } else {
      // count how many 't' are in scheme before todaysSchemeValue
      const count = scheme.slice(0, workoutIndex).split("t").length - 1;
      const query = `Select WorkoutTemplateName from WorkoutTemplatePlan WHERE PlanID = (SELECT ID FROM Plan WHERE name = '${activePlan}') AND OrderIndex = ${count}`;
      const resp = await databaseStore.getDatabase()?.query(query);
      nextWorkout.value = resp?.values
        ? { workoutname: resp.values[0].WorkoutTemplateName, startdate: "" }
        : { workoutname: "No Workout", startdate: "" };
    }
  }
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

const handleCardClick = (startdate: string | any[], name: string) => {
  if (startdate && startdate.length) {
    router.push(`/workoutdetails/${startdate}`);
  } else if (name !== "Restday" && name !== "No Workout") {
    console.log("pushing");
    router.push(`/workouttemplate/${name}`);
  }
};

onMounted(async () => {
  getCurrentWeight();

  showNextLastWorkout.value =
    (await store.get("showNextLastWorkout")) || "calendar";
  NextLastWorkoutSlider.value.$el.value = showNextLastWorkout.value;
  getLastWorkout();
  getNextWorkout();
});

const storeNewValue = async () => {
  // console.log(NextLastWorkoutSlider.value.$el.value);
  await store.set("showNextLastWorkout", NextLastWorkoutSlider.value.$el.value);
  showNextLastWorkout.value = NextLastWorkoutSlider.value.$el.value;

  getNextWorkout();
  getLastWorkout();
};

const next = async () => {
  const query = `SELECT scheme from Plan WHERE name = '${await store.get(
    "Active Plan"
  )}'`;
  const resp = await databaseStore.getDatabase()?.query(query);
  const scheme = resp?.values ? resp.values[0].scheme : "";
  const index = await store.get("Current Workout Index");
  await store.set("Current Workout Index", (index + 1) % scheme.length);
  getNextWorkout();
  getLastWorkout();
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

.grid-button {
  width: 100%;
  color: var(--ion-color-light-shade);
}
</style>
