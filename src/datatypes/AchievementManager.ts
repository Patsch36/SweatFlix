import { useDatabaseStore } from "@/stores/databaseStore";
import { getAllMusclesFromSplit } from "./splitCalculator";
import { store } from "@/stores/IonicStorage";
import { get } from "cypress/types/lodash";

export default class AchievementManager {
  private db;
  private weight: number = 0;
  private achievements: string[] = [];
  private newAchievements: string[] = [];
  private bicepscurls = 0;

  constructor() {
    this.db = useDatabaseStore().getDatabase();
    this.db
      ?.query("SELECT weight FROM weight ORDER BY timestamp LIMIT 1")
      .then((res) => {
        this.weight = res.values ? res.values[0].weight : 0;
      });
    store.get("bicepscurls").then((res) => {
      this.bicepscurls = res ? res : 0;
    });
  }

  public checkWorkoutAchievements(date: string) {
    this.achievements = [];
    this.newAchievements = [];

    let absExercise = 0;

    let fullstackexercises: { [key: string]: boolean } = {
      "bench press": false,
      deadlifts: false,
      squats: false,
    };

    let LEGendaryExercises: { [key: string]: boolean } = {
      "hip thrusts": false,
      "leg press": false,
      squats: false,
    };

    const query = `SELECT * FROM workoutExercise INNER JOIN Exercise ON WorkoutExercise.exercise = Exercise.name WHERE date(workout) = date('${date}');`;
    this.db?.query(query).then((res) => {
      console.log(res);

      if (res.values === undefined) return;
      console.log("Checking achievements");

      // check if theres an exercise over 50kg in weight
      for (const exercise of res.values) {
        if (this.convertkglbs(exercise.weight, exercise.unit) >= 50) {
          this.setAchievement("Iron Beginner");
          if (exercise.reps >= 20) this.setAchievement("Repetition Hero");
          if (
            exercise.reps >= 10 &&
            !getAllMusclesFromSplit("Legs").includes(exercise.muscleGroup)
          )
            this.setAchievement("Steel Muscles");
        }
        if (this.convertkglbs(exercise.weight, exercise.unit) >= 100)
          this.setAchievement("Strength Master");
        if (this.convertkglbs(exercise.weight, exercise.unit) >= 150)
          this.setAchievement("Iron Pro");
        if (this.convertkglbs(exercise.weight, exercise.unit) >= 200)
          this.setAchievement("Heavy Weights");
        if (this.convertkglbs(exercise.weight, exercise.unit) >= 250)
          this.setAchievement("Strength Beast");
        if (this.convertkglbs(exercise.weight, exercise.unit) >= 300)
          this.setAchievement("Iron Legend");
        if (
          this.convertkglbs(exercise.weight, exercise.unit) >=
          this.weight * 1.5
        )
          this.setAchievement("Iron Athlete");

        if (Number.isInteger(exercise.weight))
          this.setAchievement("Code Compiler");

        if (getAllMusclesFromSplit("Abs").includes(exercise.muscleGroup)) {
          absExercise += 1;
          if (absExercise === 10) this.setAchievement("Algorithmic Abs");
        }

        if (
          exercise.name.toLowerCase().includes("deadlift") &&
          exercise.weight >= 150
        )
          this.setAchievement("Database Deadlifter");

        if (
          this.convertkglbs(exercise.weight, exercise.unit) * exercise.reps >=
            1920 &&
          exercise.name === "Bench Press"
        )
          this.setAchievement("Pixel Pusher");

        if (
          exercise.name.toLowerCase().includes("squat") &&
          exercise.reps >= 100
        )
          this.setAchievement("Bug Buster");

        if (
          Object.keys(fullstackexercises).includes(exercise.name.toLowerCase())
        ) {
          fullstackexercises[exercise.name] = true;
        }

        if (
          Object.keys(LEGendaryExercises).includes(exercise.name.toLowerCase())
        ) {
          LEGendaryExercises[exercise.name] = true;
        }

        if (
          this.convertkglbs(exercise.weight, exercise.unit) >= 50 &&
          getAllMusclesFromSplit("Biceps").includes(exercise.muscleGroup)
        )
          this.setAchievement("RAM");

        if (getAllMusclesFromSplit("Biceps").includes(exercise.muscleGroup)) {
          this.bicepscurls += exercise.reps;
          store.set("bicepscurls", this.bicepscurls);
          if (this.bicepscurls >= 5000) this.setAchievement("Biceps Hero");
          if (this.bicepscurls >= 2500) this.setAchievement("Biceps Master");
          if (this.bicepscurls >= 1000) this.setAchievement("Biceps Boss");
        }

        // Extra Queries

        if (exercise.name === "Benched Press") {
          const query = `SELECT * FROM Workout Exercise WHERE exercise = 'Benched Press' ORDER BY weight DESC LIMIT 1`;
          this.db?.query(query).then((res) => {
            if (res.values === undefined) return;
            if (
              res.values[0].reps + 8 <= exercise.reps &&
              res.values[0].weight <= exercise.weight
            )
              this.setAchievement("Bit Crusher");
          });
        }

        const query = `SELECT COUNT(*) as count, MAX(Weight) as max_weight, unit FROM workoutExercise WHERE exercise = 'Pull-Up'`;
        this.db?.query(query).then((res) => {
          if (res.values === undefined) return;
          if (
            res.values[0].count >= 30 &&
            this.convertkglbs(res.values[0].max_weight, res.values[0].unit) <
              this.convertkglbs(exercise.weight, exercise.unit)
          )
            this.setAchievement("Weight Record");
        });

        const queryExerciseBefore = `SELECT * FROM workoutExercise WHERE workout = (SELECT workout FROM workoutExercise WHERE exercise = '${exercise.name}' ORDER BY workout DESC LIMIT 1) AND exercise = '${exercise.name}'`;
        this.db?.query(queryExerciseBefore).then((res) => {
          if (res.values === undefined) return;
          if (res.values[0].weight + 20 <= exercise.weight)
            this.setAchievement("Javascript Jumper");
        });
      }

      const allFullStackExercisesCompleted = Object.values(
        fullstackexercises
      ).every((value) => value === true);
      if (allFullStackExercisesCompleted)
        this.setAchievement("Full Stack Flexer");

      const allLEGendaryExercisesCompleted = Object.values(
        LEGendaryExercises
      ).every((value) => value === true);
      if (allLEGendaryExercisesCompleted) this.setAchievement("LEG-endary");
    });
    console.log(this.achievements);
  }

  private convertkglbs(weight: number, unit: string): number {
    if (unit === "kg") {
      return weight;
    } else {
      return weight / 2.20462;
    }
  }

  private setAchievement(achievement: string) {
    if (!this.achievements.includes(achievement)) {
      this.achievements.push(achievement);
    }
    this.db
      ?.query(`SELECT achieved from achievements WHERE name = "${achievement}"`)
      .then((res) => {
        if (res.values && res.values[0].achieved === 0) {
          this.db?.run(
            `UPDATE achievements set obtained = datetime('now', 'localtime'), achieved = achieved + 1 WHERE name = '${achievement}'`
          );
          if (!this.newAchievements.includes(achievement)) {
            this.newAchievements.push(achievement);
          }
        } else
          this.db?.run(
            `UPDATE achievements set achieved = achieved + 1 WHERE name = '${achievement}'`
          );
      });
  }
}
