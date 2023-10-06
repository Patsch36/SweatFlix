import { Storage } from "@ionic/storage";
import { set } from "cypress/types/lodash";

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
  await store.set("Age", 0);
  await store.set("Height", 0);
  await store.set("Gender", "");
  await store.set("Activity Level", 0);
  await store.set(
    "Workout Days",
    `{
      Mondays: true,
      Tuesdays: true,
      Wednesdays: true,
      Thursdays: true,
      Fridays: true,
      Saturdays: false,
      Sundays: false,
    }`
  );
  await store.set("Backpain", "no");
};
