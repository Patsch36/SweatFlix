<template>
  <h2 @click="router.push('/weight')">Weight</h2>
  <ion-grid @click="router.push('/weight')">
    <ion-row>
      <ion-col size="6" size-md="3">
        <ion-card color="primary">
          <ion-card-header>
            <ion-card-subtitle>Current</ion-card-subtitle>
            <ion-card-title>
              <span v-if="queryCurrentWeightResults.length > 0">
                {{ queryCurrentWeightResults[0].weight }}
              </span>
              kg
            </ion-card-title>
          </ion-card-header>
        </ion-card>
      </ion-col>
      <ion-col size="6" size-md="3">
        <ion-card color="primary">
          <ion-card-header>
            <ion-card-subtitle>Goal</ion-card-subtitle>
            <ion-card-title>{{ weightGoal }} kg</ion-card-title>
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
} from "@ionic/vue";
import { useRouter } from "vue-router";
import { onBeforeMount, ref } from "vue";
import { store } from "@/stores/IonicStorage";
const router = useRouter();

import { useDatabaseStore } from "../stores/databaseStore";

const databaseStore = useDatabaseStore();
const queryCurrentWeightResults = ref<any>([]);
const weightGoal = ref();

const getCurrentWeight = async () => {
  try {
    const resp = await databaseStore.getDatabase()?.query(`SELECT * FROM weight
    ORDER BY timestamp DESC
    LIMIT 1;`);

    queryCurrentWeightResults.value = resp?.values || [];
  } catch (e) {
    alert("ERROR initializing DB " + JSON.stringify(e));
  }
};

onBeforeMount(async () => {
  getCurrentWeight();
  weightGoal.value = await store.get("Weight Goal");
});
</script>
