// store.ts
import { defineStore } from "pinia";

export const useSelectedDateStore = defineStore("selectedDate", {
  state: () => ({
    selctedDate: "",
  }),
  actions: {
    setDate(date: typeof this.selctedDate) {
      this.selctedDate = date;
    },
    getDate() {
      return this.selctedDate;
    },
  },
});
