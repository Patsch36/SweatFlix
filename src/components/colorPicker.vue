<template>
  <ion-backdrop :visible="false"></ion-backdrop>
  <div id="box">
    <div class="header">
      <div class="icon">
        <ion-label @click="close">Close</ion-label>
        <ion-icon :icon="closeOutline" @click="close" size="large"></ion-icon>
      </div>
    </div>
    <h2>Pick a color</h2>
    <p
      style="max-width: 208px; border: 4px solid var(--ion-color-medium-shade)">
      <ion-radio-group ref="color">
        <ion-radio
          v-for="color in availableColors"
          :value="color.name"
          labelPlacement="end"
          :style="`color: ${color.color}; background-color: ${color.background}; width: 50px; height: 50px; --color-checked: ${color.color}`"></ion-radio>
      </ion-radio-group>
    </p>
    <ion-button @click="submit"> Choose color</ion-button>
  </div>
</template>

<script setup lang="ts">
import { IonBackdrop, IonButton } from "@ionic/vue";
import { closeOutline } from "ionicons/icons";
import { useRouter } from "vue-router";

import { availableColors } from "@/datatypes/CalendarTypes";
import { onMounted, ref, watch } from "vue";

const router = useRouter();

const color = ref<any>(null);

const emit = defineEmits(["close", "color"]);

const close = () => {
  emit("close");
};

const submit = () => {
  if (!color.value.value) alert("Please select a color");
  else {
    emit("color", color.value.value);
  }
};

onMounted(() => {
  console.log(availableColors);
});
</script>

<style scoped>
#box {
  position: absolute;
  color: var(--ion-color-light);
  left: 50%;
  background: var(--ion-color-dark-shade);
  border-radius: 16px;
  border: 5px solid var(--ion-color-primary);
  padding-inline: 16px;
  width: 250px;
  transform: translateX(-50%) translateY(50%);
  margin-inline: auto;
  z-index: 100;
  --wheel-highlight-background: var(--ion-color-dark-tint);
  --wheel-fade-background-rgb: var(--ion-color-dark-shade);
  -webkit-box-shadow: -10px 0px 13px -7px #000000, 10px 0px 13px -7px #000000,
    5px 6px 33px 4px rgba(0, 0, 0, 0.33);
  box-shadow: -10px 0px 13px -7px #000000, 10px 0px 13px -7px #000000,
    5px 6px 33px 4px rgba(0, 0, 0, 0.33);
}

.header {
  display: flex;
  padding-top: 16px;
  color: var(--ion-color-medium);
  max-width: min-content;
  margin-left: auto;
}

.icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}

ion-radio {
  --border-radius: 4px;
  --inner-border-radius: 4px;

  --color: var(--ion-color-medium-shade);

  padding-bottom: 6px;
}

ion-radio.ios::part(container) {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

ion-radio::part(mark) {
  background: none;
  transition: none;
  transform: none;
  border-radius: 0;
}

ion-radio.radio-checked::part(container) {
  border-color: transparent;
  width: 50px;
}

ion-radio.radio-checked::part(mark) {
  width: 15px;
  height: 15px;

  /* border-width: 0px 2px 2px 0px;
  border-style: solid; */
  border-color: var(--color-checked);

  transform: rotate(45deg);
}

ion-backdrop {
  opacity: 0.7;
  background-color: var(--ion-background-color);
  z-index: 99;
  /* height: 9999999999999999999999999999999999999999999px; */
}
</style>
