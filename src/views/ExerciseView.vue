<template>
  <ion-page style="height: calc(100vh - 100px)">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title v-if="exercise"> {{ exercise.name }} </ion-title>
        <div class="icon">
          <ion-icon
            :icon="chevronBack"
            @click="router.go(-1)"
            size="large"
            color="primary"></ion-icon>
          <ion-label @click="router.go(-1)" color="primary">Cancel</ion-label>
        </div>
        <div class="icon" slot="end">
          <ion-label
            @click="
              console.log('CLICKED');
              stateStore.setShowEditExerciseModal(true);
            "
            color="primary"
            >Edit</ion-label
          >
          <ion-icon
            :icon="pencilOutline"
            @click="stateStore.setShowEditExerciseModal(true)"
            size="large"
            color="primary"></ion-icon>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large" v-if="exercise">
            {{ exercise.name }}
          </ion-title>
        </ion-toolbar>
      </ion-header>
      <div style="padding-inline: 0.75rem">
        <ion-grid v-if="exercise">
          <ion-row>
            <ion-col>
              <b>Muscle Group</b>
              <br />
              {{ exercise.Muscle }}
            </ion-col>
            <ion-col>
              <b>Sub Muscle Group</b>
              <br />
              {{ exercise.SubMuscle }}
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              {{ exercise.description }}
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <b>Weighttype</b>
              <br />
              {{
                exercise.Bodyweight === 1 ? "Bodyweight" : "Externally Weighted"
              }}
            </ion-col>
            <ion-col>
              <b>Type</b>
              <br />
              {{ exercise.Isolation === 1 ? "Isolation" : "Compound" }}
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <b>Secondary Muscle Groups</b>
              <br />
              <ion-chip v-for="item in SecondaryMuscleGroups" color="light">
                {{ item }}
              </ion-chip>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <b>Description</b>
              <br />
              {{ exercise.ExDesc }}
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>

      <div class="ion-padding">
        <ion-segment
          color="primary"
          value="workout"
          @ion-change="segmentChangedValues($event)"
          v-model="valueSegment">
          <!-- <ion-segment-button value="week">
            <ion-label>Sets</ion-label>
          </ion-segment-button> -->
          <ion-segment-button value="workout">
            <ion-label>Workout</ion-label>
          </ion-segment-button>
          <ion-segment-button value="heaviestSet">
            <ion-label>Heaviest Set</ion-label>
          </ion-segment-button>
          <ion-segment-button value="weightSet">
            <ion-label>Weight Set</ion-label>
          </ion-segment-button>
          <ion-segment-button value="weight">
            <ion-label>Weight</ion-label>
          </ion-segment-button>
        </ion-segment>

        <ion-segment
          color="primary"
          value="week"
          @ion-change="segmentChangedTime($event)"
          v-model="timeSegment"
          style="margin-bottom: 15px">
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

        <p class="diagramm-explanantion" v-if="valueSegment === 'workout'">
          Overall Moved Weight of this exercise in Workout (Sum of all sets)
        </p>
        <p class="diagramm-explanantion" v-if="valueSegment === 'heaviestSet'">
          The set with the highest set-weight
        </p>
        <p class="diagramm-explanantion" v-if="valueSegment === 'weightSet'">
          Moved Weight during set with heighest rep-weight
        </p>
        <p class="diagramm-explanantion" v-if="valueSegment === 'weight'">
          The Weight moved by one set
        </p>

        <Diagram
          :weights="
            mergeTwoArrays(
              timestamps.slice(0, indexForDisplayableValues),
              displayableValues.slice(0, indexForDisplayableValues)
            )
          "
          v-if="displayableValues" />
      </div>
    </ion-content>
    <EditExercise
      v-if="exercise && renderModal"
      :exercise="exercise"
      @reloadExercises="reloadExercises"></EditExercise>
  </ion-page>
</template>

<script setup lang="ts">
import { useDatabaseStore } from "@/stores/databaseStore";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonSegment,
  IonSegmentButton,
} from "@ionic/vue";
import { useRoute, useRouter } from "vue-router";
import {
  chevronBack,
  pencilOutline,
  checkmarkCircleOutline,
} from "ionicons/icons";
import { computed, onBeforeMount, onMounted, ref } from "vue";
import Diagram from "@/components/Diagram.vue";
import { times } from "cypress/types/lodash";
import { useStateStore } from "@/stores/stateStore";
import EditExercise from "@/components/EditExercise.vue";

const router = useRouter();
const route = useRoute();
const databaseStore = useDatabaseStore();
const stateStore = useStateStore();

