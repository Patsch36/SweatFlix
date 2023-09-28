<template>
  <ion-backdrop v-if="popOverShow"></ion-backdrop>
  <color-picker
    v-if="popOverShow"
    id="box"
    @close="popOverShow = false"
    @color="setWorkoutColor($event)"
    @wheel.prevent
    @touchmove.prevent
    @scroll.prevent />
  <ion-page style="height: calc(100vh - 100px)">
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
                style="margin: 0 5px 0 0">
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
            error-text="Existing Workout Name"
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
        <div class="list-header" @click="showAddExerciseModal = true">
          <ion-icon :icon="addOutline" color="light"></ion-icon>
        </div>
        <ion-list>
          <ion-list-header>
            <ion-label class="mt-0">Exercises</ion-label>
            <ion-label class="mt-0" style="text-align: end; margin-right: 24px"
              >Sets</ion-label
            >
          </ion-list-header>
          <ion-reorder-group
            :disabled="false"
            @ionItemReorder="handleReorder($event)">
            <ion-item v-for="exercise in exercises" key="exercise.ID">
              <ion-label>{{
                exercise.exerciseName || exercise.name
              }}</ion-label>
              <ion-label
                style="
                  display: flex;
                  align-items: center;
                  justify-content: flex-end;
                  margin-left: auto;
                ">
                <ion-input
                  v-model="exercise.sets"
                  label=""
                  placeholder="2"
                  style="
                    border: 1px solid #fff;
                    border-radius: 5px;
                    max-width: 50px;
                    text-align: center;
                  "></ion-input>
                <span style="margin: 0 5px">x</span>
                <ion-input
                  v-model="exercise.reps"
                  label=""
                  placeholder="8-12"
                  style="
                    border: 1px solid #fff;
                    border-radius: 5px;
                    max-width: 80px;
                    text-align: center;
                  "></ion-input>
              </ion-label>

              <ion-reorder slot="end"></ion-reorder>
            </ion-item>
          </ion-reorder-group>
        </ion-list>
      </div>
      <ion-modal ref="modal" :isOpen="showAddExerciseModal">
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button @click="cancel()">Cancel</ion-button>
            </ion-buttons>
            <ion-title>Add Exercise</ion-title>
            <ion-buttons slot="end">
              <ion-button
                :strong="true"
                @click="confirmModal()"
                :disabled="false">
                Confirm</ion-button
              >
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-searchbar
            @ionInput="handleInput($event)"
            placeholder="Search"></ion-searchbar>
          <ion-list>
            <ion-list-header>
              <ion-label>Exercises</ion-label>
              <ion-label style="text-align: end; margin-right: 24px"
                >Sets</ion-label
              >
            </ion-list-header>
            <ion-item v-for="exercise in modalExercises" :key="exercise.name">
              <ion-label>
                <span style="color: white">{{ exercise.name }}</span>
                <ion-label color="medium">{{ exercise.SubMuscle }}</ion-label>
              </ion-label>
              <ion-label
                v-if="allExercises"
                style="
                  display: flex;
                  align-items: center;
                  justify-content: flex-end;
                  margin-left: auto;
                ">
                <ion-input
                  v-model="exercise.sets"
                  placeholder="2"
                  style="
                    border: 1px solid #fff;
                    border-radius: 5px;
                    max-width: 50px;
                    text-align: center;
                  "></ion-input>
                <span style="margin: 0 5px">x</span>
                <ion-input
                  v-model="exercise.reps"
                  placeholder="8-12"
                  style="
                    border: 1px solid #fff;
                    border-radius: 5px;
                    max-width: 80px;
                    text-align: center;
                  "></ion-input>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-modal>
      <p></p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { chevronBack, addOutline, saveOutline } from "ionicons/icons";
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
} from "@ionic/vue";
import { onBeforeMount, ref, shallowRef } from "vue";
import { useDatabaseStore } from "@/stores/databaseStore";
import {
  getPossibleSplits,
  getAllMusclesFromSplit,
} from "@/datatypes/splitCalculator";
import ColorPicker from "@/components/colorPicker.vue";
import { Exercise } from "@/datatypes/Exercise";
import { useActiveWorkoutsStore } from "@/stores/activeWorkoutsStore";

