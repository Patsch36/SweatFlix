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
      INSERT INTO weight (timestamp, weight) VALUES ('2022-03-22 11:42:55', 82);
    `);
    await databaseStore.getDatabase()?.run(`
      INSERT INTO weight (timestamp, weight) VALUES ('2022-06-21 18:42:55', 83.7);
    `);
    await databaseStore.getDatabase()?.run(`
      INSERT INTO weight (timestamp, weight) VALUES ('2022-09-20 11:42:55', 85);
    `);
    await databaseStore.getDatabase()?.run(`
      INSERT INTO weight (timestamp, weight) VALUES ('2022-12-19 18:42:55', 86);
    `);
    await databaseStore.getDatabase()?.run(`
      INSERT INTO weight (timestamp, weight) VALUES ('2021-03-18 11:42:55', 88);
    `);
    await databaseStore.getDatabase()?.run(`
      INSERT INTO weight (timestamp, weight) VALUES ('2021-06-17 18:42:55', 89.7);
    `);
    await databaseStore.getDatabase()?.run(`
      INSERT INTO weight (timestamp, weight) VALUES ('2021-09-16 11:42:55', 90);
    `);
    await databaseStore.getDatabase()?.run(`
      INSERT INTO weight (timestamp, weight) VALUES ('2021-12-15 18:42:55', 95);
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
