<template>
  <ion-page style="height: calc(100vh - 100px)">
    <ion-header :translucent="false">
      <ion-toolbar>
        <div class="headerwrapper">
          <div class="icon">
            <ion-icon
              :icon="chevronBack"
              @click="router.go(-1)"
              size="large"
              color="primary"></ion-icon>
            <ion-label @click="router.go(-1)" color="primary">Back</ion-label>
          </div>
          <h6>Pageprogress:</h6>
          <div class="icon" @click="save" slot="end" style="margin-right: 8px">
            <ion-label color="primary" style="margin-right: 8px">
              Save
            </ion-label>
            <ion-icon
              :icon="saveOutline"
              size="large"
              color="primary"></ion-icon>
          </div>
        </div>
      </ion-toolbar>
      <ion-progress-bar
        v-if="slides"
        :value="
          slides.activeIndex /
          (absolvingExercisesStore.amountOfExercises > 0
            ? absolvingExercisesStore.amountOfExercises - 1
            : 1)
        ">
      </ion-progress-bar>
    </ion-header>

    <ion-content :fullscreen="true" :scroll-y="false">
      <ion-header collapse="condense" style="">
        <ion-toolbar>
          <!-- <ion-title size="large">{{ workout }}</ion-title> -->
          <h1 v-if="workout" style="font-weight: bold; font-size: 32px">
            {{ workout }}
          </h1>
        </ion-toolbar>
      </ion-header>
      <div class="content-wrapper" v-if="template">
        <!-- <p>{{ slides.activeIndex + 1 }} || {{ amountOfExercises }}</p> -->
        <div class="set-progress" v-if="absolvingExercisesStore.amountOfSets">
          <p>
            Finished Sets:
            {{
              Math.round(
                (absolvingExercisesStore.amountOfFinishedSets /
                  absolvingExercisesStore.amountOfSets) *
                  1000
              ) / 10
            }}%
          </p>
          <ion-progress-bar
            :value="
              absolvingExercisesStore.amountOfFinishedSets /
              absolvingExercisesStore.amountOfSets
            "
            class="ion-margin-bottom">
          </ion-progress-bar>
        </div>

        <ion-button @click="absolvingExercisesStore.clear()">c</ion-button>
        <swiper @swiper="setSwiperInstance">
          <swiper-slide
            v-for="(exercise, index) in absolvingExercisesStore.exercises"
            class="slide">
            <ion-grid>
              <ion-list>
                <ion-list-header>
                  <ion-label>{{ exercise.exerciseName }}</ion-label>
                </ion-list-header>
                <ion-item
                  v-for="(set, setIndex) in absolvingExercisesStore
                    .exerciseResults[index]">
                  <ion-label class="ion-margin-right"> </ion-label>
                  <ion-input
                    type="number"
                    :label="`Set ${setIndex + 1}`"
                    v-model="
                      absolvingExercisesStore.exerciseResults[index][setIndex]
                        .reps
                    "
                    :placeholder="
                      absolvingExercisesStore.exerciseResults[index][setIndex]
                        .repsPlaceholder
                    "></ion-input>
                  <ion-input
                    type="number"
                    label=""
                    v-model="
                      absolvingExercisesStore.exerciseResults[index][setIndex]
                        .weight
                    "
                    :placeholder="
                      absolvingExercisesStore.exerciseResults[index][setIndex]
                        .weightPlaceholder
                    ">
                  </ion-input>
                  <p></p>
                </ion-item>
              </ion-list>
              <p v-if="ORMs[index]">
                You're 1RM for this exercise is: {{ ORMs[index] }}kg
              </p>
              <p v-if="NRMs[index] && showReps">
                You're {{ setManager.getReps() }}RM for this exercise is:
                {{ NRMs[index] }}kg
              </p>
            </ion-grid>
          </swiper-slide>
        </swiper>
        <p v-if="slides" class="page-indicator">
          Page {{ slides.activeIndex + 1 }} /
          {{ absolvingExercisesStore.amountOfExercises }}
        </p>
      </div>
    </ion-content>
    <finished-workout />
  </ion-page>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { chevronBack, saveOutline } from "ionicons/icons";
