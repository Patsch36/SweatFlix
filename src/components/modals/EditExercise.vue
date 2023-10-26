<template>
  <ion-modal :isOpen="modalOpen">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="stateStore.setShowEditExerciseModal(false)">
            Cancel
            <ion-icon slot="start" :icon="chevronBack"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Edit Workout</ion-title>
        <ion-buttons slot="end">
          <ion-button
            :disabled="checkIfPlanIsFilled()"
            :strong="true"
            @click="confirmModal()">
            save
            <ion-icon slot="end" :icon="saveOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item v-if="name">
        <ion-input
          label="Exercise Name"
          label-placement="floating"
          type="text"
          v-model="name"></ion-input>
      </ion-item>
      <ion-item>
        <ion-textarea
          label="Description"
          label-placement="floating"
          v-model="description"
          :rows="15"></ion-textarea>
      </ion-item>
      <ion-item v-if="subMuscle">
        <ion-select
          label="Muscle Group"
          label-placement="floating"
          v-model="subMuscle"
          interface="action-sheet">
          <ion-select-option
            v-for="subMuscle in subMuscles"
            :key="subMuscle.SubMuscle"
            :value="subMuscle.SubMuscle">
            {{ subMuscle.SubMuscle }}, {{ subMuscle.Muscle }}
          </ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item v-if="subMuscle">
        <ion-select
          label="Isolation Exercise"
          label-placement="floating"
          v-model="isolation"
          interface="action-sheet">
          <ion-select-option :value="1"> Yes </ion-select-option>
          <ion-select-option :value="0"> No </ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item v-if="subMuscle">
        <ion-select
          label="Weight Type"
          label-placement="floating"
          v-model="bodyweight"
          interface="action-sheet">
          <ion-select-option :value="1"> Bodyweight </ion-select-option>
          <ion-select-option :value="0"> Externally Weighted</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item v-if="SecondaryMuscleGroup">
        <div class="outer-chip-container">
          <p class="chip-label">
            Secondary Muscle Groups
            <ion-icon
              :icon="addCircleOutline"
              @click="showMuscleGroupPopover = true"></ion-icon>
          </p>
          <div class="chip-container">
            <ion-chip
              v-for="(item, index) in SecondaryMuscleGroup"
              :key="item"
              color="light">
              <ion-icon
                :icon="closeCircle"
                @click="SecondaryMuscleGroup.splice(index, 1)"></ion-icon>
              <ion-label>{{ item.SubMuscle }}</ion-label>
            </ion-chip>
          </div>
        </div>
        <ion-popover
          :is-open="showMuscleGroupPopover"
          @willDismiss="showMuscleGroupPopover = false">
          <ion-content>
            <ion-list v-if="newSubMuscles">
              <ion-item
                v-for="muscle in newSubMuscles"
                :key="muscle"
                @click="
                  showMuscleGroupPopover = false;
                  SecondaryMuscleGroup.push({
                    SubMuscle: muscle.SubMuscle,
                    ID: muscle.ID,
                  });
                ">
                {{ muscle.SubMuscle }}, {{ muscle.Muscle }}
              </ion-item>
            </ion-list>
          </ion-content>
        </ion-popover>
      </ion-item>
    </ion-content>
  </ion-modal>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, reactive, ref } from "vue";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonChip,
} from "@ionic/vue";
import {
  chevronBack,
  saveOutline,
  addCircleOutline,
  closeCircle,
} from "ionicons/icons";
import { useStateStore } from "@/stores/stateStore";
import { useDatabaseStore } from "@/stores/databaseStore";

const stateStore = useStateStore();
const databaseStore = useDatabaseStore();

const modalOpen = ref(false);
const showMuscleGroupPopover = ref(false);

const { exercise } = defineProps(["exercise"]);

const name = ref();
const originalName = ref();
const description = ref();
const subMuscle = ref();
const muscle = ref();
const SecondaryMuscleGroup = ref();
const bodyweight = ref();
const isolation = ref();

const subMuscles = ref();

const newSubMuscles = computed(() => {
  if (
    subMuscles.value === undefined ||
    SecondaryMuscleGroup.value === undefined ||
    typeof SecondaryMuscleGroup.value !== "object"
  )
    return [];
  const SecondaryMuscleGroupIDs = SecondaryMuscleGroup.value.map(
    (item: { ID: any }) => item.ID
  );
  return subMuscles.value.filter(
    (item: { ID: any }) => !SecondaryMuscleGroupIDs.includes(item.ID)
  );
});

stateStore.$subscribe((mutation, state) => {
  console.log("TRIGGERED");
  modalOpen.value = state.showEditExerciseModal;
  console.log("Exercise", exercise);
  name.value = exercise.name;
  originalName.value = exercise.name;
  description.value = exercise.ExDesc;
  subMuscle.value = exercise.SubMuscle;
  muscle.value = exercise.Muscle;
  SecondaryMuscleGroup.value = exercise.SecondaryMuscleGroup;
  loadExercise(exercise.name);
  loadSecondaryMuscleGroup(exercise.SecondaryMuscleGroup);
});

