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
        <div class="icon" slot="end" style="margin-right: 16px">
          <ion-icon
            :icon="pencilOutline"
            @click="edit"
            style="font-size: 24px; margin-right: 8px"
            color="primary"></ion-icon>
          <ion-label @click="edit" color="primary">Edit</ion-label>
        </div>
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

        <workout-organizer @loadPlan="loadPlan()"></workout-organizer>
      </div>
      <edit-plan @reloadPlan="loadPlan()" />
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
  IonList,
  IonListHeader,
  IonItem,
  IonButtons,
  IonButton,
  IonModal,
  IonTextarea,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from "@ionic/vue";
import { useRoute, useRouter } from "vue-router";
import {
  chevronBack,
  pencilOutline,
  add,
  saveOutline,
  trashOutline,
  reorderThreeOutline,
} from "ionicons/icons";
import { onBeforeMount, ref } from "vue";
import WorkoutOrganizer from "@/components/WorkoutOrganizer.vue";
import { useStateStore } from "@/stores/stateStore";
import EditPlan from "@/components/modals/editPlan.vue";

const router = useRouter();
const databaseStore = useDatabaseStore();
const stateStore = useStateStore();
const route = useRoute();

const plan = ref();
const workouts = ref();
const workouttemplates = ref();

let selectedWorkouts: Record<string, boolean> = {};

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
  const loopLimit = plan.value.scheme ? plan.value.scheme.length : 0;
  for (let i = 0; i < loopLimit; i++) {
    if (plan.value.scheme[i] === "t") {
      // console.log(
      //   wsIndex,
      //   "-",
      //   ws.length,
      //   ws[ws.findIndex((obj) => obj.OrderIndex === wsIndex)]
      // );
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
  const resp = await databaseStore.getDatabase()?.query(query);
  workouttemplates.value = resp?.values ? resp.values : [];
};

onBeforeMount(async () => {
  console.log("ONBEFOREMOUNT");
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
});

const edit = () => {
  stateStore.setShowEditPlanModal(true);
};
</script>

<style scoped>
.icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
