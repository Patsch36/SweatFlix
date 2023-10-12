import { useDatabaseStore } from "@/stores/databaseStore";

export default class AchievementManager {
  private db;
  private weight: number = 0;
  private achievements: string[] = [];
  private newAchievements: string[] = [];

  constructor() {
    this.db = useDatabaseStore().getDatabase();
    this.db
      ?.query("SELECT weight FROM weight ORDER BY timestamp LIMIT 1")
      .then((res) => {
        this.weight = res.values ? res.values[0].weight : 0;
      });
  }

  public checkWorkoutAchievements(date: string) {
    this.achievements = [];
    this.newAchievements = [];
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

        const query = `SELECT COUNT(*) as count, MAX(Weight) as max_weight, unit FROM workoutExercise WHERE exercise = 'Pull-Up'`;
        this.db?.query(query).then((res) => {
          if (res.values === undefined) return;
          if (
            res.values[0].count >= 30 &&
            this.convertkglbs(res.values[0].max_weight, res.values[0].unit) <
              this.convertkglbs(exercise.weight, exercise.unit)
          )
            this.setAchievement("Weight Master");
        });
      }
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
