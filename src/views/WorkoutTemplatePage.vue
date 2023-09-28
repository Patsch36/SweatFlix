<template>
  <ion-page style="height: calc(100vh - 100px)">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ workout }}</ion-title>
        <div class="icon">
          <ion-icon
            :icon="chevronBack"
            @click="router.go(-1)"
            size="large"
            color="primary"></ion-icon>
          <ion-label @click="router.go(-1)" color="primary">Back</ion-label>
        </div>
        <div
          @click="router.push(`/workouttemplateEdit/${workout}`)"
          class="icon"
          slot="end"
          style="margin-right: 16px">
          <ion-icon
            :icon="pencilOutline"
            style="font-size: 24px; margin-right: 8px"
            color="primary"></ion-icon>
          <ion-label color="primary">Edit</ion-label>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense" style="padding-inline: 0.75rem">
        <ion-toolbar>
          <!-- <ion-title size="large">{{ workout }}</ion-title> -->
          <h1 style="font-weight: bold; font-size: 32px">{{ workout }}</h1>
        </ion-toolbar>
      </ion-header>
      <div style="padding-inline: 0.75rem" v-if="template">
        <ion-grid>
          <ion-row>
            <ion-col>
              <b>Focused Muscles</b>
              <br />
              {{ template.Split }}
            </ion-col>
            <ion-col>
              <b>Color</b>

              <p
                v-if="template.active"
                :style="{
                  color: `var(--${template.Color}-color)`,
                  backgroundColor: `var(--${template.Color}-background)`,
                  paddingInline: '8px',
                  margin: '0px',
                  maxWidth: 'min-content',
                }">
                {{ template.Color }}
              </p>
              <p v-else style="margin: 0">Not Active</p>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <b>Description</b>
              <br />
              {{ template.Description }}
            </ion-col>
          </ion-row>
        </ion-grid>

        <ion-list v-show="exercises.length">
          <ion-list-header>
            <ion-label>Exercises</ion-label>
            <ion-label style="text-align: end; margin-right: 24px"
              >Sets</ion-label
            >
          </ion-list-header>
          <ion-item-sliding v-for="(exercise, index) in exercises" :key="index">
            <ion-item>
              <ion-label
                >{{ exercise.exerciseName }}, {{ exercise.id }}</ion-label
              >
              <ion-label slot="end">
                {{ exercise.sets }} x {{ exercise.reps }}
              </ion-label>
            </ion-item>
            <ion-item-options>
              <ion-item-option color="danger">
                <ion-button
                  color="transparent"
                  @click="
                    remove(exercise.exerciseName, exercise.sets, exercise.reps)
                  ">
                  <ion-icon slot="icon-only" :icon="trash"></ion-icon>
                </ion-button>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>

        <h5 v-if="results">Absolved Workouts</h5>
        <ion-searchbar
          @ionInput="handleInput($event)"
          v-if="results"></ion-searchbar>
        <ion-chip
          :outline="true"
          color="light"
          v-for="date in results"
          key="date"
          @click="router.push(`/workoutdetails/${date}`)">
          <ion-icon :icon="barbell" color="light"></ion-icon>
          <ion-label>{{ new Date(date).toLocaleDateString() }}</ion-label>
        </ion-chip>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { chevronBack, pencilOutline, trash, barbell } from "ionicons/icons";
import {
  IonIcon,
  IonLabel,
  IonContent,
  IonTitle,
  IonToolbar,
  IonHeader,
  IonPage,
  IonList,
  IonItem,
  IonListHeader,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonButton,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonSearchbar,
} from "@ionic/vue";
import { useDatabaseStore } from "@/stores/databaseStore";
const databaseStore = useDatabaseStore();

const route = useRoute();
const router = useRouter();

const workout = ref();

const template = ref();
const exercises = ref();
const dates = ref();

const results = ref([]);

const loadWorkoutTemplate = async () => {
  const query = `SELECT Split, Description, Color, active FROM WorkoutTemplate WHERE name = '${workout.value}'`;

  const resp = await databaseStore.getDatabase()?.query(query);
  template.value = resp?.values ? resp.values[0] : {};
};

const loadWorkoutExcercises = async () => {
  const query = `SELECT exerciseName, sets, reps, ID FROM WorkoutList WHERE workoutPlan = '${workout.value}'`;

  const resp = await databaseStore.getDatabase()?.query(query);
  exercises.value = resp?.values ? resp.values : [];
  exercises.value.sort((a: any, b: any) => a.id - b.id);
};

const loadWorkoutDates = async () => {
  const query = `SELECT startdate FROM Workout WHERE workoutname = '${workout.value}'`;

  const resp = await databaseStore.getDatabase()?.query(query);
  dates.value = resp?.values ? resp.values : [];

  if (dates.value.length) {
    for (let i = 0; i < dates.value.length; i++) {
      // dates.value[i] = new Date(dates.value[i].startdate);
      dates.value[i] = dates.value[i].startdate;
    }
    // sort latest date first
    dates.value.sort(
      (a: string | number | Date, b: string | number | Date) =>
        new Date(b).getTime() - new Date(a).getTime()
    );
    results.value = dates.value;
  }
};

onBeforeMount(() => {
  workout.value = route.params.id;
  loadWorkoutTemplate();
  loadWorkoutExcercises();
  loadWorkoutDates();
  results.value = dates.value;
});

const getEnglishMonthName = (query: string) => {
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  const monthIndex = months.findIndex((month) => month.includes(query));

  if (monthIndex !== -1) {
    return monthIndex + 1;
  }

  return "";
};

const handleInput = (event: any) => {
  const query = event.target.value.toLowerCase();
  const month = getEnglishMonthName(query.split(" ")[0]);
  console.log(query);
  console.log(`Monthname: ${getEnglishMonthName(query)}`);

  if (month === "") {
    results.value = dates.value.filter(
      (d: string) =>
        new Date(d).toLocaleDateString().toLowerCase().indexOf(query) > -1
    );
  } else {
    if (query.split(" ").length > 1) {
      results.value = dates.value.filter(
        (d: string) =>
          new Date(d)
            .toLocaleDateString()
            .toLowerCase()
            .includes(`.${month}.`) &&
          new Date(d)
            .toLocaleDateString()
            .toLowerCase()
            .indexOf(query.split(" ")[1]) > -1
      );
    } else {
      results.value = dates.value.filter((d: string) =>
        new Date(d).toLocaleDateString().toLowerCase().includes(`.${month}.`)
      );
    }
  }
};

const remove = async (name: any, sets: any, reps: any) => {
  const query = `DELETE FROM WorkoutList WHERE exerciseName = '${name}' AND sets = ${sets} AND reps = '${reps}' AND workoutPlan = '${workout.value}'`;
  await databaseStore.getDatabase()?.run(query);
  loadWorkoutExcercises();
};
</script>

<style scoped>
.icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
