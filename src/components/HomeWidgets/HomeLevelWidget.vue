<template>
  <h1>Level Process</h1>
  <h3>Current Level: {{ level }}</h3>
  <ion-progress-bar
    :value="xpFromThisLevelToCurrentXP / getXPFromThisLevelToNextLevel" />
  <p class="level-indicator">
    {{ xpFromThisLevelToCurrentXP }}/{{ getXPFromThisLevelToNextLevel }}
  </p>
  <!-- <ion-button
    @click="
      levelManager.getXP();
      levelManager.addXP(1000);
      setValues();
    "
    >Add XP
  </ion-button> -->
</template>

<script setup lang="ts">
import { onBeforeMount, ref, watch } from "vue";
import { IonProgressBar, IonButton } from "@ionic/vue";
import { LevelManager } from "@/datatypes/LevelManager";

const levelManager = ref();
const xp = ref(0);
const level = ref(0);
const xpFromThisLevelToCurrentXP = ref(0);
const getXPFromThisLevelToNextLevel = ref(0);

onBeforeMount(() => {
  levelManager.value = new LevelManager();
  setValues();

  setTimeout(() => {
    setValues();
  }, 500);
});

watch(levelManager, () => {
  console.log("levelManager changed");
  setValues();
});

const setValues = async () => {
  xp.value = await levelManager.value.getXP();
  level.value = levelManager.value.getLevel();
  xpFromThisLevelToCurrentXP.value =
    levelManager.value.getXPFromThisLevelToCurrentXP();
  getXPFromThisLevelToNextLevel.value =
    levelManager.value.getXPFromThisLevelToNextLevel();
};
</script>

<style scoped>
.level-indicator {
  width: 100%;
  text-align: end;
  margin: 5px 0;
}
</style>
