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
        @click="deleteMode = !deleteMode"
        v-if="!deleteMode"
        class="ion-margin-end"></ion-icon>
      <ion-icon
        :icon="reorderThreeOutline"
        size="large"
        @click="deleteMode = !deleteMode"
        v-else
        class="ion-margin-end"></ion-icon>
    </ion-list-header>
    <ion-reorder-group
      v-if="!deleteMode"
      :disabled="false"
      @ionItemReorder="handleReorder($event)">
      <ion-item v-for="workout in workouts" key="workout.OrderIndex">
        <ion-label>{{ workout.WorkoutTemplateName }} </ion-label>
        <ion-reorder slot="end"></ion-reorder>
      </ion-item>
    </ion-reorder-group>
    <ion-item-sliding
      v-else
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
import { I } from "vitest/dist/types-198fd1d9";

const emit = defineEmits(["loadPlan"]);

const databaseStore = useDatabaseStore();
const route = useRoute();
const addWorkoutModalOpen = ref(false);
const deleteMode = ref(false);

const plan = ref();
const workouts = ref();
const workouttemplates = ref();

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
  console.log(ws);
  for (let i = 0; i < plan.value.scheme.length; i++) {
    if (plan.value.scheme[i] === "t") {
      console.log(
        wsIndex,
        ws[ws.findIndex((obj) => obj.OrderIndex === wsIndex)]
      );
      newWs.push({
        WorkoutTemplateName:
          ws[ws.findIndex((obj) => obj.OrderIndex === wsIndex)]
            .WorkoutTemplateName,
        OrderIndex: i,
      });
      //   ws.shift();
      console.log(ws.length, wsIndex);
      if (wsIndex < ws.length) {
        wsIndex += 1;
      } else {
        wsIndex = 0;
      }
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
  await loadPlan();
  await loadWorkouts();
  await loadAllWorkouts();

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
      console.log(i - 1, workouts.value[index]);
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
  for (let i = 0; i < workouts.value.length; i++) {
    const itemIndex = workouts.value.findIndex(
      (w: { OrderIndex: any }) => w.OrderIndex === i
    );

    if (workouts.value[itemIndex].WorkoutTemplateName === "Restday") {
      newScheme += "r";
    } else {
      newScheme += "t";
      const query = `UPDATE WorkoutTemplatePlan SET OrderIndex = ${dbOrderIndex} WHERE PlanID = ${plan.value.ID} AND WorkoutTemplateName = '${workouts.value[itemIndex].WorkoutTemplateName}'`;
      console.log(query);
      await databaseStore.getDatabase()?.query(query);
      dbOrderIndex += 1;
    }
  }

  plan.value.scheme = newScheme;
  const query = `UPDATE Plan SET Scheme = '${newScheme}' WHERE ID = ${plan.value.ID}`;
  await databaseStore.getDatabase()?.query(query);

  emit("loadPlan");

  await event.detail.complete();
};

const addNewWorkouts = async () => {
  addWorkoutModalOpen.value = false;
  // Save everything to database

  // get amount of t in plan.scheme
  if (plan.value) {
    const t = plan.value.scheme ? plan.value.scheme.split("t").length - 1 : 0;

    let dbOrderIndex = t;
    for (const [key, value] of Object.entries(selectedWorkouts)) {
      if (value) {
        if (key !== "Restday") {
          const query = `INSERT INTO WorkoutTemplatePlan (PlanID, WorkoutTemplateName, OrderIndex) VALUES (${plan.value.ID}, '${key}', ${dbOrderIndex})`;
          await databaseStore.getDatabase()?.query(query);
          dbOrderIndex += 1;
        }

        selectedWorkouts[key] = false;

        // update scheme
        plan.value.scheme += key === "Restday" ? "r" : "t";

        // save scheme to database
        const query2 = `UPDATE Plan SET Scheme = '${plan.value.scheme}' WHERE ID = ${plan.value.ID}`;
        await databaseStore.getDatabase()?.run(query2);
      }
    }

    await loadWorkouts();
    emit("loadPlan");
  } else {
  }
};

const deleteWorkout = async (workoutName: string, OrderIndex: number) => {
  const query = `DELETE FROM WorkoutTemplatePlan WHERE PlanID = ${plan.value.ID} AND WorkoutTemplateName = '${workoutName}'`;
  await databaseStore.getDatabase()?.run(query);

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
  }

  plan.value.scheme = newScheme;

  await loadWorkouts();

  // save scheme to database
  const query2 = `UPDATE Plan SET Scheme = '${newScheme}' WHERE ID = ${plan.value.ID}`;
  await databaseStore.getDatabase()?.run(query2);

  emit("loadPlan");
};
</script>

<style scoped>
.icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
