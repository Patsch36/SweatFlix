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
        <h1>{{ plan }}</h1>
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
} from "@ionic/vue";
import { useRoute, useRouter } from "vue-router";
import { chevronBack, saveOutline } from "ionicons/icons";
import { onBeforeMount, ref } from "vue";
import { store } from "@/stores/IonicStorage";

const router = useRouter();
const databaseStore = useDatabaseStore();
const route = useRoute();

const plan = ref();

const loadPlan = async () => {
  const query = `SELECT * FROM Plan WHERE ID = ${route.params.id}`;
  const resp = await databaseStore.getDatabase()?.query(query);
  plan.value = resp?.values ? resp.values[0] : { name: "NotFound" };
};

onBeforeMount(() => {
  loadPlan();
});
</script>

<style scoped>
.icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