const databaseStore = useDatabaseStore();
const activeWorkoutsStore = useActiveWorkoutsStore();

const route = useRoute();
const router = useRouter();

const workout = ref<string>("");

const template = ref();
const exercises = ref();
const allExercises = ref<Exercise[]>([]);
const modalExercises = ref<Exercise[]>([]);

const muscles = ref<number[]>([]);
const currentSplits = ref<string[]>([]);
const allMusclesOfSplit = ref<number[]>([]);
const missingMuscles = ref<number[]>([]);
const popOverShow = ref<boolean>(false);
const showAddExerciseModal = ref<boolean>(false);
const modal = ref<any>(null);
const missingMusclesFlag = ref<boolean>(true);
const inputReferenceName = ref<any>(null);
const disableSaveButton = ref<boolean>(false);

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
  const query = `SELECT WorkoutList.exerciseName, WorkoutList.sets, WorkoutList.reps, MuscleGroup.ID, WorkoutList.ID as WID
  FROM WorkoutList INNER JOIN MuscleGroup INNER JOIN Exercise on WorkoutList.exerciseName == Exercise.name
  AND Exercise.MuscleGroup = MuscleGroup.ID WHERE workoutPlan = '${workout.value}'`;

  const resp = await databaseStore.getDatabase()?.query(query);
  exercises.value = resp?.values ? resp.values : [];

  exercises.value.sort((a: any, b: any) => a.WID - b.WID);
};

const loadAllExercises = async () => {
  const query = `SELECT Exercise.name, MuscleGroup.Muscle, MuscleGroup.SubMuscle FROM Exercise INNER JOIN MuscleGroup on Exercise.muscleGroup = MuscleGroup.ID`;

  const resp = await databaseStore.getDatabase()?.query(query);
  allExercises.value = resp?.values ? resp.values : [];
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
  await loadAllExercises();
  muscles.value = exercises.value.map((exercise: any) => exercise.ID);
  currentSplits.value = getPossibleSplits(muscles.value);
  allMusclesOfSplit.value = getAllMusclesFromSplit(currentSplits.value[0]);
  missingMuscles.value = await musclesWithSubgroup(allMusclesOfSplit.value);

  modalExercises.value = allExercises.value;

  initBuffers();
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
      const activeWorkouts = activeWorkoutsStore.getActiveWorkouts();

      const query = `INSERT INTO WorkoutTemplate (Name, Description, Color, active) VALUES ('${
        name.value
      }', '${description.value}', '${color.value.toLowerCase()}', ${
        activeWorkouts < 16 ? 1 : 0
      })`;
      await databaseStore.getDatabase()?.run(query);

      if (exercises.value.length > 0) {
        // Set new Exercises in workoutlist if exercises are chosen
        for (let i = 0; i < exercises.value.length; i++) {
          const exercise = exercises.value[i];
          const insertQuery = `INSERT INTO WorkoutList (workoutPlan, exerciseName, sets, reps) VALUES ('${name.value}', '${exercise.exerciseName}', ${exercise.sets}, '${exercise.reps}')`;
          await databaseStore.getDatabase()?.run(insertQuery);
        }

        // Update Split in WorkoutTemplate
        const updateQuery = `UPDATE WorkoutTemplate SET Split = '${currentSplits.value[0]}' WHERE Name = '${name.value}'`;
        await databaseStore.getDatabase()?.run(updateQuery);
      }

      router.go(-1);
      setTimeout(() => {
        router.push(`/workouttemplate/${name.value}`);
      }, 40);
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
    const deleteQuery = `DELETE FROM WorkoutList WHERE workoutPlan = '${workout.value}'`;
    await databaseStore.getDatabase()?.run(deleteQuery);

    // Set new exercises
    for (let i = 0; i < exercises.value.length; i++) {
      const exercise = exercises.value[i];
      const insertQuery = `INSERT INTO WorkoutList (workoutPlan, exerciseName, sets, reps) VALUES ('${name.value}', '${exercise.exerciseName}', ${exercise.sets}, '${exercise.reps}')`;
      await databaseStore.getDatabase()?.run(insertQuery);
    }

    router.go(-1);
  } else {
    alert("Name already exists");
  }
};

