<template>
  <ion-page style="height: calc(100vh - 100px)">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Rep Calculator</ion-title>
        <div class="icon">
          <ion-icon
            :icon="chevronBack"
            @click="router.go(-1)"
            size="large"
            color="primary"></ion-icon>
          <ion-label @click="router.go(-1)" color="primary">Cancel</ion-label>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Rep Calculator</ion-title>
        </ion-toolbar>
      </ion-header>

      <div style="padding-inline: 0.75rem">
        <ion-card color="primary" class="rep-card">
          <ion-card-header>
            <ion-card-subtitle>Youre One Rep Max</ion-card-subtitle>
            <ion-card-title>
              {{ res ? res : "No Result" }}
            </ion-card-title>
          </ion-card-header>
        </ion-card>

        <br />
        <ion-segment color="primary" v-model="calcmode">
          <ion-segment-button value="1RM">
            <ion-label>One Rep Max</ion-label>
          </ion-segment-button>
          <ion-segment-button value="NRM">
            <ion-label>N Rep Max</ion-label>
          </ion-segment-button>
        </ion-segment>
        <ion-item v-if="calcmode === 'NRM'">
          <ion-input
            label="Amount of Reps"
            type="number"
            v-model="repsForNRM"
            @ionFocus="openPopUpReps = true"
            class="days-backwards-input"></ion-input>
          <ion-popover
            :is-open="openPopUpReps"
            @ionPopoverDidDismiss="openPopUpReps = false">
            <ion-list>
              <ion-item
                v-for="number in generateArray(500)"
                :key="number"
                @click="
                  repsForNRM = number;
                  openPopUpReps = false;
                  setmanager.setReps(number);
                ">
                <ion-label>{{ number }}</ion-label>
              </ion-item>
            </ion-list>
          </ion-popover>
        </ion-item>

        <ion-item class="ion-margin-bottom">
          <ion-select
            v-model="formula"
            label="Formula"
            interface="action-sheet"
            placeholder="Choose Exercise">
            <ion-select-option value="all">All</ion-select-option>
            <ion-select-option value="eppley">Eppley</ion-select-option>
            <ion-select-option value="brzycki">Brzycki</ion-select-option>
            <ion-select-option value="lander">Lander</ion-select-option>
          </ion-select>
        </ion-item>
        <br />
        <br />
        <ion-segment color="primary" v-model="mode">
          <ion-segment-button value="exercise">
            <ion-label>Choose exericse</ion-label>
          </ion-segment-button>
          <ion-segment-button value="manual">
            <ion-label>Manual Calculation</ion-label>
          </ion-segment-button>
        </ion-segment>

        <div v-if="mode === 'exercise'">
          <ion-item>
            <ion-select
              label="Exercise"
              interface="action-sheet"
              placeholder="Choose Exercise"
              v-model="exercise">
              <ion-select-option
                v-for="exercise in exercises"
                :value="exercise.exercise">
                {{ exercise.exercise }}
              </ion-select-option>
            </ion-select>
          </ion-item>
          <!-- <ion-item>
            <ion-label>Startdate</ion-label>
            <ion-datetime-button datetime="date"></ion-datetime-button>

            <ion-modal :keep-contents-mounted="true">
              <ion-datetime
                presentation="date"
                id="date"
                @ionChange="setDate($event)"></ion-datetime>
            </ion-modal>
          </ion-item> -->
          <ion-item>
            <ion-input
              label="Amount of days backwards"
              type="number"
              v-model="daysBackwards"
              @ionFocus="openNumbersPopOver = true"
              class="days-backwards-input"></ion-input>
            <ion-popover
              :is-open="openNumbersPopOver"
              @ionPopoverDidDismiss="openNumbersPopOver = false">
              <ion-list>
                <ion-item
                  v-for="number in generateArray(365)"
                  :key="number"
                  @click="
                    daysBackwards = number;
                    openNumbersPopOver = false;
                  ">
                  <ion-label>{{ number }}</ion-label>
                </ion-item>
              </ion-list>
            </ion-popover>
          </ion-item>

          <ion-item>
            <ion-label>Use only the latest Workout?</ion-label>
            <ion-radio-group v-model="latestWorkout">
              <ion-radio justify="start" value="yes" labelPlacement="end"
                >Yes</ion-radio
              >
              <ion-radio justify="start" value="no" labelPlacement="end"
                >No</ion-radio
              >
            </ion-radio-group>
          </ion-item>
          <ion-datetime
            presentation="date"
            @ionChange="dateVal = $event.detail.value"
            class="datetime-object">
          </ion-datetime>
        </div>
        <div v-else>
          <ion-item>
            <ion-label>Weight</ion-label>
            <ion-input
              v-model="weight"
              type="number"
              label="Weight"
              placeholder="Enter weight greater 0"
              style="text-align: end"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label>Reps</ion-label>
            <ion-input
              v-model="reps"
              type="number"
              label="Reps"
              placeholder="Enter amount of reps greater 0"
              style="text-align: end"></ion-input>
          </ion-item>
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
  IonIcon,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonInput,
  IonPopover,
  IonList,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  IonRadioGroup,
  IonRadio,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from "@ionic/vue";

