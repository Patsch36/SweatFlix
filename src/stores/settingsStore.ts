import { defineStore } from "pinia";
import { store } from "./IonicStorage";
import { ref } from "vue";

export const useSettingsStore = defineStore("settings", () => {
  const doWarmup = ref(true);
  const doCooldown = ref(true);
  const doStretching = ref(true);
  const doMediation = ref(true);
  const language = ref("en");
  const firstDayOfWeek = ref(1);
  const showWorkoutManager = ref(true);
  const showWeightManager = ref(true);
  const showLevelManager = ref(true);
  const showQuotesManager = ref(true);

  const setDoWarmup = async (value: boolean) => {
    await store.set("doWarmup", value);
    doWarmup.value = value;
  };

  const setDoCooldown = async (value: boolean) => {
    await store.set("doCooldown", value);
    doCooldown.value = value;
  };

  const setDoStretching = async (value: boolean) => {
    await store.set("doStretching", value);
    doStretching.value = value;
  };

  const setDoMediation = async (value: boolean) => {
    await store.set("doMediation", value);
    doMediation.value = value;
  };

  const setLanguage = async (value: string) => {
    await store.set("language", value);
    language.value = value;
  };

  const setFirstDayOfWeek = async (value: number) => {
    await store.set("firstDayOfWeek", value);
    firstDayOfWeek.value = value;
  };

  const setShowWorkoutManager = async (value: boolean) => {
    await store.set("showWorkoutManager", value);
    showWorkoutManager.value = value;
  };

  const setShowWeightManager = async (value: boolean) => {
    await store.set("showWeightManager", value);
    showWeightManager.value = value;
  };

  const setShowLevelManager = async (value: boolean) => {
    await store.set("showLevelManager", value);
    showLevelManager.value = value;
  };

  const setShowQuotesManager = async (value: boolean) => {
    await store.set("showQuotesManager", value);
    showQuotesManager.value = value;
  };

  const loadSettings = async () => {
    const doWarmupValue = await store.get("doWarmup");
    const doCooldownValue = await store.get("doCooldown");
    const doStretchingValue = await store.get("doStretching");
    const doMediationValue = await store.get("doMediation");
    const languageValue = await store.get("language");
    const firstDayOfWeekValue = await store.get("firstDayOfWeek");
    const showWorkoutManagerValue = await store.get("showWorkoutManager");
    const showWeightManagerValue = await store.get("showWeightManager");
    const showLevelManagerValue = await store.get("showLevelManager");
    const showQuotesManagerValue = await store.get("showQuotesManager");

    if (doWarmupValue !== null) {
      doWarmup.value = doWarmupValue;
    }

    if (doCooldownValue !== null) {
      doCooldown.value = doCooldownValue;
    }

    if (doStretchingValue !== null) {
      doStretching.value = doStretchingValue;
    }

    if (doMediationValue !== null) {
      doMediation.value = doMediationValue;
    }

    if (languageValue !== null) {
      language.value = languageValue;
    }

    if (firstDayOfWeekValue !== null) {
      firstDayOfWeek.value = firstDayOfWeekValue;
    }

    if (showWorkoutManagerValue !== null) {
      showWorkoutManager.value = showWorkoutManagerValue;
    }

    if (showWeightManagerValue !== null) {
      showWeightManager.value = showWeightManagerValue;
    }

    if (showLevelManagerValue !== null) {
      showLevelManager.value = showLevelManagerValue;
    }

    if (showQuotesManagerValue !== null) {
      showQuotesManager.value = showQuotesManagerValue;
    }
  };

  return {
    doWarmup,
    doCooldown,
    doStretching,
    doMediation,
    language,
    firstDayOfWeek,
    showWorkoutManager,
    showWeightManager,
    showLevelManager,
    showQuotesManager,
    setDoWarmup,
    setDoCooldown,
    setDoStretching,
    setDoMediation,
    setLanguage,
    setFirstDayOfWeek,
    loadSettings,
    setShowWorkoutManager,
    setShowWeightManager,
    setShowLevelManager,
    setShowQuotesManager,
  };
});
