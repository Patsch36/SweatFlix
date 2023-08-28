<template>
  <div>
    <router-view />
    <div class="fixed-tab-bar">
      <router-link to="/home" class="tab-link" active-class="active">
        <ion-icon :icon="home" size="large" />
        <span>Home</span>
      </router-link>

      <router-link to="/calendar" class="tab-link" active-class="active">
        <ion-icon :icon="calendar" size="large" />
        <span>Calendar</span>
      </router-link>

      <router-link to="/workouts" class="tab-link" active-class="active">
        <ion-icon :icon="man" size="large" />
        <span>Workouts</span>
      </router-link>

      <router-link to="/foodtracking" class="tab-link" active-class="active">
        <ion-icon :icon="restaurant" size="large" />
        <span>Tracking</span>
      </router-link>

      <router-link to="/profile" class="tab-link" active-class="active">
        <ion-icon :icon="personCircle" size="large" />
        <span>Profil</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { home, calendar, personCircle, man, restaurant } from "ionicons/icons";
</script>

<style>
.fixed-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  background-color: rgb(26, 26, 26);
  padding: 5px;
  padding-inline: 20px;
  padding-bottom: 16px;
}

.tab-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #333;
}

.tab-link span {
  text-decoration: none;
  margin-top: 4px;
}

.active {
  color: var(--ion-color-accent);
}
</style>
