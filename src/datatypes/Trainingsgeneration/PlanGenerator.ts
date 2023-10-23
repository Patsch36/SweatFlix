import { Workout, WorkoutDays } from "./datatypes";

// interface Weekdays {
//   [key: string]: boolean;
// }

export class PlanGenerator {
  private weekdays: WorkoutDays;
  private age: number;
  private activityLevel: string;

  private planType: string = "";

  constructor(
    weekdays: WorkoutDays,
    age: number,
    activityLevel: string,
    goal: string
  ) {
    this.weekdays = weekdays;
    this.age = age;
    this.activityLevel = activityLevel;

    if (goal == "Maintain" || goal == "BuildMuscles") {
      this.planType = "Strength training";
    } else if (goal == "GetShredded" || goal == "LooseWeight") {
      this.planType = "Cut training";
    } else if (goal == "GetStrong") {
      this.planType = "Mass training";
    } else {
      this.planType = "Cardio";
    }
  }

  /**
   * Returns the type of the training plan.
   * @returns {string} The type of the training plan.
   */
  public getPlanType() {
    return this.planType;
  }

  /**
   * Generates a workout plan based on the given start day, list of workouts and starting workout.
   * @param startDay - The starting day of the workout plan.
   * @param workouts - The list of workouts to include in the plan.
   * @param startWorkout - The starting workout of the plan. Defaults to the first workout in the workouts list.
   * @returns An object containing the generated workout plan scheme and the starting workout.
   */
  generate(
    startDay: string,
    workouts: Workout[],
    startWorkout: string = workouts[0].workoutName
  ) {
    const plan: string[] = [];
    let currentDay = startDay;
    let currentWorkout = startWorkout;
    let startWorkouts: string[] = [];
    let workoutIndex = workouts.findIndex(
      (workout) => workout.workoutName === currentWorkout
    );
    let scheme = "";
    let workoutsInRowCounter = 0;
    const workoutsInRowLimit = this.getOptimalWorkoutsInARowLimitValue();
    let availableWorkoutDaysToRest = 0;
    let availableWorkoutDaysToRestList: number[] = [];
    let FirstIterationFLag = true;

    const amountOfWorkoutDays = Object.values(this.weekdays).filter(
      Boolean
    ).length;

    let dayOfWeek = 1;

    do {
      if (
        this.weekdays[currentDay as keyof WorkoutDays] &&
        workoutsInRowCounter < workoutsInRowLimit
      ) {
        plan.push(workouts[workoutIndex].workoutName);
        scheme += "t";
        workoutsInRowCounter++;
        workoutIndex = (workoutIndex + 1) % workouts.length;

        if (FirstIterationFLag) availableWorkoutDaysToRest++;

        // If there were already many workoutdays until 6th period, make rest to give higher chance for repetition in scheme
        if (dayOfWeek === 6) {
          const lastSix = scheme.slice(-6).split("");
          const count = lastSix.filter((char) => char === "t").length;
          console.log("count: " + count);
          if (count === workouts.length) {
            currentDay = this.getNextDay(currentDay);
            dayOfWeek = (dayOfWeek + 1) % Object.keys(this.weekdays).length;
            workoutsInRowCounter = 0;
            scheme += "r";
            if (currentDay == startDay && currentWorkout == startWorkout)
              return this.buildScheme(
                scheme,
                availableWorkoutDaysToRestList,
                workoutsInRowLimit,
                workoutsInRowCounter,
                startWorkouts
              );
          }
        }
      } else {
        workoutsInRowCounter = 0;
        scheme += "r";
        workoutsInRowCounter = 0;
        if (FirstIterationFLag)
          availableWorkoutDaysToRestList.push(availableWorkoutDaysToRest);
        FirstIterationFLag = false;
      }

      currentDay = this.getNextDay(currentDay);
      currentWorkout = workouts[workoutIndex].workoutName;
      dayOfWeek = (dayOfWeek + 1) % Object.keys(this.weekdays).length;
      if (currentDay == startDay) {
        FirstIterationFLag = true;
        availableWorkoutDaysToRest = 0;
        startWorkouts.push(currentWorkout);
      }
    } while (
      scheme.length < workouts.length ||
      !(
        currentDay == startDay &&
        currentWorkout == startWorkout &&
        workoutsInRowLimit - workoutsInRowCounter > 0 &&
        (availableWorkoutDaysToRestList.includes(
          workoutsInRowLimit - workoutsInRowCounter
        ) ||
          workoutsInRowCounter == 0)
      )
    );

    console.log("scheme: " + scheme);

    return this.buildScheme(
      scheme,
      availableWorkoutDaysToRestList,
      workoutsInRowLimit,
      workoutsInRowCounter,
      startWorkouts
    );
  }

  private buildScheme(
    scheme: string,
    availableWorkoutDaysToRestList: number[],
    workoutsInRowLimit: number,
    workoutsInRowCounter: number,
    startWorkouts: string[]
  ) {
    let firstWorkout = "";
    const index = availableWorkoutDaysToRestList.indexOf(
      workoutsInRowLimit - workoutsInRowCounter
    );
    firstWorkout = startWorkouts[index];
    // remove all elements of scheme before index * 7
    scheme = scheme.slice(index * 7);

    return { scheme: scheme, startWorkout: firstWorkout };
  }

  /**
   * Returns the next weekday after the given day.
   * @param day The current weekday as a string.
   * @returns The next weekday as a string.
   */
  private getNextDay(day: string): string {
    const weekdays = Object.keys(this.weekdays);
    const currentIndex = weekdays.indexOf(day);
    const nextIndex = (currentIndex + 1) % weekdays.length;
    return weekdays[nextIndex];
  }

  /**
   * Returns the optimal number of workouts in a row limit value based on the user's activity level and age.
   * @returns {number} The optimal number of workouts in a row limit value.
   */
  private getOptimalWorkoutsInARowLimitValue() {
    // Calculate factor depending on fitnessLevel ("Beginner", "Intermediate", "Advanced", "Semi-Professional", "Professional") And Age
    switch (this.activityLevel) {
      case "Beginner":
        return 1;
      case "Intermediate":
        switch (true) {
          case this.age < 35:
            return 2;
          default:
            return 1;
        }
      case "Advanced":
        switch (true) {
          case this.age < 35:
            return 3;
          case this.age >= 35 && this.age < 45:
            return 2;
          default:
            return 1;
        }
      case "Semi-Professional":
        switch (true) {
          case this.age < 35:
            return 4;
          case this.age >= 35 && this.age < 45:
            return 3;
          case this.age >= 45 && this.age < 65:
            return 2;
          default:
            return 1;
        }
      case "Professional":
        switch (true) {
          case this.age < 35:
            return 5;
          case this.age >= 35 && this.age < 45:
            return 4;
          case this.age >= 45 && this.age < 65:
            return 3;
          default:
            return 2;
        }
      default:
        switch (true) {
          case this.age < 35:
            return 2;
          default:
            return 1;
        }
    }
  }
}
