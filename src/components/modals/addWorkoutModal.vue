<template>
  <ion-modal ref="modal" :isOpen="modalOpen">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="stateStore.setShowAddWorkoutModal(false)">
            Cancel
          </ion-button>
        </ion-buttons>
        <ion-title>Add Workout</ion-title>
        <ion-buttons slot="end">
          <ion-button
            :strong="true"
            @click="confirmModal()"
            :disabled="
              SetResults.length !== sets ||
              SetResults.some((elem) => {
                return !('weight' in elem && 'reps' in elem);
              })
            ">
            Confirm</ion-button
          >
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <h4>Selected Dates:</h4>
      <p>{{ new Date(selectedDateStore.getDate()).toLocaleString() }}</p>
      <ion-item>
        <ion-select
          label="Choose Workout"
          :interface-options="{
            header: 'Workouts',
            subHeader: 'Select your workout',
          }"
          interface="action-sheet"
          class="my-custom-class"
          placeholder="Select One"
          ref="input"
          v-model="workout">
          <ion-select-option
            v-for="item in queryResults"
            key="item.Name"
            :value="item.Name">
            {{ item.Name }}
          </ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item v-if="workout">
        <ion-label>Start Time</ion-label>
        <ion-datetime-button datetime="time"></ion-datetime-button>

        <ion-modal :keep-contents-mounted="true">
          <ion-datetime
            presentation="time"
            id="time"
            v-model="starttime"></ion-datetime>
        </ion-modal>
      </ion-item>

      <ion-item v-if="workout">
        <ion-label>End Time</ion-label>
        <ion-datetime-button datetime="datetime"></ion-datetime-button>

        <ion-modal :keep-contents-mounted="true">
          <ion-datetime
            presentation="date-time"
            id="datetime"
            v-model="endtime"></ion-datetime>
        </ion-modal>
      </ion-item>

      <ion-item v-if="workout">
        <ion-textarea
          label="Notes"
          placeholder="Enter text"
          style="height: 150px"
          v-model="notes"></ion-textarea>
      </ion-item>
      <h2
        v-if="showExercises"
        v-for="(exercise, index) in exercises"
        :key="index"
        style="margin-top: 50px">
        {{ exercise.exerciseName }}
        <ion-item v-for="set in exercise.sets" key="set">
          <div style="display: flex; flex-direction: column">
            <h5>Set {{ set }}</h5>
            <div style="display: flex; flex-direction: row">
              <ion-input
                label="Reps"
                type="number"
                :placeholder="exercise.reps.slice(0, 1)"
                @ion-blur="
                  leaveReps(exercise.exerciseName, set, $event.target.value)
                "></ion-input>
              <ion-input
                label="Weight"
                type="number"
                placeholder="100"
                @ion-blur="
                  leaveWeight(exercise.exerciseName, set, $event.target.value)
                "></ion-input>
              <ion-select
                label="Unit"
                :interface-options="{
                  header: 'Units',
                }"
                interface="action-sheet"
                class="my-custom-class"
                placeholder="Unit"
                @ion-blur="
                  leaveUnit(exercise.exerciseName, set, $event.target.value)
                ">
                <ion-select-option value="kg">kg</ion-select-option>
                <ion-select-option value="lbs">lbs</ion-select-option>
                <ion-select-option value="sec">Seconds</ion-select-option>
              </ion-select>
            </div>
          </div>
        </ion-item>
      </h2>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonDatetime,
  IonButton,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonContent,
  IonItem,
  IonLabel,
  IonButtons,
  IonToolbar,
  IonTitle,
  IonHeader,
  IonDatetimeButton,
  IonTextarea,
  IonInput,
} from "@ionic/vue";
import { ref, onBeforeMount, watch } from "vue";
import { DateObj, ColorInfo, availableColors } from "@/datatypes/CalendarTypes";
import { useDatabaseStore } from "@/stores/databaseStore";
import { useStateStore } from "@/stores/stateStore";
import { useSelectedDateStore } from "@/stores/selectedDateStore";

const stateStore = useStateStore();
stateStore.$subscribe((mutation, state) => {
  modalOpen.value = state.showAddWorkoutModal;
});
const selectedDateStore = useSelectedDateStore();

const highlightedDates: DateObj[] = [];
const datetime = ref();
const modal = ref();
const modalOpen = ref(false);
const input = ref();
const queryResults = ref<any>(null);
const databaseStore = useDatabaseStore();

const showDatetime = ref(false);

const starttime = ref(
  new Date().toISOString().slice(0, 10) +
    "T" +
    new Date().toTimeString().slice(0, 8)
);
// const showStartTimeModal = ref(false);
const endtime = ref(
  new Date().toISOString().slice(0, 10) +
    "T" +
    new Date().toTimeString().slice(0, 8)
);
// const showEndTimeModal = ref(false);
const notes = ref<string>("Workout was great!");
const workout = ref();
const sets = ref(0);

const SetResults = ref<
  {
    exerciseName: string;
    set: number;
    reps?: number;
    weight?: number;
    unit?: string;
  }[]
>([]);

const exercises = ref();
const showExercises = ref(false);

const emit = defineEmits(["datetimeUpdate"]);

let componentKey = ref(0);

const loadWorkouts = async () => {
  const query = `SELECT Name, Split, Color, active FROM WorkoutTemplate WHERE active = 1`;
  const resp = await databaseStore.getDatabase()?.query(query);
  queryResults.value = resp?.values || [];
};

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

onBeforeMount(async () => {
  await loadWorkouts();
  if (queryResults.value && queryResults.value.length > 0) {
    queryResults.value.reverse();
  }
  showDatetime.value = true;
});

