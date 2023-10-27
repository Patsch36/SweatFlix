import { store } from "@/stores/IonicStorage";
import { useDatabaseStore } from "@/stores/databaseStore";
/**
 * SetManager class for managing sets and reps for exercises.
 */
export class SetManager {
  private m_Reps: number;
  private db;

  /**
   * Constructor for SetManager class.
   */
  constructor() {
    this.m_Reps = 8;
    store.get("GoalAnatomy").then((value) => {
      switch (value) {
        case "GetShredded":
          this.m_Reps = 20;
          break;
        case "LooseWeight":
          this.m_Reps = 15;
          break;
        case "Maintain":
          this.m_Reps = 12;
          break;
        case "BuildMuscles":
          this.m_Reps = 10;
          break;
        case "GetStrong":
          this.m_Reps = 6;
          break;
      }
    });

    const database = useDatabaseStore().getDatabase();
    database !== null
      ? (this.db = database)
      : console.error("database is null");
  }

  /**
   * Sets the number of reps.
   * @param reps - The number of reps.
   */
  public setReps(reps: number): void {
    this.m_Reps = reps;
  }

  /**
   * Gets the number of reps.
   * @returns The number of reps.
   */
  public getReps(): number {
    return this.m_Reps;
  }

  /**
   * Calculates the 1RM for an exercise.
   * @param exercise - The exercise to calculate the 1RM for.
   * @param day - The day to calculate the 1RM for.
   * @param days - The number of days to look back for the exercise.
   * @param formula - The formula to use for the calculation.
   * @param latest - Whether to use the latest workout for the calculation.
   * @returns The calculated 1RM.
   */
  public async get1RM(
    exercise: string,
    day: string,
    days: number,
    formula: string = "all",
    latest: boolean = false
  ) {
    // get all exercises from WorkoutExercise from day (date) until two weeks before day
    const result = await this.getValuesFromDB(exercise, day, days, latest);
    // calculate 1RM
    const oneRM = await this.calculate1RM(result, formula);
    return Math.round(oneRM * 10) / 10;
  }

  /**
   * Calculates the 1RM from weight and reps.
   * @param weight - The weight used for the exercise.
   * @param reps - The number of reps.
   * @param formula - The formula to use for the calculation.
   * @returns The calculated 1RM.
   */
  public calculate1RMFromWeightAndReps(
    weight: number,
    reps: number,
    formula: string = "all"
  ) {
    if (formula === "all") {
      return (
        Math.round(
          ((this.calculate1RMBoydEppley(weight, reps) +
            this.calculate1RMBrzycki(weight, reps) +
            this.calculate1RMLander(weight, reps) +
            this.calculate1RMLombardi(weight, reps) +
            this.calculate1RMOConner(weight, reps) +
            this.calculate1RMMayhew(weight, reps)) *
            10) /
            5
        ) / 10
      );
    } else if (formula === "eppley") {
      return Math.round(this.calculate1RMBoydEppley(weight, reps) * 10) / 10;
    } else if (formula === "brzycki") {
      return Math.round(this.calculate1RMBrzycki(weight, reps) * 10) / 10;
    } else if (formula === "lander") {
      return Math.round(this.calculate1RMLander(weight, reps) * 10) / 10;
    } else if (formula === "oconner") {
      return Math.round(this.calculate1RMOConner(weight, reps) * 10) / 10;
    } else if (formula === "lombardi") {
      return Math.round(this.calculate1RMLombardi(weight, reps) * 10) / 10;
    } else if (formula === "mayhew") {
      return Math.round(this.calculate1RMMayhew(weight, reps) * 10) / 10;
    }
  }

