<template>
  <ion-page style="height: calc(100vh - 100px)">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Workouts</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" style="margin-top: 500px">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Workouts</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-list>
        <ion-list-header>
          <ion-label>Name</ion-label>
        </ion-list-header>
        <ion-item v-for="item in queryResults" :key="item.ID">
          <ion-label>
            <div class="item-content">
              <div class="chip-container">
                <ion-chip
                  v-if="item.active"
                  :style="{
                    color: `var(--${item.Color}-color)`,
                    backgroundColor: `var(--${item.Color}-background`,
                    height: '15px',
                    width: '15px',
                  }" />
                <p class="item-name">{{ item.Name }}</p>
              </div>
              <p class="description">
                {{ item.Split }}
              </p>
            </div>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useDatabaseStore } from "@/stores/databaseStore";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonLabel,
  IonItem,
  IonList,
  IonListHeader,
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
  IonSegment,
  IonSegmentButton,
  IonChip,
} from "@ionic/vue";
import { onBeforeMount, ref } from "vue";

const queryResults = ref<any>(null);
const databaseStore = useDatabaseStore();

const loadWorkouts = async () => {
  const query = `SELECT * FROM WorkoutTemplate`;

  const resp = await databaseStore.getDatabase()?.query(query);
  queryResults.value = resp?.values || [];
};

onBeforeMount(async () => {
  await loadWorkouts();
  if (queryResults.value && queryResults.value.length > 0) {
    // Sortieren Sie die Ergebnisse basierend auf 'active' (1 zuerst)
    let sortedQueryResults = [...queryResults.value].sort((a: any, b: any) => {
      if (a.active === 1 && b.active === 0) return -1;
      if (a.active === 0 && b.active === 1) return 1;
      return 0;
    });
    queryResults.value = sortedQueryResults;
  }
});
</script>

<style scoped>
#container {
  text-align: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;

  color: #8c8c8c;

  margin: 0;
}

#container a {
  text-decoration: none;
}

/* Style for the description tag */
.description {
  font-size: smaller;
  color: var(--ion-color-medium-shade) !important;
  white-space: normal;
}

/* Style for the name */
.item-name {
  color: var(--ion-color-light-tint) !important;
}

/* Style for the container */
.item-content {
  display: flex;
  flex-direction: column;
}

.chip-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 5px;
}
</style>
