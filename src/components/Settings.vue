<template>
  <ion-item>
    <ion-checkbox v-model="doWarmUp" labelPlacement="end" justify="start">
      Do Warm Up
    </ion-checkbox>
  </ion-item>
  <ion-item>
    <ion-checkbox labelPlacement="end" justify="start">
      Do Cool Down
    </ion-checkbox>
  </ion-item>
</template>

<script setup lang="ts">
import { IonItem, IonCheckbox } from "@ionic/vue";
import { onBeforeMount, ref } from "vue";
import { useDatabaseStore } from "@/stores/databaseStore";
import { useStateStore } from "@/stores/stateStore";
const doWarmUp = ref(true);

onBeforeMount(async () => {});
</script>

<style scoped>
.searchbar-container {
  display: flex;
  flex-direction: row;
}
</style>
