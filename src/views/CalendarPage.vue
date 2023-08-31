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
          presentation="date"
          :multiple="true"
          :highlighted-dates="highlightedDates"
          @ionChange="onDateChange"
          ref="datetime">
          <ion-buttons slot="buttons">
            <ion-button color="danger" @click="reset()">Reset</ion-button>
            <ion-button color="primary" @click="confirm()">Add</ion-button>
            <ion-button color="primary" @click="removeSelected()"
              >Remove</ion-button
            >
          </ion-buttons>
        </ion-datetime>
        <ion-button fill="clear">
          <ion-icon name="add"></ion-icon>
        </ion-button>
      </div>
    </ion-content>
  </ion-page>

  <!-- <base-layout pageTitle="Calendar">
      <ion-button color="primary" router-link="/home">Home</ion-button>
      In Calendar
      </base-layout>  -->
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
} from "@ionic/vue";
import { ref } from "vue";
import { DatetimeCustomEvent } from "@ionic/core";

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

  if (operation == "removeSelected") {
    // Get the selected dates from datepick.value
    const selectedDates = datepick.value;

    if (typeof selectedDates === "string") {
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

    datetime.value.$el.removeSelected();
  } else if (operation === "confirm") {
    // Get the selected dates from datepick.value
    const selectedDates = datepick.value;

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
  }

  alert(` ${operation} workouts at ` + event.detail.value);
};
</script>

<style scoped>
#container {
  --giants-orange: #f46036ff;
  --space-cadet: #2e294eff;
  --persian-green: #1b998bff;
  --red-pantone: #e71d36ff;
  --mindaro: #c5d86dff;

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
</style>
