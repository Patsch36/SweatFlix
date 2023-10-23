<template>
  <ion-list v-if="listRender">
    <ion-list-header>
      <ion-label class="mt-0">Workout</ion-label>
      <ion-icon
        :icon="add"
        size="large"
        @click="addWorkoutModalOpen = true"
        class="ion-margin-end"></ion-icon>
      <ion-icon
        :icon="trashOutline"
        size="large"
        @click="toggleListMode"
        v-if="!deleteMode"
        class="ion-margin-end"></ion-icon>
      <ion-icon
        :icon="reorderThreeOutline"
        size="large"
        @click="
          deleteMode = !deleteMode;
          loadPlan();
        "
        v-else
        class="ion-margin-end"></ion-icon>
    </ion-list-header>
    <ion-reorder-group
      v-if="!deleteMode && showList"
      :disabled="false"
      @ionItemReorder="handleReorder($event)">
      <ion-item v-for="workout in workouts" key="workout.OrderIndex">
        <ion-label>{{ workout.WorkoutTemplateName }} </ion-label>
        <ion-reorder slot="end"></ion-reorder>
      </ion-item>
    </ion-reorder-group>
    <ion-item-sliding
      v-if="deleteMode && showList"
      v-for="workout in workouts"
      key="workout.OrderIndex">
      <ion-item>
        <ion-label>{{ workout.WorkoutTemplateName }} </ion-label>
        <ion-reorder slot="end"></ion-reorder>
      </ion-item>
      <ion-item-options side="end">
        <ion-item-option color="danger">
          <ion-button
            @click="
              deleteWorkout(workout.WorkoutTemplateName, workout.OrderIndex)
            "
            color="transparent"
            id="colorpickerTrigger">
            <ion-icon
              slot="icon-only"
              :icon="trashOutline"
              style="font-size: 36px"></ion-icon>
          </ion-button>
        </ion-item-option>
      </ion-item-options>
    </ion-item-sliding>
  </ion-list>

  <ion-modal ref="addWorkoutModal" :isOpen="addWorkoutModalOpen">
    <ion-header>
      <ion-toolbar>
        <div class="icon">
          <ion-icon
            :icon="chevronBack"
            @click="addWorkoutModalOpen = false"
            size="large"
            color="primary"></ion-icon>
          <ion-label @click="addWorkoutModalOpen = false" color="primary">
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
import { useDatabaseStore } from "@/stores/databaseStore";
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonIcon,
  IonReorderGroup,
  IonReorder,
  IonList,
  IonListHeader,
  IonItem,
  IonButton,
  IonModal,
  IonCheckbox,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from "@ionic/vue";
import { useRoute, useRouter } from "vue-router";
import {
  chevronBack,
  add,
  saveOutline,
  trashOutline,
  reorderThreeOutline,
} from "ionicons/icons";
import { onBeforeMount, ref, defineEmits } from "vue";
import { store } from "@/stores/IonicStorage";
import { availableColors } from "@/datatypes/CalendarTypes";

const emit = defineEmits(["loadPlan"]);

const databaseStore = useDatabaseStore();
const route = useRoute();
const addWorkoutModalOpen = ref(false);
const deleteMode = ref(false);
const showList = ref(true);

const plan = ref();
const workouts = ref();
const workouttemplates = ref();
const activePlan = ref();

let selectedWorkouts: Record<string, boolean> = {};

