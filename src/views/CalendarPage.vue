<template>
  <ion-page style="height: calc(100vh - 100px)">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Calendar</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Calendar</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-datetime
        style="margin-top: 25px"
        presentation="date"
        :multiple="true"
        :highlighted-dates="highlightedDates"
        @ionChange="onDateChange"
        v-if="highlightedDates.length > 0"
        ref="datetime">
        <ion-buttons slot="buttons">
          <ion-button color="danger" @click="reset">
            <ion-icon :icon="refresh"></ion-icon>
            <ion-label>Reset</ion-label>
          </ion-button>
          <ion-button @click="confirm">
            <ion-icon :icon="add"></ion-icon>
            <ion-label>Add</ion-label>
          </ion-button>
          <ion-button @click="removeSelected">
            <ion-icon :icon="trashOutline"></ion-icon>
            <ion-label>Remove</ion-label>
          </ion-button>
        </ion-buttons>
      </ion-datetime>

      <div style="margin-top: 5vh">
        <ion-chip
          v-for="workout in queryResults"
          :key="workout.Name"
          :style="{
            color: `var(--${workout.Color}-color)`,
            backgroundColor: `var(--${workout.Color}-background)`,
          }">
          {{ workout.Name }}
        </ion-chip>
      </div>

      <ion-modal ref="modal" :isOpen="modalOpen" @willDismiss="onWillDismiss">
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button @click="cancel()">Cancel</ion-button>
            </ion-buttons>
            <ion-title>Add Workout</ion-title>
            <ion-buttons slot="end">
              <ion-button :strong="true" @click="confirmModal()"
                >Confirm</ion-button
              >
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <h4>Selected Dates:</h4>
          <ul>
            <li v-for="item in datepick">
              {{ new Date(item).toLocaleDateString() }}
            </li>
          </ul>
          <ion-item>
            <ion-select
              label="Choose Workout"
              :interface-options="{
                header: 'Colors',
                subHeader: 'Select your favorite color',
              }"
              interface="action-sheet"
              placeholder="Select One"
              ref="input">
              <ion-select-option
                v-for="item in queryResults"
                key="item.Name"
                :value="item.Color"
                >{{ item.Name }}</ion-select-option
              >
            </ion-select>
          </ion-item>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonDatetime,
  IonButton,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonChip,
} from "@ionic/vue";
import { ref, onBeforeMount } from "vue";
import { DatetimeCustomEvent } from "@ionic/core";
import { refresh, add, trashOutline } from "ionicons/icons";
import { OverlayEventDetail } from "@ionic/core/components";
import { DateObj, ColorInfo, availableColors } from "@/datatypes/CalendarTypes";
import { useDatabaseStore } from "@/stores/databaseStore";

const highlightedDates: DateObj[] = [];
const datepick = ref<string | string[] | null | undefined>(["2023-08-05"]);
let operation = "";
const datetime = ref();
const modal = ref();
const modalOpen = ref(false);
const input = ref();
const queryResults = ref<any>(null);
const queryDatesResult = ref<any>(null);
const databaseStore = useDatabaseStore();

const loadWorkouts = async () => {
  const query = `SELECT Name, Split, Color, active FROM WorkoutTemplate WHERE active = 1`;
  const resp = await databaseStore.getDatabase()?.query(query);
  queryResults.value = resp?.values || [];
};

const loadDates = async () => {
  const query = `SELECT Workout.startdate, WorkoutTemplate.Color FROM Workout INNER JOIN WorkoutTemplate ON Workout.workoutname = WorkoutTemplate.Name`;
  const resp = await databaseStore.getDatabase()?.query(query);
  queryDatesResult.value = resp?.values || [];

  queryDatesResult.value.forEach(
    (workout: { startdate: string; Color: string }) => {
      const date = workout.startdate.slice(0, 10);
      if (!highlightedDates.some((dateObj) => dateObj.date === date)) {
        highlightedDates.push({
          date,
          textColor: `var(--${workout.Color}-color)`,
          backgroundColor: `var(--${workout.Color}-background)`,
        });
      }
    }
  );
};

onBeforeMount(async () => {
  await loadWorkouts();
  await loadDates();
  if (queryResults.value && queryResults.value.length > 0) {
    queryResults.value.reverse();
  }
});

const reset = () => datetime.value.$el.reset();

const confirm = () => {
  operation = "confirm";
  datetime.value.$el.confirm();
};

const removeSelected = () => {
  operation = "removeSelected";
  datetime.value.$el.confirm();
};

const onDateChange = (event: DatetimeCustomEvent) => {
  datepick.value = event.detail.value;
  if (datepick.value === null || datepick.value === undefined) {
    datepick.value = [];
  }

  if (operation == "removeSelected") removeValues();
  else if (operation === "confirm") modalOpen.value = true;

  datetime.value.$forceUpdate();
  reset();
};

const removeValues = () => {
  const selectedDates = datepick.value;

  if (typeof selectedDates === "string" || !selectedDates) {
    return;
  }

  selectedDates.forEach(async (selectedDate) => {
    const indexToRemove = highlightedDates.findIndex(
      (dateObj) => dateObj.date === selectedDate
    );
    if (indexToRemove !== -1) {
      highlightedDates.splice(indexToRemove, 1);

      try {
        await databaseStore
          .getDatabase()
          ?.query(
            `DELETE FROM Workout WHERE DATE(startdate) = '${selectedDate}'`
          );
      } catch (error) {
        alert("ERROR deleting in DB " + JSON.stringify(error));
      }
    }
  });
};

const addValues = async (category: string) => {
  const selectedDates = datepick.value;

  if (!selectedDates || typeof selectedDates === "string") {
    return;
  }

  const colorInfo: ColorInfo = availableColors[category];

  selectedDates.forEach(async (selectedDate: string) => {
    if (!highlightedDates.some((dateObj) => dateObj.date === selectedDate)) {
      highlightedDates.push({
        date: selectedDate,
        textColor: colorInfo.color,
        backgroundColor: colorInfo.background,
      });

      try {
        await databaseStore
          .getDatabase()
          ?.run(
            `INSERT INTO Workout (workoutname, startdate, enddate, note) SELECT Name, '${selectedDate}T06:30:00', '${selectedDate}T08:00:00', '' FROM WorkoutTemplate WHERE color = '${input.value.$el.value}' AND active = 1;`
          );
      } catch (error) {
        alert("ERROR inserting in DB " + JSON.stringify(error));
      }
    }
  });
};

const cancel = () => {
  modal.value.$el.dismiss(null, "cancel");
  modalOpen.value = false;
};

const confirmModal = () => {
  const color = input.value.$el.value;
  modal.value.$el.dismiss(name, "confirm");
  modalOpen.value = false;

  addValues(color);

  datetime.value.$forceUpdate();
  reset();
};

const onWillDismiss = (ev: CustomEvent<OverlayEventDetail>) => {
  if (ev.detail.role === "confirm") {
    // Handle modal confirmation
    // message.value = `Hello, ${ev.detail.data}!`;
  }
};
</script>

<style scoped>
ion-icon {
  margin-right: 5px;
}
</style>
