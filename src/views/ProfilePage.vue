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
        :value="stateStore.openedProfileAccordion">
        <ion-accordion value="exercises">
          <ion-item slot="header" color="primary">
            <ion-label>Exercises</ion-label>
          </ion-item>
          <div class="ion-padding" slot="content">
            <ExerciseManager />
          </div>
        </ion-accordion>
        <ion-accordion value="personalData">
          <ion-item slot="header" color="primary">
            <ion-label>Personal Data</ion-label>
          </ion-item>
          <div class="ion-padding" slot="content">
            <PersonalData />
          </div>
        </ion-accordion>
        <ion-accordion value="settings">
          <ion-item slot="header" color="primary">
            <ion-label>Settings</ion-label>
          </ion-item>
          <div class="ion-padding" slot="content">
            <Settings />
          </div>
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
} from "@ionic/vue";
import { onBeforeMount, ref } from "vue";
import { useDatabaseStore } from "@/stores/databaseStore";
import { useStateStore } from "@/stores/stateStore";
import ExerciseManager from "@/components/ExerciseManager.vue";
import PersonalData from "@/components/PersonalData.vue";
import Settings from "@/components/Settings.vue";

const stateStore = useStateStore();
const databaseStore = useDatabaseStore();

const query = ref("");
const data = ref();

const accordionGroup = ref(null);

const accordionGroupChanged = (event: any) => {
  console.log(event);
  stateStore.setOpenedProfileAccordion(event.detail.value);
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

<style scoped>
.searchbar-container {
  display: flex;
  flex-direction: row;
}
</style>
