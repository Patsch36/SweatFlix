<template>
  <ion-page style="height: calc(100vh - 100px)">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title v-if="exercise"> {{ exercise.name }} </ion-title>
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
          <ion-title size="large" v-if="exercise">
            {{ exercise.name }}
          </ion-title>
        </ion-toolbar>
      </ion-header>
      <div style="padding-inline: 0.75rem">
        <ion-grid v-if="exercise">
          <ion-row>
            <ion-col>
              <b>Muscle Group</b>
              <br />
              {{ exercise.Muscle }}
            </ion-col>
            <ion-col>
              <b>Sub Muscle Group</b>
              <br />
              {{ exercise.SubMuscle }}
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              {{ exercise.description }}
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <b>Description</b>
              <br />
              {{ exercise.ExDesc }}
            </ion-col>
          </ion-row>
        </ion-grid>
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
import { chevronBack, trash, checkmarkCircleOutline } from "ionicons/icons";
import { store } from "@/stores/IonicStorage";
import { onBeforeMount, ref } from "vue";

const router = useRouter();
const route = useRoute();
const databaseStore = useDatabaseStore();

const exercise = ref();
const exerciseName = ref();

const WorkoutExercise = ref();

const loadExercise = async () => {
  const query = `SELECT *, Exercise.description as ExDesc FROM Exercise INNER JOIN MuscleGroup ON Exercise.MuscleGroup = MuscleGroup.ID WHERE Exercise.Name = '${exerciseName.value}'`;
  const resp = await databaseStore.getDatabase()?.query(query);
  exercise.value = resp?.values
    ? resp.values[0]
    : { name: "No exercise found" };
  console.log(exercise.value);
};

const loadExercisesFromWorkoutEexercises = async () => {
  // get all exercises from database of this exercise
  const query = `SELECT * FROM WorkoutExercise WHERE WorkoutExercise.Exercise = '${exerciseName.value}'`;
  const resp = await databaseStore.getDatabase()?.query(query);
  WorkoutExercise.value = resp?.values ? resp.values : [];
};

onBeforeMount(async () => {
  exerciseName.value = route.params.id;
  await loadExercise();
});
</script>

<style scoped>
.icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
