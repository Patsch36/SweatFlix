import { useDatabaseStore } from "@/stores/databaseStore";
export class SetManager {
  private m_Reps: number;
  private db;

  constructor() {
    this.m_Reps = 6;

    const database = useDatabaseStore().getDatabase();
    database !== null
      ? (this.db = database)
      : console.error("database is null");
  }

  public setReps(reps: number): void {
    this.m_Reps = reps;
  }

  public getReps(): number {
    return this.m_Reps;
  }

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
            this.calculate1RMLander(weight, reps)) /
            3) *
            10
        ) / 10
      );
    } else if (formula === "eppley") {
      return Math.round(this.calculate1RMBoydEppley(weight, reps) * 10) / 10;
    } else if (formula === "brzycki") {
      return Math.round(this.calculate1RMBrzycki(weight, reps) * 10) / 10;
    } else if (formula === "lander") {
      return Math.round(this.calculate1RMLander(weight, reps) * 10) / 10;
    }
  }

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
            this.calculateNRMLander(weight, reps)) *
            10) /
            3
        ) / 10
      );
    } else if (formula === "eppley") {
      return Math.round(this.calculateNRMBoydEppley(weight, reps) * 10) / 10;
    } else if (formula === "brzycki") {
      return Math.round(this.calculateNRMBrzycki(weight, reps) * 10) / 10;
    } else if (formula === "lander") {
      return Math.round(this.calculateNRMLander(weight, reps) * 10) / 10;
    }
  }

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
            this.calculate1RMLander(weight, reps)) /
          3
        );
      } else if (formula === "eppley") {
        return this.calculate1RMBoydEppley(weight, reps);
      } else if (formula === "brzycki") {
        return this.calculate1RMBrzycki(weight, reps);
      } else if (formula === "lander") {
        return this.calculate1RMLander(weight, reps);
      }
    });

    // calculate average of all 1RM's
    const averageOneRM =
      oneRM.reduce((a: number, b: number) => a + b, 0) / oneRM.length;
    return averageOneRM;
  }

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
            this.calculateNRMLander(weight, reps)) /
          3
        );
      } else if (formula === "eppley") {
        return this.calculateNRMBoydEppley(weight, reps);
      } else if (formula === "brzycki") {
        return this.calculateNRMBrzycki(weight, reps);
      } else if (formula === "lander") {
        return this.calculateNRMLander(weight, reps);
      }
    });

    // calculate average of all NRM's
    const averageNRM =
      NRM.reduce((a: number, b: number) => a + b, 0) / NRM.length;
    return averageNRM;
  }

  // Formula after https://www.marathonfitness.de/maximalkraft-rechner/#:~:text=1RM%20%3D%20Gewicht%20%2B%20Gewicht%20×%20Wiederholungen,kraftorientiert%20im%20unteren%20Wiederholungsbereich%20trainieren.
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
  private calculate1RMBrzycki(weight: number, repetitions: number): number {
    if (repetitions <= 0) {
      throw new Error("The number of repetitions must be greater than 0.");
    }

    const oneRM = (weight * 36) / (37 - repetitions);
    return oneRM;
  }

  // Formula after https://www.marathonfitness.de/maximalkraft-rechner/#:~:text=1RM%20%3D%20Gewicht%20%2B%20Gewicht%20×%20Wiederholungen,kraftorientiert%20im%20unteren%20Wiederholungsbereich%20trainieren.
  private calculate1RMLander(weight: number, repetitions: number): number {
    if (repetitions <= 0) {
      throw new Error("The number of repetitions must be greater than 0.");
    }

    const oneRM = (100 * weight) / (101.3 - 2.67123 * repetitions);
    return oneRM;
  }

  private calculateNRMBoydEppley(weight: number, repetitions: number): number {
    // const w =
    //   this.calculate1RMBoydEppley(weight, repetitions) / (1 + this.m_Reps / 30);
    const w =
      (this.calculate1RMBoydEppley(weight, repetitions) * 30) /
      (30 + this.m_Reps);
    return w;
  }

  private calculateNRMBrzycki(weight: number, repetitions: number): number {
    // const w =
    //   this.calculate1RMBrzycki(weight, repetitions) / ((37 - this.m_Reps) / 36);
    const w =
      (this.calculate1RMBrzycki(weight, repetitions) * (37 - this.m_Reps)) / 36;
    return w;
  }

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
}
