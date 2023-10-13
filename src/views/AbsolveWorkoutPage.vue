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
          (amountOfExercises > 0 ? amountOfExercises - 1 : 1)
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
        <div class="set-progress">
          <p>
            Finished Sets:
            {{ Math.round((amountOfFinishedSets / amountOfSets) * 1000) / 10 }}%
          </p>
          <ion-progress-bar
            :value="amountOfFinishedSets / amountOfSets"
            class="ion-margin-bottom">
          </ion-progress-bar>
        </div>

        <swiper @swiper="setSwiperInstance">
          <swiper-slide v-for="(exercise, index) in exercises" class="slide">
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
          Page {{ slides.activeIndex + 1 }} / {{ amountOfExercises }}
        </p>
      </div>
    </ion-content>
    <ion-modal :isOpen="showResultModal">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button
              @click="
                showResultModal = false;
                router.go(-1);
              "
              >Home</ion-button
            >
          </ion-buttons>
          <ion-title>Workout Results</ion-title>
          <ion-buttons slot="end">
            <ion-button
              :strong="true"
              @click="
                showResultModal = false;
                router.push(`/workoutDetails/${workout}`);
              "
              :disabled="false">
              Details
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-popover
          :isOpen="true"
          v-for="(badge, index) in newBadgesImages"
          :key="index">
          <ion-content>
            <ion-img :src="`./assets/Achievements/${badge}.png`"></ion-img>
            <h3>{{ newBadges[index] }}</h3>
          </ion-content>
        </ion-popover>

        <ion-popover
          :isOpen="selectedBadge.length"
          @willDismiss="selectedBadge = ''">
          <ion-content>
            <ion-img
              :src="`./assets/Achievements/${selectedBadge}.png`"></ion-img>
            <h3>
              {{
                allBadges[
                  allBadgesImages.findIndex(
                    (item: string) => item === selectedBadge
                  )
                ]
              }}
            </h3>
          </ion-content>
        </ion-popover>

        <h1>Congratulations!</h1>
        <h2>You're Workout Stats</h2>
        <ion-grid>
          <ion-row>
            <ion-col size="6">
              <b>Duration:</b>
              <br />
              {{
                new Date(
                  new Date(enddate).getTime() - new Date(startdate).getTime()
                ).getUTCHours()
              }}:{{
                new Date(
                  new Date(enddate).getTime() - new Date(startdate).getTime()
                ).getUTCMinutes()
              }}
              hours
            </ion-col>
            <ion-col size="6">
              <b>Overall Weight:</b>
              <br />
              {{ overallWeight }}kg
            </ion-col>
          </ion-row>
        </ion-grid>
        <h2>You're earned badges</h2>
        <div class="badgeContainer">
          <ion-img
            v-for="(badge, index) in allBadgesImages"
            :key="index"
            @click="selectedBadge = badge"
            :src="`./assets/Achievements/${badge}.png`"
            style="width: 100px; height: 100px; margin: 8px"
            :alt="badge"></ion-img>
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, onMounted, ref } from "vue";
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
  IonTitle,
  IonToolbar,
  IonHeader,
  IonPage,
  IonProgressBar,
  IonInput,
  IonList,
  IonItem,
  IonListHeader,
  IonGrid,
  IonModal,
  IonButtons,
  IonButton,
  IonImg,
  IonPopover,
} from "@ionic/vue";
import { SetManager } from "@/datatypes/SetManager";
import AchievementManager from "@/datatypes/AchievementManager";
import { fireConfetti } from "@/datatypes/confetti";
const databaseStore = useDatabaseStore();

const route = useRoute();
const router = useRouter();
const showTitle = ref(false);
const showReps = ref(false);

const workout = ref();
const template = ref();
const exercises = ref();
const lastResults = ref();

const exerciseResults = ref<any[]>([]);

const amountOfExercises = ref(0);

const setManager = ref();
const ORMs = ref<any[]>([]);
const NRMs = ref<any[]>([]);

const startdate = ref();
const enddate = ref();
const overallWeight = ref();

