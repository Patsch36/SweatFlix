<template>
  <h1>Dashboard</h1>
  <ion-segment
    ref="NextLastWorkoutSlider"
    :value="showNextLastWorkout"
    @ionChange="storeNewValue()">
    <ion-segment-button value="plan" :disabled="disablePlan || !scheme.length">
      <ion-label>After Plan</ion-label>
    </ion-segment-button>
    <ion-segment-button value="calendar">
      <ion-label>After Calender</ion-label>
    </ion-segment-button>
  </ion-segment>
  <ion-grid>
    <ion-row v-if="showNextLastWorkout === 'plan'">
      <ion-col size="2">
        <ion-button
          @click="next"
          class="grid-button"
          fill="outline"
          size="small">
          Skip
        </ion-button>
      </ion-col>
      <ion-col size="8">
        <ion-button
          v-if="todayWorkout"
          class="grid-button"
          fill="outline"
          size="small"
          @click="
            handleCardClick(todayWorkout.startdate, todayWorkout.workoutname)
          ">
          Today: {{ todayWorkout.workoutname }}
        </ion-button>
      </ion-col>
      <ion-col size="2">
        <ion-button
          class="grid-button"
          @click="rest"
          fill="outline"
          size="small">
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
            handleCardClick(lastWorkout.startdate, lastWorkout.workoutname)
          ">
          <ion-card-header>
            <ion-card-subtitle>Last Workout</ion-card-subtitle>
            <ion-card-title
              v-if="lastWorkout.workoutname"
              style="font-size: 22px"
              class="adaptive-title"
              :class="{
                biggerFont: lastWorkout.workoutname.length < 9,
              }">
              {{ lastWorkout.workoutname }}
            </ion-card-title>
          </ion-card-header>
        </ion-card>
      </ion-col>
      <ion-col size="6" size-md="3">
        <ion-card
          color="primary"
          class="adaptive-card"
          @click="
            handleCardClick(nextWorkout.startdate, nextWorkout.workoutname)
          "
          v-if="nextWorkout">
          <ion-card-header>
            <ion-card-subtitle>Next Workout</ion-card-subtitle>
            <ion-card-title
              v-if="nextWorkout.workoutname"
              style="font-size: 22px"
              class="adaptive-title"
              :class="{
                biggerFont: nextWorkout.workoutname.length < 9,
              }"
              ref="nextWorkoutCardTitle">
              {{ nextWorkout.workoutname }}
            </ion-card-title>
          </ion-card-header>
        </ion-card>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonGrid,
  IonRow,
  IonCol,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButton,
} from "@ionic/vue";
import { useRouter } from "vue-router";
import { onBeforeMount, ref } from "vue";
import { store } from "@/stores/IonicStorage";
const router = useRouter();

import { useDatabaseStore } from "@/stores/databaseStore";

const NextLastWorkoutSlider = ref();

const databaseStore = useDatabaseStore();
const lastWorkout = ref<any>();
const nextWorkout = ref<any>();
const todayWorkout = ref<any>();

const scheme = ref("");

