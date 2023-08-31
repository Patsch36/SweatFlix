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

      <div id="container">
        <ion-datetime
          style="margin-top: 15vh"
          presentation="date"
          :multiple="true"
          :highlighted-dates="highlightedDates"
          @ionChange="onDateChange"
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
          <ion-chip
            v-for="color in availableColors"
            :key="color.color"
            :style="{
              color: color.color,
              backgroundColor: color.background,
            }">
            {{ color.name }}</ion-chip
          >
        </div>
      </div>
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
} from "@ionic/vue";
import { ref } from "vue";
import { DatetimeCustomEvent } from "@ionic/core";
import { refresh, add, trashOutline } from "ionicons/icons";

const highlightedDates = [
  {
    date: "2023-08-05",
    textColor: "var(--rose-color)",
    backgroundColor: "var(--rose-background)",
  },
  {
    date: "2023-08-10",
    textColor: "var(--mint-color)",
    backgroundColor: "var(--mint-background)",
  },
  {
    date: "2023-08-20",
    textColor: "var(--orange-color)",
    backgroundColor: "var(--orange-background)",
  },
  {
    date: "2023-08-23",
    textColor: "var(--mindaro-color)",
    backgroundColor: "var(--mindaro-background)",
  },
  {
    date: "2023-08-25",
    textColor: "var(--violet-color)",
    backgroundColor: "var(--violet-background)",
  },
  {
    date: "2023-08-30",
    textColor: "var(--turquoise-color)",
    backgroundColor: "var(--turquoise-background)",
  },
  {
    date: "2023-08-14",
    textColor: "var(--cerulean-color)",
    backgroundColor: "var(--cerulean-background)",
  },
  {
    date: "2023-08-15",
    textColor: "var(--navy-color)",
    backgroundColor: "var(--navy-background)",
  },
];

const datepick = ref<string | string[] | null | undefined>(["2023-08-05"]);
let operation = "";

const availableColors = {
  rose: {
    name: "Rose",
    color: "var(--rose-color)",
    background: "var(--rose-background)",
  },
  mint: {
    name: "Mint",
    color: "var(--mint-color)",
    background: "var(--mint-background)",
  },
  violet: {
    name: "Violet",
    color: "var(--violet-color)",
    background: "var(--violet-background)",
  },
  mindaro: {
    name: "Mindaro",
    color: "var(--mindaro-color)",
    background: "var(--mindaro-background)",
  },
  turquoise: {
    name: "Turquoise",
    color: "var(--turquoise-color)",
    background: "var(--turquoise-background)",
  },
  orange: {
    name: "Orange",
    color: "var(--orange-color)",
    background: "var(--orange-background)",
  },
  cerulean: {
    name: "Cerulean",
    color: "var(--cerulean-color)",
    background: "var(--cerulean-background)",
  },
  navy: {
    name: "Navy",
    color: "var(--navy-color)",
    background: "var(--navy-background)",
  },
};

const datetime = ref();
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
  else if (operation === "confirm") addValues();

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

const addValues = () => {
  // Get the selected dates from datepick.value
  const selectedDates = datepick.value;

  if (typeof selectedDates === "string" || !selectedDates) {
    return;
  }

  if (typeof selectedDates === "string") {
    return;
  }

  // Add selected dates to the highlightedDates array
  selectedDates.forEach((selectedDate) => {
    const indexToAdd = highlightedDates.findIndex(
      (dateObj) => dateObj.date === selectedDate
    );
    if (indexToAdd === -1) {
      highlightedDates.push({
        date: selectedDate,
        textColor: "var(--giants-orange)",
        backgroundColor: "var(--space-cadet)",
      });
    }
  });
};
</script>

<style scoped>
#container {
  /* --giants-orange: #f46036ff;
  --space-cadet: #2e294eff;
  --persian-green: #1b998bff;
  --red-pantone: #e71d36ff;
  --mindaro: #c5d86dff; */

  --rose-color: #800080;
  --rose-background: #ffc0cb;
  --mint-color: #09721b;
  --mint-background: #c8e5d0;
  --violet-color: rgb(68, 10, 184);
  --violet-background: rgb(211, 200, 229);
  --mindaro-color: rgb(65, 72, 36);
  --mindaro-background: #c5d86dff;
  --turquoise-color: #0e4b44;
  --turquoise-background: #c1e8e8;
  --orange-color: #ff6600;
  --orange-background: #ffdab3;
  --cerulean-color: #001f3f;
  --cerulean-background: #a4ddff;
  --navy-color: #90026f;
  --navy-background: #fab7eb;

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
