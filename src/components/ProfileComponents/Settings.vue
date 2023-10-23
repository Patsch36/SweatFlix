<template>
  <ion-item-group>
    <ion-item-divider>
      <ion-label>Workout Settings</ion-label>
    </ion-item-divider>
    <ion-item>
      <ion-checkbox
        v-model="settingsStore.doWarmup"
        @ionChange="settingsStore.setDoWarmup($event.target.checked)"
        labelPlacement="end"
        justify="start">
        Do Warm Up
      </ion-checkbox>
    </ion-item>

    <ion-item>
      <ion-checkbox
        v-model="settingsStore.doCooldown"
        @ionChange="settingsStore.setDoCooldown($event.target.checked)"
        labelPlacement="end"
        justify="start">
        Do Cool Down
      </ion-checkbox>
    </ion-item>

    <ion-item>
      <ion-checkbox
        v-model="settingsStore.doStretching"
        @ionChange="settingsStore.setDoStretching($event.target.checked)"
        labelPlacement="end"
        justify="start">
        Do Stretching
      </ion-checkbox>
    </ion-item>

    <ion-item>
      <ion-checkbox
        v-model="settingsStore.doMediation"
        @ionChange="settingsStore.setDoMediation($event.target.checked)"
        labelPlacement="end"
        justify="start">
        Do Meditation
      </ion-checkbox>
    </ion-item>
  </ion-item-group>

  <ion-item-group>
    <ion-item-divider>
      <ion-label>App Settings</ion-label>
    </ion-item-divider>
    <ion-item>
      <ion-select
        interface="action-sheet"
        label="Language"
        v-model="settingsStore.language"
        @ionChange="settingsStore.setLanguage($event.target.value)">
        <ion-select-option value="en">English</ion-select-option>
        <ion-select-option value="de">Deutsch</ion-select-option>
      </ion-select>
    </ion-item>
    <ion-item>
      <ion-select
        interface="action-sheet"
        label="First Day"
        v-model="settingsStore.firstDayOfWeek"
        @ionChange="settingsStore.setFirstDayOfWeek($event.target.value)">
        <ion-select-option :value="1">Monday</ion-select-option>
        <ion-select-option :value="2">Tuesday</ion-select-option>
        <ion-select-option :value="3">Wednesday</ion-select-option>
        <ion-select-option :value="4">Thursday</ion-select-option>
        <ion-select-option :value="5">Friday</ion-select-option>
        <ion-select-option :value="6">Saturday</ion-select-option>
        <ion-select-option :value="7">Sunday</ion-select-option>
      </ion-select>
    </ion-item>
  </ion-item-group>

  <!-- <ion-item-group>
    <ion-item-divider>
      <ion-label>Database Settings</ion-label>
    </ion-item-divider>
    <ion-item>
      <ion-button
        @click="useDatabaseStore().resetDatabase()"
        color="danger"
        fill="outline">
        Reset Database
      </ion-button>
    </ion-item>
  </ion-item-group> -->
</template>

<script setup lang="ts">
import { IonItem, IonCheckbox, IonSelect } from "@ionic/vue";
import { onBeforeMount, ref } from "vue";
import { useSettingsStore } from "@/stores/settingsStore";

const settingsStore = useSettingsStore();

onBeforeMount(async () => {});
</script>

<style scoped>
.searchbar-container {
  display: flex;
  flex-direction: row;
}
</style>