const listRender = ref(true);

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

  const ind = workouts.value.findIndex(
    (w: { OrderIndex: any }) => w.OrderIndex === from
  );
  const draggedItem = workouts.value[ind].WorkoutTemplateName;
  console.log(draggedItem);

  if (from < to) {
    for (let i = from; i < to; i++) {
      const index = workouts.value.findIndex(
        (w: { OrderIndex: any }) => w.OrderIndex === i + 1
      );
      console.log(i, workouts.value[index]);
      workouts.value[index].OrderIndex = i;
    }
    workouts.value[ind].OrderIndex = to;
  } else if (from > to) {
    for (let i = from - 1; i >= to; i--) {
      const index = workouts.value.findIndex(
        (w: { OrderIndex: any }) => w.OrderIndex === i
      );
      console.log(i + 1, workouts.value[index]);
      workouts.value[index].OrderIndex = i + 1;
    }
    workouts.value[ind].OrderIndex = to;
  }

  let newScheme = "";
  let dbOrderIndex = 0;
  // Delete all workouts in WorkoutTemplatePlan from Plan.value.ID
  const query2 = `DELETE FROM WorkoutTemplatePlan WHERE PlanID = ${plan.value.ID}`;
  await databaseStore.getDatabase()?.run(query2);

  for (let i = 0; i < workouts.value.length; i++) {
    const itemIndex = workouts.value.findIndex(
      (w: { OrderIndex: any }) => w.OrderIndex === i
    );

    if (workouts.value[itemIndex].WorkoutTemplateName === "Restday") {
      newScheme += "r";
    } else {
      newScheme += "t";
      // Insert workout in WorkoutTemplatePlan with new OrderIndex = dbOrderIndex, pan.value.ID and workoutTemplatename
      const query = `INSERT INTO WorkoutTemplatePlan (PlanID, WorkoutTemplateName, OrderIndex) VALUES (${plan.value.ID}, '${workouts.value[itemIndex].WorkoutTemplateName}', ${dbOrderIndex})`;
      console.log(query);
      await databaseStore.getDatabase()?.run(query);
      dbOrderIndex += 1;
    }
  }

  plan.value.scheme = newScheme;
  const query = `UPDATE Plan SET Scheme = '${newScheme}' WHERE ID = ${plan.value.ID}`;
  await databaseStore.getDatabase()?.query(query);

  await loadPlan();
  emit("loadPlan");

  await event.detail.complete();
};

const addNewWorkouts = async () => {
  addWorkoutModalOpen.value = false;
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
    emit("loadPlan");
  } else {
  }
};

const deleteWorkout = async (workoutName: string, OrderIndex: number) => {
  // count the how maniest workout which is no restday this wporkout is in workouts.value
  const count =
    workouts.value.filter(
      (w: { WorkoutTemplateName: string; OrderIndex: number }) =>
        w.OrderIndex <= OrderIndex && w.WorkoutTemplateName !== "Restday"
    ).length - 1;
  const query = `DELETE FROM WorkoutTemplatePlan WHERE PlanID = ${plan.value.ID} AND WorkoutTemplateName = '${workoutName}' AND OrderIndex = ${count}`;
  await databaseStore.getDatabase()?.run(query);

  // For workout in WorkoutTemplatePlan, where OrderIndex > OrderIndex of deleted workout, decrease OrderIndex by 1
  // Only update when no restad is deleted
  if (workoutName !== "Restday") {
    const query3 = `UPDATE WorkoutTemplatePlan SET OrderIndex = OrderIndex - 1 WHERE PlanID = ${plan.value.ID} AND OrderIndex >= ${OrderIndex}`;
    await databaseStore.getDatabase()?.run(query3);
  }

  workouts.value = workouts.value.filter(
    (w: { OrderIndex: number }) => w.OrderIndex !== OrderIndex
  );

  // update scheme- build new scheme from workouts
  let newScheme = "";
  for (let i = 0; i < workouts.value.length; i++) {
    if (workouts.value[i].WorkoutTemplateName === "Restday") {
      newScheme += "r";
    } else {
      newScheme += "t";
    }
    console.log("NEW SCHEME AFTER DELETING: ", newScheme);
  }

  plan.value.scheme = newScheme;

  // save scheme to database
  const query2 = `UPDATE Plan SET Scheme = '${newScheme}' WHERE ID = ${plan.value.ID}`;
  await databaseStore.getDatabase()?.run(query2);

  await loadPlan();
  await loadWorkouts();

  if (activePlan.value === workoutName) {
    await activate();
  }

  emit("loadPlan");
};

const toggleListMode = async () => {
  showList.value = false;
  deleteMode.value = !deleteMode.value;
  await loadPlan();
  workouts.value = workouts.value.sort((a: any, b: any) => {
    return a.OrderIndex - b.OrderIndex;
  });
  showList.value = true;
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