const exercise = ref();
const SecondaryMuscleGroups = ref();
const exerciseName = ref();
const timeSegment = ref<string>("week");
const valueSegment = ref<string>("workout");
const displayableValues = ref<number[]>([]);
const renderModal = ref(true);

const workoutExercises = ref();

const timestamps = ref<string[]>([]);

const showDiagramm = ref(true);
const indexForDisplayableValues = ref<number>(0);

const loadExercise = async () => {
  const query = `SELECT *, Exercise.description as ExDesc FROM Exercise INNER JOIN MuscleGroup ON Exercise.MuscleGroup = MuscleGroup.ID WHERE Exercise.Name = '${exerciseName.value}'`;
  const resp = await databaseStore.getDatabase()?.query(query);
  exercise.value = resp?.values
    ? resp.values[0]
    : { name: "No exercise found" };
  console.log("LOADED EXERCISE INFO", exercise.value);

  const SecondaryMuscleGroupsQuery = `SELECT SubMuscle FROM MuscleGroup WHERE ID in (${exercise.value.SecondaryMuscleGroup.slice(
    1,
    -1
  )})`;
  const respSecondaryMuscleGroups = await databaseStore
    .getDatabase()
    ?.query(SecondaryMuscleGroupsQuery);
  SecondaryMuscleGroups.value = respSecondaryMuscleGroups?.values
    ? respSecondaryMuscleGroups.values
    : [];

  SecondaryMuscleGroups.value = SecondaryMuscleGroups.value.map(
    (item: any) => item.SubMuscle
  );
};

const reloadExercises = async (name: string) => {
  renderModal.value = false;
  exerciseName.value = name;
  await loadExercise();
  await loadExercisesFromWorkoutExercises();
  timestamps.value = getUniqueTimestamps(workoutExercises.value);

  timeSegment.value = "halfyear";
  segmentChangedTime(null);
  valueSegment.value = "workout";
  segmentChangedValues(null);

  renderModal.value = true;
};

const loadExercisesFromWorkoutExercises = async () => {
  // get all exercises from database of this exercise
  const query = `SELECT * FROM WorkoutExercise WHERE WorkoutExercise.Exercise = '${exerciseName.value}'`;
  const resp = await databaseStore.getDatabase()?.query(query);
  workoutExercises.value = resp?.values ? resp.values : [];
};

onBeforeMount(async () => {
  exerciseName.value = route.params.id;
  await loadExercise();
  await loadExercisesFromWorkoutExercises();
  timestamps.value = getUniqueTimestamps(workoutExercises.value);

  timeSegment.value = "halfyear";
  segmentChangedTime(null);
  valueSegment.value = "workout";
  segmentChangedValues(null);
});

onMounted(() => {
  showDiagramm.value = true;
});

const overallWeightsPerSet = () => {
  if (!workoutExercises.value) return [];
  const weightsPerSet: number[] = [];
  workoutExercises.value.forEach(
    (workoutExercise: { reps: number; weight: number }) => {
      const set = workoutExercise.reps * workoutExercise.weight;
      weightsPerSet.push(set);
    }
  );
  console.log("Weights per Set", weightsPerSet);
  return weightsPerSet;
};

const overallWeightsPerWorkout = () => {
  if (!workoutExercises.value) return [];
  const weightsPerWorkout: { [key: string]: number } = {};
  workoutExercises.value.forEach(
    (workoutExercise: { reps: number; weight: number; workout: string }) => {
      if (weightsPerWorkout[workoutExercise.workout]) {
        weightsPerWorkout[workoutExercise.workout] +=
          workoutExercise.reps * workoutExercise.weight;
      } else {
        weightsPerWorkout[workoutExercise.workout] =
          workoutExercise.reps * workoutExercise.weight;
      }
    }
  );
  console.log("Weights per Workout", Object.values(weightsPerWorkout));
  return Object.values(weightsPerWorkout);
};

const setOfWorkoutWithHighestSetWeight = () => {
  if (!workoutExercises.value) return [];
  const weightsPerWorkout: { [key: string]: number } = {};
  workoutExercises.value.forEach(
    (workoutExercise: { reps: number; weight: number; workout: string }) => {
      if (weightsPerWorkout[workoutExercise.workout]) {
        if (
          weightsPerWorkout[workoutExercise.workout] <
          workoutExercise.reps * workoutExercise.weight
        ) {
          weightsPerWorkout[workoutExercise.workout] =
            workoutExercise.reps * workoutExercise.weight;
        }
      } else {
        weightsPerWorkout[workoutExercise.workout] =
          workoutExercise.reps * workoutExercise.weight;
      }
    }
  );
  console.log("Highest Set per Workout", Object.values(weightsPerWorkout));
  return Object.values(weightsPerWorkout);
};