  /**
   * Calculates the NRM from weight and reps.
   * @param weight - The weight used for the exercise.
   * @param reps - The number of reps.
   * @param formula - The formula to use for the calculation.
   * @returns The calculated NRM.
   */
  public calculateNRMFromWeightAndReps(
    weight: number,
    reps: number,
    formula = "all"
  ) {
    if (formula === "all") {
      return (
        Math.round(
          ((this.calculateNRMBoydEppley(weight, reps) +
            this.calculateNRMBrzycki(weight, reps) +
            this.calculateNRMLander(weight, reps) +
            this.calculateNRMOConner(weight, reps) +
            this.calculateNRMLombardi(weight, reps) +
            this.calculateNRMMayhew(weight, reps)) *
            10) /
            5
        ) / 10
      );
    } else if (formula === "eppley") {
      return Math.round(this.calculateNRMBoydEppley(weight, reps) * 10) / 10;
    } else if (formula === "brzycki") {
      return Math.round(this.calculateNRMBrzycki(weight, reps) * 10) / 10;
    } else if (formula === "lander") {
      return Math.round(this.calculateNRMLander(weight, reps) * 10) / 10;
    } else if (formula === "oconner") {
      return Math.round(this.calculateNRMOConner(weight, reps) * 10) / 10;
    } else if (formula === "lombardi") {
      return Math.round(this.calculateNRMLombardi(weight, reps) * 10) / 10;
    } else if (formula === "mayhew") {
      return Math.round(this.calculateNRMMayhew(weight, reps) * 10) / 10;
    }
  }

  /**
   * Calculates the NRM for an exercise.
   * @param exercise - The exercise to calculate the NRM for.
   * @param day - The day to calculate the NRM for.
   * @param days - The number of days to look back for the exercise.
   * @param formula - The formula to use for the calculation.
   * @param latest - Whether to use the latest workout for the calculation.
   * @returns The calculated NRM.
   */
  public async getNRM(
    exercise: string,
    day: string,
    days: number,
    formula: string = "all",
    latest: boolean = false
  ) {
    // get all exercises from WorkoutExercise from day (date) until two weeks before day
    const result = await this.getValuesFromDB(exercise, day, days, latest);

    // calculate 1RM
    const NRM = await this.calculateNRM(result, formula);
    return Math.round(NRM * 10) / 10;
  }

  /**
   * Tests all algorithms.
   */
  public test(): void {
    // test all algorithms
    const weight = 100;
    const reps = 10;
    const oneRMBoydEppley = this.calculate1RMBoydEppley(weight, reps);
    const oneRMBrzycki = this.calculate1RMBrzycki(weight, reps);
    const oneRMLander = this.calculate1RMLander(weight, reps);
    console.log(
      `1RM BoydEppley: ${oneRMBoydEppley}, 1RM Brzycki: ${oneRMBrzycki}, 1RM Lander: ${oneRMLander}`
    );
    const NRMBydEpply = this.calculateNRMBoydEppley(weight, reps);
    const NRMBrzycki = this.calculateNRMBrzycki(weight, reps);
    const NRMLander = this.calculateNRMLander(weight, reps);
    console.log(
      `NRM BoydEppley: ${NRMBydEpply}, NRM Brzycki: ${NRMBrzycki}, NRM Lander: ${NRMLander}`
    );
  }

  /**
   * Retrieves the reps and weight values for a given exercise and time period from the database.
   * @param exercise - The name of the exercise to retrieve values for.
   * @param day - The date to start retrieving values from (in YYYY-MM-DD format).
   * @param days - The number of days to retrieve values for.
   * @param latest - Whether to retrieve values for the latest workout only (defaults to false).
   * @returns An array of objects containing the reps and weight values for the given exercise and time period.
   */
  private async getValuesFromDB(
    exercise: string,
    day: string,
    days: number,
    latest: boolean = false
  ) {
    let sql;

    if (latest) {
      // Select how many exercises of exercise var are in WorkoutExercise on latest day
      sql = `SELECT reps, weight FROM WorkoutExercise WHERE exercise = '${exercise}' AND workout = (SELECT startdate FROM Workout INNER JOIN WorkoutExercise ON Workout.startdate = WorkoutExercise.workout WHERE exercise = '${exercise}' ORDER BY startdate DESC LIMIT 1);`;
    } else {
      // Andernfalls Daten für die letzten 'days' Tage abrufen
      sql = `SELECT reps, weight FROM WorkoutExercise WHERE date(workout) >= date('${day}', '-${days} days') AND exercise = '${exercise}';`;
    }

    console.log(sql);
    const result = await this.db?.query(sql);

    console.log("QUERY RESULT", result?.values);

    if (result === undefined) {
      console.error("result is undefined");
      return [{ reps: 0, weight: 0 }];
    }

    return result.values;
  }