const loadSecondaryMuscleGroup = async (musclegroups: string) => {
  const query = `SELECT SubMuscle, ID FROM MuscleGroup WHERE ID IN (${musclegroups.slice(
    1,
    -1
  )})`;
  const resp = await databaseStore.getDatabase()?.query(query);
  const resplist = resp?.values ? resp.values : [];
  let list = [];
  for (const item of resplist) {
    list.push(item);
  }
  SecondaryMuscleGroup.value = list;
};

const loadExercise = async (exercisename: string) => {
  const query = `SELECT *, Exercise.description as ExDesc FROM Exercise INNER JOIN MuscleGroup ON Exercise.MuscleGroup = MuscleGroup.ID WHERE Exercise.Name = '${exercisename}'`;
  const resp = await databaseStore.getDatabase()?.query(query);
  exercise.value = resp?.values
    ? resp.values[0]
    : { name: "No exercise found" };
  console.log("LOADED EXERCISE INFO", exercise.value);

  const SecondaryMuscleGroupsQuery = `SELECT SubMuscle , ID FROM MuscleGroup WHERE ID in (${exercise.value.SecondaryMuscleGroup.slice(
    1,
    -1
  )})`;

  const respSecondaryMuscleGroups = await databaseStore
    .getDatabase()
    ?.query(SecondaryMuscleGroupsQuery);
  SecondaryMuscleGroup.value = respSecondaryMuscleGroups?.values
    ? respSecondaryMuscleGroups.values
    : [];

  name.value = exercise.value.name;
  description.value = exercise.value.ExDesc;
  subMuscle.value = exercise.value.SubMuscle;
  bodyweight.value = exercise.value.Bodyweight;
  isolation.value = exercise.value.Isolation;
};

// define emit
const emit = defineEmits(["reloadExercises"]);

onBeforeMount(async () => {
  await loadSubMuscles();
});

const loadSubMuscles = async () => {
  const query = `SELECT Muscle, SubMuscle, ID FROM MuscleGroup`;
  const resp = await databaseStore.getDatabase()?.query(query);
  subMuscles.value = resp?.values ? resp.values : [];
};

const checkIfPlanIsFilled = () => {
  return false;
};

const confirmModal = async () => {
  exercise.SecondaryMuscleGroup = buildListString();
  // Get muscleGroup ID from db
  const selectQuery = `SELECT id FROM MuscleGroup WHERE SubMuscle = '${subMuscle.value}' AND Muscle = '${muscle.value}' `;
  console.log(selectQuery);
  const resp = await databaseStore.getDatabase()?.query(selectQuery);
  const muscleGroupID = resp?.values ? resp.values[0].ID : null;

  // Save everything to database
  const query = `INSERT INTO Exercise (name, description, muscleGroup, SecondaryMuscleGroup, isolation, bodyweight) VALUES ('${
    name.value
  }', '${description.value}', '${muscleGroupID}', '${buildListString()}', ${
    isolation.value
  }, ${bodyweight.value})`;
  console.log(query);
  await databaseStore.getDatabase()?.run(query);

  const updateWOrkoutListQuery = `UPDATE WorkoutList SET exerciseName = '${name.value}' WHERE exerciseName = '${originalName.value}'`;
  console.log(updateWOrkoutListQuery);
  await databaseStore.getDatabase()?.run(updateWOrkoutListQuery);

  const workoutExerciseQuery = `UPDATE WorkoutExercise SET exercise = '${name.value}' WHERE exercise = '${originalName.value}'`;
  await databaseStore.getDatabase()?.run(workoutExerciseQuery);

  const DeleteQuery = `DELETE FROM Exercise WHERE name = '${originalName.value}'`;
  await databaseStore.getDatabase()?.run(DeleteQuery);

  emit("reloadExercises", name.value);
  stateStore.setShowEditExerciseModal(false);
};

const buildListString = () => {
  let list = "[";
  for (const item of SecondaryMuscleGroup.value) {
    list += `${item.ID},`;
  }
  list = list.slice(0, -1);
  list += "]";
  return list;
};
</script>

<style scoped>
.icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.outer-chip-container {
  width: 100%;
}
.chip-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.chip-label {
  font-size: 13px;
  margin-block: 8px;
  margin-right: 10px;
  width: 100%;
  max-width: 100%;
  position: relative;
}

.chip-label ion-icon {
  font-size: 24px;
  position: absolute;
  right: 0;
}

ion-popover {
  --width: 300px;
}

ion-popover ion-content {
  --background: var(--ion-color-dark-shade);
  border-radius: 16px;
  border: 5px solid var(--ion-color-primary);
  -webkit-box-shadow: -10px 0px 13px -7px #000000, 10px 0px 13px -7px #000000,
    5px 6px 33px 4px rgba(0, 0, 0, 0.33);
  box-shadow: -10px 0px 13px -7px #000000, 10px 0px 13px -7px #000000,
    5px 6px 33px 4px rgba(0, 0, 0, 0.33);
  height: 700px;
  overflow: hidden;
}

ion-popover ion-list {
  --background: var(--ion-color-dark-shade);
  overflow: auto;
}

ion-popover ion-list ion-item {
  text-align: center;
}

ion-popover::part(backdrop) {
  background-color: var(--ion-color-dark-shade);
}
</style>
