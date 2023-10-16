import { store } from "@/stores/IonicStorage";
import { useDatabaseStore } from "@/stores/databaseStore";
import { Muscle, getAllMusclesFromSplit } from "./splitCalculator";
import { includes } from "cypress/types/lodash";

interface MuscleGroup {
  musclegroup: number;
  muscletrainfactor: number;
}

interface WorkoutExercise {
  exercisename: string;
  reps: string;
  sets: number;
}

export class WorkoutGenerator {
  private db: any;
  private exercises: any;

  // =======

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

  // =======

  private split: string;

  constructor() {
    this.split = "";

    this.getPersonalData().then(() => {
      const query = `SELECT * FROM Exercise;`;
      this.db = useDatabaseStore().getDatabase();
      this.db?.query(query).then((res: any[]) => {
        this.exercises = res.values ? res.values : [];
      });
    });
  }

  /**
   * Generates a workout based on personal data and exercises from the database.
   * If personal data is not available, it will be fetched before generating the workout.
   */
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

  /**
   * Generates a workout by evaluating the split and creating the workout.
   */
  private generate() {
    this.split = this.evaluateSplit();
    this.createWorkout();
  }

  /**
   * Creates a workout based on the given split.
   * @private
   */
  private createWorkout() {
    const generatedWorkouts = this.split.split(";");
    for (let i = 0; i < generatedWorkouts.length; i++) {
      const mtf = this.getMuscleTrainFactor(generatedWorkouts[i]);
      const muscles = getAllMusclesFromSplit(generatedWorkouts[i]);

      let musclegroups: MuscleGroup[] = [];
      for (let muscle in muscles) {
        musclegroups.push({
          musclegroup: muscles[muscle],
          muscletrainfactor: mtf,
        });
      }

      // get random Exercise from this.exercises with first muscle group of musclegroups
      if (
        [
          "UpperBody",
          "Fullbody - Push",
          "Fullbody - Pull",
          "Fullbody",
        ].includes(generatedWorkouts[i])
      ) {
        this.createWorkoutForEachMuscleArea(generatedWorkouts[i]);
      } else {
        // TODO: Generate A and B workouts
        this.createWorkoutForEachMuscleGroup(
          musclegroups,
          generatedWorkouts[i]
        );
      }

      console.log(JSON.stringify(musclegroups));

      const query = `SELECT * FROM Exercise;`;
      this.db = useDatabaseStore().getDatabase();
      this.db?.query(query).then((res: any[]) => {
        this.exercises = res.values ? res.values : [];
      });
      break;
    }
  }

  private createPlan() {}

  /**
   * Creates a workout for each muscle group in split.
   * @param musclegroups - An array of MuscleGroup objects.
   * @param workout - A string representing the type of workout.
   */
  private createWorkoutForEachMuscleGroup(
    musclegroups: MuscleGroup[],
    workout: string
  ) {
    try {
      let workoutExercises: WorkoutExercise[] = [];
      const componentExercises = 10;
      let counterComponentExercises = 0;
      let continues = 0;
      while (musclegroups[0].muscletrainfactor > 1) {
        const filteredExercises =
          counterComponentExercises >= componentExercises
            ? this.exercises.filter((exercise: any) => {
                return exercise.muscleGroup == musclegroups[0].musclegroup;
              })
            : this.exercises.filter((exercise: any) => {
                return (
                  exercise.muscleGroup == musclegroups[0].musclegroup &&
                  exercise.Isolation == 0
                );
              });

        counterComponentExercises++;
        if (filteredExercises.length === 0) {
          continues += 1;
          if (continues < musclegroups.length) continue;
          else break;
        }

        const randomExercise =
          filteredExercises[
            Math.round(Math.random() * (filteredExercises.length - 1))
          ];

        const { reps, sets } = this.getRepsAndSets(workout);
        workoutExercises.push({
          exercisename: randomExercise.name,
          reps: reps,
          sets: sets,
        });

        this.removeMuscleGroups(
          musclegroups,
          randomExercise.muscleGroup,
          JSON.parse(randomExercise.SecondaryMuscleGroup)
        );

        // remove randomExercise from this.exercises
        this.exercises = this.exercises.filter((exercise: any) => {
          return exercise.name !== randomExercise.name;
        });

        console.log(this.exercises);
        alert(
          workoutExercises.length + "\n" + JSON.stringify(workoutExercises)
        );
      }
    } catch (e) {
      alert("Please fill the health Sheet and your personal data!");
      return;
    }
  }

