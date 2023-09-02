<template>
  <ion-page style="height: calc(100vh - 100px)">
    <ion-header :translucent="true" color="light">
      <ion-toolbar>
        <ion-title color="primary-contrast">Weight</ion-title>
        <div class="back-icon">
          <ion-icon
            :icon="chevronBack"
            @click="router.go(-1)"
            size="large"
            color="primary"></ion-icon>
          <ion-label @click="router.go(-1)" color="primary">Back</ion-label>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar class="header-toolbar">
          <div class="back-icon">
            <ion-title size="large">Weight</ion-title>
          </div>
        </ion-toolbar>
      </ion-header>

      <div class="input-container">
        <div class="numberwrapper">
          <ion-button @click="decreaseWeight" color="transparent">-</ion-button>
          <ion-input
            type="number"
            :value="latestWeight !== null ? latestWeight.toString() : ''"
            @input="handleWeightInput"
            :style="{ width: inputWidth }"></ion-input>
          <ion-button @click="increaseWeight" color="transparent">+</ion-button>
        </div>
        <ion-button @click="addWeightEntry" class="addButton">ADD</ion-button>
      </div>

      <ion-segment
        color="primary"
        value="week"
        @ion-change="TimeSegmentChanged($event)"
        v-model="timeSegment"
        style="margin-bottom: 15px">
        <ion-segment-button value="week">
          <ion-label>Week</ion-label>
        </ion-segment-button>
        <ion-segment-button value="month">
          <ion-label>Month</ion-label>
        </ion-segment-button>
        <ion-segment-button value="halfyear">
          <ion-label>6 Months</ion-label>
        </ion-segment-button>
        <ion-segment-button value="year">
          <ion-label>Year</ion-label>
        </ion-segment-button>
        <ion-segment-button value="complete">
          <ion-label>Complete</ion-label>
        </ion-segment-button>
      </ion-segment>

      <Diagram :weights="queryResults" v-if="queryResults" ref="diagram" />

      <ion-list class="fixed-height-list">
        <ion-list-header>
          <ion-label>Date</ion-label>
          <ion-label>Weight</ion-label>
        </ion-list-header>

        <ion-item-sliding v-for="item in queryResults" :key="item.timestamp">
          <ion-item>
            <ion-label>{{
              new Date(item.timestamp).toLocaleString()
            }}</ion-label>
            <ion-label>{{ item.weight }}</ion-label>
          </ion-item>
          <ion-item-options>
            <ion-item-option color="danger">
              <ion-button
                @click="deleteWeightEntry(item.timestamp)"
                color="transparent">
                <ion-icon slot="icon-only" :icon="trash"></ion-icon>
              </ion-button>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButton,
  IonInput,
  IonLabel,
  IonItem,
  IonList,
  IonListHeader,
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
  IonSegment,
  IonSegmentButton,
} from "@ionic/vue";
import { chevronBack } from "ionicons/icons";
import { onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import { useDatabaseStore } from "../stores/databaseStore";
import { trash } from "ionicons/icons";
import Diagram from "../components/Diagram.vue";
import WeightRecord from "../datatypes/weight";

const router = useRouter();
const queryResults = ref<any>(null);
const databaseStore = useDatabaseStore();
let latestWeight = ref<number>(0);
const inputWidth = ref<string>("5rem");

const diagram = ref<any>(null);
const timeSegment = ref<string>("week");

const loadWeight = async () => {
  let timeFilter = "";

  if (timeSegment.value === "week") {
    timeFilter = "timestamp >= datetime('now', '-7 days')";
  } else if (timeSegment.value === "month") {
    timeFilter = "timestamp >= datetime('now', '-30 days')";
  } else if (timeSegment.value === "halfyear") {
    timeFilter = "timestamp >= datetime('now', '-180 days')";
  } else if (timeSegment.value === "year") {
    timeFilter = "timestamp >= datetime('now', '-365 days')";
  }

  const query = `SELECT * FROM weight ${
    timeFilter ? `WHERE ${timeFilter}` : ""
  }`;

  const resp = await databaseStore.getDatabase()?.query(query);
  queryResults.value = resp?.values || [];

  queryResults.value.sort(
    (
      a: { timestamp: string | number | Date },
      b: { timestamp: string | number | Date }
    ) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
};

onBeforeMount(async () => {
  await loadWeight();
  if (queryResults.value && queryResults.value.length > 0) {
    queryResults.value.sort((a: any, b: any) => b.id > a.id);
    queryResults.value.sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    latestWeight.value = queryResults.value[0].weight || 0;
  }
});

const calculateWidth = () => {
  let width = latestWeight.value.toString().length * 1.2;
  console.log(width);
  inputWidth.value = `${width}rem`;
};

const decreaseWeight = () => {
  if (latestWeight.value !== null) {
    latestWeight.value = roundToDecimal(latestWeight.value - 0.1, 1);
    calculateWidth();
  }
};

const increaseWeight = () => {
  if (latestWeight.value !== null) {
    latestWeight.value = roundToDecimal(latestWeight.value + 0.1, 1);
    calculateWidth();
  }
};

const handleWeightInput = (event: InputEvent) => {
  const inputValue = (event.target as HTMLInputElement).value;
  latestWeight.value = inputValue === "" ? 0 : parseFloat(inputValue);
  calculateWidth();
};

const roundToDecimal = (value: number, decimalPlaces: number): number => {
  const multiplier = Math.pow(10, decimalPlaces);
  return Math.round(value * multiplier) / multiplier;
};

const addWeightEntry = async () => {
  if (latestWeight.value !== null) {
    const formattedDate = formatDate(new Date());

    const newWeightEntry: WeightRecord = {
      timestamp: formattedDate,
      weight: latestWeight.value,
    };
    queryResults.value.unshift(newWeightEntry);

    queryResults.value.sort(
      (a: WeightRecord, b: WeightRecord) =>
        new Date(a.timestamp).getTime() < new Date(b.timestamp).getTime()
    );

    try {
      await databaseStore
        .getDatabase()
        ?.run(`INSERT INTO weight (weight) VALUES (${latestWeight.value});`);
    } catch (error) {
      alert("ERROR inserting in DB " + JSON.stringify(error));
    }
  }
};

const deleteWeightEntry = async (timestamp: string) => {
  const index = queryResults.value.findIndex(
    (item: any) => item.timestamp === timestamp
  );
  if (index > -1) {
    queryResults.value.splice(index, 1);
  }

  // Hier löschst du den Eintrag auch aus der SQLite-Datenbank
  try {
    await databaseStore
      .getDatabase()
      ?.run(`DELETE FROM weight WHERE timestamp = '${timestamp}';`);
  } catch (error) {
    alert("ERROR deleting from DB " + JSON.stringify(error));
  }
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const TimeSegmentChanged = (event: CustomEvent) => {
  loadWeight();
};
</script>

<style scoped>
.back-icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}

ion-card-title {
  font-size: 2.5rem;
  text-transform: uppercase;
  font-weight: 900;
  margin-top: -0.5rem;
}
ion-card-header {
  padding-block: 1rem 0.5rem;
  gap: none;
}

.fixed-height-list {
  /* height: 40%; */
  overflow-y: scroll;
  width: calc(100% - 1rem);
}

.input-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-block: 20px 35px;
  margin-inline: auto;
  width: 200px;
  aspect-ratio: 1/1;
  background-color: var(--ion-color-dark-shade);
  border-radius: 100%;
  border: 5px solid var(--ion-color-primary);
  -webkit-box-shadow: -10px 0px 13px -7px #000000, 10px 0px 13px -7px #000000,
    5px 6px 33px 4px rgba(0, 0, 0, 0.33);
  box-shadow: -10px 0px 13px -7px #000000, 10px 0px 13px -7px #000000,
    5px 6px 33px 4px rgba(0, 0, 0, 0.33);
}

.numberwrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 50px !important;
  margin-top: 15px;
}

.input-container ion-input {
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-inline: 5px;
  font-family: monospace;
  text-align: center;
}

.input-container ion-button {
  font-size: 2rem;
  color: var(--ion-color-primary);
  width: 1rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.addButton {
  color: var(--ion-color-primary-contrast) !important;
  font-size: 1rem !important;
  width: 5rem !important;
}

ion-card canvas {
  height: 100%;
}

ion-segment-button::part(indicator-background) {
  background: var(--ion-color-primary);
}

/* Material Design styles */
ion-segment-button.md::part(native),
ion-segment-button.ios::part(native) {
  color: white;
}

.segment-button-checked.md::part(native),
.segment-button-checked.ios::part(native) {
  color: var(--ion-color-primary-contrast);
}

ion-segment-button.md::part(indicator-background) {
  height: 4px;
}
ion-segment-button.ios::part(indicator-background) {
  border-radius: 20px;
}
</style>
