<template>
  <ion-page style="height: calc(100vh - 100px)">
    <!-- <ion-action-sheet
      :is-open="isAlertOpen"
      class="my-custom-class"
      header="Activate new Plan?"
      sub-header="Your current plan will be overwritten."
      :buttons="actionSheetButtons"
      @didDismiss="isAlertOpen = false"></ion-action-sheet> -->

    <ion-alert
      :is-open="isAlertOpen"
      header="Activate new plan?"
      sub-header="Your current plan will be overwritten."
      :buttons="alertButtons"
      @didDismiss="logResult($event)"></ion-alert>

    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Plans</ion-title>
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
          <ion-title size="large">Plans</ion-title>
          <ion-icon
            slot="end"
            :icon="removeCircleOutline"
            size="large"
            @click="removePlan"></ion-icon>
        </ion-toolbar>
      </ion-header>
      <div style="padding-inline: 0.75rem">
        <ion-grid class="ion-margin-bottom">
          <ion-row>
            <ion-col size="4" size-md="3">
              <ion-card
                color="primary"
                @click="stateStore.setShowAddPlanModal(true)">
                <ion-card-header>
                  <ion-card-subtitle>Add new Plan</ion-card-subtitle>
                  <ion-card-title style="text-align: center">+</ion-card-title>
                </ion-card-header>
              </ion-card>
            </ion-col>
            <ion-col size="8" size-md="3">
              <ion-card
                color="primary"
                @click="router.push('/plans')"
                v-if="activePlan">
                <ion-card-header class="plan-card">
                  <ion-card-subtitle>Active Plan</ion-card-subtitle>
                  <ion-card-title
                    style="font-size: 22px"
                    :class="{ biggerFont: activePlan.length < 12 }">
                    {{
                      activePlan.length > 25
                        ? activePlan.slice(0, 25) + "..."
                        : activePlan
                    }}
                  </ion-card-title>
                </ion-card-header>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
        <ion-list>
          <ion-list-header>
            <ion-label>Choose a plan:</ion-label>
          </ion-list-header>
          <ion-item-sliding v-for="plan in availablePlans" :key="plan.ID">
            <ion-item @click="router.push(`/plan/${plan.ID}`)">
              <ion-label>{{ plan.name }}</ion-label>
            </ion-item>
            <ion-item-options side="start">
              <ion-item-option color="accent">
                <ion-button color="transparent" @click="activatePlan(plan)">
                  <ion-icon
                    slot="icon-only"
                    :icon="checkmarkCircleOutline"></ion-icon>
                </ion-button>
              </ion-item-option>
            </ion-item-options>
            <ion-item-options side="end">
              <ion-item-option color="danger">
                <ion-button color="transparent" @click="deletePlan(plan)">
                  <ion-icon slot="icon-only" :icon="trash"></ion-icon>
                </ion-button>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>
      </div>
    </ion-content>
    <add-plan></add-plan>
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
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonButton,
  IonAlert,
} from "@ionic/vue";
import { useRoute, useRouter } from "vue-router";
import {
  chevronBack,
  trash,
  checkmarkCircleOutline,
  removeCircleOutline,
} from "ionicons/icons";
import { onBeforeMount, ref, shallowRef } from "vue";
import { store } from "@/stores/IonicStorage";
import { useStateStore } from "@/stores/stateStore";
import AddPlan from "@/components/modals/addPlan.vue";
import { availableColors } from "@/datatypes/CalendarTypes";

const stateStore = useStateStore();

const router = useRouter();
const databaseStore = useDatabaseStore();

const activePlan = ref();
const availablePlans = ref();
const plan = shallowRef();

const isAlertOpen = ref(false);
const actionSheetButtons = [
  {
    text: "Delete",
    role: "destructive",
    data: {
      action: "delete",
    },
  },
  {
    text: "Share",
    data: {
      action: "share",
    },
  },
  {
    text: "Cancel",
    role: "cancel",
    data: {
      action: "cancel",
    },
  },
];
const alertButtons = [
  {
    text: "Cancel",
    role: "cancel",
    handler: () => {
      console.log("Alert canceled");
    },
  },
  {
    text: "OK",
    role: "confirm",
    handler: () => {
      activePlan.value = plan.value.name;
      store.set("Active Plan", plan.value.name);
      store.set("Current Workout Index", 0);

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

      router.go(-1);
    },
  },
];

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

const logResult = (ev: CustomEvent) => {
  console.log(`Dismissed with role: ${ev.detail.role}`);
  isAlertOpen.value = false;
};

const loadPlans = async () => {
  const query = `SELECT * FROM Plan`;
  const result = await databaseStore.getDatabase()?.query(query);
  availablePlans.value = result?.values ? result.values : [];
};

const activatePlan = (_plan: { ID: any; name: any }) => {
  isAlertOpen.value = true;
  plan.value = _plan;
};

const deletePlan = async (plan: { name: any; ID: any }) => {
  // Delete all workouts from WorkoutTemplatePlan
  const deleteWTPQuery = `DELETE FROM WorkoutTemplatePlan WHERE PlanID = ${plan.ID}`;
  await databaseStore.getDatabase()?.run(deleteWTPQuery);

  const query = `DELETE FROM Plan WHERE id = ${plan.ID}`;
  await databaseStore.getDatabase()?.run(query);
  await loadPlans();

  const currentPlan = await store.get("Active Plan");
  if (currentPlan === plan.name) {
    store.set("Active Plan", "No Plan");
    activePlan.value = "No Plan";
  }
};

onBeforeMount(async () => {
  activePlan.value = await store.get("Active Plan");
  activePlan.value ? activePlan.value : "No Active Plan";
  await loadPlans();
});

stateStore.$subscribe((mutation, state) => {
  if (!state.showAddPlanModal) loadPlans();
});

const removePlan = () => {
  store.set("Active Plan", "No Plan");
  activePlan.value = "No Plan";
};
</script>

<style scoped>
.icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}
ion-card {
  height: 100px;
}

ion-card-subtitle {
  font-size: 10px;
}

ion-card-title {
  min-height: 40px;
}

.biggerFont {
  font-size: 28px !important;
}
</style>
