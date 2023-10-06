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
      </div>
      <ion-fab slot="fixed" horizontal="end" vertical="bottom">
        <ion-fab-button>
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
        <ion-fab-list side="top">
          <ion-fab-button
            @click="router.push('RM-Calculator')"
            class="subbutton">
            <ion-icon :icon="calculator"></ion-icon>
            <ion-label>Rep Calculator</ion-label>
          </ion-fab-button>
        </ion-fab-list>
      </ion-fab>
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
} from "@ionic/vue";

import { add, chevronUp, calculator } from "ionicons/icons";

import { onBeforeMount } from "vue";

import HomeWeightWidget from "@/components/HomeWeightWidget.vue";
import HomeExerciseWidget from "@/components/HomeExerciseWidget.vue";
import { useRouter } from "vue-router";

const router = useRouter();

onBeforeMount(async () => {});

//   console.log("WATCH TRIGGERED");
//   if (!nextWorkoutCardTitle.value || !nextWorkoutCardTitle.value.$el) return;

//   let doesOverflowExist = hasOverflow(nextWorkoutCardTitle.value.$el);
//   if (doesOverflowExist) {
//     console.log("Overflow vorhanden.");
//     while (doesOverflowExist) {
//       console.log("Overflow vorhanden.");
//       showNextWorkout.value = false;
//       nextWorkoutCharLimit.value = nextWorkoutCharLimit.value - 1;
//       doesOverflowExist = hasOverflow(nextWorkoutCardTitle.value.$el);
//       showNextWorkout.value = true;
//     }
//   } else {
//     console.log("Kein Overflow vorhanden.");
//   }
// });
</script>

<style scoped>
ion-fab-button {
  --border-radius: 15px;
}

.subbutton {
  width: 200px;
  transform: translateX(-145px);
}
</style>