import { useDatabaseStore } from "@/stores/databaseStore";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "@ionic/vue/css/ionic-swiper.css";
import {
  IonIcon,
  IonLabel,
  IonContent,
  IonToolbar,
  IonHeader,
  IonPage,
  IonProgressBar,
  IonInput,
  IonList,
  IonItem,
  IonListHeader,
  IonGrid,
  IonButton,
} from "@ionic/vue";
import { SetManager } from "@/datatypes/SetManager";
import { useAbsolvingExercisesStore } from "@/stores/AbsolvingExercisesStore";
import { useStateStore } from "@/stores/stateStore";
import FinishedWorkout from "@/components/modals/finishedWorkout.vue";

const databaseStore = useDatabaseStore();
const absolvingExercisesStore = useAbsolvingExercisesStore();
const stateStore = useStateStore();
const route = useRoute();
const router = useRouter();
const showTitle = ref(false);
const showReps = ref(false);

const workout = ref();
const template = ref();

const setManager = ref();
const ORMs = ref<any[]>([]);
const NRMs = ref<any[]>([]);

const startdate = ref();

const slides = ref();

onMounted(() => {
  showTitle.value = true;
});

onBeforeMount(async () => {
  workout.value = route.params.id;
  await loadWorkoutTemplate();
  await absolvingExercisesStore.loadWorkoutExcercises(workout.value);

  startdate.value = new Date().toISOString().slice(0, 19);
  absolvingExercisesStore.startdate = startdate.value;

  setManager.value = new SetManager();
  await set1RMs();
  await setNRMs();

  setTimeout(() => {
    showReps.value = true;
  }, 60);
});

const setSwiperInstance = (swiper: any) => {
  slides.value = swiper;
};

const loadWorkoutTemplate = async () => {
  const query = `SELECT Split, Description, Color, active FROM WorkoutTemplate WHERE name = '${workout.value}'`;

  const resp = await databaseStore.getDatabase()?.query(query);
  template.value = resp?.values ? resp.values[0] : {};
};

const set1RMs = () => {
  for (let i = 0; i < absolvingExercisesStore.exercises.value.length; i++) {
    setManager.value
      .get1RM(
        absolvingExercisesStore.exercises.value[i].exerciseName,
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
  for (let i = 0; i < absolvingExercisesStore.exercises.value.length; i++) {
    console.log(absolvingExercisesStore.exercises.value.exerciseName);
    setManager.value
      .getNRM(
        absolvingExercisesStore.exercises.value[i].exerciseName,
        new Date().toISOString().slice(0, 19),
        14
      )
      .then((res: any) => {
        console.log(res);
        NRMs.value.push(res);
      });
  }
};

const save = async () => {
  await absolvingExercisesStore.save(workout.value, startdate.value);
  stateStore.setShowFinishWorkoutModal(true);
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

ion-content {
  overflow-y: hidden !important;
}

ion-content ion-header {
  padding-inline: 0.75rem;
}

.content-wrapper {
  padding-inline: 0.75rem;
  height: 100%;
}

.slide {
  height: calc(100vh - 350px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-block: auto;
}

ion-input {
  text-align: right;
}

.badgeContainer {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  display: flex;
  flex-direction: row;
}

ion-popover {
  --width: 300px;
  --height: 350px;
}

ion-popover ion-content {
  --background: var(--ion-color-dark-shade);
  border-radius: 16px;
  border: 5px solid var(--ion-color-primary);
  -webkit-box-shadow: -10px 0px 13px -7px #000000, 10px 0px 13px -7px #000000,
    5px 6px 33px 4px rgba(0, 0, 0, 0.33);
  box-shadow: -10px 0px 13px -7px #000000, 10px 0px 13px -7px #000000,
    5px 6px 33px 4px rgba(0, 0, 0, 0.33);
  overflow: hidden;
  padding-block: 32px;
}

ion-popover ion-list {
  --background: var(--ion-color-dark-shade);
  overflow: auto;
}

ion-popover::part(backdrop) {
  background-color: black;
}

ion-popover h3 {
  width: 100%;
  text-align: center;
  color: var(--ion-color-accent);
}

.headerwrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.set-progress {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.set-progress p {
  width: 275px;
  margin: 0;
}

.set-progress ion-progress-bar {
  margin-block: auto;
}

.page-indicator {
  width: 100%;
  text-align: center;
}
</style>
