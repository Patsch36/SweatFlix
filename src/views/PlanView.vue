<template>
  <ion-page style="height: calc(100vh - 100px)">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title v-if="plan">{{ plan.name }}- Plan</ion-title>
        <div class="icon">
          <ion-icon
            :icon="chevronBack"
            @click="router.go(-1)"
            size="large"
            color="primary"></ion-icon>
          <ion-label @click="router.go(-1)" color="primary">Cancel</ion-label>
        </div>
        <!-- <div
            @click="saveWorkout()"
            class="icon"
            slot="end"
            style="margin-right: 16px">
            <ion-label color="primary">Save</ion-label>
            <ion-icon
              :icon="saveOutline"
              style="font-size: 24px; margin-left: 8px"
              color="primary"></ion-icon>
          </div> -->
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large" v-if="plan">{{ plan.name }}- Plan</ion-title>
        </ion-toolbar>
      </ion-header>
      <div style="padding-inline: 0.75rem">
        <ion-grid v-if="plan">
          <ion-row>
            <ion-col>
              <b>Description:</b>
              <br />
              {{ plan.description }}
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <b>Type:</b>
              <br />
              {{ plan.type }}
            </ion-col>
            <ion-col>
              <b>Place:</b>
              <br />
              {{ plan.place }}
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <b>Split:</b>
              <br />
              {{ plan.split }}
            </ion-col>
            <ion-col>
              <b>Scheme:</b>
              <br />
              {{ plan.scheme }}
            </ion-col>
          </ion-row>
        </ion-grid>

        <ion-list ref="list">
          <ion-list-header>
            <ion-label class="mt-0">Workout</ion-label>
          </ion-list-header>
          <ion-reorder-group
            :disabled="false"
            @ionItemReorder="handleReorder($event)">
            <ion-item v-for="workout in workouts" key="workout.OrderIndex">
              <ion-label>{{ workout.WorkoutTemplateName }} </ion-label>
              <ion-reorder slot="end"></ion-reorder>
            </ion-item>
          </ion-reorder-group>
        </ion-list>
      </div>
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
  IonLabel,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonReorderGroup,
  IonReorder,
  IonInput,
  IonList,
  IonListHeader,
  IonItem,
} from "@ionic/vue";
import { useRoute, useRouter } from "vue-router";
import { chevronBack, saveOutline } from "ionicons/icons";
import { onBeforeMount, ref } from "vue";
import { store } from "@/stores/IonicStorage";

const router = useRouter();
const databaseStore = useDatabaseStore();
const route = useRoute();

const plan = ref();
const workouts = ref();

const list = ref();

const loadPlan = async () => {
  const query = `SELECT * FROM Plan WHERE ID = ${route.params.id}`;
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
};

const loadWorkouts = async () => {
  const query = `SELECT WorkoutTemplateName, OrderIndex FROM WorkoutTemplatePlan WHERE PlanID = ${plan.value.ID}`;
  const resp = await databaseStore.getDatabase()?.query(query);
  const ws = resp?.values ? resp.values : [];

  ws.sort((a: any, b: any) => {
    return a.OrderIndex - b.OrderIndex;
  });

  // Iterate through plan.value.scheme. If t, insert first element of ws and remove ist. if R, insert {WorkoutTemplateName: 'Restday'}. Make OrderIndex rising.
  const newWs = [];
  for (let i = 0; i < plan.value.scheme.length; i++) {
    if (plan.value.scheme[i] === "t") {
      newWs.push({
        WorkoutTemplateName: ws[0].WorkoutTemplateName,
        OrderIndex: i,
      });
      ws.shift();
    } else if (plan.value.scheme[i] === "r") {
      newWs.push({ WorkoutTemplateName: "Restday", OrderIndex: i });
    }
  }

  workouts.value = newWs;
};

onBeforeMount(async () => {
  await loadPlan();
  await loadWorkouts();
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

  await event.detail.complete();
};
</script>

<style scoped>
.icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
