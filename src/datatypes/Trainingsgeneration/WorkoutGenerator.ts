import { getAllMusclesFromSplit } from "../splitCalculator";
import {
  Workout,
  WorkoutDays,
  WorkoutExercise,
  WorkoutMuscleGroup,
} from "./datatypes";

export class WorkoutGenerator {
  private exercises: any;

  // =======

  private age: any;
  private gender: any;
  private workoutDays!: WorkoutDays;
  private activityLevel: any;
  private goalAnatomy: any;

  // =======

  private split: string;

  /**
   * Initializes a new instance of the WorkoutGenerator class.
   */
  constructor(
    exercises: any,
    age: any,
    gender: any,
    workoutdays: WorkoutDays,
    activitylevel: any,
    goalanatomy: any
  ) {
    this.split = "";
    this.exercises = exercises;

    this.age = age;
    this.gender = gender;
    this.workoutDays = workoutdays;
    this.activityLevel = activitylevel;
    this.goalAnatomy = goalanatomy;
  }

  /**
   * Generates a workout by evaluating the split and creating the workout.
   * @private
   */
  public generate(): Workout[] {
    this.split = this.evaluateSplit();
    return this.createWorkout();
  }

  /**
   * Creates a workout based on the given split.
   * @private
   */
  private createWorkout() {
    try {
      const generatedWorkouts = this.split.split(";");
      const workouts: Workout[] = [];
      const allExercises = this.exercises;
      for (let i = 0; i < generatedWorkouts.length; i++) {
        const mtf = this.getMuscleTrainFactor(generatedWorkouts[i]);
        const muscles = getAllMusclesFromSplit(generatedWorkouts[i]);

        let musclegroups: WorkoutMuscleGroup[] = [];
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
          workouts.push({
            workoutName: generatedWorkouts[i],
            exercises: this.createWorkoutForEachMuscleArea(
              generatedWorkouts[i]
            ),
          });
        } else {
          // TODO: Generate A and B workouts
          workouts.push({
            workoutName: generatedWorkouts[i],
            exercises: this.createWorkoutForEachMuscleGroup(
              musclegroups,
              generatedWorkouts[i]
            ),
          });
        }

        workouts[i].exercises.sort((a, b) => {
          return a.muscleGroup - b.muscleGroup;
        });

        workouts[i].exercises = this.adjustWorkoutExercises(
          workouts[i].exercises
        );

        // workouts[i].exercises = this.distributeEvenly(workouts[i].exercises);

        // resort workouts[i].exercises: if sorted like 1,1,2,3,3 sort for 1,2,3,1,2,3 so musclegroups are equally spread

        this.exercises = allExercises;
        console.log(workouts[i]);
      }
      return workouts;
    } catch (e) {
      console.error("ERROR: " + e);
      alert("Please fill the health Sheet and your personal data!");
      return [];
    }
  }

  /**
   * Creates a workout for each muscle group in split.
   * @param musclegroups - An array of MuscleGroup objects.
   * @param workout - A string representing the type of workout.
   * @private
   */
  private createWorkoutForEachMuscleGroup(
    musclegroups: WorkoutMuscleGroup[],
    workout: string
  ) {
    let workoutExercises: WorkoutExercise[] = [];
    const componentExercises = 3;
    let counterComponentExercises = 0;

    while (musclegroups[0].muscletrainfactor > 1) {
      // shuffle musclegroups where muscletrainfactor is as high as musclegroups[0].muscletrainfactor
      // => So component exercises are not always fiirst three muscle groups
      musclegroups = this.shuffleArrayFisherYates(musclegroups);
      // get only exercises for this musclegroup
      let filteredExercises =
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

      if (filteredExercises.length === 0) {
        filteredExercises = this.exercises.filter((exercise: any) => {
          return exercise.muscleGroup == musclegroups[0].musclegroup;
        });
      } else counterComponentExercises++;

      if (filteredExercises.length === 0)
        alert(
          "No Exercises found for this muscle group: " +
            musclegroups[0].musclegroup
        );

      // alert(
      //   `${filteredExercises.length} \n ${
      //     JSON.stringify(filteredExercises) || "No Exercises found"
      //   }`
      // );

      // exercise for this musclegroup
      const randomExercise =
        filteredExercises[
          Math.round(Math.random() * (filteredExercises.length - 1))
        ];

      const { reps, sets } = this.getRepsAndSets(workout);
      workoutExercises.push({
        exercisename: randomExercise.name,
        reps: reps,
        sets: sets,
        muscleGroup: randomExercise.muscleGroup,
      });

      // decrease muscletrainfactors
      this.removeMuscleGroups(
        musclegroups,
        randomExercise.muscleGroup,
        JSON.parse(randomExercise.SecondaryMuscleGroup)
      );

      // remove randomExercise from this.exercises
      this.exercises = this.exercises.filter((exercise: any) => {
        return exercise.name !== randomExercise.name;
      });

      // console.log(randomExercise);
      // console.log(JSON.stringify(musclegroups));
      // console.log(musclegroups[0].muscletrainfactor > 1);
      // console.log("=====================================");
    }
    workoutExercises.sort((a, b) => {
      return a.muscleGroup - b.muscleGroup;
    });
    return workoutExercises;
  }

  /**
   * Creates a workout plan for each muscle area based on the user's age, gender, and selected workout type.
   * @param workout - The selected workout type.
   * @private
   */
  private createWorkoutForEachMuscleArea(workout: string) {
    // Object containing the number of exercises for each muscle area based on the user's age and selected workout type.
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
          let isolation = i === 0 || muscles[muscle] === 1 ? 0 : 1;
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
          } else availableMuscleGroups.splice(muscleGroupIndex, 1);
        } else {
          availableMuscleGroups.splice(muscleGroupIndex, 1);
        }

        // The number of reps and sets for the generated exercise based on the user's selected workout type.
        const { reps, sets } = this.getRepsAndSets(workout);

        workoutExercises.push({
          exercisename: randomExercise.name,
          reps: reps,
          sets: sets,
          muscleGroup: randomExercise.muscleGroup,
        });
      }
    }

    // Displays the number of generated workout exercises and the exercises themselves in a pop-up alert.
    return workoutExercises;
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
          if (workoutDays > 3) return "UpperBody;LowerBody;Fullbody";
          else return "Fullbody";
        } else if (this.activityLevel === "Intermediate") {
          if (workoutDays > 3) return "Push;Pull;Legs";
          else if (workoutDays === 3) return "UpperBody;UpperBody;LowerBody";
          else return "Fullbody";
        } else if (this.activityLevel === "Advanced") {
          if (workoutDays > 4)
            return "Chest - Biceps;Back - Triceps;Legs - Shoulders - Abs;UpperBody;LowerBody";
          else if (workoutDays === 4)
            return "UpperBody;LowerBody;UpperBody;LowerBody";
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
          if (workoutDays > 3) return "LowerBody;UpperBody;Fullbody";
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
   * TODO: Make Muscletrainfactor more dynamic: Different factor for bigger/ smaller groups
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
   * Decrease MuscleTrainFactor of muscle groups from the given array of muscle groups based on the primary and secondary muscle groups.
   * @param muscleGroups - An array of MuscleGroup objects.
   * @param muscleGroup - The primary muscle group to remove.
   * @param secondaryMuscleGroups - An array of secondary muscle groups to remove.
   * @returns An array of MuscleGroup objects with the specified muscle groups removed.
   */
  private removeMuscleGroups(
    muscleGroups: WorkoutMuscleGroup[],
    muscleGroup: number,
    secondaryMuscleGroups: number[]
  ) {
    // TODO: Figure out what to do if muscleGroup is null.
    for (let mg in muscleGroups) {
      if (muscleGroup && muscleGroups[mg].musclegroup === muscleGroup) {
        muscleGroups[mg].muscletrainfactor -= 3;
      } else if (
        secondaryMuscleGroups &&
        secondaryMuscleGroups.includes(muscleGroups[mg].musclegroup)
      ) {
        muscleGroups[mg].muscletrainfactor -= 1;
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
          return { reps: "13-20", sets: 3 };
        case "Maintain":
          return { reps: "6-12", sets: 2 };
        case "BuildMuscles":
          return { reps: "6-12", sets: 3 };
        case "GetStrong":
          return { reps: "1-5", sets: 3 };
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

  /**
   * Adjusts the workout exercises to ensure that the total number of sets does not exceed a certain limit.
   * @param workoutExercises - An array of workout exercises to adjust.
   * @returns An array of workout exercises with adjusted sets.
   */
  private adjustWorkoutExercises(workoutExercises: WorkoutExercise[]) {
    const totalSets = workoutExercises
      .map((exercise) => exercise.sets)
      .reduce((a, b) => a + b, 0);

    const totalSetsLimit = this.getTotalSetsLimit();
    if (totalSets > totalSetsLimit) {
      const amountOfExercises = workoutExercises.length;
      const shorteningFactor = Math.round(
        (totalSetsLimit - totalSets) / amountOfExercises
      );

      let i = 0;
      while (i < workoutExercises.length) {
        const currentExercise = workoutExercises[i];
        const nextExercise = workoutExercises[i + 1];

        if (
          nextExercise &&
          currentExercise.muscleGroup === nextExercise.muscleGroup
        ) {
          workoutExercises.splice(i + 1, 1);
        } else if (shorteningFactor * -1 >= currentExercise.sets / 2) {
          // musclegroups which are not twice in workout are lesser important so shorten a bit
          // half of shorteningFactor because of splicing exercises is statistically speaking given
          currentExercise.sets += shorteningFactor / 2;
        }
        i += 1;
      }
    }
    return workoutExercises;
  }

  /**
   * Returns the total sets limit based on the user's activity level and age.
   * @returns {number} The total sets limit.
   */
  private getTotalSetsLimit() {
    // set totalSetLimit depending on activity level and age
    switch (this.activityLevel) {
      case "Beginner":
        return 20;
      case "Intermediate":
        switch (true) {
          case this.age < 35:
            return 25;
          default:
            return 20;
        }
      case "Advanced":
        switch (true) {
          case this.age < 35:
            return 35;
          case this.age >= 35 && this.age < 45:
            return 30;
          default:
            return 25;
        }
      case "Semi-Professional":
        switch (true) {
          case this.age < 45:
            return 35;
          case this.age >= 45 && this.age < 65:
            return 30;
          default:
            return 25;
        }
      case "Professional":
        switch (true) {
          case this.age < 35:
            return 40;
          case this.age >= 35 && this.age < 45:
            return 35;
          case this.age >= 45 && this.age < 65:
            return 30;
          default:
            return 25;
        }
      default:
        return 25;
    }
  }

  /**
   * Shuffles an array of MuscleGroup objects keeping order of muscletrainfactor using the Fisher-Yates algorithm.
   * @param a - The array of MuscleGroup objects to shuffle.
   * @returns The shuffled array of MuscleGroup objects.
   */
  private shuffleArrayFisherYates(a: WorkoutMuscleGroup[]) {
    "use strict";
    var i, t, j;
    for (i = a.length - 1; i > 0; i -= 1) {
      t = a[i];
      j = Math.floor(Math.random() * (i + 1));
      if (a[i].muscletrainfactor === a[j].muscletrainfactor) {
        a[i] = a[j];
        a[j] = t;
      }
    }
    return a;
  }

  /**
   * Distributes the given array of objects evenly based on the number of elements in each group.
   * @param arr - The array of objects to distribute.
   * @returns An array of objects that have been evenly distributed based on the number of elements in each group.
   */
  private distributeEvenly(arr: any[]): any[] {
    const distributedArray = [];
    const groupCountMap = new Map<number, number>();

    // Zähle die Anzahl der Elemente in jeder Muskelgruppe
    for (const item of arr) {
      const group = item.muscleGroup;
      if (groupCountMap.has(group)) {
        const x = groupCountMap.get(group);
        if (x) groupCountMap.set(group, x + 1);
      } else {
        groupCountMap.set(group, 1);
      }
    }

    const maxGroupSize = Math.max(...Array.from(groupCountMap.values()));

    for (let i = 0; i < maxGroupSize; i++) {
      for (const group of Array.from(groupCountMap.keys())) {
        const item = groupCountMap.get(group);
        if (item !== undefined && item > 0) {
          const item = arr.find((obj) => obj.muscleGroup === group);
          distributedArray.push(item);
          const x = groupCountMap.get(group);
          if (x) groupCountMap.set(group, x - 1);
        }
      }
    }

    return distributedArray;
  }

  private removeExercisesAfterHealthPoints() {
    // remove Deadlifts for beginner, leg press for high blood pressure, etc.
  }
}
