<template>
  <ion-page style="height: calc(100vh - 100px)">
    <ion-backdrop v-if="popOverShow"></ion-backdrop>
    <color-picker
      v-if="popOverShow"
      id="box"
      @close="popOverShow = false"
      @color="setWorkoutColor($event)"
      @wheel.prevent
      @touchmove.prevent
      @scroll.prevent />
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Workouts</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Workouts</ion-title>
          <ion-icon
            :icon="addCircleOutline"
            slot="end"
            class="newWorkoutIcon"
            @click="router.push(`/workouttemplate/New Workout`)"></ion-icon>
        </ion-toolbar>
      </ion-header>

      <ion-grid class="ion-margin-bottom">
        <ion-row>
          <ion-col size="4" size-md="3">
            <ion-card color="primary">
              <ion-card-header>
                <ion-card-subtitle>Active Workouts</ion-card-subtitle>
                <ion-card-title
                  >{{ amountOfActiveWorkouts }} /
                  {{ amountOfAvailaibleActiveWorkouts }}</ion-card-title
                >
              </ion-card-header>
            </ion-card>
          </ion-col>
          <ion-col size="8" size-md="3">
            <ion-card
              color="primary"
              @click="router.push('/plans')"
              v-if="activePlan">
              <ion-card-header class="plan-card">
                <ion-card-subtitle>Active Plan</ion-card-subtitle>
                <ion-card-title
                  style="font-size: 22px"
                  :class="{ biggerFont: activePlan.length < 12 }">
                  {{
                    activePlan.length > 25
                      ? activePlan.slice(0, 25) + "..."
                      : activePlan
                  }}
                </ion-card-title>
                <ion-icon :icon="repeatOutline" class="plan-icon"></ion-icon>
              </ion-card-header>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-list v-if="showList">
        <ion-list-header>
          <ion-segment value="default" v-model="workoutDisplaySegment">
            <ion-segment-button value="active">
              <ion-label>Active</ion-label>
            </ion-segment-button>
            <ion-segment-button value="all">
              <ion-label>All</ion-label>
            </ion-segment-button>
          </ion-segment>
        </ion-list-header>
        <ion-item-sliding
          v-for="item in queryResults"
          :key="item.Name"
          ref="slidingItems">
          <ion-item @click="router.push(`/workouttemplate/${item.Name}`)">
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
          <ion-item-options side="start">
            <ion-item-option color="accent">
              <ion-button
                @click="handleWorkoutChange(item.active, item.Name)"
                color="transparent"
                id="colorpickerTrigger">
                <ion-icon
                  v-if="item.active && amountOfActiveWorkouts < 16"
                  slot="icon-only"
                  :icon="removeCircleOutline"
                  style="font-size: 36px"></ion-icon>
                <ion-icon
                  v-if="!item.active"
                  slot="icon-only"
                  :icon="addCircleOutline"
                  style="font-size: 36px"></ion-icon>
              </ion-button>
            </ion-item-option>
          </ion-item-options>
          <ion-item-options side="end">
            <ion-item-option color="danger">
              <ion-button
                @click="deleteWorkout(item.Name)"
                color="transparent"
                id="colorpickerTrigger">
                <ion-icon
                  slot="icon-only"
                  :icon="trashOutline"
                  style="font-size: 36px"></ion-icon>
              </ion-button>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { availableColors } from "@/datatypes/CalendarTypes";
import { useDatabaseStore } from "@/stores/databaseStore";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonItem,
  IonList,
  IonListHeader,
  IonChip,
  IonSegment,
  IonSegmentButton,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
  IonGrid,
  IonRow,
  IonCol,
  IonBackdrop,
} from "@ionic/vue";
import { computed, onBeforeMount, ref, watch } from "vue";
import {
  removeCircleOutline,
  addCircleOutline,
  repeatOutline,
  trashOutline,
} from "ionicons/icons";
import ColorPicker from "@/components/colorPicker.vue";
import { useRouter } from "vue-router";

import { useActiveWorkoutsStore } from "@/stores/activeWorkoutsStore";
import { store } from "@/stores/IonicStorage";

const queryResults = ref<any>(null);
const databaseStore = useDatabaseStore();
const activeWorkoutsStore = useActiveWorkoutsStore();

const workoutDisplaySegment = ref<string>("all");
const slidingItems = ref<any>();
const showList = ref<boolean>(true);
const popOverShow = ref<any>(null);
let itemNameUpdate: String;

const router = useRouter();

const activePlan = ref<string>("");

