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
        <home-exercise-widget />
        <home-weight-widget />
        <home-level-widget />
        <home-quotes-component />
      </div>
      <ion-fab slot="fixed" horizontal="end" vertical="bottom">
        <ion-fab-button>
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
        <ion-fab-list side="top">
          <ion-fab-button @click="router.push('timer')">
            <ion-label>Timer</ion-label>
            <ion-icon :icon="timer"></ion-icon>
          </ion-fab-button>
          <ion-fab-button @click="router.push('RM-Calculator')">
            <ion-label>Rep Calculator</ion-label>
            <ion-icon :icon="calculator"></ion-icon>
          </ion-fab-button>
          <ion-fab-button
            @click="showModal = true"
            @ionPopoverDidDismiss="showModal = false">
            <ion-label>Start Workout</ion-label>
            <ion-icon :icon="barbell"></ion-icon>
          </ion-fab-button>
        </ion-fab-list>
      </ion-fab>
      <ion-popover :is-open="showModal">
        <ion-content>
          <ion-list>
            <ion-item
              v-for="workout in activeWorkouts"
              :key="workout.Name"
              @click="
                showModal = false;
                router.push(`/absolveWorkout/${workout.Name}`);
              ">
              {{ workout.Name }}
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-popover>
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
  IonFab,
  IonFabButton,
  IonFabList,
  IonIcon,
  IonLabel,
  IonPopover,
  IonList,
  IonItem,
  IonButton,
} from "@ionic/vue";

import { add, barbell, calculator, timer } from "ionicons/icons";

import { onBeforeMount, ref } from "vue";

import HomeWeightWidget from "@/components/HomeWidgets/HomeWeightWidget.vue";
import HomeExerciseWidget from "@/components/HomeWidgets/HomeExerciseWidget.vue";
import HomeQuotesComponent from "@/components/HomeWidgets/HomeQuotesComponent.vue";
import { useRouter } from "vue-router";
import { useDatabaseStore } from "@/stores/databaseStore";
import HomeLevelWidget from "@/components/HomeWidgets/HomeLevelWidget.vue";
// import AchievementManager from "@/datatypes/AchievementManager";

const router = useRouter();
const databasestore = useDatabaseStore();

const activeWorkouts = ref();
const showModal = ref(false);
const workoutgenerator = ref();

onBeforeMount(async () => {
  await loadActiveWorkouts();
});

const loadActiveWorkouts = async () => {
  const query = `SELECT * FROM WorkoutTemplate WHERE active = 1`;
  const resp = await databasestore.getDatabase()?.query(query);
  activeWorkouts.value = resp?.values ? resp.values : [];
};
</script>

<style scoped>
ion-fab-button {
  --border-radius: 15px;
}

.fab-button-in-list {
  width: 200px;
  transform: translateX(-145px);
}

.fab-button-in-list ion-label {
  margin-left: auto;
}

.fab-button-in-list ion-icon {
  margin-right: 12px;
  margin-left: 6px;
}

ion-popover {
  --width: 300px;
}

ion-popover ion-content {
  --background: var(--ion-color-dark-shade);
  border-radius: 16px;
  border: 5px solid var(--ion-color-primary);
  -webkit-box-shadow: -10px 0px 13px -7px #000000, 10px 0px 13px -7px #000000,
    5px 6px 33px 4px rgba(0, 0, 0, 0.33);
  box-shadow: -10px 0px 13px -7px #000000, 10px 0px 13px -7px #000000,
    5px 6px 33px 4px rgba(0, 0, 0, 0.33);
  overflow: hidden;
}

ion-popover ion-list {
  --background: var(--ion-color-dark-shade);
  overflow: auto;
}

ion-popover::part(backdrop) {
  background-color: var(--ion-color-dark-shade);
}
</style>
@/datatypes/TrainingsGenerator
@/datatypes/Trainingsgeneration/TrainingsGenerator
