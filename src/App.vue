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

const dbInitialized = ref(false);
const databaseStore = useDatabaseStore();

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
    // await dropTables();
    // console.log("Dropped Tables");
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
  return {};
});
</script>