  /**
   * Calculates the 1RM of all values of result (array of WorkoutExercise; {weight: number, reps: number}})
   * and returns the average of all 1RM's
   * @param result - Array of WorkoutExercise objects containing weight and reps
   * @param formula - The formula to use for calculating the 1RM. Can be one of "all", "optimal", "eppley", "brzycki", "lander", "oconner", "lombardi", or "mayhew"
   * @returns The average of all 1RM's
   */
  private calculate1RM(result: any, formula: string): number {
    // Calculate the 1RM of all values of result (array of WorkoutExercise; {weight: number, reps: number}})
    // and return the average of all 1RM's

    // calculate 1RM for each entry
    const oneRM = result.map((entry: any) => {
      console.log("CURRENT 1RM VALUE ", entry);
      const weight = entry.weight;
      const reps = entry.reps;
      // console.log("eppley", this.calculate1RMBoydEppley(weight, reps));
      // console.log("brzycki", this.calculate1RMBrzycki(weight, reps));
      // console.log("lander", this.calculate1RMLander(weight, reps));
      if (formula === "all") {
        return (
          (this.calculate1RMBoydEppley(weight, reps) +
            this.calculate1RMBrzycki(weight, reps) +
            this.calculate1RMLander(weight, reps) +
            this.calculate1RMOConner(weight, reps) +
            this.calculate1RMLombardi(weight, reps) +
            this.calculate1RMMayhew(weight, reps)) /
          5
        );
      } else if (formula === "optimal") {
        if (reps <= 5) {
          return (
            (this.calculate1RMBoydEppley(weight, reps) +
              this.calculate1RMBrzycki(weight, reps)) /
            2
          );
        } else if (reps <= 10) return this.calculate1RMLander(weight, reps);
        else
          return (
            (this.calculate1RMOConner(weight, reps) +
              this.calculate1RMLombardi(weight, reps) +
              this.calculate1RMMayhew(weight, reps)) /
            3
          );
      } else if (formula === "eppley") {
        return this.calculate1RMBoydEppley(weight, reps);
      } else if (formula === "brzycki") {
        return this.calculate1RMBrzycki(weight, reps);
      } else if (formula === "lander") {
        return this.calculate1RMLander(weight, reps);
      } else if (formula === "oconner") {
        return this.calculate1RMOConner(weight, reps);
      } else if (formula === "lombardi") {
        return this.calculate1RMLombardi(weight, reps);
      } else if (formula === "mayhew") {
        return this.calculate1RMMayhew(weight, reps);
      }
    });

    // calculate average of all 1RM's
    const averageOneRM =
      oneRM.reduce((a: number, b: number) => a + b, 0) / oneRM.length;
    return averageOneRM;
  }

  /**
   * Calculates the NRM of all values of result (array of WorkoutExercise; {weight: number, reps: number}})
   * and returns the average of all NRM's
   * @param result - An array of WorkoutExercise objects containing weight and reps properties
   * @param formula - A string representing the formula to use for NRM calculation
   * @returns The average NRM of all values in the result array
   */
  private calculateNRM(result: any, formula: string): number {
    // Calculate the NRM of all values of result (array of WorkoutExercise; {weight: number, reps: number}})
    // and return the average of all NRM's

    // calculate NRM for each entry
    const NRM = result.map((entry: any) => {
      console.log("CURRENT NRM VALUE ", entry);
      const weight = entry.weight;
      const reps = entry.reps;
      // console.log("epply", this.calculateNRMBoydEppley(weight, reps));
      // console.log("brzycki", this.calculateNRMBrzycki(weight, reps));
      // console.log("lander", this.calculateNRMLander(weight, reps));
      if (formula === "all") {
        return (
          (this.calculateNRMBoydEppley(weight, reps) +
            this.calculateNRMBrzycki(weight, reps) +
            this.calculateNRMLander(weight, reps) +
            this.calculateNRMOConner(weight, reps) +
            this.calculateNRMLombardi(weight, reps) +
            this.calculateNRMMayhew(weight, reps)) /
          5
        );
      } else if (formula === "eppley") {
        return this.calculateNRMBoydEppley(weight, reps);
      } else if (formula === "brzycki") {
        return this.calculateNRMBrzycki(weight, reps);
      } else if (formula === "lander") {
        return this.calculateNRMLander(weight, reps);
      } else if (formula === "oconner") {
        return this.calculateNRMOConner(weight, reps);
      } else if (formula === "lombardi") {
        return this.calculateNRMLombardi(weight, reps);
      } else if (formula === "mayhew") {
        return this.calculateNRMMayhew(weight, reps);
      }
    });

    // calculate average of all NRM's
    const averageNRM =
      NRM.reduce((a: number, b: number) => a + b, 0) / NRM.length;
    return averageNRM;
  }

