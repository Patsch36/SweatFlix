import { store } from "@/stores/IonicStorage";
import { useDatabaseStore } from "@/stores/databaseStore";

class WorkoutGenerator {
  private db: any;
  private exercises!: (() => IterableIterator<any>) | never[];

  private desiredWeight: any;
  private height: any;
  private age: any;
  private gender: any;
  private workoutDays!: {
    Mondays: boolean;
    Tuesdays: boolean;
    Wednesdays: boolean;
    Thursdays: boolean;
    Fridays: boolean;
    Saturdays: boolean;
    Sundays: boolean;
  };
  private activityLevel: any;
  private goalAnatomy: any;

  constructor() {
    this.getPersonalData().then(() => {
      const query = `SELECT * FROM Exercise;`;
      this.db = useDatabaseStore().getDatabase();
      this.db?.query(query).then((exercises: any[]) => {
        this.exercises = exercises.values ? exercises.values : [];
      });
    });
  }

  public generateWorkout() {
    if (!this.checkData()) {
      this.getPersonalData().then(() => {
        const query = `SELECT * FROM Exercise;`;
        this.db = useDatabaseStore().getDatabase();
        this.db?.query(query).then((exercises: any[]) => {
          this.exercises = exercises.values ? exercises.values : [];

          this.generate();
        });
      });
    } else {
      this.generate();
    }
  }

  private generate() {}

  private checkData() {
    return (
      this.desiredWeight &&
      this.height &&
      this.age &&
      this.gender &&
      this.workoutDays &&
      this.activityLevel &&
      this.goalAnatomy &&
      this.exercises
    );
  }

  private async getPersonalData() {
    this.desiredWeight = await store.get("Weight Goal");
    this.height = (await store.get("Height")) || 0;
    this.age = (await store.get("Age")) || 0;
    this.gender = (await store.get("Gender")) || "";
    this.activityLevel = (await store.get("Activity Level")) || "";
    this.workoutDays = JSON.parse(await store.get("Workout Days")) || {
      Mondays: true,
      Tuesdays: true,
      Wednesdays: true,
      Thursdays: true,
      Fridays: true,
      Saturdays: false,
      Sundays: false,
    };
    this.goalAnatomy = (await store.get("GoalAnatomy")) || "";
  }
}
