<template>
  <ion-page style="height: calc(100vh - 100px)">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Archivated Workouts</ion-title>
        <div class="icon">
          <ion-icon
            :icon="chevronBack"
            @click="router.go(-1)"
            size="large"
            color="primary"></ion-icon>
          <ion-label @click="router.go(-1)" color="primary">Back</ion-label>
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Archivated Workouts</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-searchbar
        @ionInput="handleInput($event)"
        placeholder="Search"
        @keydown.enter="hideKeyboard"></ion-searchbar>

      <ion-list>
        <ion-list-header>
          <ion-label>Name</ion-label>
        </ion-list-header>
        <ion-item-sliding
          v-for="workout in visibleWorkouts"
          :key="workout.Name">
          <ion-item>
            <ion-label>{{ workout.Name }}</ion-label>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option color="danger">
              <ion-button
                @click="unarchiveWorkout(workout.Name)"
                color="transparent"
                style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                <ion-icon :icon="archiveOutline"></ion-icon>
              </ion-button>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { chevronBack, archiveOutline } from "ionicons/icons";
import {
  IonIcon,
  IonLabel,
  IonContent,
  IonTitle,
  IonToolbar,
  IonHeader,
  IonPage,
  IonList,
  IonItem,
  IonListHeader,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonSearchbar,
  IonButton,
} from "@ionic/vue";
import { useDatabaseStore } from "@/stores/databaseStore";
import { onMounted, ref } from "vue";
import { Keyboard } from "@capacitor/keyboard";

const databaseStore = useDatabaseStore();

const router = useRouter();

const workouts = ref();
const visibleWorkouts = ref();

onMounted(async () => {
  await loadArchivatedWorkouts();
  visibleWorkouts.value = workouts.value;
});

const loadArchivatedWorkouts = async () => {
  const query = `SELECT * FROM WorkoutTemplate WHERE archivated = 1`;
  const resp = await databaseStore.getDatabase()?.query(query);
  workouts.value = resp?.values ? resp.values : [];
};

const unarchiveWorkout = async (name: string) => {
  const query = `UPDATE WorkoutTemplate SET archivated = 0 WHERE Name = '${name}'`;
  await databaseStore.getDatabase()?.run(query);
  await loadArchivatedWorkouts();
  visibleWorkouts.value = workouts.value;
};

const handleInput = async (event: any) => {
  const query = event.target.value.toLowerCase(); // To ignore case sensitivity
  visibleWorkouts.value = workouts.value.filter((workout: any) => {
    return workout.Name.toLowerCase().includes(query);
  });
};

const hideKeyboard = async () => {
  await Keyboard.hide();
};
</script>

<style scoped>
.icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