  // Formula after https://www.marathonfitness.de/maximalkraft-rechner/#:~:text=1RM%20%3D%20Gewicht%20%2B%20Gewicht%20×%20Wiederholungen,kraftorientiert%20im%20unteren%20Wiederholungsbereich%20trainieren.
  /**
   * Calculates the one-rep max using the Boyd Epley formula.
   * @param weight The weight lifted.
   * @param repetitions The number of repetitions performed.
   * @returns The calculated one-rep max.
   * @throws An error if the number of repetitions is less than or equal to 0.
   */
  private calculate1RMBoydEppley(weight: number, repetitions: number): number {
    if (repetitions <= 0) {
      throw new Error("The number of repetitions must be greater than 0.");
    }

    console.log("weight", weight);
    console.log("repetitions", repetitions);
    console.log(weight + (weight * repetitions) / 30);

    const oneRM = weight + (weight * repetitions) / 30;
    return oneRM;
  }

  // Formula after https://www.marathonfitness.de/maximalkraft-rechner/#:~:text=1RM%20%3D%20Gewicht%20%2B%20Gewicht%20×%20Wiederholungen,kraftorientiert%20im%20unteren%20Wiederholungsbereich%20trainieren.
  /**
   * Calculates the one-rep max (1RM) using the Brzycki formula.
   * @param weight The weight lifted for the given number of repetitions.
   * @param repetitions The number of repetitions performed.
   * @returns The calculated 1RM.
   * @throws An error if the number of repetitions is less than or equal to 0.
   */
  private calculate1RMBrzycki(weight: number, repetitions: number): number {
    if (repetitions <= 0) {
      throw new Error("The number of repetitions must be greater than 0.");
    }

    const oneRM = (weight * 36) / (37 - repetitions);
    return oneRM;
  }

  // Formula after https://www.marathonfitness.de/maximalkraft-rechner/#:~:text=1RM%20%3D%20Gewicht%20%2B%20Gewicht%20×%20Wiederholungen,kraftorientiert%20im%20unteren%20Wiederholungsbereich%20trainieren.
  /**
   * Calculates the one-rep max (1RM) for the lander exercise based on the given weight and number of repetitions.
   * @param weight The weight used for the exercise.
   * @param repetitions The number of repetitions performed.
   * @returns The calculated 1RM for the lander exercise.
   * @throws An error if the number of repetitions is less than or equal to 0.
   */
  private calculate1RMLander(weight: number, repetitions: number): number {
    if (repetitions <= 0) {
      throw new Error("The number of repetitions must be greater than 0.");
    }

    const oneRM = (100 * weight) / (101.3 - 2.67123 * repetitions);
    return oneRM;
  }

  /**
   * Calculates the one-rep max (1RM) using the Conner formula.
   * @param weight - The weight lifted.
   * @param repetitions - The number of repetitions performed.
   * @returns The calculated 1RM.
   * @throws An error if the number of repetitions is less than or equal to 0.
   */
  private calculate1RMOConner(weight: number, repetitions: number): number {
    if (repetitions <= 0) {
      throw new Error("The number of repetitions must be greater than 0.");
    }

    const oneRM = weight * (1 + 0.025 * repetitions);
    return oneRM;
  }

  /**
   * Calculates the one-rep max (1RM) using the Lombardi formula.
   * @param weight The weight lifted.
   * @param repetitions The number of repetitions performed.
   * @returns The calculated 1RM.
   * @throws An error if the number of repetitions is less than or equal to 0.
   */
  private calculate1RMLombardi(weight: number, repetitions: number): number {
    if (repetitions <= 0) {
      throw new Error("The number of repetitions must be greater than 0.");
    }

    const oneRM = weight * Math.pow(repetitions, 0.1);
    return oneRM;
  }

