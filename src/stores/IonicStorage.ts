import { Storage } from "@ionic/storage";

export const store = new Storage();

export const initKeyValuePairs = async () => {
  await store.set("Active Plan", "No Plan");
  await store.set("Next/Last Workout", "calendar");
  await store.set("Current Workout Index", "0");
  await store.set(
    "Current Workout Index Changed",
    `${new Date().toLocaleDateString()}`
  );
  await store.set("Rest", "");
  await store.set("Weight Goal", 0);
};
