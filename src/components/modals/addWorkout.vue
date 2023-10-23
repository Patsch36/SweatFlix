<template>
  <ion-modal ref="addWorkoutModal" :isOpen="addWorkoutModalOpen">
    <ion-header>
      <ion-toolbar>
        <div class="icon">
          <ion-icon
            :icon="chevronBack"
            @click="addWorkoutModalOpen = false"
            size="large"
            color="primary"></ion-icon>
          <ion-label
            @click="stateStore.setShowAddWorkoutToPlanModal(false)"
            color="primary">
            Cancel
          </ion-label>
        </div>
        <ion-title>Add Workout</ion-title>
        <div class="icon" slot="end" style="margin-right: 16px">
          <ion-label @click="addNewWorkouts" color="primary">Save</ion-label>
          <ion-icon
            :icon="saveOutline"
            @click="addNewWorkouts"
            style="font-size: 24px; margin-left: 8px"
            color="primary"></ion-icon>
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-checkbox
          v-model="selectedWorkouts['Restday']"
          label-placement="end"
          justify="start">
          Restday
        </ion-checkbox>
      </ion-item>
      <ion-item v-for="workout in workouttemplates" :key="workout.Name">
        <ion-checkbox
          v-model="selectedWorkouts[workout.Name]"
          label-placement="end"
          justify="start">
          {{ workout.Name }}
        </ion-checkbox>
      </ion-item>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonIcon,
  IonItem,
  IonModal,
  IonCheckbox,
} from "@ionic/vue";
import { chevronBack, saveOutline } from "ionicons/icons";
import { useDatabaseStore } from "@/stores/databaseStore";
import { onBeforeMount, ref, defineEmits } from "vue";
import { store } from "@/stores/IonicStorage";
import { availableColors } from "@/datatypes/CalendarTypes";
import { useRoute } from "vue-router";
import { useStateStore } from "@/stores/stateStore";

const emit = defineEmits(["loadWorkouts"]);

const databaseStore = useDatabaseStore();
const stateStore = useStateStore();
const route = useRoute();
const addWorkoutModalOpen = ref(false);

const plan = ref();
const workouts = ref();
const workouttemplates = ref();
const activePlan = ref();

let selectedWorkouts: Record<string, boolean> = {};

stateStore.$subscribe((mutation, state) => {
  addWorkoutModalOpen.value = state.showAddExerciseToWorkoutModal;
});

const loadPlan = async () => {
  const routeID = route.params.id;
  if (routeID) {
    const query = `SELECT * FROM Plan WHERE ID = ${route.params.id}`;
    console.log(query);
    const resp = await databaseStore.getDatabase()?.query(query);
    plan.value = resp?.values
      ? resp.values[0]
      : {
          name: "NotFound",
          ID: 0,
          description: "NotFound",
          type: "NotFound",
          place: "NotFound",
          split: "NotFound",
          scheme: "NotFound",
        };
  } else {
    // Select * from highest ID in Plan because this is added plan and has nou route.params
    const query = `SELECT * FROM Plan WHERE ID = (SELECT MAX(ID) FROM Plan)`;
    console.log(query);
    const resp = await databaseStore.getDatabase()?.query(query);
    plan.value = resp?.values
      ? resp.values[0]
      : {
          name: "NotFound",
          ID: 0,
          description: "NotFound",
          type: "NotFound",
          place: "NotFound",
          split: "NotFound",
          scheme: "NotFound",
        };
  }
};

const loadWorkouts = async () => {
  if (!plan.value) {
    return;
  }
  const query = `SELECT WorkoutTemplateName, OrderIndex FROM WorkoutTemplatePlan WHERE PlanID = ${plan.value.ID}`;
  const resp = await databaseStore.getDatabase()?.query(query);
  const ws = resp?.values ? resp.values : [];

  if (ws.length === 0) {
    console.log("no workouts in plan");
  }

  ws.sort((a: any, b: any) => {
    return a.OrderIndex - b.OrderIndex;
  });

  // Iterate through plan.value.scheme. If t, insert first element of ws and remove ist. if R, insert {WorkoutTemplateName: 'Restday'}. Make OrderIndex rising.
  const newWs = [];
  let wsIndex = 0;
  const loopLimit = plan.value.scheme ? plan.value.scheme.length : 0;
  for (let i = 0; i < loopLimit; i++) {
    if (plan.value.scheme[i] === "t") {
      const ind = ws.findIndex((obj) => obj.OrderIndex === wsIndex);
      if (ind === -1) {
        console.log("no workout found");
        continue;
      }
      newWs.push({
        WorkoutTemplateName: ws[ind].WorkoutTemplateName,
        OrderIndex: i,
      });
      // ws.shift();
      wsIndex = (wsIndex + 1) % ws.length;
    } else if (plan.value.scheme[i] === "r") {
      newWs.push({ WorkoutTemplateName: "Restday", OrderIndex: i });
    }
  }

  workouts.value = newWs;
};

