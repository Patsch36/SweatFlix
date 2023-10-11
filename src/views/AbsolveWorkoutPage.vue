<template>
  <ion-page style="height: calc(100vh - 100px)">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title v-if="workout">{{ workout }}</ion-title>
        <div class="icon">
          <ion-icon
            :icon="chevronBack"
            @click="router.go(-1)"
            size="large"
            color="primary"></ion-icon>
          <ion-label @click="router.go(-1)" color="primary">Back</ion-label>
        </div>
        <div
          @click="router.push(`/workouttemplateEdit/${workout}`)"
          class="icon"
          slot="end"
          style="margin-right: 16px">
          <ion-icon
            :icon="pencilOutline"
            style="font-size: 24px; margin-right: 8px"
            color="primary"></ion-icon>
          <ion-label color="primary">Edit</ion-label>
        </div>
      </ion-toolbar>
      <ion-progress-bar
        v-if="slides"
        :value="
          slides.activeIndex /
          (amountOfExercises > 0 ? amountOfExercises - 1 : 1)
        ">
      </ion-progress-bar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense" style="padding-inline: 0.75rem">
        <ion-toolbar>
          <!-- <ion-title size="large">{{ workout }}</ion-title> -->
          <h1 v-if="workout" style="font-weight: bold; font-size: 32px">
            {{ workout }}
          </h1>
        </ion-toolbar>
      </ion-header>
      <div style="padding-inline: 0.75rem" v-if="template">
        <swiper @swiper="setSwiperInstance">
          <swiper-slide v-for="(exercise, index) in exercises">
            <ion-grid>
              <ion-list>
                <ion-list-header>
                  <ion-label>{{ exercise.exerciseName }}</ion-label>
                </ion-list-header>
                <ion-item v-for="(set, setIndex) in exerciseResults[index]">
                  <ion-label class="ion-margin-right"> </ion-label>
                  <ion-input
                    type="number"
                    :label="`Set ${setIndex + 1}`"
                    v-model="exerciseResults[index][setIndex].reps"
                    :placeholder="
                      exerciseResults[index][setIndex].repsPlaceholder
                    "></ion-input>
                  <ion-input
                    type="number"
                    label=""
                    v-model="exerciseResults[index][setIndex].weight"
                    :placeholder="
                      exerciseResults[index][setIndex].weightPlaceholder
                    "></ion-input>
                  <p></p>
                </ion-item>
              </ion-list>
              <p v-if="ORMs[index]">
                You're 1RM for this exercise is: {{ ORMs[index] }}kg
              </p>
              <p v-if="NRMs[index]">
                You're {{ setManager.getReps() }}RM for this exercise is:
                {{ NRMs[index] }}kg
              </p>
            </ion-grid>
          </swiper-slide>
        </swiper>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  chevronBack,
  pencilOutline,
  returnUpForwardOutline,
  returnUpBackOutline,
} from "ionicons/icons";
import { useDatabaseStore } from "@/stores/databaseStore";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "@ionic/vue/css/ionic-swiper.css";
import {
  IonIcon,
  IonLabel,
  IonContent,
  IonTitle,
  IonToolbar,
  IonHeader,
  IonPage,
  IonProgressBar,
  IonInput,
  IonList,
  IonItem,
  IonListHeader,
} from "@ionic/vue";
import { SetManager } from "@/datatypes/SetManager";
const databaseStore = useDatabaseStore();

const route = useRoute();
const router = useRouter();

const workout = ref();
const template = ref();
const exercises = ref();
const lastResults = ref();

const exerciseResults = ref<any[]>([]);

const amountOfExercises = ref(0);

const setManager = ref();
const ORMs = ref<any[]>([]);
const NRMs = ref<any[]>([]);

const slides = ref();
const setSwiperInstance = (swiper: any) => {
  slides.value = swiper;
};

const loadWorkoutTemplate = async () => {
  const query = `SELECT Split, Description, Color, active FROM WorkoutTemplate WHERE name = '${workout.value}'`;

  const resp = await databaseStore.getDatabase()?.query(query);
  template.value = resp?.values ? resp.values[0] : {};
};

const loadWorkoutExcercises = async () => {
  const query = `SELECT exerciseName, sets, reps, OrderIndex FROM WorkoutList WHERE workoutPlan = '${workout.value}'`;

  const resp = await databaseStore.getDatabase()?.query(query);
  exercises.value = resp?.values ? resp.values : [];
  await exercises.value.sort((a: any, b: any) => a.OrderIndex - b.OrderIndex);

  amountOfExercises.value = exercises.value.length;

  // load exercises from last Workout
  const query2 = `SELECT exercise, setnumber, reps, weight FROM WorkoutExercise WHERE workout = (SELECT MAX(startdate) FROM Workout WHERE workoutname = '${workout.value}')`;
  const resp2 = await databaseStore.getDatabase()?.query(query2);
  lastResults.value = resp2?.values ? resp2.values : [];

  for (
    let exerciseIndex = 0;
    exerciseIndex < exercises.value.length;
    exerciseIndex++
  ) {
    let templist = [];
    console.log("ELEMENT", exercises.value[exerciseIndex]);
    for (let i = 0; i < exercises.value[exerciseIndex].sets; i++) {
      const element = lastResults.value.find(
        (element: any) =>
          element.exercise === exercises.value[exerciseIndex].exerciseName &&
          element.setNumber === i + 1
      )
        ? lastResults.value.find(
            (element: any) =>
              element.exercise ===
                exercises.value[exerciseIndex].exerciseName &&
              element.setNumber === i + 1
          )
        : { reps: 0, weight: 0 };
      console.log(element);
      templist.push({
        reps: null,
        weight: null,
        repsPlaceholder: element.reps,
        weightPlaceholder: element.weight,
      });
    }
    exerciseResults.value.push(templist);
  }
  console.log("Results", exerciseResults.value);
};

onBeforeMount(async () => {
  workout.value = route.params.id;
  await loadWorkoutTemplate();
  await loadWorkoutExcercises();

  setManager.value = new SetManager();
  await set1RMs();
  await setNRMs();
});

const set1RMs = () => {
  for (let i = 0; i < exercises.value.length; i++) {
    setManager.value
      .get1RM(
        exercises.value[i].exerciseName,
        new Date().toISOString().slice(0, 19),
        14
      )
      .then((res: any) => {
        console.log(res);
        ORMs.value.push(res);
      });
  }
};

const setNRMs = () => {
  for (let i = 0; i < exercises.value.length; i++) {
    console.log(exercises.value.exerciseName);
    setManager.value
      .getNRM(
        exercises.value[i].exerciseName,
        new Date().toISOString().slice(0, 19),
        14
      )
      .then((res: any) => {
        console.log(res);
        NRMs.value.push(res);
      });
  }
};
</script>

<style scoped>
.icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

ion-input {
  text-align: right;
}
</style>
