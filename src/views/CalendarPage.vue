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
        v-if="showDatetime"
        :first-day-of-week="settingsStore.firstDayOfWeek"
        style="margin-top: 25px"
        presentation="date"
        :highlighted-dates="highlightedDates"
        @ionChange="onDateChange"
        ref="datetime"
        :key="componentKey">
        <ion-buttons slot="buttons">
          <ion-button color="danger" @click="removeSelected">
            <ion-icon :icon="trashOutline"></ion-icon>
          </ion-button>
          <ion-button @click="openAddModal()">
            <ion-icon :icon="add"></ion-icon>
            <ion-label>Add</ion-label>
          </ion-button>
          <ion-button @click="reset">
            <ion-icon :icon="refresh"></ion-icon>
            <ion-label>Reset</ion-label>
          </ion-button>
          <ion-button @click="route">
            <ion-icon :icon="informationCircleOutline"></ion-icon>
            <ion-label>Info</ion-label>
          </ion-button>
        </ion-buttons>
      </ion-datetime>

      <div style="margin-top: 5vh">
        <ion-chip
          v-for="workout in queryResults"
          :key="workout.Name"
          @click="router.push(`/workouttemplate/${workout.Name}`)"
          :style="{
            color: `var(--${workout.Color}-color)`,
            backgroundColor: `var(--${workout.Color}-background)`,
          }">
          {{ workout.Name }}
        </ion-chip>
      </div>
      <add-workout-modal
        @datetimeUpdate="
          loadWorkouts();
          loadDates();
        ">
      </add-workout-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonDatetime,
  IonButton,
  IonChip,
  IonPage,
  IonContent,
  IonLabel,
  IonButtons,
  IonToolbar,
  IonTitle,
  IonHeader,
  IonIcon,
} from "@ionic/vue";
import { ref, onBeforeMount, watch } from "vue";
import { DatetimeCustomEvent } from "@ionic/core";
import {
  refresh,
  add,
  trashOutline,
  informationCircleOutline,
} from "ionicons/icons";
import { DateObj } from "@/datatypes/CalendarTypes";
import { useDatabaseStore } from "@/stores/databaseStore";
import { useRouter } from "vue-router";
import { useSettingsStore } from "@/stores/settingsStore";
import AddWorkoutModal from "@/components/addWorkoutModal.vue";
import { useStateStore } from "@/stores/stateStore";
import { useSelectedDateStore } from "@/stores/selectedDateStore";

const router = useRouter();
const settingsStore = useSettingsStore();
const stateStore = useStateStore();
const selectedDateStore = useSelectedDateStore();

const highlightedDates: DateObj[] = [];
let operation = "";
const datetime = ref();
const modalOpen = ref(false);
const queryResults = ref<any>(null);
const queryDatesResult = ref<any>(null);
const databaseStore = useDatabaseStore();

const showDatetime = ref(false);

const workout = ref();
const sets = ref(0);

const exercises = ref();
const showExercises = ref(false);

let componentKey = ref(0);

watch(
  workout,
  async () => {
    if (!workout.value) return [];
    const result = await databaseStore
      .getDatabase()
      ?.query(
        `SELECT * FROM WorkoutList WHERE WorkoutPlan = '${workout.value}'`
      );

    exercises.value = result?.values || [];
    showExercises.value = true;

    sets.value = 0;
    exercises.value.forEach((exercise: any) => {
      sets.value += exercise.sets;
    });
  },
  { deep: true }
);

const loadWorkouts = async () => {
  const query = `SELECT Name, Split, Color, active FROM WorkoutTemplate WHERE active = 1`;
  const resp = await databaseStore.getDatabase()?.query(query);
  queryResults.value = resp?.values || [];
};

const loadDates = async () => {
  const query = `SELECT Workout.startdate, WorkoutTemplate.Color, WorkoutTemplate.active FROM Workout INNER JOIN WorkoutTemplate ON Workout.workoutname = WorkoutTemplate.Name`;

  try {
    const resp = await databaseStore.getDatabase()?.query(query);
    queryDatesResult.value = resp?.values || [];
  } catch (error) {
    alert("ERROR loading dates from DB " + JSON.stringify(error));
  }

  queryDatesResult.value.forEach(
    (workout: { startdate: string; Color: string; active: number }) => {
      const date = workout.startdate.slice(0, 10);
      if (!highlightedDates.some((dateObj) => dateObj.date === date)) {
        if (workout.active) {
          highlightedDates.push({
            date,
            textColor: `var(--${workout.Color}-color)`,
            backgroundColor: `var(--${workout.Color}-background)`,
          });
        } else {
          highlightedDates.push({
            date,
            textColor: `var(--gray-color)`,
            backgroundColor: `var(--gray-background)`,
          });
        }
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
  showDatetime.value = true;
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

const route = () => {
  operation = "";
  datetime.value.$el.confirm();
  if (
    highlightedDates.some(
      (date) => date.date === selectedDateStore.getDate().slice(0, 10)
    )
  )
    router.push(`/workoutdetails/${selectedDateStore.getDate().slice(0, 10)}`);
  else alert("No workout on this date");
  selectedDateStore.setDate("");
};

const onDateChange = (event: DatetimeCustomEvent) => {
  if (typeof event.detail.value !== "string") {
    return;
  }
  selectedDateStore.setDate(event.detail.value);
  if (
    selectedDateStore.getDate() === null ||
    selectedDateStore.getDate() === undefined
  ) {
    selectedDateStore.setDate("");
    alert(JSON.stringify(event));
  }

  if (operation == "removeSelected") removeValues();
  else if (operation === "confirm") modalOpen.value = true;

  datetime.value.$forceUpdate();
  reset();
};

const removeValues = async () => {
  datetime.value.$el.confirm();
  const selectedDate = selectedDateStore.getDate();
  selectedDateStore.setDate("");
  console.log(selectedDate);
  operation = "";

  // selectedDates.forEach(async (selectedDate) => {
  const indexToRemove = highlightedDates.findIndex(
    (dateObj) => dateObj.date === selectedDate.slice(0, 10)
  );
  if (indexToRemove !== -1) {
    highlightedDates.splice(indexToRemove, 1);

    // Remove all exercises from WorkoutExercise where workout = selectedDate
    try {
      await databaseStore
        .getDatabase()
        ?.query(
          `DELETE FROM WorkoutExercise WHERE DATE(workout) = DATE('${selectedDate}')`
        );
    } catch (error) {
      alert("ERROR deleting in DB " + JSON.stringify(error));
    }

    console.log("DELETE FROM Workout WHERE DATE(startdate) = ", selectedDate);

    try {
      await databaseStore
        .getDatabase()
        ?.query(
          `DELETE FROM Workout WHERE DATE(startdate) = DATE('${selectedDate}')`
        );
    } catch (error) {
      alert("ERROR deleting in DB " + JSON.stringify(error));
    }
  }
  // });
};

const openAddModal = () => {
  datetime.value.$el.confirm();
  if (selectedDateStore.getDate() !== "") {
    stateStore.setShowAddWorkoutModal(true);
  } else {
    alert("Please select a date first");
  }
};
</script>

<style scoped>
ion-icon {
  margin-right: 5px;
}
</style>