  /**
   * Creates a workout plan for each muscle area based on the user's age, gender, and selected workout type.
   * @param workout - The selected workout type.
   */
  private createWorkoutForEachMuscleArea(workout: string) {
    /**
     * Object containing the number of exercises for each muscle area based on the user's age and selected workout type.
     */
    const exercisesMuscles: {
      [key: string]: {
        [key: string]: {
          [key: string]: number;
        };
      };
    } = {
      Fullbody: {
        "45": { Chest: 2, Back: 2, Legs: 2, Arms: 2, Abs: 1 },
        "65": { Chest: 2, Back: 2, Legs: 1, Arms: 2, Abs: 1 },
        rest: { Chest: 1, Back: 1, Legs: 1, Arms: 2, Abs: 0 },
      },
      "Fullbody - Push": {
        "45": { Chest: 3, Legs: 2, Arms: 3, Abs: 1 },
        "65": { Chest: 2, Legs: 2, Arms: 2, Abs: 1 },
        rest: { Chest: 1, Legs: 1, Arms: 2, Abs: 1 },
      },

      "Fullbody - Pull": {
        "45": { Back: 3, Legs: 2, Arms: 3, Abs: 1 },
        "65": { Back: 2, Legs: 2, Arms: 2, Abs: 1 },
        rest: { Back: 1, Legs: 1, Arms: 2, Abs: 1 },
      },
      UpperBody: {
        "45": { Chest: 3, Back: 3, Arms: 2, Abs: 1 },
        "65": { Chest: 2, Back: 2, Arms: 2, Abs: 1 },
        rest: { Chest: 1, Back: 1, Arms: 2, Abs: 1 },
      },
    };

    // Array of workout exercises generated based on the user's age, gender, and selected workout type.
    let workoutExercises: WorkoutExercise[] = [];

    // The age section of the user based on their age.
    const ageSection = this.age < 45 ? "45" : this.age < 65 ? "65" : "rest";

    //  The number of exercises for each muscle area based on the user's age and selected workout type.
    const muscles = exercisesMuscles[workout][ageSection];

    //  Adjusts the number of leg exercises for female users under 45 years old doing Fullbody - Push or Fullbody - Pull workouts.

    if (
      this.age < 45 &&
      this.gender === "female" &&
      (workout === "Fullbody - Push" || workout === "Fullbody - Pull")
    ) {
      muscles["Legs"] += 1;
      if (Object.keys(muscles).includes("Chest")) muscles["Chest"] -= 1;
      else muscles["Back"] -= 1;
    }

    // Loops through each muscle area and generates a random exercise for each.
    for (let muscleIndex in Object.keys(muscles)) {
      const muscle = Object.keys(muscles)[muscleIndex];
      const availableMuscleGroups = getAllMusclesFromSplit(muscle);
      let filteredExercises = this.exercises.filter((exercise: any) => {
        return availableMuscleGroups.includes(exercise.muscleGroup);
      });

      for (let i = 0; i < muscles[muscle]; i++) {
        const muscleGroupIndex = Math.round(
          Math.random() * (availableMuscleGroups.length - 1)
        );

        let filteredExercises2 = filteredExercises.filter((exercise: any) => {
          let isolation = i === 0 ? 0 : 1;
          return (
            exercise.muscleGroup == availableMuscleGroups[muscleGroupIndex] &&
            exercise.Isolation == isolation
          );
        });

        if (filteredExercises2.length === 0) {
          filteredExercises2 = filteredExercises.filter((exercise: any) => {
            return (
              exercise.muscleGroup == availableMuscleGroups[muscleGroupIndex]
            );
          });
          if (filteredExercises2.length === 0) {
            i -= 1;
            continue;
          }
        }

        const randomExercise =
          filteredExercises2[
            Math.round(Math.random() * (filteredExercises2.length - 1))
          ];

        // remove Musclegroup at muscleGroupIndex from availableMuscleGroups
        // if less than 3 exercises, remove all biceps exercises
        if (muscles[muscle] - (i + 1) < 3) {
          if ([8, 9, 10].includes(availableMuscleGroups[muscleGroupIndex])) {
            for (let i = 0; i < 3; i++) {
              const ind = availableMuscleGroups.findIndex((mg) => {
                return [8, 9, 10][i];
              });
              if (ind !== -1) availableMuscleGroups.splice(ind, 1);
            }
          } else if (
            [11, 12, 13].includes(availableMuscleGroups[muscleGroupIndex])
          ) {
            for (let i = 0; i < 3; i++) {
              const ind = availableMuscleGroups.findIndex((mg) => {
                return mg === [11, 12, 13][i];
              });
              if (ind !== -1) availableMuscleGroups.splice(ind, 1);
            }
          }
        } else {
          availableMuscleGroups.splice(muscleGroupIndex, 1);
        }

        // The number of reps and sets for the generated exercise based on the user's selected workout type.
        const { reps, sets } = this.getRepsAndSets(workout);

        workoutExercises.push({
          exercisename: randomExercise.name,
          reps: reps,
          sets: sets,
        });
      }
    }

    /**
     * Displays the number of generated workout exercises and the exercises themselves in a pop-up alert.
     */
    alert(workoutExercises.length + "\n" + JSON.stringify(workoutExercises));
  }