const setWithHighestWeightValue = () => {
  if (!workoutExercises.value) return [];
  const weightsPerWorkout: { [key: string]: number } = {};
  const weightPerWorkout: { [key: string]: number } = {};
  workoutExercises.value.forEach(
    (workoutExercise: { reps: number; weight: number; workout: string }) => {
      if (weightPerWorkout[workoutExercise.workout]) {
        if (
          weightPerWorkout[workoutExercise.workout] < workoutExercise.weight
        ) {
          weightPerWorkout[workoutExercise.workout] = workoutExercise.weight;
          weightsPerWorkout[workoutExercise.workout] =
            workoutExercise.reps * workoutExercise.weight;
        }
      } else {
        weightPerWorkout[workoutExercise.workout] = workoutExercise.weight;
        weightsPerWorkout[workoutExercise.workout] =
          workoutExercise.reps * workoutExercise.weight;
      }
    }
  );
  console.log("Highest Set per Workout", Object.values(weightsPerWorkout));
  return Object.values(weightsPerWorkout);
};

const highestWeightAfterWorkout = () => {
  if (!workoutExercises.value) return [];
  const weightsPerWorkout: { [key: string]: number } = {};
  const weightPerWorkout: { [key: string]: number } = {};
  workoutExercises.value.forEach(
    (workoutExercise: { reps: number; weight: number; workout: string }) => {
      if (weightPerWorkout[workoutExercise.workout]) {
        if (
          weightPerWorkout[workoutExercise.workout] < workoutExercise.weight
        ) {
          weightPerWorkout[workoutExercise.workout] = workoutExercise.weight;
          weightsPerWorkout[workoutExercise.workout] =
            workoutExercise.reps * workoutExercise.weight;
        }
      } else {
        weightPerWorkout[workoutExercise.workout] = workoutExercise.weight;
      }
    }
  );
  console.log("Highest Set per Workout", Object.values(weightPerWorkout));
  return Object.values(weightPerWorkout);
};

const getUniqueTimestamps = (array: any[]): string[] => {
  const uniqueTimestamps: string[] = [];
  array.forEach((element: { workout: string }) => {
    if (!uniqueTimestamps.includes(element.workout)) {
      uniqueTimestamps.push(element.workout);
    }
  });
  return uniqueTimestamps;
};

const mergeTwoArrays = (timeStampArray: string | any[], weightArray: any[]) => {
  const mergedArray = [];
  for (let i = 0; i < timeStampArray.length; i++) {
    mergedArray.push({ timestamp: timeStampArray[i], weight: weightArray[i] });
  }
  return mergedArray;
};

const segmentChangedValues = (event: CustomEvent | null) => {
  if (valueSegment.value === "workout") {
    displayableValues.value = overallWeightsPerWorkout();
  } else if (valueSegment.value === "heaviestSet") {
    displayableValues.value = setOfWorkoutWithHighestSetWeight();
  } else if (valueSegment.value === "weightSet") {
    displayableValues.value = setWithHighestWeightValue();
  } else if (valueSegment.value === "weight") {
    displayableValues.value = highestWeightAfterWorkout();
  }
};

const segmentChangedTime = (event: CustomEvent | null) => {
  // Find Index of timestamps array depending on timeSegment Values. Look of first value one week ago, one month ago, etc.
  // Then filter workoutExercises array for all workouts that are in the timestamps array

  // reverse order

  const index = timestamps.value.findIndex((timestamp) => {
    if (timeSegment.value === "week") {
      return (
        new Date(timestamp).getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000
      );
    } else if (timeSegment.value === "month") {
      return (
        new Date(timestamp).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000
      );
    } else if (timeSegment.value === "halfyear") {
      return (
        new Date(timestamp).getTime() < Date.now() - 180 * 24 * 60 * 60 * 1000
      );
    } else if (timeSegment.value === "year") {
      return (
        new Date(timestamp).getTime() < Date.now() - 365 * 24 * 60 * 60 * 1000
      );
    } else if (timeSegment.value === "complete") {
      return true;
    }
  });
  indexForDisplayableValues.value = index > 0 ? index : timestamps.value.length;
};
</script>

<style scoped>
.icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}

ion-segment-button {
  --padding-start: 3px;
  --padding-end: 3px;
}

.diagramm-explanation {
  width: 100%;
  justify-content: center;
  text-align: center;
}

ion-chip {
  padding: 8px;
}
</style>
