export interface MuscleGroup {
  name: string;
  subGroup?: MuscleGroup[];
  id?: number;
}

export interface Muscle {
  name: string;
  id: number;
  group: string;
}

export const muscleGroups: MuscleGroup[] = [
  {
    name: "Chest",
    subGroup: [
      {
        name: "Upper Chest",
        id: 1,
      },
      {
        name: "Middle Chest",
        id: 2,
      },
      {
        name: "Lower Chest",
        id: 3,
      },
    ],
  },
  {
    name: "Back",
    subGroup: [
      {
        name: "Upper Lat",
        id: 4,
      },
      {
        name: "Lower Lat",
        id: 5,
      },
      {
        name: "Trapezius",
        id: 6,
      },
      {
        name: "Neck",
        id: 7,
      },
    ],
  },
  {
    name: "Biceps",
    subGroup: [
      {
        name: "Long Head",
        id: 8,
      },
      {
        name: "Short Head",
        id: 9,
      },
      {
        name: "Brachialis",
        id: 10,
      },
    ],
    id: 2,
  },
  {
    name: "Triceps",
    subGroup: [
      {
        name: "Long Head",
        id: 11,
      },
      {
        name: "Middle Head",
        id: 12,
      },
      {
        name: "Outer Head",
        id: 13,
      },
    ],
  },
  {
    name: "Legs",
    subGroup: [
      {
        name: "Extensors",
        id: 14,
      },
      {
        name: "Flexors",
        id: 15,
      },
      {
        name: "Adductors",
        id: 16,
      },
      {
        name: "Calves",
        id: 17,
      },
    ],
  },
  {
    name: "Shoulder",
    subGroup: [
      {
        name: "Front Shoulder",
        id: 18,
      },
      {
        name: "Back Shoulder",
        id: 19,
      },
      {
        name: "Side Shoulder",
        id: 20,
      },
    ],
  },
  {
    name: "Abdomen",
    subGroup: [
      {
        name: "Upper Abdomen",
        id: 21,
      },
      {
        name: "Lower Abdomen",
        id: 22,
      },
      {
        name: "Side Abdomen",
        id: 23,
      },
    ],
  },
];

export const splits: string[] = [
  "Biceps",
  "Triceps",
  "Shoulders",
  "Abs",
  "Chest",
  "Back",
  "Arms",
  "Abs - Arms",
  "Abs - Shoulders",
  "Abs - Biceps",
  "Abs - Triceps",
  "Abs - Arms - Shoulders",
  "Legs",
  "Push",
  "Pull",
  "Chest - Shoulders",
  "Back - Biceps",
  "Back - Triceps",
  "Legs - Abs",
  "Legs - Shoulders",
  "Chest - Triceps",
  "Chest - Biceps",
  "Back - Shoulders",
  "Back - Shoulders - Triceps",
  "Shoulder - Arms",
  "Chest - Back",
  "Back - Arms",
  "Chest - Shoulders - Triceps",
  "Chest - Shoulders - Arms",
  "Chest - Back - Arms",
  "UpperBody",
  "LowerBody",
  "Fullbody - Push",
  "FullBody - Pull",
  "FullBody",
  //   "Cardio",
  //   "Rest",
];

export const musclesWithSubgroup: Muscle[] = [
  { name: "Upper Chest", group: "Chest", id: 1 },
  { name: "Middle Chest", group: "Chest", id: 2 },
  { name: "Lower Chest", group: "Chest", id: 3 },
  { name: "Upper Back", group: "Back", id: 4 },
  { name: "Lower Back", group: "Back", id: 5 },
  { name: "Trapezius", group: "Back", id: 6 },
  { name: "Neck", group: "Back", id: 7 },
  { name: "Long Head", group: "Biceps", id: 8 },
  { name: "Short Head", group: "Biceps", id: 9 },
  { name: "Brachialis", group: "Biceps", id: 10 },
  { name: "Long Head", group: "Triceps", id: 11 },
  { name: "Middle Head", group: "Triceps", id: 12 },
  { name: "Outer Head", group: "Triceps", id: 13 },
  { name: "Extensors", group: "Legs", id: 14 },
  { name: "Flexors", group: "Legs", id: 15 },
  { name: "Adductors", group: "Legs", id: 16 },
  { name: "Calves", group: "Legs", id: 17 },
  { name: "Front Shoulder", group: "Shoulder", id: 18 },
  { name: "Back Shoulder", group: "Shoulder", id: 19 },
  { name: "Side Shoulder", group: "Shoulder", id: 20 },
  { name: "Upper Abdomen", group: "Abdomen", id: 21 },
  { name: "Lower Abdomen", group: "Abdomen", id: 22 },
  { name: "Side Abdomen", group: "Abdomen", id: 23 },
];