  /**
   * Checks if all necessary data is available to generate a workout plan.
   * @returns {boolean} Returns true if all necessary data is available, otherwise false.
   */
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

  /**
   * Retrieves personal data from the store and sets it to the corresponding properties of the WorkoutGenerator instance.
   * @returns {Promise<void>}
   */
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

  /**
   * Evaluates the workout split based on the user's gender, activity level, and selected workout days.
   * @returns A string representing the workout split represented thorugh workouts separated by semicolons.
   * TODO: Add more splits; Change split depending on progress of this split before (evaluate progress in percentage after age)
   */
  private evaluateSplit() {
    let workoutDays = 0;
    for (let i = 0; i < Object.keys(this.workoutDays).length; i++) {
      if (Object.values(this.workoutDays)[i]) {
        workoutDays++;
      }
    }

    if (this.gender === "male") {
      if (this.age < 40) {
        // For younger men
        if (this.activityLevel === "Beginner") {
          if (workoutDays > 3) return "UpperBody;UpperBody;LowerBody";
          else return "Fullbody";
        } else if (this.activityLevel === "Intermediate") {
          if (workoutDays > 3) return "Push;Pull;Legs";
          else if (workoutDays === 3) return "UpperBody;UpperBody;LowerBody";
          else return "Fullbody";
        } else if (this.activityLevel === "Advanced") {
          if (workoutDays > 4)
            return "Chest - Biceps;Back - Triceps;Legs - Shoulders - Abs;UpperBody;LowerBody";
          else if (workoutDays === 4)
            return "UpperBody;UpperBody;LowerBody;UpperBody";
          else if (workoutDays === 3) return "Push;Pull;Legs";
          else return "Fullbody";
        } else if (this.activityLevel === "Semi-Professional") {
          if (workoutDays > 4)
            return "Chest - Biceps;Back - Triceps;Legs - Shoulders - Abs;Chest - Biceps;Back - Triceps";
          else if (workoutDays === 4)
            return "UpperBody;UpperBody;LowerBody;UpperBody";
          else if (workoutDays === 3) return "Push;Pull;Legs";
          else return "Fullbody";
        } else if (this.activityLevel === "Professional") {
          if (workoutDays > 5)
            return "Chest - Biceps;Back - Triceps;Legs - Shoulders - Abs;";
          else if (workoutDays === 5)
            return "Chest - Biceps;Back - Triceps;Legs - Shoulders - Abs;UpperBody;LowerBody";
          else if (workoutDays === 4)
            return "Chest - Biceps;Back - Triceps;Legs - Shoulders - Abs;UpperBody";
          else if (workoutDays === 3) return "Push;Pull;Legs";
          else return "Fullbody";
        }
      } else {
        // For older Men
        if (this.activityLevel === "Beginner") {
          return "Fullbody";
        } else if (this.activityLevel === "Intermediate") {
          return "Fullbody";
        } else if (this.activityLevel === "Advanced") {
          if (workoutDays >= 4)
            return "UpperBody;LowerBody;UpperBody;LowerBody";
          else return "Fullbody";
        } else if (this.activityLevel === "Semi-Professional") {
          if (workoutDays >= 4)
            return "UpperBody;LowerBody;UpperBody;LowerBody";
          else return "Fullbody";
        } else if (this.activityLevel === "Professional") {
          if (workoutDays >= 4)
            return "UpperBody;LowerBody;UpperBody;LowerBody";
          else return "Fullbody";
        }
      }
    } else if (this.gender === "female") {
      // For younger women
      if (this.age < 40) {
        if (this.activityLevel === "Beginner") {
          if (workoutDays > 3) return "LowerBody;UpperBody;LowerBody";
          else return "Fullbody";
        } else if (this.activityLevel === "Intermediate") {
          if (workoutDays > 3) return "UpperBody;LowerBody;UpperBody";
          else if (workoutDays === 3) return "LowerBody;UpperBody;LowerBody";
          else return "Fullbody";
        } else if (this.activityLevel === "Advanced") {
          if (workoutDays >= 4)
            return "LowerBody;UpperBody;LowerBody;UpperBody";
          else if (workoutDays === 3) return "UpperBody;LowerBody;UpperBody";
          else return "Fullbody";
        } else if (this.activityLevel === "Semi-Professional") {
          if (workoutDays > 4)
            return "LowerBody;UpperBody;LowerBody;UpperBody;Fullbody";
          else if (workoutDays === 4)
            return "LowerBody;UpperBody;Fullbody;Fullbody";
          else if (workoutDays === 3) return "UpperBody;LowerBody;UpperBody";
          else return "Fullbody";
        } else if (this.activityLevel === "Professional") {
          if (workoutDays > 5) return "LowerBody;UpperBody";
          else if (workoutDays === 5)
            return "LowerBody;UpperBody;LowerBody;UpperBody;Fullbody";
          else if (workoutDays === 4)
            return "LowerBody;UpperBody;LowerBody;UpperBody";
          else if (workoutDays === 3) return "UpperBody;LowerBody;UpperBody";
          else return "Fullbody";
        }
      } else {
        // For older women
        if (this.activityLevel === "Beginner") {
          return "Fullbody";
        } else if (this.activityLevel === "Intermediate") {
          return "Fullbody";
        } else if (this.activityLevel === "Advanced") {
          if (workoutDays >= 4)
            return "UpperBody;LowerBody;UpperBody;LowerBody";
          else return "Fullbody";
        } else if (this.activityLevel === "Semi-Professional") {
          if (workoutDays >= 4)
            return "UpperBody;LowerBody;UpperBody;LowerBody";
          else return "Fullbody";
        } else if (this.activityLevel === "Professional") {
          if (workoutDays >= 4)
            return "UpperBody;LowerBody;UpperBody;LowerBody";
          else return "Fullbody";
        }
      }
    }
    return "";
  }

