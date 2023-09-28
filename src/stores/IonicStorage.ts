import { Storage } from "@ionic/storage";

export const store = new Storage();

export const initKeyValuePairs = async () => {
  await store.set("Active Plan", "No Plan");
  await store.set("Next/Last Workout", "calendar");
};
