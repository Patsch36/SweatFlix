<template>
  <ion-page style="height: calc(100vh - 100px)">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Profile</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-textarea
        placeholder="Enter some text..."
        :auto-grow="true"
        v-model="query"
        :rows="1"></ion-textarea>
      <ion-button @click="executeQuery()">Execute</ion-button>
      <p>{{ data }}</p>
    </ion-content>
  </ion-page>

  <!-- <base-layout pageTitle="Calendar">
      <ion-button color="primary" router-link="/home">Home</ion-button>
      In Calendar
      </base-layout>  -->
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonTextarea,
} from "@ionic/vue";
import { ref } from "vue";
import { useDatabaseStore } from "@/stores/databaseStore";
const databaseStore = useDatabaseStore();

const query = ref("");
const data = ref();

const executeQuery = async () => {
  try {
    const resp = await databaseStore.getDatabase()?.query(query.value);
    data.value = resp?.values ? resp.values : [];
  } catch (e) {
    console.log(e);
    data.value = e;
  }
  query.value = "";
};
</script>

<style scoped></style>
