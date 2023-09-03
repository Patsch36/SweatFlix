import { ref } from "vue";
import { DateObj, ColorInfo, availableColors } from "./CalendarTypes";
import { useDatabaseStore } from "@/stores/databaseStore";
import { DatetimeCustomEvent } from "@ionic/core";

export class CalendarManager {
  public highlightedDates: DateObj[] = [];

  public datepick = ref<string | string[] | null | undefined>(["2023-08-05"]);

  private queryResults = ref<any>(null);
  public getQueryResults = () => this.queryResults.value;
  private queryDatesResult = ref<any>(null);
  public getQueryDatesResult = () => this.queryDatesResult.value;
  private databaseStore = useDatabaseStore();
  private operation = "";

  private modalOpen = ref(false);
  public isModalOpen = () => this.modalOpen.value;
  public closeModal = () => (this.modalOpen.value = false);
  public openModal = () => (this.modalOpen.value = true);

  nstructor() {
    console.log("CalendarManager constructor");
  }

  public loadWorkouts = async () => {
    const query = `SELECT Name, Split, Color, active FROM WorkoutTemplate WHERE active = 1`;

    const resp = await this.databaseStore.getDatabase()?.query(query);
    this.queryResults.value = resp?.values || [];

    if (this.queryResults.value && this.queryResults.value.length > 0) {
      this.queryResults.value.reverse();
    }
  };

  public loadDates = async () => {
    const query = `SELECT Workout.startdate, WorkoutTemplate.Color FROM Workout INNER JOIN WorkoutTemplate ON Workout.workoutname = WorkoutTemplate.Name`;

    const resp = await this.databaseStore.getDatabase()?.query(query);
    this.queryDatesResult.value = resp?.values || [];

    this.queryDatesResult.value.forEach(
      (workout: { startdate: string; Color: string }) => {
        if (
          !this.highlightedDates.some(
            (dateObj) => dateObj.date === workout.startdate.slice(0, 10)
          )
        ) {
          this.highlightedDates.push({
            date: workout.startdate.slice(0, 10),
            textColor: `var(--${workout.Color}-color)`,
            backgroundColor: `var(--${workout.Color}-background)`,
          });
        }
      }
    );
  };

  public reset = (datetime: any) => datetime.value.$el.reset();
  public confirm = (datetime: any) => {
    alert(datetime.value);
    this.operation = "confirm";
    datetime.value.$el.confirm();
  };

  public removeSelected = (datetime: any) => {
    this.operation = "removeSelected";
    datetime.value.$el.confirm();
  };

  public onDateChange = (event: DatetimeCustomEvent, datetime: any) => {
    this.datepick.value = event.detail.value;
    if (this.datepick.value === null || this.datepick.value === undefined) {
      this.datepick.value = [];
    }
    alert(this.operation);
    if (this.operation == "removeSelected") this.removeValues();
    else if (this.operation === "confirm") this.modalOpen.value = true; //addValues();

    console.log(this.highlightedDates);
    datetime.value.$forceUpdate();
    this.reset(datetime);
  };

  private removeValues = () => {
    // Get the selected dates from datepick.value
    const selectedDates = this.datepick.value;

    if (typeof selectedDates === "string" || !selectedDates) {
      return;
    }

    // Remove selected dates from the highlightedDates array
    selectedDates.forEach((selectedDate) => {
      const indexToRemove = this.highlightedDates.findIndex(
        (dateObj) => dateObj.date === selectedDate
      );
      if (indexToRemove !== -1) {
        this.highlightedDates.splice(indexToRemove, 1);
      }
    });
  };

  public addValues = (category: string) => {
    const selectedDates = this.datepick.value;

    if (!selectedDates || typeof selectedDates === "string") {
      return;
    }

    // translate category to color
    // let color = "";
    // switch (category) {
    //   case "pull":
    //     color = "rose";
    //     break;
    //   case "push":
    //     color = "mint";
    //     break;
    //   case "leg":
    //     color = "violet";
    //     break;
    //   case "core":
    //     color = "mindaro";
    //     break;
    //   case "arms":
    //     color = "turquoise";
    //     break;
    //   case "cardio":
    //     color = "orange";
    //     break;
    //   default:
    //     color = "cerulean";
    //     break;
    // }

    const colorInfo: ColorInfo = availableColors[category];

    selectedDates.forEach((selectedDate: string) => {
      if (
        !this.highlightedDates.some((dateObj) => dateObj.date === selectedDate)
      ) {
        this.highlightedDates.push({
          date: selectedDate,
          textColor: colorInfo.color,
          backgroundColor: colorInfo.background,
        });
      }
    });
  };
}
