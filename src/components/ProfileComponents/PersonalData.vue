<template>
  <ion-item>
    <ion-label>Name</ion-label>
    <ion-input v-model="name" placeholder="Name"></ion-input>
    <ion-button @click="setName"> Submit </ion-button>
  </ion-item>
  <ion-item>
    <ion-label type="number">Desired Weight</ion-label>
    <ion-input
      type="number"
      v-model="desiredWeight"
      placeholder="Weight as Number"></ion-input>
    <ion-button @click="store.set('Weight Goal', desiredWeight)">
      Submit
    </ion-button>
  </ion-item>
  <ion-item>
    <ion-label>Height</ion-label>
    <ion-input
      type="number"
      v-model="height"
      placeholder="Height in cm"></ion-input>
    <ion-button @click="store.set('Height', height)"> Submit </ion-button>
  </ion-item>
  <ion-item>
    <ion-label>Age</ion-label>
    <ion-input
      type="number"
      placeholder="Age in years"
      v-model="age"></ion-input>
    <ion-button @click="store.set('Age', age)"> Submit </ion-button>
  </ion-item>
  <ion-item>
    <ion-label>Anatomy/ Physics</ion-label>
    <ion-select
      interface="action-sheet"
      v-model="gender"
      @ionChange="store.set('Gender', gender)">
      <ion-select-option value="male"> male </ion-select-option>
      <ion-select-option value="female"> female </ion-select-option>
    </ion-select>
  </ion-item>
  <ion-item>
    <ion-label>Activity Level</ion-label>
    <ion-select
      interface="action-sheet"
      v-model="activityLevel"
      @ionChange="store.set('Activity Level', activityLevel)">
      <ion-select-option value="Beginner"> Beginner </ion-select-option>
      <ion-select-option value="Intermediate"> Intermediate </ion-select-option>
      <ion-select-option value="Advanced"> Advanced </ion-select-option>
      <ion-select-option value="Semi-Professional">
        Semi-Professional
      </ion-select-option>
      <ion-select-option value="Professional"> Professional </ion-select-option>
    </ion-select>
  </ion-item>
  <ion-item>
    <ion-label>Goal Anatomy</ion-label>
    <ion-select
      interface="action-sheet"
      v-model="goalAnatomy"
      @ionChange="store.set('GoalAnatomy', goalAnatomy)">
      <ion-select-option value="GetShredded"> Get Shredded </ion-select-option>
      <ion-select-option value="LooseWeight"> Loose Weight </ion-select-option>
      <ion-select-option value="Maintain"> Maintain </ion-select-option>
      <ion-select-option value="BuildMuscles">
        Build Muscles
      </ion-select-option>
      <ion-select-option value="GetStrong"> Get Strong </ion-select-option>
    </ion-select>
  </ion-item>
  <ion-item>
    <ion-label>Workout Days</ion-label>
    <div class="possibleOptions">
      <ion-item>
        <ion-checkbox
          labelPlacement="end"
          justify="start"
          v-model="workoutDays.Mondays"
          @ionChange="store.set('Workout Days', JSON.stringify(workoutDays))">
          Mondays
        </ion-checkbox>
      </ion-item>
      <ion-item>
        <ion-checkbox
          labelPlacement="end"
          justify="start"
          v-model="workoutDays.Tuesdays"
          @ionChange="store.set('Workout Days', JSON.stringify(workoutDays))">
          Tuesdays
        </ion-checkbox>
      </ion-item>
      <ion-item>
        <ion-checkbox
          labelPlacement="end"
          justify="start"
          v-model="workoutDays.Wednesdays"
          @ionChange="store.set('Workout Days', JSON.stringify(workoutDays))">
          Wednesdays
        </ion-checkbox>
      </ion-item>
      <ion-item>
        <ion-checkbox
          labelPlacement="end"
          justify="start"
          v-model="workoutDays.Thursdays"
          @ionChange="store.set('Workout Days', JSON.stringify(workoutDays))">
          Thursdays
        </ion-checkbox>
      </ion-item>
      <ion-item>
        <ion-checkbox
          labelPlacement="end"
          justify="start"
          v-model="workoutDays.Fridays"
          @ionChange="store.set('Workout Days', JSON.stringify(workoutDays))">
          Fridays
        </ion-checkbox>
      </ion-item>
      <ion-item>
        <ion-checkbox
          labelPlacement="end"
          justify="start"
          v-model="workoutDays.Saturdays"
          @ionChange="store.set('Workout Days', JSON.stringify(workoutDays))">
          Saturdays
        </ion-checkbox>
      </ion-item>
      <ion-item lines="none">
        <ion-checkbox
          labelPlacement="end"
          justify="start"
          v-model="workoutDays.Sundays"
          @ionChange="store.set('Workout Days', JSON.stringify(workoutDays))">
          Sundays
        </ion-checkbox>
      </ion-item>
    </div>
  </ion-item>
  <ion-item>
    <ion-label>Health sheet</ion-label>
    <ion-button @click="router.push('/HealthSheet')">fill out</ion-button>
  </ion-item>
  <ion-item>
    <ion-label>Focused Muscles</ion-label>
  </ion-item>
  <ion-item>
    <ion-label>Body measurements</ion-label>
  </ion-item>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
} from "@ionic/vue";
import { onBeforeMount, ref } from "vue";
import { store } from "@/stores/IonicStorage";
import { useRouter } from "vue-router";
import { useDatabaseStore } from "@/stores/databaseStore";

