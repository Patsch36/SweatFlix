<template>
  <ion-page style="height: calc(100vh - 100px)">
    <ion-header :translucent="true" color="light">
      <ion-toolbar>
        <ion-title color="primary-contrast">{{
          workoutQueryResult.workoutname
        }}</ion-title>
        <div class="back-icon">
          <ion-icon
            :icon="chevronBack"
            @click="router.go(-1)"
            size="large"
            color="primary"></ion-icon>
          <ion-label @click="router.go(-1)" color="primary">Back</ion-label>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large" style="font-size: 28px">{{
            workoutQueryResult.workoutname
          }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-grid>
        <ion-row>
          <ion-col>
            <b>Started:</b>
            <br />
            {{ new Date(workoutQueryResult.startdate).toLocaleString() }}
          </ion-col>
          <ion-col>
            <b>Ended:</b>
            <br />
            {{ new Date(workoutQueryResult.enddate).toLocaleString() }}
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <b>Duration:</b>
            <br />
            {{
              new Date(
                new Date(workoutQueryResult.enddate).getTime() -
                  new Date(workoutQueryResult.startdate).getTime()
              ).getHours()
            }}:{{
              new Date(
                new Date(workoutQueryResult.enddate).getTime() -
                  new Date(workoutQueryResult.startdate).getTime()
              ).getMinutes()
            }}
            Stunden
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <b>Notes:</b>
            <br />
            {{ workoutQueryResult.note }}
          </ion-col>
        </ion-row>
      </ion-grid>
      <ion-button color="primary" router-link="/home">Home</ion-button>
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
  IonButton,
  IonIcon,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/vue";
import { chevronBack } from "ionicons/icons";
import { onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const databaseStore = useDatabaseStore();
const route = useRoute();
const router = useRouter();

const workoutQueryResult = ref<{
  workoutname: string;
  startdate: string;
  enddate: string;
  note: string;
}>({ workoutname: "No Workout found", startdate: "", enddate: "", note: "" });
const workoutname = ref<string>("No Workout found");

const loadWorkout = async () => {
  const date = route.params.id;
  const workout = await databaseStore.getDatabase()?.query(`SELECT * 
    FROM Workout
    WHERE DATE(startdate) = '${date.slice(0, 10)}';
    `);
  workoutQueryResult.value = workout?.values
    ? workout?.values[0]
    : { workoutname: "No Workout found" };
  workoutname.value = workoutQueryResult.value.workoutname;
};

onBeforeMount(async () => {
  await loadWorkout();
});
</script>

<style scoped>
.back-icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