import { add, chevronBack } from "ionicons/icons";

import { onBeforeMount, ref, watch } from "vue";
import { useRouter } from "vue-router";

import { SetManager } from "@/datatypes/SetManager";
import { useDatabaseStore } from "@/stores/databaseStore";

const router = useRouter();
const databaseStore = useDatabaseStore();

const calcmode = ref("1RM");
const setmanager = new SetManager();
const mode = ref("exercise");
const openNumbersPopOver = ref(false);
const openPopUpReps = ref(false);
const res = ref();

const exercise = ref();
const exercises = ref();
const daysBackwards = ref(14);
let dateVal = ref();
const formula = ref("all");
const latestWorkout = ref("no");
const reps = ref();
const repsForNRM = ref(8);
const weight = ref();

onBeforeMount(async () => {
  await loadDoneExercises();
  dateVal.value = await new Date().toISOString().slice(0, 19);
  console.log(dateVal.value);
  repsForNRM.value = setmanager.getReps();
  await setmanager.test();
});

watch(
  [
    calcmode,
    mode,
    exercise,
    dateVal,
    daysBackwards,
    formula,
    latestWorkout,
    reps,
    weight,
    repsForNRM,
  ],
  async () => {
    console.log(
      calcmode.value,
      mode.value,
      exercise.value,
      dateVal.value,
      daysBackwards.value,
      formula.value,
      latestWorkout.value,
      reps.value,
      weight.value,
      repsForNRM.value
    );
    if (calcmode.value === "1RM") {
      if (mode.value === "exercise") {
        const latest = latestWorkout.value === "yes" ? true : false;
        res.value = await setmanager.get1RM(
          exercise.value,
          new Date(dateVal.value).toISOString().slice(0, 19),
          daysBackwards.value,
          formula.value,
          latest
        );
      } else if (mode.value === "manual") {
        res.value = setmanager.calculate1RMFromWeightAndReps(
          parseFloat(weight.value),
          parseInt(reps.value),
          formula.value
        );
      }
    } else if (calcmode.value === "NRM") {
      if (mode.value === "exercise") {
        const latest = latestWorkout.value === "yes" ? true : false;
        res.value = await setmanager.getNRM(
          exercise.value,
          new Date(dateVal.value).toISOString().slice(0, 19),
          daysBackwards.value,
          formula.value,
          latest
        );
      } else if (mode.value === "manual") {
        res.value = setmanager.calculateNRMFromWeightAndReps(
          parseFloat(weight.value),
          parseInt(reps.value),
          formula.value
        );
      }
    }
  }
);

const loadDoneExercises = async () => {
  const query = `SELECT DISTINCT Exercise FROM WorkoutExercise`;
  const resp = await databaseStore.getDatabase()?.query(query);
  exercises.value = resp?.values ? resp.values : [];
  exercises.value = exercises.value.sort(
    (a: { exercise: string }, b: { exercise: any }) =>
      a.exercise.localeCompare(b.exercise)
  );
};

const generateArray = (n: number) => {
  return Array.from({ length: n }, (_, i) => i + 1);
};
</script>

<style scoped>
.icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.rep-card {
  width: 50%;
  margin-inline: auto;
  margin-block: 32px;
}

ion-popover ion-list {
  border: 5px solid red;
  border-radius: 10px;
  height: 500px;
  overflow: auto;
}

.days-backwards-input {
  text-align: end;
}

.datetime-object {
  /* width: 250px; */
  height: 250px !important;
  margin-block: 32px;
  margin-inline: 50px;
}

ion-radio-group {
  max-width: min-content;
  margin-left: auto;
}

ion-radio {
  height: 25px;
}
</style>
