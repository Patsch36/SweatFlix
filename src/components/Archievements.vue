<template>
  <ion-list>
    <ion-item
      v-for="achievement in data"
      :key="achievement.id"
      @click="selectedAchievement = achievement">
      <ion-avatar slot="start">
        <ion-img
          alt="Silhouette of a person's head"
          :src="
            achievement.imageURL.length > 0 && achievement.obtained
              ? `./assets/Achievements/${achievement.imageURL}.png`
              : 'https://ionicframework.com/docs/img/demos/avatar.svg'
          " />
      </ion-avatar>
      <!-- <ion-img slot="start" src="./assets/backpain_female.png"> </ion-img> -->
      <ion-label>{{ achievement.name }}</ion-label>
    </ion-item>
  </ion-list>
  <ion-modal
    :isOpen="selectedAchievement && selectedAchievement.name.length > 0">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button :strong="true" @click="selectedAchievement = null">
            Close
          </ion-button>
        </ion-buttons>
        <ion-title v-if="selectedAchievement">{{
          selectedAchievement.name
        }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" v-if="selectedAchievement">
      <ion-img
        :src="
          selectedAchievement.imageURL.length > 0 &&
          selectedAchievement.obtained
            ? `./assets/Achievements/${selectedAchievement.imageURL}.png`
            : 'https://ionicframework.com/docs/img/demos/avatar.svg'
        "
        class="bigAchievementImage">
      </ion-img>
      <h4 class="achievement-description">
        {{ selectedAchievement.description }}
      </h4>
      <h6 class="achievement-description" v-if="selectedAchievement.obtained">
        Obtained: {{ new Date(selectedAchievement.obtained).toLocaleString() }}
      </h6>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonItem,
  IonLabel,
  IonList,
  IonAvatar,
  IonImg,
  IonModal,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/vue";
import { onBeforeMount, ref } from "vue";
import { useDatabaseStore } from "@/stores/databaseStore";
import { useStateStore } from "@/stores/stateStore";

const stateStore = useStateStore();
const databaseStore = useDatabaseStore();

const data = ref();
const selectedAchievement = ref();

const loadAchievements = async () => {
  const query = "SELECT * FROM achievements";
  const resp = await databaseStore.getDatabase()?.query(query);
  data.value = resp?.values ? resp.values : [];
};

onBeforeMount(async () => {
  await loadAchievements();
});

// Update achievements set imageURL = 'codecompiler' Where id = 30
</script>

<style scoped>
.bigAchievementImage {
  margin-block: 50px;
  width: 85%;
  max-height: 85%;
  margin-inline: auto;
}
.achievement-description {
  max-width: 85% !important;
  text-align: center !important;
  margin-inline: auto !important;
}
</style>
