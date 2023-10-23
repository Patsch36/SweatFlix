<template>
  <ion-modal ref="modal" :isOpen="modalOpen">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="cancel()">
            <ion-icon slot="start" :icon="chevronBack"></ion-icon>
            Cancel
          </ion-button>
        </ion-buttons>
        <ion-title>Edit Plan</ion-title>
        <ion-buttons slot="end">
          <ion-button :strong="true" @click="confirmModal()">
            <ion-icon slot="end" :icon="saveOutline"></ion-icon>
            Save
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" v-if="plan">
      <ion-item>
        <ion-textarea
          label="Description"
          :auto-grow="true"
          v-model="plan.description"
          :rows="1">
        </ion-textarea>
      </ion-item>
      <ion-item>
        <!-- <ion-input label="Type" v-model="plan.type"></ion-input> -->
        <ion-select
          label="Choose your Plan Type"
          interface="action-sheet"
          :value="plan.type"
          @ionChange="plan.type = $event.target.value">
          <ion-select-option value="Strength training">
            Strength Training
          </ion-select-option>
          <ion-select-option value="Mass training">
            Mass Training
          </ion-select-option>
          <ion-select-option value="Cut training">
            Cut Training
          </ion-select-option>
          <ion-select-option value="Cardio">Cardio</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item>
        <!-- <ion-input label="Place" v-model="plan.place"></ion-input> -->
        <ion-select
          label="Choose your Place"
          interface="action-sheet"
          :value="plan.place"
          @ionChange="plan.place = $event.target.value">
          <ion-select-option value="Gym"> Gym </ion-select-option>
          <ion-select-option value="Calisthenic Park">
            Calisthenic Park
          </ion-select-option>
          <ion-select-option value="Home"> Home </ion-select-option>
          <ion-select-option value="Outdoor">Outdoor</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item>
        <!-- <ion-input label="Split" v-model="plan.split"></ion-input> -->
        <ion-select
          label="Choose your Split"
          interface="action-sheet"
          :value="plan.split"
          @ionChange="plan.split = $event.target.value">
          <ion-select-option value="1-way split">
            1-way split
          </ion-select-option>
          <ion-select-option value="2-way split">
            2-way split
          </ion-select-option>
          <ion-select-option value="3-way split">
            3-way split
          </ion-select-option>
          <ion-select-option value="4-way split">
            4-way split
          </ion-select-option>
          <ion-select-option value="5-way split">
            5-way split
          </ion-select-option>
          <ion-select-option value="6-way-split">
            6-way-split
          </ion-select-option>
          <ion-select-option value="7-waysplit"> 7-waysplit </ion-select-option>
          <ion-select-option value="8-way split">
            8-way split
          </ion-select-option>
        </ion-select>
      </ion-item>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { useDatabaseStore } from "@/stores/databaseStore";
import { useStateStore } from "@/stores/stateStore";
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonItem,
  IonButtons,
  IonButton,
  IonModal,
  IonTextarea,
  IonSelect,
  IonSelectOption,
} from "@ionic/vue";
import { chevronBack, saveOutline } from "ionicons/icons";
import { onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";

const databaseStore = useDatabaseStore();
const stateStore = useStateStore();
const modalOpen = ref(false);
const route = useRoute();
const emits = defineEmits(["reloadPlan"]);

const plan = ref();

stateStore.$subscribe((mutation, state) => {
  modalOpen.value = state.showEditPlanModal;
});

const loadPlan = async () => {
  const query = `SELECT * FROM Plan WHERE ID = ${route.params.id}`;
  const resp = await databaseStore.getDatabase()?.query(query);
  plan.value = resp?.values
    ? resp.values[0]
    : {
        name: "NotFound",
        ID: 0,
        description: "NotFound",
        type: "NotFound",
        place: "NotFound",
        split: "NotFound",
        scheme: "NotFound",
      };
};

onBeforeMount(async () => {
  await loadPlan();
});

const confirmModal = async () => {
  stateStore.setShowEditPlanModal(false);
  // Save everything to database
  const query = `UPDATE Plan SET Description = '${plan.value.description}', Type = '${plan.value.type}', Place = '${plan.value.place}', Split = '${plan.value.split}' WHERE ID = ${plan.value.ID}`;
  await databaseStore.getDatabase()?.query(query);
  emits("reloadPlan");
};

const cancel = async () => {
  stateStore.setShowEditPlanModal(false);
};
</script>