const slides = ref();
const showResultModal = ref(false);
const newBadges = ref();
const newBadgesImages = ref();
const allBadges = ref();
const allBadgesImages = ref();
const selectedBadge = ref("");

const amountOfSets = computed(() => {
  let amount = 0;
  if (!exercises.value) return amount;
  for (let i = 0; i < exercises.value.length; i++) {
    amount += exercises.value[i].sets;
  }
  return amount;
});

const amountOfFinishedSets = computed(() => {
  let amount = 0;
  if (!exerciseResults.value) return amount;
  for (let i = 0; i < exerciseResults.value.length; i++) {
    for (let j = 0; j < exerciseResults.value[i].length; j++) {
      if (
        exerciseResults.value[i][j].reps &&
        exerciseResults.value[i][j].weight
      ) {
        amount++;
      }
    }
  }
  return amount;
});

onMounted(() => {
  showTitle.value = true;
});

onBeforeMount(async () => {
  workout.value = route.params.id;
  await loadWorkoutTemplate();
  await loadWorkoutExcercises();

  startdate.value = new Date().toISOString().slice(0, 19);

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
        repsPlaceholder: `Reps: ${element.reps}`,
        weightPlaceholder: `Weight: ${element.weight}`,
      });
    }
    exerciseResults.value.push(templist);
  }
  console.log("Results", exerciseResults.value);
};

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

const save = async () => {
  overallWeight.value = 0;
  enddate.value = new Date().toISOString().slice(0, 19);
  const insertNewWorkoutQuery = `INSERT INTO Workout (workoutname, startdate, enddate) VALUES ('${workout.value}', '${startdate.value}', '${enddate.value}')`;
  await databaseStore.getDatabase()?.run(insertNewWorkoutQuery);

  for (let exercise = 0; exercise < exercises.value.length; exercise++) {
    console.log(exerciseResults.value[exercise]);
    for (let i = 0; i < exerciseResults.value[exercise].length; i++) {
      if (exerciseResults.value[exercise][i].reps === null) {
        exerciseResults.value[exercise][i].reps = 0;
      }

      if (exerciseResults.value[exercise][i].weight === null) {
        exerciseResults.value[exercise][i].weight = 0;
      }

      const query = `INSERT INTO WorkoutExercise (workout, exercise, setnumber, reps, weight, unit) VALUES ('${
        startdate.value
      }', '${exercises.value[exercise].exerciseName}', ${i + 1}, ${
        exerciseResults.value[exercise][i].reps
      }, ${exerciseResults.value[exercise][i].weight}, 'kg')`;
      await databaseStore.getDatabase()?.run(query);
      overallWeight.value +=
        exerciseResults.value[exercise][i].weight *
        exerciseResults.value[exercise][i].reps;
    }
  }

  const achievementmanager = new AchievementManager();
  await achievementmanager.checkWorkoutAchievements(startdate.value);
  newBadges.value = await achievementmanager.getNewAchievements();
  allBadges.value = await achievementmanager.getAchievements();

  setTimeout(async () => {
    // Call the function to get the achievement image URLs
    newBadgesImages.value = await getAchievementImageURLs(newBadges.value);
    allBadgesImages.value = await getAchievementImageURLs(allBadges.value);
    showResultModal.value = true;

    await console.log(
      "New Badge Images from",
      newBadges.value,
      ":",
      newBadgesImages.value
    );
    await console.log(
      "All Badge Images from",
      allBadges.value,
      ":",
      allBadgesImages.value
    );

    setTimeout(() => {
      fireConfetti();
    }, 100);
  }, 100);
};

const getAchievementImageURLs = async (list: string[]) => {
  const imageURLs = [];
  for (let badge = 0; badge < list.length; badge++) {
    const query = `SELECT imageURL FROM achievements WHERE name = '${list[badge]}'`;
    const result = await databaseStore.getDatabase()?.query(query);
    if (result && result.values && result.values[0]) {
      imageURLs.push(result.values[0].imageURL);
    }
  }
  return imageURLs;
};

const generateNumbers = (upperLimit: any) => {
  // Erstelle ein Array von 1 bis zur angegebenen oberen Grenze
  return Array.from({ length: upperLimit }, (_, index) => index);
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
