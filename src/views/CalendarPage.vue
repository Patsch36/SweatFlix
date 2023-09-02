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
          <ion-button color="danger" @click="reset()">
            <ion-icon :icon="refresh"></ion-icon>
            <ion-label>Reset</ion-label>
          </ion-button>
          <ion-button @click="confirm()">
            <ion-icon :icon="add"></ion-icon>
            <ion-label>Add</ion-label>
          </ion-button>
          <ion-button @click="removeSelected()">
            <ion-icon :icon="trashOutline"></ion-icon>
            <ion-label>Remove</ion-label>
          </ion-button>
        </ion-buttons>
      </ion-datetime>
      <div style="margin-top: 5vh">
        <!-- <ion-chip
          v-for="color in availableColors"
          :key="color.color"
          :style="{
            color: color.color,
            backgroundColor: color.background,
          }">
          {{ color.name }}</ion-chip -->
        <ion-chip
          v-for="workout in queryResults"
          :key="workout.Name"
          :style="{
            color: `var(--${workout.Color}-color)`,
            backgroundColor: `var(--${workout.Color}-background)`,
          }">
          {{ workout.Name }}</ion-chip
        >
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
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonDatetime,
  IonButton,
  IonButtons,
  IonChip,
  IonIcon,
  IonLabel,
  IonModal,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
} from "@ionic/vue";
import { onBeforeMount, ref } from "vue";
import { DatetimeCustomEvent } from "@ionic/core";
import { refresh, add, trashOutline } from "ionicons/icons";
import { OverlayEventDetail } from "@ionic/core/components";
import { DateObj, ColorInfo, availableColors } from "@/datatypes/CalendarTypes";
import { useDatabaseStore } from "@/stores/databaseStore";

const message = ref(
  "This modal example uses triggers to automatically open a modal when the button is clicked."
);
const modal = ref();

const modalOpen = ref(false);
const input = ref();

const highlightedDates: DateObj[] = [];

const datepick = ref<string | string[] | null | undefined>(["2023-08-05"]);
let operation = "";

const datetime = ref();

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
      if (
        !highlightedDates.some(
          (dateObj) => dateObj.date === workout.startdate.slice(0, 10)
        )
      ) {
        highlightedDates.push({
          date: workout.startdate.slice(0, 10),
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

const cancel = () => {
  modal.value.$el.dismiss(null, "cancel");
  modalOpen.value = false;
};

const confirmModal = () => {
  const color = input.value.$el.value;
  modal.value.$el.dismiss(name, "confirm");
  modalOpen.value = false;

  addValues(color);

  console.log(highlightedDates);
  datetime.value.$forceUpdate();
  reset();
};

const onWillDismiss = (ev: CustomEvent<OverlayEventDetail>) => {
  if (ev.detail.role === "confirm") {
    message.value = `Hello, ${ev.detail.data}!`;
  }
};

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
  else if (operation === "confirm") modalOpen.value = true; //addValues();

  console.log(highlightedDates);
  datetime.value.$forceUpdate();
  reset();
};

const removeValues = () => {
  // Get the selected dates from datepick.value
  const selectedDates = datepick.value;

  if (typeof selectedDates === "string" || !selectedDates) {
    return;
  }

  // Remove selected dates from the highlightedDates array
  selectedDates.forEach((selectedDate) => {
    const indexToRemove = highlightedDates.findIndex(
      (dateObj) => dateObj.date === selectedDate
    );
    if (indexToRemove !== -1) {
      highlightedDates.splice(indexToRemove, 1);
    }
  });
};

const addValues = (category: string) => {
  const selectedDates = datepick.value;

  if (!selectedDates || typeof selectedDates === "string") {
    return;
  }

  // translate category to color
  // let color = "";
  // switch (category) {
  //   case "pull":
  //     color = "rose";
  //     break;
  //   case "push":
  //     color = "mint";
  //     break;
  //   case "leg":
  //     color = "violet";
  //     break;
  //   case "core":
  //     color = "mindaro";
  //     break;
  //   case "arms":
  //     color = "turquoise";
  //     break;
  //   case "cardio":
  //     color = "orange";
  //     break;
  //   default:
  //     color = "cerulean";
  //     break;
  // }

  const colorInfo: ColorInfo = availableColors[category];

  selectedDates.forEach((selectedDate: string) => {
    if (!highlightedDates.some((dateObj) => dateObj.date === selectedDate)) {
      highlightedDates.push({
        date: selectedDate,
        textColor: colorInfo.color,
        backgroundColor: colorInfo.background,
      });
    }
  });
};
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
ion-icon {
  margin-right: 5px;
}
</style>