const loadWorkouts = async () => {
  let query = "";
  if (workoutDisplaySegment.value === "active") {
    query = `SELECT * FROM WorkoutTemplate WHERE active = 1`;
  } else {
    query = `SELECT * FROM WorkoutTemplate`;
  }

  const resp = await databaseStore.getDatabase()?.query(query);
  queryResults.value = [];
  queryResults.value = resp?.values || [];

  filterQueryResults();
};

const filterQueryResults = () => {
  if (queryResults.value && queryResults.value.length > 0) {
    // Sortieren Sie die Ergebnisse basierend auf 'active' (1 zuerst)
    let sortedQueryResults = [...queryResults.value].sort((a: any, b: any) => {
      if (a.active === 1 && b.active === 0) return -1;
      if (a.active === 0 && b.active === 1) return 1;
      return 0;
    });
    queryResults.value = sortedQueryResults;
  }
};

onBeforeMount(async () => {
  workoutDisplaySegment.value = "active";
  activePlan.value = (await store.get("Active Plan")) || "No Plan";
  console.log(activePlan.value);
});

watch(workoutDisplaySegment, async (newValue) => {
  let query = "";
  if (newValue === "active") {
    query = `SELECT * FROM WorkoutTemplate WHERE active = 1`;
  } else {
    query = `SELECT * FROM WorkoutTemplate`;
  }
  const resp = await databaseStore.getDatabase()?.query(query);
  queryResults.value = resp?.values || [];
  filterQueryResults();
});

const amountOfActiveWorkouts = computed(() => {
  if (queryResults.value && queryResults.value.length > 0) {
    const amount = queryResults.value.filter(
      (item: any) => item.active === 1
    ).length;
    activeWorkoutsStore?.setActiveWorkouts(amount);
    return amount;
  }
  if (activeWorkoutsStore) activeWorkoutsStore.setActiveWorkouts(0);
  return 0;
});

// Infrastructure for possible color adding lateron
const amountOfAvailaibleActiveWorkouts = computed(() => {
  return Object.keys(availableColors).length;
});

const handleWorkoutChange = (itemActive: Boolean, itemName: String) => {
  // console.log(slidingItems.value.$el);
  // slidingItems.value.$el.close();
  const body = document.querySelector("body");
  body ? (body.style.overflow = "hidden") : alert("No Body");
  itemNameUpdate = itemName;

  popOverShow.value = true;
  activePlan.value = "No Plan";
  store.set("Active Plan", "No Plan");

  if (itemActive) {
    const query = `UPDATE WorkoutTemplate SET active = ${
      itemActive ? 0 : 1
    } WHERE Name = '${itemName}';`;
    databaseStore.getDatabase()?.execute(query);
    popOverShow.value = false;
    loadWorkouts();

    // Reset List in Dom for closing all slides (little timeout needed)
    showList.value = false;
    setTimeout(() => {
      showList.value = true;
    }, 0.01);
  }
};

const setWorkoutColor = (event: any) => {
  const query = `UPDATE WorkoutTemplate SET active = 1, Color = '${event.toLowerCase()}' WHERE Name = '${itemNameUpdate}';`;
  console.log(query);
  databaseStore.getDatabase()?.execute(query);

  popOverShow.value = false;
  loadWorkouts();
  // Reset List in Dom for closing all slides (little timeout needed)
  showList.value = false;
  setTimeout(() => {
    showList.value = true;
  }, 0.01);
};

const deleteWorkout = (name: String) => {
  // First delete all exercises from WorkoutList
  const query1 = `DELETE FROM WorkoutList WHERE workoutPlan = '${name}';`;
  console.log(query1);
  databaseStore.getDatabase()?.execute(query1);

  const query2 = `DELETE FROM WorkoutTemplate WHERE Name = '${name}';`;
  console.log(query2);
  databaseStore.getDatabase()?.execute(query2);

  loadWorkouts();
  // Reset List in Dom for closing all slides (little timeout needed)
  showList.value = false;
  setTimeout(() => {
    showList.value = true;
  }, 0.01);
};
</script>

<style scoped>
ion-card {
  height: 100px;
}

ion-card-subtitle {
  font-size: 10px;
}

ion-card-title {
  min-height: 40px;
}

.biggerFont {
  font-size: 28px !important;
}

.noscroll {
  overflow: hidden !important;
  height: 80vh;
}

.plan-card {
  position: relative;
}
.plan-icon {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 30px;
  margin: 5px 5px 0 0;
  /* color: var(--ion-color-medium-shade); */
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

.newWorkoutIcon {
  font-size: 36px;
  margin-right: 10px;
}
</style>
