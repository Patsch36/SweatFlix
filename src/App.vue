<template>
  <div v-if="dbInitialized">
    <ion-app>
      <ion-router-outlet />
      <Tabbar />
    </ion-app>
  </div>
</template>

<script setup lang="ts">
import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import Tabbar from "./views/Tabbar.vue";

import { onBeforeMount, ref } from "vue";
import { useDatabaseStore } from "./stores/databaseStore";
import { createTables, initTables, dropTables } from "./tables";
import { store, initKeyValuePairs } from "./stores/IonicStorage";

const dbInitialized = ref(false);
const databaseStore = useDatabaseStore();

const updateCurrentPlanIndex = async () => {
  const currentWorkoutIndexChanged = await store.get("Current Workout Index");
  let currentWorkoutIndex = await store.get("Current Workout Index");

  const today = new Date().toLocaleDateString();

  const activePlan = await store.get("Active Plan");
  const query = `SELECT scheme FROM Plan WHERE Name = '${activePlan}'`;
  const resp = await databaseStore.getDatabase()?.query(query);
  const scheme = resp?.values ? resp.values[0][0] : "NotFound";

  if (scheme !== "NotFound") {
    const currentDate = new Date(today);
    const changedDate = new Date(currentWorkoutIndexChanged);

    const timeDifference = Math.abs(
      changedDate.getTime() - currentDate.getTime()
    );
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    for (let i = 0; i < daysDifference; i++) {
      currentWorkoutIndex = currentWorkoutIndex + (1 % scheme.length);
    }
    await store.set("Current Workout Index", currentWorkoutIndex);
  }
};

onBeforeMount(async () => {
  try {
    const sqlite = new SQLiteConnection(CapacitorSQLite);

    const db = await sqlite.createConnection(
      "sweatflix",
      false,
      "no-encryption",
      1,
      false
    );
    await db?.open();
    databaseStore.setDatabase(db);
    await dropTables();
    console.log("Dropped Tables");
    const createdTables = await createTables();
    console.log("Amount of created Tables: ", createdTables);
    if (createdTables > 0) {
      await initTables();
      console.log("Initialized Tables");
    }

    dbInitialized.value = true;
  } catch (e) {
    alert("ERROR OPENING DB " + JSON.stringify(e));
  }

  document.body.classList.add("dark");

  await store.create();
  if (
    store.get("Active Plan") === undefined ||
    store.get("Active Plan") === null
  ) {
    await initKeyValuePairs();
  }

  updateCurrentPlanIndex();

  return {};
});
</script>
