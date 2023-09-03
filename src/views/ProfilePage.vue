<template>
  <ion-page>
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

      <strong>Ready to create an app?</strong>
      <p>
        Start with Ionic
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://ionicframework.com/docs/components"
          >UI Components</a
        >
      </p>
      <ion-button color="primary" router-link="/home">Home</ion-button>
    </ion-content>
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
} from "@ionic/vue";
</script>

<style scoped></style>