const router = useRouter();
const databasestore = useDatabaseStore();

// ======================================================================
const name = ref();
const desiredWeight = ref();
const height = ref();
const age = ref();
const gender = ref();
const workoutDays = ref<{
  Mondays: boolean;
  Tuesdays: boolean;
  Wednesdays: boolean;
  Thursdays: boolean;
  Fridays: boolean;
  Saturdays: boolean;
  Sundays: boolean;
}>({
  Mondays: true,
  Tuesdays: true,
  Wednesdays: true,
  Thursdays: true,
  Fridays: true,
  Saturdays: false,
  Sundays: false,
});
const activityLevel = ref();
const goalAnatomy = ref();

onBeforeMount(async () => {
  name.value = (await store.get("Name")) || "";
  desiredWeight.value = await store.get("Weight Goal");
  height.value = (await store.get("Height")) || 0;
  age.value = (await store.get("Age")) || 0;
  gender.value = (await store.get("Gender")) || "";
  activityLevel.value = (await store.get("Activity Level")) || "";
  workoutDays.value = JSON.parse(await store.get("Workout Days")) || {
    Mondays: true,
    Tuesdays: true,
    Wednesdays: true,
    Thursdays: true,
    Fridays: true,
    Saturdays: false,
    Sundays: false,
  };
  goalAnatomy.value = (await store.get("GoalAnatomy")) || "";
});

// const workoutdays = JSON.parse(await store.get("Workout Days"));
// workoutDays.value = JSON.parse(await store.get("Workout Days")) || {
//   Mondays: true,
//   Tuesdays: true,
//   Wednesdays: true,
//   Thursdays: true,
//   Fridays: true,
//   Saturdays: false,
//   Sundays: false,
// };

const setName = async () => {
  await store.set("Name", name.value);
  if (name.value.includes("Alf"))
    await databasestore.getDatabase()
      ?.run(`INSERT INTO Achievements (name, description, imageURL, achieved, obtained)
      VALUES ('Alf the Alien', 'Congratulation, your´re also from Melmac!', 'alf', 1, datetime('now'))`);
  else
    await databasestore
      .getDatabase()
      ?.run(`DELETE FROM Achievements WHERE name = 'Alf the Alien'`);
};
</script>

<style scoped>
.searchbar-container {
  display: flex;
  flex-direction: row;
}
</style>