  /**
   * Returns the muscle train factor based on the age and workout type.
   * @param workout - The type of workout (UpperBody, LowerBody, Fullbody, etc.).
   * @returns The muscle train factor.
   */
  private getMuscleTrainFactor(workout: string) {
    let muscleTrainFactor = 1;
    if (this.age < 30) {
      if (
        [
          "UpperBody",
          "Fullbody - Push",
          "Fullbody - Pull",
          "Fullbody",
        ].includes(workout)
      )
        muscleTrainFactor = 3;
      else muscleTrainFactor = 5;
    } else if (this.age < 45) {
      if (
        [
          "UpperBody",
          "Fullbody - Push",
          "Fullbody - Pull",
          "Fullbody",
        ].includes(workout)
      )
        muscleTrainFactor = 2;
      else muscleTrainFactor = 4;
    } else if (this.age < 60) {
      if (
        [
          "UpperBody",
          "Fullbody - Push",
          "Fullbody - Pull",
          "Fullbody",
        ].includes(workout)
      )
        muscleTrainFactor = 2;
      else muscleTrainFactor = 3;
    } else if (this.age < 70) {
      if (
        [
          "UpperBody",
          "Fullbody - Push",
          "Fullbody - Pull",
          "Fullbody",
        ].includes(workout)
      )
        muscleTrainFactor = 1;
      else muscleTrainFactor = 2;
    }
    return muscleTrainFactor;
  }

