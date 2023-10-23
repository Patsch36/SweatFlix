<template>
  <ion-page style="height: calc(100vh - 100px)">
    <ion-backdrop v-if="popOverShow"></ion-backdrop>
    <color-picker
      v-if="popOverShow"
      id="box"
      @close="popOverShow = false"
      @color="setWorkoutColor($event)"
      @wheel.prevent
      @touchmove.prevent
      @scroll.prevent />
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Edit {{ workout }}</ion-title>
        <div class="icon">
          <ion-icon
            :icon="chevronBack"
            @click="router.go(-1)"
            size="large"
            color="primary"></ion-icon>
          <ion-label @click="router.go(-1)" color="primary">Cancel</ion-label>
        </div>
        <div
          @click="saveWorkout()"
          class="icon"
          slot="end"
          style="margin-right: 16px">
          <ion-label color="primary">Save</ion-label>
          <ion-icon
            :icon="saveOutline"
            style="font-size: 24px; margin-left: 8px"
            color="primary"></ion-icon>
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense" style="padding-inline: 0.75rem">
        <ion-toolbar>
          <!-- <ion-title size="large">{{ workout }}</ion-title> -->
          <h1 style="font-weight: bold; font-size: 32px">Edit {{ workout }}</h1>
        </ion-toolbar>
      </ion-header>
      <div style="padding-inline: 0.75rem" v-if="template">
        <ion-item>
          <ion-label>Split</ion-label>
          <ion-chip color="light">{{ currentSplits[0] }}</ion-chip>
        </ion-item>
        <ion-item>
          <div style="margin-block: 12px" v-if="missingMusclesFlag">
            <p style="margin: 0 0 8px 0">Missing Muscles:</p>
            <div style="display: flex" v-if="missingMuscles.length">
              <p
                v-for="(muscle, index) in missingMuscles"
                key="muscle"
                style="margin: 0 5px 0 0; min-width: max-content">
                {{ muscle
                }}{{ index !== missingMuscles.length - 1 ? ",\n" : "" }}
              </p>
            </div>
            <p v-else>No Muscle Group Missing. Perfect Split-Training.</p>
          </div>
        </ion-item>
        <ion-item>
          <ion-input
            label="Name"
            v-model="name"
            @ion-input="isTemplateNameUnique()"
            ref="inputReferenceName"></ion-input>
        </ion-item>
        <ion-item>
          <ion-textarea
            label="Notes"
            style="height: 150px"
            v-model="description"></ion-textarea>
        </ion-item>
        <ion-item>
          <ion-label>Color</ion-label>
          <ion-button
            @click="popOverShow = true"
            fill="outline"
            :style="`--color: var(--${color.toLowerCase()}-color); --background: var(--${color.toLowerCase()}-background); --border-color: var(--${color.toLowerCase()}-color);`"
            >{{ color }}</ion-button
          >
        </ion-item>
        <exercise-manager />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { chevronBack, saveOutline } from "ionicons/icons";
import {
  IonIcon,
  IonLabel,
  IonContent,
  IonTitle,
  IonToolbar,
  IonHeader,
  IonPage,
  IonItem,
  IonTextarea,
  IonInput,
  IonChip,
  IonList,
  IonModal,
  IonSearchbar,
  IonListHeader,
  IonButton,
  IonButtons,
  IonBackdrop,
  IonReorderGroup,
  IonReorder,
  IonPopover,
} from "@ionic/vue";
import { onBeforeMount, ref, shallowRef } from "vue";
import { useDatabaseStore } from "@/stores/databaseStore";
import {
  getPossibleSplits,
  getAllMusclesFromSplit,
} from "@/datatypes/splitCalculator";
import ColorPicker from "@/components/colorPicker.vue";
import { useActiveWorkoutsStore } from "@/stores/activeWorkoutsStore";
import ExerciseManager from "@/components/ExerciseManager.vue";

const databaseStore = useDatabaseStore();
const activeWorkoutsStore = useActiveWorkoutsStore();

const route = useRoute();
const router = useRouter();

const workout = ref<string>("");

const template = ref();
const exercises = ref();

const muscles = ref<number[]>([]);
const currentSplits = ref<string[]>([]);
const allMusclesOfSplit = ref<number[]>([]);
const missingMuscles = ref<number[]>([]);
const popOverShow = ref<boolean>(false);
const missingMusclesFlag = ref<boolean>(true);
const inputReferenceName = ref<any>(null);
const disableSaveButton = ref<boolean>(false);
const showList = ref<boolean>(false);

const newWorkout = shallowRef<boolean>(false);

const name = ref<string>("");
const description = ref<string>("");
const color = ref<string>("");

