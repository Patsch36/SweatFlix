<template>
  <ion-modal :isOpen="showResultModal">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button
            @click="
              stateStore.setShowFinishWorkoutModal(false);
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
              stateStore.setShowFinishWorkoutModal(false);
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
                new Date(new Date().toISOString().slice(0, 19)).getTime() -
                  new Date(startdate).getTime()
              ).getUTCHours()
            }}:{{
              new Date(
                new Date().getTime() - new Date(startdate).getTime()
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

      <h2>Level {{ currentLevel }}</h2>
      <ion-progress-bar :value="xp / newLevelLimit" />

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
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import { useDatabaseStore } from "@/stores/databaseStore";
import "swiper/css";
import "@ionic/vue/css/ionic-swiper.css";
import {
  IonContent,
  IonTitle,
  IonToolbar,
  IonHeader,
  IonGrid,
  IonModal,
  IonButtons,
  IonButton,
  IonImg,
  IonPopover,
} from "@ionic/vue";
import AchievementManager from "@/datatypes/AchievementManager";
import { useAbsolvingExercisesStore } from "@/stores/AbsolvingExercisesStore";
import { fireConfetti } from "@/datatypes/confetti";
import { useStateStore } from "@/stores/stateStore";
import { LevelManager } from "@/datatypes/LevelManager";
const databaseStore = useDatabaseStore();
const absolvingExercisesStore = useAbsolvingExercisesStore();
const stateStore = useStateStore();
const levelManager = ref();

const router = useRouter();

const workout = ref();
const startdate = ref();

const overallWeight = ref(0);

const showResultModal = ref(false);
const newBadges = ref();
const newBadgesImages = ref();
const allBadges = ref();
const allBadgesImages = ref();
const selectedBadge = ref("");

const xp = ref(0);
const currentLevel = ref(0);
const newLevelLimit = ref(0);

stateStore.$subscribe((mutation, state) => {
  if (state.showFinishWorkoutModal) checkForAchievements();

  // Animate xp bar
  xp.value = levelManager.value.getXPFromThisLevelToCurrentXP();
  newLevelLimit.value = levelManager.value.getXPFromThisLevelToNextLevel();

  currentLevel.value = levelManager.value.getLevel();
  let newXPs = absolvingExercisesStore.overallWeight;
  levelManager.value.addXP(absolvingExercisesStore.overallWeight);
  let newLevels = 0;

  const intervalid = setInterval(() => {
    if (newXPs === 0) clearInterval(intervalid);

    if (xp.value < newLevelLimit.value) {
      xp.value++;
      newXPs--;
    } else if (xp.value >= newLevelLimit.value || newXPs > 0) {
      xp.value = 0;
      currentLevel.value++;
      newLevels++;
      if (newXPs > 0) {
        newLevelLimit.value = levelManager.value.levelFromXP(
          currentLevel.value + 1
        );
      }
      newLevelLimit.value = levelManager.value.levelFromXP(currentLevel.value);
    }
  }, 1);

  showResultModal.value = state.showFinishWorkoutModal;
});

onBeforeMount(() => {
  levelManager.value = new LevelManager();
});

const checkForAchievements = async () => {
  startdate.value = absolvingExercisesStore.startdate;
  overallWeight.value = absolvingExercisesStore.overallWeight;

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
  }, 200);
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
</script>

<style scoped>
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
</style>