const showNextLastWorkout = ref();
const disablePlan = ref(false);

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
    scheme.value = resp?.values ? resp.values[0].scheme : "";
    const wi = await store.get("Current Workout Index");
    const workoutIndex =
      wi === 0
        ? scheme.value.length + ((wi - 1) % scheme.value.length)
        : wi - 1;
    const todaysSchemeValue = scheme.value[workoutIndex];

    if (todaysSchemeValue === "r") {
      lastWorkout.value = { workoutname: "Restday", startdate: "" };
    } else {
      // count how many 't' are in scheme before todaysSchemeValue + 1
      const count = scheme.value.slice(0, workoutIndex).split("t").length - 1;
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
    console.log(resp?.values, typeof resp?.values);
    if (resp?.values && resp?.values.length > 0) {
      nextWorkout.value = {
        workoutname: resp.values[0].workoutname,
        startdate: "",
      };
    } else {
      // Select random workout of active workouts
      const query = `SELECT Name FROM WorkoutTemplate WHERE active = 1 ORDER BY RANDOM() LIMIT 1`;
      const resp = await databaseStore.getDatabase()?.query(query);
      nextWorkout.value = resp?.values
        ? { workoutname: resp.values[0].Name, startdate: "" }
        : { workoutname: "No Workout", startdate: "" };
    }
  } else {
    const activePlan = await store.get("Active Plan");
    const query = `SELECT scheme from Plan WHERE name = '${activePlan}'`;
    const resp = await databaseStore.getDatabase()?.query(query);
    const scheme = resp?.values ? resp.values[0].scheme : "";
    const workoutIndex =
      ((await store.get("Current Workout Index")) + 1) % scheme.length;
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

const handleCardClick = (startdate: string | any[], name: string) => {
  console.log("startdate", startdate, "name", name);
  if (startdate && startdate.length) {
    console.log("pushing to", `/workoutdetails/${startdate}`);
    router.push(`/workoutdetails/${startdate}`);
  } else if (name !== "Restday" && name !== "No Workout") {
    console.log("pushing to", `/workouttemplate/${name}`);
    router.push(`/workouttemplate/${name}`);
  }
};

const getTodaysPlanValue = async () => {
  const workoutIndex = await store.get("Current Workout Index");
  const activePlan = await store.get("Active Plan");
  const query = `SELECT scheme from Plan WHERE name = '${activePlan}'`;
  const resp = await databaseStore.getDatabase()?.query(query);
  const scheme = resp?.values ? resp.values[0].scheme : "";
  const todaysSchemeValue = scheme[workoutIndex];
  console.log("todaysSchemeValue", scheme, workoutIndex, todaysSchemeValue);

  if (todaysSchemeValue === "r") {
    todayWorkout.value = { workoutname: "Restday", startdate: "" };
  } else {
    // count how many 't' are in scheme before todaysSchemeValue
    const count = scheme.slice(0, workoutIndex).split("t").length - 1;
    const query = `Select WorkoutTemplateName from WorkoutTemplatePlan WHERE PlanID = (SELECT ID FROM Plan WHERE name = '${activePlan}') AND OrderIndex = ${count}`;
    const resp = await databaseStore.getDatabase()?.query(query);
    const workoutName = resp?.values
      ? resp.values[0].WorkoutTemplateName
      : "No Workout";
    const query2 = `SELECT startdate FROM Workout WHERE WorkoutName = '${workoutName}' ORDER BY startdate DESC LIMIT 1`;
    const resp2 = await databaseStore.getDatabase()?.query(query2);

    console.log("resp2", resp2?.values);

    const dbDate =
      resp2?.values && resp2.values.length > 0
        ? new Date(resp2.values[0].startdate)
        : new Date(0);
    dbDate.setHours(0, 0, 0, 0);

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    console.log(
      "dbDate",
      dbDate.toLocaleDateString(),
      "todayDate",
      todayDate.toLocaleDateString(),
      dbDate.toLocaleDateString() === todayDate.toLocaleDateString()
    );

    const workoutStartdate =
      resp2?.values &&
      resp2.values.length > 0 &&
      dbDate.toLocaleDateString() === todayDate.toLocaleDateString()
        ? resp2.values[0].startdate
        : "";
    console.log("startdate", workoutStartdate);
    // Test if
    todayWorkout.value = resp?.values
      ? {
          workoutname: resp.values[0].WorkoutTemplateName,
          startdate: workoutStartdate,
        }
      : { workoutname: "No Workout", startdate: "" };
  }
};

onBeforeMount(async () => {
  showNextLastWorkout.value =
    (await store.get("showNextLastWorkout")) || "calendar";
  NextLastWorkoutSlider.value.$el.value = showNextLastWorkout.value;

  const plan = await store.get("Active Plan");
  console.log(await store.get("Active Plan"), plan === "No Plan");
  if (plan == "No Plan" || plan == undefined) {
    showNextLastWorkout.value = "calendar";
    disablePlan.value = true;
  }

  getLastWorkout();
  getNextWorkout();
  getTodaysPlanValue();

  if (showNextLastWorkout.value === "plan") await getTodaysPlanValue();

  if ((await store.get("Rest")) === new Date().toLocaleDateString()) {
    nextWorkout.value = todayWorkout.value;
    todayWorkout.value = { workoutname: "Restday", startdate: "" };
  }
});

const storeNewValue = async () => {
  // console.log(NextLastWorkoutSlider.value.$el.value);
  await store.set("showNextLastWorkout", NextLastWorkoutSlider.value.$el.value);
  showNextLastWorkout.value = NextLastWorkoutSlider.value.$el.value;

  getNextWorkout();
  getLastWorkout();
  getTodaysPlanValue();
};

const next = async () => {
  if ((await store.get("Rest")) === new Date().toLocaleDateString()) {
    lastWorkout.value = todayWorkout.value;
    todayWorkout.value = nextWorkout.value;
    getNextWorkout();
    store.set("Rest", "");
  } else {
    const query = `SELECT scheme from Plan WHERE name = '${await store.get(
      "Active Plan"
    )}'`;
    const resp = await databaseStore.getDatabase()?.query(query);
    const scheme = resp?.values ? resp.values[0].scheme : "";
    const index = await store.get("Current Workout Index");
    await store.set("Current Workout Index", (index + 1) % scheme.length);
    getNextWorkout();
    getLastWorkout();
    getTodaysPlanValue();
  }
};

const rest = async () => {
  await store.set("Rest", `${new Date().toLocaleDateString()}`);
  nextWorkout.value = todayWorkout.value;
  todayWorkout.value = { workoutname: "Restday", startdate: "" };
};
</script>

<style scoped>
ion-card-header {
  padding-inline: 1rem;
}
.adaptive-card {
  height: 100px;
}

.adaptive-subtitle {
  font-size: 10px;
}

.adaptive-title {
  height: 50px;
  max-height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: start;
  /* white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis; */
  hyphens: auto;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2; /* Begrenzt die Anzahl der sichtbaren Zeilen auf 2 */
  overflow: hidden;
  text-overflow: ellipsis;
}

.biggerFont {
  font-size: 28px !important;
}

.grid-button {
  width: 100%;
  color: var(--ion-color-light-shade);
}
</style>
