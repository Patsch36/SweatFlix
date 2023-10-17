export interface WorkoutMuscleGroup {
  musclegroup: number;
  muscletrainfactor: number;
}

export interface WorkoutExercise {
  exercisename: string;
  reps: string;
  sets: number;
  muscleGroup: number;
}

export interface WorkoutDays {
  Mondays: boolean;
  Tuesdays: boolean;
  Wednesdays: boolean;
  Thursdays: boolean;
  Fridays: boolean;
  Saturdays: boolean;
  Sundays: boolean;
}

export interface Workout {
  workoutName: string;
  exercises: WorkoutExercise[];
}
