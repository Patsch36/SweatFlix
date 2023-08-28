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

const dbInitialized = ref(false);
const databaseStore = useDatabaseStore();

// INIT DATABASE
const initializeDBTable = async () => {
  try {
    await databaseStore.getDatabase()?.run(`CREATE TABLE weight (
      timestamp DEFAULT (datetime('now','localtime')) PRIMARY KEY,
      weight REAL NOT NULL
    );`);

    // await databaseStore.getDatabase()?.run(`DROP TABLE weight;`);
  } catch (e) {
    alert("ERROR initializing DB " + JSON.stringify(e));
  }
};

const insertTestWeight = async () => {
  try {
    await databaseStore.getDatabase()?.run(`
      INSERT INTO weight (timestamp, weight) VALUES ('2023-08-26 11:42:55', 80);
    `);
    await databaseStore.getDatabase()?.run(`
      INSERT INTO weight (timestamp, weight) VALUES ('2023-08-25 11:42:55', 79);
    `);
    await databaseStore.getDatabase()?.run(`
      INSERT INTO weight (timestamp, weight) VALUES ('2023-08-24 11:42:55', 79.5);
    `);
    await databaseStore.getDatabase()?.run(`
      INSERT INTO weight (timestamp, weight) VALUES ('2023-08-23 11:42:55', 80);
    `);
  } catch (e) {
    alert("ERROR inserting in DB " + JSON.stringify(e));
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
    // await initializeDBTable();
    // await insertTestWeight();

    dbInitialized.value = true;
  } catch (e) {
    alert("ERROR OPENING DB " + JSON.stringify(e));
  }
  return {};
});
</script>
