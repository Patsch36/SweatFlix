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
              <ion-select-option value="pull">Push</ion-select-option>
              <ion-select-option value="push">Pull</ion-select-option>
              <ion-select-option value="leg">Leg</ion-select-option>
              <ion-select-option value="core">Core</ion-select-option>
              <ion-select-option value="arms">Arms</ion-select-option>
              <ion-select-option value="cardio">Cardio</ion-select-option>
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
import { ref } from "vue";
import { DatetimeCustomEvent } from "@ionic/core";
import { refresh, add, trashOutline } from "ionicons/icons";
import { OverlayEventDetail } from "@ionic/core/components";
import { DateObj, ColorInfo } from "@/datatypes/CalendarTypes";

const message = ref(
  "This modal example uses triggers to automatically open a modal when the button is clicked."
);
const modal = ref();

const modalOpen = ref(false);
const input = ref();

const cancel = () => {
  modal.value.$el.dismiss(null, "cancel");
  modalOpen.value = false;
};

const confirmModal = () => {
  const name = input.value.$el.value;
  modal.value.$el.dismiss(name, "confirm");
  modalOpen.value = false;

  addValues(name);

  console.log(highlightedDates);
  datetime.value.$forceUpdate();
  reset();
};

const onWillDismiss = (ev: CustomEvent<OverlayEventDetail>) => {
  if (ev.detail.role === "confirm") {
    message.value = `Hello, ${ev.detail.data}!`;
  }
};

const highlightedDates: DateObj[] = [
  {
    date: "2021-08-05",
    textColor: "var(--rose-color)",
    backgroundColor: "var(--rose-background)",
  },
];

const datepick = ref<string | string[] | null | undefined>(["2023-08-05"]);
let operation = "";

const availableColors: Record<string, ColorInfo> = {
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
  indigo: {
    name: "Indigo",
    color: "var(--indigo-color)",
    background: "var(--indigo-background)",
  },
  gold: {
    name: "Gold",
    color: "var(--gold-color)",
    background: "var(--gold-background)",
  },
  teal: {
    name: "Teal",
    color: "var(--teal-color)",
    background: "var(--teal-background)",
  },
  maroon: {
    name: "Maroon",
    color: "var(--maroon-color)",
    background: "var(--maroon-background)",
  },
  lime: {
    name: "Lime",
    color: "var(--lime-color)",
    background: "var(--lime-background)",
  },
  aubergine: {
    name: "Aubergine",
    color: "var(--aubergine-color)",
    background: "var(--aubergine-background)",
  },
  coral: {
    name: "Coral",
    color: "var(--coral-color)",
    background: "var(--coral-background)",
  },
  olive: {
    name: "Olive",
    color: "var(--olive-color)",
    background: "var(--olive-background)",
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
  let color = "";
  switch (category) {
    case "pull":
      color = "rose";
      break;
    case "push":
      color = "mint";
      break;
    case "leg":
      color = "violet";
      break;
    case "core":
      color = "mindaro";
      break;
    case "arms":
      color = "turquoise";
      break;
    case "cardio":
      color = "orange";
      break;
    default:
      color = "cerulean";
      break;
  }

  const colorInfo: ColorInfo = availableColors[color];

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