const generateNumbers = (upperLimit: any) => {
  // Erstelle ein Array von 1 bis zur angegebenen oberen Grenze
  return Array.from({ length: upperLimit }, (_, index) => index + 1);
};

const cancel = () => {
  modal.value.$el.dismiss(null, "cancel");
  showAddExerciseModal.value = false;
};

const handleInput = (event: any) => {
  const query = event.target.value;
  console.log(query);

  if (query === "" || !allExercises.value)
    modalExercises.value = allExercises.value;
  else {
    modalExercises.value = allExercises.value.filter((exercise) => {
      const exerciseName = exercise.name;
      const subMuscle = exercise.SubMuscle;
      const muscle = exercise.Muscle;

      return (
        exerciseName.includes(query) ||
        subMuscle.includes(query) ||
        muscle.includes(query)
      );
    });
    console.log(modalExercises.value);
  }
};

const confirmModal = async () => {
  let ids: any[] = [];
  modalExercises.value = modalExercises.value.map((exercise) => {
    if (exercise.sets || exercise.reps) {
      exercises.value.push({
        exerciseName: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
      });
      console.log(exercise);
      if (exercise.SubMuscle) ids.push(exercise.SubMuscle);
      exercise.sets = undefined;
      exercise.reps = "";
    }
    return exercise;
  });
  cancel();

  for (let i = 0; i < ids.length; i++) {
    // get id from MuscleGroup of exercise.SubMuscle
    const query = `SELECT ID FROM MuscleGroup WHERE SubMuscle = '${ids[i]}'`;
    const resp = await databaseStore.getDatabase()?.query(query);
    const answer = resp?.values ? resp.values : [];

    muscles.value.push(answer[0].ID);
  }

  currentSplits.value = getPossibleSplits(muscles.value);
  allMusclesOfSplit.value = getAllMusclesFromSplit(currentSplits.value[0]);
  missingMuscles.value = await musclesWithSubgroup(allMusclesOfSplit.value);
  missingMusclesFlag.value = false;

  setTimeout(() => {
    missingMusclesFlag.value = true;
  }, 1);
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

const handleReorder = async (event: CustomEvent) => {
  // The `from` and `to` properties contain the index of the item
  // when the drag started and ended, respectively
  await console.log(
    "Dragged from index",
    event.detail.from,
    "to",
    event.detail.to
  );

  const item1 = exercises.value[event.detail.from];
  const item2 = exercises.value[event.detail.to];

  // Change ID of both elements in database
  const query1 = `UPDATE WorkoutList SET ID = -1 WHERE workoutPlan = '${workout.value}' AND ID = ${item1.WID}`;
  const query2 = `UPDATE WorkoutList SET ID = ${item1.WID} WHERE workoutPlan = '${workout.value}' AND ID = ${item2.WID}`;
  const query3 = `UPDATE WorkoutList SET ID = ${item2.WID} WHERE workoutPlan = '${workout.value}' AND ID = -1`;
  await databaseStore.getDatabase()?.run(query1);
  await databaseStore.getDatabase()?.run(query2);
  await databaseStore.getDatabase()?.run(query3);

  await console.log("Changed", item1, item2);

  await loadWorkoutExcercises();

  // Finish the reorder and position the item in the DOM based on
  // where the gesture ended. This method can also be called directly
  // by the reorder group
  await event.detail.complete();
};
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
</style>