export const getPossibleSplits = (muscles: number[]) => {
  let possibleSplits = splits;
  if (muscles.length === 0) return splits;

  if (muscles.some((item) => ![8, 9, 10].includes(item)))
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Biceps"
    );

  if (muscles.some((item) => ![11, 12, 13].includes(item)))
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Triceps"
    );

  if (muscles.some((item) => ![18, 19, 20].includes(item)))
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Shoulders"
    );

  // if (muscles.some((item) => ![8, 9, 10, 11, 12, 13].includes(item)))
  if (muscles.some((item) => ![21, 22, 23].includes(item)))
    possibleSplits = possibleSplits.filter((split: string) => split !== "Abs");

  if (muscles.some((item) => ![18, 19, 20, 21, 22, 23].includes(item)))
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Abs - Shoulders"
    );

  if (muscles.some((item) => ![8, 9, 10, 21, 22, 23].includes(item)))
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Abs - Biceps"
    );

  if (muscles.some((item) => ![11, 12, 13, 21, 22, 23].includes(item)))
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Abs - Triceps"
    );

  if (
    muscles.some((item) => ![8, 9, 10, 11, 12, 13, 21, 22, 23].includes(item))
  )
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Abs - Arms"
    );

  if (
    muscles.some((item) => ![4, 5, 6, 7, 8, 9, 10, 11, 12, 13].includes(item))
  )
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Back - Arms"
    );

  if (
    muscles.some((item) => ![4, 5, 6, 7, 11, 12, 13, 18, 19, 20].includes(item))
  )
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Back - Shoulders - Triceps"
    );

  if (muscles.some((item) => ![14, 15, 16, 17, 18, 19, 20].includes(item)))
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Legs - Shoulders"
    );

  if (
    muscles.some(
      (item) => ![8, 9, 10, 11, 12, 13, 18, 19, 20, 21, 22, 23].includes(item)
    )
  )
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Abs - Arms - Shoulders"
    );

  if (muscles.some((muscle: number) => muscle > 3))
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Chest"
    );

  if (muscles.some((item) => ![8, 9, 10, 11, 12, 13].includes(item)))
    possibleSplits = possibleSplits.filter((split: string) => split !== "Arms");

  if (muscles.some((item) => ![4, 5, 6, 7].includes(item)))
    possibleSplits = possibleSplits.filter((split: string) => split !== "Back");

  if (muscles.some((item) => ![14, 15, 16, 17].includes(item)))
    possibleSplits = possibleSplits.filter((split: string) => split !== "Legs");

  if (muscles.some((item) => ![1, 2, 3, 11, 12, 13].includes(item)))
    possibleSplits = possibleSplits.filter((split: string) => split !== "Push");

  if (muscles.some((item) => ![4, 5, 6, 7, 8, 9, 10].includes(item)))
    possibleSplits = possibleSplits.filter((split: string) => split !== "Pull");

  if (muscles.some((item) => ![1, 2, 3, 4, 5, 6].includes(item)))
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Chest - Back"
    );

  if (muscles.some((item) => ![1, 2, 3, 8, 9, 10].includes(item)))
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Chest - Biceps"
    );

  if (muscles.some((item) => ![1, 2, 3, 18, 19, 20].includes(item)))
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Chest - Shoulders"
    );

  if (muscles.some((item) => ![4, 5, 6, 7, 8, 9, 10].includes(item)))
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Back - Biceps"
    );

  if (muscles.some((item) => ![4, 5, 6, 7, 11, 12, 13].includes(item)))
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Back - Triceps"
    );

  if (muscles.some((item) => ![14, 15, 16, 17, 21, 22, 23].includes(item)))
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Legs - Abs"
    );

  if (muscles.some((item) => ![1, 2, 3, 11, 12, 13].includes(item)))
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Chest - Triceps"
    );

  if (muscles.some((item) => ![4, 5, 6, 7, 18, 19, 20].includes(item)))
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Back - Shoulders"
    );

  if (
    muscles.some((item) => ![8, 9, 10, 11, 12, 13, 18, 19, 20].includes(item))
  )
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Shoulder - Arms"
    );

  if (muscles.some((item) => ![1, 2, 3, 11, 12, 13, 18, 19, 20].includes(item)))
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Chest - Shoulders - Triceps"
    );

  if (muscles.some((item) => ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(item)))
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Chest - Back - Arms"
    );

  if (
    muscles.some(
      (item) => ![1, 2, 3, 8, 9, 10, 11, 12, 13, 18, 19, 20].includes(item)
    )
  )
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Chest - Shoulders - Arms"
    );

  // Remove UpperBody if any exercise is leg exercise
  if (muscles.some((item) => [14, 15, 16, 17].includes(item)))
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "UpperBody"
    );

  if (muscles.some((item) => ![14, 15, 16, 17].includes(item)))
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "LowerBody"
    );

  // Remove Fullbody-Push if any exercise is not a push exercise
  if (muscles.some((item) => ![1, 2, 3, 11, 12, 13, 14, 16, 19].includes(item)))
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "Fullbody - Push"
    );

  if (muscles.some((item) => [1, 2, 3, 11, 12, 13, 14, 16, 19].includes(item)))
    possibleSplits = possibleSplits.filter(
      (split: string) => split !== "FullBody - Pull"
    );

  return possibleSplits;
};