const loadWorkoutTemplate = async () => {
  const query = `SELECT Split, Description, Color FROM WorkoutTemplate WHERE name = '${workout.value}'`;

  const resp = await databaseStore.getDatabase()?.query(query);
  if (resp?.values && resp.values.length === 0) {
    newWorkout.value = true;
    console.log("Workout not found");
    // Init template values with boilerplates
    template.value = {
      Split: "Push",
      Description: "No description",
      Color: "Magenta",
    };
    return "NOWORKOUT";
  }
  template.value = resp?.values ? resp.values[0] : {};
  return "WORKOUT";
};

const loadWorkoutExcercises = async () => {
  const query = `SELECT WorkoutList.exerciseName, WorkoutList.sets, WorkoutList.reps, MuscleGroup.ID, WorkoutList.OrderIndex
  FROM WorkoutList INNER JOIN MuscleGroup INNER JOIN Exercise on WorkoutList.exerciseName == Exercise.name
  AND Exercise.MuscleGroup = MuscleGroup.ID WHERE workoutPlan = '${workout.value}'`;

  const resp = await databaseStore.getDatabase()?.query(query);
  exercises.value = resp?.values ? resp.values : [];

  exercises.value.sort((a: any, b: any) => a.OrderIndex - b.OrderIndex);
};

onBeforeMount(async () => {
  workout.value = route.params.id as string;
  if ((await loadWorkoutTemplate()) === "NOWORKOUT") {
    console.log("Workout not found: ", template);
    exercises.value = [];
    popOverShow.value = true;
  } else {
    await loadWorkoutExcercises();
  }
  muscles.value = exercises.value.map((exercise: any) => exercise.ID);
  currentSplits.value = getPossibleSplits(muscles.value);
  allMusclesOfSplit.value = getAllMusclesFromSplit(currentSplits.value[0]);
  missingMuscles.value = await musclesWithSubgroup(allMusclesOfSplit.value);

  initBuffers();

  if (workout.value !== "New Workout" && workout.value !== "NotFound")
    showList.value = true;
});

const musclesWithSubgroup = async (musclesOfSplit: number[]) => {
  const result: number[] = [];
  for (let i = 0; i < musclesOfSplit.length; i++) {
    const query = `SELECT SubMuscle FROM MuscleGroup WHERE ID = ${musclesOfSplit[i]}`;
    const resp = await databaseStore.getDatabase()?.query(query);
    const answer = resp?.values ? resp.values : [];
    if (answer && !muscles.value.includes(musclesOfSplit[i])) {
      result.push(answer[0].SubMuscle);
    }
  }
  return result;
};

const initBuffers = () => {
  name.value = workout.value;
  description.value = template.value.Description;
  color.value =
    template.value.Color.charAt(0).toUpperCase() +
    template.value.Color.slice(1);
  console.log(name.value, description.value, color.value);
};

const setWorkoutColor = (event: any) => {
  color.value = event;
  popOverShow.value = false;
};

const saveWorkout = async () => {
  if (!disableSaveButton.value) {
    if (name.value === "") {
      alert("Please enter a name");
      return;
    }

    if (name.value === "New Workout") {
      alert("Please enter a different name");
      return;
    }

    console.log(newWorkout.value);
    if (newWorkout.value) {
      const activeexercises = activeWorkoutsStore.getActiveWorkouts();

      if (!showList.value) {
        const query = `INSERT INTO WorkoutTemplate (Name, Description, Color, active) VALUES ('${
          name.value
        }', '${description.value}', '${color.value.toLowerCase()}', ${
          activeexercises < 16 ? 1 : 0
        })`;
        await databaseStore.getDatabase()?.run(query);
      } else {
        const query = `UPDATE WorkoutTemplate SET name = '${
          name.value
        }', Description = '${
          description.value
        }', Color = '${color.value.toLowerCase()}', Split = '${
          currentSplits.value[0]
        }' WHERE name = '${workout.value}'`;
        await databaseStore.getDatabase()?.run(query);
      }

      if (exercises.value.length > 0) {
        // Set new Exercises in workoutlist if exercises are chosen
        for (let i = 0; i < exercises.value.length; i++) {
          const exercise = exercises.value[i];
          const updateQuery = `UPDATE WorkoutList SET sets = ${exercise.sets}, reps = '${exercise.reps}' WHERE ID = '${exercise.WID}'`;
          await databaseStore.getDatabase()?.run(updateQuery);
        }

        // Update Split in WorkoutTemplate
        const updateQuery = `UPDATE WorkoutTemplate SET Split = '${currentSplits.value[0]}' WHERE Name = '${name.value}'`;
        await databaseStore.getDatabase()?.run(updateQuery);
      }
      if (showList.value) {
        router.go(-1);
        setTimeout(() => {
          router.push(`/workouttemplate/${name.value}`);
        }, 40);
      } else {
        showList.value = true;
      }

      return;
    }

    const query = `UPDATE WorkoutTemplate SET name = '${
      name.value
    }', Description = '${
      description.value
    }', Color = '${color.value.toLowerCase()}', Split = '${
      currentSplits.value[0]
    }' WHERE name = '${workout.value}'`;
    console.log(query);
    await databaseStore.getDatabase()?.run(query);
    // Delete every entry from workoutlist where workout is workout
    // const deleteQuery = `DELETE FROM WorkoutList WHERE workoutPlan = '${workout.value}'`;
    // await databaseStore.getDatabase()?.run(deleteQuery);

    // Set new exercises
    for (let i = 0; i < exercises.value.length; i++) {
      const exercise = exercises.value[i];
      const updateQuery = `UPDATE WorkoutList SET sets = ${exercise.sets}, reps = '${exercise.reps}' WHERE ID = '${exercise.WID}'`;
      await databaseStore.getDatabase()?.run(updateQuery);
    }

    if (showList.value) router.go(-1);
    else showList.value = true;
  } else {
    alert("Name already exists");
  }
};

