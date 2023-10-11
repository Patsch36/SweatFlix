<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Timer</ion-title>
      </ion-toolbar>
      <ion-progress-bar
        v-if="progress <= 1"
        :value="progress"></ion-progress-bar>
    </ion-header>
    <ion-content>
      <ion-card>
        <ion-card-content>
          <div class="circle-timer">
            <div
              class="circle-timer__progress"
              :style="{ transform: `rotate(${progress}deg)` }"></div>
            <div class="circle-timer__time">{{ displayTime }}</div>
          </div>

          <ion-item>
            <ion-label>Desired Time</ion-label>
            <span class="input-span" @click="openPopOverHours = true">
              {{ userTimeHours }}
            </span>
            <ion-popover
              :is-open="openPopOverHours"
              @ionPopoverDidDismiss="openPopOverHours = false"
              ><ion-content>
                <ion-list>
                  <ion-item
                    v-for="number in generateArray(24)"
                    :key="number"
                    @click="
                      userTimeHours = number;
                      openPopOverHours = false;
                    ">
                    <ion-label>{{ number }}</ion-label>
                  </ion-item>
                </ion-list></ion-content
              >
            </ion-popover>
            <span class="input-span" @click="openPopOverMinutes = true">
              {{ userTimeMinutes }}
            </span>
            <ion-popover
              :is-open="openPopOverMinutes"
              @ionPopoverDidDismiss="openPopOverMinutes = false"
              ><ion-content>
                <ion-list>
                  <ion-item
                    v-for="number in generateArray(60)"
                    :key="number"
                    @click="
                      userTimeMinutes = number;
                      openPopOverMinutes = false;
                    ">
                    <ion-label>{{ number }}</ion-label>
                  </ion-item>
                </ion-list></ion-content
              >
            </ion-popover>
            <span class="input-span" @click="openPopOverSeconds = true">
              {{ userTimeSeconds }}
            </span>
            <ion-popover
              :is-open="openPopOverSeconds"
              @ionPopoverDidDismiss="openPopOverSeconds = false">
              <ion-content>
                <ion-list>
                  <ion-item
                    v-for="number in generateArray(60)"
                    :key="number"
                    @click="
                      userTimeSeconds = number;
                      openPopOverSeconds = false;
                    ">
                    <ion-label>{{ number }}</ion-label>
                  </ion-item>
                </ion-list></ion-content
              >
            </ion-popover>
          </ion-item>

          <div class="controls">
            <ion-button @click="startTimer" :disabled="isRunning">
              Start
            </ion-button>
            <ion-button @click="pauseTimer" :disabled="!isRunning"
              >Pause
            </ion-button>
            <ion-button @click="resetTimer">Reset</ion-button>
          </div>
        </ion-card-content>
      </ion-card>
      <p>{{ userTimeHours }}, {{ userTimeMinutes }}, {{ userTimeSeconds }}</p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
  IonPopover,
  IonList,
  IonProgressBar,
} from "@ionic/vue";
import { NativeAudio } from "@capacitor-community/native-audio";

const openPopOverHours = ref(false);
const openPopOverMinutes = ref(false);
const openPopOverSeconds = ref(false);

const isRunning = ref(false);
const displayTime = ref("00:00:00");
const desiredTime = ref(3600);
const userTimeHours = ref(0);
const userTimeMinutes = ref(0);
const userTimeSeconds = ref(0);
let starttime = 0;
let timer: any;

const progress = computed(() => 2 - starttime / desiredTime.value);

const startTimer = () => {
  NativeAudio.preload({
    assetId: "alarm",
    assetPath: "success-fanfare-trumpets-6185.mp3",
    audioChannelNum: 1,
    isUrl: true,
  });
  isRunning.value = true;
  timer = setInterval(() => {
    if (desiredTime.value > 0) {
      desiredTime.value--;
      setDisplayTime();
    } else {
      isRunning.value = false;
      clearInterval(timer);
      NativeAudio.play({ assetId: "alarm" });
    }
  }, 1000);
};

const pauseTimer = () => {
  isRunning.value = false;
  clearInterval(timer);
};

const resetTimer = () => {
  isRunning.value = false;
  clearInterval(timer);
  desiredTime.value = 0;
  if (userTimeHours.value) {
    desiredTime.value = userTimeHours.value * 3600;
  }
  if (userTimeMinutes.value) {
    desiredTime.value += userTimeMinutes.value * 60;
  }
  if (userTimeSeconds.value) {
    desiredTime.value += userTimeSeconds.value;
  }

  starttime = desiredTime.value;
  setDisplayTime();
};

const setDisplayTime = () => {
  const hours = Math.floor(desiredTime.value / 3600);
  const minutes = Math.floor((desiredTime.value % 3600) / 60);
  const seconds = desiredTime.value % 60;
  displayTime.value = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const generateArray = (n: number) => {
  return Array.from({ length: n }, (_, i) => i);
};
</script>

<style scoped>
.circle-timer {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  position: relative;
  background-color: var(--ion-color-dark-shade);
  overflow: hidden;
  margin: 0 auto;
  transform: rotate(0deg);
  transition: transform 1s linear;
  -webkit-box-shadow: -10px 0px 13px -7px #000000, 10px 0px 13px -7px #000000,
    5px 6px 33px 4px rgba(0, 0, 0, 0.33);
  box-shadow: -10px 0px 13px -7px #000000, 10px 0px 13px -7px #000000,
    5px 6px 33px 4px rgba(0, 0, 0, 0.33);
  margin-bottom: 32px;

  border: 5px solid var(--ion-color-primary);
}

.circle-timer__time {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  color: var(--ion-color-dark-contrast);
}

.controls {
  margin-top: 32px;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.input-span {
  height: 40px;
  width: 64px;
  border: 1px solid var(--ion-color-light-shade);
  border-radius: 4px;
  margin: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

ion-popover {
  --width: 75px;
}

ion-popover ion-content {
  --background: var(--ion-color-dark-shade);
  border-radius: 16px;
  border: 5px solid var(--ion-color-primary);
  -webkit-box-shadow: -10px 0px 13px -7px #000000, 10px 0px 13px -7px #000000,
    5px 6px 33px 4px rgba(0, 0, 0, 0.33);
  box-shadow: -10px 0px 13px -7px #000000, 10px 0px 13px -7px #000000,
    5px 6px 33px 4px rgba(0, 0, 0, 0.33);
  height: 400px;
  overflow: hidden;
}

ion-popover ion-list {
  --background: var(--ion-color-dark-shade);
  height: 400px;
  overflow: auto;
}

ion-popover::part(backdrop) {
  background-color: var(--ion-color-dark-shade);
}
</style>
