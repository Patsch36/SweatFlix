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
        :animated="true"
        :multiple="true">
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
              <ion-button fill="outline" color="light" style="width: 47.5%">
                Show done exercises
              </ion-button>
            </div>
            <ion-searchbar
              @ionInput="handleInput($event)"
              placeholder="Search"></ion-searchbar>
            <ion-list>
              <ion-list-header>
                <ion-label>Exercises</ion-label>
                <ion-label style="text-align: end; margin-right: 24px">
                  Sets
                </ion-label>
              </ion-list-header>
              <ion-item-sliding
                v-for="exercise in modalExercises"
                :key="exercise.name">
                <ion-item @click="router.push(`/exercise/${exercise.name}`)">
                  <ion-label>
                    <span style="color: white">{{ exercise.name }}</span>
                    <ion-label color="medium">{{
                      exercise.SubMuscle
                    }}</ion-label>
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
  IonButton,
  IonTextarea,
  IonAccordion,
  IonAccordionGroup,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonListHeader,
} from "@ionic/vue";
import { onBeforeMount, ref } from "vue";
import { useDatabaseStore } from "@/stores/databaseStore";
import { Exercise } from "@/datatypes/Exercise";
import { useRouter } from "vue-router";
import { useStateStore } from "@/stores/stateStore";
import AddExercise from "@/components/addExercise.vue";
import { trashOutline } from "ionicons/icons";

const stateStore = useStateStore();
const databaseStore = useDatabaseStore();
const router = useRouter();

const query = ref("");
const data = ref();

const allExercises = ref<Exercise[]>([]);
const modalExercises = ref<Exercise[]>([]);

const accordionGroup = ref(null);

onBeforeMount(async () => {
  await loadAllExercises();
  modalExercises.value = allExercises.value;
});

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

const handleInput = (event: any) => {
  const query = event.target.value.toLowerCase(); // To ignore case sensitivity
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
    console.log(modalExercises.value);
  }
};

const loadAllExercises = async () => {
  const query = `SELECT Exercise.name, Exercise.description, MuscleGroup.Muscle, MuscleGroup.SubMuscle FROM Exercise INNER JOIN MuscleGroup on Exercise.muscleGroup = MuscleGroup.ID`;

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