const isTemplateNameUnique = async () => {
  const query = `SELECT name FROM WorkoutTemplate`;

  const result = await databaseStore.getDatabase()?.query(query);

  let res = result?.values ? result.values : [];
  res = res.map((item) => item.Name);
  res = res.filter((item) => item !== workout.value);
  console.log(res);
  console.log(res.includes(name.value));

  if (res.includes(name.value) && name.value === "New Workout") {
    inputReferenceName.value.$el.classList.remove("ion-valid");
    inputReferenceName.value.$el.classList.add("ion-invalid");
    disableSaveButton.value = true;
  } else {
    inputReferenceName.value.$el.classList.remove("ion-invalid");
    inputReferenceName.value.$el.classList.add("ion-valid");
    disableSaveButton.value = false;
  }
};

//   await console.log(
//     "Dragged from index",
//     event.detail.from,
//     "to",
//     event.detail.to
//   );

//   const to = event.detail.to;
//   const from = event.detail.from;

//   const WIDs = exercises.value.map((e: { WID: any }) => e.WID);
//   console.log(WIDs);

//   const ind = exercises.value.findIndex(
//     (e: { WID: any }) => e.WID === WIDs[from]
//   );
//   const draggedItem = exercises.value[ind];
//   console.log(draggedItem);

//   if (from < to) {
//     for (
//       let i = exercises.value[ind].WID;
//       i < exercises.value[ind].WID + to;
//       i++
//     ) {
//       const index = exercises.value.findIndex(
//         (e: { WID: any }) => e.WID === i + 1
//       );
//       console.log(i, exercises.value[index]);
//       exercises.value[index].WID = i;
//     }
//     exercises.value[ind].WID += to;
//   } else if (from > to) {
//     for (
//       let i = exercises.value[ind].WID - 1;
//       i >= exercises.value[ind].WID + to;
//       i--
//     ) {
//       const index = exercises.value.findIndex((e: { WID: any }) => e.WID === i);
//       console.log(i + 1, exercises.value[index]);
//       exercises.value[index].WID = i + 1;
//     }
//     exercises.value[ind].WID += to;
//   }

//   // Delete all existing Exercises from Database
//   const deleteQuery = `DELETE FROM WorkoutList WHERE workoutPlan = '${name.value}'`;
//   await databaseStore.getDatabase()?.run(deleteQuery);

//   // exercises.value.sort((a: any, b: any) => a.WID - b.WID);
//   //Save new Exercis Order to Database WorkoutList
//   console.log("INSERTING", exercises.value.length);
//   // const sortedExercises = exercises.value.sort(
//   //   (a: any, b: any) => a.WID < b.WID
//   // );
//   for (let i = 0; i < exercises.value.length; i++) {
//     const exercise = exercises.value[i];
//     const insertQuery = `INSERT INTO WorkoutList (id, workoutPlan, exerciseName, sets, reps) VALUES (${exercise.WID}, '${name.value}', '${exercise.exerciseName}', ${exercise.sets}, '${exercise.reps}')`;
//     console.log(insertQuery);
//     await databaseStore.getDatabase()?.run(insertQuery);
//   }
//   await event.detail.complete();
// };
</script>

<style scoped>
.icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}

ion-button {
  height: 32px;
  --border-width: 3px;
  font-size: 16px;
}

.list-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: end;
  margin-top: 16px;
  margin-right: 16px;
}

.list-header ion-icon {
  font-size: 30px;
}

.mt-0 {
  margin-top: 0 !important;
}

ion-popover {
  --background: rgba(40, 173, 218, 0.6);
  --backdrop-opacity: 0.75;
  --border-color: rgba(40, 173, 218, 0.6);
  --color: white;
  --width: 300px;
}
ion-popover ion-content {
  /* --background: rgba(40, 173, 218, 0.6); */
  border: 5px solid var(--ion-color-primary);
}
</style>