const addValues = async (category: string) => {
  const selectedDate = selectedDateStore.getDate();

  console.log(SetResults);

  if (!selectedDate || typeof selectedDate !== "string") {
    return;
  }

  const colorQueryResult =
    (await databaseStore
      .getDatabase()
      ?.query(
        `SELECT Color FROM WorkoutTemplate WHERE Name = '${category}'`
      )) || [];

  let colorInfo: ColorInfo = {
    color: "var(--gray-color)",
    background: "var(--gray-background)",
    name: "",
  };
  if (
    Array.isArray(colorQueryResult.values) &&
    colorQueryResult.values.length > 0
  ) {
    const selectedColor = colorQueryResult.values[0]?.Color;
    if (selectedColor) {
      colorInfo = availableColors[selectedColor];
      // Jetzt können Sie colorInfo sicher verwenden
    }

    // selectedDates.forEach(async (selectedDate: string) => {
    if (!highlightedDates.some((dateObj) => dateObj.date === selectedDate)) {
      highlightedDates.push({
        date: selectedDate.slice(0, 10),
        textColor: colorInfo.color,
        backgroundColor: colorInfo.background,
      });

      console.log(starttime.value);

      const startdaytime =
        selectedDate.slice(0, 10) + starttime.value.slice(10, 19);
      const enddaytime =
        selectedDate.slice(0, 10) + endtime.value.slice(10, 19);

      try {
        console.log(
          `INSERT INTO Workout (startdate, enddate, note, workoutname)
      VALUES
          ('${startdaytime}', '${enddaytime}', '${notes.value}', '${category}'),`
        );
        await databaseStore.getDatabase()?.run(
          `INSERT INTO Workout (startdate, enddate, note, workoutname)
      VALUES
          ('${startdaytime}', '${enddaytime}', '${notes.value}', '${category}');`
        );

        insertWorkoutExercisesToDB();
      } catch (error) {
        alert("ERROR inserting in DB " + JSON.stringify(error));
      }
      componentKey.value += 1;
      workout.value = null;
      showExercises.value = false;
    }
    // });
  }
};

const confirmModal = () => {
  // alert(workout.value);
  // const color = input.value.$el.value;
  modal.value.$el.dismiss(name, "confirm");
  modalOpen.value = false;

  endtime.value =
    new Date().toISOString().slice(0, 10) +
    "T" +
    new Date().toTimeString().slice(0, 8);
  addValues(workout.value);

  stateStore.setShowAddWorkoutModal(false);
  emit("datetimeUpdate");
};

const leaveReps = (
  exerciseName: string,
  set: number,
  value: string | number | null | undefined
) => {
  console.log(exerciseName, set, value, SetResults);
  // Look if theres an object in SetResultsReps where exerciseName and set are the same, then update otherwise add as new element
  const index = SetResults.value.findIndex(
    (obj) => obj.exerciseName === exerciseName && obj.set === set
  );
  console.log(index);
  if (index !== -1) {
    value === "" || value === null || value === undefined
      ? SetResults.value[index].weight
        ? (SetResults.value[index].reps = 0)
        : SetResults.value.splice(index, 1)
      : (SetResults.value[index].reps = Number(value));
  } else {
    SetResults.value.push({
      exerciseName,
      set,
      reps: Number(value),
    });
  }
};

const leaveWeight = (
  exerciseName: string,
  set: number,
  value: string | number | null | undefined
) => {
  console.log(exerciseName, set, value, SetResults);
  // Look if theres an object in SetResultsReps where exerciseName and set are the same, then update otherwise add as new element
  const index = SetResults.value.findIndex(
    (obj) => obj.exerciseName === exerciseName && obj.set === set
  );
  if (index !== -1) {
    value === "" || value === null || value === undefined
      ? SetResults.value[index].reps
        ? (SetResults.value[index].weight = 0)
        : SetResults.value.splice(index, 1)
      : (SetResults.value[index].weight = Number(value));
  } else {
    SetResults.value.push({
      exerciseName,
      set,
      weight: Number(value),
    });
  }
};

const leaveUnit = (
  xerciseName: string,
  set: number,
  value: string | number | null | undefined
) => {
  // Look if theres an object in SetResultsReps where exerciseName and set are the same, then update otherwise add as new element
  const index = SetResults.value.findIndex(
    (obj) => obj.exerciseName === xerciseName && obj.set === set
  );
  if (index !== -1) {
    SetResults.value[index].unit = value?.toString();
  } else {
    SetResults.value.push({
      exerciseName: xerciseName,
      set,
      unit: value?.toString(),
    });
  }
};

const insertWorkoutExercisesToDB = async () => {
  const selectedDate = selectedDateStore.getDate();
  // exercise TEXT, workout DATETIME,setNumber INTEGER,reps INTEGER,weight INTEGER,unit TEXT,
  SetResults.value.forEach((exercise) => {
    if (exercise.reps === undefined) exercise.reps = 0;
    if (exercise.weight === undefined) exercise.weight = 0;
    if (exercise.unit === undefined) exercise.unit = "kg";

    const query = `INSERT INTO WorkoutExercise ( exercise, workout, setNumber, reps, weight, unit)
    VALUES
    ('${exercise.exerciseName}', '${
      selectedDate.slice(0, 10) + starttime.value.slice(10, 19)
    }', ${exercise.set}, ${exercise.reps}, ${exercise.weight}, '${
      exercise.unit
    }')`;
    console.log(query);
    databaseStore.getDatabase()?.run(query);
  });
  SetResults.value.length = 0;
};
</script>
