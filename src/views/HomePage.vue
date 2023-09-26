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
        <h1>Dashboard</h1>
        <ion-grid>
          <ion-row>
            <ion-col size="6" size-md="3">
              <ion-card color="primary">
                <ion-card-header>
                  <ion-card-subtitle>Last Workout</ion-card-subtitle>
                  <ion-card-title>Push</ion-card-title>
                </ion-card-header>
              </ion-card>
            </ion-col>
            <ion-col size="6" size-md="3">
              <ion-card color="primary">
                <ion-card-header>
                  <ion-card-subtitle>Next Workout</ion-card-subtitle>
                  <ion-card-title>Pull</ion-card-title>
                </ion-card-header>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <h2 @click="router.push('/weight')">Gewicht</h2>
        <ion-grid @click="router.push('/weight')">
          <ion-row>
            <ion-col size="6" size-md="3">
              <ion-card color="primary">
                <ion-card-header>
                  <ion-card-subtitle>Current</ion-card-subtitle>
                  <ion-card-title v-if="queryCurrentWeightResults.length > 0"
                    >{{
                      queryCurrentWeightResults[0].weight
                    }}
                    kg</ion-card-title
                  >
                </ion-card-header>
              </ion-card>
            </ion-col>
            <ion-col size="6" size-md="3">
              <ion-card color="primary">
                <ion-card-header>
                  <ion-card-subtitle>Goal</ion-card-subtitle>
                  <ion-card-title>85 kg</ion-card-title>
                </ion-card-header>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
  </ion-page>

  <!-- <BaseLayout pageTitle="Home">
    <ion-button color="primary" router-link="/calendar">Home</ion-button>
    test
    </BaseLayout>  -->
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonGrid,
  IonRow,
  IonCol,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from "@ionic/vue";
import { useRouter } from "vue-router";
import { onBeforeMount, onMounted, ref } from "vue";
const router = useRouter();

import { useDatabaseStore } from "../stores/databaseStore";
const databaseStore = useDatabaseStore();
const queryCurrentWeightResults = ref<any>([]);

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
onMounted(() => {
  getCurrentWeight();
});
</script>

<style scoped></style>
