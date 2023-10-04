<template>
  <ion-page style="height: calc(100vh - 100px)">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Profile</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-accordion-group
        ref="accordionGroup"
        @IonChange="accordionGroupChanged($event)"
        v-model="openedAccordion">
        <ion-accordion value="exercises">
          <ion-item slot="header" color="primary">
            <ion-label>Exercises</ion-label>
          </ion-item>
          <div class="ion-padding" slot="content">
            <div style="display: flex; justify-content: space-between">
              <ion-button
                fill="outline"
                @click="stateStore.setShowAddExerciseModal(true)"
                color="light"
                style="width: 47.5%">
                Add new Exercise
              </ion-button>
              <ion-button
                v-if="!showDoneExercises"
                @click="
                  modalExercises = allExercises.filter(
                    (item) => item.isWorkedOut
                  );
                  showDoneExercises = true;
                "
                fill="outline"
                color="light"
                style="width: 47.5%">
                Show done exercises
              </ion-button>
              <ion-button
                v-else
                @click="
                  modalExercises = allExercises;
                  showDoneExercises = false;
                "
                fill="outline"
                color="light"
                style="width: 47.5%">
                Show all exercises
              </ion-button>
            </div>
            <ion-searchbar
              @ionInput="handleInput($event)"
              placeholder="Search"
              v-model="searchQuery"></ion-searchbar>
            <ion-list>
              <ion-list-header>
                <ion-label>Exercises</ion-label>
              </ion-list-header>
              <ion-item-sliding
                v-for="exercise in modalExercises"
                :key="exercise.name">
                <ion-item @click="router.push(`/exercise/${exercise.name}`)">
                  <ion-label style="color: white; min-width: max-content">
                    <span>{{ exercise.name }}</span>
                    <ion-label color="medium">
                      {{ exercise.SubMuscle }}
                    </ion-label>
                  </ion-label>
                  <ion-label
                    v-if="allExercises"
                    style="
                      display: flex;
                      align-items: center;
                      justify-content: flex-end;
                      margin-left: auto;
                    ">
                  </ion-label>
                </ion-item>
                <ion-item-options side="end">
                  <ion-item-option color="danger" expandable>
                    <ion-button
                      color="transparent"
                      @click="deleteExercise(exercise.name)">
                      <ion-icon
                        slot="icon-only"
                        :icon="trashOutline"></ion-icon>
                    </ion-button>
                  </ion-item-option>
                </ion-item-options>
              </ion-item-sliding>
            </ion-list>
          </div>
        </ion-accordion>
        <ion-accordion value="second">
          <ion-item slot="header" color="primary">
            <ion-label>Second Accordion</ion-label>
          </ion-item>
          <div class="ion-padding" slot="content">Second Content</div>
        </ion-accordion>
        <ion-accordion value="third">
          <ion-item slot="header" color="primary">
            <ion-label>Third Accordion</ion-label>
          </ion-item>
          <div class="ion-padding" slot="content">Third Content</div>
        </ion-accordion>
      </ion-accordion-group>

      <ion-textarea
        placeholder="Enter some text..."
        :auto-grow="true"
        v-model="query"
        :rows="1"></ion-textarea>
      <ion-button @click="executeQuery()">Execute</ion-button>
      <p>{{ data }}</p>
    </ion-content>
    <add-exercise @exerciseAdded="loadAllExercises()"></add-exercise>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonTextarea,
  IonAccordion,
  IonAccordionGroup,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonListHeader,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
} from "@ionic/vue";
import { onBeforeMount, onMounted, ref } from "vue";
import { useDatabaseStore } from "@/stores/databaseStore";
import { Exercise } from "@/datatypes/Exercise";
import { useRouter } from "vue-router";
import { useStateStore } from "@/stores/stateStore";
import { store } from "@/stores/IonicStorage";
import AddExercise from "@/components/addExercise.vue";
import { trashOutline } from "ionicons/icons";
import { storeToRefs } from "pinia";

const stateStore = useStateStore();
const databaseStore = useDatabaseStore();
const router = useRouter();

const query = ref("");
const data = ref();
const searchQuery = ref();

const allExercises = ref<Exercise[]>([]);
const modalExercises = ref<Exercise[]>([]);
const showDoneExercises = ref(false);

const accordionGroup = ref(null);
const openedAccordion = ref("");

onBeforeMount(async () => {
  await loadAllExercises();
  modalExercises.value = allExercises.value;
  searchQuery.value = stateStore.profileSearchQuery;
  handleInput({ target: { value: searchQuery.value } });

  if (stateStore.openedProfileAccordion.length) {
    openedAccordion.value = stateStore.openedProfileAccordion;
  }
});

const accordionGroupChanged = (event: any) => {
  console.log(event);
  stateStore.setOpenedProfileAccordion(event.detail.value);
  openedAccordion.value = event.detail.value;
};

const executeQuery = async () => {
  try {
    const resp = await databaseStore.getDatabase()?.query(query.value);
    data.value = resp?.values ? resp.values : [];
  } catch (e) {
    console.log(e);
    data.value = e;
  }
  query.value = "";
};

const handleInput = async (event: any) => {
  const query = event.target.value.toLowerCase(); // To ignore case sensitivity
  stateStore.setProfileSearchQuery(query);
  console.log(query);

  if (query === "" || !allExercises.value) {
    modalExercises.value = allExercises.value;
  } else {
    modalExercises.value = allExercises.value.filter((exercise) => {
      const exerciseName = exercise.name.toLowerCase(); // To ignore case sensitivity
      const subMuscle = exercise.SubMuscle.toLowerCase(); // To ignore case sensitivity
      const muscle = exercise.Muscle.toLowerCase(); // To ignore case sensitivity

      return (
        exerciseName.indexOf(query) !== -1 || // Check if the query string is found in the name
        subMuscle.indexOf(query) !== -1 || // Check if the query string is found in the SubMuscle
        muscle.indexOf(query) !== -1 // Check if the query string is found in the Muscle
      );
    });

    if (showDoneExercises.value)
      modalExercises.value = modalExercises.value.filter(
        (exercise) => exercise.isWorkedOut
      );
    console.log(modalExercises.value);
  }
};

const loadAllExercises = async () => {
  const query = `SELECT DISTINCT
  Exercise.name,
  Exercise.description,
  MuscleGroup.Muscle,
  MuscleGroup.SubMuscle,
  CASE WHEN WorkoutExercise.ID IS NOT NULL THEN 1 ELSE 0 END AS isWorkedOut
FROM
  Exercise
INNER JOIN
  MuscleGroup
ON
  Exercise.muscleGroup = MuscleGroup.ID
LEFT JOIN
  WorkoutExercise
ON
  Exercise.Name = WorkoutExercise.exercise
  ORDER BY Exercise.Name ASC
`;

  const resp = await databaseStore.getDatabase()?.query(query);
  allExercises.value = resp?.values ? resp.values : [];
};

const deleteExercise = async (name: string) => {
  const query = `DELETE FROM Exercise WHERE name = '${name}'`;
  await databaseStore.getDatabase()?.run(query);
  await loadAllExercises();
  modalExercises.value = allExercises.value;
};

// const toggleAccordion = () => {
//   if (!accordionGroup.value) {
//     return;
//   }
//   const nativeEl = accordionGroup.value.$el;

//   if (nativeEl.value === "second") {
//     nativeEl.value = undefined;
//   } else {
//     nativeEl.value = "second";
//   }
// };
</script>

<style scoped></style>