  /**
   * Calculates the one-rep max (1RM) using the Mayhew formula.
   * @param weight The weight lifted in kilograms.
   * @param repetitions The number of repetitions performed.
   * @returns The calculated 1RM.
   * @throws An error if the number of repetitions is less than or equal to 0.
   */
  private calculate1RMMayhew(weight: number, repetitions: number): number {
    if (repetitions <= 0) {
      throw new Error("The number of repetitions must be greater than 0.");
    }

    const oneRM =
      (100 * weight) / (52.2 + 41.9 * Math.exp(-0.055 * repetitions));
    return oneRM;
  }

  /**
   * Calculates the normalized relative muscularity (NRM) using the Boyd Eppley formula.
   * @param weight - The weight lifted.
   * @param repetitions - The number of repetitions performed.
   * @returns The NRM calculated using the Boyd Eppley formula.
   */
  private calculateNRMBoydEppley(weight: number, repetitions: number): number {
    // const w =
    //   this.calculate1RMBoydEppley(weight, repetitions) / (1 + this.m_Reps / 30);
    const w =
      (this.calculate1RMBoydEppley(weight, repetitions) * 30) /
      (30 + this.m_Reps);
    return w;
  }

  /**
   * Calculates the NRM (normalized repetition maximum) using the Brzycki formula.
   * @param weight - The weight lifted for the given number of repetitions.
   * @param repetitions - The number of repetitions performed.
   * @returns The calculated NRM.
   */
  private calculateNRMBrzycki(weight: number, repetitions: number): number {
    // const w =
    //   this.calculate1RMBrzycki(weight, repetitions) / ((37 - this.m_Reps) / 36);
    const w =
      (this.calculate1RMBrzycki(weight, repetitions) * (37 - this.m_Reps)) / 36;
    return w;
  }

  /**
   * Calculates the normalized weight for a given weight and number of repetitions.
   * @param weight The weight used for the exercise.
   * @param repetitions The number of repetitions performed.
   * @returns The normalized weight.
   */
  private calculateNRMLander(weight: number, repetitions: number): number {
    // const w =
    //   this.calculate1RMLander(weight, repetitions) /
    //   ((101.3 - 2.67123 * this.m_Reps) / 100);
    const w =
      (this.calculate1RMLander(weight, repetitions) *
        (101.3 - 2.67123 * this.m_Reps)) /
      100;
    return w;
  }

  /**
   * Calculates the NRMO Conner value based on the given weight and repetitions.
   * @param weight The weight used for the exercise.
   * @param repetitions The number of repetitions performed.
   * @returns The calculated NRMO Conner value.
   */
  private calculateNRMOConner(weight: number, repetitions: number): number {
    // const w =
    //   this.calculate1RMOConner(weight, repetitions) /
    //   (1 + 0.25 * this.m_Reps);
    const w =
      this.calculate1RMOConner(weight, repetitions) * (1 + 0.025 * this.m_Reps);
    return w;
  }

  /**
   * Calculates the normalized Lombardi value based on the given weight and repetitions.
   * @param weight The weight used for the exercise.
   * @param repetitions The number of repetitions performed for the exercise.
   * @returns The calculated normalized Lombardi value.
   */
  private calculateNRMLombardi(weight: number, repetitions: number): number {
    // const w =
    //   this.calculate1RMLombardi(weight, repetitions) /
    //   Math.pow(this.m_Reps, 0.1);
    const w =
      this.calculate1RMLombardi(weight, repetitions) *
      Math.pow(this.m_Reps, 0.1);
    return w;
  }

  /**
   * Calculates the estimated 1 repetition maximum (1RM) using the Mayhew formula.
   * @param weight - The weight lifted in kilograms.
   * @param repetitions - The number of repetitions performed.
   * @returns The estimated 1RM in kilograms.
   */
  private calculateNRMMayhew(weight: number, repetitions: number): number {
    // const w =
    //   this.calculate1RMMayhew(weight, repetitions) /
    //   (52.2 + 41.9 * Math.exp(-0.055 * this.m_Reps));
    const w =
      (this.calculate1RMMayhew(weight, repetitions) *
        (52.2 + 41.9 * Math.exp(-0.055 * this.m_Reps))) /
      100;
    return w;
  }
}
