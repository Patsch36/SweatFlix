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
    await databaseStore.getDatabase()?.run(`DROP TABLE WorkoutTemplate;`);
    await databaseStore.getDatabase()?.run(`CREATE TABLE WorkoutTemplate (
    Name TEXT PRIMARY KEY,
    MuscleGroup INTEGER,
    PlanID INTEGER,
    Split TEXT,
    Description TEXT,
    Color TEXT,
    active INTEGER,
    FOREIGN KEY (MuscleGroup) REFERENCES MuscleGroup(ID),
    FOREIGN KEY (PlanID) REFERENCES Plan(ID)
);`);

    // await databaseStore.getDatabase()?.run(`DROP TABLE weight;`);
  } catch (e) {
    alert("ERROR initializing DB " + JSON.stringify(e));
  }
};

const insertTestWeight = async () => {
  try {
    await databaseStore.getDatabase()?.run(`
    INSERT INTO WorkoutTemplate (Name, MuscleGroup, PlanID, Split, Description, Color, active)
VALUES 
    ('Chest-Code Workout', 1, 4, 'Chest', 'A chest workout that will help you debug your upper body.', 'navy', 1),
    ('Back-End Workout', 4, 4, 'Back', 'A back workout that will strengthen your back-end.', 'lime', 1),
    ('Arm-Assembly Workout', 8, 4, 'Arms', 'An arm workout that will help you assemble stronger arms.', 'cerulean', 1),
    ('Leg-acy Code Workout', 15, 4, 'Legs', 'A leg workout that will help you maintain your leg-acy code.', 'coral', 1);
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
