export interface Exercise {
  name: string;
  description: string;
  SubMuscle: string;
  Muscle: string;
  sets: number | undefined;
  reps: string | undefined | number;
}
