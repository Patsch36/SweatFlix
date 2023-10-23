<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Health Sheet</ion-title>
        <ion-progress-bar :value="progress / allSteps"></ion-progress-bar>
        <ion-button
          :disabled="progress === 0"
          @click="progress--"
          fill="clear"
          color="primary">
          <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
        </ion-button>
        <ion-button
          :disabled="progress === allSteps"
          @click="nextStep"
          slot="end"
          fill="clear"
          color="primary">
          <ion-icon slot="icon-only" :icon="arrowForwardOutline"></ion-icon>
        </ion-button>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="content" v-if="progress === 0">
        <ion-img
          :src="`./assets/backpain_${gender}.png`"
          alt="Backpain Male Image"></ion-img>

        <h3 class="question">Do you have Backpain?</h3>
        <ion-radio-group v-model="backpain">
          <ion-radio value="yes" labelPlacement="end">Yes</ion-radio>
          <ion-radio value="no" labelPlacement="end">No</ion-radio>
        </ion-radio-group>
      </div>

      <div class="content" v-if="progress === 1">
        <ion-img
          :src="`./assets/highbloodpressure_2.png`"
          alt="High Blood Pressure"></ion-img>

        <h3 class="question">Do you have High Blood Pressure?</h3>
        <ion-radio-group v-model="highBloodPressure">
          <ion-radio value="yes" labelPlacement="end">Yes</ion-radio>
          <ion-radio value="no" labelPlacement="end">No</ion-radio>
        </ion-radio-group>
      </div>

      <div class="content" v-if="progress === 2">
        <ion-img
          :src="`./assets/shoulder_pain_${gender}.png`"
          alt="Shoulder Pain"></ion-img>

        <h3 class="question">Do you have Shoulder pain</h3>
        <ion-radio-group v-model="shoulderPain">
          <ion-radio value="yes" labelPlacement="end">Yes</ion-radio>
          <ion-radio value="no" labelPlacement="end">No</ion-radio>
        </ion-radio-group>
      </div>

      <div class="content" v-if="progress === 3">
        <ion-img
          :src="`./assets/arm_pain_${gender}.png`"
          alt="Arm Pain"></ion-img>

        <h3 class="question">Do you have Shoulder pain</h3>
        <ion-radio-group v-model="armPain">
          <ion-radio value="yes" labelPlacement="end">Yes</ion-radio>
          <ion-radio value="no" labelPlacement="end">No</ion-radio>
        </ion-radio-group>
      </div>

      <div class="content" v-if="progress === 4">
        <ion-img :src="`./assets/food.png`" alt="Food"></ion-img>

        <h3 class="question">Which diet do you live?</h3>
        <ion-radio-group v-model="diet">
          <ion-radio
            value="meat"
            labelPlacement="end"
            justify="start"
            style="width: 51%">
            Meat
          </ion-radio>
          <ion-radio
            value="vegan"
            labelPlacement="end"
            justify="start"
            style="width: 51%">
            Vegan
          </ion-radio>
          <ion-radio
            value="vegetarian"
            labelPlacement="end"
            justify="start"
            style="width: 51%">
            Vegetarian
          </ion-radio>
        </ion-radio-group>
      </div>

      <div class="content" v-if="progress === 5">
        <ion-img :src="`./assets/finnish_flag.png`" alt="Finished"></ion-img>

        <ion-button @click="router.push('/home')" class="ion-margin-top">
          Go to home
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { store } from "@/stores/IonicStorage";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonImg,
  IonRadioGroup,
  IonRadio,
  IonProgressBar,
  IonButton,
  IonIcon,
} from "@ionic/vue";
import { arrowBackOutline, arrowForwardOutline } from "ionicons/icons";
import { onBeforeMount, ref, shallowRef } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const gender = ref();
const allSteps = shallowRef(5);
const progress = ref(0);

const backpain = ref();
const highBloodPressure = ref();
const shoulderPain = ref();
const armPain = ref();
const diet = ref();

onBeforeMount(async () => {
  gender.value = await store.get("Gender");
  backpain.value = (await store.get("Backpain")) || "no";
  highBloodPressure.value = (await store.get("High Blood Pressure")) || "no";
  shoulderPain.value = (await store.get("Shoulder Pain")) || "no";
  armPain.value = (await store.get("Arm Pain")) || "no";
  diet.value = (await store.get("Diet")) || "meat";
});

const nextStep = async () => {
  progress.value++;

  switch (progress.value) {
    case 0:
      await store.set("Backpain", backpain.value);
      break;
    case 1:
      await store.set("High Blood Pressure", highBloodPressure.value);
      break;
    case 2:
      await store.set("Shoulder Pain", shoulderPain.value);
      break;
    case 3:
      await store.set("Arm Pain", armPain.value);
      break;
    case 4:
      await store.set("Diet", diet.value);
      break;
  }
};
</script>

<style scoped>
ion-title {
  text-align: center !important;
}
.content {
  margin-top: 100px;
  width: 70%;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h3.question {
  text-align: center;
  margin-top: 32px;
}

ion-radio-group {
  margin-top: 16px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
}

ion-radio {
  margin-right: 32px;
}

ion-radio::part(container) {
  width: 30px;
  height: 30px;

  margin: 0;
  padding: 0;

  border-radius: 50%;
  border: 2px solid #ddd;
}

ion-radio::part(mark) {
  background: none;
  transition: none;
  transform: none;
  border-radius: 0;
}

ion-radio.radio-checked::part(container) {
  background: var(--ion-color-primary);
  border-color: transparent;
}

ion-radio.radio-checked::part(mark) {
  width: 6px;
  height: 10px;

  border-width: 0px 2px 2px 0px;
  border-style: solid;
  border-color: transparent;

  transform: rotate(45deg);
}
</style>