const loadAllWorkouts = async () => {
  const query = `SELECT * FROM WorkoutTemplate`;
  console.log(query);
  const resp = await databaseStore.getDatabase()?.query(query);
  workouttemplates.value = resp?.values ? resp.values : [];
  console.log(resp);
};

onBeforeMount(async () => {
  await loadAllWorkouts();
  await loadPlan();
  await loadWorkouts();

  selectedWorkouts.Restday = false;
  // add key in selectedWorkouts for each workouttemplate
  selectedWorkouts = {
    ...selectedWorkouts, // all existing keys
    ...workouttemplates.value.reduce(
      (acc: { [x: string]: boolean }, workout: { Name: string | number }) => {
        acc[workout.Name] = false;
        return acc;
      },
      {}
    ),
  };

  activePlan.value = await store.get("Active Plan");

  console.log(selectedWorkouts);
});

const addNewWorkouts = async () => {
  stateStore.setShowAddWorkoutToPlanModal(false);
  // Save everything to database

  // get amount of t in plan.scheme
  if (plan.value) {
    const t = plan.value.scheme ? plan.value.scheme.split("t").length : 1;

    let dbOrderIndex = t - 1;
    for (const [key, value] of Object.entries(selectedWorkouts)) {
      if (value) {
        if (key !== "Restday") {
          const query = `INSERT INTO WorkoutTemplatePlan (PlanID, WorkoutTemplateName, OrderIndex) VALUES (${plan.value.ID}, '${key}', ${dbOrderIndex})`;
          console.log(query);
          await databaseStore.getDatabase()?.run(query);
          dbOrderIndex += 1;
        }

        selectedWorkouts[key] = false;

        // update scheme
        if (!plan.value.scheme) plan.value.scheme = "";
        plan.value.scheme += key === "Restday" ? "r" : "t";

        // save scheme to database
        const query2 = `UPDATE Plan SET Scheme = '${plan.value.scheme}' WHERE ID = ${plan.value.ID}`;
        await databaseStore.getDatabase()?.run(query2);
      }
    }

    await loadWorkouts();

    console.log("ACTIVE PLAN: ", activePlan.value);
    console.log("PLAN: ", plan.value.name);
    console.log("Compared: ", activePlan.value === plan.value.name);
    if (activePlan.value === plan.value.name) {
      await activate();
    }
    emit("loadWorkouts");
  } else {
  }
};

const activate = () => {
  console.log("ACTIVATE");
  store.set("Active Plan", plan.value.name);

  // Set all active workouts in database workoutTemplate inactive
  const query = `UPDATE WorkoutTemplate SET active = 0`;
  databaseStore.getDatabase()?.execute(query);

  // Set all WorkoutTemplates active where WorkoutTemplatePlan.planId = plan.value.ID
  const query2 = `UPDATE WorkoutTemplate
      SET active = 1
      WHERE Name IN (
          SELECT workoutTemplateName
          FROM workouttemplatePlan
          WHERE PlanID = ${plan.value.ID}
      );`;
  databaseStore.getDatabase()?.execute(query2);
  makeAcitveWorkoutsHaveUniqueColors();
};

const makeAcitveWorkoutsHaveUniqueColors = async () => {
  // Make sure all active workouts have unique colors
  const query2 = `SELECT * FROM WorkoutTemplate WHERE active = 1`;
  const resp = await databaseStore.getDatabase()?.query(query2);
  const activeWorkouts = resp?.values ? resp.values : [];

  let usedColors: string[] = [];
  await activeWorkouts.forEach((item: any) => {
    console.log(usedColors, item.Color);
    if (usedColors.includes(item.Color)) {
      // Change color
      const newColor =
        Object.keys(availableColors).find(
          (color) => !usedColors.includes(color)
        ) ||
        Object.keys(availableColors)[
          Math.floor(Math.random() * Object.keys(availableColors).length)
        ];
      console.log(newColor);

      const query3 = `UPDATE WorkoutTemplate SET Color = '${newColor}' WHERE Name = '${item.Name}';`;
      databaseStore.getDatabase()?.run(query3);
      usedColors.push(newColor);
    } else if (item.Color) usedColors.push(item.Color);
  });
};
</script>

<style scoped>
.icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