  /**
   * Removes muscle groups from the given array of muscle groups based on the primary and secondary muscle groups.
   * @param muscleGroups - An array of MuscleGroup objects.
   * @param muscleGroup - The primary muscle group to remove.
   * @param secondaryMuscleGroups - An array of secondary muscle groups to remove.
   * @returns An array of MuscleGroup objects with the specified muscle groups removed.
   */
  private removeMuscleGroups(
    muscleGroups: MuscleGroup[],
    muscleGroup: number,
    secondaryMuscleGroups: number[]
  ) {
    // decrease muscletrainFactor for 3 where musclegroup === muscleGroup
    for (let mg in muscleGroups) {
      if (muscleGroups[mg].musclegroup === muscleGroup) {
        muscleGroups[mg].muscletrainfactor -= 3;
      } else if (secondaryMuscleGroups.includes(muscleGroups[mg].musclegroup)) {
        muscleGroups[mg].muscletrainfactor -= 2;
      }
    }

    muscleGroups.sort((a, b) => {
      return b.muscletrainfactor - a.muscletrainfactor;
    });
    return muscleGroups;
  }

  /**
   * Returns an object containing the recommended number of reps and sets for a given workout.
   * @param workout - The name of the workout.
   * @returns An object containing the recommended number of reps and sets.
   */
  private getRepsAndSets(workout: string) {
    if (
      ["UpperBody", "Fullbody - Push", "Fullbody - Pull", "Fullbody"].includes(
        workout
      )
    ) {
      // 4/5x3 = 12/15
      if (this.age > 65 && this.goalAnatomy === "Maintain")
        return { reps: "10-20", sets: 3 };
      // 7x2 = 14
      else if (this.age > 55 && this.goalAnatomy === "Maintain")
        return { reps: "10-20", sets: 2 };

      switch (this.goalAnatomy) {
        case "GetShredded":
          return { reps: "13-20", sets: 3 };
        case "LooseWeight":
          return { reps: "13-20", sets: 2 };
        case "Maintain":
          return { reps: "6-12", sets: 2 };
        case "BuildMuscles":
          return { reps: "6-12", sets: 2 };
        case "GetStrong":
          return { reps: "1-5", sets: 2 };
        default:
          return { reps: "6-12", sets: 2 };
      }
    } else {
      switch (this.goalAnatomy) {
        case "GetShredded":
          return { reps: "13-20", sets: 5 };
        case "LooseWeight":
          return { reps: "13-20", sets: 4 };
        case "Maintain":
          return { reps: "6-12", sets: 3 };
        case "BuildMuscles":
          return { reps: "6-12", sets: 4 };
        case "GetStrong":
          return { reps: "1-5", sets: 5 };
        default:
          return { reps: "6-12", sets: 3 };
      }
    }
  }
}
