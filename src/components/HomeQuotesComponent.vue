<template>
  <h1>Quotes</h1>
  <div class="quotebox">
    <p>{{ quote }}</p>
    <p>{{ author }}</p>
  </div>
</template>

<script setup lang="ts">
import { quotesEnglish } from "@/datatypes/quotes";
import { store } from "@/stores/IonicStorage";
import { onBeforeMount, ref } from "vue";

const quote = ref("");
const author = ref("");

onBeforeMount(async () => {
  let index = await store.get("QuotesIndex");
  let quotesIndexSetDate = await store.get("QuotesIndexSetDate");
  if (index === undefined) {
    index = 0;
    store.set("QuotesIndex", index);
    quotesIndexSetDate = new Date().setHours(0, 0, 0, 0);
    store.set("QuotesIndexSetDate", quotesIndexSetDate);
  }

  if (quotesIndexSetDate < new Date().setHours(0, 0, 0, 0)) {
    index = (index + 1) % quotesEnglish.length;
    store.set("QuotesIndex", index);
    quotesIndexSetDate = new Date().setHours(0, 0, 0, 0);
    store.set("QuotesIndexSetDate", quotesIndexSetDate);
  }
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
  -webkit-box-shadow: -10px 0px 13px -7px #000000, 10px 0px 13px -7px #000000,
    5px 6px 33px 4px rgba(0, 0, 0, 0.33);
  box-shadow: -10px 0px 13px -7px #000000, 10px 0px 13px -7px #000000,
    5px 6px 33px 4px rgba(0, 0, 0, 0.33);
}

p {
  width: 100%;
  hyphens: auto;
}

p:nth-child(2) {
  text-align: right;
  font-style: italic;
  margin-block: 0;
  margin-bottom: 16px;
}
</style>
