<template>
  <ion-page style="height: calc(100vh - 100px)">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Rep Calculator</ion-title>
        <div class="icon">
          <ion-icon
            :icon="chevronBack"
            @click="router.go(-1)"
            size="large"
            color="primary"></ion-icon>
          <ion-label @click="router.go(-1)" color="primary">Cancel</ion-label>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Rep Calculator</ion-title>
        </ion-toolbar>
      </ion-header>

      <div style="padding-inline: 0.75rem">
        <h1>ORM: {{ ORMEppley }}</h1>
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
} from "@ionic/vue";

import { add, chevronBack } from "ionicons/icons";

import { onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";

import { SetManager } from "@/datatypes/SetManager";

const router = useRouter();

const setmanager = new SetManager();
const ORMEppley = ref();

onBeforeMount(async () => {
  ORMEppley.value = await setmanager.getNRM(
    "Incline Bench Press",
    new Date().toISOString().slice(0, 19),
    60,
    "all"
  );

  await setmanager.test();
});
</script>

<style scoped>
.icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