export const getPossibleSplitsShorterFunction = (muscles: number[]) => {
  if (muscles.length === 0) return splits;

  const filters = {
    Biceps: [8, 9, 10],
    Triceps: [11, 12, 13],
    Shoulders: [18, 19, 20],
    Abs: [21, 22, 23],
    Chest: (muscles: number[]) => muscles.some((muscle) => muscle > 3),
    Back: [4, 5, 6, 7],
    Arms: [8, 9, 10, 11, 12, 13],
    Legs: [14, 15, 16, 17],
    Push: [1, 2, 3, 11, 12, 13],
    Pull: [4, 5, 6, 7, 8, 9, 10],
    UpperBody: (muscles: number[]) =>
      muscles.every((muscle) => [14, 15, 16, 17].includes(muscle)),
    LowerBody: (muscles: number[]) =>
      muscles.some((muscle) => ![14, 15, 16, 17].includes(muscle)),
    "Fullbody - Push": (muscles: number[]) =>
      muscles.every((muscle) =>
        [1, 2, 3, 11, 12, 13, 14, 16, 19].includes(muscle)
      ),
    "FullBody - Pull": (muscles: number[]) =>
      muscles.some(
        (muscle) => ![1, 2, 3, 11, 12, 13, 14, 16, 19].includes(muscle)
      ),
  };

  let possibleSplits = splits;

  for (const [splitName, filter] of Object.entries(filters)) {
    if (typeof filter === "function") {
      if (filter(muscles)) {
        possibleSplits = possibleSplits.filter((split) => split !== splitName);
      }
    } else {
      if (muscles.some((muscle) => !filter.includes(muscle))) {
        possibleSplits = possibleSplits.filter((split) => split !== splitName);
      }
    }
  }

  return possibleSplits;
};

export const getAllMusclesFromSplit = (split: string) => {
  const filters = {
    Biceps: [8, 9, 10],
    Triceps: [11, 12, 13],
    Shoulders: [18, 19, 20],
    Abs: [21, 22, 23],
    Arm: [8, 9, 10, 11, 12, 13],
    "Abs - Shoulders": [18, 19, 20, 21, 22, 23],
    "Abs - Biceps": [8, 9, 10, 21, 22, 23],
    "Abs - Triceps": [11, 12, 13, 21, 22, 23],
    "Abs - Arms": [8, 9, 10, 11, 12, 13, 21, 22, 23],
    "Abs - Arms - Shoulders": [8, 9, 10, 11, 12, 13, 18, 19, 20, 21, 22, 23],
    "Chest - Shoulders": [1, 2, 3, 18, 19, 20],
    "Back - Biceps": [4, 5, 6, 7, 8, 9, 10],
    "Back - Triceps": [4, 5, 6, 7, 11, 12, 13],
    "Back - Shoulders - Triceps": [4, 5, 6, 7, 11, 12, 13, 18, 19, 20],
    "Legs - Abs": [14, 15, 16, 17, 21, 22, 23],
    "Legs - Shoulders": [14, 15, 16, 17, 18, 19, 20],
    "Chest - Triceps": [1, 2, 3, 11, 12, 13],
    "Chest - Biceps": [1, 2, 3, 8, 9, 10],
    "Back - Shoulders": [4, 5, 6, 7, 18, 19, 20],
    "Back - Arms": [4, 5, 6, 7, 8, 9, 10],
    "Shoulder - Arms": [8, 9, 10, 11, 12, 13, 18, 19, 20],
    "Chest - Shoulders - Triceps": [1, 2, 3, 11, 12, 13, 18, 19, 20],
    "Chest - Shoulders - Arms": [1, 2, 3, 8, 9, 10, 11, 12, 13, 18, 19, 20],
    "Chest - Back": [1, 2, 3, 4, 5, 6, 7],
    "Chest - Back - Arms": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    Chest: [1, 2, 3],
    Back: [4, 5, 6, 7],
    Arms: [8, 9, 10, 11, 12, 13],
    Legs: [14, 15, 16, 17],
    Push: [1, 2, 3, 11, 12, 13],
    Pull: [4, 5, 6, 7, 8, 9, 10],
    UpperBody: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 18, 19, 20, 21, 22, 23,
    ],
    LowerBody: [14, 15, 16, 17],
    "Fullbody - Push": [1, 2, 3, 11, 12, 13, 14, 16, 19],
    "FullBody - Pull": [4, 5, 6, 7, 8, 9, 10, 14, 15, 16, 17],
  };
  // find filter list that matches split
  const filtersKeys = Object.keys(filters);
  const filtersValues = Object.values(filters);
  const index = filtersKeys.indexOf(split);
  if (index === -1) return [];
  const filter = filtersValues[index];
  return filter;
};
