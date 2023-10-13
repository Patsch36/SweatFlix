<template>
  <h1>Quotes</h1>
  <div class="quotebox">
    <p>{{ quote }}</p>
    <p>{{ author }}</p>
  </div>
</template>

<script setup lang="ts">
import { quotesEnglish } from "@/datatypes/quotes";
import { onBeforeMount, ref } from "vue";

const quote = ref("");
const author = ref("");

onBeforeMount(() => {
  const date = new Date().setHours(0, 0, 0, 0);
  const index = date % quotesEnglish.length;
  const quoteParts = quotesEnglish[index].split(" - ");
  quote.value = quoteParts[0];
  author.value = quoteParts[1];
});
</script>

<style scoped>
.quotebox {
  border: 5px solid var(--ion-color-primary);
  background-color: var(--ion-color-dark-shade);
  margin-inline: 16px;
  border-radius: 16px;
  padding-inline: 16px;
}

p {
  width: 100%;
  hyphens: auto;
}

p:nth-child(2) {
  text-align: right;
  font-style: italic;
}
</style>
