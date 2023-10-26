import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useDatabaseStore } from "@/stores/databaseStore";
import { SetManager } from "@/datatypes/SetManager";

export const useAbsolvingExercisesStore = defineStore(
  "absolvingExercisesStore",
  () => {
    const exercises = ref();
    const amountOfExercises = ref(0);
    const lastResults = ref();
    const exerciseResults = ref([] as any);
    const databaseStore = useDatabaseStore();
    const overallWeight = ref();
    const enddate = ref("");
    const startdate = ref("");
    const ORMs = ref<any[]>([]);
    const NRMs = ref<any[]>([]);
    const setManager = ref();
    const reps = ref(0);

    let __workout = "";
    let __date = "";

    const amountOfSets = computed(() => {
      let amount = 0;
      if (!exercises.value) return amount;
      for (let i = 0; i < exercises.value.length; i++) {
        amount += exercises.value[i].sets;
      }
      return amount;
    });

    const amountOfFinishedSets = computed(() => {
      let amount = 0;
      if (!exerciseResults.value) return amount;
      for (let i = 0; i < exerciseResults.value.length; i++) {
        for (let j = 0; j < exerciseResults.value[i].length; j++) {
          if (
            exerciseResults.value[i][j].reps &&
            exerciseResults.value[i][j].weight
          ) {
            amount++;
          }
        }
      }
      return amount;
    });

    const clear = () => {
      amountOfExercises.value = 0;
      lastResults.value = [];
      exerciseResults.value = [];
    };

    const loadWorkoutExcercises = async (workout: string) => {
      if (
        __workout !== workout ||
        __date !== new Date().toISOString().slice(0, 10)
      ) {
        clear();
        __workout = workout;
        __date = new Date().toISOString().slice(0, 10);
      }

      console.log("LOAD WORKOUT EXERCISES");
      console.log("ExerciseResults", exerciseResults.value);
      const query = `SELECT exerciseName, sets, reps, OrderIndex FROM WorkoutList WHERE workoutPlan = '${workout}'`;

      const resp = await databaseStore.getDatabase()?.query(query);
      exercises.value = resp?.values ? resp.values : [];
      await exercises.value.sort(
        (a: any, b: any) => a.OrderIndex - b.OrderIndex
      );

      console.log("Exercises", exercises.value);

      amountOfExercises.value = exercises.value.length;

      // check for entry in workout table where date(workout) = date('now')
      //   const query1 = `SELECT * FROM Workout WHERE workoutname = '${workout}' AND date(startdate) = date('now')`;
      //   const resp1 = await databaseStore.getDatabase()?.query(query1);
      //   if (resp1?.values.length === 0) {
      //     clear();
      //   }

      // load exercises.value from last Workout
      const query2 = `SELECT exercise, setnumber, reps, weight FROM WorkoutExercise WHERE workout = (SELECT MAX(startdate) FROM Workout WHERE workoutname = '${workout}')`;
      const resp2 = await databaseStore.getDatabase()?.query(query2);
      lastResults.value = resp2?.values ? resp2.values : [];

      console.log("Last Results", lastResults.value);

      if (Object.values(exerciseResults.value).length) return;

      for (
        let exerciseIndex = 0;
        exerciseIndex < exercises.value.length;
        exerciseIndex++
      ) {
        let templist = [];
        console.log("ELEMENT", exercises.value[exerciseIndex]);
        for (let i = 0; i < exercises.value[exerciseIndex].sets; i++) {
          const element = lastResults.value.find(
            (element: any) =>
              element.exercise ===
                exercises.value[exerciseIndex].exerciseName &&
              element.setNumber === i + 1
          )
            ? lastResults.value.find(
                (element: any) =>
                  element.exercise ===
                    exercises.value[exerciseIndex].exerciseName &&
                  element.setNumber === i + 1
              )
            : { reps: 0, weight: 0 };
          console.log(element);
          templist.push({
            reps: null,
            weight: null,
            repsPlaceholder: `Reps: ${element.reps}`,
            weightPlaceholder: `Weight: ${element.weight}`,
          });
        }
        exerciseResults.value.push(templist);
      }
      console.log("Results", exerciseResults.value);

      setManager.value = new SetManager();
      reps.value = setManager.value.getReps();
      set1RMs();
      setNRMs();
    };

    const setORMSAndNRMs = async () => {
      if (exercises.value === undefined) return;
      ORMs.value = [];
      NRMs.value = [];
      set1RMs();
      setNRMs();
    };

    const set1RMs = () => {
      for (let i = 0; i < exercises.value.length; i++) {
        setManager.value
          .get1RM(
            exercises.value[i].exerciseName,
            new Date().toISOString().slice(0, 19),
            14
          )
          .then((res: any) => {
            console.log(
              "Calculated ORM for",
              exercises.value[i].exerciseName,
              " is ",
              res
            );
            ORMs.value.push(res);
          });
      }
    };

    const setNRMs = () => {
      for (let i = 0; i < exercises.value.length; i++) {
        console.log(exercises.value.exerciseName);
        setManager.value
          .getNRM(
            exercises.value[i].exerciseName,
            new Date().toISOString().slice(0, 19),
            14
          )
          .then((res: any) => {
            console.log(res);
            NRMs.value.push(res);
          });
      }
    };

    const save = async (workout: string, startdate: string) => {
      overallWeight.value = 0;
      enddate.value = new Date().toISOString().slice(0, 19);
      const insertNewWorkoutQuery = `INSERT INTO Workout (workoutname, startdate, enddate) VALUES ('${workout}', '${startdate}', '${enddate.value}')`;
      await databaseStore.getDatabase()?.run(insertNewWorkoutQuery);

      for (let exercise = 0; exercise < exercises.value.length; exercise++) {
        console.log(exerciseResults.value[exercise]);
        for (let i = 0; i < exerciseResults.value[exercise].length; i++) {
          if (exerciseResults.value[exercise][i].reps === null) {
            exerciseResults.value[exercise][i].reps = 0;
          }

          if (exerciseResults.value[exercise][i].weight === null) {
            exerciseResults.value[exercise][i].weight = 0;
          }

          const query = `INSERT INTO WorkoutExercise (workout, exercise, setnumber, reps, weight, unit) VALUES ('${startdate}', '${
            exercises.value[exercise].exerciseName
          }', ${i + 1}, ${exerciseResults.value[exercise][i].reps}, ${
            exerciseResults.value[exercise][i].weight
          }, 'kg')`;
          await databaseStore.getDatabase()?.run(query);
          overallWeight.value +=
            exerciseResults.value[exercise][i].weight *
            exerciseResults.value[exercise][i].reps;
          console.log("OVERALL WEIGHT", overallWeight.value);
        }
      }
      clear();
    };

    return {
      exercises,
      amountOfExercises,
      exerciseResults,
      amountOfSets,
      amountOfFinishedSets,
      startdate,
      enddate,
      ORMs,
      NRMs,
      reps,
      overallWeight,
      loadWorkoutExcercises,
      clear,
      save,
      setORMSAndNRMs,
    };
  }
);
